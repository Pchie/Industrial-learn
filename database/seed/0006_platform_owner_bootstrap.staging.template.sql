-- Staging-only one-time Platform Owner bootstrap template.
-- Replace the psql variable at execution time; do not commit an account ID.
-- This is required only before the first Platform Owner can use the audited UI.

\set platform_owner_auth_user_id '<platform-owner-auth-user-id>'

begin;

insert into public.profile_roles (profile_id, role_id, assigned_by_profile_id)
select :'platform_owner_auth_user_id'::uuid, r.id, null
from public.roles r
where r.role_key = 'platform_owner'
on conflict (profile_id, role_id) do nothing;

insert into public.audit_events (
  actor_profile_id,
  action,
  entity_table,
  entity_id,
  severity,
  metadata
) values (
  null,
  'platform.role.bootstrap',
  'profiles',
  :'platform_owner_auth_user_id'::uuid,
  'security',
  jsonb_build_object(
    'role', 'platform_owner',
    'environment', 'staging',
    'actorType', 'privileged_staging_database_operator',
    'reason', 'Initial Platform Owner bootstrap before audited role management is available.'
  )
);

commit;
