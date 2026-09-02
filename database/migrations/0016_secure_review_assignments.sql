-- Persist exact-version engineering review assignments behind an audited manager RPC.

create type public.review_assignment_status as enum (
  'assigned',
  'in_progress',
  'completed',
  'cancelled'
);

alter table public.content_versions
  add constraint content_versions_governance_item_version_key
  unique (governance_item_id, version);

create table public.review_assignments (
  id uuid primary key default gen_random_uuid(),
  governance_item_id uuid not null references public.content_governance_items(id) on delete restrict,
  content_version integer not null check (content_version > 0),
  reviewer_profile_id uuid not null references public.profiles(id) on delete restrict,
  assigned_by_profile_id uuid not null references public.profiles(id) on delete restrict,
  review_type text not null check (review_type in ('engineering_approval')),
  status public.review_assignment_status not null default 'assigned',
  reason text not null check (char_length(btrim(reason)) >= 10),
  assigned_at timestamptz not null default now(),
  completed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (governance_item_id, content_version)
    references public.content_versions(governance_item_id, version) on delete restrict,
  unique (governance_item_id, content_version, reviewer_profile_id, review_type)
);

create index review_assignments_reviewer_status_idx
  on public.review_assignments (reviewer_profile_id, status);

create index review_assignments_governance_version_idx
  on public.review_assignments (governance_item_id, content_version);

create trigger review_assignments_set_updated_at
  before update on public.review_assignments
  for each row execute function public.set_updated_at();

alter table public.review_assignments enable row level security;

create policy review_assignments_own_or_manager_read on public.review_assignments
  for select using (
    reviewer_profile_id = auth.uid()
    or public.is_platform_manager()
  );

revoke all on table public.review_assignments from anon, authenticated;
grant select on table public.review_assignments to authenticated, service_role;

create or replace function public.manage_review_assignment(
  p_governance_item_id uuid,
  p_content_version integer,
  p_reviewer_profile_id uuid,
  p_review_type text,
  p_operation text,
  p_reason text
)
returns public.review_assignments
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_actor_id uuid := auth.uid();
  v_item public.content_governance_items%rowtype;
  v_assignment public.review_assignments%rowtype;
  v_changed boolean := false;
begin
  if v_actor_id is null or not public.is_platform_manager() then
    raise exception 'Platform management access is required.' using errcode = '42501';
  end if;

  if p_reviewer_profile_id = v_actor_id then
    raise exception 'Users cannot assign an engineering review to themselves.' using errcode = '42501';
  end if;

  if p_operation not in ('assign', 'cancel') then
    raise exception 'Review assignment operation must be assign or cancel.' using errcode = '22023';
  end if;

  if p_review_type <> 'engineering_approval' then
    raise exception 'Unsupported review assignment type.' using errcode = '22023';
  end if;

  if char_length(btrim(coalesce(p_reason, ''))) < 10 then
    raise exception 'A review-assignment reason of at least 10 characters is required.' using errcode = '22023';
  end if;

  select * into v_item
  from public.content_governance_items
  where id = p_governance_item_id
  for update;

  if not found then
    raise exception 'Governance item was not found.' using errcode = 'P0002';
  end if;

  if p_content_version <> v_item.current_version then
    raise exception 'Only the current governed content version may be assigned.' using errcode = '23514';
  end if;

  if not exists (
    select 1
    from public.content_versions cv
    where cv.governance_item_id = v_item.id
      and cv.version = p_content_version
  ) then
    raise exception 'The exact governed content version was not found.' using errcode = 'P0002';
  end if;

  if not exists (
    select 1
    from public.profile_roles pr
    join public.roles r on r.id = pr.role_id
    join public.profiles p on p.id = pr.profile_id
    where pr.profile_id = p_reviewer_profile_id
      and r.role_key = 'engineering_reviewer'
      and p.deleted_at is null
  ) then
    raise exception 'The assigned profile must be an active Engineering Reviewer.' using errcode = '23514';
  end if;

  select * into v_assignment
  from public.review_assignments ra
  where ra.governance_item_id = v_item.id
    and ra.content_version = p_content_version
    and ra.reviewer_profile_id = p_reviewer_profile_id
    and ra.review_type = p_review_type
  for update;

  if p_operation = 'assign' then
    if found and v_assignment.status = 'completed' then
      raise exception 'A completed review assignment cannot be reopened.' using errcode = '23514';
    elsif found and v_assignment.status in ('assigned', 'in_progress') then
      return v_assignment;
    elsif found then
      update public.review_assignments
      set status = 'assigned',
          assigned_by_profile_id = v_actor_id,
          reason = btrim(p_reason),
          assigned_at = now(),
          completed_at = null,
          cancelled_at = null,
          updated_at = now()
      where id = v_assignment.id
      returning * into v_assignment;
      v_changed := true;
    else
      insert into public.review_assignments (
        governance_item_id,
        content_version,
        reviewer_profile_id,
        assigned_by_profile_id,
        review_type,
        reason
      ) values (
        v_item.id,
        p_content_version,
        p_reviewer_profile_id,
        v_actor_id,
        p_review_type,
        btrim(p_reason)
      )
      returning * into v_assignment;
      v_changed := true;
    end if;
  else
    if not found then
      raise exception 'The review assignment was not found.' using errcode = 'P0002';
    elsif v_assignment.status = 'completed' then
      raise exception 'A completed review assignment cannot be cancelled.' using errcode = '23514';
    elsif v_assignment.status = 'cancelled' then
      return v_assignment;
    end if;

    update public.review_assignments
    set status = 'cancelled',
        reason = btrim(p_reason),
        cancelled_at = now(),
        updated_at = now()
    where id = v_assignment.id
    returning * into v_assignment;
    v_changed := true;
  end if;

  if v_changed then
    insert into public.audit_events (
      actor_profile_id,
      action,
      entity_table,
      entity_id,
      severity,
      metadata
    ) values (
      v_actor_id,
      'content.review_assignment.' || p_operation,
      'content_governance_items',
      v_item.id,
      'security',
      jsonb_build_object(
        'assignmentId', v_assignment.id,
        'contentVersion', p_content_version,
        'reviewerProfileId', p_reviewer_profile_id,
        'reviewType', p_review_type,
        'status', v_assignment.status,
        'reason', btrim(p_reason)
      )
    );
  end if;

  return v_assignment;
