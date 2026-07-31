# Staging URL Verification

Date: 2026-07-31

## Status

The `development` branch Preview deployment on `kolobe/industrial-learn` is the
Industrial Learn staging deployment. Branch-scoped Preview environment variables
are configured for `development`. The latest Preview deployment is ready, but
unauthenticated automated route checks are intercepted by Vercel SSO/protection
before the application responds. This document tracks deployed staging
verification evidence.

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

| Area                  | Route or action                   | Required result                     | Status                           |
| --------------------- | --------------------------------- | ----------------------------------- | -------------------------------- |
| Homepage              | `/`                               | Public shell renders                | Blocked by Vercel SSO/protection |
| Curriculum            | `/learn`                          | Curriculum catalogue renders        | Blocked by Vercel SSO/protection |
| Public lesson         | `/lessons/basic-fluid-pressure`   | Published lesson renders            | Pending                          |
| Sign-up               | `/auth/sign-up`                   | Staging Supabase account flow works | Pending                          |
| Sign-in               | `/auth/sign-in`                   | Synthetic staging user signs in     | Pending                          |
| Email verification    | `/auth/verify`                    | Redirect allowlist works            | Pending                          |
| Password reset        | `/auth/reset-password`            | Redirect allowlist works            | Pending                          |
| Dashboard             | `/dashboard`                      | Authenticated student sees own data | Blocked by Vercel SSO/protection |
| Protected denial      | `/dashboard` unauthenticated      | Redirects to sign-in                | Pending                          |
| Cross-student privacy | Dashboard query tampering         | No other student data shown         | Pending                          |
| Author route          | `/author`                         | Author role can access              | Pending                          |
| Reviewer route        | `/review`                         | Reviewer role can access            | Pending                          |
| Draft protection      | Student opens author/review tools | Access denied                       | Pending                          |
| Sign-out              | `/auth/sign-out`                  | Session clears                      | Pending                          |

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
