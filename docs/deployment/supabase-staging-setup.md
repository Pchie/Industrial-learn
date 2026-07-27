# Supabase Staging Setup

## Purpose

Industrial Learn staging uses a dedicated Supabase project that is separate from local development, automated tests, personal experiments, and future production.

## Current Staging Project

| Item                       | Value                                                         |
| -------------------------- | ------------------------------------------------------------- |
| Supabase project reference | `lgjujyaclrpaopdabyzg`                                        |
| Supabase project URL       | `https://lgjujyaclrpaopdabyzg.supabase.co`                    |
| Supabase dashboard URL     | `https://supabase.com/dashboard/project/lgjujyaclrpaopdabyzg` |

The project reference and project URL are not service credentials. Anon, service-role, and database connection values must still be supplied through secure human entry.

## Completed In Code

- Added `NEXT_PUBLIC_APP_ENV` environment validation with explicit `staging` support.
- Added staging-required environment validation for Supabase public keys, server-only service key, project reference, migration database URL, and application base URL.
- Added local-test-authentication guards so `INDUSTRIAL_LEARN_AUTH_MODE=local` cannot run in staging or production.
- Added `.env.staging.example` with variable names only.
- Added a synthetic staging profile seed template that does not contain passwords.

## Required Human-Supplied Values

Store real values only in the approved hosting secret manager or local untracked operator environment.

| Variable                        | Boundary                    | Required for staging | Notes                                                |
| ------------------------------- | --------------------------- | -------------------- | ---------------------------------------------------- |
| `NODE_ENV`                      | Runtime                     | Yes                  | Use `production` for staging builds.                 |
| `NEXT_PUBLIC_APP_ENV`           | Public environment label    | Yes                  | Must be `staging`.                                   |
| `APP_BASE_URL`                  | Server runtime              | Yes                  | Use the approved staging URL.                        |
| `NEXT_PUBLIC_SUPABASE_URL`      | Browser-safe public value   | Yes                  | Dedicated staging Supabase project URL.              |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Browser-safe public value   | Yes                  | Staging anon key; protected by RLS.                  |
| `SUPABASE_SERVICE_ROLE_KEY`     | Server-only secret          | Yes                  | Never expose to browser or preview clients.          |
| `SUPABASE_PROJECT_REF`          | Server/deployment metadata  | Yes                  | Dedicated staging project reference.                 |
| `SUPABASE_DB_URL`               | Server-only migration value | Yes                  | Use the approved staging migration connection value. |
| `INDUSTRIAL_LEARN_AUTH_MODE`    | Server auth mode            | Yes                  | Must be `supabase`.                                  |
| `INDUSTRIAL_LEARN_E2E`          | Test-mode flag              | Yes                  | Must be `false` or unset for staging runtime.        |

## Manual Supabase Dashboard Actions

1. Confirm the project region is appropriate for expected staging reviewers while keeping production region selection separate.
2. Enter staging secrets into the approved secret manager.
3. Configure email and password authentication only.
4. Do not enable anonymous sign-in.
5. Do not enable social identity providers unless a later product decision approves them.
6. Set the site URL to the approved staging `APP_BASE_URL`.
7. Add redirect URLs for:
   - staging sign-in callback
   - staging email verification callback
   - staging password-reset callback
   - approved local development callbacks separately
8. Do not use localhost as the only allowed redirect.
9. Enable email confirmation for registration.
10. Configure password reset to return to the staging password-reset route.
11. Set secure password requirements appropriate for staging verification.
12. Enable refresh token rotation where available.
13. Set session expiry to a bounded staging value and document it in the release checklist.
14. Configure a staging email provider or Supabase-managed email only for authorised staging tests.
15. Review auth rate limits and enable bot protection where available.
16. Restrict database access to approved operators and deployment automation.
17. Keep storage disabled or private until a storage feature is approved.
18. Use the minimum practical log retention period for staging.

## Authentication Verification

Verify with authorised synthetic staging accounts only:

- Registration creates an auth user and application profile.
- Email verification completes without exposing tokens in logs.
- Sign-in creates a server-resolved session.
- Sign-out clears session cookies.
- Password-reset request does not reveal whether an email exists.
- Password update works from the approved redirect.
- Session refresh works when refresh tokens are available.
- Invalid or expired sessions fail safely.

## Profile Creation Strategy

Industrial Learn currently uses a server-side application service for profile creation. The service uses the server-only Supabase service-role key, creates one profile with `profiles.id = auth.users.id`, and assigns the default `student` role through an idempotent profile-role upsert.

Staging verification must confirm:

- one profile per auth user
- duplicate profiles are prevented by primary-key and unique-email constraints
- new users receive only the `student` role
- elevated roles are assigned only by trusted administration or seed operations
- profile-creation failures are visible as safe application errors

## Migration And Seed Order

1. Apply version-controlled migrations to staging using the approved migration runbook.
2. Apply version-controlled policy files where the deployment process requires separate policy execution.
3. Apply role and permission seed data from `database/seed/0001_roles_permissions.sql`.
4. Create authorised staging auth users in Supabase Auth.
5. Run the synthetic staging profile seed template with the auth user IDs supplied at execution time.
6. Run RLS and application smoke verification.

Do not apply production migrations or configure production resources in this task.

## Verification Commands

Run locally before staging handoff:

```bash
npm run scan:secrets
npm run validate:staging-env
npm run format:check
npm run typecheck
npm run lint
npm run validate:content
npm run validate:migrations
npm run test:unit
npm run build
npm run test:smoke
npm run test:e2e
```

For real staging values, keep the filled environment file outside the repository and run:

```bash
STAGING_ENV_FILE=/secure/path/to/staging.env npm run validate:staging-env
```

The validator checks required values and environment boundaries without printing secret values.

For this local workspace, `.env.staging.local` has been created as an ignored operator file with the non-secret project reference and project URL prefilled. Fill only through secure local entry; it remains excluded from Git.
