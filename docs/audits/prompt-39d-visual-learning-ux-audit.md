# Prompt 39D Visual Learning UX Audit

Audit date: 2026-08-27

Route audited: `/lessons/hydraulic-cylinder-force`

Implementation status audited: internal, version `0.1.0`, `Engineering review required`

## 1. Executive Verdict

**CONDITIONAL VISUAL-FIRST FOUNDATION**

Industrial Learn now behaves like **A. an interactive engineering learning platform**, not a theory-heavy LMS with a simulation added after the reading. The pressure and diameter controls drive checked SI calculations, simulation state, measurement, force, equation, and challenge feedback. The lesson asks for observation before explanation and does not require theory before interaction.

The foundation is not ready to be copied unchanged into the next flagship lesson. The actual hydraulic diagram is below the initial viewport, occupies only 18.2% of its desktop canvas, and becomes a small scaled drawing on mobile. The first pressure control starts 2,511 px down the 375 px document and is the 21st focus stop. Playback, frame, and speed controls animate demonstrative piston position even though the model has no flow, time, speed, or stroke. These issues make the implementation structurally visual-first but less visually immediate and less physically self-evident than its architecture promises.

Publication is outside this UX verdict. The equations are checked against `SRC-PARKER-140H8-CYLINDER-2024` and SI presentation is supported by `SRC-NIST-SP330-2019`, but the visual mapping, challenge, safety language, and lesson remain without named independent human approval.

## 2. Audit Method

The audit inspected the declared architecture, structured lesson, source and knowledge records, calculation and simulation boundaries, React implementation, CSS, tests, and optimized local production route. It exercised pressure, diameter, depth, representation, linked selection, and challenge controls at 1,440 x 900 and 375 x 900.

This is a product and UX audit, not a new technical-content review. No application, equation, content, schema, dependency, or database file was changed.

## 3. Visual-First Score

**71/100**

| Category                | Score | Evidence                                                                                                                                                           |
| ----------------------- | ----: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| First interaction       |  5/10 | Zero theory and zero prerequisite clicks, but the diagram begins at 1,132 px desktop/1,347 px mobile and the mobile pressure slider begins at 2,511 px.            |
| Visual dominance        |  5/10 | The visual stage precedes metadata and theory, but the 312 x 144 desktop diagram is only 18.2% of its canvas and interface panels dominate.                        |
| Cause and effect        | 14/15 | Pressure, diameter, area, force, gauge, summary, vector, and challenge remain synchronized from one checked state.                                                 |
| Engineering honesty     | 12/15 | Flow, ratings, dynamics, and vector scale are explicitly limited; Play/speed/frame still suggest dynamics absent from the model.                                   |
| Calculation integration |  9/10 | `engineering-core` owns both equations and Live Equation exposes SI inputs, steps, assumptions, and equation IDs.                                                  |
| Challenge quality       |  6/10 | The threshold, margin, and idealised wording are clear, but success is binary, arbitrary as an educational target, and teaches little trade-off reasoning.         |
| Real-world connection   |  8/10 | The original excavator illustration is relevant, concise, source-linked, and caveated; it remains a static context rather than a system-level transfer task.       |
| Mobile experience       |  4/10 | No horizontal overflow and controls are usable, but the journey is 12,297 px tall, the diagram labels are visually tiny, and the layout is mostly a desktop stack. |
| Accessibility           |   4/5 | Strong labels, numeric alternatives, keyboard support, text equivalents, reduced motion, and zoom; focus burden and unannounced live state remain.                 |
| Performance             |   4/5 | Route-specific 21.3 KB gzip client code and simple SVG pass the pilot budget; field, low-end-device, raw main-thread, and React commit evidence is absent.         |

## 4. Primary Experience Test

Classification: **NEEDS IMPROVEMENT**

