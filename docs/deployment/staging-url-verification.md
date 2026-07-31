# Staging URL Verification

Date: 2026-07-31

## Status

The `development` branch Preview deployment on `kolobe/industrial-learn` is the
Industrial Learn staging deployment. Branch-scoped Preview environment variables
are configured for `development`. The latest Preview deployment is ready.
Unauthenticated automated route checks are intercepted by Vercel SSO/protection,
so deployed checks use Vercel's automation protection bypass through
authenticated Vercel CLI requests.

## Required URL

| Item                  | Value                                                        |
| --------------------- | ------------------------------------------------------------ |
| Staging URL           | `https://industrial-learn-git-development-kolobe.vercel.app` |
| Branch                | `development`                                                |
| Deployment URL        | `https://industrial-learn-o34hmn85t-kolobe.vercel.app`       |
| Deployment ID         | `dpl_Gn4pZtDqQ6CJhdGDA4g35cbU8iU6`                           |
| Deployment status     | Ready                                                        |
| Deployment target     | Preview                                                      |
| Supabase project      | `lgjujyaclrpaopdabyzg`                                       |
| Auth mode             | `supabase`                                                   |
| Test auth             | Disabled                                                     |
| Production deployment | Disabled for `main`                                          |

## Verification Matrix

| Area                  | Route or action                   | Required result                     | Status                         |
| --------------------- | --------------------------------- | ----------------------------------- | ------------------------------ |
| Homepage              | `/`                               | Public shell renders                | Passed via Vercel bypass       |
| Curriculum            | `/learn`                          | Curriculum catalogue renders        | Passed via Vercel bypass       |
| Public lesson         | `/lessons/basic-fluid-pressure`   | Published lesson renders            | Passed via Vercel bypass       |
| Sign-up               | `/auth/sign-up`                   | Staging Supabase account flow works | Route passed via Vercel bypass |
| Sign-in               | `/auth/sign-in`                   | Synthetic staging user signs in     | Pending                        |
| Email verification    | `/auth/verify`                    | Redirect allowlist works            | Pending                        |
| Password reset        | `/auth/reset-password`            | Redirect allowlist works            | Pending                        |
| Dashboard             | `/dashboard`                      | Authenticated student sees own data | Route passed via Vercel bypass |
| Protected denial      | `/dashboard` unauthenticated      | Redirects to sign-in                | Pending                        |
| Cross-student privacy | Dashboard query tampering         | No other student data shown         | Pending                        |
| Author route          | `/author`                         | Author role can access              | Pending                        |
| Reviewer route        | `/review`                         | Reviewer role can access            | Pending                        |
| Draft protection      | Student opens author/review tools | Access denied                       | Pending                        |
| Sign-out              | `/auth/sign-out`                  | Session clears                      | Pending                        |

## Performance Baseline Template

Record after deployment:

| Route                           | Response status | Approximate response time | Notes   |
| ------------------------------- | --------------- | ------------------------- | ------- |
| `/`                             | Pending         | Pending                   | Pending |
| `/learn`                        | Pending         | Pending                   | Pending |
| `/lessons/basic-fluid-pressure` | Pending         | Pending                   | Pending |
| `/dashboard`                    | Pending         | Pending                   | Pending |
| `/auth/sign-in`                 | Pending         | Pending                   | Pending |

Also inspect:

- build size output
- major client bundles
- failed network requests
- server errors
- excessive database calls
- obvious layout shifts

## Error-State Checks

| Scenario              | Expected behavior                  | Status  |
| --------------------- | ---------------------------------- | ------- |
| Supabase unavailable  | Safe application error, no secrets | Pending |
| Session expires       | Redirect or safe auth error        | Pending |
| Missing profile       | Safe profile/setup error           | Pending |
| Database query fails  | Safe dashboard error               | Pending |
| Required env missing  | Build/runtime fails closed         | Pending |
| User lacks permission | Access denied without internals    | Pending |
| Route does not exist  | Not-found page renders             | Pending |

## Evidence To Record

- Staging deployment URL
- Vercel deployment ID
- Commit SHA
- CI run URL
- Smoke-test result
- Header verification result
- Supabase callback settings confirmation
- Known limitations

## Current Remote Check Result

Unauthenticated `curl -I -L` checks against `/`, `/learn`, and `/dashboard`
returned an initial Vercel protection response:

- HTTP 302 to `https://vercel.com/sso-api`
- `x-robots-tag: noindex`
- Vercel SSO nonce cookie set

This confirms the Preview deployment is protected from anonymous automated
access, but it prevents app-level security-header and route smoke checks from
running without an authenticated Vercel session or an approved automation bypass
secret.

## Automation Bypass Verification

Vercel automation protection bypass is enabled for the `industrial-learn`
project. The bypass secret was not printed, committed, or stored in repository
files. Checks were executed with authenticated `vercel curl` requests.

| Route                           | Status     | Header result                                                               |
| ------------------------------- | ---------- | --------------------------------------------------------------------------- |
| `/`                             | HTTP/2 200 | CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy present |
| `/learn`                        | HTTP/2 200 | CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy present |
| `/lessons/basic-fluid-pressure` | HTTP/2 200 | CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy present |
| `/auth/sign-in`                 | HTTP/2 200 | Private no-store cache and security headers present                         |
| `/auth/sign-up`                 | HTTP/2 200 | Private no-store cache and security headers present                         |
| `/dashboard`                    | HTTP/2 200 | Private no-store cache and security headers present                         |

All checked routes include `x-robots-tag: noindex`, consistent with protected
Preview deployment behavior.
