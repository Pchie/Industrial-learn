# Prompt 37 Monitoring Report

Date: 2026-08-10

## Executive Verdict

Implemented staging-safe monitoring foundations for Industrial Learn without
adding a new external dependency and without configuring production monitoring.

## Provider

Approved staging providers used:

- Vercel runtime logs for structured application operational events.
- Vercel deployment status and health endpoints for availability checks.
- Supabase staging logs for database and authentication diagnostics.

No Sentry, PostHog, or other external telemetry SDK was installed.

## Files Changed

- `apps/web/src/features/monitoring/redaction.ts`
- `apps/web/src/features/monitoring/server.ts`
- `apps/web/src/features/monitoring/error-boundary-view.tsx`
- `apps/web/src/app/api/health/live/route.ts`
- `apps/web/src/app/api/health/ready/route.ts`
- `apps/web/src/app/assessments/error.tsx`
- `apps/web/src/app/simulations/error.tsx`
- `apps/web/src/app/author/error.tsx`
- `apps/web/src/app/review/error.tsx`
- `apps/web/src/features/auth/actions.ts`
- `apps/web/src/features/assessments/actions.ts`
- `apps/web/src/features/simulations/actions.ts`
- monitoring and health tests
- `docs/operations/monitoring-architecture.md`
- `docs/operations/logging-and-redaction-policy.md`
- `docs/operations/health-checks.md`
- `docs/operations/staging-alerts.md`
- `docs/audits/prompt-37-monitoring-report.md`

## Events Covered

- Authentication failures
- Assessment start/save/submit failures
- Assessment validation failures without answer contents
- Simulation start/complete failures
- Simulation completion validation failures without state payloads
- Readiness health-check failures

The monitoring event type also defines categories for application, server,
database, content publication, and slow-route events for future instrumentation.

## Data Explicitly Excluded

- Passwords
- Access and refresh tokens
- Cookies
- Reset links and reset tokens
- Supabase service-role keys
- Assessment answer contents
- Hidden correct answers
- Private explanations before completion
- Project submission bodies
- Private source document bodies
- Sensitive profile fields
- Full request and response bodies
- Database connection strings
- Health-response database host names and table names

## Health Endpoints

- `/api/health/live`: process liveness with release identity and correlation ID.
- `/api/health/ready`: environment, auth provider, and database reachability
  checks with generic success/failure names only.

## Alerting

Created staging alert guidance for Vercel deployment status, Vercel runtime
events, Supabase staging logs, and health endpoint failures.

## Verification Results

- `npm run scan:secrets`: PASS
- `npm run format:check`: PASS
- `npm run typecheck`: PASS
- `npm run lint`: PASS
- `npm run validate:content`: PASS, 7 tests passed
- `npm run validate:migrations`: PASS, 13 tests passed
- `npm run test:unit`: PASS, 24 files passed, 1 skipped; 172 tests passed, 4 skipped
- `npm run build`: PASS, health routes included in the Next.js route manifest
- `npm run test:smoke`: PASS, 5 tests passed after allowing the local test server
  to bind to `127.0.0.1`
- `npm run test:e2e`: PASS, 69 tests passed after allowing the local test server
  to bind to `127.0.0.1`
- `npx playwright test tests/e2e/simulation-browser.spec.ts`: PASS, 5 tests
  passed after increasing the simulation-completion redirect wait used by the
  E2E helper

Initial browser-test attempts without local-server permission failed with
`listen EPERM` before any application route was exercised. The commands passed
when rerun with the required local-server permission.

One full E2E rerun exposed a timing-sensitive simulation completion redirect in
the browser test helper. The product code was not changed for this; the helper
now allows a longer wait for the server-action redirect under full-suite load.

## Known Limitations

- Alerts are documented but not connected to an external notification channel.
- Browser-side telemetry is intentionally not configured.
- Slow-route monitoring is defined but not yet wired into route timing
  instrumentation.
- Content publication failure monitoring is defined for future mutation flows.
- Production monitoring remains out of scope and requires explicit approval.

## Recommended Next Prompt

Run a staging release-candidate verification that checks health endpoints on the
deployed `development` deployment, confirms runtime logs are emitted for a
staging-only synthetic failure, and verifies that no sensitive assessment or auth
data appears in Vercel logs.
