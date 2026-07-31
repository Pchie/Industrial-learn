# Staging Web Security

Date: 2026-07-31

## Purpose

This document records the security posture for the Industrial Learn Vercel
staging web deployment. Staging must use only the dedicated Supabase staging
project and synthetic or approved test data.

## Source IDs

- IL-AGENTS-001: `AGENTS.md`
- IL-DEPLOY-ENV-001: `docs/deployment/environment-strategy.md`
- IL-STAGING-RLS-001: `docs/security/staging-rls-verification.md`
- IL-STAGING-DB-001: `docs/audits/prompt-33-staging-database-report.md`

## Environment Boundary

| Boundary               | Requirement                                               |
| ---------------------- | --------------------------------------------------------- |
| Data                   | Synthetic staging users and approved staging records only |
| Auth                   | Supabase staging authentication                           |
| Local auth             | Disabled in staging                                       |
| Production credentials | Not configured                                            |
| Service role           | Server-only and excluded from untrusted previews          |
| Database URL           | Migration/operator use only; not browser-exposed          |

## Browser Security Headers

The staging app sends:

| Header                      | Purpose                                                    |
| --------------------------- | ---------------------------------------------------------- |
| `Content-Security-Policy`   | Restricts resource loading to the app and staging Supabase |
| `Referrer-Policy`           | Limits referrer leakage across origins                     |
| `X-Content-Type-Options`    | Prevents MIME sniffing                                     |
| `X-Frame-Options`           | Blocks clickjacking through framing                        |
| `Permissions-Policy`        | Disables unused browser capabilities                       |
| `Strict-Transport-Security` | Enforces HTTPS on deployed staging browsers                |

## CSP Notes

The current CSP includes temporary inline script and style allowances because the
current Next.js output requires inline runtime/style behavior. This is acceptable
for staging verification but should be revisited before production hardening.

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

These routes must not be publicly cached by the browser, Vercel CDN, or any
intermediate cache.

## Preview Deployment Security

Feature-branch previews may be useful for UI review but must be treated as
lower-trust than the `development` staging deployment.

Required controls:

- Do not provide production secrets to preview deployments.
- Do not provide `SUPABASE_DB_URL` to untrusted previews.
- Avoid providing `SUPABASE_SERVICE_ROLE_KEY` to untrusted previews.
- Use only synthetic staging users and records.
- Restrict Supabase redirect allowlists to approved URLs.
- Prefer Vercel protected previews for branches outside trusted maintainers.

## Error-State Requirements

Staging errors must not reveal:

- Supabase service-role keys
- database connection strings
- access tokens
- refresh tokens
- hidden assessment answers
- internal SQL errors
- another student's private data

Existing browser tests verify protected-route denial, dashboard safe error
handling, private cache headers, and cross-student dashboard protection.

## Remaining Security Work

- Verify headers on the live Vercel staging URL after deployment.
- Confirm Supabase redirect allowlists in the dashboard.
- Confirm Vercel project access controls and protected preview settings.
- Revisit CSP inline allowances before production.
