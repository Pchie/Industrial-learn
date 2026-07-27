# Staging RLS Verification

Date: 2026-07-27

## Status

Repository-level RLS review and corrective policy hardening are complete. Live Supabase staging verification is blocked until secure staging credentials and approved SQL tooling are available.

## Corrective Policy Added

`database/policies/0005_staging_rls_hardening.sql`:

- removes direct student-readable access to `answer_choices`, which contains `is_correct` and `feedback`
- limits `answer_choices` reads to content staff
- replaces broad student `for all` policies on `assessment_attempts` and `simulation_attempts`
- keeps students able to read their own attempts
- prevents direct student writes to scored attempt tables so server-side services remain the trusted scoring boundary

## Required Live RLS Tests

The live staging database must prove:

- Student A can read own profile and private records.
- Student A cannot read Student B profile or private records.
- Lecturer A can read students in authorised cohorts only.
- Content authors cannot read private student records.
- Engineering reviewers cannot read private student records by default.
- Unauthenticated users cannot read private tables, drafts, hidden answers, or attempts.
- Students cannot modify server-calculated score, competency awards, content version, or assessment/simulation completion state.
- Content governance drafts remain hidden from students.
- Review decisions persist and self-approval remains blocked by application services.

## Integration Test Harness

`packages/database/src/staging-database.integration.test.ts` is guarded by `RUN_STAGING_DB_INTEGRATION=true`.

Required secure environment values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `STAGING_STUDENT_A_ACCESS_TOKEN`
- `STAGING_STUDENT_B_ACCESS_TOKEN`
- `STAGING_STUDENT_A_PROFILE_ID`
- `STAGING_STUDENT_B_PROFILE_ID`

Do not commit access tokens or print them in logs.

Run after staging users exist:

```bash
RUN_STAGING_DB_INTEGRATION=true npm run test:unit -- packages/database/src/staging-database.integration.test.ts
```

## Current Evidence

Local schema validation now asserts:

- private student tables are scoped by `student_profile_id = auth.uid()`
- lecturer access uses `public.lecturer_has_student(student_profile_id)`
- content staff and reviewers are not included in student-private table policies
- old direct answer-choice read policy is explicitly dropped
- broad student attempt write policies are explicitly dropped
- replacement student attempt policies are read-only with direct inserts denied

## Remaining Live Verification

Live verification is still required against project `lgjujyaclrpaopdabyzg` after migrations and policies are applied.
