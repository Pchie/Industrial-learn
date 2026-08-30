# Prompt 46 First Approved Lesson Audit

Audit date: 2026-08-30

Branch: `codex/prompt-46-human-review-package`

Base commit: `070d5d690899731de57876e63a5cf78707bab9a8`

## Executive Verdict

Prompt 46 outcome: **DOCUMENTED BLOCK**

One candidate was selected and reviewed. It was not approved or published because the
evidence does not support approval and no genuine independent human reviewer exists.

| Final gate                     | Verdict                             |
| ------------------------------ | ----------------------------------- |
| Source completeness            | **FAIL**                            |
| Academic source quality        | **PARTIAL**                         |
| Equation accuracy              | **PASS**                            |
| Engineering model              | **PARTIAL**                         |
| Visual learning                | **FAIL**                            |
| Accessibility                  | **PARTIAL**                         |
| Independent engineering review | **BLOCKED - HUMAN REVIEW REQUIRED** |
| Controlled staging publication | **BLOCKED**                         |
| Controlled student pilot       | **NOT READY**                       |

No actual pilot GO is issued.

## Candidate Comparison

| Candidate                                                     | Source completeness and quality                                                    | Equation and simulation maturity                                                      | Accessibility                                                         | Publication readiness                   | Major blockers                                                                                    |
| ------------------------------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `LES-FLUID-PRESSURE-001` Basic Fluid Pressure                 | Core equation has two Level 4 sources; safety/diagnostic claim coverage incomplete | One pure tested equation; no simulation                                               | Static semantic support; deployed content not reviewable while hidden | Highest; versioned frozen packet exists | Missing author/human reviewer, runtime source omission, visual-first failure, assessment mismatch |
| `LES-HYD-CYL-FORCE-VISUAL-001` Hydraulic Cylinder Force       | Level 1/2 sources support SI, ideal force, and application context                 | Two tested equations and mature visual; simulation remains below `Simulation checked` | Focused keyboard/mobile/Axe evidence exists                           | Internal only                           | Unreviewed bounds/faults, prerequisite and assessment dependencies, human review absent           |
| `LES-SMART-PUMP-UNITS-001` Pump System Units and Measurements | Level 1 NIST and Level 2 DOE sources                                               | No governing equation or simulation                                                   | Generic renderer evidence only                                        | Draft                                   | No visual interaction, assessment, author, or human review                                        |
| `LES-FLUID-BERNOULLI-VISUAL-001` Bernoulli Flow Lab           | Two Level 4 sources support the ideal model                                        | Seven equations and mature simulation                                                 | Focused keyboard/mobile/Axe evidence exists                           | Internal only                           | Larger review scope, no graded assessment, held migration, human review absent                    |

Basic Fluid Pressure was selected because it is the smallest bounded technical model,
has a frozen review packet, and does not require simulation approval. Visual appearance
was not used as the deciding factor.

## Source And Copyright Findings

The official OpenStax section confirms `p = F / A`, perpendicular force, and
`Pa = N/m^2`. The official Penn State module corroborates pressure as normal force per
unit area and the pascal relationship. Both repository records exist and their metadata
hashes match the frozen packet.

The lesson is original Industrial Learn material. It does not reproduce a textbook
chapter, commercial figure, standard text, or downloadable source PDF.

The source set does not substantiate the lesson's gauge/sensor fault diagnosis or provide
an authoritative safety procedure. A checked Level 3 engineering textbook is also absent.
McGraw Hill's _Fluid Mechanics: Fundamentals and Applications_ is recorded only as an
acquisition benchmark because project access to the exact content is not established.

## Equation And Unit Findings

`EQ-FLUID-PRESSURE-001` is accurate within its stated scope. The implementation uses SI
inputs, rejects zero area and invalid units, and performs no silent conversion. Manual
checks reproduce `400 Pa` for the lesson example and `10,000 Pa` after explicit conversion
of `1 kN` and `1000 cm^2`.

The trusted assessment persistence layer normalises compatible units before server
scoring and rejects dimensional mismatches. The lesson does not provide a LiveEquation or
live substitution experience.

## Model And Assessment Findings

The lesson has no simulation, dynamic state, measurement, challenge, or time model. Its
diagram is representational and does not imply unsupported physics.

