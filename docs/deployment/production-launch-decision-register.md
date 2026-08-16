# Production Launch Decision Register

Date: 2026-08-12

## Purpose

This register consolidates the production readiness decisions from Prompt 39
through Prompt 42. It is a go/no-go checklist for future production setup. It
does not approve production launch, deploy production, create production
Supabase resources, or store private owner contact details.

## Source IDs

- IL-AGENTS-001: `AGENTS.md`
- IL-P39-PROD-GAP-001:
  `docs/audits/prompt-39-production-readiness-gap-review.md`
- IL-P40-BRANCH-001:
  `docs/audits/prompt-40-development-branch-protection-report.md`
- IL-P41-SUPABASE-001:
  `docs/audits/prompt-41-production-supabase-separation-plan-report.md`
- IL-P42-OPS-001:
  `docs/audits/prompt-42-production-operations-readiness-plans-report.md`
- IL-PROD-SUPABASE-001:
  `docs/deployment/production-supabase-separation-plan.md`
- IL-PROD-BACKUP-001:
  `docs/deployment/production-backup-restore-rehearsal-plan.md`
- IL-PROD-MONITORING-001:
  `docs/operations/production-monitoring-decision-plan.md`
- IL-PROD-INCIDENT-001:
  `docs/deployment/production-incident-ownership-plan.md`
- IL-PROD-OWNER-TEMPLATE-001:
  `docs/deployment/production-owner-record-template.md`

## Current Launch Verdict

NO-GO for production launch.

CONDITIONAL GO for preparing production setup only.

The repository and staging branch controls are improved, and the required public
owner fields and environment decisions are now defined. Production launch
remains blocked because the dedicated production Supabase project, production
provider secrets, backup evidence, live production RLS verification, alert
routing, and private named owner record have not yet been created or verified.

## Decision Register

| Area                        | Required decision                             | Current status | Evidence link                                                   |
| --------------------------- | --------------------------------------------- | -------------- | --------------------------------------------------------------- |
| `main` protection           | Production branch protected                   | PASS           | `docs/audits/prompt-39-production-readiness-gap-review.md`      |
| `development` protection    | Staging branch protected                      | PASS           | `docs/audits/prompt-40-development-branch-protection-report.md` |
| Production deployment guard | `main` deployment disabled until approval     | PASS           | `vercel.json`                                                   |
| Production Supabase project | Dedicated production project created          | BLOCKED        | `docs/deployment/production-supabase-separation-plan.md`        |
| Production env vars         | Provider secrets configured                   | BLOCKED        | Provider secret manager evidence required; do not commit values |
| Auth redirects              | Production-only redirect allowlist approved   | BLOCKED        | `docs/deployment/production-supabase-separation-plan.md`        |
| Migration tracking          | Version-controlled production migration proof | BLOCKED        | `docs/deployment/database-migration-runbook.md`                 |
| Production RLS verification | Production-safe RLS test report               | BLOCKED        | Future production RLS report required                           |
| Backup enabled              | Automated backup evidence                     | BLOCKED        | `docs/deployment/production-backup-restore-rehearsal-plan.md`   |
| Restore rehearsal           | Restore drill passed                          | BLOCKED        | Future production restore report required                       |
| Monitoring provider         | MVP provider decision recorded                | PASS           | `docs/operations/production-monitoring-decision-plan.md`        |
| Alert routing               | Test alert acknowledged                       | BLOCKED        | Private owner record and provider alert evidence required       |
| Incident ownership          | Owner fields defined for private record       | CONDITIONAL    | `docs/deployment/production-owner-record-template.md`           |
| Rollback readiness          | Rollback owner and target named               | BLOCKED        | Private owner record and release checklist required             |
| Release approval            | Named production approver                     | BLOCKED        | Private owner record required                                   |
| Production seed policy      | Approved seed list                            | BLOCKED        | `docs/deployment/production-supabase-separation-plan.md`        |

## Public Owner Field Decisions

Do not commit private names, phone numbers, personal email addresses, recovery
codes, dashboard screenshots containing secrets, or direct provider invitation
links to Git.

The repository records the required responsibilities and evidence path. The
actual named people and contact routes must be recorded in a restricted private
operations record based on
`docs/deployment/production-owner-record-template.md`.

