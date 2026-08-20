# Prompt 34 Vercel Staging Report

Date: 2026-08-03

## Executive Verdict

CONDITIONAL PASS FOR STAGING WEB DEPLOYMENT

The Industrial Learn staging web deployment is configured on Vercel and
connected to the GitHub `development` workflow. The final verified staging URL
is:

`https://industrial-learn-staging-git-development-kolobe.vercel.app`

The staging deployment uses the dedicated Supabase staging project
`lgjujyaclrpaopdabyzg`, Supabase authentication, encrypted Vercel environment
variables, protected Preview access, and synthetic staging users. GitHub CI
passed for the deployed commit.

The pass is conditional because Vercel can still create Preview deployments
before GitHub CI completes, and the final post-deployment interactive browser
sign-up retest was blocked by the browser automation safety reviewer on the
protected staging URL. The underlying callback defect found during Prompt 34 was
fixed, locally tested, built, pushed, deployed, and CI-verified.

No production database or production deployment was configured.

## Final Deployment

| Item              | Value                                                                |
| ----------------- | -------------------------------------------------------------------- |
| Repository branch | `development`                                                        |
| Commit            | `4185c16`                                                            |
| GitHub CI         | Passed, run `30847199703`                                            |
| Vercel project    | `kolobe/industrial-learn-staging`                                    |
| Deployment target | Preview                                                              |
| Deployment ID     | `dpl_B64u3povPscRgRawWLcWJcgwUSnY`                                   |
| Deployment URL    | `https://industrial-learn-staging-ul21u9dwv-kolobe.vercel.app`       |
| Stable alias      | `https://industrial-learn-staging-git-development-kolobe.vercel.app` |
| Deployment status | Ready                                                                |
| Supabase project  | `lgjujyaclrpaopdabyzg`                                               |

## Repository And Project Configuration

| Item                 | Verified value                                    |
| -------------------- | ------------------------------------------------- |
| Monorepo root        | Repository root                                   |
| Web application      | `apps/web`                                        |
| Package manager      | npm                                               |
| Install command      | `npm ci`                                          |
| Build command        | `npm run build`                                   |
| Build implementation | `npm run build --workspace @industrial-learn/web` |
| Output directory     | `apps/web/.next`                                  |
| Framework            | Next.js App Router                                |
| Vercel Node.js       | 24.x                                              |

`vercel.json` enables Git deployment for `development` and disables automatic
deployment for `main`.

## Environment Configuration Status

Vercel has encrypted environment variables for the staging Development and
`Preview (development)` scopes:

- `APP_BASE_URL`
- `INDUSTRIAL_LEARN_AUTH_MODE`
- `INDUSTRIAL_LEARN_E2E`
- `NEXT_PUBLIC_APP_ENV`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_DB_URL`
- `SUPABASE_PROJECT_REF`
- `SUPABASE_SERVICE_ROLE_KEY`

Runtime policy:

- `NEXT_PUBLIC_APP_ENV=staging`
- `INDUSTRIAL_LEARN_AUTH_MODE=supabase`
- `INDUSTRIAL_LEARN_E2E=false`
- `APP_BASE_URL=https://industrial-learn-staging-git-development-kolobe.vercel.app`

Secret values were not committed or printed in the report.

## Authentication Verification

Verified before the final callback deployment with synthetic staging accounts:

- Student sign-in reached the authenticated dashboard.
- Student access to `/author` and `/review` was denied.
- Author sign-in reached the author workspace.
- Reviewer sign-in reached the review workspace.
- Sign-out cleared the session and returned to sign-in.
- Password reset returned the safe `reset_requested` status.

Prompt 34 found and fixed one staging callback defect:

- Previous server actions sent Supabase relative callback paths such as
  `/auth/verify` and `/auth/reset-password`.
- The fix builds absolute callback URLs from `APP_BASE_URL`.
- Focused auth tests passed after the fix.
- The fixed commit was deployed to Vercel and GitHub CI passed.

Supabase staging redirect configuration:

- Site URL:
  `https://industrial-learn-staging-git-development-kolobe.vercel.app`
- Exact redirect:
  `https://industrial-learn-staging-git-development-kolobe.vercel.app/auth/verify`
- Exact redirect:
  `https://industrial-learn-staging-git-development-kolobe.vercel.app/auth/reset-password`
- Exact redirect:
  `https://industrial-learn-staging-git-development-kolobe.vercel.app/auth/sign-in`

No wildcard redirect URLs were added.

## Security Header Status

Final `vercel curl` checks confirmed these headers on the staging alias:

