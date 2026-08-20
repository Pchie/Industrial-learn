# Staging Alerts

Date: 2026-08-10

## Alert Sources

Staging alerts should be configured from:

- Vercel deployment status
- Vercel runtime logs containing `industrial_learn_operational_event`
- `/api/health/live`
- `/api/health/ready`
- Supabase staging authentication and database logs

## Initial Alert Rules

Recommended staging alert rules:

- Deployment build failure on `development`: notify release owner.
- `/api/health/live` non-200 for 2 consecutive checks: investigate app runtime.
- `/api/health/ready` non-200 for 2 consecutive checks: investigate env,
  Supabase auth, and database connectivity.
- Repeated `auth_failure` spikes: inspect Supabase auth logs without exposing
  account existence publicly.
- Any `database_failure`: inspect Supabase REST/RPC availability and recent
  migration changes.
- Any `assessment_operation_failure`: verify server-side scoring, idempotency,
  and hidden-answer protection.
- Any `simulation_operation_failure`: verify attempt persistence and simulation
  input validation.
- Any `content_publication_failure`: verify review permissions and publication
  status.

## Response Expectations

Staging alerts should lead to investigation, not automatic deployment rollback.
Production rollback procedures remain governed by deployment documentation and
explicit production approval.

## Privacy Requirement

Alert messages must use the same redacted event fields as runtime logs. Alert
payloads must not include student answers, hidden correct answers, project
submissions, private source documents, cookies, tokens, or credentials.