end;
$$;

create or replace function public.enforce_review_assignment()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.review_type = 'engineering_approval'
    and exists (
      select 1
      from public.profile_roles pr
      join public.roles r on r.id = pr.role_id
      where pr.profile_id = new.reviewer_profile_id
        and r.role_key = 'engineering_reviewer'
    )
    and not exists (
      select 1
      from public.profile_roles pr
      join public.roles r on r.id = pr.role_id
      where pr.profile_id = new.reviewer_profile_id
        and r.role_key = 'administrator'
    )
    and not exists (
      select 1
      from public.review_assignments ra
      where ra.governance_item_id = new.governance_item_id
        and ra.content_version = new.content_version
        and ra.reviewer_profile_id = new.reviewer_profile_id
        and ra.review_type = new.review_type
        and ra.status in ('assigned', 'in_progress')
    )
  then
    raise exception 'An active exact-version review assignment is required.' using errcode = '42501';
  end if;

  return new;
end;
$$;

create trigger review_records_require_assignment
  before insert on public.review_records
  for each row execute function public.enforce_review_assignment();

create or replace function public.complete_matching_review_assignment()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.review_type = 'engineering_approval' then
    update public.review_assignments
    set status = 'completed',
        completed_at = new.reviewed_at,
        updated_at = now()
    where governance_item_id = new.governance_item_id
      and content_version = new.content_version
      and reviewer_profile_id = new.reviewer_profile_id
      and review_type = new.review_type
      and status in ('assigned', 'in_progress');
  end if;

  return new;
end;
$$;

create trigger review_records_complete_assignment
  after insert on public.review_records
  for each row execute function public.complete_matching_review_assignment();

create or replace function public.cancel_assignments_on_reviewer_role_removal()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if exists (
    select 1 from public.roles r
    where r.id = old.role_id and r.role_key = 'engineering_reviewer'
  ) then
    update public.review_assignments
    set status = 'cancelled',
        cancelled_at = now(),
        updated_at = now()
    where reviewer_profile_id = old.profile_id
      and status in ('assigned', 'in_progress');
  end if;

  return old;
end;
$$;

create trigger profile_roles_cancel_reviewer_assignments
  after delete on public.profile_roles
  for each row execute function public.cancel_assignments_on_reviewer_role_removal();

create or replace function public.list_platform_access_audit(p_limit integer default 30)
returns table (
  audit_id uuid,
  actor_profile_id uuid,
  action text,
  target_profile_id uuid,
  metadata jsonb,
  occurred_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null or not public.is_platform_manager() then
    raise exception 'Platform management access is required.' using errcode = '42501';
  end if;

  return query
  select
    a.id,
    a.actor_profile_id,
    a.action,
    a.entity_id,
    a.metadata,
    a.occurred_at
  from public.audit_events a
  where a.action like 'platform.role.%'
     or a.action like 'platform.account.%'
     or a.action like 'platform.invitation.%'
     or a.action like 'content.review_assignment.%'
  order by a.occurred_at desc
  limit least(greatest(coalesce(p_limit, 30), 1), 100);
end;
$$;

revoke all on function public.manage_review_assignment(uuid, integer, uuid, text, text, text)
  from public, anon;
revoke all on function public.enforce_review_assignment() from public, anon, authenticated;
revoke all on function public.complete_matching_review_assignment()
  from public, anon, authenticated;
revoke all on function public.cancel_assignments_on_reviewer_role_removal()
  from public, anon, authenticated;

grant execute on function public.manage_review_assignment(uuid, integer, uuid, text, text, text)
  to authenticated, service_role;
