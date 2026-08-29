# Visual Lesson Authoring Guide

Version: 1.0.0

## Start With The Outcome

Before writing content, answer:

1. What phenomenon should students see?
2. What can they manipulate?
3. What should they notice?
4. Which reviewed equation explains it?
5. Which real system uses it?
6. What challenge proves understanding?
7. What detailed theory can move to Deep Dive?

If these questions do not produce a meaningful visual state and interaction, choose a
different visual lesson type or a linear theory lesson. Never manufacture a simulation to
meet a presentation preference.

## Authoring Sequence

1. Select one primary learning outcome and lesson type.
2. Identify approved source IDs, knowledge-file IDs, equation IDs, simulation IDs, and
   review gates.
3. Write the one-sentence first-screen purpose.
4. Define the valid default state and the primary visual block.
5. Declare each input and output using the Visual Standard V1 metadata contract.
6. Sketch the cause-and-effect path from input to engineering-core to simulation state to
   each representation and text alternative.
7. Write observation questions before explanatory feedback.
8. Write one Micro Theory concept without copying the hero callout.
9. Add Engineering detail and optional Deep Dive material.
10. Add a challenge only when its goal, actions, condition, feedback, and assumptions are
    explicit.
11. Add a concise, sourced real-world connection.
12. Validate content, inspect mobile and keyboard order, and complete the release
    checklist.

## First-Screen Authoring

Use the title for the topic and the purpose sentence for the intended action. The primary
visual block ID must appear in the first `heroExperience` stage. Declare at least one
primary control ID that resolves to input metadata.

Keep prerequisites and outcomes compact. Do not place source cards, review history,
derivations, or long introductory prose before the hero.

## Input Template

For every input record:

```json
{
  "id": "pressureMPa",
  "label": "Pressure",
  "quantity": "pressure",
  "unit": "MPa",
  "internalUnit": "Pa",
  "default": 5,
  "minimum": 0,
  "maximum": 20,
  "step": 0.5,
  "validation": "Reject non-finite values and constrain the educational range.",
  "modelValidityRange": { "minimum": 0, "maximum": 20 },
  "accessibilityLabel": "Cap-end pressure in megapascals",
  "educationalDescription": "Controls the pressure used by the ideal force model."
}
```

The example range belongs only to the hydraulic reference lesson. Do not copy its values
into another lesson without reviewed model evidence.

## Output Template

For every output record:

```json
{
  "id": "cylinderForce",
  "label": "Theoretical extension force",
  "quantity": "force",
  "unit": "kN",
  "internalUnit": "N",
  "interpretation": "Ideal cap-end extension force, not rated available force.",
  "validityState": "valid",
  "warning": "The model excludes losses and component ratings.",
  "measurementSource": "EQ-FLUID-FORCE-PRESSURE-AREA-001 result"
}
```

Display only outputs that help the learner reason about the declared outcome.

## Challenge Template

Choose one pattern:

- `target`: reach a declared value.
- `constraint`: meet an objective without crossing a declared educational limit.
- `diagnosis`: select evidence and identify an approved fault.
- `design`: choose variables that satisfy an objective and constraints.

Then declare goal, allowed actions, success condition, three feedback states, and model
assumptions. A practice challenge uses an explicit Check action. A graded challenge uses
the trusted assessment service and does not serialize hidden answers to the lesson.

## Writing Quick, Engineering, And Deep Dive

Quick answers: what is changing and why does it matter?

Engineering answers: which equation and SI quantities explain the result, and where is
the model valid?

Deep Dive answers: how is it derived, what is omitted, and what related knowledge is
needed next?

Move material instead of duplicating it. Safety information remains visible at the point
of credible risk or overclaim.

## Source And Review Discipline

Every technical claim and visual state must reference approved or clearly review-gated
source IDs. The content file cannot approve itself. New equations remain pure tested
engineering-core functions. New simulations require normal, boundary, and fault-state
tests; omit fault behaviour when no reviewed fault exists.

## Author Handoff

Provide reviewers with:

- Lesson type and outcome rationale.
- First-screen screenshot at desktop and mobile.
- Input/output metadata and model validity statement.
- Equation and source IDs.
- Challenge assumptions and feedback.
- Accessibility and reduced-motion evidence.
- Test and performance results.
- Known limitations and unresolved review items.