| Question                                          | Verdict and evidence                                                                                                                                                                                                                                  |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| What appears first?                               | Global navigation, breadcrumb, a 206 px lesson identity panel, then the visual-stage heading and simulation-shell header. The actual engineering diagram is below the first viewport at both tested sizes.                                            |
| Time to first meaningful interaction              | No responsible field TTI is available. The control was hydrated in the optimized local build, but spatial access is the dominant issue: it clips into the bottom of the desktop viewport and requires about 2.8 mobile viewport heights of scrolling. |
| Theory paragraphs before interaction              | Zero. The 18-word description and 7-word principle are orientation, not a theory prerequisite.                                                                                                                                                        |
| Clicks before control                             | Zero after reaching the slider. No modal, start gate, or Deep Dive selection is required.                                                                                                                                                             |
| Is the primary visual immediately understandable? | Partly. The headline is clear, but the physical diagram itself is not visible initially and its labels are too small at the rendered size.                                                                                                            |
| Can the concept be discovered without Deep Dive?  | Yes. Quick mode shows pressure, diameter, area, force, gauge, vector, observations, concise theory, and the challenge.                                                                                                                                |
| Does observation precede explanation?             | Yes in document order. Three prompts appear before Micro Theory, although they are all shown together rather than progressively.                                                                                                                      |
| Do calculations visibly affect the system?        | Yes. At 50 mm, 5 to 10 MPa changed force from 9,817.5 N to 19,635 N. At 10 MPa, 50 to 100 mm changed area from 0.0019635 m2 to 0.00785398 m2 and force to 78,539.8 N.                                                                                 |

The lesson is simulation-first in sequence, but balanced-to-interface-heavy in the rendered composition. It does not feel theory-first.

## 5. Journey Against The Learning Model

| Stage     | Evidence                                                                              | Verdict                                       |
| --------- | ------------------------------------------------------------------------------------- | --------------------------------------------- |
| See       | Paused cap-end cutaway, pressure state, force vector, gauge, and state summary exist. | Present, but visually delayed and undersized. |
| Interact  | Synchronized slider and numeric inputs for MPa and mm.                                | Strong once reached.                          |
| Observe   | Three concise prediction/observation prompts with staged hint and explanation.        | Strong, with some simultaneous density.       |
| Explain   | Quick Micro Theory follows observation.                                               | Strong and concise.                           |
| Calculate | Engineering/Deep Dive expose `A = pi D2 / 4` and `F = pA` from checked results.       | Strong.                                       |
| Connect   | Physical, cutaway, schematic, P1, gauge, vector, and text share state/component IDs.  | Functionally strong; visual scale weak.       |
| Challenge | Ideal force is compared with a 15 kN educational condition.                           | Functional but shallow.                       |
| Apply     | Excavator boom-cylinder context is sourced and bounded.                               | Relevant and honest.                          |

## 6. Visual Dominance And Cognitive Load

The visual experience begins before metadata, progress, navigation, checks, and sources. That is the correct information hierarchy. The rendered workbench does not yet fulfil the intended "large central simulation":

- At desktop size, the simulation shell measured 1,006 x 1,550 px, while the hydraulic scene measured 312 x 144 px.
- The scene occupied 18.2% of the 662 x 372 px canvas; the force-vector panel consumed a similar area.
- The viewport stretches to the 1,263 px control/measurement column, leaving a large empty region between the canvas and state summary.
- Playback, status badges, low-data preference, three representations, three linked-component buttons, two paired inputs, measurement selection, gauge, digital pressure, area, force, vector, and state notes compete in one hero.
- On mobile, those regions are serialized rather than recomposed around the key pressure-area-force loop.
- The full Quick page exposed about 1,062 rendered main-content words, 7,183 desktop pixels, and 12,297 mobile pixels. Long source records and repeated source references restore an article-like tail after the visual experience.

### Immediate

Keep the cutaway, pressure and diameter controls, compact pressure/area/force readings, one state summary, and challenge entry immediately available.

### Progressive Disclosure

