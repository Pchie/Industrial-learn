# Production Backup And Restore Rehearsal Plan

Date: 2026-08-12

## Purpose

This plan defines the required rehearsal before Industrial Learn stores real
student data in production. It is a planning document only. It does not create a
production database, copy real data, run a restore, or change provider settings.

## Source IDs

- IL-AGENTS-001: `AGENTS.md`
- IL-DB-001: `docs/architecture/database-design.md`
- IL-BACKUP-001: `docs/deployment/backup-and-restore-plan.md`
- IL-MIGRATION-001: `docs/deployment/database-migration-runbook.md`
- IL-PROD-SUPABASE-001:
  `docs/deployment/production-supabase-separation-plan.md`

## Rehearsal Preconditions

Before a production restore rehearsal is attempted:

- A dedicated production Supabase project must exist.
- A non-production restore target must be selected.
- Restore target credentials must be kept outside Git.
- The test dataset must contain synthetic or approved test records only.
- No real student data may be copied into development or staging.
- The operator must confirm that logs will not print database URLs, passwords,
  access tokens, service-role keys, or private answers.

## Backup Schedule Evidence

Record the following in a private release record:

| Evidence item          | Required value before launch              |
| ---------------------- | ----------------------------------------- |
| Automated backup state | Enabled                                   |
| Retention period       | Meets MVP retention policy                |
| Pre-migration backup   | Available for risky production migrations |
| Backup owner           | Named person or accountable role          |
| Restore owner          | Named person or accountable role          |
| Provider plan          | Supports expected RPO and RTO             |
| RPO                    | 24 hours or better for MVP after launch   |
| RTO                    | 4 hours or better for MVP after launch    |

## Restore Rehearsal Procedure

1. Select a recent backup that contains only approved rehearsal data.
2. Restore into the selected non-production restore target.
3. Confirm the restored database is not connected to the production app.
4. Confirm migration history matches the expected version-controlled state.
5. Confirm row-level security is enabled on protected application tables.
6. Run representative RLS checks for private student records.
7. Verify content review records and audit events are present.
8. Verify hidden assessment answers remain protected.
9. Verify service-role access is restricted to trusted contexts.
10. Record restore duration, issues, corrective actions, and owner sign-off.

## RLS After Restore Checks

At minimum, verify after restore:

- Student A cannot read Student B progress, attempts, or submissions.
- Lecturers see only authorised students.
- Engineering reviewers do not automatically receive student-data access.
- Draft and unapproved content remains hidden from students.
- Hidden assessment answers remain unavailable before permitted review.
- Content review records remain unavailable to students.

## Privacy Constraints

Restore rehearsal records must not include:

- Database connection strings.
- Service-role keys.
- Access tokens or refresh tokens.
- Passwords.
- Private student answers.
- Sensitive project submission contents.
- Full source document bodies.

## Go / No-Go Template

```text
Restore rehearsal:
Date:
Production project:
Restore target:
Backup timestamp:
Operator:
Backup owner:
Restore owner:
RPO evidence:
RTO evidence:
Migration history verified:
RLS verified:
Hidden answers protected:
Private student data protected:
Issues found:
Corrective actions:
Production readiness verdict:
```

Production remains NO-GO until a restore rehearsal passes and the result is
recorded.