| Private owner field        | Required before production setup | Public Git status                                        |
| -------------------------- | -------------------------------- | -------------------------------------------------------- |
| Release approver           | Yes                              | Field defined; named owner must be private               |
| Release owner              | Yes                              | Field defined; named owner must be private               |
| Incident commander         | Yes                              | Field defined; named owner must be private               |
| Security reviewer          | Yes                              | Field defined; named owner must be private               |
| Supabase/database owner    | Yes                              | Field defined; provider account evidence must be private |
| Vercel/application owner   | Yes                              | Field defined; provider account evidence must be private |
| GitHub/repository owner    | Yes                              | Field defined; branch-protection evidence may be public  |
| Content/education owner    | Yes                              | Field defined; named owner must be private               |
| Backup/restore owner       | Yes                              | Field defined; named owner must be private               |
| Rollback owner             | Yes                              | Field defined; named owner must be private               |
| Communications owner       | Yes                              | Field defined; named owner must be private               |
| Private record location    | Yes                              | Must be recorded without exposing credentials            |
| Emergency escalation route | Yes                              | Must be private                                          |

Recommended private record locations are an organisation password manager,
restricted operations vault, or provider-native ownership records. If a local
working copy is temporarily needed, use
`docs/deployment/production-owner-record.private.md`; this path is intentionally
ignored by Git.

## Production Environment Decisions

| Decision area                | Current decision                                                                                                                                          | Launch status |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| Production branch            | `main` remains the production-controlled branch. Direct commits are not allowed.                                                                          | PASS          |
| Integration branch           | `development` remains the staging/integration branch.                                                                                                     | PASS          |
| Production Supabase boundary | Use a dedicated production Supabase project separate from staging project `lgjujyaclrpaopdabyzg`.                                                         | BLOCKED       |
| Production Supabase evidence | Store project ref, owner, region, plan, backup capability, and emergency owner in the private owner/release record; do not commit connection credentials. | BLOCKED       |
| Production Vercel boundary   | Use a production Vercel project or production environment that is separate from the staging project evidence.                                             | BLOCKED       |
| Production secrets           | Store only in provider secret managers. Service-role and database credentials are server-only and unavailable to browser code.                            | BLOCKED       |
| Production auth redirects    | Allow only canonical production HTTPS auth routes unless a time-bounded emergency exception is documented.                                                | BLOCKED       |
| MVP monitoring destination   | Use provider-native Vercel runtime/deployment evidence, Supabase project health, repository health endpoints, and redacted operational events first.      | PASS          |
| Monitoring SDKs              | No monitoring SDK dependency is approved for the first production setup; add one only after privacy and dependency review.                                | PASS          |
| Alert routing                | Configure provider alerts to the private incident/release/security/database owner routes and record a test acknowledgement.                               | BLOCKED       |
| Backup and recovery          | Confirm automated production backups, retention, and restore rehearsal before real student data.                                                          | BLOCKED       |
| Production seed data         | Seed only platform metadata, roles, and permissions approved for production; do not promote staging users or test attempts.                               | BLOCKED       |
| Launch approval              | A named private release approver must approve the exact production commit and known limitations.                                                          | BLOCKED       |

## Future Live Setup Order

Complete future live production setup in this order:

1. Confirm human owner fields in the private operations record.
2. Configure and test the selected provider-native monitoring and alert-routing
   destination.
3. Create the dedicated production Supabase project.
4. Configure production Supabase auth settings and redirect allowlist.
5. Configure production environment variables in provider secret storage.
6. Confirm production backup capability and retention.
7. Apply version-controlled migrations to production through the approved
   release process.
8. Verify production migration tracking.
9. Apply only approved production seed data.
10. Run production-safe RLS verification.
11. Complete restore rehearsal into a non-production restore target.
12. Run production-safe health checks without exposing internals.
13. Record release approval, rollback target, and known limitations.
14. Enable production deployment only after every blocking item is closed.

## Stop Conditions

Stop production setup immediately if:

- Any secret appears in logs, Git, issue trackers, screenshots, or reports.
- Production and staging project references are not clearly separate.
- Migration tracking is missing or ambiguous.
- RLS verification fails.
- Backup status cannot be proven.
- Restore rehearsal fails.
- Alert routing is not acknowledged.
- Release approver or incident owner is missing.
- A production deployment is triggered before approval.

## Final Go / No-Go Rule

Production can move from NO-GO to GO only when every BLOCKED item in this
register is replaced with PASS and linked to evidence.