Move linked-component lists, low-data preference, optional measurement selection, observation explanations, and secondary representation detail behind concise disclosure or contextual selection.

### Engineering

Keep live substitution, equation IDs, explicit SI conversion, steps, symbols, units, assumptions, and worked interpretation in Engineering.

### Deep Dive

Keep derivation, excluded effects, source detail, and advanced limitations in one Deep Dive surface. Do not retain a mode-specific Deep Dive plus a separate downstream Deep Dive section containing overlapping derivation and limitations.

Mandatory model and safety boundaries must remain visible outside Deep Dive.

## 7. Quick, Engineering, And Deep Dive

The three levels are meaningfully different at their core:

- Quick presents a 29-word principle, a short engineering note, mandatory model boundary, and current pressure-diameter-force state.
- Engineering replaces the compact relationship with two synchronized Live Equations, input substitution, result, equation ID, and expandable steps/symbols/assumptions.
- Deep Dive adds the expanded explanation and a limitation alert while retaining the Engineering equations.

Duplication remains:

- Pressure alone needing area appears in both the principle and engineering note.
- Deep Dive limitations appear in the interactive depth mode and again in the separate structured Deep Dive stage.
- Source IDs appear in the hero footer, block footers, Sources stage, and Source records section.
- The challenge component and a second alert both state completion and repeat the same ideal-force success sentence.

Safety is not hidden. The educational-model boundary is visible in every depth, and the challenge carries a separate safety limitation.

## 8. Engineering Cause And Effect

The core state loop is the strongest part of the pilot.

`pressure MPa -> explicit Pa conversion -> force calculation -> simulation state -> gauge/state/vector/challenge`

`diameter mm -> explicit m conversion -> circular area -> force calculation -> simulation state -> piston display/state/vector/challenge`

The calculations are pure and external to React. `pistonAreaFromDiameter` uses `EQ-HYD-PISTON-AREA-DIAMETER-001`; `forceFromPressureAndArea` uses `EQ-FLUID-FORCE-PRESSURE-AREA-001`. The adapter rejects invalid or inconsistent results instead of showing plausible motion. These relationships are supported for the ideal cap-end case by `SRC-PARKER-140H8-CYLINDER-2024`.

Pressure changes update the gauge, digital reading, state summary, scene label, force value, vector, Quick summary, equations, and challenge. Diameter changes update area, force, display piston height, vector, summary, equations, and challenge. The displayed piston diameter is a normalized comparison cue rather than a drawing dimension.

The only cosmetic state is playback frame/position. It changes demonstrative piston position without changing pressure, area, force, or any calculated displacement.

## 9. Live Equation Quality

Live Equation is not a browser-side calculator replica. It renders `engineering-core` results and exposes current inputs, units, result, assumptions, warnings, steps, symbols, and equation IDs. Synchronization was verified after pressure and diameter changes.

It supports understanding better than a result-only calculator because the student can see diameter become area and area combine with pressure. However:

- Quick mode does not place the compact relationship beside the visual/controls; it appears much later in the page.
- The gauge and digital pressure use raw Pa (`5000000`) while the control uses 5 MPa, and force appears in both N and kN. This is technically valid but creates avoidable novice parsing work.
- The two equation cards are detached from the physical diagram by the observation and stage structure, so the visual relationship is sequential rather than spatially linked.
- Invalid numeric UI values are constrained and announced, but the native min/max controls make the pure model's invalid state difficult to inspect as a learner.

## 10. Interaction Control Review

