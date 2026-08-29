# Prompt 44 Live Staging Security Report

Date: 2026-08-29
Target: Supabase staging project `lgjujyaclrpaopdabyzg`

## Executive Verdict

The dedicated Supabase staging project is restored, correctly identified, migrated, and
verified live. Database RLS, student ownership, lecturer cohort scoping, author
self-approval denial, reviewer separation, assessment security, and simulation-attempt
security pass the live matrix.

The currently deployed Vercel staging bundle is stale and still renders the
source-incomplete `basic-fluid-pressure` lesson to an anonymous visitor. The corrected
local application denies that route, but it has not been deployed from an exact reviewed
commit. Prompt 45 therefore remains **NO-GO**.

## Final Verdicts

| Gate                   | Verdict                                                                                    |
| ---------------------- | ------------------------------------------------------------------------------------------ |
| Staging Supabase       | **ACTIVE VERIFIED**                                                                        |
| Live RLS               | **PASS**                                                                                   |
| Publication boundaries | **FAIL**: database and local application pass; current deployed staging lesson route fails |
| Student ownership      | **PASS**                                                                                   |
| Reviewer separation    | **PASS**                                                                                   |
| Prompt 45 readiness    | **NO-GO**                                                                                  |

## Project Safety

| Check                                     | Result                 |
| ----------------------------------------- | ---------------------- |
| Project name                              | `Industrial Learn`     |
| Project reference                         | `lgjujyaclrpaopdabyzg` |
| Region                                    | `eu-west-1`            |
| Supabase status                           | `ACTIVE_HEALTHY`       |
| Repository link                           | Linked to staging ref  |
| Environment label                         | `staging`              |
| Authentication mode                       | `supabase`             |
| Local E2E mode                            | Disabled               |
| Known production ref excluded             | PASS                   |
| Production database or deployment changed | No                     |

The operator explicitly confirmed that the target is staging-only and contains no
production data before privileged work began.

## Configuration Boundary

The ignored `.env.staging.local` passed `npm run validate:staging-env`. Required names are:

- `NODE_ENV`
- `NEXT_PUBLIC_APP_ENV`
- `APP_BASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_PROJECT_REF`
- `SUPABASE_DB_URL`
- `INDUSTRIAL_LEARN_AUTH_MODE`
- `INDUSTRIAL_LEARN_E2E`

No value, access token, password, service key, or connection string was printed or added
to Git.

## Migration Reconciliation

Supabase migration history was initially empty. Live catalog markers proved `0001` through
`0009` present. Working-tree migration `0010` was absent and held because it registers
review-required Bernoulli content; it was not applied.

| Migration                                            | Final classification                                                                           |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| `0001_initial_schema.sql`                            | Applied; required tables/functions present; ledger repaired                                    |
| `0002_dashboard_student_preferences.sql`             | Applied; both preference tables present; ledger repaired                                       |
| `0003_attempt_persistence_metadata.sql`              | Applied; 16 metadata columns and four indexes present; ledger repaired                         |
| `0004_content_governance_persistence.sql`            | Applied; governance types/table/metadata present; ledger repaired                              |
| `0005_restrict_unapproved_content_visibility.sql`    | Applied; helper and replacement policies match checked contract; ledger repaired               |
| `0006_restrict_author_self_approval.sql`             | Applied; restrictive author policies present; ledger repaired                                  |
| `0007_atomic_assessment_completion.sql`              | Applied; service-role-only function verified; ledger repaired                                  |
| `0008_atomic_simulation_completion.sql`              | Applied; service-role-only function verified; ledger repaired                                  |
| `0009_staging_hydraulic_simulation_fixture.sql`      | Applied; fixture present; unsafe stored publication state corrected by `0012`; ledger repaired |
| `0010_bernoulli_flow_simulation_registration.sql`    | Working-tree-only, repository-only, held and unapplied                                         |
| `0011_restrict_assessment_question_delivery.sql`     | New additive correction; applied successfully; ledger recorded                                 |
| `0012_demote_unapproved_simulation_publications.sql` | New additive correction; applied successfully; ledger recorded                                 |

Supabase CLI history repair records `0001`-`0009`, `0011`, and `0012` as applied. The
canonical repository layout remains `database/migrations/`, so a temporary non-repository
Supabase work directory was used only to let the supported CLI associate verified files
with history versions. No historical SQL was edited.

## Security Corrections

### Private Assessment Explanations

Live verification proved that an authenticated student could select three non-null
`questions.explanation` values before submission. RLS restricted rows but could not hide
that column.

Migration `0011` removes table-wide question reads from `anon` and `authenticated`, then
grants authenticated users only safe question columns. Final privileges:

- authenticated prompt read: allowed;
- authenticated explanation read: denied;
- anonymous explanation read: denied; and
- service-role explanation read: allowed.

### Unapproved Simulation Publication State

