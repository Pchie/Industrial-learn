# Database Drift Report

Date: 2026-07-30

Latest staging re-verification: 2026-08-02

Latest content RLS remediation: 2026-08-03

## Scope

This report compares the repository migration and policy plan with the currently available staging evidence.

## Staging Connection Status

A live connection to the dedicated Supabase staging project was verified using
the ignored local staging environment file. `psql` was available at
`/usr/local/opt/libpq/bin/psql`.

No production database was contacted. Secret values were not printed or
committed.

## Repository Baseline

Migrations:

- `0001_initial_schema.sql`
- `0002_dashboard_student_preferences.sql`
- `0003_attempt_persistence_metadata.sql`
- `0004_content_governance_persistence.sql`

Policies:

- `0001_row_level_security.sql`
- `0002_dashboard_student_preferences.sql`
- `0004_content_governance_persistence.sql`
- `0005_staging_rls_hardening.sql`

Seeds:

- `0001_roles_permissions.sql`
- `0002_staging_synthetic_profiles.template.sql`

## Known Repository Findings

| Finding                                                                          | Status                                                                                                         |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Policy numbering gap at `0003`                                                   | Documented; no same-number policy file required for `0003` columns, but corrective `0005` hardening was added. |
| Answer choices contained hidden correctness fields under student-readable policy | Corrected by `0005_staging_rls_hardening.sql`.                                                                 |
| Student attempt policies allowed broad row writes                                | Corrected by `0005_staging_rls_hardening.sql`.                                                                 |
| Live staging schema drift                                                        | No expected table drift found after applying repository migrations.                                            |
| Unexpected grants                                                                | No broad repository grants were introduced; deeper grant audit should be repeated before production.           |
| Missing indexes under real workload                                              | Attempt metadata indexes are present; workload-based tuning still requires realistic data volume.              |

## Live Drift Verification

Live checks compared:

- `information_schema.tables`
- `pg_indexes`
- `pg_policies`
- `pg_class.relrowsecurity`

| Check                                            | Result                                   |
| ------------------------------------------------ | ---------------------------------------- |
| Expected tables from repository migrations       | Passed; no expected tables missing.      |
| RLS enabled on protected tables                  | Passed; no expected RLS tables disabled. |
| Policy count                                     | Passed; 80 policies found.               |
| Old broad answer-choice read policy              | Passed; absent.                          |
| Hardened content-staff answer-choice policy      | Passed; present.                         |
| Old broad assessment/simulation attempt policies | Passed; absent.                          |
| Hardened student read-only attempt policies      | Passed; present.                         |
| Attempt lookup and idempotency indexes           | Passed; 4 indexes found.                 |
| Role seed data                                   | Passed; 5 roles found.                   |

## Remaining Drift Work

Staging grant-level checks were repeated on 2026-08-02. The live staging
database had no `PUBLIC` table grants, security-definer helper functions were
owned by `postgres`, and direct anonymous/student writes to server-scored attempt
tables were denied by live RLS.

Prompt 33b content-visibility drift was remediated on 2026-08-03 by applying:

- `database/migrations/0005_restrict_unapproved_content_visibility.sql`
- `database/migrations/0006_restrict_author_self_approval.sql`

The staging database now includes the
`public.is_student_visible_content(publication_status, content_status)` helper
and replacement content read policies that require published and approved status
for student-visible technical content. Direct author self-approval through RLS
was also restricted.

Before production promotion, repeat these checks against the production database
only inside an approved production change window. Do not copy staging synthetic
users or staging verification records into production.
