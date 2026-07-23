# Industrial Learn Backup And Restore Plan

## Purpose

Backups protect student progress, assessment attempts, simulation attempts, review records, content metadata, and source governance records. A backup policy is incomplete until restore testing is proven.

## Source IDs

- IL-AGENTS-001: `AGENTS.md`
- IL-ARCH-DEPLOY-001: `docs/architecture/deployment-architecture.md`
- IL-DB-001: `docs/architecture/database-design.md`

## Database Backups

| Environment | Backup schedule                                                    | Retention                                          | Restore testing                           |
| ----------- | ------------------------------------------------------------------ | -------------------------------------------------- | ----------------------------------------- |
| Development | Optional developer export                                          | Developer-controlled                               | Not required                              |
| Staging     | Before risky migrations and before release rehearsals              | 7 to 14 days recommended                           | Before first production release           |
| Production  | Daily automated backup plus pre-migration backup for risky changes | 30 days minimum for MVP, subject to privacy policy | Quarterly and before first student launch |

## Ownership

- Engineering lead owns backup policy.
- Release owner confirms pre-release backup requirements.
- Database administrator or managed provider owner performs restore testing.
- Security reviewer confirms restored data is protected and not copied into lower environments.

## Restore Test Process

1. Select a non-production restore target.
2. Restore the chosen backup into the target.
3. Verify schema version and migration history.
4. Verify RLS policies are enabled.
5. Verify representative private student records remain protected.
6. Verify content review records and audit events are intact.
7. Record restore duration, issues, and corrective actions.

## Content Storage Backup

Object storage must use separated buckets or prefixes for:

- Public assets.
- Private source documents.
- Private student submissions.

Private storage restore tests must verify access-control metadata and signed-access behaviour.

## Recovery Objectives

| Objective                 | MVP target                                    |
| ------------------------- | --------------------------------------------- |
| Recovery point objective  | 24 hours for production database after launch |
| Recovery time objective   | 4 hours for production database after launch  |
| Staging restore readiness | Required before first production release      |

## Authentication Recovery Dependencies

Authentication recovery depends on the selected Supabase project backup/export capabilities and provider account access. Emergency access for production provider administration must be named before launch and protected with multi-factor authentication.
