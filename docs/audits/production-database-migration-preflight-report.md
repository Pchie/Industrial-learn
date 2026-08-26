# Production Database Migration Preflight Report

Date: 2026-08-20

## Executive Verdict

CONDITIONAL PASS for production migration preflight.

NO-GO for applying production migrations in this run.

The repository migration set validates locally and the production Supabase
project is visible through the Supabase CLI. Production migrations were not
applied because the required production database URL or database password was
not available through an approved local/operator path.

## Scope

Completed:

- Confirmed the repository was clean before preflight work.
- Read the production release, Supabase separation, and database migration
  runbooks.
- Confirmed Supabase CLI access can see the dedicated production project.
- Confirmed the local Supabase link still points to staging, not production.
- Confirmed production Vercel runtime variables do not include
  `SUPABASE_DB_URL`.
- Reviewed migration files for production suitability.
- Ran local migration validation and focused database tests.

Not completed:

- No production database migration was applied.
- No production migration history was changed.
- No production RLS verification was run.
- No production seed data was applied.
- No database URL, password, service-role key, token, or private owner contact
  was printed or committed.

## Production Project Boundary

| Check                               | Result                        |
| ----------------------------------- | ----------------------------- |
| Production Supabase project visible | Passed                        |
| Production project ref              | `vhjjfapkxytmaakbleee`        |
| Production project name             | `Industrial-learn Production` |
| Production region                   | `eu-west-2`                   |
| Production PostgreSQL version       | `17.6.1.155`                  |
| Staging project ref                 | `lgjujyaclrpaopdabyzg`        |
| CLI linked project                  | Staging only                  |
| Production DB credential available  | No                            |

## Production Migration Set

The production candidate migration set is:

1. `database/migrations/0001_initial_schema.sql`
2. `database/migrations/0002_dashboard_student_preferences.sql`
3. `database/migrations/0003_attempt_persistence_metadata.sql`
4. `database/migrations/0004_content_governance_persistence.sql`
5. `database/migrations/0005_restrict_unapproved_content_visibility.sql`
6. `database/migrations/0006_restrict_author_self_approval.sql`
7. `database/migrations/0007_atomic_assessment_completion.sql`
8. `database/migrations/0008_atomic_simulation_completion.sql`
9. `database/policies/0001_row_level_security.sql`
10. `database/policies/0002_dashboard_student_preferences.sql`
11. `database/policies/0004_content_governance_persistence.sql`
12. `database/policies/0005_staging_rls_hardening.sql`
13. `database/seed/0001_roles_permissions.sql`

Excluded from production migration execution:

- `database/migrations/0009_staging_hydraulic_simulation_fixture.sql`
- `database/seed/0002_staging_synthetic_profiles.template.sql`

Reason: both files are explicitly staging-oriented. Production seed restrictions
allow role and permission metadata, but not staging fixtures, synthetic users,
test attempts, hidden answer fixtures, or unreviewed content promotion.

## Preflight Results

| Command                       | Result                                                        |
| ----------------------------- | ------------------------------------------------------------- |
| `npm run scan:secrets`        | Passed                                                        |
| `npm run validate:migrations` | Passed; 1 test file and 13 tests                              |
| Focused database unit tests   | Passed; 3 files passed, 1 skipped; 40 tests passed, 4 skipped |

Focused database test command:

```bash
npm run test:unit -- --run packages/database/src/schema.test.ts packages/database/src/staging-database.integration.test.ts packages/database/src/attempt-persistence.test.ts packages/database/src/data-access.test.ts
```

## Blocking Condition

Production migration application requires one of these private operator inputs:

- a percent-encoded production `SUPABASE_DB_URL` for project
  `vhjjfapkxytmaakbleee`, or
- the production database password supplied directly to the Supabase CLI during
  `supabase link` or `supabase db push`.

The credential must not be committed, printed, pasted into chat, stored in
tracked documentation, or exposed to Vercel browser/runtime code. If a temporary
local file is used, it should be an ignored operator-only file such as
`.env.production.local`, removed after migration verification if no longer
needed.

## Safe Execution Plan For Next Run

1. Add the production database URL or password through a private operator path.
2. Re-run `npm run scan:secrets`.
3. Re-run `npm run validate:migrations`.
4. Build a temporary Supabase migration workspace that excludes the staging-only
   migration and staging synthetic seed.
5. Run `supabase migration list --db-url <production-db-url>` without printing
   the URL.
6. Run `supabase db push --dry-run --db-url <production-db-url>` and verify the
   pending migration list.
7. Apply production migrations only if the dry run matches the approved
   production migration set.
8. Apply only `database/seed/0001_roles_permissions.sql`.
9. Verify production migration tracking.
10. Run production-safe RLS verification with synthetic users.

## Remaining Risks

- Production migration history remains unverified.
- Production migrations remain unapplied.
- Production RLS remains unverified.
- Production backup retention and restore rehearsal remain required before real
  student data.
- Production alert routing still requires live acknowledgement.

## Recommended Next Step

Provide the production database migration credential through an ignored local
operator path, then run the safe execution plan above. Do not place the
credential in Git, chat, screenshots, or browser-exposed runtime settings.
