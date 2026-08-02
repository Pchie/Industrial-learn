# Prompt 35 Supabase Staging Migration Continuation Report

Date: 2026-08-02

## Executive Verdict

PASS

The dedicated Supabase staging database remains aligned with the repository
migration and policy set after the deployed Supabase authentication fix. No
production database was contacted, no historical migrations were reapplied, and
no secret values were printed or committed.

## Scope

This was a staging migration verification continuation. It did not change
application features, curriculum content, engineering equations, database
schemas, or migration SQL.

## Target

| Item               | Value                                      |
| ------------------ | ------------------------------------------ |
| Environment        | Dedicated Supabase staging                 |
| Project reference  | `lgjujyaclrpaopdabyzg`                     |
| Project URL        | `https://lgjujyaclrpaopdabyzg.supabase.co` |
| Production touched | No                                         |

## Current Implementation Summary

The repository contains four schema migrations, four policy files, and two seed
files. Existing records show that the staging database was migrated and hardened
on 2026-07-30. Because the baseline migrations contain non-idempotent object
creation, this continuation verified the live database rather than blindly
reapplying historical files.

## Files Changed

- `docs/architecture/database-drift-report.md`
- `docs/deployment/staging-migration-record.md`
- `docs/audits/prompt-35-supabase-staging-migration-continuation-report.md`

## Commands Executed

| Command                                                            | Result                                                                                      |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| `STAGING_ENV_FILE=.env.staging.local npm run validate:staging-env` | Passed.                                                                                     |
| Live PostgreSQL drift check through `psql`                         | Passed after network escalation; no credentials printed.                                    |
| Live attempt-index inspection through `psql`                       | Passed; repository-defined attempt/idempotency indexes present.                             |
| Live authenticated RLS integration test                            | Passed; 1 test file and 4 tests passed.                                                     |
| Live grant and security-definer function inspection                | Passed for staging; no `PUBLIC` table grants and no insecure security-definer owners found. |
| Live direct attempt-write denial check                             | Passed; anonymous requests denied and student direct writes forbidden.                      |

## Live Drift Results

| Check                                          | Result                                   |
| ---------------------------------------------- | ---------------------------------------- |
| Required tables                                | Passed; no expected tables missing.      |
| RLS enabled                                    | Passed; no expected RLS tables disabled. |
| Public policy count                            | Passed; 80 policies found.               |
| Old answer-choice policy                       | Passed; absent.                          |
| Hardened answer-choice policy                  | Passed; present.                         |
| Old assessment attempt broad policy            | Passed; absent.                          |
| Hardened assessment attempt self-select policy | Passed; present.                         |
| Old simulation attempt broad policy            | Passed; absent.                          |
| Hardened simulation attempt self-select policy | Passed; present.                         |
| Required roles                                 | Passed; 5 required roles found.          |

## Attempt Index Verification

The earlier migration record described four attempt metadata indexes. Live
inspection shows the repository-defined indexes are present under their actual
migration names:

- `assessment_attempts_student_assessment_attempt_number_unique`
- `assessment_attempts_student_assessment_idempotency_unique`
- `simulation_attempts_student_simulation_idempotency_unique`
- `simulation_attempts_lesson_id_idx`

Existing lookup and primary-key indexes are also present on both attempt tables.

## RLS Verification

Live authenticated integration tests passed using synthetic staging users and
in-memory access tokens:

- Anonymous private table reads are denied or return no rows.
- Student A can read their own profile.
- Student A cannot read Student B's profile.
- Student reads do not expose answer-choice correctness.

Additional direct write checks passed:

- Anonymous assessment attempt insert: denied.
- Student assessment attempt insert: forbidden.
- Anonymous simulation attempt insert: denied.
- Student simulation attempt insert: forbidden.

## Grant And Function Review

The live staging database has no `PUBLIC` table grants. Supabase REST roles have
table grants as expected for Supabase projects, so row-level security remains
the enforcement boundary. Direct write checks prove that server-scored attempt
tables are still protected.

Security-definer helper functions inspected in `public` are owned by `postgres`,
and no insecure security-definer owners were found in the checked helper set.

## Remaining Limitations

- These results apply to the dedicated staging project only.
- Production migration remains blocked until a production change window,
  production backup, and explicit approval exist.
- Performance tuning still needs realistic staging data volume and query plans.
- Staging synthetic users must remain staging-only.

## Recommended Next Prompt

Run a full staging release-candidate verification covering deployed routes,
authenticated dashboard ownership, reviewer access, content governance access,
assessment/simulation persistence boundaries, smoke tests, and final production
readiness status.
