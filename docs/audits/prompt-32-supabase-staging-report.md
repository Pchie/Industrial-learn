# Prompt 32 Supabase Staging Report

Review date: 2026-07-27

## Executive Verdict

PASS

## Scope

This task configured repository support and documentation for a dedicated Supabase staging backend. The user-created Supabase staging project reference is now recorded as non-secret deployment metadata. This task did not apply database migrations, deploy the web application, configure production, or commit real credentials.

## Code Changes

- Added explicit `NEXT_PUBLIC_APP_ENV` environment validation.
- Added required staging environment validation for Supabase URL, anon key, service-role key, project reference, migration database URL, and application base URL.
- Added local test authentication safety validation.
- Updated the web auth provider selection to validate local test auth before importing the local provider.
- Updated Playwright local web-server environment with approved local test metadata.
- Added a narrow `.gitignore` exception so `.env.staging.example` is version-controlled while filled `.env.*` files remain ignored.
- Added `npm run validate:staging-env` so operators can validate a securely supplied staging env file without printing secret values.
- Created an ignored local `.env.staging.local` operator file with only the non-secret project reference and project URL prefilled.

## Configuration Templates

- `.env.example` now documents local/default variable boundaries.
- `.env.staging.example` provides a staging template with variable names only.
- `database/seed/0002_staging_synthetic_profiles.template.sql` provides a synthetic staging profile seed template without passwords.

## Manual Supabase Actions Still Required

- Confirm the dedicated staging Supabase project settings.
- Confirm and record the staging project region.
- Enter staging secrets into the approved secret manager.
- Configure email/password authentication.
- Configure staging site URL and redirect URLs.
- Configure email confirmation and password reset redirects.
- Review session expiry, refresh token rotation, rate limits, and bot protection.
- Apply migrations, policies, and seed files using the runbook.
- Create authorised staging test accounts.
- Verify registration, email verification, sign-in, sign-out, password reset, session refresh, and invalid session handling.

## Environment Variables Required

- `NODE_ENV`
- `NEXT_PUBLIC_APP_ENV`
- `APP_BASE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_PROJECT_REF`
- `SUPABASE_DB_URL`
- `INDUSTRIAL_LEARN_AUTH_MODE`
- `INDUSTRIAL_LEARN_E2E`

## Staging Project Metadata

| Item                       | Value                                                         |
| -------------------------- | ------------------------------------------------------------- |
| Supabase project reference | `lgjujyaclrpaopdabyzg`                                        |
| Supabase project URL       | `https://lgjujyaclrpaopdabyzg.supabase.co`                    |
| Supabase dashboard URL     | `https://supabase.com/dashboard/project/lgjujyaclrpaopdabyzg` |

## Security Protections Added

- Local auth cannot be enabled when `NEXT_PUBLIC_APP_ENV` is `staging` or `production`.
- Local auth requires `INDUSTRIAL_LEARN_E2E=true`.
- Local auth requires an approved local `APP_BASE_URL` host.
- Public env output excludes service-role and migration database values.
- Staging validation fails closed when required Supabase values are absent.

## Profile Creation Verification

The current architecture uses server-side application-service profile creation. Profiles are keyed to the Supabase Auth user ID, new users receive the default `student` role, and role assignment uses an idempotent upsert. Elevated roles remain outside browser-submitted registration data.

## Storage Decision

Supabase Storage is deferred. No public buckets were created or configured.

## Test Results

| Command                        | Result                                                  |
| ------------------------------ | ------------------------------------------------------- |
| `npm run scan:secrets`         | Passed; no obvious committed secret values found.       |
| `npm run validate:staging-env` | Passed with synthetic non-secret staging-shaped values. |
| `npm run format:check`         | Passed; all matched files use Prettier style.           |
| `npm run typecheck`            | Passed across all configured workspaces.                |
| `npm run lint`                 | Passed.                                                 |
| `npm run validate:content`     | Passed; 1 test file and 7 tests passed.                 |
| `npm run validate:migrations`  | Passed; 1 test file and 6 tests passed.                 |
| `npm run test:unit`            | Passed; 16 test files and 146 tests passed.             |
| `npm run build`                | Passed on Next.js 16.2.12.                              |
| `npm run test:smoke`           | Passed; 5 Playwright smoke tests passed.                |
| `npm run test:e2e`             | Passed; 57 Playwright tests passed.                     |

Additional focused verification:

- `npm run typecheck --workspace @industrial-learn/env` passed.
- `npx vitest run packages/env/src/index.test.ts packages/database/src/data-access.test.ts apps/web/src/features/auth/local-provider.test.ts apps/web/src/features/auth/session-core.test.ts` passed with 4 test files and 34 tests.

Warnings observed:

- Playwright web-server startup printed the existing Node warning that `NO_COLOR` is ignored when `FORCE_COLOR` is set.
- The dashboard failure-path E2E test intentionally logged `Simulated dashboard database failure.` while verifying safe error handling.

## Known Limitations

- The dedicated Supabase staging project still requires manual dashboard configuration.
- Real staging secrets are not present in the repository and must be supplied through approved secret storage or ignored local operator env files.
- The staging seed template depends on authorised Supabase Auth users being created first.
- The Supabase CLI is not installed in the local environment inspected during this task, so project creation and remote migration execution require a human operator or approved CLI setup.

## Prompt 33 Readiness

Prompt 33 may proceed after a human completes the Supabase dashboard settings, enters the required staging secrets through the approved secret manager or ignored local operator env file, and runs the staging migration and seed runbooks. No production resources were configured.
