# Git Baseline Recovery

Date: 2026-08-28
Repository: `Pchie/industrial-learn`

## Verified Baseline

| Item                         | State                                                       |
| ---------------------------- | ----------------------------------------------------------- |
| Repository root              | `/Users/zungu/Documents/Master Industrial Learning`         |
| Current branch               | `codex/prompt-39-approved-sources`                          |
| Current HEAD                 | `e094d985f2be55f3ac96bcb23750863ed4a05d7f`                  |
| Baseline relation            | HEAD equals local and remote `development`                  |
| Production branch            | `main`; not checked out and not modified                    |
| Remote                       | `origin` -> `https://github.com/Pchie/industrial-learn.git` |
| Deleted files                | None                                                        |
| Pre-Prompt 42 dirty paths    | 167 total: 58 modified and 109 untracked                    |
| Unknown files                | None after path, diff, and Prompt 39 audit review           |
| Unrelated/pre-existing files | None detected in the dirty set                              |
| `docs/proposals/`            | Directory absent; nothing deleted or staged                 |

The baseline commit is valid and must be preserved. No history rewrite, reset, squash, or
direct `main` work is justified.

## Classification Method

Every path reported by `git status --porcelain=v1 -uall` before Prompt 42 was assigned once:

- **A:** Prompt 39 source onboarding, visual-learning architecture, foundation, flagship
  lessons, Simulation Lab, thermodynamic replication, tests, and supporting documentation.
- **B:** Prompt 40 independent staging audit evidence.
- **C:** Prompt 41 remediation planning evidence.
- **D:** database/migration registration work associated with Prompt 39G.
- **E:** unrelated or pre-existing work.
- **F:** unknown ownership.

Counts are A=157, B=4, C=4, D=2, E=0, F=0. Prompt 42's new policy and documentation are
listed separately in its commit plan.

## Secret And Generated-File Safety

The existing `.gitignore` excludes real environment files, local production owner data,
dependencies, Next.js output, coverage, Playwright reports, test results, editor metadata,
OS metadata, temporary files, local databases, and Vercel metadata.

Tracked environment files are templates only:

- `.env.example`
- `.env.staging.example`

Ignored local files were confirmed by name without printing values:

- `.env.local`
- `.env.staging.local`
- `.env.production.local`

`node_modules`, `apps/web/.next`, `playwright-report`, `test-results`, and `.DS_Store` are
ignored. The repository secret scan passed before staging preparation.

## Recovery Strategy

1. Keep `main` and `development` unchanged while recovery occurs.
2. Keep all Prompt 39-42 work on `codex/prompt-39-approved-sources` or a descendant
   remediation branch.
3. Commit Prompt 40, Prompt 41, and Prompt 42 evidence/policy as isolated local commits.
4. Split Prompt 39 by coherent ownership boundaries, using hunk staging for shared files.
5. Do not stage migration `0010` or its schema-test expectation until Prompt 43 resolves its
   published/unapproved semantics and live migration state is known.
6. Run focused checks after each group and the complete local gate suite at final HEAD.
7. Review staged paths and rerun secret scanning before every commit.
8. Do not push until the local commit stack and final status have been reported for review.

## Mixed-File Findings

The following files contain accumulated work from more than one Prompt 39 phase and cannot
be split safely by filename alone:

- `apps/web/src/features/lesson-engine/components.tsx`
- `apps/web/src/features/lesson-engine/types.ts`
- `apps/web/src/features/simulations/catalog.ts`
- `apps/web/src/features/simulations/server.ts`
- `packages/engineering-core/src/index.ts`
- `packages/simulation-engine/src/index.ts`
- their corresponding tests
- `package.json`, `package-lock.json`, and `playwright.config.ts`

The safe options are hunk-level staging with intermediate checks or a documented cohesive
visual-platform commit. Fabricating chronological boundaries would make review less
reliable.

## Database Hold

These two paths are classified D and remain a separate blocked group:

- `database/migrations/0010_bernoulli_flow_simulation_registration.sql`
- `packages/database/src/schema.test.ts`

Migration `0010` is untracked and currently registers an `Engineering review required`
simulation as `published`. Prompt 40 identified that state as unsafe when combined with the
service-role application bypass. The migration must not be applied or included in an
integration candidate as written. Because staging is inactive, its live application state
cannot be proven in Prompt 42.

## Full Pre-Prompt 42 Path Classification

Status codes are `M` for modified and `??` for untracked.

<!-- CLASSIFICATION_MANIFEST -->

### A. Prompt 39 Visual-Learning Implementation

