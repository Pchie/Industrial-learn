# Prompt 26 Source Onboarding Report

## Scope

Created the first controlled source-onboarding workflow for four pilot topics:

- Basic fluid pressure
- Hydraulic cylinder force
- Pump-system units and measurements
- Thermodynamics systems, surroundings and boundaries

## Sources Onboarded

No real source documents were onboarded because `sources/` contains only source-needed JSON records and no actual technical documents.

Updated or created source-needed records:

- `SRC-FLUID-PRESSURE-PLACEHOLDER-001`
- `SRC-HYDRAULIC-CYLINDER-PLACEHOLDER-001`
- `SRC-SMART-PUMP-PLACEHOLDER-001`
- `SRC-THERMO-FOUNDATIONS-PLACEHOLDER-001`

## Missing Sources

The missing source list is recorded in `docs/content/source-needed-register.md`.

## Knowledge Files Created

- `knowledge/fluid-mechanics/pressure-fundamentals.json`
- `knowledge/hydraulics/hydraulic-cylinder-force.json`
- `knowledge/smart-pump-systems/si-units-and-measurement.json`
- `knowledge/thermodynamics/systems-surroundings-boundaries.json`

All remain `Source required`.

## Equations Mapped

- `EQ-FLUID-PRESSURE-001`
- `EQ-FLUID-FORCE-PRESSURE-AREA-001`
- `EQ-SI-CONVERSION-EXPLICIT-001`

Calculation behaviour was not changed.

## Simulation Traceability

`SIM-HYD-CYL-FORCE-001` now records source IDs, equation review status, validity assumptions, input ranges and safety limitations. It remains `Source required`.

## Review Statuses

No content was approved. No self-approval occurred. No reviewer was recorded because no qualified review evidence exists yet.

## Validation Added

Tests now prove:

- Cited source IDs must exist.
- Approved sources require evidence.
- Placeholder records cannot be approved.
- Published lessons cannot cite missing source evidence.
- Approved equations require source IDs.
- Required symbols have units.
- Page references require verified source metadata.
- Knowledge files remain focused.
- Approved simulations require reviewed equations.

## Known Limitations

- No actual source document file integrity could be confirmed because no documents were present.
- No page ranges, chapters, editions or standards clauses were recorded.
- Existing pilot lessons and assessments still cite source-needed records and remain blocked from publication.

## Commands Executed

Initial focused checks:

- `npm run test:unit -- --run packages/content-system/src/content-system.test.ts packages/engineering-core/src/index.test.ts packages/simulation-engine/src/index.test.ts`
- `npm run typecheck --workspace @industrial-learn/content-system`
- `npm run typecheck --workspace @industrial-learn/engineering-core`
- `npm run typecheck --workspace @industrial-learn/simulation-engine`

Final full checks:

- `npm run format`
- `npm run format:check`
- `npm run typecheck`
- `npm run lint`
- `npm run test:unit`
- `npm run build`

## Final Results

- Formatting: passed.
- Type checking: passed.
- Linting: passed.
- Unit tests: passed, 16 files and 139 tests.
- Production build: passed.
- End-to-end tests: not run; this prompt required production build but did not require E2E execution.

## Recommended Next Prompt

Provide legally obtained source documents for the four pilot topics, then run the source evidence review workflow to replace source-needed records with real reviewed source metadata.
