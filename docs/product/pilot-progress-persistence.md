# Pilot Progress Persistence

Date: 2026-09-04

## Evidence Model

The pilot records progress only after meaningful evidence. Opening or moving controls on a
lesson does not award progress or competency.

| Event                                           | Lesson status | Percent | Competency effect                  |
| ----------------------------------------------- | ------------- | ------: | ---------------------------------- |
| Lesson opened                                   | none          |    none | none                               |
| Inputs changed                                  | none          |    none | none                               |
| 200 kPa challenge verified and explicitly saved | `in_progress` |      50 | none                               |
| Exact v2 assessment completed by trusted server | `graded`      |     100 | score-based assessment awards only |

The percentages describe completion of this two-stage pilot path. They do not claim
engineering mastery and are not based on time spent.

## Trusted Write Path

The browser submits the current force and area to a Next.js server action. The server
re-runs the existing pure Basic Fluid Pressure model, verifies reviewed input boundaries,
and confirms the challenge condition before invoking the service-only progress function.
The calculation remains in engineering-core through `EQ-FLUID-PRESSURE-001`; no formula is
duplicated in the action or UI.

Final assessment submission follows the existing trusted scoring service. Database
function `complete_assessment_attempt_transaction` atomically records:

- protected submitted answers;
- server-calculated score;
- server-calculated competency awards;
- graded attempt status;
- 100% pilot lesson completion; and
- one audit event.

A duplicate idempotency key returns the existing completed attempt and cannot award
progress twice.

## Ownership And RLS

- Students may select only their own lesson progress and attempts.
- Students cannot directly insert, update, or delete lesson progress or assessment
  attempts.
- Content authors and engineering reviewers receive no student-progress policy.
- Authorised lecturers retain the existing relationship-scoped read policy.
- Platform management uses controlled services; the Platform Owner role does not inherit
  unrestricted student-private access.
- Service-role credentials remain server-only.

## Dashboard Projection

The dashboard reads the stable lesson slug and module slug stored with progress. Assessment
attempts join to the exact assessment projection for the canonical title and slug, and
competency is derived from the persisted server award object. A sign-out/sign-in cycle
therefore reads the same database evidence rather than reconstructing completion from page
state.

## Retention And Limitations

The migration uses the existing attempt and progress retention model. It stores one
meaningful lesson progress record and one assessment summary per attempt; it does not store
slider history or high-frequency interaction data. The parent module remains unpublished,
and pilot progress is intentionally presented through the dedicated pilot route.
