# Prompt 39G Thermodynamic Boundary Replication Audit

Audit date: 2026-08-27
Branch: `codex/prompt-39-approved-sources`
Implementation verdict: **CONDITIONAL PASS**
Student-release verdict: **NO-GO PENDING INDEPENDENT HUMAN REVIEW**

## Executive Verdict

Industrial Learn's Visual Simulation Foundation has been replicated into exactly one
second subject: Thermal System Boundary. The simulation engine, deterministic classifier,
registry metadata, lightweight preview, read-only detail route, content traceability,
summary persistence contract, responsive presentation, and tests are implemented.

The result is intentionally not available for student attempts. Existing evidence is
source-checked, but the same automated-assisted workstream prepared the sources, content,
rule, and implementation. No named independent Thermodynamics engineering, education,
safety, or accessibility reviewer has approved the candidate. The platform therefore shows
`Coming later` and `Engineering review required`, offers no Start or mode action, excludes
the candidate from recommendations, and creates no production database record.

## Source And Review Gate

`SRC-PURDUE-ME200-THERMO-DEFINITIONS-2021`, pp. 6-7, supports system, surroundings,
boundary, open/control-volume, closed/control-mass, and isolated-system definitions.
`SRC-OPENSTAX-COLLEGE-PHYSICS-2012`, section 15.2, remains broader lesson evidence and does
not drive this classifier.

The implementation does not invent property values, steam data, refrigerant data, heat or
work values, equations, equipment ratings, standards, or transient behaviour. Full evidence
and unlock requirements are recorded in
`docs/content/thermodynamic-system-boundary-simulation-review.md`.

## Simulation And Engineering Boundaries

The engine now supports typed discrete input options, labelled discrete outputs, explicit
time-progression capability, and optional assessment metadata without breaking the existing
Hydraulic Cylinder simulation.

`RULE-THERMO-SYSTEM-BOUNDARY-001` is a pure classifier:

- mass may cross: Open;
- no mass crossing and energy may cross: Closed;
- neither mass nor energy crosses: Isolated; and
- changed or inconsistent selected boundary: Indeterminate with a warning.

It returns the shared engineering result structure but declares no equation metadata. Step
and speed do not alter state because `supportsTimeProgression` is false. The
`boundary-shift` condition is an analysis fault, not an equipment malfunction.

## Catalogue And Student Experience

The typed registry entry uses simulation ID `sim-core-thermal-system-001` and is discoverable
by Thermodynamics, System, Schematic, Beginner, boundary concepts, and module terms. The
catalogue card has a meaningful SVG preview, `Coming later`, `Engineering review required`,
and `Engineering evidence required` for its diagnostic state.

The read-only detail route is:

`/simulations/thermal-system-boundary-simulation`

It shows the visual model, operable states, learning outcomes, duration, module, and review
boundary. It exposes no start button, mode button, attempt path, competency award,
recommendation, or fabricated history.

## Persistence And Security

The existing attempt service can reconstruct and persist a bounded guided-attempt summary:
declared input states, classification code, one digital measurement, optional analysis
fault, completion state, and mode-appropriate competency. It stores no animation frames or
false time series.

Production activation is intentionally absent. The public detail route does not query a
missing private simulation row. Authenticated start remains server-enforced and rejects any
non-available catalogue item. Existing cross-student ownership, hidden assessment-answer,
duplicate-completion, and server-scoring tests pass unchanged. No database migration,
credential, environment variable, analytics path, dependency, or client-side trusted score
was added.

## Performance

The catalogue's client vocabulary was split from the full registry and engine definitions.
The browser lazy-load test confirms `/simulations` does not preload attempt/runtime or
engine-definition code.

| Feature-bearing chunk         |      Raw |     gzip |
| ----------------------------- | -------: | -------: |
| Simulation Lab client         | 23,412 B |  6,219 B |
| Attempt-specific client       | 40,518 B | 10,930 B |
| Simulation engine definitions | 52,684 B | 14,747 B |

