# Production Incident Ownership Plan

Date: 2026-08-12

## Purpose

This plan defines the ownership information that must be recorded before
Industrial Learn production launch. It does not assign real people in Git,
configure paging tools, or deploy production.

## Source IDs

- IL-AGENTS-001: `AGENTS.md`
- IL-INCIDENT-001: `docs/deployment/incident-response.md`
- IL-ROLLBACK-001: `docs/deployment/rollback-runbook.md`
- IL-PROD-CHECKLIST-001: `docs/deployment/production-release-checklist.md`
- IL-MONITORING-PROD-001:
  `docs/operations/production-monitoring-decision-plan.md`
- IL-PROD-OWNER-TEMPLATE-001:
  `docs/deployment/production-owner-record-template.md`

## Required Owners Before Production

Record named owners in a private release or operations record:

| Responsibility           | Required before launch |
| ------------------------ | ---------------------- |
| Release approver         | Yes                    |
| Release owner            | Yes                    |
| Incident commander       | Yes                    |
| Security reviewer        | Yes                    |
| Supabase/database owner  | Yes                    |
| Vercel/application owner | Yes                    |
| GitHub/repository owner  | Yes                    |
| Content/education owner  | Yes                    |
| Backup/restore owner     | Yes                    |
| Rollback owner           | Yes                    |
| Communications owner     | Yes                    |

Git documentation may describe the roles, but personal contact details should
be stored only in an approved private operations location.

Use `docs/deployment/production-owner-record-template.md` for the required
private fields. A completed local working copy, if needed, must use
`docs/deployment/production-owner-record.private.md`, which is ignored by Git.

## Severity Ownership

| Severity | Required owner path                                      |
| -------- | -------------------------------------------------------- |
| Critical | Incident commander, security reviewer, release owner     |
| High     | Incident commander, release owner, affected system owner |
| Medium   | System owner and release owner as needed                 |
| Low      | Backlog owner or maintenance owner                       |

## Production Response Expectations

Before launch, define:

- Expected acknowledgement time for critical alerts.
- Expected acknowledgement time for high alerts.
- Escalation path when the first owner is unavailable.
- Who can halt a release.
- Who can approve rollback.
- Who can approve production database restore.
- Who can declare student-data exposure.

## Ownership Constraints

- Content reviewers do not automatically receive student-data access.
- Engineering reviewers do not automatically receive private attempts or
  submissions.
- Service-role access must be limited to trusted server-side or approved
  operator contexts.
- Incident communications must not include secrets, private answers, or
  sensitive student submissions.

## Launch Ownership Template

```text
Production launch ownership:
Date:
Release:
Release approver:
Release owner:
Incident commander:
Security reviewer:
Supabase/database owner:
Vercel/application owner:
GitHub/repository owner:
Content/education owner:
Backup/restore owner:
Rollback owner:
Communications owner:
Critical acknowledgement target:
High acknowledgement target:
Escalation path verified:
Rollback authority verified:
Production readiness verdict:
```

Production remains NO-GO until this ownership record is complete.