| Control                     | Audit verdict                                                                                                                                                                                                                                                     |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Pressure slider + number    | Necessary, clear, synchronized, bounded, keyboard accessible, and immediately updates state. Keep.                                                                                                                                                                |
| Diameter slider + number    | Necessary and synchronized. The visual diameter cue is useful, though not large enough to compare easily on mobile. Keep.                                                                                                                                         |
| Gauge                       | State-derived and accessible. Present MPa as the primary teaching scale while retaining Pa in Engineering.                                                                                                                                                        |
| Force vector                | State-derived, bounded, labelled, and explicitly nonphysical. Keep, but integrate it with the cylinder rather than giving it equal standalone canvas weight.                                                                                                      |
| Reset                       | Useful and honest. Keep.                                                                                                                                                                                                                                          |
| Play/Pause/Step/speed/frame | Not necessary for this static pressure-area relationship. Despite disclosure, the transport controls imply time-based dynamics and add five focus stops before the learning inputs. Remove from this model or rename/reframe as a nonphysical view demonstration. |
| External view               | Adds limited conceptual information compared with Cutaway. Make secondary unless a later lesson needs external observation.                                                                                                                                       |
| Cutaway                     | Best default and most educational representation. Keep prominent.                                                                                                                                                                                                 |
| Schematic                   | Shared selection works. The symbol and phrase "Double-area symbol shown" need independent schematic review before reuse.                                                                                                                                          |
| Linked component buttons    | Demonstrate the component-ID contract but repeat selection already available in the SVG. Collapse or contextualize for the student lesson.                                                                                                                        |
| P1 measurement point        | Correctly state-derived. With only one available point, a selection panel is unnecessary overhead; show it as a direct labelled measurement.                                                                                                                      |
| Low-data visuals            | Important capability, but a global/student preference is a better default than a primary lesson control.                                                                                                                                                          |
| Challenge start             | Clear gate, but success can be immediate if prior exploration already exceeds the target. Add an intentional check/submit moment to distinguish experimentation from success evidence.                                                                            |

## 11. Visual Engineering Honesty

What works extremely well:

- The line is described as pressurised; no fluid particles or calculated flow are shown.
- Text states that flow, piston velocity, and stroke are not calculated.
- Piston position is explicitly demonstrative.
- Force-vector length is documented as normalized and not distance or stroke.
- The load condition is ideal theoretical force, never a safe design claim.
- The excavator section states that linkage, load position, losses, mounting, and system pressure are missing from the simple relationship. The narrow application statement is tied to `SRC-CAT-BOOM-CYLINDER-6040431-2026`.
- Unsupported rod-side behavior, ratings, efficiency, and faults are omitted.

Issues requiring correction before replication:

1. Play, Pause, Step, frame, and 0.5x/1x/2x speed give a strong time-model affordance. Documentation does not fully undo that learned implication.
2. Challenge success moves the load graphic upward even though real load motion, acceleration, structure, and linkage are not modelled. The small motion is labelled through surrounding text, but a static condition indicator would be more honest.
3. The schematic symbol is an original teaching graphic, not a declared reviewed symbol vocabulary. Its "Double-area" label is ambiguous for an extension-only cap-end model.
4. Pressure colour/pattern represents a uniform state, which is acceptable here, but future lessons must not reuse it to imply gradients or pressure losses without domain state.

No false flow calculation, pressure gradient, equipment rating, or excavator capacity claim was found.

## 12. Challenge And Real-World Connection

### Load Challenge

The challenge is understandable, gives required force, calculated force, signed margin, and explicit idealised feedback. It encourages pressure/diameter experimentation and remains within the checked `F = pA` model.

It does not yet teach a meaningful engineering trade-off. The 15 kN target is explicitly educational but arbitrary; any of many combinations succeeds, there is no pressure constraint, no comparison of alternatives, and no explicit submission or reasoning step. The live success state can be triggered before the student reads the challenge. Feedback is duplicated by the generic challenge component and a second alert.

Verdict: useful first manipulation, not yet a flagship reasoning challenge.

### Excavator Application

The section adds meaningful transfer rather than decoration. The original visual shows cylinder placement, the explanation connects pressure to linear actuator force, and the caveat prevents a machine-capacity inference. It is concise and source-bounded. A future application task could ask the student to identify where the simple cylinder result stops and linkage/load geometry begins; that is optional and must use reviewed evidence.

