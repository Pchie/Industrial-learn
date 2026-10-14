# Website Design Consistency Report

Date: 2026-09-09 (work began 2026-09-08)

## Scope

User request: bring the full frontend up to the accepted dashboard standard,
reuse existing engineering artwork, inspect the result and verify functionality.

Starting commit: `5fd8fc5253314deb403172d2084dc3d216adcd1f`.
Starting branch: clean `development`, tracking `origin/development`.
Working branch: `codex/website-design-consistency`.

This is a presentation and navigation pass. It is not a new engineering-content
approval, production launch, database migration or AI Mentor implementation.

## Verdict

PASS for the scoped frontend implementation and local verification. The complete
quality sequence and all 209 browser tests passed on the final source changes.
The implementation is ready for code review, not a claim of universal device
compatibility or live production readiness.

## Changes

- Added reusable page headings, image bands, action links, empty states and loading states.
- Updated home, learning discovery, schools and pilot presentation using existing artwork.
- Standardised programme/module/pathway cards, metadata and prerequisites through shared components.
- Kept the actual engineering visual first in lessons; did not put a decorative banner before it.
- Updated simulation discovery, detail/history framing and assessment catalogue/question presentation.
- Removed duplicate authentication card framing and improved form hierarchy.
- Improved student utility pages, staff workspace entry points, review queues and review evidence sections.
- Added working account-workspace links and management section anchors.
- Corrected the existing owner System status link from nonexistent `/api/health`
  to the existing `/api/health/ready` endpoint.
- Removed empty difficulty/pathway section headings when no published entries exist.
- Preserved white image-banner copy independently of page-family styles after a
  screenshot review identified a Simulation Lab contrast regression.
- Replaced the misleading sign-in prompt shown to signed-in, non-student staff in
  the Lab with a workspace link. This passes only a session-presence boolean to the
  presentation component; student-history eligibility and queries are unchanged.
- Aligned authentication links and their separators, retained compact banner
  labels, and kept the new mobile filter disabled until its client handler is ready.
- Reworded the shared curriculum progress notice so it does not incorrectly tell
  already-signed-in students to sign in; its protected dashboard link is unchanged.
- Declared global smooth scrolling to Next.js using its documented
  `data-scroll-behavior="smooth"` root attribute, so route transitions can scroll
  instantly without removing smooth in-page navigation.

No dependencies, engineering equations, reviewed content files, authentication
actions, assessment scoring, simulation state logic, database migrations, secrets,
or production settings were changed.

## Quality Results

The complete `npm run ci` sequence exited successfully. It ran the following gates:

| Command                       | Result                                                         |
| ----------------------------- | -------------------------------------------------------------- |
| `npm run scan:secrets`        | PASS; no obvious committed secret values found                 |
| `npm run format:check`        | PASS                                                           |
| `npm run typecheck`           | PASS across all workspaces                                     |
| `npm run lint`                | PASS                                                           |
| `npm run validate:content`    | PASS; 29 tests                                                 |
| `npm run validate:migrations` | PASS; 28 tests                                                 |
| `npm run test:unit`           | PASS; 496 tests, 7 existing opt-in live-database tests skipped |
| `npm run build`               | PASS; compiled and generated 38 static pages                   |
| `npm run test:e2e`            | PASS; 209 tests, zero failures, 16.6 minutes                   |

The seven skipped database tests were not executed and are not represented as
live verification. No database logic changed in this task.

The final browser run includes all 176 existing tests and the 33 added website
consistency tests. It includes the configured smoke and accessibility suites; no
new browser retries, exclusions or relaxed assertions were introduced. Four new
shared-presentation unit tests are included in the 496 passing unit tests.

Local execution logs: `/tmp/industrial-website-ci-complete.log` and
`/tmp/industrial-website-e2e-complete.log`. The generated HTML browser report is in
`playwright-report/`; route screenshots are in `test-results/`. These generated
outputs remain ignored by Git, not part of the source changes.

## Browser Review

The first dedicated design sweep passed 31 of 32 tests. Its one failure identified
off-screen discipline buttons in the existing mobile horizontal scroller. The
mobile presentation now uses a labelled discipline dropdown, preserving the same
filter state as the desktop controls. A regression test checks the transition
between these representations. The clipping assertion has not been weakened.

During the first full browser run, manual screenshot inspection identified dark
copy over the Simulation Lab's blue artwork. An old `.labHeader p` rule was
overriding the new banner styles. The run was deliberately stopped after 144
passes (one test interrupted, 64 not run); it is not counted as a complete pass.
The obsolete header text rules were removed, the shared banner selectors were
scoped more specifically, and the route matrix now explicitly checks white banner
copy in both themes. This supplements Axe because automated contrast detection
cannot reliably infer every pixel behind text over an image.

