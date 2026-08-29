# Reference Visual Lesson V1: Hydraulic Cylinder Force

Reference route: `/lessons/hydraulic-cylinder-force`

Content ID: `LES-HYD-CYL-FORCE-VISUAL-001`

Simulation ID: `SIM-HYD-CYL-FORCE-001`

Status: Internal, Engineering review required

## Reference Purpose

This pilot demonstrates Visual Lesson Standard V1 for a phenomenon lesson. It is a
reference for architecture and information hierarchy, not a template whose hydraulic
controls, ranges, diagrams, or equations should be copied into other domains.

The supported relationship is the ideal cap-end extension case `F = p * A`, with circular
cap-end area `A = pi * D^2 / 4`. The current evidence and review boundary is recorded
under `SRC-PARKER-140H8-CYLINDER-2024`; SI-prefix presentation uses
`SRC-NIST-SP330-2019`. The lesson does not implement rod-side area, losses, dynamics,
ratings, or machine lifting capacity.

## Architecture

The structured lesson declares:

- `experienceModel: visual-v2`.
- `lessonType: phenomenon`.
- `visualStandardVersion: 1.0.0`.
- First-screen visual and control IDs.
- Two inputs and three priority outputs.
- Category blocks, challenge metadata, source IDs, and review status.

The route resolves the experience from the simulation-ID registry. The feature creates a
pure lesson model from learner inputs. Engineering-core explicitly converts MPa to Pa and
mm to m, calculates area and force, and explicitly converts Pa/N results back to MPa/kN
for learner display. Simulation state verifies the same force result and supplies the
pressure measurement. A one-way adapter produces shared visual-state semantics.

React components render results; they do not own either governing equation.

## User Flow

1. See the title, one-sentence purpose, progression, bounded inputs, and cutaway state.
2. Change pressure or piston diameter with synchronized slider and numeric controls.
3. Read MPa, m^2, and kN outputs and a live text summary.
4. Switch External, Cutaway, and Schematic views while retaining cylinder selection.
5. Answer three ungraded observation prompts.
6. Read concise Micro Theory in Quick or inspect SI substitutions in Engineering.
7. Start the 15 kN idealised target challenge and intentionally check the result.
8. Connect the principle to a bounded excavator-boom application.
9. Continue to the knowledge check or authenticated formal assessment.
10. Open optional Deep Dive and source records only when needed.

## Component Usage

- `LessonRenderer`: header, progression, compact outcomes, subsequent stages, sources.
- `SimulationShell`: title/status, primary controls, visual workbench, measurements.
- `SimulationViewport`: main visual and polite current-state summary.
- `RepresentationSwitcher`: External, Cutaway, and Schematic choices.
- `HydraulicCylinderScene`: domain-specific SVG and linked cylinder selection.
- `Gauge`: direct P1 pressure state in MPa.
- `LiveEquation`: engineering-core area and force results in authoritative SI units.
- `ObservationPrompt`: ungraded prediction, hint, and explanation disclosure.
- `ContentDepthSelector`: Quick and Engineering density; Deep Dive remains downstream.
- `EngineeringChallenge`: target condition and one checked feedback surface.
- `RealWorldApplication`: original simplified excavator visual and bounded context.

## Why Each Section Exists

| Section               | Purpose                                                                        |
| --------------------- | ------------------------------------------------------------------------------ |
| Hero                  | Establish pressure-area-force cause and effect before theory                   |
| Observe               | Require comparison before revealing explanation                                |
| Explain and calculate | Connect physical state to concise theory and reviewed equations                |
| Challenge             | Test whether the learner can manipulate both variables to meet a target        |
| Application           | Show where the principle contributes in a larger real system                   |
| Check                 | Sample concept, unit, calculation, visual, and application reasoning           |
| Deep Dive             | Preserve derivation, SI reasoning, and exclusions without blocking interaction |
| Source records        | Keep evidence and review state inspectable but out of the primary flow         |

## Reuse

Reuse:

- The simulation-ID registry boundary.
- Structured first-screen, input, output, progression, and challenge metadata.
- Pure engineering-core to simulation-state to visual-state direction.
- Explicit display conversion.
- Shared state semantics and accessible summary.
- Early primary controls, single dominant visual, concise measurements, and intentional
  challenge check.
- Compact outcomes and deferred Deep Dive/source records.

## Do Not Copy Blindly

Do not copy:

- Hydraulic pressure/diameter ranges or the 15 kN educational target.
- Hydraulic colours into electrical, thermal, automation, or structural meaning.
- Cylinder cutaway geometry into a component or system whose primary representation is a
  chart, circuit, cycle, logic state, or structural diagram.
- `F = p * A`, piston-area logic, source IDs, or review status into another topic.
- Three representation choices when only one view adds learning value.
- A target challenge when diagnosis, constraint, design, or no challenge better fits the
  outcome.

## Remaining Review Boundary

The reference architecture is implemented and tested, but engineering approval has not
been inferred. A named independent reviewer still needs to review the simplified symbols,
force direction, visual mapping, challenge wording, safety boundary, and educational
comprehension before publication status can change.
