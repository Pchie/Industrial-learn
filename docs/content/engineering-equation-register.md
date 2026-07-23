# Engineering Equation Register

This register lists pilot equation traceability after the first controlled source-onboarding pass.

Access date: 2026-07-22

| Equation ID                        | Expression                            | Topic                    | Source IDs                               | Review Status   | Notes                                                               |
| ---------------------------------- | ------------------------------------- | ------------------------ | ---------------------------------------- | --------------- | ------------------------------------------------------------------- |
| `EQ-FLUID-PRESSURE-001`            | `p = F / A`                           | Basic fluid pressure     | `SRC-FLUID-PRESSURE-PLACEHOLDER-001`     | Source required | Source document absent; no page or chapter reference recorded       |
| `EQ-FLUID-FORCE-PRESSURE-AREA-001` | `F = p * A`                           | Hydraulic cylinder force | `SRC-HYDRAULIC-CYLINDER-PLACEHOLDER-001` | Source required | Source document absent; simulation remains source-gated             |
| `EQ-SI-CONVERSION-EXPLICIT-001`    | `value_SI = value * conversionFactor` | Explicit SI conversion   | `SRC-SMART-PUMP-PLACEHOLDER-001`         | Source required | Conversion policy is implemented, but source review remains blocked |

No calculation result was changed during this onboarding pass.

## Review Boundary

Equations may not be marked `Approved for student use` until:

- Source IDs point to real reviewed source records.
- Symbol definitions and SI units are complete.
- Assumptions and validity limits are reviewed.
- Named engineering reviewer and review date are recorded.
