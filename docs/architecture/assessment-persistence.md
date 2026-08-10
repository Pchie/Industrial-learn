# Assessment Attempt Persistence

## Purpose

Industrial Learn assessment attempts are persisted for authenticated students through the server-side data-access layer. The browser never becomes the trusted scoring authority.

Source IDs: IL-AGENTS-001, IL-AUTH-001, IL-DAL-001, IL-DB-001.

## Lifecycle

1. Start attempt for the authenticated student.
2. Save permitted in-progress answers.
3. Submit final answers with an idempotency key.
4. Server normalises supported units.
5. Server scores the attempt using `@industrial-learn/assessment-core`.
6. Persist score, submitted answers, scoring summary, content version, attempt number, and competency awards.
7. Update progress and competency inside the same transaction.
8. Record an audit event.
9. Allow completed review for the owning student.

## Security Rules

- Attempts belong to one authenticated student.
- A student cannot submit for another student.
- Client-submitted score, competency awards, and content version are ignored.
- Hidden answers and private explanations are removed before submission.
- Completed attempts cannot be modified.
- Duplicate final submission returns the existing completed attempt when the idempotency key matches.
- Unreviewed or unpublished assessments are treated as not found.

## Numeric Engineering Answers

The server persists the student-entered answer and uses a separate scoring summary for normalised values. Supported explicit SI conversions use `@industrial-learn/engineering-core`.

Current examples:

- `kPa` can be normalised to `Pa` for pressure questions.
- Dimensionally incorrect units such as `N` for pressure remain incorrect.
- Unsupported conversions are not silently accepted.

## Transactions

Completion, competency awards, lesson-progress updates, and audit recording are performed inside a transaction runner. A failed competency or progress write rolls back the completed attempt state.

In Supabase mode, assessment completion uses
`public.complete_assessment_attempt_transaction`, a service-role-only PostgreSQL
function. The browser never calls this function directly. Server-side code calculates the
score and competency awards, then passes those trusted results to the function so the
attempt row, lesson-progress row, and audit event are written atomically.

## Current Adapter Status

`packages/database/src/attempt-persistence.ts` defines the application-service boundary
and repository ports. The tests use an isolated in-memory repository harness. Supabase
production wiring calls the database function through the server-only service-role REST
client.