## 13. Visual Language Consistency

Force is consistently orange, hydraulic pressure uses the hydraulic token/pattern, P1 uses an information marker, selected components use a patterned orange outline, and every state also has text. Units remain technically consistent but alternate between Pa/MPa and N/kN without a single display policy.

The active/selected language is accessible without colour. The schematic, physical scene, component list, and measurement point use stable IDs. Fault language cannot be evaluated in this pilot because no reviewed fault is enabled; the foundation provides only a contract/status panel.

The main inconsistency is semantic rather than chromatic: playback styling says "simulation" and "speed" while the only moving quantity is a nonphysical display frame.

## 14. Accessibility Audit

Strengths:

- Every range input has a synchronized numeric alternative.
- Native controls and the SVG cylinder selection operate by keyboard.
- Cutaway, schematic, gauge, vector, current state, and challenge have text equivalents.
- Challenge result uses text and a status region, not colour alone.
- Reduced motion disables automatic frame progression and preserves Step.
- Browser zoom is not disabled; no horizontal overflow appeared at 375 px.
- Existing Axe, keyboard, mobile, and reduced-motion browser tests pass.

Manual-audit issues:

- The pressure slider is focus stop 21 from page start. Thirteen lesson-specific controls precede it, including transport, low-data, representations, and linked components.
- Current state has no `aria-live` or status role, while frame and pressure outputs use `aria-live="off"`. A screen-reader user changing pressure or diameter is not guaranteed immediate downstream feedback.
- The scene's long group label, interactive cylinder child, linked-component buttons, force figure, and separate state summary repeat similar information.
- Mobile focus order follows DOM order, but that means transport and representation controls precede the primary engineering variables.
- Automated Axe results do not establish screen-reader comprehension, touch target comfort at zoom, or voice-control discoverability.

Accessibility verdict: strong foundation with required focus-order and dynamic-announcement refinement.

## 15. Mobile UX Audit

The mobile implementation is usable but mostly stacked, not purposefully recomposed:

- At 375 x 900, the visual experience starts at 645 px, the SVG starts at 1,347 px, and the pressure slider starts at 2,511 px.
- The full document is 12,297 px tall with no horizontal overflow.
- The 960 x 440 SVG is scaled to 257 x 220 px. Its embedded 13-22 px SVG labels become too small for comfortable visual learning.
- Playback precedes equipment; equipment precedes primary controls; linked components and the separate force panel lengthen the route to pressure/diameter.
- Pressure and diameter sliders retain 223 px tracks and numeric alternatives, so direct operation is sound once reached.
- Equation, challenge, Deep Dive, and source records are usable but require extensive vertical travel and loss of context.

Verdict: **simply stacked with responsive safeguards**, not yet an intentional mobile visual-learning composition.

## 16. Performance Audit

The pilot is appropriately conservative for one 2D simulation:

- Dynamic route loading keeps the hydraulic client out of unrelated lesson routes.
- Route-specific client chunks are 76,150 B raw/21,317 B gzip, below the 35 KB pilot budget.
- The page contains four SVGs with 61 total SVG descendants and no SVG animation elements in the paused state.
- Calculation recomputation is memoized by input, and the timer is created only while Play is active.
- A prior 20-change production sample reported 198 ms median and 362 ms p95 including automation/readback, with no stale result.

Risks:

- The full hydraulic lesson component rerenders scene, instruments, equations, and challenge on each input; no React commit or raw main-thread profile exists.
- No field Core Web Vitals, low-end Android, throttled network, memory, or long-task evidence exists.
- Offscreen automatic pausing is not implemented.
- The dynamic import has no explicit lesson-level loading placeholder; layout-shift impact was not measured.
- One pilot already uses 1,827 feature lines before shared-foundation code. Repeating slug-specific components will create a maintenance and bundle problem faster than SVG complexity will.

## 17. Theory Burden

