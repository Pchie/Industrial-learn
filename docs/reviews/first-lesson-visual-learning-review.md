# First Lesson Visual Learning Review

Review date: 2026-08-30

Candidate: `LES-FLUID-PRESSURE-001`, Basic Fluid Pressure, version `0.3.0`

Verdict: **VISUAL-FIRST FAIL**

## Current Experience

Basic Fluid Pressure uses the legacy structured-lesson order:

1. Header and metadata.
2. Progress notice and 18-link contents list.
3. Lesson header, time, difficulty, prerequisites, outcomes, and topic relevance.
4. Terminology.
5. Static visual explanation.
6. Theory and equation.
7. Worked example.
8. A text-only future-simulation placeholder.
9. Fault, safety, knowledge check, summary, sources, and next lesson.

The first visual appears only after seven required content sections. The first interactive
activity appears after eleven sections and is not interactive. The student cannot change
force or area, observe a response, connect a changing state to the equation, complete an
engineering challenge, or inspect a real-world application.

## Sequence Review

| Required stage | Current evidence                                   | Verdict |
| -------------- | -------------------------------------------------- | ------- |
| SEE            | Static force-over-area diagram                     | PARTIAL |
| INTERACT       | Text placeholder only                              | FAIL    |
| OBSERVE        | No changing state or observation prompt            | FAIL    |
| EXPLAIN        | Definition and theory are present                  | PASS    |
| CALCULATE      | Expandable worked example is present               | PASS    |
| CHALLENGE      | No practical challenge                             | FAIL    |
| APPLY          | Brief relevance sentence, no developed application | FAIL    |

The lesson is concise and academically manageable, but it does not conform to Industrial
Learn Visual Lesson Standard V1 or the required visual-first sequence.

## Student-Level Review

The algebra, terminology, and worked example are suitable for an introductory first-year
student. The distinction between force, area, and pressure is clear. The numerical level
is appropriate for first exposure and revision.

Limitations:

- the definition is repeated several times before the learner does anything;
- the 18-section navigation creates unnecessary information density for a 25-minute
  foundation lesson;
- the lesson does not expose the common diameter/area misconception visually;
- the fault section introduces system diagnosis before the lesson has taught instruments
  or fault evidence; and
- the knowledge check provides its explanation through an immediately openable details
  control and is practice-only, which is acceptable but not evidence of mastery.

## Learning Outcome Review

| Declared outcome                                    | Taught | Assessed                                                                       | Decision             |
| --------------------------------------------------- | ------ | ------------------------------------------------------------------------------ | -------------------- |
| Describe pressure as force distributed over area    | Yes    | MCQ and static knowledge check                                                 | Supported            |
| Identify SI units for pressure, force, and area     | Yes    | Numeric, component, diagram, and sequence items                                | Supported in concept |
| Interpret a simple result within stated assumptions | Partly | Numeric and sequence items; unrelated higher-competency items dilute alignment | Changes required     |

The lesson outcomes are plain strings while the assessment references `LO-FP-001` through
`LO-FP-003`. Those identifiers are not declared by the lesson, so outcome-to-question
traceability is not formally resolvable.

## Assessment Review

The manual check of `Q-FP-NUM-001` confirms that `200 N / 0.50 m^2 = 400 Pa`, with an
absolute tolerance of `0.5 Pa`. Compatible unit conversion is performed on the trusted
server before scoring, and answer evidence is withheld before submission.

The complete assessment is not suitable for approving this lesson as written:

- `Q-FP-SIM-001` requires an unapproved hydraulic-cylinder simulation not declared by
  the lesson;
- `Q-FP-FAULT-001` relies on an unreviewed `seal-leak` training fault;
- `Q-FP-DESIGN-001` awards `Designed` competency for restating a safety/review boundary;
- `Operated`, `Diagnosed`, and `Designed` exceed the lesson's three declared outcomes;
- the assessment JSON remains `Engineering review required`; and
- the local catalogue factory defaults the same content to `Approved for student use`
  for E2E mode without a versioned assessment review record.

The server-controlled delivery, ownership, idempotency, unit normalisation, and hidden
answer controls are technically strong. The educational content and competency mapping
still require correction and independent review.

## Required Visual-Learning Corrections

1. Convert the lesson to the existing `visual-v2` experience contract.
2. Place a bounded force/area pressure visual before the theory sequence.
3. Drive any live result through `pressureFromForceAndArea`; do not duplicate the equation
   in React.
4. Add synchronized accessible controls only after reviewed educational bounds are set.
5. Add short observation prompts and an idealised force/area challenge.
6. Keep detailed derivation, assumptions, and source records in optional Deep Dive.
7. Replace the unrelated hydraulic fault and simulation assessment items with outcomes
   actually taught by this lesson, or separate them into a reviewed later assessment.

Any content change requires a new version and new frozen review artifacts.
