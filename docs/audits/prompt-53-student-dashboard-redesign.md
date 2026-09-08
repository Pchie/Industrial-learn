# Prompt 53: Student Dashboard Redesign

Implementation date: 2026-09-07.

## Verification Status

PASS for the scoped frontend implementation and local verification. The dashboard now
prioritises a valid next action, recorded learning and permitted results in both themes.
This document is not a deployment, live-RLS verification or student-pilot approval.

## Baseline and Preserved Work

Starting branch: `codex/prompt-51-premium-frontend`.
Task branch: `codex/prompt-53-student-dashboard`.
Base commit: `adffe83e6842387a00ca818354dfabdbd114d4da`.

The worktree already contained Prompt 51 frontend/theme/simulation changes and the
eleven untracked Prompt 49/50 audit/pilot documents. These were preserved. No commit,
push, production deployment, invitation, email or live database write is part of this
task. The final working tree intentionally contains both prior work and this refinement.

AGENTS.md, dashboard routes/data services, session/capability resolution, progress and
competency functions, publication/review gates, workspace navigation, shared theme tokens,
database relationships and relevant existing tests were inspected. Prompt 52 artifacts
were absent; the available shared header is reused, not independently redesigned here.

## Changes

- Replaced the repeated dashboard card grid with a compact welcome, prominent next
  lesson, readable learning sequence, eligible practice, reviewable results and conditional
  saved content. Actual route remains `/dashboard`.
- Added a scoped CSS module using the existing semantic theme and responsive navigation.
- Added a read-only dashboard presentation projection, retaining existing progress
  mathematics but withholding unsupported aggregates and inferred mastery.
- Kept the existing persistence service and narrowed its reads to explicit bounded
  summaries. Enrolment context uses real cohort/programme relationships; missing year
  and semester are not inferred. Partial data failures remain distinct from zero.
- Added exact-version assessment review-link verification using the existing publication
  gate; initial dashboard reads do not fetch answers or private scoring explanations.
- Separated the client error boundary from the server dashboard/content imports.
- Extended local-only test fixtures with an incomplete-data account and existing
  completed-attempt version/review metadata. No synthetic records are written to Supabase.
- Added unit, responsive, keyboard, theme, accessibility and privacy regression coverage.
  Updated old assertions for intentionally omitted empty portfolio/project cards.

Task files are confined to `apps/web/src/features/student-dashboard/`, the dashboard
route, two local-test fixture integration points, dashboard/accessibility browser tests,
and the two Prompt 53 documents. No changes were made to engineering content, equations,
scoring, auth/role policies, database schemas/migrations or publication authority.

## Before and After

| Before                                                                | After                                                                          |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| Equal-weight dashboard cards including empty plans/projects/portfolio | One dominant next action, compact sections, optional empty sections omitted    |
| Continue title without a meaningful visual                            | Existing original pressure visual, actual lesson metadata, Start/Return action |
| Potential inferred year/semester                                      | Explicit supplied context only                                                 |
| Whole-row attempt reads                                               | Bounded summaries without answers or private explanations                      |
| Generic partial warning while failed data could resemble empty data   | Per-section unavailable state, retained successful sections, retry             |
| Legacy result summary could imply reviewability/competency            | Exact review gate and explicit server-awarded evidence                         |
| No dashboard-specific paired visual evidence                          | Six-width, two-theme, new/returning test matrix                                |

## Tests and Evidence

The initial full browser run passed all 145 tests. Direct screenshot inspection then
identified that the phone thumbnail and expanded navigation displaced the next action.
The final mobile refinement replaces the expanded study navigation with a native
disclosure and puts the action before the thumbnail. The complete rerun passed all 145
tests in 6.7 minutes, with no browser skips or retries.

| Command/check                 | Result                                                      |
| ----------------------------- | ----------------------------------------------------------- |
| `npm run scan:secrets`        | PASS                                                        |
| `npm run format:check`        | PASS                                                        |
| `npm run typecheck`           | PASS; all workspaces                                        |
| `npm run lint`                | PASS; rerun after the final mobile refinement               |
| `npm run validate:content`    | PASS; 29 tests                                              |
| `npm run validate:migrations` | PASS; 24 tests                                              |
| `npm run test:unit`           | PASS; 428 passed, five existing live-database tests skipped |
| `npm run build`               | PASS; production-mode build, no deployment                  |
| `npm run test:e2e`            | PASS; final run: 145 passed in 6.7 minutes                  |
| `git diff --check`            | PASS                                                        |

The unit run covered 44 passing files and one environment-gated integration file.
The five existing live-database tests were not enabled because no separate test database
was used. No test failure was hidden or suppressed. Early type checking caught four
optional-field/property references, and the first CI run found one unbound callback and
five asynchronous mock style errors. These were corrected before the successful CI run.
The simulated database-failure browser test deliberately logs its safe test exception;
runner `NO_COLOR`/`FORCE_COLOR` warnings are cosmetic.

