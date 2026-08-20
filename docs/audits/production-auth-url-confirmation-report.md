# Production Auth URL Confirmation Report

Date: 2026-08-20

## Executive Verdict

CONDITIONAL PASS for manual production Supabase Auth URL confirmation.

NO-GO for production launch.

The operator confirmed that the production Supabase Auth URL settings were saved
for project `vhjjfapkxytmaakbleee`. Follow-up checks confirmed the production
Vercel deployment remains behind Vercel login/protection, so public HTTP health
and sign-in checks still return redirects rather than application responses.

No Supabase settings were changed by automation during this task. No production
database migrations, schema changes, application feature changes, or curriculum
changes were made.

## Confirmed Manual Settings

The operator reported that the following production Auth URL settings were
entered in the Supabase dashboard:

| Setting                 | Expected value                                                   |
| ----------------------- | ---------------------------------------------------------------- |
| Site URL                | `https://industrial-learn-kolobe.vercel.app`                     |
| Verification redirect   | `https://industrial-learn-kolobe.vercel.app/auth/verify`         |
| Password reset redirect | `https://industrial-learn-kolobe.vercel.app/auth/reset-password` |
| Sign-in/sign-out route  | `https://industrial-learn-kolobe.vercel.app/auth/sign-in`        |

Localhost, staging, branch-preview, and development URLs must remain excluded
from the production allowlist unless a time-bounded exception is approved and
recorded.

## Automated Verification Attempt

Public production route checks were run after the manual confirmation:

| Route               | Result | Interpretation                         |
| ------------------- | ------ | -------------------------------------- |
| `/api/health/live`  | 302    | Redirected by Vercel protection        |
| `/api/health/ready` | 302    | Redirected by Vercel protection        |
| `/auth/sign-in`     | 302    | Redirected by Vercel protection        |
| Followed redirects  | 200    | Resolved to Vercel login/protection UI |

The checks prove that the production deployment is still protected from public
access. They do not prove the Supabase Auth callbacks work inside the app,
because Vercel protection intercepts requests before the application is reached.

## Protected Access Attempt

Authenticated `vercel curl` and Vercel project-protection inspection commands
were attempted but did not return within the operator session and were
interrupted. No Vercel protection settings were changed, no bypass secret was
printed, and deployment protection was not disabled.

## Remaining Blockers

- Production app-level health checks need an approved protected-access path,
  such as a production-safe Vercel automation bypass or provider-native
  monitoring configuration.
- Production Auth callback behavior still needs browser verification through
  that protected-access path.
- Production migration tracking is not verified.
- Production migrations have not been applied.
- Production-safe RLS verification has not been run.
- Production alert routing has not been acknowledged.
- Production backup retention and restore rehearsal remain incomplete.

## Recommended Next Step

Decide the production pre-launch access policy:

1. Keep Vercel protection enabled and configure a production-safe automation
   bypass for health/auth verification; or
2. Temporarily disable protection only for a controlled verification window,
   then re-enable it immediately; or
3. Keep protection enabled and use provider-native monitoring evidence until
   launch approval.

The safest next technical step is option 1: configure a production-safe Vercel
automation bypass, then verify `/api/health/live`, `/api/health/ready`, and the
production sign-in flow without exposing the deployment publicly.
