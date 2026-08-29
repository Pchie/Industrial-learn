# Bernoulli Flow Model Assumptions

## Model Boundary

`SIM-FLUID-BERNOULLI-FLOW-001` is a two-point, horizontal, circular-pipe
educational model. Continuity determines section-average velocity, and the
two-point Bernoulli relation determines P2 from a defined P1. These relationships
are supported by `SRC-OPENSTAX-COLLEGE-PHYSICS-2E-2022`; the restrictions are
also checked against `SRC-NASA-GLENN-BERNOULLI`.

## Fixed Parameters

| Parameter                  |  Model value | Role                              |
| -------------------------- | -----------: | --------------------------------- |
| Section 1 diameter         |      0.060 m | Defined upstream geometry         |
| P1 absolute pressure       |   250,000 Pa | Mathematical boundary condition   |
| Density                    | 1,000 kg/m^3 | Fixed educational model parameter |
| Gravitational acceleration |   9.81 m/s^2 | Fixed model parameter             |
| z1 and z2                  |          0 m | Horizontal datum                  |

These values are internal model parameters, not material-property guarantees,
site conditions, manufacturer data, or equipment ratings.

## Student Inputs

| Input                | Display range | Internal unit | Validation                             |
| -------------------- | ------------- | ------------- | -------------------------------------- |
| Volumetric flow rate | 1 to 6 L/s    | `m^3/s`       | Finite, positive, explicitly converted |
| Section 2 diameter   | 20 to 60 mm   | `m`           | Finite, positive, explicitly converted |

The UI constrains out-of-range finite values and reports the constraint. Domain
functions reject zero area, non-finite input, incompatible units, and a
non-positive calculated absolute pressure. NaN and Infinity are never valid states.

## Assumptions

- Flow is steady and incompressible. [`SRC-OPENSTAX-COLLEGE-PHYSICS-2E-2022`]
- The same volumetric flow rate passes both sections without leakage.
  [`SRC-OPENSTAX-COLLEGE-PHYSICS-2E-2022`]
- The selected path is frictionless for this ideal pilot.
  [`SRC-OPENSTAX-COLLEGE-PHYSICS-2E-2022`, `SRC-NASA-GLENN-BERNOULLI`]
- No pump work, turbine work, heat-transfer term, or loss term occurs between P1
  and P2. [`SRC-NASA-GLENN-BERNOULLI`]
- Velocity values are section averages, not local velocity profiles.
  [`SRC-OPENSTAX-COLLEGE-PHYSICS-2E-2022`]
- Density remains equal to the fixed model parameter.

## Excluded Physics

The model does not calculate viscosity, roughness, fittings, turbulence,
compressibility, cavitation, flow development, transients, pump or turbine work,
heat transfer, or component limits. It cannot establish professional design or
operating sufficiency. The sources do not authorise those omitted models.

## Visual Interpretation

Pipe diameter changes proportionally within a bounded visual range. Velocity
arrows and pressure/head stacks are normalised teaching graphics; pixel length is
not a physical dimension. Optional moving dots indicate direction and relative
state only. They do not represent molecules, pressure propagation, displacement,
or an elapsed-time solution.

## Review Status

The model and every new equation record remain `Engineering review required`.
Independent human review is required before student-use approval.
