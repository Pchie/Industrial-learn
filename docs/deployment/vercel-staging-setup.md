# Vercel Staging Setup

Date: 2026-07-31

## Purpose

This document defines the Industrial Learn Vercel staging deployment plan for the
`development` branch. It covers repository configuration, environment variables,
branch behavior, and live setup steps without enabling production deployment.

## Source IDs

- IL-AGENTS-001: `AGENTS.md`
- IL-DEPLOY-ENV-001: `docs/deployment/environment-strategy.md`
- IL-DEPLOY-CI-001: `docs/deployment/ci-pipeline.md`
- IL-STAGING-DB-001: `docs/audits/prompt-33-staging-database-report.md`
- VERCEL-GIT-001: Vercel Git configuration documentation,
  `https://vercel.com/docs/project-configuration/git-configuration`, reviewed
  2026-07-31

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
| Node.js              | `>=22.0.0`; Vercel project should use Node.js 22  |
| Production branch    | Not enabled by this task                          |

`vercel.json` contains the static project configuration used by Vercel:

- `framework: "nextjs"`
- `installCommand: "npm ci"`
- `buildCommand: "npm run build"`
- `outputDirectory: "apps/web/.next"`
- `git.deploymentEnabled.development: true`
- `git.deploymentEnabled.main: false`

The `development` branch Preview deployment is the Industrial Learn staging
deployment. The `main` branch remains blocked from automatic Vercel production
deployment until a separate production-release prompt approves it.

## Required Vercel Project Settings

Use the existing Vercel project for branch-based staging:

| Setting               | Required value                                               |
| --------------------- | ------------------------------------------------------------ |
| Git repository        | `Pchie/industrial-learn`                                     |
| Vercel project        | `kolobe/industrial-learn`                                    |
| Project root          | Repository root                                              |
| Framework preset      | Next.js                                                      |
| Build command         | Use repository `vercel.json`                                 |
| Install command       | Use repository `vercel.json`                                 |
| Output directory      | Use repository `vercel.json`                                 |
| Node.js version       | 22.x                                                         |
| Deployment branch     | `development` Preview deployment                             |
| Staging URL           | `https://industrial-learn-git-development-kolobe.vercel.app` |
| Production deployment | Disabled for `main`                                          |

Do not promote or deploy `main` during this task.

## Staging Environment Variables

Set these in the Vercel project for the staging runtime. Do not paste real values
into repository files, build logs, screenshots, or reports.

| Variable                        | Vercel scope                 | Secret?    | Required value policy                                        |
| ------------------------------- | ---------------------------- | ---------- | ------------------------------------------------------------ |
| `NODE_ENV`                      | Preview/staging runtime      | No         | `production`                                                 |
| `NEXT_PUBLIC_APP_ENV`           | Preview/staging runtime      | No         | `staging`                                                    |
| `APP_BASE_URL`                  | Preview/staging runtime      | No         | `https://industrial-learn-git-development-kolobe.vercel.app` |
| `NEXT_PUBLIC_SUPABASE_URL`      | Preview/staging runtime      | No         | Staging Supabase project URL                                 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Preview/staging runtime      | Public key | Staging anon key only                                        |
| `SUPABASE_SERVICE_ROLE_KEY`     | Trusted staging runtime only | Yes        | Staging service-role key only                                |
| `SUPABASE_PROJECT_REF`          | Trusted staging runtime only | No         | `lgjujyaclrpaopdabyzg`                                       |
| `SUPABASE_DB_URL`               | Migration operators only     | Yes        | Do not expose to untrusted previews                          |
| `INDUSTRIAL_LEARN_AUTH_MODE`    | Preview/staging runtime      | No         | `supabase`                                                   |
| `INDUSTRIAL_LEARN_E2E`          | Preview/staging runtime      | No         | `false` or unset                                             |

Preview deployments from untrusted pull requests must not receive
`SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_DB_URL`. If Vercel preview deployments
are enabled for feature branches, use protected previews and limit data to
synthetic staging records.

## Supabase Authentication Callbacks

Configure the Supabase staging project with the development-branch Preview URL:

| Supabase setting              | Required value                                                   |
| ----------------------------- | ---------------------------------------------------------------- |
| Site URL                      | `https://industrial-learn-git-development-kolobe.vercel.app`     |
| Sign-in redirect              | `${APP_BASE_URL}/auth/verify` where used by Supabase email flows |
| Sign-up verification redirect | `${APP_BASE_URL}/auth/verify`                                    |
| Password reset redirect       | `${APP_BASE_URL}/auth/reset-password`                            |
| Sign-out return               | `${APP_BASE_URL}/auth/sign-in`                                   |
| Preview redirects             | Add only named approved preview URLs needed for testing          |

Do not use broad wildcard redirects unless Vercel protected previews and a
reviewed preview policy are in place.

## Security Headers

`apps/web/next.config.ts` defines baseline security headers:

- `Content-Security-Policy`
- `Referrer-Policy`
- `X-Content-Type-Options`
- `X-Frame-Options`
- `Permissions-Policy`
- `Strict-Transport-Security`

The current CSP allows:

- same-origin application resources
- Supabase HTTP and realtime connections
- inline scripts/styles required by the current Next.js application output

The inline allowances are temporary and should be tightened later with nonce or
hash support once the app has a reviewed CSP implementation.

## Cache Control

Private learning and governance routes receive explicit `Cache-Control:
private, no-store, max-age=0, must-revalidate` headers:

- `/dashboard`
- `/my-learning`
- `/assessments`
- `/simulations/history`
- `/projects`
- `/author`
- `/review`
- `/admin`

Public catalogue and lesson routes may use normal Next.js/Vercel caching where
the content is public and approved for student use.

## Deployment Commands

After authenticating the Vercel CLI:

```bash
npx --yes vercel ls industrial-learn --scope kolobe
npx --yes vercel inspect https://industrial-learn-git-development-kolobe.vercel.app --scope kolobe
```

For Git-connected deployment, push `development` after local validation and
verify that Vercel creates a Preview deployment for
`industrial-learn-git-development-kolobe.vercel.app`.

## Production Enablement Later

Production should be enabled only after a separate production-release prompt:

1. Create or select the production Vercel project/environment.
2. Configure production Supabase variables separately.
3. Confirm GitHub branch protection on `main`.
4. Require CI and staging evidence before production promotion.
5. Remove or change the `main` deployment block only after approval.
6. Record rollback target and monitoring owner.
