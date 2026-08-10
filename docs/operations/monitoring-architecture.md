# Staging Monitoring Architecture

Date: 2026-08-10

## Scope

Industrial Learn staging monitoring uses the approved project platforms already in
use for staging:

- Vercel runtime logs for application operational events.
- Vercel deployment status for build and route availability checks.
- Supabase staging logs for database and authentication provider diagnostics.

No production monitoring was configured. No new external monitoring dependency was
installed.

## Monitoring Events

The application emits structured JSON operational events from trusted server
contexts only. Each event includes:

- `environment`
- `provider`
- `appVersion`
- `commitHash`
- `timestamp`
- `category`
- `operation`
- `result`
- `route`
- `correlationId`
- optional hashed user identifier when justified
- redacted detail fields

Supported event categories:

- `application_error`
- `auth_failure`
- `database_failure`
- `assessment_operation_failure`
- `simulation_operation_failure`
- `content_publication_failure`
- `health_check_failure`
- `server_error`
- `slow_route`

## Staging Probe

`POST /api/monitoring/staging-probe` is an operations-only diagnostic endpoint
for staging release-candidate verification. It is unavailable outside staging
and requires the `x-industrial-learn-probe: staging-monitoring-check` header.

The probe emits one synthetic redacted operational event and returns only a
correlation ID. It must not be used as a product feature or production health
check.

## Staging Data Flow

1. A server-side route, server action, or health check detects a failure.
2. The monitoring adapter builds a structured event.
3. Sensitive fields are redacted before output.
4. In staging, the event is written to Vercel runtime logs.
5. Supabase dashboard logs remain the database/auth provider diagnostic source.

Local development and E2E test runs do not emit external monitoring events.

## Error Boundaries

Industrial Learn has safe error boundaries for:

- Global application shell
- Student dashboard
- Assessments
- Simulations
- Content authoring
- Engineering review

Error boundaries show recovery text and a Next.js digest reference only. They do
not render stack traces, request bodies, submitted answers, hidden correct
answers, project submissions, source document bodies, cookies, or tokens.

## Future Provider Integration

If the project later approves Sentry, PostHog, or another monitoring provider,
that integration must use the same redacted event structure. Provider SDKs must
be configured for staging first and must not receive private learning content or
assessment answers.
