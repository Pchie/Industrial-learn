-- 53E-F02/F09: stable bookmarks for existing governed repository lessons.
-- Existing relational bookmarks are retained verbatim. No content is inserted,
-- approved, published, reassociated or deleted by this migration.
alter table public.saved_lessons alter column lesson_id drop not null;
alter table public.saved_lessons add column governance_item_id uuid
  references public.content_governance_items(id) on delete restrict;
alter table public.saved_lessons add constraint saved_lesson_one_target
  check (num_nonnulls(lesson_id, governance_item_id) = 1);
create unique index saved_lessons_student_governance_unique
  on public.saved_lessons(student_profile_id, governance_item_id) where governance_item_id is not null;

-- Repository-only lessons may have no relational row. Where one exists, its
-- version, publication and parent-module gate must agree with governance.
-- Both private bookmarks and public reopening share this predicate.
create function industrial_learn_private.is_published_governed_lesson(p_governance_item_id uuid)
returns boolean language sql stable security definer set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.content_governance_items item
    join public.content_versions version on version.governance_item_id=item.id and version.version=item.current_version
    where item.id=p_governance_item_id and item.entity_table='lessons'
      and nullif(version.snapshot->>'id','') is not null
      and nullif(version.snapshot->>'version','') is not null
      and public.has_current_engineering_publication('lessons',item.entity_id,item.current_version,item.slug)
      and (
        not exists(select 1 from public.lessons l where l.id=item.entity_id)
        or exists (
          select 1 from public.lessons l join public.units u on u.id=l.unit_id
          join public.modules m on m.id=u.module_id
          where l.id=item.entity_id and l.version=item.current_version and l.slug=item.slug
            and l.publication_status='published' and l.technical_review_status='Approved for student use'
            and m.publication_status='published' and m.technical_review_status='Approved for student use'
        )
      )
  );
$$;
revoke all on function industrial_learn_private.is_published_governed_lesson(uuid) from public,anon,authenticated,service_role;

create function public.is_published_bookmark_target(p_lesson_id uuid, p_governance_item_id uuid)
returns boolean language sql stable security definer set search_path = public, pg_temp
as $$
  select public.is_active_profile() and (
    (p_governance_item_id is not null and p_lesson_id is null
      and industrial_learn_private.is_published_governed_lesson(p_governance_item_id)
    ) or (p_lesson_id is not null and p_governance_item_id is null and exists (
      select 1 from public.lessons l join public.units u on u.id=l.unit_id
      join public.modules m on m.id=u.module_id
      where l.id=p_lesson_id
        and l.publication_status='published' and l.technical_review_status='Approved for student use'
        and m.publication_status='published' and m.technical_review_status='Approved for student use'
        and public.has_current_engineering_publication('lessons',l.id,l.version,l.slug)
    ))
  );
$$;
revoke all on function public.is_published_bookmark_target(uuid,uuid) from public, anon;
grant execute on function public.is_published_bookmark_target(uuid,uuid) to authenticated;
create policy saved_target_insert on public.saved_lessons as restrictive for insert to authenticated
  with check(public.is_published_bookmark_target(lesson_id,governance_item_id));
create policy saved_target_update on public.saved_lessons as restrictive for update to authenticated
  using(student_profile_id=auth.uid())
  with check(public.is_published_bookmark_target(lesson_id,governance_item_id));

-- An exact identity resolver; it returns identifiers only, never draft content.
create function public.resolve_saved_lesson(
  p_student_profile_id uuid, p_slug text, p_content_id text, p_content_version text
) returns table(governance_item_id uuid, saved boolean)
language plpgsql stable security definer set search_path = public, pg_temp
as $$
begin
  if not public.is_active_profile() or p_student_profile_id is distinct from auth.uid() then
    raise exception 'Active bookmark owner is required.' using errcode='42501';
  end if;
  return query
    select item.id, exists(select 1 from public.saved_lessons s
      where s.student_profile_id=auth.uid() and (s.governance_item_id=item.id or s.lesson_id=item.entity_id))
    from public.content_governance_items item
    join public.content_versions version on version.governance_item_id=item.id and version.version=item.current_version
    where item.entity_table='lessons' and item.slug=p_slug
      and version.snapshot->>'id'=p_content_id and version.snapshot->>'version'=p_content_version
      and public.is_published_bookmark_target(null,item.id);
end;
$$;
revoke all on function public.resolve_saved_lesson(uuid,text,text,text) from public,anon;
grant execute on function public.resolve_saved_lesson(uuid,text,text,text) to authenticated;

