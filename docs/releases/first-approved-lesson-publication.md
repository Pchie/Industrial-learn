# First Approved Lesson Publication Record

Record date: 2026-08-30

Candidate: `LES-FLUID-PRESSURE-001`, Basic Fluid Pressure, version `0.3.0`

## Publication Decision

**BLOCKED - NO LESSON WAS PUBLISHED**

This filename is the required Prompt 46 publication record. It is not evidence that a
first approved lesson exists.

| Required release field      | Current value                                                          |
| --------------------------- | ---------------------------------------------------------------------- |
| Release candidate           | `student-pilot-rc2`                                                    |
| Lesson ID                   | `LES-FLUID-PRESSURE-001`                                               |
| Content version             | `0.3.0`                                                                |
| Publication status          | `draft`                                                                |
| Review status               | `Engineering review required`                                          |
| Published version           | None                                                                   |
| Accountable author          | Missing                                                                |
| Named independent reviewer  | Missing                                                                |
| Administrator authorization | Missing                                                                |
| Source set                  | `SRC-OPENSTAX-COLLEGE-PHYSICS-2012`, `SRC-PSU-CIMBALA-PRESSURE-BASICS` |
| Equation set                | `EQ-FLUID-PRESSURE-001`                                                |
| Simulation set              | None                                                                   |
| Production change           | None                                                                   |

## Blocking Findings

1. No accountable author profile is recorded.
2. No qualified, named independent human reviewer supplied a controlled decision.
3. Source completeness fails for safety and diagnostic statements.
4. The Penn State source is absent from the runtime static source registry.
5. The lesson fails the visual-first standard.
6. Assessment outcome IDs, competency levels, and simulation/fault items do not align
   with the lesson scope.
7. No administrator publication authorization exists.

## Governance State Preserved

No lesson JSON, knowledge file, source record, equation implementation, review registry,
publication status, database record, migration, staging data, or production environment
was changed. No review JSON was fabricated.

The public route must continue to return the generic not-found response. Internal source
documents, content versions, review comments, and unapproved simulations must remain
hidden from students.

## Post-Publication Tests

Post-publication tests are not applicable because publication did not occur. The negative
visibility gate remains required and was rechecked through the repository's publication,
smoke, E2E, and staging visibility tests. A positive approved-route test must not be run
or claimed until a successor version has legitimate publication authority.

## Future Publication Record

When a corrected version passes genuine human review, this record must be superseded with:

- exact content and published version;
- Git commit and release candidate;
- complete source and equation sets;
- named author and reviewer record IDs;
- separate administrator authorization record;
- protected staging deployment identity; and
- positive and negative visibility results.

Production remains outside this task.
