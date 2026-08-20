# Staging Web Security

Date: 2026-08-03

## Purpose

This document records the security posture for the Industrial Learn Vercel
staging web deployment. Staging must use only the dedicated Supabase staging
project and synthetic or approved test data.

## Source IDs

- IL-AGENTS-001: `AGENTS.md`
- IL-DEPLOY-ENV-001: `docs/deployment/environment-strategy.md`
- IL-STAGING-RLS-001: `docs/security/staging-rls-verification.md`
- IL-STAGING-DB-001: `docs/audits/prompt-33-staging-database-report.md`
- IL-P33B-RLS-001: `docs/audits/prompt-33b-content-rls-remediation.md`

## Environment Boundary

| Boundary               | Current staging control                                            |
| ---------------------- | ------------------------------------------------------------------ |
| Data                   | Synthetic staging users and approved staging records only          |
| Auth                   | Supabase staging authentication                                    |
| Local auth             | Disabled with `INDUSTRIAL_LEARN_AUTH_MODE=supabase`                |
| Test mode              | Disabled with `INDUSTRIAL_LEARN_E2E=false`                         |
| Production credentials | Not configured                                                     |
| Service role           | Server-only Vercel encrypted variable                              |
| Database URL           | Server/operator value; not exposed to browser code                 |
| Deployment protection  | Vercel SSO/protection with automation bypass for controlled checks |
| Git fork protection    | Enabled on the staging Vercel project                              |

## Browser Security Headers

Final staging header checks through authenticated `vercel curl` confirmed:

| Header                      | Status  | Purpose                                                    |
| --------------------------- | ------- | ---------------------------------------------------------- |
| `Content-Security-Policy`   | Present | Restricts resource loading to the app and staging Supabase |
| `Referrer-Policy`           | Present | Limits referrer leakage across origins                     |
| `X-Content-Type-Options`    | Present | Prevents MIME sniffing                                     |
| `X-Frame-Options`           | Present | Blocks clickjacking through framing                        |
| `Permissions-Policy`        | Present | Disables unused browser capabilities                       |
| `Strict-Transport-Security` | Present | Enforces HTTPS on deployed staging browsers                |
| `x-robots-tag`              | Present | Keeps protected Preview deployment out of indexes          |

## CSP Notes

The current CSP includes temporary inline script and style allowances because
the current Next.js output requires inline runtime/style behavior. This is
acceptable for staging verification but should be revisited before production
hardening.

Allowed network connections are limited to:

- same-origin requests
- `https://*.supabase.co`
- `wss://*.supabase.co`

## Private Cache Protection

The following routes are explicitly marked `private, no-store`:

- `/dashboard`
- `/my-learning`
- `/assessments`
- `/simulations/history`
- `/projects`
- `/author`
- `/review`
- `/admin`

Final staging checks confirmed `/dashboard`, `/assessments`, and `/review`
return private no-store headers. Local E2E coverage also verifies private
dashboard cache behavior.

## Preview Deployment Security

Feature-branch previews may be useful for UI review but must be treated as
lower-trust than the `development` staging deployment.

Required controls:

- Do not provide production secrets to preview deployments.
- Do not provide `SUPABASE_DB_URL` to untrusted previews.
- Avoid providing `SUPABASE_SERVICE_ROLE_KEY` to untrusted previews unless the
  branch is trusted and protected.
- Use only synthetic staging users and records.
- Restrict Supabase redirect allowlists to approved URLs.
- Keep Vercel protected previews enabled for non-public staging access.

## Error-State Requirements

Staging errors must not reveal:

- Supabase service-role keys
- database connection strings
- access tokens
- refresh tokens
- hidden assessment answers
- internal SQL errors
- another student's private data

Existing tests verify protected-route denial, safe dashboard database-failure
handling, private cache headers, and cross-student dashboard protection. Final
remote route checks did not show raw PostgreSQL, Supabase, RLS, or service-role
errors.

## Remaining Security Work

- Replace CSP inline allowances with nonce/hash-based controls before
  production if practical.
- Confirm Vercel project member access and branch protection manually in the
  Vercel/GitHub dashboards.
- Keep production deployment disabled until the production release prompt.
