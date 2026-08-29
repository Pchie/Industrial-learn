# Visual Component Library

## Components Implemented

| Component                    | Responsibility                                                                                     |
| ---------------------------- | -------------------------------------------------------------------------------------------------- |
| `SimulationShell`            | Composes viewport, controls, measurements, equation, guidance, challenge, and fault regions        |
| `SimulationViewport`         | Stable visual area plus non-visual current-state summary                                           |
| `SimulationPlaybackControls` | Play, Pause, Step, Reset, and speed controls                                                       |
| `ModeCapabilitySummary`      | Exposes the central mode policy in the internal lab                                                |
| `FlowPath`                   | Direction, line weight, stopped/reverse/restricted states, optional particles, and static fallback |
| `EngineeringVector`          | Force, velocity, acceleration, torque, and heat-flow direction with supplied value/unit            |
| `Gauge`                      | Analog display mapping with clamping and explicit overflow/warning text                            |
| `DigitalMeasurement`         | Precision-controlled supplied reading with screen-reader-safe updates                              |
| `MeasurementPointSelector`   | Compatible instrument/point selection                                                              |
| `LiveEquation`               | Structured supplied calculation result, symbols, assumptions, warnings, and validity               |
| `ObservationPrompt`          | Non-graded question, optional response, hint, and explanation                                      |
| `MicroTheory`                | Concise principle with optional expansion and always-visible safety slot                           |
| `ContentDepthSelector`       | Quick, Engineering, and Deep Dive selection                                                        |
| `RepresentationSwitcher`     | External, Cutaway, and Schematic view selection                                                    |
| `LinkedComponentView`        | Shared component selection across supported representations                                        |
| `EngineeringChallenge`       | Displays pure evaluator results for declared target conditions                                     |
| `FaultStatePanel`            | Displays a reviewed/draft fault contract without implementing fault behavior                       |
| `RealWorldApplication`       | Original simplified diagram and sourced application context slot                                   |
| `VisualBlockReference`       | Safe lesson fallback for unresolved visual runtime content                                         |

## Composition Rules

- Components receive state and callbacks; they do not fetch data or access PostgreSQL/Supabase.
- Formula and unit-conversion logic remain outside React.
- Instrument readings come from measurement selection, never SVG coordinates.
- Mandatory safety information is passed outside expandable Deep Dive content.
- Existing design-system controls are reused rather than duplicated.
- A component may map a supplied value to a visual range only through a documented pure utility.

## Visual Content Blocks

The content schema now recognizes optional `heroSimulation`, `interactiveDiagram`, `animation`, `observationQuestion`, `microTheory`, `liveEquation`, `componentCutaway`, `linkedSchematic`, `engineeringChallenge`, `faultChallenge`, `realWorldApplication`, and `deepDive` blocks.

Every visual block requires title, description, source IDs, controlled review status, and accessibility metadata. Simulation/equation/diagram/animation/challenge/application IDs must use their declared prefixes.

## Internal Review Route

`/internal/visual-simulation-lab` demonstrates the library using fixed frames. It is marked noindex, awards no competence, stores nothing, and explicitly says that the data and equation record are not reviewed content.

## Deliberately Incomplete

- No hydraulic-cylinder lesson or real simulation adapter.
- No complex circuit editor.
- No Canvas, WebGL, or 3D engine.
- No fault injection or diagnostic scoring.
- No tachometer-specific face beyond the reusable instrument contract.
- No persistence or assessment submission from observation prompts.
