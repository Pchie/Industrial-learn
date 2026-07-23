# ADR 0005: Pure Engineering Calculation Library

Status: Proposed

## Context

Repository rules require engineering formulas to stay out of UI components, calculations to be pure tested functions, and internal calculations to use consistent SI units. New calculations require automated tests. Source: IL-AGENTS-001.

## Decision

Create a dedicated engineering calculation library when implementation begins. Calculation functions will be pure, tested, typed, and independent of UI, database, authentication, and AI services.

## Consequences

- Calculation correctness can be tested directly.
- UI components can display results without owning formulas.
- Lesson, assessment, and simulation modules can reuse calculation functions consistently.
