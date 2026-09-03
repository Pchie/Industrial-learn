-- Fix PL/pgSQL output-column ambiguity in the audited profile-role manager.

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
    on conflict on constraint profile_roles_profile_id_role_id_key do nothing;
    get diagnostics v_row_count = row_count;
    v_changed := v_row_count > 0;
  else
    delete from public.profile_roles
    where profile_roles.profile_id = p_target_profile_id
      and profile_roles.role_id = v_role_id;
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

revoke all on function public.manage_profile_role(uuid, public.app_role, text, text)
  from public, anon;
grant execute on function public.manage_profile_role(uuid, public.app_role, text, text)
  to authenticated, service_role;
