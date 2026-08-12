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

## Current Launch Verdict

NO-GO for production launch.

The repository and staging branch controls are improved, but the production
environment has not been created, verified, backed up, monitored, or assigned to
named launch owners.

## Decision Register

| Area                        | Required decision                             | Current status | Evidence link                                                   |
| --------------------------- | --------------------------------------------- | -------------- | --------------------------------------------------------------- |
| `main` protection           | Production branch protected                   | PASS           | `docs/audits/prompt-39-production-readiness-gap-review.md`      |
| `development` protection    | Staging branch protected                      | PASS           | `docs/audits/prompt-40-development-branch-protection-report.md` |
| Production deployment guard | `main` deployment disabled until approval     | PASS           | `vercel.json`                                                   |
| Production Supabase project | Dedicated production project created          | BLOCKED        | To be filled                                                    |
| Production env vars         | Provider secrets configured                   | BLOCKED        | To be filled                                                    |
| Auth redirects              | Production-only redirect allowlist approved   | BLOCKED        | To be filled                                                    |
| Migration tracking          | Version-controlled production migration proof | BLOCKED        | To be filled                                                    |
| Production RLS verification | Production-safe RLS test report               | BLOCKED        | To be filled                                                    |
| Backup enabled              | Automated backup evidence                     | BLOCKED        | To be filled                                                    |
| Restore rehearsal           | Restore drill passed                          | BLOCKED        | To be filled                                                    |
| Monitoring provider         | Production monitoring decision approved       | BLOCKED        | To be filled                                                    |
| Alert routing               | Test alert acknowledged                       | BLOCKED        | To be filled                                                    |
| Incident ownership          | Named owners recorded privately               | BLOCKED        | To be filled                                                    |
| Rollback readiness          | Rollback owner and target named               | BLOCKED        | To be filled                                                    |
| Release approval            | Named production approver                     | BLOCKED        | To be filled                                                    |
| Production seed policy      | Approved seed list                            | BLOCKED        | To be filled                                                    |

## Owner Fields To Complete Privately

Do not commit private contact details to Git. Record named owners in the
approved private operations location.

```text
Release approver:
Release owner:
Incident commander:
Security reviewer:
Supabase/database owner:
Vercel/application owner:
Content/education owner:
Rollback owner:
Communications owner:
Private operations record location:
```

## Future Live Setup Order

Complete future live production setup in this order:

1. Confirm human owner fields in the private operations record.
2. Select and record production monitoring and alert-routing destination.
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