The browser suite includes 46 existing accessibility tests, five smoke tests and 16 new
dashboard-experience tests. The new matrix visits 24 dashboard states: six widths times
two themes times two account states, with keyboard interaction and an axe scan at each.
No WCAG A/AA violations were reported by those scans. Additional cases cover incomplete
data, separate student identities, owner perspective, query-string impersonation attempts,
expired sessions, no-store responses and lightweight assets. Existing tests verify
actual local assessment submission, review, new-session persistence and competency points.

Unit coverage includes the dashboard presentation, bounded summary-query contracts,
exact assessment review metadata and the unchanged progress-model tests. Required
simulation prerequisites, unavailable catalogue entries, practice versus assessment
activity and explicit simulation awards have independent presentation tests.

## Screenshot Review

The final screenshots were captured from the isolated local production-mode build.
Desktop and mobile, new and returning, Light and Dark were inspected directly. The
review checked spacing, text fit, navigation, next-action prominence, completion labels,
unavailable results and conditional saved content. The mobile focus outline in the
captures is intentional evidence of keyboard operation, not decorative panel styling.

All 48 full-page/viewport images are under ignored `test-results/`. Representative
inspected evidence (paths relative to the repository root):

| State                        | Evidence directory                                                                    | Files                                                          |
| ---------------------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| Mobile Light, new/returning  | `test-results/student-dashboard-experien-f3e52--new-and-returning-students-chromium/` | `new-light-320-viewport.png`, `returning-light-320-full.png`   |
| Mobile Dark, new/returning   | `test-results/student-dashboard-experien-eea1e--new-and-returning-students-chromium/` | `new-dark-320-full.png`, `returning-dark-320-viewport.png`     |
| Desktop Light, new/returning | `test-results/student-dashboard-experien-f446c--new-and-returning-students-chromium/` | `new-light-1440-full.png`, `returning-light-1440-viewport.png` |
| Desktop Dark, new/returning  | `test-results/student-dashboard-experien-60a94--new-and-returning-students-chromium/` | `new-dark-1440-viewport.png`, `returning-dark-1440-full.png`   |

There was no measured page overflow above the one-pixel rounding tolerance at any of
the six tested dashboard widths. At 320 x 900, a separate local browser measurement
placed the returning student's primary action at y=855px with height=44px, entirely
within the initial viewport. This is not a claim about every phone height or real-device
browser. Manual screen-reader and physical-device testing remain separate work.

## Performance

The dashboard remains dynamically server-rendered and private/no-store. Static SVG
thumbnails reuse existing reviewed visuals; no canvas or 3D engine is loaded. There is
no new client-state library, analytics SDK, polling loop or dependency. Database summary
reads are explicitly selected and bounded instead of requesting full attempt rows.

| Local measurement                    | Final result  |
| ------------------------------------ | ------------- |
| DOMContentLoaded                     | 427.8 ms      |
| Encoded dashboard document body      | 9,805 bytes   |
| Script resources on dashboard reload | 11            |
| Sum of encoded script-body sizes     | 143,125 bytes |
| 3D renderer requests                 | 0             |

Evidence: `test-results/student-dashboard-experien-7c53c-ponses-under-reduced-motion-chromium/dashboard-metrics.json`.
These are one local Chromium production-mode reload's measurements with synthetic data.
Script sizes include shared code, not an isolated dashboard bundle delta, and are not a
cold-network transfer guarantee. No deployed Core Web Vitals or before/after performance
improvement is claimed. The seven bounded dashboard reads exclude separate existing
authentication/profile requests; the real Supabase latency was not measured.

## Local Preview

A separate local synthetic-data preview is available at
`http://127.0.0.1:3161/dashboard`. It does not replace the earlier port-3160 preview.
Local test accounts include `student@example.test` (new),
`active.student@example.test` (returning) and `incomplete.student@example.test`.
Use the existing local test password, not a real Supabase account password. The preview
uses the same explicit local/E2E isolation and empty Supabase variables as the browser
suite. It is not a staging or production deployment.

## Known Limits and Release Meaning

Local browser tests use `INDUSTRIAL_LEARN_AUTH_MODE=local`, `INDUSTRIAL_LEARN_E2E=true`
and empty Supabase credentials. They exercise the production-mode Next.js build and
isolated synthetic persistence, not deployed Supabase RLS. Query-contract unit tests
do not substitute for a live PostgREST integration check.

No exact step/state restoration, production academic-year/semester mapping, project
workflow or preference editor is added. Aggregate progress remains unavailable where
its denominator/history cannot be verified. Current publication gates limit practice
choices; unpublished hydraulic/Bernoulli simulations remain protected. No permission
to publish them is inferred from a polished dashboard.

The existing Prompt 49 pilot NO-GO is not overridden. The next release step is a scoped
review/commit and staging verification with authorised synthetic accounts, followed by
the outstanding pilot gates. Do not launch production as a result of this UI task.
