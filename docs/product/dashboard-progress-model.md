# Student Dashboard Progress Model

## Purpose

The Industrial Learn dashboard reports learning progress from authenticated student evidence only. It must not award progress because a student opened a lesson page.

Source IDs: IL-AGENTS-001, IL-PRD-001, IL-AUTH-001, IL-DAL-001.

## Competency Stages

Industrial Learn uses six competency stages:

1. Introduced
2. Understood
3. Calculated
4. Operated
5. Diagnosed
6. Designed

Evidence is created by completed learning records:

- Completed lesson record: topic has been worked through.
- Submitted or graded assessment: understanding or calculation evidence.
- Submitted simulation attempt: operation or diagnosis evidence.
- Submitted or graded project: design evidence.

## Lesson Progress

Lesson progress is counted only when at least one completion signal exists:

- `completed_at` is present.
- Status is `graded`.
- `percent_complete` is exactly `100`.

An `in_progress` record with only `started_at` does not count as completed progress.

## Module Progress

Module progress uses evidence items assigned to the module:

```text
completed evidence / required evidence
```

Required evidence includes assigned lessons, assessments, simulations, and projects. If no required evidence is known, progress is shown as unavailable rather than `0%`.

## Programme Progress

Programme progress aggregates the current enrolled module progress. If the dashboard cannot resolve enrolment modules, programme progress is unavailable.

## Career-Pathway Progress

Career-pathway progress uses the assigned module sequence when available. In the current implementation, it falls back to enrolled modules until pathway assignment records are added.

## Portfolio Progress

Portfolio progress counts submitted project evidence against required project evidence items. If no active project has required evidence, the dashboard shows an unavailable or empty state.

## Weak-Topic Recommendations

Recommendations are deterministic and explainable. Current evidence sources:

- Assessment score below 70%.
- Incorrect topic tags from assessment evidence.
- Unit validation errors.
- Incomplete simulations.
- Fault-diagnosis errors.

No unrestricted AI recommendations are used.

## Display Rules

- Do not display unavailable evidence as zero.
- Explain progress calculation on the dashboard.
- Keep competency separate from time spent.
- Show partial data warnings when records cannot be fully resolved.
