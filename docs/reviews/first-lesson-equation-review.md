# First Lesson Equation Review

Review date: 2026-08-30

Candidate: `LES-FLUID-PRESSURE-001`, Basic Fluid Pressure, version `0.3.0`

Formal engineering approval: not granted

Equation accuracy verdict: **PASS** within the stated introductory scope

## Equation Record

| Field                | Finding                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------- |
| Equation ID          | `EQ-FLUID-PRESSURE-001`                                                                           |
| Equation             | `p = F / A`                                                                                       |
| Physical meaning     | Average normal force magnitude distributed over the stated area in the bounded introductory model |
| Symbols              | `p` pressure, `F` normal force, `A` area                                                          |
| SI units             | `Pa`, `N`, `m^2`                                                                                  |
| Dimensional check    | `N / m^2 = Pa`                                                                                    |
| Primary source       | `SRC-OPENSTAX-COLLEGE-PHYSICS-2012`, section 11.3                                                 |
| Corroborating source | `SRC-PSU-CIMBALA-PRESSURE-BASICS`, introductory pressure statements                               |
| Implementation       | `pressureFromForceAndArea` in `packages/engineering-core/src/index.ts`                            |
| Automated tests      | `packages/engineering-core/src/index.test.ts`                                                     |
| Technical verdict    | `PASS`                                                                                            |

## Assumptions And Validity

- `F` is a non-negative normal-force magnitude.
- `A` is finite and strictly greater than zero.
- Inputs are supplied in newtons and square metres.
- The result is returned in pascals.
- The relationship is used as an introductory static-pressure calculation.
- It is not a pressure-vessel, component-rating, or equipment-adequacy calculation.
- Negative gauge-pressure treatment is outside this function's force-magnitude scope.

## Implementation Review

The pure function:

- validates exact input units;
- rejects non-finite values through the shared calculation validation path;
- rejects negative force;
- rejects zero or negative area;
- performs no silent conversion;
- returns equation ID, inputs, steps, assumptions, warnings, and validity state; and
- has no React or browser dependency.

The lesson does not duplicate the calculation in a UI component. Its worked example is a
structured content record, while executable calculation logic remains in engineering-core.

## Manual Known-Answer Checks

| Case                | Calculation                                      | Expected result                   | Verdict |
| ------------------- | ------------------------------------------------ | --------------------------------- | ------- |
| Lesson example      | `200 N / 0.50 m^2`                               | `400 Pa`                          | PASS    |
| Explicit conversion | `1 kN = 1000 N`; `1000 cm^2 = 0.10 m^2`          | `10,000 Pa`                       | PASS    |
| Zero-force boundary | `0 N / 1 m^2`                                    | `0 Pa`                            | PASS    |
| Zero area           | `10 N / 0 m^2`                                   | Invalid, no division              | PASS    |
| Wrong force unit    | `1 kN` supplied directly to the SI-only function | Invalid until explicit conversion | PASS    |

## Display And Assessment Units

The lesson displays `N`, `m^2`, and `Pa`, and its worked result is `400 Pa`. The equation
has an accessible text label and a symbol table. It does not use the reusable
`LiveEquation` component or live numerical substitution.

The trusted assessment persistence layer converts an explicitly entered compatible unit,
such as `0.4 kPa`, to `400 Pa` before server scoring and preserves the original student
entry. Dimensionally wrong units remain invalid. The local assessment-core function
expects already normalised units, which is consistent with the server boundary.

The assessment tolerance of `0.5 Pa` is internally consistent for the exact-value item,
but its educational appropriateness still requires human assessment review.

## Reviewer Boundary

This technical audit confirms equation and implementation consistency. It is not the
named independent engineering review required by the publication gate. Automated tests
and Codex analysis cannot create the formal approval record.
