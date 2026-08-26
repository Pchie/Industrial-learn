# Production Migration And RLS Verification Report

Date: 2026-08-20

## Executive Verdict

PASS for production database migration application and production-safe RLS
verification.

NO-GO for real student data and public production launch.

The approved production Supabase project `vhjjfapkxytmaakbleee` now has the
repository schema migrations `0001` through `0008`, baseline and corrective RLS
policy files, and production-safe role/permission metadata applied. Production
migration tracking was verified through the Supabase migration history table.

Production-safe RLS verification was run with synthetic records inside a
rollback-only transaction. No synthetic verification data remained after the
test.

## Scope

Completed:

- Verified `.env.production.local` is ignored by Git.
- Verified `SUPABASE_DB_URL` points to production project
  `vhjjfapkxytmaakbleee`, not staging project `lgjujyaclrpaopdabyzg`.
- Created temporary migration workspaces outside the repository.
- Excluded staging-only migration and seed files from production execution.
- Applied schema migrations `0001` through `0004`.
- Applied baseline policy files `0001`, `0002`, and `0004`.
- Applied corrective and atomic migrations `0005` through `0008`.
- Applied corrective RLS hardening policy file `0005`.
- Applied production-safe role/permission seed `0001`.
- Verified migration tracking, policy hardening, role seed counts, RLS
  behavior, rollback cleanup, and protected production health routes.

Not completed:

- No staging-only fixture migration was applied.
- No staging synthetic profiles seed was applied.
- No real student data was created.
- No production backup or restore rehearsal was run during this task.
- No production alert route was configured during this task.
- No credentials, database URLs, service-role keys, tokens, passwords, or
  response bodies were printed or committed.

## Production Project Boundary

| Check                                | Result                 |
| ------------------------------------ | ---------------------- |
| Production Supabase project          | `vhjjfapkxytmaakbleee` |
| Staging Supabase project             | `lgjujyaclrpaopdabyzg` |
| Production URL marker check          | Passed                 |
| Staging URL marker absent            | Passed                 |
| Local Git branch at start            | `main`                 |
| Production credential tracked by Git | No                     |

## Applied Database Changes

Schema migrations applied through Supabase migration tracking:

1. `database/migrations/0001_initial_schema.sql`
2. `database/migrations/0002_dashboard_student_preferences.sql`
3. `database/migrations/0003_attempt_persistence_metadata.sql`
4. `database/migrations/0004_content_governance_persistence.sql`
5. `database/migrations/0005_restrict_unapproved_content_visibility.sql`
6. `database/migrations/0006_restrict_author_self_approval.sql`
7. `database/migrations/0007_atomic_assessment_completion.sql`
8. `database/migrations/0008_atomic_simulation_completion.sql`

Policy files applied with `psql`:

1. `database/policies/0001_row_level_security.sql`
2. `database/policies/0002_dashboard_student_preferences.sql`
3. `database/policies/0004_content_governance_persistence.sql`
4. `database/policies/0005_staging_rls_hardening.sql`

Seed file applied:

1. `database/seed/0001_roles_permissions.sql`

Explicitly excluded from production:

- `database/migrations/0009_staging_hydraulic_simulation_fixture.sql`
- `database/seed/0002_staging_synthetic_profiles.template.sql`

## Verification Results

| Check                                            | Result                   |
| ------------------------------------------------ | ------------------------ |
| Migration dry run for `0001` to `0004`           | Passed                   |
| Migration application for `0001` to `0004`       | Passed                   |
| Migration tracking after `0001` to `0004`        | Passed                   |
| Baseline RLS policies                            | Passed                   |
| Migration dry run for `0005` to `0008`           | Passed                   |
| Migration application for `0005` to `0008`       | Passed                   |
| Migration tracking after `0005` to `0008`        | Passed                   |
| Corrective RLS hardening policy                  | Passed                   |
| Old broad answer-choice policy absent            | Passed                   |
| Hardened answer-choice policy present            | Passed                   |
| Old broad assessment-attempt write policy absent | Passed                   |
| Student assessment-attempt select policy present | Passed                   |
| Old broad simulation-attempt write policy absent | Passed                   |
| Student simulation-attempt select policy present | Passed                   |
| Atomic assessment completion function present    | Passed                   |
| Atomic simulation completion function present    | Passed                   |
| Role seed count                                  | Passed; 5 roles          |
| Permission seed count                            | Passed; 11 permissions   |
| Role-permission link count                       | Passed; 27 links         |
| Required role count                              | Passed; 5 required roles |

## Production-Safe RLS Verification

Rollback-only synthetic verification passed:

| RLS check                                                        | Result |
| ---------------------------------------------------------------- | ------ |
| Approved published lesson visible to student                     | Passed |
| Draft or unapproved published-looking lesson hidden from student | Passed |
| Hidden answer choices hidden from student                        | Passed |
| Content versions hidden from student                             | Passed |
| Review records hidden from student                               | Passed |
| Student can read own completed attempt                           | Passed |
| Student B cannot read Student A attempt                          | Passed |
| Student B cannot submit for Student A                            | Passed |
| Engineering reviewer cannot read private student attempt         | Passed |
| Engineering reviewer can read review evidence                    | Passed |
| Content author cannot self-approve and publish own item          | Passed |
| Synthetic Auth users remaining after rollback                    | 0      |
| Synthetic profiles remaining after rollback                      | 0      |
| Synthetic lessons remaining after rollback                       | 0      |
| Synthetic attempts remaining after rollback                      | 0      |

## Production Route Verification

Protected production checks after database setup:

| Route                                   | Result                |
| --------------------------------------- | --------------------- |
| `/api/health/live`                      | Passed; HTTP 200 JSON |
| `/api/health/ready`                     | Passed; HTTP 200 JSON |
| `/auth/sign-in`                         | Passed; HTTP 200 HTML |
| Vercel protection bypass secret printed | No                    |
| Response bodies printed                 | No                    |

## Remaining Risks

- Production backup retention and restore rehearsal still need live provider
  evidence before real student data.
- Production alert routing still needs live acknowledgement by the private owner
  route.
- Production remains behind Vercel deployment protection; this is acceptable for
  pre-launch verification but is not a public launch state.
- No full live authenticated browser journey with a real Supabase production
  test user was run in this task.

## Recommended Next Step

Complete the remaining production operations gates:

1. Confirm production backup retention and complete a restore rehearsal into a
   non-production restore target.
2. Configure and acknowledge production alert routing.
3. Run a controlled live production authenticated smoke test with a synthetic
   production user.
4. Decide whether to keep Vercel protection enabled for private pre-launch use
   or prepare a public launch cutover plan.
