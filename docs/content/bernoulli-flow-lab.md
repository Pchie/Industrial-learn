# Bernoulli Flow Lab

## Record

| Field                   | Value                            |
| ----------------------- | -------------------------------- |
| Lesson ID               | `LES-FLUID-BERNOULLI-VISUAL-001` |
| Simulation ID           | `SIM-FLUID-BERNOULLI-FLOW-001`   |
| Knowledge file          | `KF-FLUID-BERNOULLI-001`         |
| Version                 | `1.0.0`                          |
| Publication status      | `internal`                       |
| Technical review status | `Engineering review required`    |

The lesson is an internal visual-first pilot. `Source checked` evidence is not a
student-use approval, and no named independent review record exists yet.

## Source Gate

The implementation uses two official, metadata-only evidence records:

- `SRC-OPENSTAX-COLLEGE-PHYSICS-2E-2022`, sections 12.1 and 12.2, supports
  volumetric flow rate, section-average velocity, incompressible continuity,
  Bernoulli terms, and the ideal pressure-velocity relationship.
- `SRC-NASA-GLENN-BERNOULLI` supports the declared steady, incompressible,
  inviscid restrictions and the exclusion of added heat or work.

The source gate therefore passes for the declared internal ideal model. It does
not support friction, turbulence, cavitation, transients, component ratings, or
professional design claims.

## Student Experience

The first substantive lesson block is the interactive pipe visual. A student can:

1. Change volumetric flow rate from 1 to 6 L/s.
2. Change section 2 diameter from 20 to 60 mm.
3. Compare section-average velocity and absolute pressure at P1 and P2.
4. Select either pressure point and read the shared virtual gauge.
5. Switch between linked cutaway and schematic representations.
6. Inspect continuity and Bernoulli results through `LiveEquation`.
7. Reach a 6 m/s section 2 velocity target within 0.2 m/s.
8. Predict whether P2 is higher, lower, or the same as P1 before revealing the
   current ideal result.
9. Connect the model to a Venturi-style differential-pressure concept.

The optional Quick, Engineering, and Deep Dive levels preserve detail without
placing a derivation before interaction.

## Calculation Traceability

| Equation ID                              | Use                                | Source IDs                             | Status                      |
| ---------------------------------------- | ---------------------------------- | -------------------------------------- | --------------------------- |
| `EQ-GEOMETRY-CIRCULAR-AREA-DIAMETER-001` | Circular areas at sections 1 and 2 | `SRC-OPENSTAX-COLLEGE-PHYSICS-2E-2022` | Engineering review required |
| `EQ-FLUID-VELOCITY-FLOW-AREA-001`        | Average velocity at each section   | `SRC-OPENSTAX-COLLEGE-PHYSICS-2E-2022` | Engineering review required |
| `EQ-FLUID-CONTINUITY-INCOMPRESSIBLE-001` | Two-section continuity             | `SRC-OPENSTAX-COLLEGE-PHYSICS-2E-2022` | Engineering review required |
| `EQ-FLUID-BERNOULLI-TWO-POINT-001`       | Ideal P2 solution                  | Both source IDs                        | Engineering review required |
| `EQ-FLUID-PRESSURE-HEAD-001`             | Pressure-head display              | `SRC-OPENSTAX-COLLEGE-PHYSICS-2E-2022` | Engineering review required |
| `EQ-FLUID-VELOCITY-HEAD-001`             | Velocity-head display              | `SRC-OPENSTAX-COLLEGE-PHYSICS-2E-2022` | Engineering review required |
| `EQ-FLUID-TOTAL-HEAD-001`                | Total ideal-head comparison        | Both source IDs                        | Engineering review required |

Display inputs are explicitly converted to SI before calculation. React renders
the supplied result and equation metadata; it does not implement the equations.

## Deliberate Exclusions

- Elevation is fixed at `z1 = z2 = 0 m`; the pilot has no elevation control.
- The moving dots are a presentation cue, not molecules or a time solution.
- There is no pipe-loss, turbulence, cavitation, compressibility, or transient model.
- There is no fault mode because no reviewed fault model is in scope.
- The knowledge check is non-graded and awards no progress or competency.
- The Venturi visual is a concept, not a calibrated flow-meter calculation.

## Required Review

A named independent reviewer must verify source use, equation presentation,
pressure reference, sign convention, interaction bounds, visual interpretation,
accessibility, and normal/boundary/invalid-state evidence before the content can
advance toward student-use approval.
