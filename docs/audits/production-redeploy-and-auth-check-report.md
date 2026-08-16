# Production Redeploy And Auth Check Report

Date: 2026-08-16

## Executive Verdict

CONDITIONAL PASS for production redeploy.

NO-GO for production launch.

The Vercel `industrial-learn` Production deployment was deliberately redeployed
after the approved Production runtime variables were configured. The deployment
completed successfully and the production alias was updated.

Production launch remains blocked because public health and sign-in checks are
still intercepted by Vercel login/protection, Supabase production Auth URL
configuration was not automatically verifiable from the available CLI context,
production migration tracking is still unverified, and backup/restore plus alert
routing gates remain incomplete.

## Scope

Completed:

- Confirmed the Vercel `industrial-learn` Production environment still contains
  the seven approved runtime variable names.
- Inspected the pre-redeploy production deployment.
- Redeployed the existing Vercel Production deployment.
- Confirmed the production alias points to the new ready deployment.
- Checked production health and sign-in routes without printing response bodies.

Not completed:

- No production Supabase Auth settings were changed.
- No production database migrations were applied.
- No production database URL was uploaded to Vercel.
- No production RLS verification was run.
- No production alert route was changed.
- No production backup or restore rehearsal was run.
- No application code, curriculum, migrations, or database schema were changed.

## Production Redeploy Evidence

| Item                         | Result                                                 |
| ---------------------------- | ------------------------------------------------------ |
| Vercel project               | `industrial-learn`                                     |
| Redeploy target              | Production                                             |
| New deployment ID            | `dpl_9WQU6U5rpKseuyTAjtBm1EqsMgX4`                     |
| New deployment URL           | `https://industrial-learn-ge3f7yq7u-kolobe.vercel.app` |
| Production alias             | `https://industrial-learn-kolobe.vercel.app`           |
| Deployment status            | Ready                                                  |
| Production runtime env names | Seven expected variables present and marked sensitive  |
| Secret values printed        | No                                                     |

## Production Route Checks

| Route               | Direct status | Followed redirect result                |
| ------------------- | ------------- | --------------------------------------- |
| `/api/health/live`  | 302           | Vercel login/protection flow, HTTP 200  |
| `/api/health/ready` | 302           | Not followed after live route confirmed |
| `/auth/sign-in`     | 302           | Vercel login/protection flow, HTTP 200  |

Interpretation: the production app is deployed, but production deployment
protection prevents unauthenticated external health and auth route checks. This
may be acceptable for a protected pre-launch environment, but it is not
sufficient for production launch monitoring.

## Supabase Auth URL Configuration

Supabase official documentation identifies the Management API endpoints for
reading and updating project Auth configuration, including the production
`site_url`. It also documents the dashboard URL Configuration page for allowed
redirect URLs.

The available local Supabase CLI context did not provide a safe automated way to
read or update the production Auth URL settings:

- The repository is not linked to the production Supabase project.
- There is no local `supabase/config.toml` to push.
- The CLI exposes project listing and API-key access but not a direct Auth URL
  configuration command.
- The Supabase Management API token is not available as a reusable local file.

Therefore, production Supabase Auth URL settings remain a manual dashboard or
approved Management API verification item.

Required production Auth values:

| Setting                 | Required value                                                   |
| ----------------------- | ---------------------------------------------------------------- |
| Site URL                | `https://industrial-learn-kolobe.vercel.app`                     |
| Verification redirect   | `https://industrial-learn-kolobe.vercel.app/auth/verify`         |
| Password reset redirect | `https://industrial-learn-kolobe.vercel.app/auth/reset-password` |
| Sign-in/sign-out route  | `https://industrial-learn-kolobe.vercel.app/auth/sign-in`        |

Do not add localhost, staging, branch-preview, or development URLs to the
production allowlist unless a time-bounded exception is approved and recorded.

## Remaining Blockers

- Confirm production Supabase Auth Site URL and redirect allowlist in the
  Supabase dashboard or via an approved Management API token.
- Decide whether production Vercel deployment protection should remain enabled
  pre-launch or whether a private monitoring bypass should be configured.
- Run production health checks through the approved production monitoring path.
- Verify production migration tracking.
- Apply version-controlled migrations to production only after approval.
- Run production-safe RLS verification with synthetic users.
- Configure and acknowledge production alert routing.
- Confirm production backup retention and complete a restore rehearsal into a
  non-production restore target.

## Recommended Next Step

Manually confirm or configure Supabase production Auth URL settings in the
Supabase dashboard for project `vhjjfapkxytmaakbleee`, then provide confirmation
so production Auth checks can continue through an approved protected-access path.
