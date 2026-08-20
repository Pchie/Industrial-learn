# Prompt 35 Assessment Browser Report

## Executive Verdict

PASS.

The authenticated assessment browser journey is implemented for the pilot fluid-pressure
assessment. Student attempts are started, saved, submitted, scored by the trusted server,
reviewed after completion, and surfaced to the dashboard data model. The original
condition was Supabase atomic completion; this was addressed by Prompt 36 through
`public.complete_assessment_attempt_transaction`.

Prompt 35 is complete as an application/browser journey. Prompt 36 staging migration
application and live deployed assessment submission remain separate release-hardening
work.

## Files Changed

- `apps/web/src/app/assessments/page.tsx`
- `apps/web/src/app/assessments/[assessmentSlug]/page.tsx`
- `apps/web/src/app/assessments/[assessmentSlug]/attempt/[attemptId]/page.tsx`
- `apps/web/src/app/assessments/[assessmentSlug]/attempt/[attemptId]/review/page.tsx`
- `apps/web/src/features/assessments/actions.ts`
- `apps/web/src/features/assessments/answers.ts`
- `apps/web/src/features/assessments/answers.test.ts`
- `apps/web/src/features/assessments/catalog.ts`
- `apps/web/src/features/assessments/components.tsx`
- `apps/web/src/features/assessments/local-store.ts`
- `apps/web/src/features/assessments/server.ts`
- `apps/web/src/features/student-dashboard/local-dashboard-store.ts`
- `apps/web/src/app/globals.css`
- `apps/web/package.json`
- `package-lock.json`
- `tests/e2e/assessment-browser.spec.ts`
- `tests/e2e/staging-smoke.spec.ts`
- `docs/product/assessment-user-journey.md`
- `docs/security/assessment-browser-security.md`
- `docs/audits/prompt-35-assessment-browser-report.md`

## Persistence Implemented

- Local E2E mode uses the existing attempt-persistence service with a local repository
  adapter.
- Supabase mode uses the published `assessments` row as the review/publication gate and
  persists attempts to `assessment_attempts`.
- Completed attempts store submitted answers, scoring summary, score, max score,
  competency awards, idempotency key, submitted time, and graded time.
- Completed attempts update lesson progress where a Supabase lesson ID is available.
- Audit events are recorded for assessment completion.

## In-Memory Logic Removed Or Isolated

Production pages do not use the old assessment-core in-memory completed-attempt store.
Local in-memory storage is isolated to E2E/local-auth mode.

## Security Protections

- Routes require a student session.
- Browser forms do not contain student profile IDs.
- Correct answers and private explanations are hidden before submission.
- Review routes require completed attempts owned by the authenticated student.
- Completed attempts cannot be mutated from the attempt page.
- Direct student database writes remain blocked by RLS.

## Transaction Behaviour

The shared persistence service still defines a transaction boundary. The local adapter
executes it in process. Supabase completion is now handled by a service-role-only
PostgreSQL function that writes the completed attempt, lesson progress, and audit event
atomically.

## Test Coverage Added

- Form serialization and missing/invalid answer detection.
- Hidden-answer delivery check.
- Browser start, save, submit, review, and dashboard visibility.
- Completed-attempt mutation protection.
- Cross-student review denial.

## Commands Executed

- `npm install`
- `npm run scan:secrets`
- `npm run format`
- `npm run format:check`
- `npm run typecheck`
- `npm run lint`
- `npm run validate:content`
- `npm run validate:migrations`
- `npm run test:unit`
- `npm run build`
- `npm run test:smoke`
- `npx playwright test tests/e2e/accessibility.spec.ts tests/e2e/assessment-browser.spec.ts`
- `npx playwright test tests/e2e/assessment-browser.spec.ts`
- `npm run test:e2e`

## Final Test Results

- Secret scan: passed.
- Formatting: passed.
- Type checking: passed across all workspaces.
- Linting: passed.
- Content validation: 7 passed.
- Migration validation: 11 passed.
- Unit tests: 155 passed, 4 skipped across 19 test files.
- Production build: passed.
- Smoke tests: 5 passed.
- Full E2E: 64 passed.

The first smoke attempt failed because the sandbox denied binding the local Next.js
server to `127.0.0.1:3000`. It passed after rerunning with local-server permission.

## Prompt 35 Completion Recheck

Rechecked on 2026-08-10:

- `npm run scan:secrets`: passed.
- `npm run typecheck`: passed.
- `npm run validate:migrations`: 12 passed.
- `npx vitest run apps/web/src/features/assessments/answers.test.ts packages/database/src/attempt-persistence.test.ts`:
  12 passed.
- `npm run format:check`: passed.
- `npm run lint`: passed.
- `npx playwright test tests/e2e/assessment-browser.spec.ts`: 3 passed after rerunning
  with local-server permission because the sandbox initially blocked
  `127.0.0.1:3000`.

## Known Limitations

- The pilot design challenge records a submitted response but does not self-award rubric
  points, because student self-scoring would violate assessment integrity.
- The assessment catalogue contains one pilot assessment only.

## Recommended Next Prompt

Complete Prompt 36 staging release-hardening: apply the atomic assessment-completion
migration to Supabase staging, verify function privileges, and run an authenticated
staging assessment attempt against the live development deployment.
