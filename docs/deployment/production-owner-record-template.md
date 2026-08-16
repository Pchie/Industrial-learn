# Production Owner Record Template

Date: 2026-08-16

## Purpose

This template defines the private owner fields required before Industrial Learn
production setup. It is safe to commit because it contains no real owner names,
contact routes, provider account identifiers, secrets, credentials, access
tokens, recovery codes, or private dashboard evidence.

Create the completed owner record only in a restricted private operations
location. Do not commit the completed record to Git.

## Source IDs

- IL-AGENTS-001: `AGENTS.md`
- IL-PROD-LAUNCH-001:
  `docs/deployment/production-launch-decision-register.md`
- IL-PROD-INCIDENT-001:
  `docs/deployment/production-incident-ownership-plan.md`
- IL-PROD-MONITORING-001:
  `docs/operations/production-monitoring-decision-plan.md`
- IL-PROD-SUPABASE-001:
  `docs/deployment/production-supabase-separation-plan.md`

## Private Record Storage Rule

Store completed values in one of these approved private locations:

- Organisation password manager or restricted operations vault.
- Provider-native ownership records in Supabase, Vercel, and GitHub.
- Temporary local file
  `docs/deployment/production-owner-record.private.md`, which is ignored by
  Git.

Do not store completed values in public documentation, issue trackers, chat, CI
logs, screenshots, or pull-request descriptions.

## Required Private Fields

```text
Production launch ownership:
Record date:
Release or setup phase:
Private operations record location:

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
Emergency escalation route:
Release halt authority:
Rollback approval authority:
Production database restore approval authority:
Student-data exposure declaration authority:

Production Supabase project evidence location:
Production Vercel project evidence location:
Production GitHub branch-protection evidence location:
Production monitoring evidence location:
Production backup evidence location:
Production restore rehearsal evidence location:

Known unavailable owner windows:
Backup owner for unavailable periods:
Owner review date:
Production readiness verdict:
```

## Public Reporting Rule

Public audit reports may state that fields were completed in the private
operations record and may reference non-sensitive evidence categories. Public
reports must not include private contact details, credentials, provider invite
links, recovery codes, personal phone numbers, or private student information.
