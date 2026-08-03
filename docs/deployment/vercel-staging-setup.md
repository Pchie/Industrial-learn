# Vercel Staging Setup

Date: 2026-08-03

## Purpose

This document records the Industrial Learn Vercel staging deployment connected
to the GitHub `development` workflow. It covers repository configuration,
environment variables, branch behavior, authentication callbacks, and production
deployment separation.

## Source IDs

- IL-AGENTS-001: `AGENTS.md`
- IL-DEPLOY-ENV-001: `docs/deployment/environment-strategy.md`
- IL-DEPLOY-CI-001: `docs/deployment/ci-pipeline.md`
- IL-STAGING-DB-001: `docs/audits/prompt-33-staging-database-report.md`
- IL-P33B-RLS-001: `docs/audits/prompt-33b-content-rls-remediation.md`

## Repository Configuration

| Item                 | Configuration                                     |
| -------------------- | ------------------------------------------------- |
| Monorepo root        | Repository root                                   |
| Web app              | `apps/web`                                        |
| Package manager      | npm with `package-lock.json`                      |
| Install command      | `npm ci`                                          |
| Build command        | `npm run build`                                   |
| Build implementation | `npm run build --workspace @industrial-learn/web` |
| Output directory     | `apps/web/.next`                                  |
| Framework            | Next.js App Router                                |
| Node.js              | Vercel project currently reports Node.js 24.x     |
| Production branch    | Not enabled by this task                          |

`vercel.json` defines:

- `framework: "nextjs"`
- `installCommand: "npm ci"`
- `buildCommand: "npm run build"`
- `outputDirectory: "apps/web/.next"`
- `git.deploymentEnabled.development: true`
- `git.deploymentEnabled.main: false`

## Vercel Project

| Setting               | Verified value                                                          |
| --------------------- | ----------------------------------------------------------------------- |
| Git repository        | `Pchie/industrial-learn`                                                |
| Vercel project        | `kolobe/industrial-learn-staging`                                       |
| Project root          | Repository root                                                         |
| Framework preset      | Next.js                                                                 |
| Build command         | `npm run build`                                                         |
| Install command       | `npm ci`                                                                |
| Output directory      | `apps/web/.next`                                                        |
| Node.js version       | 24.x                                                                    |
| Deployment branch     | `development` Preview deployment                                        |
| Staging URL           | `https://industrial-learn-staging-git-development-kolobe.vercel.app`    |
| Latest verified build | `https://industrial-learn-staging-ul21u9dwv-kolobe.vercel.app`          |
| Deployment ID         | `dpl_B64u3povPscRgRawWLcWJcgwUSnY`                                      |
| Deployment target     | Preview                                                                 |
| Production deployment | `main` automatic deployment disabled by repository Vercel configuration |

The `development` branch Preview deployment is the Industrial Learn staging
deployment. Do not promote or deploy `main` during staging verification.

## Staging Environment Variables

Vercel environment variable names are configured for the `development`
staging/Preview scope. Values are encrypted in Vercel and are not recorded in
Git.

| Variable                        | Vercel scope            | Secret?    | Required value policy                                                |
| ------------------------------- | ----------------------- | ---------- | -------------------------------------------------------------------- |
| `NODE_ENV`                      | Development and Preview | No         | `production` for deployed staging                                    |
| `NEXT_PUBLIC_APP_ENV`           | Development and Preview | No         | `staging`                                                            |
| `APP_BASE_URL`                  | Development and Preview | No         | `https://industrial-learn-staging-git-development-kolobe.vercel.app` |
| `NEXT_PUBLIC_SUPABASE_URL`      | Development and Preview | No         | Staging Supabase project URL                                         |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Development and Preview | Public key | Staging anon key only                                                |
| `SUPABASE_SERVICE_ROLE_KEY`     | Development and Preview | Yes        | Staging service-role key only                                        |
| `SUPABASE_PROJECT_REF`          | Development and Preview | No         | `lgjujyaclrpaopdabyzg`                                               |
| `SUPABASE_DB_URL`               | Development and Preview | Yes        | Staging migration/operator value; never browser-exposed              |
| `INDUSTRIAL_LEARN_AUTH_MODE`    | Development and Preview | No         | `supabase`                                                           |
| `INDUSTRIAL_LEARN_E2E`          | Development and Preview | No         | `false` or unset                                                     |

The service-role key is required by the current server-side profile creation
path. Do not expose it to browser code. Do not provide production credentials to
this project.

## Branch Rules

| Branch           | Deployment behavior                                               |
| ---------------- | ----------------------------------------------------------------- |
| `development`    | Creates the staging Preview deployment                            |
| feature branches | May create protected previews; do not grant broad staging secrets |
| `main`           | Automatic deployment disabled in `vercel.json`                    |

GitHub CI runs on pushes and pull requests to `development` and `main`. Vercel
may create a Preview deployment before CI completes; production must later use a
stronger gate such as Vercel deployment checks or a GitHub Actions-controlled
promotion.

## Supabase Authentication Callbacks

The Supabase staging project `lgjujyaclrpaopdabyzg` is configured for the
development-branch staging URL.

| Supabase setting              | Required value                                                                           |
| ----------------------------- | ---------------------------------------------------------------------------------------- |
| Site URL                      | `https://industrial-learn-staging-git-development-kolobe.vercel.app`                     |
| Sign-up verification redirect | `https://industrial-learn-staging-git-development-kolobe.vercel.app/auth/verify`         |
| Password reset redirect       | `https://industrial-learn-staging-git-development-kolobe.vercel.app/auth/reset-password` |
| Sign-in/sign-out return       | `https://industrial-learn-staging-git-development-kolobe.vercel.app/auth/sign-in`        |

Application server actions now build Supabase callback URLs from
`APP_BASE_URL`, so staging sends absolute allowlisted callback URLs rather than
relative paths.

## Security Headers

`apps/web/next.config.ts` defines:

- `Content-Security-Policy`
- `Referrer-Policy`
- `X-Content-Type-Options`
- `X-Frame-Options`
- `Permissions-Policy`
- `Strict-Transport-Security`

Temporary CSP relaxation:

- inline scripts and styles are allowed for current Next.js runtime output
- Supabase HTTP and realtime connections are allowed

## Cache Control

Private learning and governance routes receive:

```text
Cache-Control: private, no-store, max-age=0, must-revalidate
```

Covered routes:

- `/dashboard`
- `/my-learning`
- `/assessments`
- `/simulations/history`
- `/projects`
- `/author`
- `/review`
- `/admin`

Public catalogue and approved lesson routes may use normal public caching with
controlled revalidation behavior.

## Production Enablement Later

Production should be enabled only after a separate production-release prompt:

1. Confirm `main` branch protection and required CI checks.
2. Configure a separate production Supabase project and production Vercel
   environment.
3. Require staging evidence for the exact release commit.
4. Enable production deployment only after named approval.
5. Record rollback target, backup status, and monitoring owner.
