# Visual Learning Migration Plan

## Goal

Move from the current linear lesson renderer to a visual-first experience without discarding structured content, reviewed sources, equations, simulations, assessments, or progress history. Migration is incremental and reversible by content version.

## Current Lesson Triage

| Lesson                                             | Easy first migration                                                                                              | New simulation work                                                               | Key gate                                                      |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Basic Fluid Pressure                               | Reorder concise content, add observation prompts, connect reviewed pressure/force result, preserve worked example | Hydraulic visual adapter, Live Equation, linked representations                   | Hydraulic simulation review; unsupported faults remain off    |
| Pump System Units and Measurements                 | Interactive measurement-point diagram, instrument choice, explicit unit comparisons, short micro theory           | Dynamic pump/system behaviour is later work                                       | Subject-specific diagram and source-backed measurement claims |
| Thermodynamic Systems, Surroundings and Boundaries | Interactive boundary classification diagram, open/closed/isolated comparisons, observation questions              | Molecule motion, piston compression, and live property state need reviewed models | No invented property data or state relationships              |

The pump and thermodynamics lessons can receive meaningful non-simulation interaction before complex numerical simulation. The hydraulic lesson is the best architecture pilot because its checked calculation can prove end-to-end synchronization.

## Migration Phases

### Phase 0: Approve The Architecture

- Review these Prompt 39a documents with product, education, engineering, accessibility, and content-governance owners.
- Confirm pilot scope, visual conventions, and evidence boundaries.
- Create decision records before adding a rendering or animation dependency.

Exit: approved implementation scope and named reviewers; no status inflation.

### Phase 1: Dual Content Contract

- Add `schemaVersion`, `experienceModel`, `experienceSequence`, and new block discriminators.
- Keep `linear-v1` validation and add a normalization adapter.
- Add reference, review-gate, accessibility-fallback, and hidden-answer validation.
- Emit coverage reports without failing unchanged legacy content.

Exit: all existing content still validates; new visual fixtures pass schema and negative tests.

### Phase 2: Visual Runtime Foundation

- Define typed `VisualState`, component manifests, representation adapters, and state summaries.
- Add design-system primitives for playback, depth mode, representation mode, instrument docks, legends, state callouts, and responsive simulation composition.
- Surface existing Step support and reduced-motion behaviour.
- Add lazy-loading and low-data fallbacks.

Exit: a non-technical fixture demonstrates synchronized views and accessible controls without adding a formula.

### Phase 3: Live Equation

- Map equation IDs to existing engineering-core functions through a server/domain-safe registry.
- Render structured results, substitutions, warnings, units, and depth modes.
- Test known answers, dimensions, boundaries, invalid input, rounding, rapid updates, and assessment restrictions.

Exit: one reviewed calculation synchronizes output, visual state, and accessible summary with no duplicated formula.

### Phase 4: Hydraulic Normal-State Pilot

- Author a `visual-v2` content version behind an internal feature flag.
- Build external/internal/schematic SVG representations and component linking.
- Bind pressure and effective area to the checked extension-force calculation.
- Implement observation prompts and the abstract force-target challenge.
- Keep travel dynamics, diameter derivation, faults, and excavator claims gated.

Exit: named educational, engineering, safety, accessibility, and simulation reviewers can inspect the internal pilot.

### Phase 5: Review, Measurement, And Persistence Integration

- Complete simulation normal/boundary/invalid/reset/synchronization tests.
- Confirm instrument readings derive from runtime state.
- Record only meaningful authenticated attempt summaries.
- Verify progress is awarded only by existing outcome policy.

Exit: review records support the next publication status; no frame-level data is stored.

### Phase 6: Evidence-Gated Fault And Application

- Acquire and approve evidence for each fault signature and the excavator context.
- Replace or remove unsupported fixed multipliers.
- Add diagnostic measurement and scoring tests.
- Release each block only after its simulation, safety, and source gates pass.

Exit: fault and application blocks are independently publishable, not bundled assumptions.

### Phase 7: Migrate Low-Cost Lessons

- Convert pump measurement and thermodynamic classification to subject-specific interactive diagrams.
- Move long theory into Deep Dive while preserving every sourced statement.
- Compare learning outcomes and accessibility before retiring each `linear-v1` version.

Exit: migrated lesson versions pass content, rendering, route, accessibility, mobile, and review tests.

### Phase 8: Simulation Lab

- Extend simulation registry metadata for type, operable controls, discipline, difficulty, fault availability, time, and review status.
- Add filters and truthful status cards to `/simulations`.
- Lazy-load individual experiences only after selection.

Exit: the lab discovers reviewed simulations without downloading every asset or exposing private attempts.

## Design-System Changes Required

Add or refine reusable primitives only after Phase 1 contracts stabilize:

- `SimulationStage`, `PlaybackControls`, `DepthModeControl`, and `RepresentationModeControl`.
- `EngineeringLegend`, `StateSummary`, `MeasurementPointSelector`, and `InstrumentDock`.
- Domain-aware but formula-free `LiveEquationView`, `VectorDisplay`, `PathState`, and `ComponentStateLabel`.
- Responsive simulation layout, low-data placeholder, reduced-motion snapshot, and print-state capture.

Existing Button, IconButton, NumberInput, Slider, Tabs, Tooltip, Alert, MeasurementDisplay, SimulationControlPanel, FaultNotification, EquationPanel, and review badges should be composed before creating replacements.

## Performance Budgets To Establish

Implementation must measure, not guess, route JavaScript, simulation chunk size, initial SVG/asset weight, interaction latency, frame consistency, and mobile memory. Lesson text and state fallback render before heavy simulation code. Alternate cutaway assets load on intent. A separate performance budget decision should set numeric thresholds from measured staging baselines.

## Rollout And Rollback

Use content versioning and an internal feature flag. The published `linear-v1` version remains available until the visual version has review records and parity checks. Rollback selects the prior content version and does not alter historical assessment or simulation attempts. Do not bulk rewrite lesson JSON or remove the old renderer until all published legacy content has an approved migration.

## Team Sequence

For a small team, assign one vertical slice at a time: content/schema, runtime/calculation integration, visual renderer/design system, then review/test. Avoid parallel domain simulations before the hydraulic slice establishes the contracts. Human engineering and accessibility review should occur during the pilot, not only after implementation.

## Definition Of Migrated

A lesson is migrated when it starts with an appropriate phenomenon, provides meaningful accessible interaction, connects observations to reviewed theory and calculations, preserves sources and Deep Dive content, passes all review gates, works on mobile and low-data/reduced-motion paths, and has a versioned rollback. A new visual wrapper around static paragraphs does not qualify.
