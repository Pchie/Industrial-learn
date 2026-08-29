# Simulation Design System

## Scope

The simulation design system defines how Industrial Learn simulations are described, operated, represented, reviewed, tested, and discovered. It builds on the current simulation engine and engineering-core packages; it does not replace their tested domain logic.

## Simulation Types

| Type           | Purpose                                          | Initial priority                             |
| -------------- | ------------------------------------------------ | -------------------------------------------- |
| A. Component   | Operate and inspect one component                | Hydraulic-cylinder pilot                     |
| B. System      | Observe connected component behaviour            | After reusable component and state contracts |
| C. Schematic   | Operate a circuit or process diagram             | After linked-schematic foundation            |
| D. Calculation | Explore a reviewed equation through state        | Supported through Live Equation              |
| E. Fault       | Measure and diagnose abnormal behaviour          | Only after fault evidence and review         |
| F. Design      | Satisfy multiple constraints and justify choices | Later release                                |

A simulation may declare more than one type, but one primary type controls its card, tests, and learning intent.

## Shared Definition Contract

Each versioned definition declares:

- Simulation ID, semantic version, title, discipline, primary type, difficulty, and estimated activity time.
- Lesson, knowledge-file, source, equation, learning-outcome, and assessment IDs.
- Publication and technical-review status with review-record IDs.
- Explicit SI inputs, display units, limits, defaults, validation messages, and control types.
- Outputs and measurement points with dimensions, instrument compatibility, and display precision.
- Operating states, allowed commands, state transitions, alarms, and event definitions.
- External, internal, and schematic representation IDs plus stable component IDs.
- Fault IDs, trigger rules, observable effects, diagnostic evidence, and availability by mode.
- Mode policy for Learn, Guided, Explore, Fault diagnosis, and Assessment.
- Accessibility summary generator and low-data/reduced-motion fallback.
- Normal, boundary, invalid-input, reset, and every-fault test cases.

The contract references equations and calculations by ID. It never embeds a trusted formula inside visual metadata.

## Layer Boundaries

1. **Definition**: reviewed declarative metadata and allowed behaviours.
2. **Engineering calculations**: pure functions in `engineering-core` using SI units.
3. **Runtime**: state transitions, time progression, faults, measurements, events, and scoring hooks.
4. **Visual adapter**: one-way derivation from runtime state to `VisualState`.
5. **Renderer**: SVG, Canvas, or justified WebGL representation with no domain decisions.
6. **Control surface**: accessible commands and inputs bound to runtime actions.
7. **Lesson orchestration**: stage sequence, questions, hints, and calculation adoption.
8. **Persistence**: meaningful authenticated attempt summaries, never every frame.

## Standard Control Surface

All time-based simulations expose Play, Pause, Reset, Step, speed control, and a labelled status display. Current runtime support for stepping should be surfaced in the UI. Speed presets are Slow, Normal, and any reviewed accelerated value; a free speed input is unnecessary unless the learning objective needs it.

Reset restores the declared initial state and records no completion. Step advances the runtime by a declared deterministic interval. Reduced-motion mode defaults to step or discrete state transitions while preserving the same domain result.

## Operating Modes

| Mode            | Guidance                                   | Fault access                   | Hint policy                 | Competency ceiling                   |
| --------------- | ------------------------------------------ | ------------------------------ | --------------------------- | ------------------------------------ |
| Learn           | Labels and explanations visible            | Demonstration only if reviewed | Full                        | Introduced                           |
| Guided          | Sequenced actions and checks               | Guided if reviewed             | Controlled                  | Understood or Operated               |
| Explore         | Open bounded manipulation                  | Optional reviewed faults       | Conceptual                  | Practice; no automatic mastery       |
| Fault diagnosis | Symptoms first, diagnostic tools available | Required                       | Staged diagnostic hints     | Diagnosed                            |
| Assessment      | Only permitted controls and context        | As assessment defines          | Hidden unless policy allows | Verified level defined by assessment |

The existing competency award rules remain authoritative. UI mode labels cannot award competence.

## Virtual Instruments

Initial instruments remain pressure gauge, flow meter, thermometer, voltmeter, ammeter, and digital status display. The shared contract may add multimeter, tachometer, and manometer after corresponding measurement dimensions and source-backed behaviour exist.

Students select declared measurement points by component ID. The runtime returns a measurement result containing value, unit, validity, status, timestamp or step, instrument ID, and measurement-point ID. Renderers consume that result. They cannot generate a reading from pointer position or visual geometry.

## Visual Representations

- **External** shows controls, housing, connections, and observable motion.
- **Internal** shows reviewed cutaway geometry, internal path, and relevant moving parts.
- **Schematic** uses the project’s reviewed symbol vocabulary and the same component IDs.

Representations subscribe to one visual state. A control action updates runtime state once and all views re-render from that result.

## Simulation Lab Information Architecture

`/simulations` should support filters for Mechanical, Electrical, Thermodynamics, Fluids, Automation, Energy, and Future Engineering. Each card communicates:

- What the student can operate.
- Difficulty and related module.
- Primary simulation type.
- Fault-mode availability as Available, Planned, or Evidence required.
- Estimated active learning time.
- Technical-review and publication status.

Cards must not imply fault capability or approval merely because a fault ID exists in draft metadata.

## Persistence

Persist simulation ID/version, lesson ID, student, mode, start/completion times, validated input summary, relevant output summary, faults introduced, measurement choices, submitted diagnosis, score, competence, and status. Event history may be summarized for learning evidence. High-frequency visual positions and animation frames are not persisted.

## Review And Test Gates

- Component and system definitions require source and equation traceability where applicable.
- Normal release requires initial, start, pause, step, normal, boundary, invalid, and reset tests.
- Each fault requires a normal-vs-fault test, observable symptom test, instrument result test, and diagnostic scoring test.
- Visual adapters require mapping and synchronization tests, not image snapshots as substitutes for engineering tests.
- Assessment mode requires hidden-answer, permitted-control, duplicate-completion, and trusted-server-scoring tests.

## Performance Policy

Simulation bundles load only when their stage approaches the viewport or the student opts in. Static SVG and state summaries load first. Canvas is reserved for high-object-count or continuous-field rendering. WebGL or Three.js requires a documented educational need, device fallback, and bundle/performance budget; no new 3D dependency is approved by this design alone.
