# Visual Lesson Architecture

## Purpose

This document defines the presentation architecture for `visual-v2` lessons. It extends the structured content system; it does not replace source governance, calculations, simulations, assessments, persistence, authentication, or curriculum data.

## Universal Lesson Model

| Stage                     | Required intent                              | Typical blocks                                                 |
| ------------------------- | -------------------------------------------- | -------------------------------------------------------------- |
| 1. Hero Experience        | Reveal the phenomenon immediately            | `heroSimulation`, `interactiveDiagram`, `animation`            |
| 2. Explore                | Let the student change meaningful inputs     | simulation controls, switches, valves, sliders, numeric inputs |
| 3. Observe                | Elicit prediction and observation            | `observationQuestion`, state summary                           |
| 4. Micro Theory           | Explain only what the observation needs      | `microTheory`, definition, callout                             |
| 5. Live Equation          | Connect state to reviewed mathematics        | `liveEquation`, symbol table, unit note                        |
| 6. Engineering Challenge  | Require purposeful operation or calculation  | `engineeringChallenge`                                         |
| 7. Fault Mode             | Create evidence-supported abnormal behaviour | `faultChallenge`, virtual instruments                          |
| 8. Real-World Application | Transfer the idea to practice                | `realWorldApplication`                                         |
| 9. Knowledge Check        | Verify the stated learning outcome           | assessment question or practice check                          |
| 10. Deep Dive             | Preserve rigorous academic depth             | `deepDive`, derivation, limitations                            |
| 11. Sources               | Expose traceability and review state         | source citations, review badge                                 |

A lesson declares which stages apply. Omitted stages require an author rationale; a missing fault stage is valid when evidence or subject matter does not support one.

## Runtime Boundaries

```text
Lesson JSON and review metadata
        |
        v
Lesson feature orchestrator ---- assessment feature
        |
        +---- simulation definition/runtime
        |             |
        |             v
        +------ engineering-core
                      |
                      v
              CalculationResult
                      |
                      v
              domain simulation state
                      |
                      v
              VisualState adapter
          /       |       |        \
     equipment schematic instruments live equation
                      |
                      v
              accessible state summary
```

- Lesson content owns sequence, explanation, IDs, bindings, and citations.
- Feature modules coordinate content, mode, and user actions.
- Simulation logic owns operating state, time, faults, events, and measurements.
- `engineering-core` owns formulas, validity, assumptions, warnings, and SI results.
- The visual adapter maps domain state to renderable properties and contains no formula.
- UI components render state and dispatch declared commands. They do not access the database or score graded work.
- Persistence stores authenticated outcome and attempt summaries, not animation frames.

## VisualState Presentation Contract

`VisualState` is a derived, disposable view model. It includes stable component IDs, representation state, normalized positions, paths, vectors, labels, readings, alerts, selected measurement points, and a concise non-visual summary. It may map valid domain values to coordinates, opacity, patterns, or animation duration. It must not recalculate engineering outputs, invent a pressure loss, or change domain state.

Every rendered component uses the same `componentId` in external, internal, and schematic views. A selection or command targets that ID through the feature orchestrator.

## Stage Shell

The lesson shell provides:

- A short header with title, prerequisites, duration, difficulty, and review status.
- A full-width, unframed hero experience on suitable lessons.
- Quick, Engineering, and Deep Dive depth controls.
- A stage navigator that reports position without forcing linear completion.
- A stable simulation toolbar for play, pause, reset, step, and speed.
- A mobile composition of equipment, expandable controls, measurements, equation, and challenge.
- Loading, unsupported, invalid-state, low-data, reduced-motion, and error fallbacks.
- Print output that replaces active visuals with labelled state snapshots, summaries, equations, and sources.

The shell can show the next recommended lesson and save progress only when authenticated. Completion follows the existing progress policy and requires outcome-bearing activity.

## Interaction Model

Controls declare a command ID and bind to a simulation input or feature action. Sliders always pair with a labelled numeric input; drag handles pair with keyboard movement or steppers; switches and valves expose explicit states. Input validation occurs before commands enter the runtime, and invalid values do not produce plausible-looking motion.

Observation questions precede explanatory feedback. Ungraded responses may be retained only according to the declared persistence policy. Graded questions delegate to the assessment service and never include trusted answers in client content.

## Calculation-To-Visual Connection

When a student submits a calculation, a validated result may be applied through a declared command such as `useCalculatedValue`. The simulation accepts the normalized SI value only after dimension and range validation. The visual, measurement, and Live Equation then update from the resulting domain state. A visual component cannot parse free text and set its own value.

## Modes And Review Gates

| Experience                                          | Minimum evidence before student release                                     |
| --------------------------------------------------- | --------------------------------------------------------------------------- |
| Static explanatory diagram                          | Source-checked technical statements and asset rights                        |
| Interactive diagram with no engineering calculation | Reviewed state mapping and accessibility tests                              |
| Live Equation                                       | Equation checked plus known-answer, unit, boundary, and invalid-input tests |
| Normal simulation                                   | Simulation checked with normal and boundary test evidence                   |
| Fault challenge                                     | Simulation checked with fault evidence and diagnostic test cases            |
| Real-world application                              | Approved source IDs and licensed/original assets                            |

The lesson renderer must display a safe fallback when an embedded item does not meet the lesson’s publication gate.

## Responsive Composition

Desktop may place the equipment view beside controls and measurements. Mobile uses the ordered stack `equipment -> controls -> measurements -> equation -> challenge`, with a sticky compact play/pause control only when it does not obscure content. Landscape can be recommended for complex schematics but cannot be the only usable orientation.

## Failure Behaviour

- Simulation import failure: keep micro theory, a state diagram, and sources available.
- Invalid engineering result: stop or hold dependent motion, show the structured warning, and preserve the last explicitly labelled valid state only if pedagogically necessary.
- Missing asset: use a reviewed text and schematic fallback, not an unrelated generic diagram.
- Offline or low data: load the lesson shell first and allow the student to opt into heavier assets.
- Unapproved fault: omit or lock the fault challenge with an evidence-required authoring message; do not expose that message as a student activity.

## Validation And Testing

Every visual lesson needs schema validation, render tests for each declared stage, keyboard and screen-reader checks, mobile viewport checks, reduced-motion checks, calculation synchronization tests, source/reference validation, and review-gate tests. Simulations retain normal, boundary, and every-fault domain tests independently of visual snapshots.
