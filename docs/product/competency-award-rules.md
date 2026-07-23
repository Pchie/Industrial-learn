# Competency Award Rules

## Purpose

Competency awards must be evidence-based and must not be granted for merely opening pages or resetting simulations.

Source IDs: IL-AGENTS-001, IL-PRD-001, IL-DAL-001.

## Assessment Evidence

Assessment competency awards come from server-scored question results:

- Multiple-choice and conceptual questions may contribute Introduced or Understood.
- Numeric engineering calculations may contribute Calculated.
- Simulation tasks may contribute Operated.
- Fault-diagnosis questions may contribute Diagnosed.
- Design challenges may contribute Designed.

Awarded competency points are derived from earned question points and persisted with the completed attempt.

## Simulation Evidence

Simulation competency awards depend on mode:

| Mode            | Award rule                                        |
| --------------- | ------------------------------------------------- |
| Learn           | Successful completion can award Introduced        |
| Guided          | Successful completion can award Operated          |
| Explore         | Practice only; no automatic mastery               |
| Fault diagnosis | Successful fault attempt can award Diagnosed      |
| Assessment      | Server-scored success can award verified Operated |

## Non-Award Cases

No competency is awarded for:

- Opening an assessment.
- Starting a simulation.
- Resetting a simulation.
- Saving in-progress answers.
- Client-submitted score claims.
- Failed or invalid unit validation.
- Duplicate completion requests that have already been recorded.

## Transaction Rule

Attempt completion, score persistence, progress updates, competency awards, and audit events must succeed together or roll back together.
