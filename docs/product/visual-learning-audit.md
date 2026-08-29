# Visual Learning Audit

Audit date: 2026-08-26

Scope: all structured lessons currently registered for the reusable student lesson route.

## Method

The audit inspected each lesson JSON file, the shared lesson renderer, the simulation catalogue, and the content validator. Counts describe the student experience that the current renderer actually presents, not references that exist only as metadata.

- Visible words include student-facing titles, explanatory text, labels, questions, and summaries.
- A long block contains at least 60 words. The longest block is reported to show reading density.
- Theory sections are `keyTerminology`, `theory`, `equations`, `workedExamples`, and `summary` when present.
- An interactive element changes learning state or asks for a response. Navigation and disclosure controls are not counted.
- A simulation counts only when an operable simulation is embedded in the lesson. A paragraph naming a simulation does not count.
- A fault exercise may be counted even when text-only, but its presentation quality is stated.
- Classification uses the delivered learning flow, not the technical quality of the underlying source material.

## Results

| Lesson                                             | Visible words | Long blocks / longest | Theory sections | Equations | Diagrams | Animations | Interactive elements | Simulations | Challenges | Applications | Fault exercises | Class |
| -------------------------------------------------- | ------------: | --------------------: | --------------: | --------: | -------: | ---------: | -------------------: | ----------: | ---------: | -----------: | --------------: | ----- |
| Basic Fluid Pressure                               |           562 |          1 / 81 words |               5 |         1 | 1 static |          0 |           1 question |           0 |          0 |            0 |     1 text-only | **D** |
| Pump System Units and Measurements                 |           605 |          1 / 99 words |               5 |         0 | 1 static |          0 |           1 question |           0 |          0 |            0 |    0 meaningful | **D** |
| Thermodynamic Systems, Surroundings and Boundaries |           719 |          1 / 97 words |               5 |         0 | 1 static |          0 |           1 question |           0 |          0 |            0 |     1 text-only | **D** |

Classification key: A, strong visual-first experience; B, good balance; C, theory dominant; D, mostly static reading.

## Findings By Lesson

### Basic Fluid Pressure

The lesson is concise by textbook standards and has a reviewed pressure equation, a worked calculation, a question, and traceable sources. It nevertheless follows a passive section sequence before the student can operate anything. The diagram is static, the hydraulic simulation is not embedded, the activity is descriptive text, and the fault case does not provide measurements or controls.

This is the strongest migration candidate because `engineering-core` already supplies the tested pressure and force calculations and the simulation package already contains a hydraulic-cylinder definition. The existing hydraulic simulation remains only `Equation checked`; unsupported fault multipliers and training ranges must not be promoted through a richer visual treatment.

### Pump System Units and Measurements

The lesson uses accurate SI and measurement context, but the student mainly reads definitions and examples. Its visual block is rendered by the same generic force-and-area component used for every lesson, so it does not provide a pump-system measurement map. The lesson can gain meaningful interaction without a dynamic pump model by letting students identify measurement points, compare explicit unit representations, and predict which instrument is appropriate.

### Thermodynamic Systems, Surroundings and Boundaries

This is the longest current lesson and remains a technically reviewable unpublished draft. Its central skill is classification, which lends itself to an interactive boundary diagram and observation questions. A moving-molecule or piston-compression simulation would require additional reviewed equations, state relationships, and evidence; it is not an easy presentation-only migration.

## Shared Experience Problems

1. The renderer enforces the old 18-section order, beginning with metadata and explanation rather than an engineering phenomenon.
2. `DiagramBlockView` renders one generic force/area picture and does not interpret lesson-specific diagram data. Pump and thermodynamics diagram descriptions therefore do not produce subject-specific visuals.
3. `interactiveActivity` is currently a section containing ordinary content blocks, not a simulation contract.
4. Fault cases are static prose without controlled fault injection, selectable measurement points, or diagnostic state.
5. Equations and measurements are detached from visual state; no single input updates the calculation, instrument, and representation together.
6. The separate simulation route has solid domain behaviour but its cylinder picture is not driven by physical position or a reviewed time model.
7. The only common learning interaction is a radio question. Worked-step disclosures support reading but do not establish cause-and-effect exploration.
8. No current lesson contains an engineering challenge or a concrete real-world application block.

## Foundation Worth Preserving

- Structured lessons, source IDs, knowledge files, review statuses, and publication gates.
- Pure SI-based calculations and structured calculation results in `engineering-core`.
- Simulation definitions, modes, transitions, measurements, faults, event history, and tests in `simulation-engine`.
- Assessment integrity, authenticated attempt persistence, student progress, and RLS.
- Accessible form primitives, semantic tokens, reduced-motion support, and the WCAG 2.2 AA target.

## Audit Verdict

The repository does not need a new technical platform. It needs a new presentation contract and orchestration layer. All three current lessons are **D - Mostly static reading** because students cannot yet see and manipulate a phenomenon before receiving theory. The migration should preserve every traceability and review gate while changing the default path to `SEE -> INTERACT -> OBSERVE -> EXPLAIN -> CALCULATE -> CONNECT -> BREAK -> DIAGNOSE -> APPLY`.
