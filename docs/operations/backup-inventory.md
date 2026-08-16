# Staging Backup Inventory

Date prepared: 2026-08-16
Date exercised: 2026-08-16

## Purpose

This inventory prepares the controlled Prompt 38 staging backup and restore
rehearsal. It identifies what must be backed up and what evidence must be
captured during the live rehearsal.

The live rehearsal results are recorded in
`docs/operations/restore-rehearsal-results.md` and
`docs/audits/prompt-38-backup-restore-report.md`.

## Source IDs

- IL-AGENTS-001: `AGENTS.md`
- IL-BACKUP-001: `docs/deployment/backup-and-restore-plan.md`
- IL-MIGRATION-001: `docs/deployment/database-migration-runbook.md`
- IL-ROLLBACK-001: `docs/deployment/rollback-runbook.md`
- IL-STAGING-SETUP-001: `docs/deployment/supabase-staging-setup.md`
- IL-P33-STAGING-DB-001: `docs/audits/prompt-33-staging-database-report.md`
- IL-P37-MONITORING-001: `docs/audits/prompt-37-monitoring-report.md`

## Staging Environment Boundary

| Item          | Value                                                         |
| ------------- | ------------------------------------------------------------- |
| Environment   | Dedicated Supabase staging                                    |
| Project ref   | `lgjujyaclrpaopdabyzg`                                        |
| Project URL   | `https://lgjujyaclrpaopdabyzg.supabase.co`                    |
| Production    | Must not be touched                                           |
| Data type     | Synthetic or approved staging test data only                  |
| Secret source | Ignored local operator environment or approved secret manager |

The project reference and public URL are not credentials. Do not record database
URLs, service-role keys, access tokens, refresh tokens, or passwords in this
inventory.

## Backup Scope

| Category                         | Include in rehearsal | Notes                                                                                            |
| -------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------ |
| PostgreSQL schema                | Yes                  | Tables, constraints, indexes, triggers, functions, and extensions used by app tables.            |
| Version-controlled migrations    | Yes                  | Compare restored state against `database/migrations/`.                                           |
| Version-controlled policies      | Yes                  | Compare restored state against `database/policies/`.                                             |
| Role and permission seed records | Yes                  | Verify platform roles and permissions from `database/seed/0001_roles_permissions.sql`.           |
| Synthetic profiles               | Yes                  | Verify staging-only profile records where present.                                               |
| Enrolments                       | Yes                  | Verify one programme enrolment where fixture exists or create one for rehearsal.                 |
| Lesson progress                  | Yes                  | Verify ownership and relationships.                                                              |
| Assessment attempts              | Yes                  | Verify attempt ownership, content version linkage, and hidden-answer protection.                 |
| Simulation attempts              | Yes                  | Verify attempt ownership, mode, score, and competency linkage.                                   |
| Content versions                 | Yes                  | Verify version-to-content relationships.                                                         |
| Review records                   | Yes                  | Verify reviewer evidence and visibility boundaries.                                              |
| Audit events                     | Yes                  | Verify audit records survive restore.                                                            |
| Supabase Auth users              | Separate strategy    | Supabase-managed auth data may require provider-specific export or recreation.                   |
| Supabase Storage metadata        | Conditional          | Storage is currently deferred; verify no required storage buckets are in use.                    |
| Supabase Storage objects         | Conditional          | Include only if live staging confirms storage is used.                                           |
| Provider dashboard configuration | Separate strategy    | Auth URLs, email settings, rate limits, and project settings are not fully covered by SQL dumps. |

## Expected Repository Database Inputs

Migrations:

- `database/migrations/0001_initial_schema.sql`
- `database/migrations/0002_dashboard_student_preferences.sql`
- `database/migrations/0003_attempt_persistence_metadata.sql`
- `database/migrations/0004_content_governance_persistence.sql`
- `database/migrations/0005_restrict_unapproved_content_visibility.sql`
- `database/migrations/0006_restrict_author_self_approval.sql`
- `database/migrations/0007_atomic_assessment_completion.sql`
- `database/migrations/0008_atomic_simulation_completion.sql`
- `database/migrations/0009_staging_hydraulic_simulation_fixture.sql`

Policies:

- `database/policies/0001_row_level_security.sql`
- `database/policies/0002_dashboard_student_preferences.sql`
- `database/policies/0004_content_governance_persistence.sql`
- `database/policies/0005_staging_rls_hardening.sql`

Seed files:

- `database/seed/0001_roles_permissions.sql`
- `database/seed/0002_staging_synthetic_profiles.template.sql`

## Baseline Dataset Checklist

Before creating the backup, confirm or create controlled synthetic records for:

| Fixture              | Live rehearsal status                                      |
| -------------------- | ---------------------------------------------------------- |
| Student A            | Verified                                                   |
| Student B            | Verified                                                   |
| Lecturer             | Verified                                                   |
| Content author       | Verified                                                   |
| Engineering reviewer | Verified                                                   |
| Programme enrolment  | Verified                                                   |
| Lesson progress      | Verified                                                   |
| Assessment attempt   | Verified                                                   |
| Simulation attempt   | Verified                                                   |
| Content draft        | Verified through draft/unapproved lesson visibility checks |
| Content version      | Verified                                                   |
| Review record        | Verified                                                   |
| Audit event          | Verified                                                   |

Record only non-sensitive identifiers such as UUIDs, slugs, migration names,
counts, and timestamps. Do not record passwords, tokens, or private answers.

## Evidence To Capture During Prompt 38

| Evidence item             | Required |
| ------------------------- | -------- |
| Backup timestamp          | Yes      |
| Database version          | Yes      |
| Migration state           | Yes      |
| Application commit        | Yes      |
| Backup method             | Yes      |
| Backup size               | Yes      |
| Encryption status         | Yes      |
| Storage location category | Yes      |
| Retention decision        | Yes      |
| Operator                  | Yes      |
| Restore target            | Yes      |
| Restore start time        | Yes      |
| Restore end time          | Yes      |
| RPO achieved              | Yes      |
| RTO achieved              | Yes      |
| RLS-after-restore result  | Yes      |
| App compatibility result  | Yes      |
| Cleanup result            | Yes      |

## Current Verdict

PROMPT 38 POSTGRESQL BACKUP/RESTORE REHEARSAL COMPLETED WITH CAVEATS.

The inventory was exercised during the 2026-08-16 staging restore rehearsal.
Remaining caveats are recorded in
`docs/audits/prompt-38-backup-restore-report.md`.
