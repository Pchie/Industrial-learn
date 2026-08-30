-- Platform Owner access and audited account-role management.
-- The owner gains operational workspace access without becoming an engineering
-- reviewer and without receiving broad access to student-private learning records.

insert into public.roles (role_key, name, description)
values (
  'platform_owner',
  'Platform owner',
  'Manages Industrial Learn workspaces, governance, users, roles, and platform operations without bypassing independent engineering review.'
)
on conflict (role_key) do update
set
  name = excluded.name,
  description = excluded.description,
  updated_at = now();

insert into public.permissions (permission_key, name, description)
values
  ('workspace:student', 'Use student workspace', 'Allows access to the current user''s student learning workspace.'),
  ('workspace:author', 'Use author workspace', 'Allows access to content-authoring tools.'),
  ('workspace:review', 'Use reviewer workspace', 'Allows read access to engineering-review packages and queues.'),
  ('workspace:lecturer', 'Use lecturer workspace', 'Allows access to authorised lecturer tools.'),
  ('workspace:admin', 'Use administration workspace', 'Allows access to authorised platform-administration tools.'),
  ('workspace:owner', 'Use owner workspace', 'Allows access to Platform Owner operations.'),
  ('content:preview', 'Preview governed content', 'Allows protected exact-version preview of unpublished content.'),
  ('platform:manage', 'Manage platform', 'Allows controlled Platform Owner operations.'),
  ('publication:manage', 'Manage publication', 'Allows management of approved publication records without bypassing review gates.'),
  ('sources:manage', 'Manage sources', 'Allows management of approved source records.'),
  ('simulations:manage', 'Manage simulations', 'Allows management of simulation registry records.')
on conflict (permission_key) do update
set
  name = excluded.name,
  description = excluded.description,
  updated_at = now();

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
cross join public.permissions p
where r.role_key = 'platform_owner'
  and p.permission_key <> 'content:review:write'
on conflict (role_id, permission_id) do nothing;

insert into public.role_permissions (role_id, permission_id)
select r.id, p.id
from public.roles r
join public.permissions p on
  (r.role_key = 'student' and p.permission_key = 'workspace:student')
  or (r.role_key = 'lecturer' and p.permission_key in ('workspace:student', 'workspace:lecturer'))
  or (r.role_key = 'content_author' and p.permission_key in ('workspace:student', 'workspace:author', 'content:preview'))
  or (r.role_key = 'engineering_reviewer' and p.permission_key in ('workspace:student', 'workspace:review', 'content:preview'))
  or (r.role_key = 'administrator' and p.permission_key in ('workspace:author', 'workspace:review', 'workspace:admin', 'content:preview', 'platform:manage'))
on conflict (role_id, permission_id) do nothing;

create or replace function public.is_platform_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role('platform_owner');
$$;

create or replace function public.is_platform_manager()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_platform_owner() or public.is_admin();
$$;

create or replace function public.is_content_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role('content_author')
    or public.has_role('engineering_reviewer')
    or public.has_role('administrator');
$$;

-- The owner receives broad read visibility through explicit policies rather than
-- inheriting legacy content-staff write policies. Mutations remain controlled by
-- audited server operations and existing publication gates.
create policy content_governance_items_platform_owner_read on public.content_governance_items
  for select to authenticated using (public.is_platform_owner());
create policy content_versions_platform_owner_read on public.content_versions
  for select to authenticated using (public.is_platform_owner());
create policy review_records_platform_owner_read on public.review_records
  for select to authenticated using (public.is_platform_owner());
create policy source_documents_platform_owner_read on public.source_documents
  for select to authenticated using (public.is_platform_owner());
create policy knowledge_files_platform_owner_read on public.knowledge_files
  for select to authenticated using (public.is_platform_owner());
create policy modules_platform_owner_read on public.modules
  for select to authenticated using (public.is_platform_owner());
create policy units_platform_owner_read on public.units
  for select to authenticated using (public.is_platform_owner());
create policy lessons_platform_owner_read on public.lessons
  for select to authenticated using (public.is_platform_owner());
create policy learning_outcomes_platform_owner_read on public.learning_outcomes
  for select to authenticated using (public.is_platform_owner());
create policy assessments_platform_owner_read on public.assessments
  for select to authenticated using (public.is_platform_owner());
create policy questions_platform_owner_read on public.questions
  for select to authenticated using (public.is_platform_owner());
create policy answer_choices_platform_owner_read on public.answer_choices
  for select to authenticated using (public.is_platform_owner());
create policy simulations_platform_owner_read on public.simulations
  for select to authenticated using (public.is_platform_owner());
create policy projects_platform_owner_read on public.projects
  for select to authenticated using (public.is_platform_owner());

-- Role assignment is available only through the audited function below.
drop policy if exists profiles_admin_all on public.profiles;
drop policy if exists roles_admin_all on public.roles;
drop policy if exists permissions_admin_all on public.permissions;
drop policy if exists role_permissions_admin_all on public.role_permissions;
drop policy if exists profile_roles_admin_all on public.profile_roles;
drop policy if exists profile_roles_self_read on public.profile_roles;