```text
M	apps/web/package.json
M	apps/web/src/app/globals.css
M	apps/web/src/app/layout.tsx
M	apps/web/src/app/lessons/[lessonSlug]/page.tsx
M	apps/web/src/app/simulations/[simulationSlug]/attempt/[attemptId]/page.tsx
M	apps/web/src/app/simulations/[simulationSlug]/page.tsx
M	apps/web/src/app/simulations/page.tsx
M	apps/web/src/features/assessments/catalog.ts
M	apps/web/src/features/content-governance/server-data.ts
M	apps/web/src/features/lesson-engine/components.test.tsx
M	apps/web/src/features/lesson-engine/components.tsx
M	apps/web/src/features/lesson-engine/data.ts
M	apps/web/src/features/lesson-engine/types.ts
M	apps/web/src/features/simulations/catalog.ts
M	apps/web/src/features/simulations/components.tsx
M	apps/web/src/features/simulations/interactive-client.tsx
M	apps/web/src/features/simulations/server.ts
M	apps/web/src/features/simulations/state.test.ts
M	content/assessments/fluid-pressure/basic-fluid-pressure-assessment.json
M	content/lessons/fluid-pressure/basic-fluid-pressure.json
M	content/lessons/smart-pump-systems/pump-system-units-and-measurements.json
M	content/projects/fluid-pressure/fluid-pressure-observation.json
M	content/schemas/content-block.schema.json
M	content/schemas/lesson.schema.json
M	content/schemas/source-record.schema.json
M	docs/architecture/dependency-rationale.md
M	docs/content/engineering-equation-register.md
M	docs/content/hydraulic-cylinder-simulation-review.md
M	docs/content/source-needed-register.md
M	docs/content/thermodynamics-first-lesson-review.md
M	knowledge/fluid-mechanics/pressure-fundamentals.json
M	knowledge/fluid-pressure/basic-fluid-pressure.json
M	knowledge/hydraulics/hydraulic-cylinder-force.json
M	knowledge/smart-pump-systems/pump-system-units-and-measurements.json
M	knowledge/smart-pump-systems/si-units-and-measurement.json
M	knowledge/source-register/pilot-source-register.md
M	knowledge/thermodynamics/systems-surroundings-boundaries.json
M	package-lock.json
M	package.json
M	packages/content-system/src/content-system.test.ts
M	packages/content-system/src/index.ts
M	packages/database/src/attempt-persistence.test.ts
M	packages/design-system/src/components.test.tsx
M	packages/design-system/src/tokens.ts
M	packages/engineering-core/src/index.test.ts
M	packages/engineering-core/src/index.ts
M	packages/simulation-engine/src/index.test.ts
M	packages/simulation-engine/src/index.ts
M	playwright.config.ts
M	sources/fluid-pressure/source-record.json
M	sources/hydraulics/source-record.json
M	sources/smart-pump-systems/source-record.json
M	sources/thermodynamics/source-record.json
M	tests/e2e/accessibility.spec.ts
M	tests/e2e/lesson-engine.spec.ts
M	tests/e2e/simulation-browser.spec.ts
M	tests/e2e/staging-smoke.spec.ts
??	apps/web/src/app/internal/visual-simulation-lab/page.tsx
??	apps/web/src/app/simulations/loading.tsx
??	apps/web/src/features/bernoulli-flow-lab/bernoulli-flow-lab.module.css
??	apps/web/src/features/bernoulli-flow-lab/bernoulli-flow-scene.tsx
??	apps/web/src/features/bernoulli-flow-lab/bernoulli-flow-visual-lesson.test.tsx
??	apps/web/src/features/bernoulli-flow-lab/bernoulli-flow-visual-lesson.tsx
??	apps/web/src/features/bernoulli-flow-lab/content.ts
??	apps/web/src/features/bernoulli-flow-lab/model.test.ts
??	apps/web/src/features/bernoulli-flow-lab/model.ts
??	apps/web/src/features/hydraulic-cylinder-lesson/content.ts
??	apps/web/src/features/hydraulic-cylinder-lesson/hydraulic-cylinder-lesson.module.css
??	apps/web/src/features/hydraulic-cylinder-lesson/hydraulic-cylinder-scene.tsx
??	apps/web/src/features/hydraulic-cylinder-lesson/hydraulic-cylinder-visual-lesson.test.tsx
??	apps/web/src/features/hydraulic-cylinder-lesson/hydraulic-cylinder-visual-lesson.tsx
??	apps/web/src/features/hydraulic-cylinder-lesson/model.test.ts
??	apps/web/src/features/hydraulic-cylinder-lesson/model.ts
??	apps/web/src/features/lesson-engine/visual-experience-registry.tsx
??	apps/web/src/features/simulations/attempt-components.tsx
??	apps/web/src/features/simulations/catalog-contract.ts
??	apps/web/src/features/simulations/discovery.test.ts
??	apps/web/src/features/simulations/discovery.ts
??	apps/web/src/features/simulations/lab-types.ts
??	apps/web/src/features/simulations/simulation-lab-client.tsx
??	apps/web/src/features/simulations/simulation-lab.module.css
??	apps/web/src/features/simulations/simulation-preview.tsx
??	apps/web/src/features/visual-simulation/components.test.tsx
??	apps/web/src/features/visual-simulation/components.tsx
??	apps/web/src/features/visual-simulation/contracts.ts
??	apps/web/src/features/visual-simulation/state.test.ts
??	apps/web/src/features/visual-simulation/state.ts
??	apps/web/src/features/visual-simulation/visual-simulation-lab.tsx
??	apps/web/src/features/visual-simulation/visual-simulation.module.css
??	content/lessons/fluid-mechanics/bernoulli-flow-lab.json
??	content/lessons/hydraulics/hydraulic-cylinder-force.json
??	content/lessons/thermodynamics/systems-surroundings-boundaries.json
??	docs/architecture/simulation-rendering-pipeline.md
??	docs/architecture/visual-simulation-foundation.md
??	docs/architecture/visual-state-contract.md
??	docs/audits/prompt-39-approved-source-report.md
??	docs/audits/prompt-39a-visual-learning-redesign.md
??	docs/audits/prompt-39b-visual-simulation-foundation.md
??	docs/audits/prompt-39c-hydraulic-cylinder-visual-pilot.md
??	docs/audits/prompt-39d-visual-learning-ux-audit.md
??	docs/audits/prompt-39d-visual-scorecard.json
??	docs/audits/prompt-39e-visual-standardisation.md
??	docs/audits/prompt-39f-simulation-lab.md
??	docs/audits/prompt-39g-architecture-reuse.md
??	docs/audits/prompt-39g-bernoulli-flagship.md
??	docs/audits/prompt-39g-thermodynamic-boundary-replication.md
??	docs/content/bernoulli-flow-lab.md
??	docs/content/bernoulli-model-assumptions.md
??	docs/content/hydraulic-cylinder-assumptions.md
??	docs/content/hydraulic-cylinder-visual-lesson.md
??	docs/content/hydraulic-cylinder-visual-model.md
??	docs/content/pilot-approved-source-register.md
??	docs/content/pilot-engineering-review.md
??	docs/content/pilot-equation-review.md
??	docs/content/thermodynamic-system-boundary-simulation-review.md
??	docs/performance/bernoulli-performance.md
??	docs/performance/hydraulic-cylinder-performance.md
??	docs/performance/simulation-lab-performance.md
??	docs/performance/simulation-lab-two-entry-benchmark.md
??	docs/performance/visual-simulation-budget.md
??	docs/product/bernoulli-user-flow.md
??	docs/product/engineering-animation-guidelines.md
??	docs/product/hydraulic-cylinder-user-flow.md
??	docs/product/hydraulic-cylinder-visual-pilot.md
??	docs/product/linked-schematic-system.md
??	docs/product/live-equation-system.md
??	docs/product/reference-visual-lesson-hydraulic-cylinder.md
??	docs/product/reference-visual-simulation-thermodynamic-boundary.md
??	docs/product/simulation-catalogue-standard.md
??	docs/product/simulation-design-system.md
??	docs/product/simulation-discovery-rules.md
??	docs/product/simulation-lab-product-spec.md
??	docs/product/visual-authoring-guide.md
??	docs/product/visual-component-library.md
??	docs/product/visual-content-schema.md
??	docs/product/visual-learning-audit.md
??	docs/product/visual-learning-improvement-backlog.md
??	docs/product/visual-learning-principles.md
??	docs/product/visual-lesson-architecture.md
??	docs/product/visual-lesson-release-checklist.md
??	docs/product/visual-lesson-standard-v1.md
??	docs/product/visual-lesson-types.md
??	docs/product/visual-migration-plan.md
??	docs/product/visual-simulation-responsive-rules.md
??	knowledge/fluid-mechanics/bernoulli-flow.json
??	sources/fluid-mechanics/nasa-glenn-bernoulli.json
??	sources/fluid-mechanics/openstax-college-physics-2e.json
??	sources/fluid-pressure/openstax-college-physics.json
??	sources/hydraulics/caterpillar-boom-cylinder-6040431.json
??	sources/hydraulics/parker-140h8-cylinder.json
??	sources/smart-pump-systems/doe-pump-sourcebook-2006.json
??	sources/smart-pump-systems/nist-sp-330-2019.json
??	sources/thermodynamics/purdue-me200-definitions-2021.json
??	tests/e2e/bernoulli-flow-lab.spec.ts
??	tests/e2e/hydraulic-cylinder-lesson.spec.ts
??	tests/e2e/simulation-lab.spec.ts
??	tests/e2e/visual-simulation-lab.spec.ts
```

### B. Prompt 40 Audit

```text
??	docs/audits/prompt-40-evidence-register.json
??	docs/audits/prompt-40-independent-staging-audit.md
??	docs/audits/prompt-40-release-gates.md
??	docs/audits/prompt-40-test-results.md
```

### C. Prompt 41 Remediation Planning

```text
??	docs/audits/prompt-41-remediation-planning-report.md
??	docs/remediation/prompt-40-blocker-map.json
??	docs/remediation/prompt-40-release-gate-matrix.md
??	docs/remediation/prompt-40-remediation-plan.md
```

### D. Database/RLS Work

```text
M	packages/database/src/schema.test.ts
??	database/migrations/0010_bernoulli_flow_simulation_registration.sql
```

### E. Unrelated/Pre-Existing

None.

### F. Unknown

None.
