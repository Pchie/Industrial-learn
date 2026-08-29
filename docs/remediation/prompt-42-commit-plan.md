# Prompt 42 Commit Plan

Date: 2026-08-28
Target branch: `codex/prompt-39-approved-sources`
Push status: prohibited until local preparation is complete and reviewed

## Commit Principles

- Preserve baseline `e094d985f2be55f3ac96bcb23750863ed4a05d7f`.
- Do not commit or push directly to `main`.
- Keep `development` as the eventual pull-request target.
- Use explicit path staging and inspect `git diff --cached` before each commit.
- Never stage ignored environment/generated paths.
- Do not hide the Prompt 40 publication blockers inside a broad visual commit.
- Do not apply or stage migration `0010` as written.

## Planned Local Commit Stack

### 1. `audit: add Prompt 40 independent staging audit`

Exact files:

- `docs/audits/prompt-40-evidence-register.json`
- `docs/audits/prompt-40-independent-staging-audit.md`
- `docs/audits/prompt-40-release-gates.md`
- `docs/audits/prompt-40-test-results.md`

### 2. `docs: add Prompt 41 remediation plan`

Exact files:

- `docs/audits/prompt-41-remediation-planning-report.md`
- `docs/remediation/prompt-40-blocker-map.json`
- `docs/remediation/prompt-40-release-gate-matrix.md`
- `docs/remediation/prompt-40-remediation-plan.md`

### 3. `governance: add shared publication visibility policy`

Exact implementation files:

- `packages/content-review-workflow/package.json`
- `packages/content-review-workflow/src/index.ts`
- `packages/content-review-workflow/src/publication-visibility.ts`
- `packages/content-review-workflow/src/publication-visibility.test.ts`

Exact Prompt 42 documentation files:

- `docs/architecture/shared-publication-visibility-policy.md`
- `docs/remediation/git-baseline-recovery.md`
- `docs/remediation/prompt-42-commit-plan.md`

### 4. `audit: record Prompt 42 publication-policy verification`

Exact file:

- `docs/audits/prompt-42-publication-policy-report.md`

Keeping the final evidence in its own commit lets the report identify the preceding local
commit hashes without creating a self-referential commit hash.

### 5. `content: add reviewed pilot source and structured-content evidence`

Prepared scope from classification A:

- `sources/**` and `knowledge/**` changed paths;
- `content/assessments/**`, `content/projects/**`, and reviewed lesson metadata;
- `content/schemas/**`;
- `packages/content-system/**`;
- source substitutions in assessment and content-governance catalogues; and
- source/equation/review documentation under `docs/content/**`.

This group preserves `Engineering review required` and other non-approved states. It must
not include public route or simulation availability changes.

### 6. `visual: establish visual simulation foundation and flagship experiences`

Prepared scope from classification A:

- `packages/design-system/**`;
- `packages/engineering-core/**`;
- `packages/simulation-engine/**`;
- `apps/web/src/features/visual-simulation/**`;
- `apps/web/src/features/hydraulic-cylinder-lesson/**`;
- `apps/web/src/features/bernoulli-flow-lab/**`;
- the internal visual lab route;
- lesson-engine visual contracts, renderer integration, and tests;
- relevant structured lesson files; and
- visual lesson E2E coverage.

Shared engine and lesson files combine Prompt 39B, 39C, 39E, and 39G work. A cohesive commit
is safer than fabricated prompt-by-prompt hunk history unless intermediate focused tests
prove a finer split.

### 7. `product: add registry-driven Simulation Lab and visual standards`

Prepared scope from classification A:

- `/simulations` routes and loading state;
- `apps/web/src/features/simulations/**`;
- navigation/global responsive integration;
- Simulation Lab, smoke, and accessibility E2E coverage;
- Prompt 39 product, architecture, performance, and audit documents; and
- root/app package and Playwright configuration changes required by the visual platform.

This commit records the Prompt 40 blocker honestly. Prompt 43 must add route, registry,
service-role, parent, and embedded-simulation enforcement before the branch is eligible for
integration or deployment.

### 8. Held: `database: register Bernoulli simulation`

Do not create this commit in Prompt 42.

Held files:

- `database/migrations/0010_bernoulli_flow_simulation_registration.sql`
- `packages/database/src/schema.test.ts`

Reason: the untracked migration stores unapproved content as `published`, and the live
migration state cannot be checked while staging is inactive. Prompt 43 or a dedicated
database remediation must decide whether to correct the unapplied file or add a later
corrective migration if it was applied elsewhere.

## Staging Checks Per Commit

Before each local commit:

1. run `npm run scan:secrets`;
2. inspect `git diff --cached --name-status`;
3. inspect `git diff --cached --check`;
4. confirm forbidden files are absent from the index; and
5. run the focused tests for that ownership boundary.

After the stack:

- run every Prompt 42 quality command;
- record exact commit hashes;
- report remaining uncommitted D paths;
- do not push; and
- do not merge until Prompt 43 closes delivery enforcement and CI passes at its final commit.

## Rollback

No shared history is rewritten. If a local commit boundary is rejected before push, create a
new corrective commit or, with explicit approval, reconstruct only the unpublished feature
branch. Never reset `main` or `development`.
