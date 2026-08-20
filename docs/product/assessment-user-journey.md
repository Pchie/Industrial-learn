# Assessment User Journey

## Scope

This journey covers authenticated student access to published Industrial Learn
assessments. It uses the existing assessment scoring and attempt-persistence services.

## Student Journey

1. The student signs in with a student role.
2. The student opens `/assessments`.
3. The assessment browser lists only published, engineering-reviewed assessments.
4. The student opens `/assessments/[assessmentSlug]`.
5. The overview shows duration, related lesson, review status, source IDs, and attempt
   history.
6. Starting the assessment creates or resumes an in-progress attempt for the current
   authenticated student.
7. The attempt page renders sanitized structured assessment content.
8. The student may save permitted progress before final submission.
9. Final submission sends the student answers to a server action.
10. The server validates ownership, normalizes supported SI-compatible units, scores the
    attempt, records competency awards, updates lesson progress, and writes an audit
    event.
11. The student is redirected to the completed review page.
12. The dashboard reads the persisted attempt summary from the student-owned attempt
    data.

## Browser Routes

- `/assessments`
- `/assessments/[assessmentSlug]`
- `/assessments/[assessmentSlug]/attempt/[attemptId]`
- `/assessments/[assessmentSlug]/attempt/[attemptId]/review`

## Progress Rules

- Opening an assessment does not award progress.
- Saving answers does not award progress.
- Progress is awarded only after trusted server-side scoring completes.
- Completed attempts cannot be mutated from the browser.
- Duplicate final submission uses an idempotency key and the existing persistence
  service duplicate-completion checks.

## Review Rules

Completed reviews show:

- Score
- Submitted answers
- Correctness
- Explanation after submission
- Unit feedback
- Competency results

Correct answers, private explanations, hidden simulation hints, and rubric details are
not rendered on the in-progress attempt page.

## Current Pilot

The first browser-supported assessment is the fluid-pressure competency check. In local
E2E mode the assessment uses the structured JSON question content. In Supabase staging,
the route is gated by the published and engineering-reviewed `staging-pressure-check`
database row.