Classification: **LOW for mandatory theory; MODERATE for total page/disclosure burden**

| Measure                                        | Result | Method                                                                                                                                                 |
| ---------------------------------------------- | -----: | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Required theory words before first interaction |      0 | The student may operate the slider without reading theory. There are 30 orientation words across description, principle heading, and simulation title. |
| Required theory words before challenge         |     56 | Strict count of Quick principle, engineering note, and mandatory model boundary. About 74 words when the current-state equation summary is included.   |
| Optional Deep Dive words                       |    128 | Expanded Micro Theory plus separate derivation, assumption, and interpretation text; labels and source IDs excluded.                                   |
| Expandable sections in Quick                   |     13 | Six observation hint/explanation details, six check explanations, one downstream Deep Dive.                                                            |
| Expandable sections in Deep Dive mode          |     18 | Quick disclosures plus Explain more and four Live Equation details.                                                                                    |

Theory is not the primary burden. Navigation distance, panel count, repeated disclosure, and raw source presentation are.

## 18. Student Persona Test

| Persona                              | What works                                                                         | Confusing or missing                                                                                  | Unnecessary                                                                          |
| ------------------------------------ | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| First-year student with weak theory  | Direct manipulation, plain-language principle, safe defaults, Quick mode.          | Raw Pa values, tiny diagram labels, `cap-end`, many controls before pressure, no guided first action. | Speed/frame, three component buttons, single-point selector.                         |
| Strong second-year student           | Live equations, SI conversion, squared-diameter effect, assumptions, model limits. | Challenge lacks constraints or comparison of alternatives.                                            | Repeated source IDs and repeated ideal-model warnings.                               |
| Visual learner                       | Cutaway, gauge, vector, synchronized size/force, excavator visual.                 | Physical diagram is small and separated from controls/equation, especially on mobile.                 | Article tail and large source record blocks during the learning flow.                |
| Student revising before assessment   | Quick relationship, current values, six checks, formal-assessment link.            | No compact recap state or direct question-to-simulation replay.                                       | Playback transport and long component-selection sequence.                            |
| Junior engineer refreshing knowledge | Source IDs, equation IDs, assumptions, exclusions, engineering depth.              | Internal/unapproved status and simplified schematic prevent professional reliance, correctly so.      | Introductory linked-component demonstration and repeated plain-language explanation. |

## 19. Platform Scale Test

The state/renderer separation, measurement contract, source/review metadata, mode policy, and reusable controls are a sound base. The current lesson integration is not yet a scalable authoring/runtime architecture: the route checks one slug and injects one custom component, while most JSON visual blocks act as metadata rather than declarative orchestration. The hydraulic feature alone contains 1,827 lines including tests and CSS.

| Domain              | Reusable now                                           | Missing before credible scale                                                                                  |
| ------------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| Pump systems        | Components, measurements, controls, schematic linkage. | Network topology, flow/head domain adapter, curve/operating-point visual, multi-component state selection.     |
| Bernoulli           | Live Equation, measurements, vectors.                  | Station/path model, elevation and energy-grade views, term-by-term visual binding.                             |
| Refrigeration cycle | Modes, state summary, equations.                       | Governed property-data service, state-point contract, chart renderer, phase-region accessibility.              |
| Heat exchangers     | Instruments, linked representations.                   | Coupled-stream/spatial profile model, transient policy, scalable plot renderer.                                |
| Electrical circuits | Components, measurements, schematic linkage.           | Circuit graph, voltage/current conventions, waveform/phasor renderer, domain-specific instruments.             |
| Motors              | Vectors, gauges, playback shell.                       | Torque-speed/electromagnetic domain model, rotating-frame semantics, honest time dynamics.                     |
| PLC ladder logic    | Mode policy and state summary only.                    | Discrete scan-cycle engine, rung state semantics, timeline, keyboard-first ladder navigation.                  |
| Beam loading        | Vectors and calculation result.                        | Geometry/constraint model, free-body diagram, shear/moment plot, coordinate and sign conventions.              |
| Gears               | Linked components and vectors.                         | Kinematic constraint graph, ratio/direction model, contact/rotation semantics.                                 |
| Battery systems     | Measurements, warnings, charts as future extension.    | Electrothermal state, charge/energy distinction, cell/pack hierarchy, time-series and safety-state governance. |