Two non-approved simulations were stored as `published`. RLS hid them, but the stored state
did not satisfy the Prompt 40 remediation plan. Migration `0012` conditionally changed
only unapproved published simulations to `internal`.

Final result: zero unapproved published simulations and three approved published
simulations preserved.

## Live RLS And Transaction Results

A rollback-only matrix created controlled synthetic records for all required content
states and private student-data surfaces. It used existing staging-only role fixtures and
rolled back every temporary row.

Result: **55/55 PASS**.

The matrix covered:

- Student A own/cross-Student B profile, progress, assessment attempt, simulation attempt,
  project submission, saved lesson, and preference access.
- Authorised lecturer access and unrelated lecturer denial.
- Draft, source-required, review-required, approved-unpublished,
  published-unapproved, published-approved, and archived visibility.
- Hidden answer choices and private question explanations.
- Author draft editing and self-approval denial.
- Reviewer evidence access without student-private access.
- Service-role-only completion functions.
- Server-controlled score, competency, and version fields.
- Assessment/simulation idempotency, audit uniqueness, transaction rollback, and reset
  without false completion.

Cleanup verification found zero Prompt 44 auth users, lesson fixtures, simulation fixtures,
or governance fixtures remaining.

## Authentication Results

Temporary synthetic accounts and credentials existed in memory only and were deleted.

| Area                                                    | Result                                           |
| ------------------------------------------------------- | ------------------------------------------------ |
| Auth settings endpoint                                  | PASS                                             |
| Email/password provider                                 | PASS                                             |
| Anonymous sign-in disabled/absent                       | PASS                                             |
| Public signup configured as enabled                     | PASS                                             |
| Email auto-confirm disabled                             | PASS                                             |
| Verified student sign-in                                | PASS                                             |
| Profile and default student-role resolution             | PASS                                             |
| Session refresh                                         | PASS                                             |
| Expired session rejection                               | PASS                                             |
| Recovery-token password update and new-password sign-in | PASS                                             |
| Verification-token session                              | PASS                                             |
| Sign-out and revoked-session rejection                  | PASS                                             |
| Public signup email delivery                            | BLOCKED by Supabase `over_email_send_rate_limit` |
| Public reset-email non-disclosure comparison            | BLOCKED by the same rate limit                   |

The email rate limit is an operational verification gap, not evidence that tokens or user
data were exposed. It must be rerun after the provider window resets.

## Deployed Application Check

The protected staging alias is reachable in the authenticated in-app browser.

- Anonymous `/simulations/hydraulic-cylinder-force` redirected to sign-in.
- Anonymous `/lessons/basic-fluid-pressure` rendered source-incomplete lesson content.
- The corrected local build and E2E suite deny that lesson and all review-required
  simulations.

This proves the Vercel staging deployment does not yet contain the exact corrected
Prompt 43 worktree. Deploying an uncommitted mixed worktree was intentionally rejected.

## Local Quality Results

| Command                       | Result                                          |
| ----------------------------- | ----------------------------------------------- |
| `npm run scan:secrets`        | PASS                                            |
| `npm run format:check`        | PASS after formatting the two Prompt 44 reports |
| `npm run typecheck`           | PASS                                            |
| `npm run lint`                | PASS                                            |
| `npm run validate:content`    | PASS, 19 tests                                  |
| `npm run validate:migrations` | PASS, 16 tests                                  |
| `npm run test:unit`           | PASS, 324 passed and 5 skipped                  |
| `npm run build`               | PASS, 33 pages generated                        |
| `npm run test:smoke`          | PASS, 5 tests                                   |
| `npm run test:e2e`            | PASS, 94 tests                                  |
| `npm run test:a11y`           | PASS, 36 tests                                  |

The first browser-suite start was blocked by sandbox port permission. The unchanged suite
passed after the permitted local-server retry. Routine `NO_COLOR` warnings remain.

## Remaining Risks

1. The current Vercel staging deployment exposes a lesson that the corrected local build
   hides.
2. The corrected Prompt 39/43/44 worktree is not yet an exact reviewed commit on
   `development`.
3. Canonical migrations are outside `supabase/migrations`; linked CLI output therefore
   shows remote versions without local counterparts unless a temporary work directory is
   supplied.
4. Held migration `0010` must not be applied before review and `0012` ordering is preserved.
5. Reviewer assignment is not represented by a first-class persisted relation; reviewer
   student-data separation passes, but assignment-level scoping remains a product gap.
6. Public signup and reset-email delivery need a later live rerun after the Supabase email
   rate-limit window resets.

## Required Next Step

Prepare coherent reviewable commits for Prompt 39, Prompt 43, and Prompt 44; merge them to
`development` through CI; deploy that exact commit to protected staging; then rerun the
anonymous and authenticated route matrix. Prompt 45 must not proceed before that release
identity is verified.
