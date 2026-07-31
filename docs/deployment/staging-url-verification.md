# Staging URL Verification

Date: 2026-07-31

## Status

The `development` branch Preview deployment on `kolobe/industrial-learn` is the
Industrial Learn staging deployment. Branch-scoped Preview environment variables
are configured for `development`. This document tracks deployed staging
verification evidence.

## Required URL

| Item                  | Value                                                        |
| --------------------- | ------------------------------------------------------------ |
| Staging URL           | `https://industrial-learn-git-development-kolobe.vercel.app` |
| Branch                | `development`                                                |
| Supabase project      | `lgjujyaclrpaopdabyzg`                                       |
| Auth mode             | `supabase`                                                   |
| Test auth             | Disabled                                                     |
| Production deployment | Disabled for `main`                                          |

## Verification Matrix

| Area                  | Route or action                   | Required result                     | Status  |
| --------------------- | --------------------------------- | ----------------------------------- | ------- |
| Homepage              | `/`                               | Public shell renders                | Pending |
| Curriculum            | `/learn`                          | Curriculum catalogue renders        | Pending |
| Public lesson         | `/lessons/basic-fluid-pressure`   | Published lesson renders            | Pending |
| Sign-up               | `/auth/sign-up`                   | Staging Supabase account flow works | Pending |
| Sign-in               | `/auth/sign-in`                   | Synthetic staging user signs in     | Pending |
| Email verification    | `/auth/verify`                    | Redirect allowlist works            | Pending |
| Password reset        | `/auth/reset-password`            | Redirect allowlist works            | Pending |
| Dashboard             | `/dashboard`                      | Authenticated student sees own data | Pending |
| Protected denial      | `/dashboard` unauthenticated      | Redirects to sign-in                | Pending |
| Cross-student privacy | Dashboard query tampering         | No other student data shown         | Pending |
| Author route          | `/author`                         | Author role can access              | Pending |
| Reviewer route        | `/review`                         | Reviewer role can access            | Pending |
| Draft protection      | Student opens author/review tools | Access denied                       | Pending |
| Sign-out              | `/auth/sign-out`                  | Session clears                      | Pending |

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
