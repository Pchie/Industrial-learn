# Production Monitoring Decision Plan

Date: 2026-08-12

## Purpose

This plan defines what Industrial Learn must decide and verify before enabling
production monitoring. It does not install a monitoring dependency, connect a
provider, create alerts, or deploy production.

## Source IDs

- IL-AGENTS-001: `AGENTS.md`
- IL-SEC-001: `docs/architecture/security-boundaries.md`
- IL-MONITORING-STAGING-001: `docs/operations/monitoring-architecture.md`
- IL-STAGING-ALERTS-001: `docs/operations/staging-alerts.md`
- IL-INCIDENT-001: `docs/deployment/incident-response.md`

## Provider Decision

Production monitoring must use an approved destination before launch. Candidate
approaches may include the existing platform logs or a dedicated monitoring
provider, but no provider is approved until the review records:

- Data sent to the provider.
- Redaction controls.
- Data residency and retention expectations.
- Access control for maintainers.
- Alert routing destination.
- Cost and operational ownership.
- Whether a dependency or SDK is required.

No dependency may be installed without documenting why it is required.

## Required Production Signals

Production monitoring must cover:

- Deployment failures.
- `/api/health/live` failures.
- `/api/health/ready` failures.
- Application server errors.
- Authentication failures and unusual spikes.
- Authorisation denials and RLS-denial patterns.
- Database failures.
- Assessment persistence failures.
- Simulation persistence failures.
- Content publication failures.
- Slow protected routes.

## Privacy Rules

Production monitoring must not capture:

- Passwords.
- Session tokens.
- Reset links.
- Service-role keys.
- Database URLs.
- Private student answers.
- Hidden correct answers.
- Sensitive project submissions.
- Full private source documents.
- Raw cookies or authorization headers.

Monitoring payloads must use the redacted operational event structure already
used in staging.

## Alert Routing Requirements

Before launch, verify:

- Critical alerts reach the incident owner.
- High alerts reach the release owner and engineering owner.
- Security alerts reach the security reviewer.
- Database alerts reach the Supabase/database owner.
- Content publication alerts reach the content owner.
- A test alert is acknowledged and recorded.

## Production Thresholds To Define

| Signal                         | Required decision before launch  |
| ------------------------------ | -------------------------------- |
| Liveness failure               | Threshold and check frequency    |
| Readiness failure              | Threshold and check frequency    |
| Authentication failures        | Spike threshold                  |
| RLS denials                    | Expected baseline and spike rule |
| Assessment persistence failure | Immediate alert policy           |
| Simulation persistence failure | Immediate alert policy           |
| Server error rate              | Rollback investigation threshold |
| Slow route latency             | MVP threshold                    |

## Explicit Production Exclusion

The staging monitoring probe must not be promoted into production without a
separate reviewed design. Production checks must be safe, minimal, and must not
emit synthetic sensitive markers unless a privacy-reviewed test mechanism is
approved.

## Decision Record Template

```text
Production monitoring decision:
Date:
Provider:
Reason:
Data sent:
Redaction controls:
Retention:
Access owner:
Alert destination:
Test alert result:
SDK/dependency required:
Known limitations:
Production readiness verdict:
```

Production remains NO-GO until monitoring and alert routing are selected,
tested, and recorded.
