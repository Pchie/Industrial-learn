# Industrial Learn Database Migration Runbook

## Purpose

This runbook controls PostgreSQL schema and policy changes across environments.

## Source IDs

- IL-AGENTS-001: `AGENTS.md`
- IL-DB-001: `docs/architecture/database-design.md`
- IL-DATA-001: `docs/architecture/data-access-layer.md`

## Rules

- All database changes use version-controlled migrations.
- Historical migrations are immutable after use in a shared environment.
- New changes use a new additive migration.
- Policy changes are version controlled in `database/policies/`.
- Seed data must not run automatically in production.
- Production migrations are never applied from a developer laptop without release approval.

## Pre-Migration Checks

1. Confirm migration file naming is sequential.
2. Confirm the migration is additive where possible.
3. Confirm destructive changes have explicit approval and rollback planning.
4. Run `npm run validate:migrations`.
5. Run `npm run test:unit`.
6. Confirm RLS policy coverage for new private tables.
7. Confirm no service credentials appear in migration scripts.

## Staging Migration

1. Back up staging if the migration is risky.
2. Apply migrations to staging.
3. Apply policy files where the deployment process requires separate policy execution.
4. Run RLS verification tests.
5. Run staging smoke tests.
6. Record results in the staging checklist.

## Production Migration

1. Confirm staging migration success.
2. Confirm production release approval.
3. Confirm production backup status.
4. Apply migrations during the approved release window.
5. Stop deployment immediately if migration fails.
6. Verify RLS policies after migration.
7. Deploy the application only when database state is compatible with the release.

## Failure Handling

If a staging migration fails:

- Stop the release candidate.
- Preserve logs without secrets.
- Create a corrective migration or fix before retrying.

If a production migration fails:

- Stop application deployment.
- Notify the incident owner and release approver.
- Use the rollback runbook if the application was already deployed.
- Prefer a forward-fix migration when data has already changed.
- Restore from backup only after approval and impact assessment.

## RLS Verification

At minimum, verify:

- Student A cannot read Student B private records.
- Lecturers see only authorised cohorts.
- Reviewers do not automatically receive student-data access.
- Draft/unpublished content remains protected.
- Service-role access is limited to server-side administrative operations.
