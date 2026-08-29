# Engineering Equation Register

This register lists pilot equation traceability after the first controlled source-onboarding pass.

Access date: 2026-08-26

| Equation ID                              | Expression                                                | Topic                              | Source IDs                                                         | Review Status               | Notes                                                                   |
| ---------------------------------------- | --------------------------------------------------------- | ---------------------------------- | ------------------------------------------------------------------ | --------------------------- | ----------------------------------------------------------------------- |
| `EQ-FLUID-PRESSURE-001`                  | `p = F / A`                                               | Basic fluid pressure               | `SRC-OPENSTAX-COLLEGE-PHYSICS-2012`                                | Equation checked            | OpenStax section 11.3; positive-area and SI-input limits retained       |
| `EQ-FLUID-FORCE-PRESSURE-AREA-001`       | `F = p * A`                                               | Ideal hydraulic cylinder force     | `SRC-PARKER-140H8-CYLINDER-2024`                                   | Equation checked            | Catalog p. 26, PDF p. 28; actual losses and equipment ratings excluded  |
| `EQ-HYD-PISTON-AREA-DIAMETER-001`        | `A = pi * D^2 / 4`                                        | Circular cap-end piston area       | `SRC-PARKER-140H8-CYLINDER-2024`                                   | Equation checked            | Diameter in m; cap-end circular area only; rod-side area excluded       |
| `EQ-SI-CONVERSION-EXPLICIT-001`          | `value_SI = value * conversionFactor`                     | Explicit SI conversion             | `SRC-NIST-SP330-2019`                                              | Equation checked            | NIST tables 4, 7, and 8; conversion remains explicit and allow-listed   |
| `EQ-GEOMETRY-CIRCULAR-AREA-DIAMETER-001` | `A = pi * D^2 / 4`                                        | Circular pipe area                 | `SRC-OPENSTAX-COLLEGE-PHYSICS-2E-2022`                             | Engineering review required | Positive diameter in metres; geometric area only                        |
| `EQ-FLUID-VOLUMETRIC-FLOW-001`           | `Q = V / t`                                               | Volumetric flow rate               | `SRC-OPENSTAX-COLLEGE-PHYSICS-2E-2022`                             | Engineering review required | Positive elapsed time; SI output in `m^3/s`                             |
| `EQ-FLUID-VELOCITY-FLOW-AREA-001`        | `v = Q / A`                                               | Section-average velocity           | `SRC-OPENSTAX-COLLEGE-PHYSICS-2E-2022`                             | Engineering review required | Positive area; velocity is a section average                            |
| `EQ-FLUID-CONTINUITY-INCOMPRESSIBLE-001` | `A1 * v1 = A2 * v2`                                       | Steady incompressible continuity   | `SRC-OPENSTAX-COLLEGE-PHYSICS-2E-2022`                             | Engineering review required | No leakage between the two sections                                     |
| `EQ-FLUID-BERNOULLI-TWO-POINT-001`       | `P1 + rho*v1^2/2 + rho*g*z1 = P2 + rho*v2^2/2 + rho*g*z2` | Ideal two-point Bernoulli relation | `SRC-OPENSTAX-COLLEGE-PHYSICS-2E-2022`, `SRC-NASA-GLENN-BERNOULLI` | Engineering review required | Steady, incompressible, frictionless model; no work, heat, or loss term |
| `EQ-FLUID-PRESSURE-HEAD-001`             | `h_p = P / (rho * g)`                                     | Pressure head                      | `SRC-OPENSTAX-COLLEGE-PHYSICS-2E-2022`                             | Engineering review required | Positive density and gravitational parameter                            |
| `EQ-FLUID-VELOCITY-HEAD-001`             | `h_v = v^2 / (2 * g)`                                     | Velocity head                      | `SRC-OPENSTAX-COLLEGE-PHYSICS-2E-2022`                             | Engineering review required | Section-average velocity and positive gravitational parameter           |
| `EQ-FLUID-TOTAL-HEAD-001`                | `H = P/(rho*g) + v^2/(2*g) + z`                           | Total ideal head                   | `SRC-OPENSTAX-COLLEGE-PHYSICS-2E-2022`, `SRC-NASA-GLENN-BERNOULLI` | Engineering review required | Bernoulli pilot assumptions apply; losses and machine work excluded     |

No calculation result was changed during this onboarding pass.

## Review Boundary

`Equation checked` is not student-use approval. Equations may not be marked `Approved for student use` until:

- Source IDs point to real reviewed source records.
- Symbol definitions and SI units are complete.
- Assumptions and validity limits are reviewed.
- Named engineering reviewer and review date are recorded.

The detailed decisions and test evidence are recorded in `docs/content/pilot-equation-review.md`.

## Bernoulli Pilot Update: 2026-08-27

The Bernoulli entries were added for the internal `SIM-FLUID-BERNOULLI-FLOW-001`
pilot after the official OpenStax sections 12.1 and 12.2 and the NASA Glenn
limitations page were inspected. The implementation and metadata remain
`Engineering review required`; this register does not constitute independent
equation approval.
