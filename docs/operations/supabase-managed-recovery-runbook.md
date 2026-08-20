# Supabase Managed Recovery Runbook

Date prepared: 2026-08-16

## Purpose

This runbook covers the Supabase-managed recovery layer that is not fully proven
by a PostgreSQL-only `pg_dump` and `pg_restore` rehearsal.

It complements:

- `docs/operations/restore-rehearsal-runbook.md`
- `docs/operations/restore-rehearsal-results.md`
- `docs/audits/prompt-38-backup-restore-report.md`
- `docs/deployment/supabase-staging-setup.md`
- `docs/deployment/staging-url-verification.md`

## Scope

This runbook covers:

- Supabase project health metadata.
- Provider backup metadata.
- Supabase Auth service health.
- Supabase REST gateway behavior.
- Row-level-security behavior through Supabase REST.
- Supabase Storage bucket and object recovery behavior.
- Staging Auth redirect and callback configuration evidence.
- Vercel deployment-protection constraints that affect browser verification.

This runbook does not replace:

- Version-controlled database migrations.
- PostgreSQL backup and restore rehearsals.
- Production recovery rehearsals.
- Supabase dashboard owner approval.

## Safety Rules

- Do not touch production.
- Do not print Supabase anon keys, service-role keys, database URLs, access
  tokens, refresh tokens, passwords, or private answer data.
- Use only synthetic or approved staging data.
- Create only temporary rehearsal users or storage objects.
- Clean up temporary rehearsal users, profile records, role assignments, storage
  objects, and storage buckets before completion.
- Do not disable Vercel deployment protection unless explicitly approved for the
  check and restored immediately afterward.
- Do not create new migrations for provider-configuration checks.

## Required Inputs

Store real values only in ignored local operator files or provider secret
stores.

Required local operator values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_PROJECT_REF`
- `APP_BASE_URL`
- Optional Vercel deployment-protection bypass material, if browser-level checks
  against protected deployments are required.

## Preflight

1. Confirm the working tree is clean.
2. Confirm the current branch is not `main`.
3. Validate staging environment variables without printing secret values.
4. Confirm the Supabase staging project reference is `lgjujyaclrpaopdabyzg`.
5. Confirm production credentials are not present in the operator environment.
6. Confirm generated files and secret files remain ignored by Git.

## Supabase Project And Backup Checks

Run safe provider metadata checks:

1. List Supabase projects and confirm the staging project is active and healthy.
2. Record region and PostgreSQL major version.
3. List Supabase backup metadata.
4. Record whether PITR is enabled.
5. Record whether WAL-G or provider backup capability is enabled.

Do not run provider restore commands against active staging.

## Auth And REST Checks

Use a temporary synthetic staging user:

1. Create a confirmed temporary Supabase Auth user through server-side service
   credentials.
2. Create the matching `profiles` row with `profiles.id = auth.users.id`.
3. Assign only the `student` role.
4. Sign in through Supabase Auth with the anon key.
5. Confirm a session is returned without printing tokens.
6. Query own profile through Supabase REST.
7. Confirm the temporary student sees only their own profile.
8. Confirm review records, content versions, and draft lessons are not visible
   to the temporary student.
9. Delete the temporary Auth user and confirm no temporary users remain.

## Storage Checks

If staging has no approved storage content, use a temporary private bucket:

1. Create a temporary private bucket.
2. Upload a small non-private rehearsal object.
3. List the object through the Storage API.
4. Download the object through server-side service credentials.
5. Delete the object.
6. Delete the bucket.
7. Confirm no temporary recovery buckets remain.

If production later stores source documents, diagrams, submissions, or project
files in Supabase Storage, add an object-backup and object-restore rehearsal
that uses approved non-private recovery samples.

## Vercel-Protected App Checks

If the staging deployment is protected by Vercel SSO or deployment protection,
automated browser checks require an approved bypass or authenticated Vercel
request path.

When bypass material is available:

1. Create a temporary synthetic staging user.
2. Sign in through `/auth/sign-in` on the protected staging deployment.
3. Confirm redirect to `/dashboard`.
4. Confirm the dashboard resolves the temporary user's own profile.
5. Sign out and confirm protected routes redirect safely.
6. Clean up the temporary user and profile records.

When bypass material is not available:

1. Record that the deployment-protection shell blocks browser-level
   verification.
2. Verify Supabase Auth and REST directly.
3. Verify callback route URLs are documented and reachable only where the
   protected deployment allows.
4. Treat full app-session recovery as conditional until bypass or manual browser
   evidence is available.

## Cleanup Verification

Before marking the rehearsal complete, verify:

- No temporary recovery Auth users remain.
- No temporary recovery storage buckets remain.
- No temporary storage objects remain.
- No local backup files, passphrases, or secret output files were written into
  the repository.
- Git shows no untracked secrets or generated reports.

## Completion Criteria

The Supabase-managed recovery rehearsal passes when:

- Staging environment validation passes.
- Staging project metadata is active and healthy.
- Provider backup metadata is recorded.
- Supabase Auth health passes.
- Temporary user sign-in through Supabase Auth passes.
- Supabase REST/RLS checks pass.
- Temporary storage object handling passes and cleans up.
- Vercel-protected app-session checks either pass or are explicitly marked as
  blocked by deployment protection.
- Remaining provider dashboard settings are documented as manual confirmation
  requirements where the CLI/API cannot expose them safely.