Before more simulations, the platform needs a simulation-ID registry, domain renderer/adaptor interface, declarative control/measurement bindings, and domain-specific visual plugins. A universal hydraulic-style scene contract would be the wrong abstraction.

## 20. Required Improvements

1. Recompose the hero so the cutaway and primary pressure/diameter controls are visible together at desktop and reached within the first mobile viewport after the lesson identity.
2. Remove Play/Pause/speed/frame from static calculation simulations, or replace them with explicitly non-temporal demonstration controls.
3. Enlarge or responsively recompose the hydraulic scene; do not scale a label-rich 960 x 440 drawing to 257 px.
4. Use learner display units consistently: MPa/kN in Quick, with Pa/N and explicit conversion in Engineering.
5. Move pressure/diameter ahead of optional representation, low-data, linked-component, and measurement-selection controls in visual and focus order.
6. Announce a concise state change after primary input updates and reduce repeated screen-reader descriptions.
7. Consolidate duplicate challenge feedback, Deep Dive content, and source-reference surfaces.
8. Add an intentional challenge check and a reviewed educational trade-off constraint before calling it flagship reasoning.
9. Obtain independent review of schematic symbol/wording and all visual motion semantics; retain `Engineering review required` until then.
10. Replace the slug-specific route branch with a registered simulation/lesson experience boundary before a second flagship visual lesson.
11. Establish mobile visual-legibility, focus-order, React commit, low-end-device, and bundle budgets as replication gates.

## 21. Optional Improvements

- Make Cutaway the sole primary view and disclose External/Schematic as secondary inspection modes.
- Present observation prompts one at a time after a meaningful input change.
- Convert the single P1 selector into a direct labelled gauge until multiple valid points exist.
- Move low-data selection into a persistent accessibility/data preference.
- Add an optional comparison of two valid pressure/diameter solutions after the main challenge.
- Add a compact revision summary that reuses the current state without duplicating theory.
- Add an application question that distinguishes cylinder force from machine lifting capacity using reviewed evidence.

## 22. What Should Remain Unchanged

- Pure SI calculations and explicit conversion outside UI components.
- The one-way engineering/simulation/visual-state boundary.
- Checked equation IDs and source traceability.
- Honest internal publication and review status.
- The pressurised-state versus calculated-flow distinction.
- Omission of unsupported rod-side behavior, ratings, efficiencies, and faults.
- Bounded, synchronized slider and numeric controls.
- Text alternatives, reduced motion, no colour-only meaning, and zoom support.
- Server-controlled formal assessment and no progress for page opening or casual interaction.
- SVG-first, route-scoped loading without a new rendering dependency.

## 23. Recommendation For Prompt 39E

Prompt 39E should be a **Hydraulic Pilot UX Consolidation And Replication Gate**, not another simulation. It should implement and verify the required improvements above on this one lesson, with particular emphasis on first-viewport composition, mobile legibility, model-appropriate controls, learner units, focus/live feedback, duplicate removal, and a simulation-ID experience registry. It should finish with an independent visual and engineering review checkpoint before any pump, thermodynamics, electrical, or automation flagship is authorized.

The next prompt must not change the checked equations or mark the lesson approved. It should preserve the source and model boundaries established by `SRC-PARKER-140H8-CYLINDER-2024`, `SRC-NIST-SP330-2019`, and `SRC-CAT-BOOM-CYLINDER-6040431-2026`.

## Final Verdict

**CONDITIONAL VISUAL-FIRST FOUNDATION**
