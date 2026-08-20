# Staging URL Verification

Date: 2026-08-03

## Status

The `development` branch Preview deployment on
`kolobe/industrial-learn-staging` is the Industrial Learn staging deployment.
Branch-scoped Preview environment variables are configured for `development`.
The latest verified Preview deployment is ready.

Unauthenticated automated route checks are intercepted by Vercel
SSO/protection, so deployed route/header checks use Vercel's automation
protection bypass through authenticated Vercel CLI requests.

## Required URL

| Item                  | Value                                                                |
| --------------------- | -------------------------------------------------------------------- |
| Staging URL           | `https://industrial-learn-staging-git-development-kolobe.vercel.app` |
| Branch                | `development`                                                        |
| Commit                | `4185c16`                                                            |
| Deployment URL        | `https://industrial-learn-staging-ul21u9dwv-kolobe.vercel.app`       |
| Deployment ID         | `dpl_B64u3povPscRgRawWLcWJcgwUSnY`                                   |
| Deployment status     | Ready                                                                |
| Deployment target     | Preview                                                              |
| Vercel project        | `kolobe/industrial-learn-staging`                                    |
| Supabase project      | `lgjujyaclrpaopdabyzg`                                               |
| Auth mode             | `supabase`                                                           |
| Test auth             | Disabled                                                             |
| Production deployment | Disabled for `main` in repository Vercel configuration               |
| Supabase Site URL     | `https://industrial-learn-staging-git-development-kolobe.vercel.app` |

## Verification Matrix

| Area                  | Route or action                   | Required result                       | Status |
| --------------------- | --------------------------------- | ------------------------------------- | ------ |
| Homepage              | `/`                               | Public shell renders                  | Passed |
| Curriculum            | `/learn`                          | Curriculum catalogue renders          | Passed |
| Public lesson         | `/lessons/basic-fluid-pressure`   | Published lesson renders              | Passed |
| Sign-up route         | `/auth/sign-up`                   | Registration form renders safely      | Passed |
| Sign-in               | `/auth/sign-in`                   | Synthetic staging student signs in    | Passed |
| Email verification    | `/auth/verify`                    | Exact redirect allowlist configured   | Passed |
| Password reset        | `/auth/forgot-password`           | Safe reset request status returned    | Passed |
| Dashboard             | `/dashboard`                      | Authenticated student sees own data   | Passed |
| Protected denial      | `/dashboard` unauthenticated      | Redirects to sign-in                  | Passed |
| Cross-student privacy | Dashboard query tampering         | Covered by local E2E and RLS checks   | Passed |
| Author route          | `/author`                         | Author role can access                | Passed |
| Reviewer route        | `/review`                         | Reviewer role can access              | Passed |
| Draft protection      | Student opens author/review tools | Access denied                         | Passed |
| Sign-out              | `/auth/sign-out`                  | Session clears                        | Passed |
| Not found             | invalid route                     | Safe not-found page, no raw internals | Passed |

Note: the final post-deployment interactive browser retest was stopped by the
browser automation safety reviewer on the protected staging URL. The callback
fix was therefore verified by local tests, successful build, GitHub CI, Vercel
deployment status, and final read-only route/header checks. Pre-fix browser
testing proved sign-in, dashboard, author, reviewer, denial, and sign-out flows
with synthetic staging accounts.

## Performance Baseline

Authenticated `vercel curl` checks against the final staging alias:

| Route                           | Response status | Approximate response time | Notes                        |
| ------------------------------- | --------------- | ------------------------- | ---------------------------- |
| `/`                             | 200             | 0.142 s                   | Static/prerendered shell     |
| `/learn`                        | 200             | 0.898 s                   | Curriculum catalogue         |
| `/lessons/basic-fluid-pressure` | 200             | 1.090 s                   | Published pilot lesson       |
| `/dashboard`                    | 200             | 0.401 s                   | Private route, sign-in state |
| `/auth/sign-in`                 | 200             | 0.506 s                   | Auth form route              |

Build output showed the expected Next.js App Router route map with 50 generated
static pages and dynamic server-rendered private/auth routes. No major client
bundle anomaly was identified during Prompt 34 verification.

## Error-State Checks

| Scenario              | Expected behavior                  | Status                                   |
| --------------------- | ---------------------------------- | ---------------------------------------- |
| Supabase unavailable  | Safe application error, no secrets | Covered by safe auth/network error paths |
| Session expires       | Redirect or safe auth error        | Covered by auth session tests            |
| Missing profile       | Safe profile/setup error           | Covered by auth provider behavior        |
| Database query fails  | Safe dashboard error               | Covered by E2E failure-path test         |
| Required env missing  | Build/runtime fails closed         | Covered by env validation                |
| User lacks permission | Access denied without internals    | Passed with student author/review denial |
| Route does not exist  | Not-found page renders             | Passed                                   |

## Header Verification

Final authenticated Vercel CLI header checks confirmed:

| Route          | Status     | Cache result                                              | Security headers |
| -------------- | ---------- | --------------------------------------------------------- | ---------------- |
| `/`            | HTTP/2 200 | `public, max-age=0, must-revalidate`                      | Present          |
| `/dashboard`   | HTTP/2 200 | `private, no-cache, no-store, max-age=0, must-revalidate` | Present          |
| `/assessments` | HTTP/2 200 | `private, no-cache, no-store, max-age=0, must-revalidate` | Present          |
| `/review`      | HTTP/2 200 | `private, no-cache, no-store, max-age=0, must-revalidate` | Present          |

Security headers included CSP, HSTS, X-Frame-Options,
X-Content-Type-Options, Referrer-Policy, Permissions-Policy, and `noindex`.

## Supabase Redirect Configuration

Supabase Auth URL configuration was updated in the dedicated staging project
`lgjujyaclrpaopdabyzg`.

| Setting        | Value                                                                                    |
| -------------- | ---------------------------------------------------------------------------------------- |
| Site URL       | `https://industrial-learn-staging-git-development-kolobe.vercel.app`                     |
| Redirect URL 1 | `https://industrial-learn-staging-git-development-kolobe.vercel.app/auth/verify`         |
| Redirect URL 2 | `https://industrial-learn-staging-git-development-kolobe.vercel.app/auth/reset-password` |
| Redirect URL 3 | `https://industrial-learn-staging-git-development-kolobe.vercel.app/auth/sign-in`        |

No wildcard redirect URLs were added.
