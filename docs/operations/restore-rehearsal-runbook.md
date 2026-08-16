# Staging Restore Rehearsal Runbook

Date prepared: 2026-08-16

## Purpose

This runbook defines the controlled staging backup and restore rehearsal for
Industrial Learn Prompt 38.

It continues from Prompt 37 monitoring readiness: restoration must verify both
data recovery and security behavior, while operational events and health checks
must remain privacy-safe.

## Source IDs

- IL-AGENTS-001: `AGENTS.md`
- IL-BACKUP-001: `docs/deployment/backup-and-restore-plan.md`
- IL-MIGRATION-001: `docs/deployment/database-migration-runbook.md`
- IL-ROLLBACK-001: `docs/deployment/rollback-runbook.md`
- IL-STAGING-SETUP-001: `docs/deployment/supabase-staging-setup.md`
- IL-P33-STAGING-DB-001: `docs/audits/prompt-33-staging-database-report.md`
- IL-P37-MONITORING-001: `docs/audits/prompt-37-monitoring-report.md`

## Safety Rules

- Do not touch production.
- Do not restore over the active staging database.
- Do not delete the only staging database copy.
- Do not print database URLs, service-role keys, access tokens, refresh tokens,
  passwords, or private assessment answers.
- Use an isolated restore target.
- Use synthetic or approved staging data only.
- Preserve the rehearsal report even if the restore fails.

## Restore Target Options

Use one approved isolated target:

1. Separate temporary Supabase project.
2. Separate temporary PostgreSQL database.
3. Approved isolated restoration environment.

The first rehearsal must not use the active staging project as the restore
target.

## Preflight

1. Confirm local Git is clean.
2. Confirm current branch and commit.
3. Confirm active staging project reference is `lgjujyaclrpaopdabyzg`.
4. Confirm secure operator environment exists outside Git.
5. Run staging environment validation without printing secret values.
6. Confirm backup inventory scope in `docs/operations/backup-inventory.md`.
7. Confirm restore target is isolated.
8. Confirm no production project reference or production credential is present.

## Baseline Dataset

Before backup, confirm or create synthetic staging records for:

- Student A.
- Student B.
- Lecturer.
- Content author.
- Engineering reviewer.
- One programme enrolment.
- Lesson progress.
- One assessment attempt.
- One simulation attempt.
- One content draft.
- One content version.
- One review record.
- One audit event.

Record non-sensitive identifiers only.

## Backup Procedure

1. Record backup start time.
2. Record database version.
3. Record migration state and policy state.
4. Record application commit.
5. Create the staging backup using the approved method.
6. Record backup end time.
7. Record backup size.
8. Record encryption status.
9. Record storage location category without exposing a secret path.
10. Record retention decision.

## Restore Procedure

1. Record restore target.
2. Record restore start time.
3. Restore into the isolated target.
4. Record restore end time.
5. Verify schema objects exist.
6. Verify tables, constraints, indexes, functions, triggers, grants, and RLS
   policies.
7. Verify role and permission records.
8. Verify synthetic profiles and relationships.
9. Verify lesson progress, assessment attempts, simulation attempts, content
   versions, review records, and audit events.
10. Verify any Supabase-managed components that require separate recovery.

## RLS After Restore

Run critical RLS checks against the restored target:

- Student A cannot read Student B private records.
- Lecturer cohort scope remains enforced.
- Engineering reviewer has no automatic student-data access.
- Content author has no automatic student-data access.
- Draft and unapproved content remains private.
- Hidden assessment data remains protected.
- Unauthenticated access remains limited.

Security restoration failure means the rehearsal fails, even if data restoration
succeeds.

## Application Compatibility

Point only a controlled local or temporary test environment at the restored
target. Do not change the active staging application permanently.

Verify:

- Approved test identity resolution.
- Dashboard reads restored student records.
- Assessment review reads restored completed attempt.
- Simulation history reads restored attempt.
- Reviewer reads restored content version.
- Public lessons remain accessible as expected.
- Prompt 37 health endpoints remain privacy-safe when pointed at the temporary
  target.

## Recovery Metrics

Record:

- Recovery point achieved.
- Recovery time achieved.
- Manual steps.
- Failed steps.
- Missing data.
- Security discrepancies.

Compare against the current documented staging restore expectation: restore
rehearsal required before first production release.

## Failure Scenario Notes

Document how the rehearsal evidence informs recovery from:

- Accidental data deletion.
- Failed migration.
- Broken RLS policy.
- Corrupt content publication.
- Incorrect engineering calculation release.
- Authentication configuration loss.
- Storage object loss.

Do not simulate destructive failures against active staging.

## Cleanup

After verification:

1. Confirm active staging was not modified by restore.
2. Remove temporary restore credentials from the local operator environment.
3. Remove or retain the temporary restore target according to the recorded
   policy.
4. Remove temporary test identities where appropriate.
5. Preserve approved backup evidence securely.
6. Preserve `docs/operations/restore-rehearsal-results.md`.
7. Preserve `docs/audits/prompt-38-backup-restore-report.md`.

## Completion Rule

Prompt 38 may be marked complete only when backup creation, isolated restore,
schema/data verification, RLS-after-restore, application compatibility,
RPO/RTO measurement, cleanup, and reporting are all complete.
