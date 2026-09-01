# Reviewer Role And Assignment Security

Date: 2026-08-31

## Security Model

Industrial Learn separates:

1. Supabase authentication identity.
2. Application profile.
3. Engineering Reviewer role.
4. Exact-version review assignment.
5. Review decision authority.
6. Publication authority.

No earlier gate implies a later gate.

## Evidence IDs

- IL-46C-SEC-ROLE: `database/migrations/0015_platform_owner_access_management.sql`
- IL-46C-SEC-ASSIGN: `database/migrations/0016_secure_review_assignments.sql`
- IL-46C-SEC-AUTH: `apps/web/src/features/auth/supabase-provider.ts`
- IL-46C-SEC-ROUTE: `apps/web/src/app/review/[lessonSlug]/page.tsx`
- IL-46C-SEC-DATA: `apps/web/src/features/content-governance/server-data.ts`

## Role Assignment

Normal signup provisions only Student. Engineering Reviewer can be added or removed only by
the audited `manage_profile_role` security-definer function. The caller must be an
authenticated Platform Owner or administrator, cannot change their own privileged roles,
and must provide a reason. Direct authenticated writes to role assignment tables remain
revoked. Evidence: IL-46C-SEC-ROLE and IL-46C-SEC-AUTH.

## Review Assignment

`review_assignments` stores:

- governed item ID;
- exact numeric content version;
- named reviewer profile;
- assigning manager profile;
- required review type;
- assigned date;
- lifecycle status;
- audit reason.

The item and version pair has a database foreign key to `content_versions`. The manager RPC
accepts only the current governed version, requires an active Engineering Reviewer, blocks
self-assignment, and records an audit event. Reviewers may read only their own assignments;
Platform Owners and administrators may inspect assignments. Direct authenticated insert,
update, and delete are not granted. Evidence: IL-46C-SEC-ASSIGN.

## Decision Enforcement

Before an Engineering Reviewer review record is inserted, a database trigger requires an
active assignment for the same reviewer, governed item, content version, and review type.
After a valid review record is inserted, a second trigger completes that assignment in the
same transaction. Removing the Reviewer role cancels active assignments. This prevents an
unassigned reviewer from bypassing the application route by calling the database function
directly. Evidence: IL-46C-SEC-ASSIGN.

Administrators retain the pre-existing trusted review-decision capability for controlled
operations. Platform Owners retain inspection and assignment management but do not receive
engineering approval capability automatically.

## Redirect Security

`next` is accepted only when it is an internal path. Absolute external URLs, protocol-relative
URLs, backslashes, and newline payloads fall back to the dashboard. The value changes only
post-authentication navigation; it is never read by profile, role, assignment, or review
decision code. Evidence: `apps/web/src/features/auth/session-core.ts`.

## Data Boundaries

Reviewer access does not grant access to another student's progress, submissions, assessment
attempts, or simulation attempts. Service-role credentials remain server-only and are used
only for explicitly justified account/profile administration paths.
