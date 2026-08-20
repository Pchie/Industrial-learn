# Health Checks

Date: 2026-08-10

## Endpoints

Industrial Learn exposes two staging-safe health endpoints:

- `/api/health/live`
- `/api/health/ready`

Both endpoints use `Cache-Control: no-store`.

## Liveness

`/api/health/live` confirms the Next.js application process can respond. It
returns:

- status
- environment
- release version
- commit hash
- correlation ID

It does not check Supabase connectivity.

## Readiness

`/api/health/ready` confirms the staging application has the minimum server-side
configuration needed to serve authenticated learning flows.

Checks:

- configuration
- auth provider reachability
- database API reachability

Responses intentionally do not include Supabase host names, database table names,
credentials, row counts, stack traces, or provider metadata.

## Failure Behaviour

Readiness failures return HTTP 503 and emit a redacted
`health_check_failure` operational event in staging.

The endpoint is designed for deployment and uptime checks. It is not a database
drift validator and does not prove row-level-security correctness.
