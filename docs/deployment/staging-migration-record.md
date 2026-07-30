# Staging Migration Record

Date: 2026-07-30

## Target

| Item               | Value                                      |
| ------------------ | ------------------------------------------ |
| Environment        | Dedicated Supabase staging                 |
| Project reference  | `lgjujyaclrpaopdabyzg`                     |
| Project URL        | `https://lgjujyaclrpaopdabyzg.supabase.co` |
| Production touched | No                                         |

## Execution Status

Live migration application was completed against the dedicated Supabase staging
project using the ignored local staging environment file.

No production database was contacted. No real credentials were printed or
committed.

## Migration Order

| Order | File                                                          | Pre-review result                                                             |
| ----- | ------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 1     | `database/migrations/0001_initial_schema.sql`                 | Creates initial schema, helper functions, indexes, triggers, and enables RLS. |
| 2     | `database/migrations/0002_dashboard_student_preferences.sql`  | Additive dashboard preference tables.                                         |
| 3     | `database/migrations/0003_attempt_persistence_metadata.sql`   | Additive attempt metadata columns and idempotency indexes.                    |
| 4     | `database/migrations/0004_content_governance_persistence.sql` | Additive governance table and governance metadata.                            |

No numbering gaps were found in migration files.

## Policy Order

| Order | File                                                        | Pre-review result                                                                        |
| ----- | ----------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 1     | `database/policies/0001_row_level_security.sql`             | Baseline RLS policies. Requires hardening for answer choices and attempt write scope.    |
| 2     | `database/policies/0002_dashboard_student_preferences.sql`  | Dashboard preference RLS.                                                                |
| 3     | `database/policies/0004_content_governance_persistence.sql` | Governance RLS. Numbering gap exists because no 0003 policy file was previously created. |
| 4     | `database/policies/0005_staging_rls_hardening.sql`          | Corrective policy file added for staging verification.                                   |

The policy numbering gap at `0003` is documented. The `0003` schema migration adds columns to already RLS-protected tables, so a same-number policy file is not required for those columns. A later corrective `0005` policy file hardens discovered policy defects without editing historical files.

## Pre-Migration Review

| Check                              | Result                                                                                                                                                               |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Numbering gaps                     | Migrations: none. Policies: missing `0003`, documented above.                                                                                                        |
| Duplicate object creation          | Historical policy files use plain `create policy`; apply once to a clean staging database. Corrective file uses `drop policy if exists` before replacement policies. |
| Destructive SQL                    | No table drops found. Corrective policy file drops policies only, not data objects.                                                                                  |
| Table rewrites                     | `0003` adds `not null default` columns; PostgreSQL version should be confirmed before applying to large shared tables. Staging has no production data.               |
| Missing indexes                    | Attempt idempotency and lookup indexes exist. Further performance tuning requires live query evidence.                                                               |
| Unsafe grants                      | No broad grants were added in repository SQL.                                                                                                                        |
| Security-definer functions         | Present in helper role/cohort functions and include `set search_path = public`.                                                                                      |
| Mutable/client-controlled policies | Student ownership policies use `auth.uid()`. Corrective policies prevent direct student writes to scored attempt tables.                                             |
| New-column access-control gap      | `0003` columns are covered by table-level RLS, but direct student write policies were too broad and are hardened in `0005`.                                          |

## Application Record

| File                                      | Started    | Completed  | Result                |
| ----------------------------------------- | ---------- | ---------- | --------------------- |
| `0001_initial_schema.sql`                 | 2026-07-30 | 2026-07-30 | Applied successfully. |
| `0002_dashboard_student_preferences.sql`  | 2026-07-30 | 2026-07-30 | Applied successfully. |
| `0003_attempt_persistence_metadata.sql`   | 2026-07-30 | 2026-07-30 | Applied successfully. |
| `0004_content_governance_persistence.sql` | 2026-07-30 | 2026-07-30 | Applied successfully. |
| `0001_row_level_security.sql`             | 2026-07-30 | 2026-07-30 | Applied successfully. |
| `0002_dashboard_student_preferences.sql`  | 2026-07-30 | 2026-07-30 | Applied successfully. |
| `0004_content_governance_persistence.sql` | 2026-07-30 | 2026-07-30 | Applied successfully. |
| `0005_staging_rls_hardening.sql`          | 2026-07-30 | 2026-07-30 | Applied successfully. |

## Seed Record

| File                                       | Started    | Completed  | Result                |
| ------------------------------------------ | ---------- | ---------- | --------------------- |
| `database/seed/0001_roles_permissions.sql` | 2026-07-30 | 2026-07-30 | Applied successfully. |

Synthetic staging-only auth users and a minimal RLS verification fixture were
created after the service-role key was corrected. Generated passwords and access
tokens were held in memory only and were not printed or committed.

## Post-Application Verification

| Check                           | Result                                                  |
| ------------------------------- | ------------------------------------------------------- |
| Required schema tables          | Passed; no expected tables missing.                     |
| RLS enabled on protected tables | Passed; no expected RLS tables disabled.                |
| Policy count                    | Passed; 80 policies found.                              |
| Unsafe answer-choice policy     | Passed; old broad policy absent.                        |
| Hardened answer-choice policy   | Passed; content-staff-only read policy present.         |
| Unsafe attempt policy           | Passed; old broad attempt policies absent.              |
| Hardened attempt policy         | Passed; student read-only replacement policies present. |
| Attempt metadata indexes        | Passed; 4 attempt indexes found.                        |
| Role seed count                 | Passed; 5 roles seeded.                                 |

## Operator Command Path Used

Secure values were supplied outside Git in `.env.staging.local`:

```bash
STAGING_ENV_FILE=.env.staging.local npm run validate:staging-env
```

Migrations and policies were applied with `psql` using the staging database URL.
The database URL and service-role key were never printed.
