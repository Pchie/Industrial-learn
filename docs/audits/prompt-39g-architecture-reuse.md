# Bernoulli Flow Lab Architecture Reuse Audit

Audit date: 2026-08-27

## Verdict

The second flagship uses all 11 reuse capabilities requested by the prompt. This
is **11/11 capability reuse (100%)**, not a claim that 100% of source lines are
shared. A new physical SVG and domain adapter are correctly simulation-specific.

## Capability Evidence

| Capability          | Reused implementation                           | Bernoulli-specific configuration             |
| ------------------- | ----------------------------------------------- | -------------------------------------------- |
| Simulation shell    | `SimulationShell`, `SimulationViewport`         | Stage labels and layout content              |
| Controls            | Design-system `Slider`, `NumberInput`, `Button` | Q and D2 ranges                              |
| Gauge               | Shared `Gauge`                                  | Absolute-pressure configuration              |
| Measurement points  | `MeasurementPointSelector` and shared contracts | P1 and P2 definitions                        |
| LiveEquation        | Shared renderer and engineering result contract | Equation metadata and current results        |
| Observation         | `ObservationPrompt`                             | Two structured prompts                       |
| MicroTheory         | `MicroTheory`                                   | Continuity/Bernoulli explanation             |
| Challenge system    | Shared contract and `evaluateChallenge`         | 6 m/s target and pressure prediction         |
| Linked schematic    | Shared linked-component selection state         | Pipe-section SVG mapping                     |
| Content depth       | `ContentDepthSelector`                          | Quick, Engineering, Deep Dive content        |
| Simulation registry | Existing runtime and catalogue registries       | One Bernoulli definition and catalogue entry |

## Other Reused Boundaries

- `engineering-core` provides conversions, area, velocity, Bernoulli pressure, and
  head calculations as pure SI functions.
- `simulation-engine` provides definition validation, state transitions, controls,
  measurements, mode capability, and registry lookup.
- `content-system` validates source IDs, required sections, equation symbols and
  units, experience sequence, review state, and publication rules.
- The lesson engine resolves the structured lesson and lazy visual implementation
  without a Bernoulli-specific page route.
- Simulation Lab discovery, filtering, detail, availability, and collection logic
  consume registry metadata without page-local duplication.

## Simulation-Specific Code

The following code is intentionally domain-specific rather than a shared-platform
abstraction:

- the two-section circular-pipe model adapter and display normalisation;
- the cutaway/schematic pipe SVG and Venturi-style application SVG;
- fixed pilot parameters, control ranges, measurement-point labels, and challenge
  targets;
- structured Bernoulli lesson and knowledge content;
- source IDs and review boundary.

## Hard-Coded Exceptions

The 60 mm D1, 250 kPa absolute P1, 1,000 kg/m^3 density, 9.81 m/s^2 gravitational
parameter, horizontal datum, interaction bounds, and 6 m/s challenge target are
declared educational model parameters. They are centralised in domain/content
records and are not embedded as hidden UI calculation logic.

## Duplication Assessment

No new shell, control, gauge, equation renderer, observation system, content-depth
system, catalogue page, or route pattern was created. The new code represents the
minimum physical model and visual vocabulary needed for a different fluid-mechanics
phenomenon. Further abstraction is not justified until a third reviewed simulation
demonstrates a real repeated pattern.
