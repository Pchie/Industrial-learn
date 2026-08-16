# Supabase Managed Recovery Rehearsal Report

Date completed: 2026-08-16

## Executive Verdict

CONDITIONAL PASS.

The Supabase-managed staging recovery layer was verified for project health,
provider backup metadata, Supabase Auth health, authenticated REST/RLS behavior,
and temporary private Storage object handling. Temporary rehearsal data was
cleaned up.

The remaining condition is live browser sign-in through the protected Vercel
staging deployment. The deployment currently returns the Vercel protection shell
to unauthenticated automation, and this local operator environment does not
contain the Vercel automation bypass value. Full app-session recovery through
the protected deployment therefore remains conditional until an approved bypass
or manual protected-browser check is available.

Production was not touched.

## Why This Rehearsal Was Needed

Prompt 38 proved PostgreSQL backup and restore into an isolated local
PostgreSQL target, but left these provider-managed areas open:

- Supabase project configuration.
- Supabase Auth service behavior.
- Supabase REST gateway behavior.
- Supabase Storage object recovery behavior.
- Vercel-protected browser access to the staging application.

This rehearsal closes the direct Supabase Auth, REST, RLS, and Storage evidence
gap for staging. It does not claim a full temporary Supabase project restore or
provider dashboard configuration export.

## Source Evidence

- `AGENTS.md`
- `docs/operations/restore-rehearsal-runbook.md`
- `docs/operations/restore-rehearsal-results.md`
- `docs/audits/prompt-38-backup-restore-report.md`
- `docs/deployment/supabase-staging-setup.md`
- `docs/deployment/staging-url-verification.md`
- `docs/security/staging-web-security.md`

## Repository State

| Item                         | Result                                      |
| ---------------------------- | ------------------------------------------- |
| Starting branch              | `development`                               |
| Working tree preflight       | Clean                                       |
| Work branch                  | `codex/supabase-managed-recovery-rehearsal` |
| Production touched           | No                                          |
| Schema changed               | No                                          |
| Application features changed | No                                          |
| Curriculum changed           | No                                          |

Generated Playwright and test-result folders are ignored by `.gitignore`.
No intentionally untracked repository files were present during preflight.

## Environment Validation

| Check                          | Result                 |
| ------------------------------ | ---------------------- |
| Staging environment validation | Passed                 |
| Required staging keys present  | Passed                 |
| Secret values printed          | No                     |
| Staging project reference      | `lgjujyaclrpaopdabyzg` |

The validator checked required staging keys without printing secret values.

## Supabase Project Metadata

Safe Supabase CLI metadata confirmed:

| Item               | Result                 |
| ------------------ | ---------------------- |
| Project name       | Industrial Learn       |
| Project ref        | `lgjujyaclrpaopdabyzg` |
| Status             | `ACTIVE_HEALTHY`       |
| Region             | `eu-west-1`            |
| PostgreSQL engine  | 17                     |
| PostgreSQL version | 17.6.1.147             |
| Linked project     | Yes                    |

## Provider Backup Metadata

`supabase backups list` returned:

| Backup area          | Result                                     |
| -------------------- | ------------------------------------------ |
| Region               | `eu-west-1`                                |
| WAL-G enabled        | Yes                                        |
| PITR enabled         | No                                         |
| Physical backup list | No listed snapshots returned by CLI output |

Interpretation:

- Provider backup capability is present through WAL-G metadata.
- Point-in-time recovery is not enabled for this staging project.
- Production must not assume PITR exists unless the production Supabase plan and
  project settings explicitly confirm it.

## Supabase Auth And REST Checks

Direct live Supabase checks were run without printing tokens.

| Check                                       | Result                |
| ------------------------------------------- | --------------------- |
| Auth health with anon key                   | Passed, HTTP 200      |
| Temporary confirmed Auth user created       | Passed                |
| Matching profile created                    | Passed                |
| Temporary user assigned only `student` role | Passed                |
| Temporary user password sign-in             | Passed                |
| Supabase session returned                   | Passed                |
| Own profile readable through REST           | Passed, 1 row         |
| Profile RLS scope                           | Passed, 1 visible row |
| Student review-record visibility            | Passed, 0 rows        |
| Student content-version visibility          | Passed, 0 rows        |
| Student draft-lesson visibility             | Passed, 0 rows        |

The older known account `active.student@example.test` did not authenticate
through live Supabase Auth in this rehearsal. A new temporary synthetic user was
therefore created for the rehearsal and deleted afterward.

## Storage Checks

The linked staging Storage list command returned no existing buckets or objects.

