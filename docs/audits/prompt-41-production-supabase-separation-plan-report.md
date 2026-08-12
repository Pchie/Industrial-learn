# Prompt 41 Production Supabase Separation Plan Report

Date: 2026-08-12

## Executive Verdict

PASS for documentation readiness.

NO-GO for production Supabase creation, migration, or launch.

The production Supabase separation plan now exists, but it intentionally does
not configure a production project or move real data. Production remains blocked
until the plan's evidence gates are completed.

## Scope

This prompt continued the recommended safe production-readiness work after
Prompt 40. The task was documentation-only.

No production Supabase project was created, no migrations were run, no Supabase
settings were changed, no production deployment was triggered, and no secrets
were printed or committed.

## Files Created

- `docs/deployment/production-supabase-separation-plan.md`
- `docs/audits/prompt-41-production-supabase-separation-plan-report.md`

## Evidence Inspected

- `docs/audits/prompt-39-production-readiness-gap-review.md`
- `docs/audits/prompt-40-development-branch-protection-report.md`
- `docs/architecture/database-design.md`
- `docs/deployment/environment-strategy.md`
- `docs/deployment/database-migration-runbook.md`
- `docs/deployment/backup-and-restore-plan.md`
- `docs/deployment/production-release-checklist.md`
- `docs/deployment/staging-migration-record.md`
- `docs/security/supabase-staging-security.md`
- `docs/security/staging-rls-verification.md`
- `docs/audits/prompt-33c-live-rls-results.md`

## Plan Coverage

The new production plan defines:

- Required production project boundary.
- Production environment variable boundaries.
- Authentication redirect policy.
- Migration approval process.
- Production RLS verification gates.
- Backup and restore prerequisites.
- Production seed-data restrictions.
- Go/no-go evidence checklist.

## Key Decisions

- Production must use a dedicated Supabase project separate from staging.
- Production credentials must live only in provider secret storage.
- Production migration history must be traceable through version-controlled
  migrations.
- The Prompt 33c staging caveat, where live SQL was present but migration
  tracking was empty, must not be repeated in production.
- Production RLS must be verified with synthetic or approved test users before
  launch.
- Production remains blocked until backup and restore evidence exists.

## Remaining Risks

- No production Supabase project has been created or verified.
- No production environment variables have been configured.
- No production auth redirect allowlist has been reviewed live.
- No production migration tracking evidence exists.
- No production backup or restore drill has been completed.
- No production RLS verification has been run.
- No production release approver, incident owner, or rollback owner has been
  named.

## Recommended Next Prompt

Prepare the production backup and restore rehearsal plan without creating a
production database or copying real data. Define the restore target, test data
rules, backup schedule evidence, restore procedure, RLS-after-restore checks,
privacy constraints, owners, timing targets, and go/no-go report template.
