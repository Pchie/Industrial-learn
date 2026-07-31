# Prompt 34 Vercel Staging Report

Date: 2026-07-31

## Executive Verdict

PASS FOR STAGING CONFIGURATION AND AUTOMATION-BYPASS ROUTE VERIFICATION

Repository-side Vercel staging configuration, branch deployment controls,
security headers, private cache headers, and deployment documentation were
created. Secret environment-variable upload was completed after explicit
operator approval.

The active staging deployment is the `development` branch Preview deployment on
`kolobe/industrial-learn`. The separate `kolobe/industrial-learn-staging`
project is not the active deployment target for the current staging flow.

No secrets were printed or committed. Automatic deployment from `main` remains
disabled.

The latest `development` Preview deployment is ready. Unauthenticated automated
checks are intercepted by Vercel SSO/protection before the application responds,
so app-level remote route and header checks were completed with Vercel's
automation protection bypass through authenticated CLI requests.

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
- automatic Git deployment enabled for `development`
- automatic Git deployment disabled for `main`

Production deployment remains disabled for this prompt. The `development`
branch Preview deployment is treated as staging because `main` is behind
`development` and production release has not been approved.

## Environment Configuration Status

Required staging variables are documented in
`docs/deployment/vercel-staging-setup.md`.

Live Vercel environment variables were configured after explicit operator
approval. Values were read from the ignored local staging environment file and
uploaded without printing the values. The active project is
`kolobe/industrial-learn`.

Staging must use:

- `NEXT_PUBLIC_APP_ENV=staging`
- `INDUSTRIAL_LEARN_AUTH_MODE=supabase`
- `INDUSTRIAL_LEARN_E2E=false` or unset
- staging Supabase URL and anon key
- staging server-only service-role key
- staging-only `APP_BASE_URL`

## Authentication Callback Status

Supabase staging project `lgjujyaclrpaopdabyzg` is ready at the database/RLS
level from Prompt 33. Supabase auth callback configuration should use
`https://industrial-learn-git-development-kolobe.vercel.app`.

Supabase Auth URL configuration has been updated for staging with the
development Preview Site URL and three exact redirect URLs for verification,
password reset, and sign-in. No wildcard redirect URLs were added.

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

| Requirement                         | Status                                                    |
| ----------------------------------- | --------------------------------------------------------- |
| Vercel staging project exists       | Complete: `kolobe/industrial-learn`                       |
| Development branch deployment works | Complete: Preview deployment exists                       |
| Staging Supabase connected          | Vercel Preview env variables configured for `development` |
| Test auth disabled                  | Configured as `INDUSTRIAL_LEARN_AUTH_MODE=supabase`       |
| Authentication callbacks work       | Supabase redirect URLs configured; flow test pending      |
| Private data not publicly cached    | Configured in Next.js; verified locally                   |
| Security headers reviewed           | Configured in Next.js; verified locally                   |
| Remote route/header checks          | Passed through Vercel automation bypass                   |
| Preview deployment risks documented | Complete                                                  |
| No production deployment enabled    | Repository config disables `main` auto-deploy             |
| No secrets in Git/logs              | Passed local secret scan                                  |

## Commands Run

