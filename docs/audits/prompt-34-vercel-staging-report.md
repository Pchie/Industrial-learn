# Prompt 34 Vercel Staging Report

Date: 2026-07-31

## Executive Verdict

CONDITIONAL PASS FOR REPOSITORY CONFIGURATION; LIVE VERCEL DEPLOYMENT PENDING

Repository-side Vercel staging configuration, branch deployment controls,
security headers, private cache headers, deployment documentation, and a
separate Vercel staging project were created. Secret environment-variable upload
and deployed URL verification require explicit operator approval before staging
credentials are transferred to Vercel.

No production deployment was configured. No secrets were printed or committed.

## Repository State Reviewed

| Item                | Result             |
| ------------------- | ------------------ |
| Current branch      | `development`      |
| Web application     | `apps/web`         |
| Monorepo root       | Repository root    |
| Package manager     | npm                |
| Install command     | `npm ci`           |
| Build command       | `npm run build`    |
| Output directory    | `apps/web/.next`   |
| Framework           | Next.js App Router |
| Node version target | 22.x               |

## Vercel Configuration

`vercel.json` now defines:

- Next.js framework detection
- repository-root install and build commands
- `apps/web/.next` output directory
- `development` branch deployment enabled
- `main` branch automatic deployment disabled

Feature branches remain eligible for preview deployments unless restricted in the
Vercel dashboard. Production deployment remains disabled for this prompt.

## Environment Configuration Status

Required staging variables are documented in
`docs/deployment/vercel-staging-setup.md`.

Live Vercel environment variables were configured after explicit operator
approval. Values were read from the ignored local staging environment file and
uploaded without printing the values. The project exists as
`kolobe/industrial-learn-staging`.

Staging must use:

- `NEXT_PUBLIC_APP_ENV=staging`
- `INDUSTRIAL_LEARN_AUTH_MODE=supabase`
- `INDUSTRIAL_LEARN_E2E=false` or unset
- staging Supabase URL and anon key
- staging server-only service-role key
- staging-only `APP_BASE_URL`

## Authentication Callback Status

Supabase staging project `lgjujyaclrpaopdabyzg` is ready at the database/RLS
level from Prompt 33. Supabase auth callback configuration still requires the
final Vercel staging URL.

Do not add broad wildcard redirects. Add only the final staging URL and any
approved protected preview URLs.

## Security Header Status

Security headers were added through `apps/web/next.config.ts`:

- `Content-Security-Policy`
- `Referrer-Policy`
- `X-Content-Type-Options`
- `X-Frame-Options`
- `Permissions-Policy`
- `Strict-Transport-Security`

Temporary CSP relaxation:

- inline scripts and styles are currently allowed for Next.js runtime
  compatibility
- Supabase HTTP and realtime connections are allowed

## Cache-Control Status

Private routes now receive `Cache-Control: private, no-store, max-age=0,
must-revalidate`:

- `/dashboard`
- `/my-learning`
- `/assessments`
- `/simulations/history`
- `/projects`
- `/author`
- `/review`
- `/admin`

## CI And Deployment Relationship

GitHub CI runs on pushes and pull requests for `development` and `main`.
Vercel Git deployments may still be created before GitHub CI completes unless
Vercel deployment protection or a GitHub Actions-controlled deploy process is
configured. Production deployment is disabled in repository configuration for
`main`.

Recommended production process later:

1. Require GitHub CI before merge to `main`.
2. Keep automatic `main` deployment disabled until production approval.
3. Use Vercel deployment checks or a GitHub Actions-controlled deploy.
4. Promote only a staging-verified commit.

## Live Deployment Status

| Requirement                         | Status                                               |
| ----------------------------------- | ---------------------------------------------------- |
| Vercel staging project exists       | Complete: `kolobe/industrial-learn-staging`          |
| Development branch deployment works | Pending live Vercel deployment                       |
| Staging Supabase connected          | Vercel preview/development env variables configured  |
| Test auth disabled                  | Configured as `INDUSTRIAL_LEARN_AUTH_MODE=supabase`  |
| Authentication callbacks work       | Pending staging URL and Supabase dashboard update    |
| Private data not publicly cached    | Configured in Next.js; pending deployed header check |
| Security headers reviewed           | Configured in Next.js; pending deployed header check |
| Preview deployment risks documented | Complete                                             |
| No production deployment enabled    | Repository config disables `main` auto-deploy        |
| No secrets in Git/logs              | Passed local secret scan                             |

## Commands Run

| Command                                                                                                                                                                                            | Result                                                       |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `git status --short --branch`                                                                                                                                                                      | Clean at start on `development`                              |
| `npx --yes vercel whoami`                                                                                                                                                                          | Passed after device login; authenticated as `pchie`          |
| `npx --yes vercel link --yes --team kolobe --project industrial-learn-staging`                                                                                                                     | Passed; created and linked `kolobe/industrial-learn-staging` |
| `npx --yes vercel project update industrial-learn-staging --scope kolobe --framework nextjs --install-command "npm ci" --build-command "npm run build" --output-directory "apps/web/.next" --json` | Passed; settings matched repository configuration            |
| `npx --yes vercel ls industrial-learn-staging --scope kolobe`                                                                                                                                      | Passed; no deployments existed yet                           |
| Repository inspection commands                                                                                                                                                                     | Completed                                                    |
| Vercel staging secret upload                                                                                                                                                                       | Passed after explicit operator approval                      |
| `npx --yes vercel env list preview development --scope kolobe`                                                                                                                                     | Passed; expected keys present and encrypted                  |
| `npm run scan:secrets`                                                                                                                                                                             | Passed                                                       |
| `npm run format:check`                                                                                                                                                                             | Passed                                                       |
| `npm run typecheck`                                                                                                                                                                                | Passed                                                       |
| `npm run lint`                                                                                                                                                                                     | Passed                                                       |
| `npm run validate:content`                                                                                                                                                                         | Passed; 7 tests passed                                       |
| `npm run validate:migrations`                                                                                                                                                                      | Passed; 8 tests passed                                       |
| `npm run test:unit`                                                                                                                                                                                | Passed; 148 tests passed, 4 skipped                          |
| `npm run build`                                                                                                                                                                                    | Passed                                                       |
| `npm run test:e2e`                                                                                                                                                                                 | Passed; 61 Playwright tests passed                           |
| `npm run test:smoke`                                                                                                                                                                               | Passed after clean sequential run; 5 Playwright tests passed |
| Local header probe against `next start`                                                                                                                                                            | Passed; security headers present and private routes no-store |

## Known Limitations

- Live deployment URL verification is still pending until Vercel creates the
  development-branch deployment.
- Supabase callback URLs cannot be finalized until the staging URL exists.
- Vercel protected preview settings require dashboard/API access.
- Deployed header, auth, performance, and smoke verification remain pending.

## Prompt 35 Readiness

Prompt 35 should wait until a live Vercel staging URL exists and the verification
matrix in `docs/deployment/staging-url-verification.md` is completed.
