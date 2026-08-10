# Prompt 36 Atomic Assessment Completion Report

## Executive Verdict

PASS.

The Supabase assessment completion path now uses a reviewed PostgreSQL function so final
attempt completion, lesson-progress update, and audit recording are performed inside one
database statement. The function is service-role-only and is not executable by `anon` or
`authenticated` users.

The migration has now been applied to Supabase staging, function privileges have been
verified live, and a deployed staging assessment attempt completed successfully through a
fresh Vercel preview deployment.

## Files Changed

- `database/migrations/0007_atomic_assessment_completion.sql`
- `apps/web/src/features/assessments/server.ts`
- `packages/database/src/attempt-persistence.ts`
- `packages/database/src/schema.test.ts`
- `docs/architecture/assessment-persistence.md`
- `docs/security/assessment-browser-security.md`
- `docs/audits/prompt-35-assessment-browser-report.md`
- `docs/audits/prompt-36-assessment-transaction-report.md`

## Transaction Implemented

`public.complete_assessment_attempt_transaction` performs:

- Attempt row lock by authenticated student profile ID and attempt ID.
- Idempotency-key duplicate lookup.
- Completed-attempt protection.
- Attempt completion with server-calculated score, max score, scoring summary, submitted
  answers, competency awards, and timestamps.
- Lesson-progress upsert for the related lesson.
- Audit-event insert for assessment completion.

## Security Controls

- Function execution is revoked from `public`, `anon`, and `authenticated`.
- Function execution is granted to `service_role`.
- Browser code still cannot submit student profile IDs or server-calculated scores.
- Direct student writes to `assessment_attempts` remain blocked by RLS.

## Application Wiring

The Supabase assessment repository now calls the RPC from server-only code using the
service-role key. The repository no longer performs separate Supabase REST writes for
lesson progress or audit after completion, preventing partial completion states in the
Supabase path.

## Staging Migration And Live Verification

Completed on 2026-08-10:

- Applied `database/migrations/0007_atomic_assessment_completion.sql` to Supabase staging
  project `lgjujyaclrpaopdabyzg`.
- Verified `public.complete_assessment_attempt_transaction(...)` exists as a
  `security definer` function owned by `postgres`.
- Verified execute privileges:
  - `anon`: denied.
  - `authenticated`: denied.
  - `service_role`: allowed.
- Deployed the current working tree to Vercel preview:
  `https://industrial-learn-staging-kwzlfg5jr-kolobe.vercel.app`.
- Created a synthetic staging-only student account for the live attempt.
- Started deployed assessment attempt
  `b6dedf73-4b2e-412a-bb17-dc5757789386`.
- Submitted final answers through the deployed assessment form.
- Verified the server action redirected to the completed review route.
- Verified the staging database stored:
  - attempt status `graded`;
  - score `10.00`;
  - max score `12.00`;
  - idempotency key;
  - submitted timestamp;
  - graded timestamp;
  - scoring summary JSON;
  - competency awards JSON.
- Verified lesson progress was atomically updated to `graded` and `100.00%`.
- Verified audit event `assessment_attempt_completed` was recorded.
- Verified the deployed review page showed `10 / 12 points`.
- Verified the deployed dashboard showed the recent assessment result.

## Verification Results

- Secret scan: passed.
- Formatting: passed.
- Type checking: passed across all workspaces.
- Linting: passed.
- Migration validation: 12 passed.
- Focused database tests: 22 passed.
- Unit tests: 156 passed, 4 skipped across 19 test files.
- Production build: passed.
- Full E2E: 64 passed.

## Staging Application Status

Staging migration and live deployed assessment verification are complete.

The stable development alias
`https://industrial-learn-staging-git-development-kolobe.vercel.app` still points to a
7-day-old deployment that shows the previous protected placeholder for `/assessments`.
The successful live attempt used the fresh preview deployment above, which contains the
current uncommitted assessment-browser and transaction changes.

No staging credentials were committed. Temporary session, Vercel env, and bypass files
were removed after verification. An extra non-env-var Vercel automation bypass created
during testing was disabled; the original managed env-var automation bypass remains.

## Recommended Next Prompt

Prepare the mixed Prompt 33c/35/transaction working tree for commit review: separate the
uncommitted files into coherent changesets, exclude unrelated `docs/proposals/`, rerun
the full quality suite, and then commit/push the approved staging-ready changes.