The next complete run passed 208 tests and failed the new mobile-filter test.
Inspection found that the nested native label's text includes its option text,
so an exact `getByLabel("Discipline")` query matched nothing. The accessibility
tree correctly exposed one combobox named Discipline. A separate browser probe
confirmed that selecting Thermodynamics through that accessible role updates the
mobile value and the desktop button's `aria-pressed` state. The test now uses
`getByRole("combobox", { name: "Discipline", exact: true })`; no timeout or
behavioural assertion was relaxed. The final run also checks compact banner label
size and authentication-link alignment after the last screenshot polish.

A subsequent full run passed all 33 design checks but recorded an intermittent
assessment checkbox click failure after saving progress: 206 passed, one failed,
and two serial dependants did not run. The trace showed repeated moving/out-of-
viewport positions during the click. Inspection found global CSS smooth scrolling
without Next.js 16's documented root opt-in for suspending it during navigation.
The integration was corrected using the installed Next.js guide at
`node_modules/next/dist/docs/01-app/02-guides/upgrading/version-16.md`, section
"Scroll Behavior Override". The original assessment test was not relaxed or edited.

Eight isolated local A/B save-and-submit journeys (four with the root attribute
temporarily applied in the browser and four without it) all passed. Thus this was
not a deterministic reproduction of the intermittent failure; it did confirm
different navigation timing/scroll positions and no scoring changes. The complete
final suite passed against the actual root-layout change, including the unchanged
assessment save-and-submit journey. The design matrix asserts the required root
attribute on every route. This result does not establish that an intermittent
timing issue is impossible on every device.

A screenshot recheck also identified stale curriculum copy saying progress
appears after sign-in even for signed-in students. The neutral dashboard notice
and its unit/browser assertions were corrected. The final quality and browser
runs above include this last change.

The final dedicated matrix covers 30 routes at 1536px/light and 390px/dark,
including decoded images, document overflow, clipped controls, runtime exceptions
and automated WCAG scans. The full browser suite additionally covers dashboard
geometry, smaller screens, reduced motion, keyboard interaction, lesson and
simulation controls, assessment submission and protected content boundaries.

Screenshots are generated only from isolated local synthetic accounts. The
screenshot capture returns instantly to the top and clears transient test focus
before capture so smooth scrolling does not misrepresent sticky navigation.

An additional local browser sweep checks every generated programme/year URL from
the production prerender manifest at 320px, 768px and 1536px. This covers 11 routes
and 33 responsive checks, supplementing the representative programme pages in the
main matrix. All 33 checks passed on the corrected build. A further 32 checks
across eight image-band routes, two widths and both themes passed with white
banner copy and no runtime exceptions. Desktop/mobile dashboard captures were
also reviewed. These are additional checks, not extra tests added to the 209-test
Playwright suite.

## Performance Scope

- No new application image assets, external image requests or runtime dependencies were added.
- Reused images have responsive sizes, fixed geometry, lazy loading below the fold
  and eager/high-priority loading for primary artwork where appropriate.
- The new presentation components do not import simulation or 3D engines.
- The changed and added stylesheets add approximately 2.6 KB of individually
  gzipped source CSS relative to the baseline. This is a source-size comparison,
  not a measured production route transfer-size or field performance claim.

## Known Limitations

- Automated accessibility checks are not a substitute for human assistive-technology testing.
- Automated browser coverage uses the configured Chromium browser; Safari and Firefox
  are not installed in the test runtime and were not verified in this pass.
- Existing unpublished lessons/simulations remain unavailable to students by design.
- Project creation/submission and other unfinished backend features are not implemented
  or represented as working by this frontend task.
- Local synthetic-account tests do not establish email delivery, live database availability,
  or production readiness. Those operational gates are separate.
- Existing concept images remain illustrative, not technical source evidence.
- Browser tooling emitted its existing `NO_COLOR`/`FORCE_COLOR` preference warning;
  this did not suppress tests or affect their results.
- This task cannot establish an absolute guarantee of perfection on every device.

## Release State

No production deployment or live-data mutation occurred. HEAD remains
`5fd8fc5253314deb403172d2084dc3d216adcd1f` on
`codex/website-design-consistency`. There are 32 modified tracked files and seven
new source/test/documentation files. Nothing is staged, committed or pushed by
this task; the working tree intentionally contains the completed changes for review.

The local preview is running at `http://127.0.0.1:3167/` in production-server mode
with isolated local test accounts and live Supabase environment values disabled.
This is not the deployed staging or production website.

Next release action: review the feature-branch diff, then use the normal pull
request and staging verification process. Do not bypass engineering publication
or operational release gates on the strength of frontend test results.