create function public.set_saved_lesson(
  p_student_profile_id uuid, p_slug text, p_content_id text, p_content_version text, p_saved boolean
) returns boolean language plpgsql security definer set search_path = public, pg_temp
as $$
declare target_id uuid; already_saved boolean; targets integer;
begin
  if not public.is_active_profile() or p_student_profile_id is distinct from auth.uid() then
    raise exception 'Active bookmark owner is required.' using errcode='42501';
  end if;
  perform industrial_learn_private.require_active_student(auth.uid());
  if p_saved is null or p_slug is null or length(p_slug)>160 then
    raise exception 'Invalid bookmark request.' using errcode='22023';
  end if;
  if not p_saved then
    -- Deletion needs ownership, not permission to deliver withdrawn content.
    delete from public.saved_lessons s where s.student_profile_id=auth.uid() and (
      exists(select 1 from public.content_governance_items i where i.id=s.governance_item_id and i.entity_table='lessons' and i.slug=p_slug)
      or exists(select 1 from public.lessons l where l.id=s.lesson_id and l.slug=p_slug)
    );
    return false;
  end if;
  -- Serialize the owner/slug pair, preserving any older relational bookmark.
  perform pg_advisory_xact_lock(hashtextextended(auth.uid()::text||':bookmark:'||p_slug,0));
  select count(*) into targets from public.resolve_saved_lesson(p_student_profile_id,p_slug,p_content_id,p_content_version);
  if targets<>1 then raise exception 'Lesson is unavailable; canonical publication must be synchronized.' using errcode='P0002'; end if;
  select r.governance_item_id,r.saved into target_id,already_saved
    from public.resolve_saved_lesson(p_student_profile_id,p_slug,p_content_id,p_content_version) r;
  perform 1 from public.content_governance_items where id=target_id for share;
  if not public.is_published_bookmark_target(null,target_id) then
    raise exception 'Lesson is unavailable.' using errcode='42501';
  end if;
  if not already_saved then
    insert into public.saved_lessons(student_profile_id,governance_item_id) values(auth.uid(),target_id)
      on conflict(student_profile_id,governance_item_id) where governance_item_id is not null do nothing;
  end if;
  return true;
end;
$$;
revoke all on function public.set_saved_lesson(uuid,text,text,text,boolean) from public,anon;
grant execute on function public.set_saved_lesson(uuid,text,text,text,boolean) to authenticated;

create function public.list_saved_lessons()
returns table(id uuid,saved_at timestamptz,lesson_slug text)
language plpgsql stable security definer set search_path = public, pg_temp
as $$
begin
  if not public.is_active_profile() then raise exception 'Active account is required.' using errcode='42501'; end if;
  return query select s.id,s.saved_at,
    case when public.is_published_bookmark_target(s.lesson_id,s.governance_item_id)
      then coalesce(i.slug,l.slug) else null end
    from public.saved_lessons s
    left join public.content_governance_items i on i.id=s.governance_item_id
    left join public.lessons l on l.id=s.lesson_id
    where s.student_profile_id=auth.uid();
end;
$$;
revoke all on function public.list_saved_lessons() from public,anon;
grant execute on function public.list_saved_lessons() to authenticated;

-- A withdrawn item's title/slug is withheld, but its owner can still remove it
-- by the bookmark identifier returned from the private list.
create function public.remove_saved_lesson(p_student_profile_id uuid,p_bookmark_id uuid)
returns boolean language plpgsql security definer set search_path = public, pg_temp
as $$
declare affected integer;
begin
  if not public.is_active_profile() or p_student_profile_id is distinct from auth.uid() then
    raise exception 'Active bookmark owner is required.' using errcode='42501';
  end if;
  perform industrial_learn_private.require_active_student(auth.uid());
  delete from public.saved_lessons where id=p_bookmark_id and student_profile_id=auth.uid();
  get diagnostics affected=row_count;
  return affected=1;
end;
$$;
revoke all on function public.remove_saved_lesson(uuid,uuid) from public,anon;
grant execute on function public.remove_saved_lesson(uuid,uuid) to authenticated;

-- Public reopening uses the same exact governance publication evidence; returning
-- only an eligible identifier does not expose drafts, source snapshots or answers.
create function public.resolve_published_lesson(p_slug text,p_content_id text,p_content_version text)
returns table(governance_item_id uuid) language sql stable security definer
set search_path = public, pg_temp
as $$
  select item.id from public.content_governance_items item
  join public.content_versions version on version.governance_item_id=item.id and version.version=item.current_version
  where item.entity_table='lessons' and item.slug=p_slug
    and version.snapshot->>'id'=p_content_id and version.snapshot->>'version'=p_content_version
    and industrial_learn_private.is_published_governed_lesson(item.id);
$$;
revoke all on function public.resolve_published_lesson(text,text,text) from public;
grant execute on function public.resolve_published_lesson(text,text,text) to anon,authenticated,service_role;
