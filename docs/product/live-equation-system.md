# Live Equation System

## Purpose

Live Equation connects a reviewed engineering calculation to student input, simulation state, measurements, animation, and mathematical explanation. It is a reusable presentation feature, not a calculation library.

## Authoritative Flow

```text
validated student input
        |
        v
simulation command / calculation request
        |
        v
engineering-core pure function
        |
        v
CalculationResult in SI units
        |
        +---- domain simulation state
        +---- measurement output
        +---- VisualState animation mapping
        +---- Live Equation display
        +---- accessible state summary
```

All consumers use the same result or resulting domain state. The UI does not reimplement `F = pA`, unit conversion, tolerance, or validity rules.

## Content Contract

A `liveEquation` block declares:

- Block ID and reviewed `equationId`.
- Simulation ID and version where it is state-bound.
- Input bindings from named simulation fields to equation symbols.
- Output binding from the calculation result to a measurement or challenge field.
- Display unit and precision policy for each symbol.
- Quick, Engineering, and Deep Dive explanation references.
- Source IDs, assumptions, limitations, and required review status.
- Loading, invalid-result, low-data, print, and accessibility fallbacks.

The block contains labels and bindings only. Equation expressions and trusted calculation steps come from the equation registry and `engineering-core` result.

## Display Modes

### Quick

Shows symbol relationship, current input labels, and the output measurement in plain language.

### Engineering

Shows the reviewed equation, SI symbol table, numerical substitution, structured calculation steps, assumptions, warnings, and validity.

### Deep Dive

Shows approved derivation or rationale, applicability limits, source citations, and connected prerequisite lessons. It does not synthesize an unsourced derivation.

## Unit And Precision Rules

- Internal values remain in SI units.
- Display conversion is explicit, dimension-checked, and labelled.
- A user-entered non-SI value is converted through the existing unit library before calculation; the original entry remains visible.
- Celsius absolute temperature and temperature difference remain distinct dimensions in applicable future functions.
- Precision is configured centrally per output or content record and must not imply greater source or model accuracy.
- Exact input values used by the calculation are exposed in the structured substitution, avoiding a mismatch between rounded display inputs and results.

## Invalid And Warning States

When the calculation result is invalid, Live Equation shows the understandable structured error and the related control. Dependent animation does not continue with a fabricated or stale value. If the last valid state is retained for comparison, it is visually and textually labelled `last valid state`.

Warnings and assumptions remain visible in Engineering mode and are summarized in Quick mode when they materially change interpretation. Fault or alarm styling uses text and iconography in addition to colour.

## Calculation-To-Visual Action

An authored challenge may allow `Use calculated value`. The action sends the normalized, dimension-validated result through a declared simulation command. The runtime decides whether the value is accepted. The same result then drives the simulation output, visual state, instrument reading, and equation display. Browser-only scoring is allowed only for explicitly identified practice.

## Accessibility

- Equations provide semantic math where supported and a complete readable text alternative.
- Symbol definitions are associated with the equation and available without hover.
- Rapid changes do not continuously announce. A throttled summary or `Read current values` action reports the state.
- Sliders are paired with number inputs and explicit units.
- Validation identifies the symbol, accepted dimension, and correction required.
- Print output includes equation, substitution, result, units, assumptions, and sources.

## Security And Assessment Integrity

Live Equation receives no hidden expected answer, private explanation, or trusted scoring rule before graded submission. Assessment mode can suppress steps and interpretation according to policy while retaining units and accessibility. The server remains authoritative for correctness, tolerance, awarded points, and competence.

## Test Contract

1. Equation ID resolves to a reviewed equation and engineering-core function.
2. Known-answer inputs synchronize result, measurement, visual state, and substitution.
3. Zero, boundary, and invalid inputs produce matching domain and display validity.
4. Explicit valid unit conversions preserve the SI result.
5. Dimensionally incorrect units are rejected.
6. Display rounding does not feed back into calculation.
7. Rapid updates do not create stale or reordered results.
8. Reduced-motion and low-data modes report identical engineering values.
9. Assessment mode does not expose hidden steps or answers.
