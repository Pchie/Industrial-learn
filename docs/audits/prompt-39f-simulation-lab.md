# Prompt 39F Simulation Lab Audit

Audit date: 2026-08-27
Branch: `codex/prompt-39-approved-sources`
Verdict: **PASS**

## Executive Verdict

Industrial Learn now has a dedicated, registry-driven Simulation Lab at `/simulations`, a
visual briefing route at `/simulations/[simulationSlug]`, and a focused authenticated
attempt workspace. The result behaves as an engineering laboratory rather than a duplicate
course catalogue.

Hydraulic Cylinder Force is the sole available flagship simulation. Its operational status
is `Available`, while its technical status remains honestly labelled `Engineering review
required`. No unavailable simulation is presented as complete, no competency or recent
activity is fabricated, and no content approval was changed.

## Student Experience Built

- Concise laboratory identity, search, discipline shortcuts, private activity strip, and
  immediate catalogue access.
- Combined filters for discipline, difficulty, type, mode, and career pathway.
- Visual-first simulation cards with concept, type, modes, time, module, challenge, fault
  evidence, review state, and lightweight preview.
- Curriculum-backed Fluid Power, Thermodynamics, and Electrical collections with planned
  items marked `Coming later` and no actionable link.
- Detail page with visual preview, operable variables, learning outcomes, understandable
  modes, review state, related module, technical traceability, and Explore quick start.
- Focused attempt workspace with obvious exits to Simulation Lab and the related lesson.
- Honest loading, no-result, no-history, private-history-failure, and unavailable states.

## Routes

- `/simulations`
- `/simulations/[simulationSlug]`
- `/simulations/[simulationSlug]/attempt/[attemptId]`
- Existing `/simulations/[simulationSlug]/attempt/[attemptId]/review`
- Existing `/simulations/history`

The first two routes are public discovery surfaces. Attempt, completion, review, and history
remain authenticated and student-owned.

## Registry And Boundaries

`apps/web/src/features/simulations/catalog.ts` now supplies the complete typed catalogue
record and directly references the authoritative simulation-engine definition. Curriculum
JSON resolves module, pathway, collection, and planned-item metadata. Frontend routes do not
define duplicate catalogue arrays or engineering calculations.

The registry supports slug, title, concept, topic, components, systems, abbreviations,
discipline, types, difficulty, duration, modes, module and lesson links, prerequisites,
prerequisite policy, career pathways, review/publication status, challenge, fault evidence,
preview metadata, and availability.

Operational availability and technical review remain separate. Required prerequisites use
real completed lesson evidence and are server enforced; the pilot's Basic Fluid Pressure
prerequisite is explicitly recommended to preserve the visual-first beginner flow.

## Search And Filtering

Search is deterministic, local, case-insensitive, and limited to declared registry fields.
Structured filters use AND semantics. Tests cover name, concept, component, module,
abbreviation, combined filters, empty categories, and a query with no registered result.

Recommendations use only an in-progress attempt or current-module plus prerequisite
evidence. Recent activity comes from the authenticated student's persisted attempt data.
Competency appears only from submitted or graded attempts with a positive stored award.

## Performance

The catalogue uses inline SVG previews, disables card-route prefetch, and keeps the
interactive attempt client out of catalogue and detail imports. Final optimized bundle
inspection found:

| Feature-bearing chunk   |      Raw |     gzip |
| ----------------------- | -------: | -------: |
| Simulation Lab client   | 76,448 B | 16,418 B |
| Attempt-specific client | 30,317 B |  8,663 B |

The browser lazy-load test confirmed that catalogue-loaded scripts did not contain the
attempt runtime or assessment-input strings. The production build completed with 53 static
pages. Further detail is in `docs/performance/simulation-lab-performance.md`.

## Accessibility And Responsive Results

- Public lab and detail routes have no critical automated axe violations.
- The authenticated simulation-history scan passes.
- Search, discipline controls, filters, cards, quick start, modes, and attempt controls are
  keyboard operable.
- Preview, live state, status, and challenge information have text equivalents.
- Status does not rely on colour.
- Reduced-motion simulation operation passes.
- No horizontal overflow occurs at 320, 375, 430, 768, 1,024, or 1,366 CSS pixels.
- The dedicated accessibility suite passed 33 tests.

## Security And Data Protection

- Public routes receive no private student data when unauthenticated.
- Attempts still require an authenticated student and are loaded through existing ownership
  boundaries.
- Cross-student attempt review denial and duplicate completion protection pass unchanged.
- Assessment mode remains server-controlled; hidden assessment answer paths were not
  changed.
- Fault and equation-help visibility use the central mode-capability contract.
- No credential, environment variable, database migration, dependency, analytics service,
  or new cross-student data path was introduced.

## Files Changed For Prompt 39F

- Simulation routes, loading state, navigation, and focused attempt shell under
  `apps/web/src/app/`.
- Registry, typed lab model, discovery rules, server projection, catalogue/detail UI,
  preview, attempt UI, and responsive styles under
  `apps/web/src/features/simulations/`.
- Simulation Lab, accessibility, and smoke coverage under `tests/e2e/`.
- Product, catalogue, discovery, performance, and this audit document under `docs/`.

The worktree also contains earlier Prompt 39A-39E changes. They were preserved and were not
reverted, committed, or pushed by Prompt 39F.

## Quality Results

| Command                       | Result                                         |
| ----------------------------- | ---------------------------------------------- |
| `npm run scan:secrets`        | PASS                                           |
| `npm run format:check`        | PASS                                           |
| `npm run typecheck`           | PASS, all TypeScript workspaces                |
| `npm run lint`                | PASS                                           |
| `npm run validate:content`    | PASS, 19 tests                                 |
| `npm run validate:migrations` | PASS, 13 tests                                 |
| `npm run test:unit`           | PASS, 236 tests; 4 explicitly skipped          |
| `npm run build`               | PASS, optimized Next.js build; 53 static pages |
| `npm run test:smoke`          | PASS, 5 tests                                  |
| `npm run test:a11y`           | PASS, 33 tests                                 |
| `npm run test:e2e`            | PASS, 93 tests                                 |

Focused verification also passed eight discovery unit tests and 12 Simulation Lab plus
existing simulation-browser tests. The E2E server emits the existing Node
`NO_COLOR`/`FORCE_COLOR` warning. The dashboard error test logs its intentional simulated
database failure. Neither is a failed gate.

## Known Limitations

- Only Hydraulic Cylinder Force is available, deliberately matching the prompt's no-bulk
  simulation constraint.
- The pilot still requires named human engineering, education, and accessibility review
  before it can be labelled approved for student use.
- The catalogue scale benchmark is deferred until representative registry volume exists.
- Low-end physical-device timing and live Supabase response latency were not measured.
- The local E2E environment uses authenticated fixture persistence; production continues to
  use the existing Supabase attempt and Row Level Security paths.
- Search and recommendations are deterministic by design; semantic or AI discovery is not
  implemented.

## Prompt 39G Recommendation

Use Prompt 39G as a controlled second-subject replication gate: complete source and human
review evidence first, then implement exactly one Thermodynamics System Boundary simulation
through the same engine, registry, preview, accessibility, persistence, and catalogue
contracts. Include a representative multi-entry search/filter benchmark and keep all other
planned collection items marked `Coming later`.
