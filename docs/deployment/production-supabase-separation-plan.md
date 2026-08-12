# Production Supabase Separation Plan

Date: 2026-08-12

## Purpose

This plan defines the required boundary for a future Industrial Learn production
Supabase environment. It is a planning document only. It does not create a
production Supabase project, run migrations, seed data, configure production
authentication, or deploy production.

## Source IDs

- IL-AGENTS-001: `AGENTS.md`
- IL-DB-001: `docs/architecture/database-design.md`
- IL-DEPLOY-ENV-001: `docs/deployment/environment-strategy.md`
- IL-MIGRATION-001: `docs/deployment/database-migration-runbook.md`
- IL-BACKUP-001: `docs/deployment/backup-and-restore-plan.md`
- IL-STAGING-RLS-001: `docs/security/staging-rls-verification.md`
- IL-P33C-RLS-001: `docs/audits/prompt-33c-live-rls-results.md`
- IL-P39-PROD-GAP-001:
  `docs/audits/prompt-39-production-readiness-gap-review.md`

## Non-Negotiable Boundary

Production must use a dedicated Supabase project that is separate from:

- Local development.
- Automated test databases.
- The live staging project.
- Personal experiments.
- Preview-only fixtures.

Production student data must never be copied into development or staging. Staging
data must never be promoted as production seed data.

## Required Production Project Boundary

Before production launch, record:

| Item                   | Required evidence                                      |
| ---------------------- | ------------------------------------------------------ |
| Production project ref | Recorded in a private release record, not public docs. |
| Region                 | Selected intentionally for expected users and policy.  |
| PostgreSQL version     | Confirmed compatible with repository migrations.       |
| Project owner          | Named accountable Supabase owner.                      |
| Emergency owner        | Named backup owner with MFA-protected access.          |
| Billing/plan           | Supports required backup and restore expectations.     |
| Staging separation     | Verified project ref differs from staging.             |
| Production data policy | Approved before real student records are created.      |

Do not record production database URLs, service-role keys, access tokens,
passwords, or private connection strings in Git.

## Environment Variables

Production values must be stored only in the selected provider secret manager.

| Variable                        | Exposure boundary                | Production rule                                     |
| ------------------------------- | -------------------------------- | --------------------------------------------------- |
| `NODE_ENV`                      | Runtime                          | `production`                                        |
| `NEXT_PUBLIC_APP_ENV`           | Browser-safe label               | `production`                                        |
| `APP_BASE_URL`                  | Server runtime                   | Production HTTPS application URL only               |
| `NEXT_PUBLIC_SUPABASE_URL`      | Browser-safe public value        | Production Supabase URL only                        |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser-safe public value        | Production anon key only; constrained by RLS        |
| `SUPABASE_SERVICE_ROLE_KEY`     | Server-only secret               | Trusted server contexts only; never browser-exposed |
| `SUPABASE_PROJECT_REF`          | Server/deployment metadata       | Production project ref only                         |
| `SUPABASE_DB_URL`               | Server-only migration credential | Release/migration context only                      |
| `INDUSTRIAL_LEARN_AUTH_MODE`    | Server runtime control           | Must be `supabase`; must not be `local`             |
| `INDUSTRIAL_LEARN_E2E`          | Test runtime control             | Must be unset                                       |

Production preview deployments must not receive production service-role or
database migration credentials by default.

## Authentication Redirect Policy

Production Supabase Auth must be configured before launch with:

- Site URL set to the canonical production HTTPS application URL.
- Redirect allowlist limited to approved production auth routes.
- Password reset redirects limited to approved production routes.
- Localhost, staging, branch-preview, and development URLs excluded from
  production redirect allowlists unless there is a temporary, documented
  emergency exception.
- Email confirmation enabled unless a future reviewed policy changes it.
- Anonymous sign-in disabled.
- Social providers disabled until a reviewed product and security decision
  approves them.
- Refresh-token rotation and bounded session lifetime reviewed and recorded.
- Rate limits and bot protection reviewed for the selected Supabase plan.

## Migration Approval Process

Production database changes must follow this sequence:

1. Confirm all migrations and policies are version-controlled.
2. Confirm historical migrations are not edited.
3. Run repository migration validation.
4. Run unit and integration tests.
5. Confirm staging migration success.
6. Confirm staging RLS behavior success.
7. Confirm production backup status.
8. Obtain named release approval.
9. Apply migrations during the approved production release window.
10. Verify production migration tracking.
11. Run production-safe RLS verification.
12. Continue to application deployment only after database compatibility is
    confirmed.

The Prompt 33c staging caveat must be corrected before production: production
must not rely only on manual SQL application with empty migration tracking.

## Production RLS Verification Gates

Production launch requires production-safe verification that:

- Student A cannot read Student B private records.
- Student A cannot submit or modify Student B assessment or simulation attempts.
- Students cannot alter server-calculated scores, competency awards, or content
  versions.
- Hidden assessment answers remain hidden before permitted review.
- Draft, unpublished, and unapproved content is hidden from students.
- Approved published content is visible to students.
- Content versions and review records remain hidden from students.
- Content authors cannot self-approve their own content unless an approved
  policy explicitly permits it.
- Engineering reviewers do not automatically receive private student-data
  access.
- Service-role access is used only through trusted server-side contexts.

Production verification must use synthetic or approved test users. Do not print
passwords, access tokens, refresh tokens, service-role keys, or private answers.

## Backup Requirements

Before production receives real student data:

- Confirm automated production backups are enabled.
- Confirm backup retention meets the MVP privacy and recovery policy.
- Record recovery point and recovery time expectations.
- Confirm pre-migration backup procedure.
- Complete a restore drill into a non-production restore target.
- Verify RLS after restore.
- Confirm restored data is not copied into development or staging.

## Seed-Data Restrictions

Production seed operations may include:

- Roles.
- Permissions.
- Required platform metadata.

Production seed operations must not include:

- Staging users.
- Test passwords.
- Synthetic student assessment attempts.
- Synthetic simulation attempts.
- Draft technical content labelled as approved.
- Unreviewed source or knowledge records.
- Hidden answer fixtures.

Production content must be published only through the approved content-review
workflow.

## Go / No-Go Evidence Checklist

| Gate                         | Required evidence before production |
| ---------------------------- | ----------------------------------- |
| Dedicated production project | Project boundary recorded privately |
| Environment variables        | Provider secret-manager review      |
| Auth redirects               | Production-only allowlist evidence  |
| Migration tracking           | Production migration history proof  |
| RLS verification             | Production-safe test report         |
| Backup enabled               | Provider backup evidence            |
| Restore drill                | Restore report and RLS check        |
| Seed-data review             | Approved production seed list       |
| Service-role boundary        | Server-only configuration evidence  |
| Release approval             | Named approver and release record   |
| Rollback readiness           | Named rollback target and owner     |

Production remains NO-GO until every gate is complete.