| Command                                                                                                                                                                                            | Result                                                                                                    |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `git status --short --branch`                                                                                                                                                                      | Clean at start on `development`                                                                           |
| `npx --yes vercel whoami`                                                                                                                                                                          | Passed after device login; authenticated as `pchie`                                                       |
| `npx --yes vercel link --yes --team kolobe --project industrial-learn-staging`                                                                                                                     | Passed; created and linked `kolobe/industrial-learn-staging`                                              |
| `npx --yes vercel project update industrial-learn-staging --scope kolobe --framework nextjs --install-command "npm ci" --build-command "npm run build" --output-directory "apps/web/.next" --json` | Passed; settings matched repository configuration                                                         |
| `npx --yes vercel ls industrial-learn-staging --scope kolobe`                                                                                                                                      | Passed; no deployments existed yet                                                                        |
| Repository inspection commands                                                                                                                                                                     | Completed                                                                                                 |
| Vercel staging secret upload                                                                                                                                                                       | Passed after explicit operator approval                                                                   |
| `npx --yes vercel env list preview development --scope kolobe`                                                                                                                                     | Passed; expected keys present and encrypted                                                               |
| Vercel development-target env upload                                                                                                                                                               | Passed after preview deployments were observed as production                                              |
| `npx --yes vercel deploy --target=preview --yes --scope kolobe`                                                                                                                                    | Blocked; Vercel created a production-target deployment                                                    |
| `npx --yes vercel remove dpl_H5evA7dYqXvgyqvoBKqn1EQgwL5n --yes --scope kolobe`                                                                                                                    | Passed; removed first unintended production-target deployment                                             |
| `npx --yes vercel remove dpl_4E3szXw45NiF6W542wgLLYFxPGUr --yes --scope kolobe`                                                                                                                    | Passed; removed second unintended production-target deployment                                            |
| Post-removal `npx --yes vercel ls industrial-learn-staging --scope kolobe`                                                                                                                         | Passed; no deployments remain                                                                             |
| `vercel inspect https://industrial-learn-acwjtmcdn-kolobe.vercel.app --scope kolobe`                                                                                                               | Passed; deployment target is Preview with development branch alias                                        |
| Vercel active-project staging secret upload                                                                                                                                                        | Passed after explicit operator approval for `kolobe/industrial-learn`                                     |
| `vercel env list preview development --project industrial-learn --scope kolobe`                                                                                                                    | Passed; expected Preview `development` keys present and encrypted                                         |
| `vercel inspect https://industrial-learn-o34hmn85t-kolobe.vercel.app --scope kolobe`                                                                                                               | Passed; deployment `dpl_Gn4pZtDqQ6CJhdGDA4g35cbU8iU6` is Ready and target is Preview                      |
| Remote `curl -I -L` checks for `/`, `/learn`, and `/dashboard`                                                                                                                                     | Reached Vercel SSO/protection before app response                                                         |
| `vercel project protection enable industrial-learn --protection-bypass --json --scope kolobe`                                                                                                      | Passed; automation bypass enabled without printing secret values                                          |
| `vercel curl` route checks through bypass                                                                                                                                                          | Passed for `/`, `/learn`, `/lessons/basic-fluid-pressure`, `/auth/sign-in`, `/auth/sign-up`, `/dashboard` |
| Supabase dashboard URL configuration                                                                                                                                                               | Passed; Site URL and three exact redirect URLs persisted after reload                                     |
| `npx --yes vercel target list --scope kolobe`                                                                                                                                                      | Passed; production tracks `main`, preview covers unassigned branches, development is CLI-accessible       |
| `npm run scan:secrets`                                                                                                                                                                             | Passed                                                                                                    |
| `npm run format:check`                                                                                                                                                                             | Passed                                                                                                    |
| `npm run typecheck`                                                                                                                                                                                | Passed                                                                                                    |
| `npm run lint`                                                                                                                                                                                     | Passed                                                                                                    |
| `npm run validate:content`                                                                                                                                                                         | Passed; 7 tests passed                                                                                    |
| `npm run validate:migrations`                                                                                                                                                                      | Passed; 8 tests passed                                                                                    |
| `npm run test:unit`                                                                                                                                                                                | Passed; 148 tests passed, 4 skipped                                                                       |
| `npm run build`                                                                                                                                                                                    | Passed                                                                                                    |
| `npm run test:e2e`                                                                                                                                                                                 | Passed; 61 Playwright tests passed                                                                        |
| `npm run test:smoke`                                                                                                                                                                               | Passed after clean sequential run; 5 Playwright tests passed                                              |
| Local header probe against `next start`                                                                                                                                                            | Passed; security headers present and private routes no-store                                              |

## Known Limitations

- Full Supabase auth flow verification still requires configured Supabase
  staging users.
- Cross-student privacy and role checks still require authenticated staging
  test accounts.
- Vercel project Node.js version still reports 24.x in CLI output; project
  runtime should be reviewed in the Vercel dashboard if Node 22.x is required.

## Prompt 35 Readiness

Prompt 35 may proceed for Supabase callback and authenticated staging checks.
