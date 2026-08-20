# Prompt 33a Integration Results

Date: 2026-08-03

## Scope

This file records focused backend and database integration checks for the
dedicated Supabase staging database after Prompt 33. It does not verify browser
journeys, undeployed routes, or production readiness.

## Commands Executed

| Command                                                                                                                                                                                                                                                                 | Result                                                                                                  |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `STAGING_ENV_FILE=.env.staging.local npm run validate:staging-env`                                                                                                                                                                                                      | Passed; staging variables were validated without printing secret values.                                |
| Live Prompt 33a staging verification script                                                                                                                                                                                                                             | Completed with 37 of 38 RLS checks passing; one draft-content visibility finding recorded.              |
| Live stored-score verification                                                                                                                                                                                                                                          | Passed; attempted student score patches did not alter assessment or simulation score/competency fields. |
| `npm run validate:migrations`                                                                                                                                                                                                                                           | Passed; 1 test file and 8 tests passed.                                                                 |
| `npx vitest run packages/database/src/data-access.test.ts packages/database/src/attempt-persistence.test.ts packages/database/src/content-governance.test.ts apps/web/src/features/auth/supabase-provider.test.ts apps/web/src/features/student-dashboard/data.test.ts` | Passed; 5 test files and 38 tests passed.                                                               |

## Service-To-Database Integration

| Area                              | Result                              | Evidence                                                                                                                                                                         |
| --------------------------------- | ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Authenticated profile resolution  | Passed                              | Synthetic staging users signed in through Supabase Auth; profile and role reads succeeded through RLS.                                                                           |
| Dashboard summary queries         | Passed                              | Session-bound REST reads succeeded for enrolments, lesson progress, assessment attempts, simulation attempts, project submissions, saved lessons, and recommendation dismissals. |
| Assessment attempt creation       | Passed for trusted service boundary | Controlled trusted transaction created a staging-only assessment attempt fixture. Direct student insert was denied.                                                              |
| Assessment completion transaction | Passed for database capability      | Controlled transaction wrote score, competency awards, scoring summary, and audit event together. Rollback probe removed partial writes.                                         |
| Simulation attempt creation       | Passed for trusted service boundary | Controlled trusted transaction created a staging-only simulation attempt fixture. Direct student insert was denied.                                                              |
| Simulation completion transaction | Passed for database capability      | Controlled transaction wrote score, competency awards, output summary, and audit event together.                                                                                 |
| Content review record creation    | Passed for trusted service boundary | Controlled trusted transaction created a review record fixture. Reviewer RLS read access was verified.                                                                           |
| Audit-event creation              | Passed for trusted service boundary | Controlled trusted transaction created an audit event; anonymous reads remained denied.                                                                                          |

## Database Error Handling

| Case                    | Result                                                                                                                                                                                      |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Invalid identifier      | Covered by service validation tests; invalid input maps to `ApplicationError("invalid_input")`.                                                                                             |
| Missing record          | Covered by service tests; missing records map to `resource_not_found`.                                                                                                                      |
| RLS denial              | Live REST checks returned empty rows or denied statuses without exposing credentials. Application services map access failures to public errors.                                            |
| Duplicate attempt       | Database idempotency indexes exist for assessment and simulation attempts; service tests cover duplicate completion handling.                                                               |
| Duplicate profile       | Profile IDs are keyed to Supabase Auth user IDs and emails are unique; duplicate profile behavior is constrained by database uniqueness and service profile creation uses idempotent logic. |
| Transaction rollback    | Live rollback probe passed; an intentional transaction error left no partial audit row.                                                                                                     |
| Database timeout        | Covered by service error translation tests for timeout/network-style failures, mapping to `database_unavailable`.                                                                           |
| Missing content version | Covered by content-governance service tests; missing current/target versions map to safe application errors.                                                                                |

## Attempt Persistence Boundary

`assessment_responses` and standalone competency-record tables are not present in
the current migration set. Assessment responses, scoring summaries, and
competency awards are represented on attempt rows:

- `assessment_attempts.submitted_answers`
- `assessment_attempts.scoring_summary`
- `assessment_attempts.competency_awards`
- `simulation_attempts.diagnosis_submitted`
- `simulation_attempts.output_summary`
- `simulation_attempts.competency_awards`

Migration `0003_attempt_persistence_metadata.sql` added the expected metadata
columns. Table-level RLS covers these fields because PostgreSQL RLS is enforced
per row, and Prompt 33 hardening removed broad direct student write policies.
Direct student inserts were denied. Student score/competency patch attempts did
not alter stored values.

## Content Governance Boundary

| Check                                                                          | Result                                                                                                                        |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| Author can read governance draft                                               | Passed.                                                                                                                       |
| Reviewer can read reviewable content governance item                           | Passed.                                                                                                                       |
| Reviewer can read review record and retained content versions                  | Passed.                                                                                                                       |
| Reviewer cannot read private student attempt by default                        | Passed.                                                                                                                       |
| Anonymous caller cannot read governance draft, review records, or audit events | Passed.                                                                                                                       |
| Self-approval prevention                                                       | Implemented and tested in the content-governance service. It is an application-service rule, not a database-only constraint.  |
| Historical version retention                                                   | Passed; two retained content versions were readable by reviewer.                                                              |
| Rollback metadata support                                                      | Schema fields are present: `published_version`, `rollback_reason`, `archived_at`, `published_at`, and version linkage fields. |

## Findings

### Critical: Draft Lesson Visibility Through Enrolment Policy

An enrolled student could read a synthetic draft lesson in a module where the
student has enrolment-backed module access. The policy
`lessons_read_approved_or_authorized` allows reads when
`public.student_has_module(m.id)` is true, independent of the lesson's
`publication_status` and `technical_review_status`.

This finding did not expose private student data or hidden answer choices, but
it is a content-governance boundary issue. A corrective policy migration should
tighten lesson and related content read policies so normal student module access
does not expose draft or unapproved content unless an explicit internal-preview
or assignment policy is modeled.

## Prompt 34 Gate Impact

Database foundation checks for private student data, lecturer cohort access,
reviewer separation, attempt-table protection, schema drift, and trusted service
transactions passed. Prompt 34 may proceed only as a staging deployment task
with the draft-content RLS issue recorded as a required corrective database task
before production readiness.
