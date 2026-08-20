# Assessment Browser Security

## Security Boundary

The browser renders assessment forms only. It does not determine correctness, awarded
points, unit validity, final status, or competency awards.

Trusted decisions occur through server actions and the assessment persistence service:

- Student identity comes from the authenticated server session.
- Student profile IDs are not accepted from browser form input.
- Assessment attempts are looked up by owner and attempt ID.
- Correct answers are delivered only after completed-attempt ownership is verified.
- Direct student writes to `assessment_attempts` remain blocked by RLS policy.

## Hidden Answer Protection

The attempt page uses `deliverAssessment(..., "assessment")` from
`@industrial-learn/assessment-core`. The delivered assessment removes:

- Correct choice IDs
- Expected numeric answers
- Expected simulation measurements
- Correct diagram, component, sequence, and fault answers
- Private explanations
- Assessment-mode hidden simulation hints
- Rubrics

The review page loads full question content only after the persisted attempt is completed
and belongs to the authenticated student.

## Unit Handling

Numeric engineering answers persist the student-entered value and unit. Server-side
normalization uses the engineering-core SI conversion library where a supported compatible
quantity exists. Dimensionally incorrect units are not silently accepted; the assessment
scoring result records unit errors.

## Duplicate Submission

Final submission includes a stable idempotency key. The persistence service checks for an
existing completed attempt for that student, assessment, and idempotency key before
scoring a duplicate request.

The Supabase database function also checks the idempotency key while holding the attempt
row lock. A duplicate retry returns the existing completed attempt instead of creating a
second completion, progress update, or audit event.

## Cross-Student Protection

The route never accepts `studentProfileId` from the browser. Server actions pass the
profile ID from the authenticated session to the persistence service. The service applies
self-or-administrator checks, and Supabase RLS also limits student read access to private
attempt rows.

## Atomic Completion

Supabase assessment completion uses
`public.complete_assessment_attempt_transaction`, a `security definer` function whose
execution is revoked from `anon` and `authenticated` and granted to `service_role`. The
function completes the attempt, updates lesson progress, and records the audit event as
one PostgreSQL statement.
