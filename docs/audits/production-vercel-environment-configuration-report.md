# Production Vercel Environment Configuration Report

Date: 2026-08-16

## Executive Verdict

PASS for configuring approved production runtime environment variables.

NO-GO for production launch.

The approved Supabase production runtime variables were uploaded to the Vercel
`industrial-learn` Production environment. No production database migration URL
was uploaded, no production migration was run, no application code was changed,
and no production redeploy was triggered.

## Scope

Configured only the approved runtime variables for the Vercel project
`industrial-learn`, Production environment:

| Variable                        | Status     | Notes                                      |
| ------------------------------- | ---------- | ------------------------------------------ |
| `NEXT_PUBLIC_APP_ENV`           | Configured | Production label                           |
| `APP_BASE_URL`                  | Configured | Production Vercel URL                      |
| `NEXT_PUBLIC_SUPABASE_URL`      | Configured | Production Supabase project URL            |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Configured | Production anon key, protected by RLS      |
| `SUPABASE_SERVICE_ROLE_KEY`     | Configured | Server-only production service-role secret |
| `SUPABASE_PROJECT_REF`          | Configured | Production project reference               |
| `INDUSTRIAL_LEARN_AUTH_MODE`    | Configured | `supabase` runtime mode                    |

The following was intentionally not configured:

| Variable          | Reason                                                                    |
| ----------------- | ------------------------------------------------------------------------- |
| `SUPABASE_DB_URL` | Migration/operator credential; keep in approved private release path only |

## Source Evidence

- `docs/deployment/production-launch-decision-register.md`
- `docs/deployment/production-owner-record-template.md`
- `docs/deployment/production-supabase-separation-plan.md`
- `docs/audits/production-verification-preflight-report.md`

## Safety Controls

- Production Supabase API keys were passed directly from Supabase CLI output to
  Vercel CLI input inside the operator session.
- Secret values were not printed into this report.
- Secret values were not written to Git.
- Secret values were not added to `.env` files.
- The completed private owner record remains ignored by Git.
- The production migration database URL was not uploaded to Vercel runtime.

## Verification

`vercel env ls production --project industrial-learn --json` showed seven
Production environment variables, all marked as sensitive:

- `NEXT_PUBLIC_APP_ENV`
- `APP_BASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_PROJECT_REF`
- `INDUSTRIAL_LEARN_AUTH_MODE`

No secret values were displayed by the verification command.

## Remaining Blockers

- Production has not been deliberately redeployed after the environment-variable
  update, so the current production deployment may not yet use these values.
- Production Supabase Auth Site URL and redirect allowlist still need live
  verification.
- Production migration tracking is not verified.
- Production migrations have not been applied.
- Production RLS verification has not been run.
- Production alert routing has not been acknowledged.
- Production backup retention and restore rehearsal are incomplete.
- Production health endpoints currently redirect to Vercel login/protection
  unless an approved production monitoring path is configured.

## Recommended Next Step

Verify and configure the production Supabase Auth URL settings for the
production Vercel URL, then perform an explicitly approved production redeploy
from the protected `main` release path or another documented production release
mechanism.
