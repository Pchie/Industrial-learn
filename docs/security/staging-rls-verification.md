# Staging RLS Verification

Date: 2026-07-30

## Status

Repository-level RLS review, corrective policy hardening, live Supabase staging
migration, and live RLS verification are complete for project
`lgjujyaclrpaopdabyzg`.

## Corrective Policy Added

`database/policies/0005_staging_rls_hardening.sql`:

- removes direct student-readable access to `answer_choices`, which contains `is_correct` and `feedback`
- limits `answer_choices` reads to content staff
- replaces broad student `for all` policies on `assessment_attempts` and `simulation_attempts`
- keeps students able to read their own attempts
- prevents direct student writes to scored attempt tables so server-side services remain the trusted scoring boundary

## Live RLS Tests

The live staging database was tested with synthetic authenticated staging users.
Passwords and access tokens were generated in memory only and were not printed or
committed.

| Test                                                                                            | Result |
| ----------------------------------------------------------------------------------------------- | ------ |
| Student A can read own profile.                                                                 | Passed |
| Student A cannot read Student B profile.                                                        | Passed |
| Student A can read own lesson progress.                                                         | Passed |
| Student A cannot read Student B lesson progress.                                                | Passed |
| Student A can read own assessment attempt.                                                      | Passed |
| Student A cannot read Student B assessment attempt.                                             | Passed |
| Student A can read own simulation attempt.                                                      | Passed |
| Student A cannot read Student B simulation attempt.                                             | Passed |
| Student A can read own project submission.                                                      | Passed |
| Student A cannot read Student B project submission.                                             | Passed |
| Lecturer A can read an associated student's attempt.                                            | Passed |
| Unrelated Lecturer B cannot read Student A's attempt.                                           | Passed |
| Engineering reviewer cannot read student private attempts by default.                           | Passed |
| Content author cannot read student private attempts by default.                                 | Passed |
| Anonymous caller cannot read assessment attempts.                                               | Passed |
| Student cannot read hidden answer choices containing correctness fields.                        | Passed |
| Content staff can read answer choices for review.                                               | Passed |
| Student cannot alter server-calculated assessment score, competency awards, or content version. | Passed |
| Student cannot alter server-calculated simulation score or competency awards.                   | Passed |

Summary: 19 checks run, 19 passed.

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

Live staging evidence confirms:

- private student tables are scoped by `student_profile_id = auth.uid()`
- lecturer access uses cohort association through
  `public.lecturer_has_student(student_profile_id)`
- content staff and reviewers are not included in student-private table policies
- old direct answer-choice read policy is absent from staging
- broad student attempt write policies are absent from staging
- replacement student attempt policies are read-only for students, with direct
  inserts denied

## Remaining Verification

Content-governance self-approval controls remain application-service behavior and
should be verified when the governance service workflow is exercised against
staging. The current RLS pass does not claim GitHub branch protection or
production readiness.