The related assessment exceeds the lesson scope. It imports an unapproved hydraulic
simulation and seal-leak fault, uses learning-outcome IDs absent from the lesson, and can
award `Operated`, `Diagnosed`, and `Designed` competency for activities the lesson does
not teach. The local E2E catalogue factory also defaults this assessment content to an
approved review status even though its JSON remains `Engineering review required`.

Answer delivery and ownership controls remain technically sound, but the assessment
content is not suitable approval evidence.

## Visual, Student-Level, And Accessibility Findings

The explanation and mathematics are suitable for an introductory first-year student.
However, the student encounters seven content sections before the static diagram and
eleven before a text-only activity placeholder. There is no manipulation, immediate
physical response, live equation, challenge, or developed application. The lesson fails
the visual-first sequence.

The generic renderer has good semantic foundations: native controls, labelled equation,
symbol table, diagram alternative, source labels, responsive layout, and reduced-motion
support. The actual lesson content cannot receive a deployed mobile or dynamic-feedback
pass while the route correctly remains hidden. Accessibility is therefore partial, not
certified.

## Reviewer Independence

No author profile, named human engineering reviewer, qualification context, dated
decision, or administrator authorization exists. Codex and automated tests cannot fill
those roles. The repository review registry remains empty, as it should.

## Runtime Publication Finding

`SRC-PSU-CIMBALA-PRESSURE-BASICS` is not registered in
`apps/web/src/features/publication/source-records.ts`. Runtime evidence aggregation would
therefore fail closed even if the lesson status fields were changed. This is a defect to
correct in a successor review cycle, not a reason to bypass the gate.

## Quality And Visibility Results

| Check                            | Result                                                       |
| -------------------------------- | ------------------------------------------------------------ |
| Secret scan                      | PASS                                                         |
| Formatting                       | PASS                                                         |
| Type checking                    | PASS across all workspaces                                   |
| Lint                             | PASS                                                         |
| Content validation               | PASS, 29 tests                                               |
| Migration validation             | PASS, 16 tests                                               |
| Unit and integration tests       | PASS, 340 passed and 5 intentionally skipped                 |
| Accessibility tests              | PASS, 36 checks; candidate-content limitation retained below |
| Production build                 | PASS, 33 routes/pages                                        |
| Smoke tests                      | PASS, 5 tests                                                |
| End-to-end tests                 | PASS, 94 tests                                               |
| Live staging negative visibility | PASS                                                         |

The first accessibility invocation could not bind `127.0.0.1:3100` under the filesystem
sandbox. The unchanged suite passed when local-server permission was granted. The
existing `NO_COLOR`/`FORCE_COLOR` warning is informational. The E2E suite's simulated
dashboard database failure is an intentional passing safe-error test.

The protected staging matrix used the exact `student-pilot-rc2` deployment. `/learn` did
not list Basic Fluid Pressure. The candidate URL and an old-version query returned the
generic unavailable view without the lesson title. Hydraulic Cylinder Force and Bernoulli
Flow Lab remained hidden. `/assessments` redirected an unauthenticated visitor to sign-in.
No positive publication test was attempted because no lesson was approved.

## Files Created

- `docs/content/approved-textbook-register.md`
- `docs/reviews/first-independent-engineering-review.md`
- `docs/reviews/first-lesson-source-verification.md`
- `docs/reviews/first-lesson-equation-review.md`
- `docs/reviews/first-lesson-simulation-review.md`
- `docs/reviews/first-lesson-visual-learning-review.md`
- `docs/reviews/first-lesson-accessibility-review.md`
- `docs/reviews/human-engineering-review-package.md`
- `docs/releases/first-approved-lesson-publication.md`
- `docs/audits/prompt-46-first-approved-lesson.md`

## Required Next Work

1. Assign the accountable author and a qualified independent human reviewer.
2. Correct source, safety, visual-first, outcome, assessment, and source-registry defects.
3. Increment the lesson version and regenerate the frozen review packet.
4. Complete controlled human review records and separate administrator authorization.
5. Publish only that corrected version to protected staging.
6. Run Prompt 47 only after positive and negative staging publication tests pass.

## Change Summary

Prompt 46 established the textbook register, compared candidate lessons, independently
audited the best bounded candidate, and prepared a human review package. It preserved the
fail-closed publication state and did not alter engineering content, calculations,
simulation behavior, database state, staging publication, or production.

## Known Limitations

No genuine human technical decision is available. The candidate requires content and
assessment corrections before human approval can be justified. Controlled student pilot
readiness remains blocked.
