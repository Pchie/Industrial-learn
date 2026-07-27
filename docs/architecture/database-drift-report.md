# Database Drift Report

Date: 2026-07-27

## Scope

This report compares the repository migration and policy plan with the currently available staging evidence.

## Staging Connection Status

No live staging database connection was available from this workstation:

- `SUPABASE_DB_URL` is blank in the ignored local staging env file.
- `SUPABASE_SERVICE_ROLE_KEY` is blank in the ignored local staging env file.
- `psql` is not installed.
- Supabase CLI is not installed.

Therefore live schema drift, policy drift, grant drift, and index drift cannot be truthfully confirmed yet.

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
| Live staging schema drift                                                        | Unknown until DB connection is available.                                                                      |
| Unexpected grants                                                                | Unknown until DB connection is available.                                                                      |
| Missing indexes under real workload                                              | Unknown until live query plans are inspected.                                                                  |

## Required Drift Queries

When connected to staging, compare:

- `information_schema.tables`
- `information_schema.columns`
- `pg_constraint`
- `pg_indexes`
- `pg_policies`
- `pg_class.relrowsecurity`
- `information_schema.role_table_grants`
- `pg_proc` for `security definer` functions and `search_path`

Do not run these against production.