A 1,000-record combined-filter microbenchmark completed in a median `0.5628 ms` per call;
the slowest sampled run was `1.4785 ms` per call. See
`docs/performance/simulation-lab-two-entry-benchmark.md` for method and limitations.

## Accessibility And Visual Verification

- The new public detail route has no critical automated axe violation.
- Keyboard-native search and discrete controls are labelled.
- Search is disabled only until hydration completes, preventing early keyboard input from
  being discarded; the repaired mobile journey passed three consecutive fresh-build runs.
- Preview and status meaning have text equivalents and do not rely on colour.
- Reduced motion cannot change a learning result because the model has no time progression.
- Browser checks found no horizontal page overflow at 320, 375, 430, 768, 1,024, or 1,366
  CSS pixels.
- Manual screenshot inspection at 1,440 by 900 and 375 by 812 confirmed readable metadata,
  stable SVG framing, honest status accents, and usable content order.

## Quality Results

| Command                       | Result                                                   |
| ----------------------------- | -------------------------------------------------------- |
| `npm run scan:secrets`        | PASS                                                     |
| `npm run format:check`        | PASS                                                     |
| `npm run typecheck`           | PASS, all TypeScript workspaces                          |
| `npm run lint`                | PASS                                                     |
| `npm run validate:content`    | PASS, 19 tests                                           |
| `npm run validate:migrations` | PASS, 13 tests                                           |
| `npm run test:unit`           | PASS, 251 tests; 4 explicitly skipped                    |
| `npm run build`               | PASS, optimized Next.js build; 53 static pages generated |
| `npm run test:smoke`          | PASS, 5 tests                                            |
| `npm run test:a11y`           | PASS, 34 tests                                           |
| `npm run test:e2e`            | PASS, 95 tests                                           |

Focused coverage includes classifier normal/boundary/invalid cases, runtime reset and
no-time behaviour, analysis fault, unsupported assessment, persistence reconstruction,
guided summary persistence, catalogue search and combined filters, recommendation
exclusion, lazy loading, review status, read-only detail routing, keyboard use, and mobile
layout.

The E2E server emits the existing Node `NO_COLOR`/`FORCE_COLOR` warning. The dashboard error
test logs its intentional simulated database failure. Neither is a failed gate.

## Files Added For Prompt 39G

- `apps/web/src/features/simulations/catalog-contract.ts`
- `docs/content/thermodynamic-system-boundary-simulation-review.md`
- `docs/product/reference-visual-simulation-thermodynamic-boundary.md`
- `docs/performance/simulation-lab-two-entry-benchmark.md`
- `docs/audits/prompt-39g-thermodynamic-boundary-replication.md`

Prompt 39G also changes the shared simulation engine and tests, simulation catalogue,
discovery, preview, detail/workspace components, responsive styles, persistence coverage,
Thermodynamics lesson/knowledge traceability, browser tests, and the existing Simulation Lab
standards. Earlier Prompt 39A-39F worktree changes were preserved and not reverted.

## Known Limitations

- Independent human Thermodynamics engineering, education, safety, and accessibility review
  records do not yet exist.
- The candidate cannot be started or persisted in production and has no released database
  simulation row.
- The analysis fault still requires human acceptance before student use.
- The model classifies declared boundary conditions; it does not infer or calculate a real
  thermodynamic process.
- No physical low-end-device trace or live Supabase latency measurement was captured.
- No commit, push, staging deployment, or production deployment is part of this task.

## Recommended Prompt 39H

Use Prompt 39H as a human-review handoff and controlled release gate for Thermal System
Boundary. Record named independent engineering, education, safety, and accessibility
reviews; resolve their findings; then add only the reviewed version to version-controlled
database data, verify live staging RLS and authenticated attempt persistence, and decide
whether availability may change from `Coming later` to `Available`. Do not add a third
simulation during that gate.
