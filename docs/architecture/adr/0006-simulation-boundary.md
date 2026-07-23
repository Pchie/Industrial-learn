# ADR 0006: Simulation Boundary

Status: Proposed

## Context

Industrial Learn simulations must support normal-state, boundary-state, and fault-state learning and tests. Simulations must remain accessible and must not hide engineering behaviour inside visual components. Sources: IL-AGENTS-001, IL-MVP-001.

## Decision

Use a dedicated simulation boundary separating simulation UI, simulation state, simulation logic, simulation content, and engineering calculation calls.

## Consequences

- Simulation behaviour can be tested without rendering UI.
- Accessibility alternatives can describe simulation state.
- Simulation content can be reviewed separately from runtime behaviour.
