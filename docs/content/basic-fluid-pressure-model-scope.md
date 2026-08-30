# Basic Fluid Pressure Model Scope

Status: Engineering review required

Lesson: `LES-FLUID-PRESSURE-001`, Basic Fluid Pressure

Content version: `0.4.0`

Primary visual block: `VIS-FLUID-PRESSURE-HERO-001`

Equation: `EQ-FLUID-PRESSURE-001`

## Learning Purpose

This bounded introductory model helps a student see, predict, and calculate how normal
force and contact area determine pressure. It supports learning outcomes `LO-FP-001`
through `LO-FP-003`; it is not an equipment-selection or professional design model.

## Calculated

The following values come from pure functions in `@industrial-learn/engineering-core`:

- pressure from normal force and positive contact area;
- conversion of pressure from `Pa` to `kPa` for display; and
- signed difference from the educational `200 kPa` challenge target.

The governing relationship is `p = F / A`, where force is supplied in `N`, area in
`m^2`, and the internal result is `Pa`. The application does not duplicate this
calculation in a React component.

## Representational

The following visual elements communicate relationships but are not physical dimensions:

- the downward force arrow;
- the displayed width of the contact surface;
- the pressure-pattern intensity; and
- the simple hydraulic-press application drawing.

The force arrow uses a bounded visual normalisation. Zero force produces no arrow. The
contact width is normalised from the square root of the selected area so that area changes
remain legible within the viewport. Pattern intensity is bounded by the largest pressure
available within the educational input range. Pixel lengths and opacity are not engineering
measurements.

## Not Modelled

The lesson does not calculate or imply:

- fluid flow, velocity, or pressure gradients;
- leakage or seal behaviour;
- fluid compressibility;
- component or line losses;
- transient or time response;
- material stress or deformation;
- equipment pressure ratings;
- pressure-vessel adequacy;
- structural capacity;
- hydraulic-system diagnostics; or
- safe operating limits for real equipment.

No fault mode or simulation attempt is associated with this lesson. Later reviewed lessons
may apply pressure fundamentals to cylinders, pumps, valves, or complete systems.

## Input Boundary

| Input        | Educational range | Step    | Internal unit |
| ------------ | ----------------- | ------- | ------------- |
| Normal force | `0` to `5,000`    | `50`    | `N`           |
| Contact area | `0.005` to `0.05` | `0.001` | `m^2`         |

Non-finite values are rejected. User-interface entries outside the range are explicitly
constrained and announced. A zero or negative area is invalid in engineering-core; the
interactive range therefore remains strictly positive.

These ranges are educational interaction limits, not equipment ratings. They were chosen
to provide legible, introductory examples within the reviewed equation domain.

## Challenge Boundary

The challenge asks the learner to produce `200 kPa`, with an educational acceptance band
of `+/- 1 kPa`. It is practice only and does not award competency. Success means only that
the selected inputs satisfy the bounded mathematical target.

## Evidence

- `SRC-OPENSTAX-COLLEGE-PHYSICS-2012`, section 11.3, Pressure.
- `SRC-PSU-CIMBALA-PRESSURE-BASICS`, Introduction to Pressure in Fluid Mechanics.

The McGraw Hill acquisition candidate is not cited because lawful project access to the
identified edition and chapter has not been recorded.

## Review Boundary

This document prepares the model for independent review. It is not an approval record.
The lesson remains hidden from normal students until an authorised reviewer approves this
exact version and a separate authorised publication action occurs.
