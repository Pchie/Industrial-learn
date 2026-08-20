# Prompt 33 Staging Database Report

Date: 2026-07-30

## Executive Verdict

PASS FOR STAGING DATABASE FOUNDATION

Repository pre-migration review, corrective RLS hardening, live migration
application, seed application, live drift checks, and live authenticated RLS
verification were completed against the dedicated Supabase staging project.

No production database was contacted.

## Target Staging Project

| Item              | Value                                                         |
| ----------------- | ------------------------------------------------------------- |
| Project reference | `lgjujyaclrpaopdabyzg`                                        |
| Project URL       | `https://lgjujyaclrpaopdabyzg.supabase.co`                    |
| Dashboard URL     | `https://supabase.com/dashboard/project/lgjujyaclrpaopdabyzg` |

## Migrations Reviewed

- `database/migrations/0001_initial_schema.sql`
- `database/migrations/0002_dashboard_student_preferences.sql`
- `database/migrations/0003_attempt_persistence_metadata.sql`
- `database/migrations/0004_content_governance_persistence.sql`

Migrations were applied live from this workstation on 2026-07-30.

## Policies Reviewed

- `database/policies/0001_row_level_security.sql`
- `database/policies/0002_dashboard_student_preferences.sql`
- `database/policies/0004_content_governance_persistence.sql`
- `database/policies/0005_staging_rls_hardening.sql`

Policies were applied live from this workstation on 2026-07-30.

## Corrective Policy Change

Added `database/policies/0005_staging_rls_hardening.sql`.

Reason:

- `answer_choices` contains `is_correct` and `feedback`; the previous student-readable policy could expose hidden answers.
- `assessment_attempts` and `simulation_attempts` had broad student `for all` policies; direct student writes could conflict with server-calculated score and competency rules.

The new policy file drops the unsafe policies and replaces them with safer read-only student access plus content-staff answer-choice access.

## RLS Test Results

Local repository validation passed. Live authenticated RLS tests also passed.

Live staging test summary:

- Synthetic staging auth users prepared: 7.
- Minimal RLS verification fixture seeded.
- Live Supabase REST checks run: 19.
- Live Supabase REST checks passed: 19.
- Failed checks: 0.

Covered security behaviors:

- Student A can read own private records.
- Student A cannot read Student B private records.
- Authorized lecturer can read associated student attempts.
- Unrelated lecturer cannot read Student A attempts.
- Content author and engineering reviewer cannot read student private attempts by default.
- Anonymous caller cannot read assessment attempts.
- Hidden answer choices are not readable by students.
- Students cannot alter server-calculated assessment or simulation results.

Full details are documented in
`docs/security/staging-rls-verification.md`.

## Drift Findings

Live drift checks passed after migration and policy application:

- no expected tables missing
- no expected RLS-protected tables had RLS disabled
- 80 policies found
- hidden-answer policy gap corrected in staging
- broad attempt-write policy gap corrected in staging
- 4 attempt metadata indexes found
- 5 roles seeded

## Commands Run

| Command                                                                     | Result                                                                                                    |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `npm run scan:secrets`                                                      | Passed; no obvious committed secret values found.                                                         |
| `npm run format:check`                                                      | Passed; all matched files use Prettier style.                                                             |
| `STAGING_ENV_FILE=.env.staging.local npm run validate:staging-env`          | Passed; no secret values printed.                                                                         |
| Supabase Admin API service-role check                                       | Passed; service-role key accepted.                                                                        |
| Live migration and policy application through `psql`                        | Passed; all repository migrations, policies, and base role seed applied.                                  |
| Live staging drift verification                                             | Passed; expected tables, RLS state, policies, indexes, and role seed verified.                            |
| Live authenticated RLS verification                                         | Passed; 19 checks passed, 0 failed.                                                                       |
| `npm run validate:content`                                                  | Passed; 1 test file and 7 tests passed.                                                                   |
| `npm run validate:migrations`                                               | Passed; 1 test file and 8 tests passed.                                                                   |
| `npx vitest run packages/database/src/staging-database.integration.test.ts` | Passed as skipped; live tests require `RUN_STAGING_DB_INTEGRATION=true` and secure staging tokens.        |
| `npm run typecheck`                                                         | Passed across all configured workspaces.                                                                  |
| `npm run lint`                                                              | Passed.                                                                                                   |
| `npm run test:unit`                                                         | Passed; 16 test files passed, 1 staging integration file skipped, 148 tests passed, 4 live tests skipped. |
| `npm run build`                                                             | Passed on Next.js 16.2.12.                                                                                |
| `npm run test:smoke`                                                        | Passed; 5 Playwright smoke tests passed.                                                                  |
| `npm run test:e2e`                                                          | Passed; 61 Playwright tests passed after splitting authenticated accessibility scans into separate tests. |

## Remaining Database Risks

- Grant-level drift should be repeated before production using
  `information_schema.role_table_grants` and privileged function ownership
  checks.
- Content-governance self-approval remains an application-service rule and must
  be verified when the governance workflow is exercised against staging.
- Performance review requires live query plans and realistic staging data
  volume.
- Staging synthetic users should remain staging-only and must not be copied into
  production.

## Prompt 34 Readiness

Prompt 34 may proceed as a staging-dependent task if it stays pointed at the
dedicated staging project and continues to keep production isolated.
