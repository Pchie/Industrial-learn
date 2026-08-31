# Prompt 46B Owner, Navigation, and Review Access Audit

## Executive Verdict

The implementation and staging database controls pass verification. Delivery of the web
changes through the protected `development` pull-request path is pending. Basic Fluid
Pressure remains draft, version `0.4.0`, with status `Engineering review required`; no
production system or engineering equation was changed.

## Access-Denied Root Cause

The live staging owner account authenticated successfully and had a valid application
profile, but the only persisted role was `student`. Roles are loaded from
`profile_roles` during server session resolution. `/review` required
`engineering_reviewer` or `administrator`, so the server route guard redirected before the
review data query. RLS was not the failing layer and the reviewer route key was correct.

## Changes

- Added database role `platform_owner` and capability-derived workspace access.
- Kept owner access separate from `content:review:approve`.
- Added audited role assignment, invitation registration, account status, user listing,
  and access-audit functions.
- Removed direct administrator writes to role-assignment and role-definition records.
- Kept `is_admin()` and student-private policies unchanged.
- Added `/workspace`, `/account/access`, `/owner`, `/lecturer`, and `/admin/users`.
- Added the authenticated Workspace switcher, role badge, owner perspective banners,
  breadcrumbs, and a contextual access-denied page.
- Reworked `/review` into Awaiting, Assigned, Changes requested, Approved, and history.
- Consolidated Basic Fluid Pressure source, engineering, visual, assessment,
  accessibility, preview, history, and final decision evidence.
- Added exact-version protected student preview with a not-published banner.

## Governance Result

Platform Owner can inspect review material but has no decision form unless a separate
qualified review role is present. Even a qualified reviewer cannot approve content for
which their profile is the accountable author. The server and database both enforce the
independence and exact-version checks.

## Quality Results

| Gate                   | Result                                                               |
| ---------------------- | -------------------------------------------------------------------- |
| Secret scan            | PASS                                                                 |
| Format check           | PASS                                                                 |
| Strict TypeScript      | PASS                                                                 |
| ESLint                 | PASS                                                                 |
| Content validation     | PASS — 29 tests                                                      |
| Migration validation   | PASS — 18 tests                                                      |
| Unit and package tests | PASS — 362 passed, 5 intentionally skipped                           |
| Production build       | PASS — 38 static/generated routes and protected dynamic routes built |
| Accessibility suite    | PASS — 42 browser checks                                             |
| Smoke suite            | PASS — 5 scenarios                                                   |
| Full end-to-end suite  | PASS — 103 scenarios                                                 |

The five skipped unit cases are pre-existing environment-dependent integration cases; no
failure was skipped or suppressed. The test-only simulated dashboard database failure is
an expected safe-error scenario and passed.

## Staging Verification

Staging project `lgjujyaclrpaopdabyzg` was explicitly confirmed as staging-only before
privileged work. Migrations `0014` and `0015` are recorded as applied. A single eligible,
existing staging profile received `platform_owner` through the controlled bootstrap; the
profile identity and credentials were not written to the repository or report.

Live transaction-scoped RLS verification established:

- owner and platform-manager helpers return true;
- administrator and content-staff helpers remain false for an owner-only decision context;
- the owner role does not have `content:review:write`;
- authenticated and service-role contexts may call the gated management RPC, while `anon`
  may not;
- owner governance reads resolve under RLS;
- all cross-student lesson-progress, assessment-attempt, and simulation-attempt reads
  returned zero, while the database contained six records in each tested private area;
- direct owner role-table mutation changed zero rows under RLS;
- direct review-record update is not granted to `authenticated`;
- all verification writes were transaction-scoped and rolled back.

The staging environment validator also passed without printing secret values. Real-route
verification remains pending until the web changes are delivered through the protected
`development` pull request.

## Provisional Verdicts

| Area                                 | Verdict | Evidence                                                                                                 |
| ------------------------------------ | ------- | -------------------------------------------------------------------------------------------------------- |
| Platform Owner access                | PASS    | Database role, capability model, RLS, and local browser matrix pass.                                     |
| Workspace navigation                 | PASS    | Role-filtered switcher, portal, direct-route guards, mobile, and keyboard tests pass.                    |
| Reviewer workspace                   | PASS    | Queue, consolidated evidence, decisions, history, and owner inspection-only state pass.                  |
| Basic Fluid Pressure reviewer access | BLOCKED | Local exact-version review and preview pass; real staging web deployment is pending.                     |
| Independent-review protection        | PASS    | Owner lacks review approval capability; author and exact-version checks remain server/database enforced. |

## Known Limitations

- Lecturer and author workspace links expose the current safe foundations; complete cohort
  and authoring editors remain future feature work.
- Invitation acceptance follows the configured Supabase email flow; no password or secret
  is exposed in Industrial Learn.
- Owner read visibility does not include unrelated private student records.
- Profile disablement is an application-access control; deleting or banning the Supabase
  identity remains a separate, privileged operator action.
- If invitation profile registration fails after Supabase creates the identity, the server
  attempts immediate identity cleanup; an external outage during both operations would
  require an operator to remove the orphaned invitation from Supabase Auth.
