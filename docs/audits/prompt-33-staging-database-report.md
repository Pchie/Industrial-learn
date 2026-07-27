# Prompt 33 Staging Database Report

Date: 2026-07-27

## Executive Verdict

BLOCKED FOR LIVE APPLICATION

Repository pre-migration review, corrective RLS hardening, local schema-policy tests, and documentation were completed. Live application to the Supabase staging project was not performed because secure staging database credentials are not present locally and no approved SQL execution tool is installed in this environment.

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

Migrations were not applied live from this workstation.

## Policies Reviewed

- `database/policies/0001_row_level_security.sql`
- `database/policies/0002_dashboard_student_preferences.sql`
- `database/policies/0004_content_governance_persistence.sql`
- `database/policies/0005_staging_rls_hardening.sql`

Policies were not applied live from this workstation.

## Corrective Policy Change

Added `database/policies/0005_staging_rls_hardening.sql`.

Reason:

- `answer_choices` contains `is_correct` and `feedback`; the previous student-readable policy could expose hidden answers.
- `assessment_attempts` and `simulation_attempts` had broad student `for all` policies; direct student writes could conflict with server-calculated score and competency rules.

The new policy file drops the unsafe policies and replaces them with safer read-only student access plus content-staff answer-choice access.

## RLS Test Results

Local repository validation passed. Live RLS tests are pending.

Required live tests are documented in `docs/security/staging-rls-verification.md` and scaffolded in `packages/database/src/staging-database.integration.test.ts`.

## Drift Findings

Live drift is unknown until a secure staging DB connection is available. Repository-level drift findings:

- no migration numbering gaps
- policy numbering gap at `0003`, documented
- hidden-answer policy gap corrected in `0005`
- broad attempt-write policy gap corrected in `0005`

## Commands Run

| Command                                                                        | Result                                                                                                    |
| ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `npm run scan:secrets`                                                         | Passed; no obvious committed secret values found.                                                         |
| `npm run format:check`                                                         | Passed; all matched files use Prettier style.                                                             |
| `npm run validate:staging-env` with synthetic non-secret staging-shaped values | Passed; no secret values printed.                                                                         |
| `npm run validate:content`                                                     | Passed; 1 test file and 7 tests passed.                                                                   |
| `npm run validate:migrations`                                                  | Passed; 1 test file and 8 tests passed.                                                                   |
| `npx vitest run packages/database/src/staging-database.integration.test.ts`    | Passed as skipped; live tests require `RUN_STAGING_DB_INTEGRATION=true` and secure staging tokens.        |
| `npm run typecheck`                                                            | Passed across all configured workspaces.                                                                  |
| `npm run lint`                                                                 | Passed.                                                                                                   |
| `npm run test:unit`                                                            | Passed; 16 test files passed, 1 staging integration file skipped, 148 tests passed, 4 live tests skipped. |
| `npm run build`                                                                | Passed on Next.js 16.2.12.                                                                                |

## Live Application Blocker

Live migration and RLS verification require all of the following:

- secure `SUPABASE_DB_URL`
- secure `SUPABASE_SERVICE_ROLE_KEY`
- staging anon key
- approved SQL execution tooling such as `psql` or Supabase CLI
- synthetic staging auth users and access tokens

At review time, the ignored local staging env file still had blank secret fields and this workstation had no `psql` or Supabase CLI available.

## Remaining Database Risks

- Live migrations and policies still need to be applied to staging.
- Live schema/policy/grant/index drift still needs verification.
- Synthetic staging auth users and access tokens still need to be created securely.
- Live RLS integration tests still need to run against staging.
- Performance review requires live query plans and realistic staging data volume.

## Prompt 34 Readiness

Prompt 34 must not proceed as a live staging-dependent task until Prompt 33 live application and verification are completed by an operator with secure Supabase credentials and approved SQL tooling.
