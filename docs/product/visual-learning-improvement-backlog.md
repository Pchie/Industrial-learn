# Visual Learning Improvement Backlog

Backlog date: 2026-08-27

Source audit: `docs/audits/prompt-39d-visual-learning-ux-audit.md`

Scope: targeted visual-learning foundation and Hydraulic Cylinder Force pilot improvements. This backlog does not authorize new simulations, equation changes, publication approval, or unrelated platform redesign.

## Release Gate

Complete all P0 items and define an approved implementation plan for all P1 items before using the Prompt 39C lesson as the template for another flagship simulation. Preserve `Engineering review required` until independent review records exist.

## P0: Required Before Replication

| ID        | Improvement                                                                           | Evidence                                                                                         | Acceptance criterion                                                                                                                                                                                     | Boundaries                                                              |
| --------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| VL-P0-001 | Recompose the first viewport around the cutaway and pressure/diameter controls.       | The diagram starts at 1,132 px desktop/1,347 px mobile; mobile pressure starts at 2,511 px.      | At representative desktop and mobile sizes, the physical state and both primary variables are discoverable without passing playback, linked-component, or measurement configuration panels.              | Do not remove review status, model boundary, or numeric alternatives.   |
| VL-P0-002 | Replace time-based transport with controls appropriate to a static calculation model. | Play, speed, frame, and Step move only demonstrative piston position.                            | The interface cannot reasonably imply calculated time, velocity, flow, stroke, or acceleration. Any retained demonstration action is named and described as non-temporal.                                | Do not add dynamics without reviewed equations and tests.               |
| VL-P0-003 | Make the engineering scene legible rather than scaling the desktop SVG.               | The scene is 312 x 144 px desktop and 257 x 220 px mobile; embedded labels become tiny.          | Labels meet the design-system readable-text target at 320-430 px, or mobile uses a recomposed diagram with external HTML labels and the same state.                                                      | Preserve the text alternative and stable component IDs.                 |
| VL-P0-004 | Put learner units first and SI derivation at the correct depth.                       | Controls use MPa/mm, gauge uses raw Pa, and force alternates between N/kN.                       | Quick consistently presents MPa, mm, and kN with explicit symbols; Engineering shows Pa, m, m2, N, and conversions from the same checked result.                                                         | SI remains authoritative internally; no silent conversion.              |
| VL-P0-005 | Reorder focus and provide concise dynamic state feedback.                             | Pressure is focus stop 21; current state is not a live region and outputs use `aria-live="off"`. | Primary variables precede optional visual controls in focus order. A screen-reader test confirms that a bounded pressure/diameter change announces the resulting pressure/area/force without repetition. | Avoid announcing every animation frame or creating a noisy live region. |
| VL-P0-006 | Remove duplicated learner feedback and disclosure.                                    | Challenge success appears twice; Deep Dive and source content repeat across surfaces.            | One authoritative challenge result, one Deep Dive route, and one primary source-summary route remain in the learning flow; mandatory safety stays visible.                                               | Do not delete source traceability or academically useful detail.        |

## P1: Required Foundation Work

| ID        | Improvement                                           | Evidence                                                                                                                             | Acceptance criterion                                                                                                                                                              | Boundaries                                                                              |
| --------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| VL-P1-001 | Introduce a simulation-ID visual experience registry. | The lesson route checks `lesson.slug === "hydraulic-cylinder-force"` and injects a custom component.                                 | A validated lesson resolves an allowed experience by simulation/visual type without adding a slug branch to the route. Unknown or unapproved experiences produce a safe fallback. | Registry resolution must not weaken publication or review gates.                        |
| VL-P1-002 | Define domain-renderer extension points.              | Existing contracts suit components, gauges, vectors, and hydraulics but not cycle charts, ladder logic, beams, or circuit waveforms. | Architecture documents define shared shell/state interfaces plus domain-specific renderers for spatial, network, cycle/chart, discrete-logic, and structural views.               | Do not force every domain into hydraulic fields or a universal scene schema.            |
| VL-P1-003 | Strengthen the challenge pattern.                     | The 15 kN threshold is binary, can already be satisfied before Start, and has no trade-off or intentional submission.                | The challenge has a deliberate start/check flow, compares at least two variables, explains margin, and uses a reviewed educational constraint or explicitly documented rationale. | Never present success as professional design sufficiency or import unsupported ratings. |
| VL-P1-004 | Establish visual replication performance gates.       | Bundle size passes, but no low-end-device, React commit, long-task, memory, or layout-shift evidence exists.                         | CI/release evidence records per-route gzip, interaction latency, render count, long tasks, layout shift, offscreen behavior, and representative low-end/mobile results.           | Measurements must distinguish automation overhead from main-thread work.                |

## P1: Review Gates

| ID        | Review                     | Acceptance criterion                                                                                                                                                              |
| --------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| VL-RV-001 | Hydraulic schematic review | A named reviewer records whether the pressure-source/cylinder symbols, force direction, cap-end labels, and "Double-area" wording are acceptable for the stated simplified model. |
| VL-RV-002 | Motion-semantics review    | A named reviewer verifies that no motion or control implies flow, speed, acceleration, stroke, or lifting safety outside the model.                                               |
| VL-RV-003 | Educational review         | A first-year comprehension session verifies the pressure-area-force concept without Deep Dive and records where students hesitate.                                                |
| VL-RV-004 | Accessibility review       | Keyboard, screen-reader, zoom, reduced-motion, and mobile tests include manual comprehension, not only automated rule checks.                                                     |

Review completion does not automatically change publication status. Approval still requires the repository's versioned content-review workflow.

## P2: Optional Refinements

| ID        | Improvement                                                                      | Intended benefit                                                               |
| --------- | -------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| VL-P2-001 | Make Cutaway primary and disclose External/Schematic as secondary inspection.    | Reduces control count and keeps attention on pressure acting over area.        |
| VL-P2-002 | Present observation prompts progressively after relevant input changes.          | Reduces simultaneous reading and improves prediction-before-explanation.       |
| VL-P2-003 | Replace the one-option measurement selector with a direct P1 gauge.              | Removes a control that currently has no meaningful choice.                     |
| VL-P2-004 | Move low-data behavior to a persistent user preference with an in-lesson status. | Preserves the capability without competing with engineering controls.          |
| VL-P2-005 | Compare two successful pressure/diameter combinations.                           | Makes the educational trade-off visible without claiming equipment selection.  |
| VL-P2-006 | Add a compact revision state.                                                    | Helps assessment revision without duplicating the full theory or source trail. |
| VL-P2-007 | Ask where the cylinder model stops in the excavator system.                      | Reinforces the boundary between actuator force and machine capacity.           |

## Preserve Unchanged

- `pistonAreaFromDiameter`, `forceFromPressureAndArea`, and explicit SI conversions as pure tested functions.
- One-way domain state to visual state mapping.
- Equation IDs, source IDs, and honest review/publication status.
- Pressurised-state language without invented flow.
- Exclusion of rod-side behavior, ratings, efficiency, faults, and dynamics until reviewed support exists.
- Synchronized slider and numeric alternatives.
- Text equivalents, reduced-motion support, no colour-only state, and browser zoom.
- Authenticated server-scored formal assessment and no competence for page opening.
- Route-scoped SVG rendering and the current no-new-dependency posture.

## Recommended Prompt 39E Scope

Implement the P0 items on the Hydraulic Cylinder Force lesson only, design the P1 registry and renderer boundaries, and verify the pilot again at desktop, tablet, 320/375/430 px mobile, keyboard, screen reader, reduced motion, low data, and optimized production performance. Do not begin a second simulation until the replication gate passes.