A temporary private bucket and object were created to prove Storage API behavior
without using private data.

| Check                                           | Result           |
| ----------------------------------------------- | ---------------- |
| Existing public bucket list                     | 0 buckets        |
| Temporary private bucket created                | Passed           |
| Temporary non-private rehearsal object uploaded | Passed           |
| Temporary object listed                         | Passed           |
| Temporary object downloaded                     | Passed, 68 bytes |
| Temporary object deleted                        | Passed           |
| Temporary bucket deleted                        | Passed           |
| Post-cleanup recovery buckets                   | 0                |

This verifies Storage API availability and cleanup behavior. It does not replace
a future object-backup restore rehearsal once Industrial Learn stores approved
source documents, diagrams, submissions, or project files.

## Vercel-Protected Application Check

The rehearsal attempted to load the staging sign-in route from:

`https://industrial-learn-staging-git-development-kolobe.vercel.app/auth/sign-in`

The response was HTTP 200 but contained the Vercel deployment-protection shell
rather than the Industrial Learn sign-in form. The page did not expose the
expected `Email address`, `Password`, or `Sign in` controls to automation.

Result:

| Check                                      | Result                                  |
| ------------------------------------------ | --------------------------------------- |
| Live protected app sign-in through browser | Blocked by Vercel deployment protection |
| Local Vercel automation bypass available   | No                                      |
| Supabase Auth direct sign-in               | Passed                                  |
| REST/RLS session checks                    | Passed                                  |

This is a deployment-access caveat, not a Supabase Auth/RLS failure.

## Callback And Redirect Evidence

Repository deployment documentation records the required staging Supabase Auth
URL configuration:

| Setting                 | Required value                                                                           |
| ----------------------- | ---------------------------------------------------------------------------------------- |
| Site URL                | `https://industrial-learn-staging-git-development-kolobe.vercel.app`                     |
| Verification redirect   | `https://industrial-learn-staging-git-development-kolobe.vercel.app/auth/verify`         |
| Password reset redirect | `https://industrial-learn-staging-git-development-kolobe.vercel.app/auth/reset-password` |
| Sign-in/sign-out return | `https://industrial-learn-staging-git-development-kolobe.vercel.app/auth/sign-in`        |

The Supabase CLI available in this environment does not expose a safe read-only
Auth URL configuration command. These settings therefore remain documented
evidence/manual-dashboard evidence rather than freshly exported provider
configuration evidence.

## Cleanup Evidence

Cleanup verification confirmed:

| Temporary item           | Result   |
| ------------------------ | -------- |
| Recovery Auth users      | 0 remain |
| Recovery Storage buckets | 0 remain |
| Recovery Storage objects | 0 remain |
| Secret values committed  | No       |
| Production touched       | No       |

The rehearsal script attempted cleanup a second time after the first successful
cleanup, which produced expected 404/400 cleanup errors for already-deleted
temporary resources. The subsequent verification confirmed that no temporary
recovery users or buckets remained.

## Commands Executed

Representative command groups:

- Git status and ignored-file preflight.
- `STAGING_ENV_FILE=.env.staging.local npm run validate:staging-env`
- `supabase projects list --output json`
- `supabase backups list --project-ref lgjujyaclrpaopdabyzg --output json`
- `supabase storage ls --linked --experimental --output json`
- Live Node-based Supabase Auth, REST, and Storage verification using ignored
  local operator credentials.
- Live Node/Playwright staging sign-in attempt, blocked by Vercel deployment
  protection.
- Cleanup verification for temporary Auth users and Storage buckets.

No command printed Supabase keys, database URLs, access tokens, refresh tokens,
passwords, or private assessment answers.

## Remaining Risks

- Full browser sign-in through the protected Vercel staging deployment still
  requires the approved automation bypass or a manual protected-browser check.
- Supabase dashboard Auth URL configuration could not be exported through the
  available CLI; it remains documented/manual evidence.
- PITR is not enabled for staging.
- No real Storage backup/restore drill exists yet because the product currently
  has no approved persistent Storage content.
- A full temporary Supabase project restore has still not been performed.

## Recommended Next Step

Run a protected-deployment browser recovery check with an approved Vercel
automation bypass, or temporarily disable protection for the narrow check and
restore it immediately afterward.

The check should:

1. Create a temporary synthetic staging user.
2. Sign in through the protected staging app.
3. Confirm `/dashboard` resolves the authenticated user's own profile.
4. Confirm sign-out clears the session.
5. Verify private routes redirect after sign-out.
6. Delete the temporary user and confirm cleanup.