- `Content-Security-Policy`
- `Referrer-Policy`
- `X-Content-Type-Options`
- `X-Frame-Options`
- `Permissions-Policy`
- `Strict-Transport-Security`
- `x-robots-tag: noindex`

Temporary CSP relaxation remains:

- inline scripts and styles are allowed for current Next.js runtime behavior
- Supabase HTTP and realtime endpoints are allowed

## Cache-Control Status

Final header checks:

| Route          | Cache result                                              |
| -------------- | --------------------------------------------------------- |
| `/`            | `public, max-age=0, must-revalidate`                      |
| `/dashboard`   | `private, no-cache, no-store, max-age=0, must-revalidate` |
| `/assessments` | `private, no-cache, no-store, max-age=0, must-revalidate` |
| `/review`      | `private, no-cache, no-store, max-age=0, must-revalidate` |

Private learning and governance routes are configured as no-store in
`apps/web/next.config.ts`.

## Performance Baseline

Authenticated `vercel curl` baseline against the final staging alias:

| Route                           | Status | Approximate response time |
| ------------------------------- | ------ | ------------------------- |
| `/`                             | 200    | 0.142 s                   |
| `/learn`                        | 200    | 0.898 s                   |
| `/lessons/basic-fluid-pressure` | 200    | 1.090 s                   |
| `/dashboard`                    | 200    | 0.401 s                   |
| `/auth/sign-in`                 | 200    | 0.506 s                   |

The build output showed the expected Next.js route map with 50 generated static
pages. No blocking bundle or layout-shift issue was identified during this
configuration pass.

## CI And Deployment Relationship

GitHub CI runs on pushes and pull requests to `development` and `main`.
The pushed Prompt 34 commit passed CI:

- Workflow: Industrial Learn CI
- Run ID: `30847199703`
- Result: success

Vercel currently creates Preview deployments on push to `development`. This may
happen before CI completes. Production should later use branch protection plus
Vercel deployment checks or a GitHub Actions-controlled deployment process.

## Commands And Results

| Command or check                                                          | Result                                           |
| ------------------------------------------------------------------------- | ------------------------------------------------ |
| `npx vercel project inspect industrial-learn-staging --scope kolobe`      | Project settings verified                        |
| `npx vercel env ls --scope kolobe`                                        | Expected env names present, encrypted            |
| `npx vercel project protection industrial-learn-staging --scope kolobe`   | SSO/protection and git fork protection confirmed |
| `npx vercel env update APP_BASE_URL preview development --scope kolobe`   | Updated staging callback base URL                |
| `npx vercel env update APP_BASE_URL development --scope kolobe`           | Updated Development copy                         |
| `npm run scan:secrets`                                                    | Passed                                           |
| `npm run format:check`                                                    | Passed                                           |
| `STAGING_ENV_FILE=.env.staging.local npm run validate:staging-env`        | Passed                                           |
| `npm run typecheck`                                                       | Passed                                           |
| `npm run lint`                                                            | Passed                                           |
| `npm run validate:content`                                                | Passed, 7 tests                                  |
| `npm run validate:migrations`                                             | Passed, 11 tests                                 |
| `npm run test:unit`                                                       | Passed, 153 tests, 4 skipped                     |
| `npm run build`                                                           | Passed                                           |
| `npm run test:smoke`                                                      | Passed, 5 tests                                  |
| `npm run test:e2e`                                                        | Passed, 61 tests                                 |
| `gh run list --branch development --limit 5`                              | CI success confirmed for `4185c16`               |
| `npx vercel inspect industrial-learn-staging-ul21u9dwv-kolobe.vercel.app` | Final deployment Ready                           |
| Final `vercel curl` header checks                                         | Passed                                           |
| Final `vercel logs` sample                                                | No logs found for final deployment               |

Note: running `npm run validate:staging-env` without `STAGING_ENV_FILE` fails
closed, as expected, because staging values are not committed.

## Known Limitations

- Production deployment remains intentionally disabled.
- Vercel project Node.js is 24.x while `package.json` permits `>=22`; confirm
  the final production runtime decision before launch.
- Vercel Preview deployment may occur before GitHub CI completion.
- Final interactive browser retest of sign-up was blocked by browser automation
  safety review on the protected staging URL; read-only Vercel CLI checks and
  local auth tests passed after the callback fix.
- Feature-branch preview secret exposure must be reviewed before granting
  service-role or database URL values beyond trusted branch scopes.

## Prompt 35 Readiness

Prompt 35 may proceed for the next Supabase/staging task. The staging web
deployment is live, protected, connected to the staging Supabase project, and
verified with local quality gates plus remote Vercel checks.
