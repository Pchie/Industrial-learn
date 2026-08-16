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
Production launch ownership:Industrial Learn production ownership record
Record date:2026-08-16
Release or setup phase:Initial production environment setup
Private operations record location:1Password vault: Industrial Learn/ Production Operations

Release approver:Pitse Pitse
Release owner:Pitse Pitse
Incident commander:Pitse Pitse
Security reviewer:Pitse Pitse
Supabase/database owner:Pitse Pitse
Vercel/application owner:Pitse Pitse
GitHub/repository owner:Pitse Pitse
Content/education owner:Pitse Pitse
Backup/restore owner:Pitse Pitse
Rollback owner:Pitse Pitse
Communications owner:Pitse Pitse

Critical acknowledgement target:15 minutes
High acknowledgement target:1 hour
Emergency escalation route:Phone call to release owner, then email backup owner
Release halt authority:Release approver, security reviewer, or incident commander
Rollback approval authority:Rollback owner or incident commander
Production database restore approval authority:Supabase/database owner plus release approver
Student-data exposure declaration authority:Security reviewer plus incident commander

Production Supabase project evidence location:1Password note: Industrial Learn/ Production Supabase Evidence
Production Vercel project evidence location:1Password note: Industrial Learn/ Production Vercel Evidence
Production GitHub branch-protection evidence location:GitHub repository settings screenshot in private vault
Production monitoring evidence location:Private operations vault/ Monitoring evidence/ 2026-08-16
Production backup evidence location:Private vault screenshot of Supabase backup settings
Production restore rehearsal evidence location:docs/audits/future-production-restore-report.md plus private Supabase evidence

Known unavailable owner windows:Release owner unavailable Sundays 18:00-22:00 SAST
Backup owner for unavailable periods: No backup owner yet - production launch blocked
Owner review date:2026-09-16
Production readiness verdict:NO-GO until production Supabase, Vercel, backups, alerts, RLS verification, and restore rehearsal pass.
```

## Public Reporting Rule

Public audit reports may state that fields were completed in the private
operations record and may reference non-sensitive evidence categories. Public
reports must not include private contact details, credentials, provider invite
links, recovery codes, personal phone numbers, or private student information.
