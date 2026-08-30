# Platform Owner Role

## Security Model

`platform_owner` is a database-backed application role for the founder or principal
administrator. It is never inferred from account order, email text, local storage, or a
browser flag.

The role grants operational capabilities for all workspaces, protected content preview,
user and role management, audit inspection, and platform management. It deliberately does
not grant `content:review:approve`.

## Database Boundary

- Migration `0014_add_platform_owner_role.sql` adds the enum value in its own transaction.
- Migration `0015_platform_owner_access_management.sql` registers permissions, read
  policies, audited account operations, and owner helpers.
- `is_admin()` is not broadened. Platform Owner therefore does not automatically inherit
  administrator access to student-private progress, attempts, or submissions.
- Owner visibility uses explicit read policies. The role does not inherit legacy broad
  content-staff write policies.
- Role, invitation, and account-status changes use security-definer functions with a fixed
  search path, authenticated actor checks, confirmation reasons, and audit events.
- Direct administrator writes to role-assignment tables are removed.
- Browser code receives no service-role credential. The service role is used only by the
  server invitation operation with an explicit account-administration justification.

## Assignment Rules

Normal users cannot self-assign any role. A Platform Owner cannot change their own
privileged roles, the final owner assignment cannot be removed, and an active profile must
retain at least one role. Administrators may manage normal roles but only a Platform Owner
may assign or remove `platform_owner`.

The staging bootstrap template in `database/seed/0006_platform_owner_bootstrap.staging.template.sql`
is a one-time privileged operator process. It contains no account identifier or secret.

## Data Boundaries

Platform Owner access does not imply permission to read unrelated private student data.
Student ownership and authorised lecturer policies remain unchanged. Platform operations
that genuinely require aggregate student data need a separately designed, purpose-limited
service in a future task.