create policy profile_roles_self_read on public.profile_roles
  for select to authenticated
  using (profile_id = auth.uid());

drop policy if exists audit_events_platform_owner_read on public.audit_events;
create policy audit_events_platform_owner_read on public.audit_events
  for select to authenticated
  using (public.is_platform_owner());

create or replace function public.list_platform_users()
returns table (
  profile_id uuid,
  email text,
  display_name text,
  account_status text,
  roles text[],
  updated_at timestamptz
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
    p.id,
    p.email,
    p.display_name,
    case when p.deleted_at is null then 'active' else 'disabled' end,
    coalesce(
      array_agg(r.role_key::text order by r.role_key::text)
        filter (where r.role_key is not null),
      array[]::text[]
    ),
    p.updated_at
  from public.profiles p
  left join public.profile_roles pr on pr.profile_id = p.id
  left join public.roles r on r.id = pr.role_id
  group by p.id
  order by p.display_name, p.email;
end;
$$;

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
  order by a.occurred_at desc
  limit least(greatest(coalesce(p_limit, 30), 1), 100);
end;
$$;

create or replace function public.list_content_author_labels(p_profile_ids uuid[])
returns table (
  profile_id uuid,
  display_name text
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null or not (
    public.is_content_staff() or public.is_platform_owner()
  ) then
    raise exception 'Content staff access is required.' using errcode = '42501';
  end if;

  return query
  select p.id, p.display_name
  from public.profiles p
  where p.id = any(coalesce(p_profile_ids, array[]::uuid[]))
    and exists (
      select 1
      from public.content_governance_items cgi
      where cgi.author_profile_id = p.id
    );
end;
$$;

create or replace function public.manage_profile_role(
  p_target_profile_id uuid,
  p_role public.app_role,
  p_operation text,
  p_reason text
)
returns table (
  profile_id uuid,
  roles text[]
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_actor_id uuid := auth.uid();
  v_role_id uuid;
  v_old_roles text[];
  v_new_roles text[];
  v_changed boolean := false;
  v_row_count integer := 0;
begin
  if v_actor_id is null or not public.is_platform_manager() then
    raise exception 'Platform management access is required.' using errcode = '42501';
  end if;

  if p_target_profile_id is null or not exists (
    select 1 from public.profiles p where p.id = p_target_profile_id
  ) then
    raise exception 'The target profile does not exist.' using errcode = 'P0002';
  end if;

  if p_target_profile_id = v_actor_id then
    raise exception 'Users cannot change their own privileged roles.' using errcode = '42501';
  end if;

  if p_operation not in ('add', 'remove') then
    raise exception 'Role operation must be add or remove.' using errcode = '22023';
  end if;

  if char_length(btrim(coalesce(p_reason, ''))) < 10 then
    raise exception 'A role-change reason of at least 10 characters is required.' using errcode = '22023';
  end if;

  if p_role = 'platform_owner' and not public.is_platform_owner() then
    raise exception 'Only a Platform Owner may assign or remove Platform Owner access.' using errcode = '42501';
  end if;

  if p_operation = 'remove'
    and p_role = 'platform_owner'
    and (select count(*)
         from public.profile_roles pr
         join public.roles r on r.id = pr.role_id
         where r.role_key = 'platform_owner') <= 1
  then
    raise exception 'The final Platform Owner assignment cannot be removed.' using errcode = '23514';
  end if;

  if p_operation = 'remove'
    and (select count(*) from public.profile_roles pr
         where pr.profile_id = p_target_profile_id) <= 1
  then
    raise exception 'An active profile must retain at least one role.' using errcode = '23514';
  end if;

  select r.id into v_role_id
  from public.roles r
  where r.role_key = p_role;

  if v_role_id is null then
    raise exception 'The requested role is not registered.' using errcode = 'P0002';
  end if;

  select coalesce(array_agg(r.role_key::text order by r.role_key::text), array[]::text[])
  into v_old_roles
  from public.profile_roles pr
  join public.roles r on r.id = pr.role_id
  where pr.profile_id = p_target_profile_id;

  if p_operation = 'add' then
    insert into public.profile_roles (profile_id, role_id, assigned_by_profile_id)
    values (p_target_profile_id, v_role_id, v_actor_id)
    on conflict (profile_id, role_id) do nothing;
    get diagnostics v_row_count = row_count;
    v_changed := v_row_count > 0;
  else
    delete from public.profile_roles
    where profile_id = p_target_profile_id and role_id = v_role_id;
    get diagnostics v_row_count = row_count;
    v_changed := v_row_count > 0;
  end if;

  select coalesce(array_agg(r.role_key::text order by r.role_key::text), array[]::text[])
  into v_new_roles
  from public.profile_roles pr
  join public.roles r on r.id = pr.role_id
  where pr.profile_id = p_target_profile_id;

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
      'platform.role.' || p_operation,
      'profiles',
      p_target_profile_id,
      'security',
      jsonb_build_object(
        'role', p_role::text,
        'reason', btrim(p_reason),
        'oldRoles', v_old_roles,
        'newRoles', v_new_roles
      )
    );
  end if;

  return query select p_target_profile_id, v_new_roles;
end;
$$;

create or replace function public.set_profile_disabled(
  p_target_profile_id uuid,
  p_disabled boolean,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_actor_id uuid := auth.uid();
  v_target_is_owner boolean;
begin
  if v_actor_id is null or not public.is_platform_manager() then
    raise exception 'Platform management access is required.' using errcode = '42501';
  end if;

  if p_target_profile_id = v_actor_id then
    raise exception 'Users cannot disable their own account.' using errcode = '42501';
  end if;

  if char_length(btrim(coalesce(p_reason, ''))) < 10 then
    raise exception 'An account-change reason of at least 10 characters is required.' using errcode = '22023';
  end if;

  select exists (
    select 1
    from public.profile_roles pr
    join public.roles r on r.id = pr.role_id
    where pr.profile_id = p_target_profile_id
      and r.role_key = 'platform_owner'
  ) into v_target_is_owner;

  if v_target_is_owner then
    raise exception 'Platform Owner accounts cannot be disabled through this workflow.' using errcode = '42501';
  end if;

  update public.profiles
  set deleted_at = case when p_disabled then now() else null end,
      updated_at = now()
  where id = p_target_profile_id;

  if not found then
    raise exception 'The target profile does not exist.' using errcode = 'P0002';
  end if;

  insert into public.audit_events (
    actor_profile_id,
    action,
    entity_table,
    entity_id,
    severity,
    metadata
  ) values (
    v_actor_id,
    case when p_disabled then 'platform.account.disabled' else 'platform.account.enabled' end,
    'profiles',
    p_target_profile_id,
    'security',
    jsonb_build_object('reason', btrim(p_reason))
  );
end;
$$;

create or replace function public.register_invited_profile(
  p_target_profile_id uuid,
  p_email text,
  p_display_name text,
  p_role public.app_role,
  p_reason text
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_actor_id uuid := auth.uid();
  v_role_id uuid;
begin
  if v_actor_id is null or not public.is_platform_manager() then
    raise exception 'Platform management access is required.' using errcode = '42501';
  end if;

  if p_role not in ('lecturer', 'content_author', 'engineering_reviewer') then
    raise exception 'Invitations may assign only lecturer, content author, or engineering reviewer access.' using errcode = '42501';
  end if;

  if nullif(btrim(p_email), '') is null or nullif(btrim(p_display_name), '') is null then
    raise exception 'Invitation email and display name are required.' using errcode = '22023';
  end if;

  if char_length(btrim(coalesce(p_reason, ''))) < 10 then
    raise exception 'An invitation reason of at least 10 characters is required.' using errcode = '22023';
  end if;

  select r.id into v_role_id from public.roles r where r.role_key = p_role;
  if v_role_id is null then
    raise exception 'The requested role is not registered.' using errcode = 'P0002';
  end if;

  insert into public.profiles (id, email, display_name)
  values (p_target_profile_id, lower(btrim(p_email)), btrim(p_display_name))
  on conflict (id) do update
  set email = excluded.email,
      display_name = excluded.display_name,
      deleted_at = null,
      updated_at = now();

  insert into public.profile_roles (profile_id, role_id, assigned_by_profile_id)
  values (p_target_profile_id, v_role_id, v_actor_id)
  on conflict (profile_id, role_id) do nothing;

  insert into public.audit_events (
    actor_profile_id,
    action,
    entity_table,
    entity_id,
    severity,
    metadata
  ) values (
    v_actor_id,
    'platform.invitation.created',
    'profiles',
    p_target_profile_id,
    'security',
    jsonb_build_object('role', p_role::text, 'reason', btrim(p_reason))
  );

  return p_target_profile_id;
end;
$$;

revoke all on function public.list_platform_users() from public, anon;
revoke all on function public.list_platform_access_audit(integer) from public, anon;
revoke all on function public.list_content_author_labels(uuid[]) from public, anon;
revoke all on function public.manage_profile_role(uuid, public.app_role, text, text) from public, anon;
revoke all on function public.set_profile_disabled(uuid, boolean, text) from public, anon;
revoke all on function public.register_invited_profile(uuid, text, text, public.app_role, text) from public, anon;

grant execute on function public.list_platform_users() to authenticated, service_role;
grant execute on function public.list_platform_access_audit(integer) to authenticated, service_role;
grant execute on function public.list_content_author_labels(uuid[]) to authenticated, service_role;
grant execute on function public.manage_profile_role(uuid, public.app_role, text, text) to authenticated, service_role;
grant execute on function public.set_profile_disabled(uuid, boolean, text) to authenticated, service_role;
grant execute on function public.register_invited_profile(uuid, text, text, public.app_role, text) to authenticated, service_role;
