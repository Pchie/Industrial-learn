# Prompt 53D: Reference Frontend Implementation

Follow-up: the user's requested live-layout and fictional-preview refinement is
recorded in [Reference Dashboard V2 Verification](reference-dashboard-v2-verification.md).
The original measurements and limitations below are retained as historical evidence;
the V2 report and specification describe the current dashboard presentation.

Dates: 2026-09-07 to 2026-09-08. Scope: working frontend implementation and local verification.
**Status: PARTIAL verification.** The working frontend is implemented and all enabled
local quality checks pass. A separate live student-account capture and the five opt-in
staging database checks remain unperformed. No artwork slot or applicable page is blocked
for local inspection. This is not a production release or engineering-content approval.

## Reference And Original State

Reference: `docs/design/references/industrial-learn-dashboard-target.png`, 1536 x 1024.
The requested repository path was initially absent. The actual user-supplied image
existed in Downloads, was opened and inspected, and was copied into that path.

The running original app was verified at `http://127.0.0.1:3164/dashboard` using the
existing synthetic active-student account. A full-page BEFORE capture was made at the
reference width. No remote user or real student account was used.

Original branch: `codex/prompt-53c-premium-polish`.
Implementation branch: `codex/prompt-53d-shared-reference-layout`.
Base commit: `adffe83e6842387a00ca818354dfabdbd114d4da`.
Substantial earlier uncommitted work was present and preserved. The overall Git diff
is not a Prompt 53D-only diff. No files were staged, committed, pushed or deployed.

## Implementation

- Consolidated the root shell: one full-height sidebar, one compact topbar, one main
  page slot and one mobile navigation dialog. Server pages remain server-rendered.
- Removed the nested student sidebar and old dashboard-specific header overrides.
  Root layout now supplies the same frame to all ordinary pages and safe auth states.
- Added one route configuration, current-route/location styling, local sidebar collapse,
  labelled search, initials and the existing permitted-workspace account menu.
- Dashboard geometry follows the reference: blue equipment hero, compact eligible
  learning row, next-lesson and action panels, a secondary records rail, and wide banner.
- Added Study Support artwork and a Future Engineering city banner. Reused the existing
  pressure artwork, appropriate to the one eligible lesson. All artwork is UI concept
  illustration, never technical evidence or machine construction.
- Existing Home/catalogue lesson and school cards now use the same asset family.
  The pressure lesson's scene alignment starts at the top of its visual region rather
  than stretching grid-row gaps alongside the controls.
- Preserved detailed module progress, prerequisite disclosures, assessment results,
  optional recommendation controls, simulation history, saved records and recovery states.

## Changed Files In This Task

Application changes:

- `apps/web/src/app/layout.tsx`, `apps/web/src/app/globals.css`
- `apps/web/src/features/auth/site-navigation.tsx`
- `apps/web/src/features/app-shell/assets.ts`, `navigation.ts`, `shell.css`
- `apps/web/src/features/student-dashboard/components.tsx`, `dashboard.module.css`
- `apps/web/src/features/curriculum/components.tsx`
- `apps/web/src/features/visual-simulation/visual-simulation.module.css` (top alignment
  of the shared visual viewport only; earlier visual-system changes were preserved)

Assets: `apps/web/public/images/dashboard/future-engineering-banner.webp` (1800 x 600,
79,160 bytes) and `study-support.webp` (480 x 360, 10,272 bytes). Existing wide/compact
pressure images and detail thumbnail are reused. No dependency or lock-file change
was introduced by this task.

Tests: new `features/app-shell/navigation.test.ts` and `tests/e2e/shared-shell.spec.ts`;
adapted existing accessibility, content-governance, curriculum, staging-smoke,
student-dashboard, student-dashboard-experience, dashboard-concept, dashboard-polish
and visual-direction specs to the shared navigation and retained disclosure destinations.
No security assertions were removed or new skips added.

Documentation: the reference spec, route migration matrix, JSON asset manifest, copied
reference image, curated screenshot evidence and this audit. Earlier untracked design,
pilot, simulation and dashboard work remains separate.

## Security And Governance

No changes to authentication, role assignment, RLS, migrations, source approval,
assessment scoring, exact-version matching or engineering calculations. No service key,
answer key or private review payload is passed into the new shell. Account summaries
come from the same no-store, same-origin access endpoint as before. Auth routes suppress
private identity/navigation. Navigation visibility is not an access-control substitute.

The dashboard still uses the existing owner-scoped, publication-filtered server model.
No fabricated completion percentages, streaks, achievements, notifications or student
activity were added. Public hydraulic/Bernoulli routes remain gated. Existing authorised
inspection modes retain their state and history behaviour; the shell does not reset them.

## Visual Comparison

The first rendered rebuild measured 256/880/296 px sidebar/main/rail widths and a 28 px
gap, but the hero was 334 px high and the banner began below 1090 px. Browser inspection
led to a 290 px hero, tighter cards/actions, separate compact greeting and retained
detailed evidence below the first screen. The header was refined from 79.5 to 76 px.
The equipment subject uses containment instead of cropping off the press assembly.

The existing shared simulation grid stretched its heading to roughly 245.8 px beside
the longer control column. Applying `align-content: start` to the visual viewport keeps
the heading at 21 px at 1280 x 900, with the working diagram immediately below. The
final light/dark pressure-lesson captures were refreshed after this fix. No model,
input, equation or simulation state was changed.

Measured geometry at 1536 x 1024, using the existing synthetic active-student service:

| Region               | Actual measurement         | Reference target           |
| -------------------- | -------------------------- | -------------------------- |
| Sidebar              | 256 px                     | 256 px                     |
| Header               | 76 px high, starts at x256 | 76 px high, starts at x256 |
| Main learning column | x296, 880 px wide          | x296, about 880 px wide    |
| Hero                 | y154.5, 880 x 290 px       | y154, about 880 x 290 px   |
| Right rail           | x1204, 296 px wide         | about x1204, 296 px wide   |
| Column gap           | 28 px                      | 28-30 px                   |
| Lower banner         | y926.5, 1204 x 104 px      | about y910, 104 px high    |

The banner is approximately 16.5 px lower than in the supplied image. The single
eligible learning card occupies the first of the four available tracks; the empty
space is not filled with unpublished content. These are measured layout comparisons,
not a claim of pixel identity.

Curated evidence lives in `docs/design/evidence/prompt-53d/`:

- [Before desktop](../design/evidence/prompt-53d/before-desktop.webp)
- [Reference and implementation, left and right](../design/evidence/prompt-53d/target-and-implementation.webp)
- [After desktop, light](../design/evidence/prompt-53d/after-desktop-light.webp)
- [After desktop, dark](../design/evidence/prompt-53d/after-desktop-dark.webp)
- [After mobile, light](../design/evidence/prompt-53d/after-mobile-light.webp)
- [After mobile, dark](../design/evidence/prompt-53d/after-mobile-dark.webp)

The `route-*.webp` images cover Home, Learn, the pressure lesson, Simulation Lab,
assessments, reviewer and owner screens in both themes. All are local synthetic
account evidence. No live student dashboard capture or student record is included.
The refreshed capture session reported zero page-level JavaScript errors. Screenshots
were inspected individually and in an unmasked contact sheet; passing tests alone were
not used as visual approval.

No invented similarity percentage, broad screenshot mask or screenshot-as-page technique
was used. Captures are labelled synthetic service data: the same production components
and local authenticated test provider, not a second dashboard implementation. A separate
four-course synthetic layout was not used to imply those courses are published.

### Intentional Differences From The Reference

- Basic Fluid Pressure and press artwork replace the unavailable pump course/artwork.
- Only one eligible lesson appears; there are no fake cylinder, Bernoulli or thermal cards.
- Recorded completion, programme and activity replace unsupported overall percentages,
  streak charts and achievement awards. Missing values remain unavailable, not zero.
- Study Support links to the real pilot guide; there is no operational AI Mentor.
- The existing Lucide brand mark and system sans-serif stack remain. No font identity
  or asset licence was guessed. Existing 8 px design-system corners remain instead of
  the inferred larger reference corners. Text contrast takes priority over lighter ink.
- Full authenticated names remain accessible; long header names visually truncate and
  can be read in the account menu. Mobile controls stay at least 44 px high.

## Quality Results

| Command / check               | Final result                                             |
| ----------------------------- | -------------------------------------------------------- |
| `npm run scan:secrets`        | PASS, no obvious committed secret values found           |
| `npm run format:check`        | PASS; repeated after final report edits                  |
| `npm run typecheck`           | PASS, all configured workspaces                          |
| `npm run lint`                | PASS, no suppression added                               |
| `npm run validate:content`    | PASS, 29 tests                                           |
| `npm run validate:migrations` | PASS, 24 tests                                           |
| `npm run test:unit`           | 435 passed; 5 existing live-staging tests skipped        |
| `npm run build`               | PASS, production build and route generation              |
| `npm run ci`                  | PASS, the aggregate command above exited 0 on 2026-09-08 |
| `npm run test:e2e`            | PASS, 164 tests, zero failures, 12.9 minutes             |
| `git diff --check`            | PASS                                                     |

The five integration skips are the existing opt-in
`packages/database/src/staging-database.integration.test.ts` suite, requiring explicit
staging student tokens and profile IDs. They are not counted as passes. The browser
suite uses the existing local account service with all Supabase connection values
blank; it does not verify live staging RLS or production identity data.

The final full browser run includes the last viewport fix and all five new shared-shell
tests. Coverage includes seven widths (320, 375, 430, 768, 1024, 1280, 1536), both themes,
a 1536 x 650 short desktop, 200% text, decoded images, keyboard navigation, mobile focus
containment, theme persistence, the shared staff frame, private records, publication
isolation and protected assessment journeys. The WCAG-tagged axe scans reported zero
violations on their tested states. This is automated coverage, not accessibility certification.

The smoke and accessibility specifications are included in the full E2E run; they were
not separate additional runs. The initial and corrected partial runs described below
are not added to the final pass count.

### Performance Sample

The final dashboard test measured an authenticated reload of the local production-mode
build under reduced motion, using the existing synthetic service account:

| Measurement                     | Recorded value |
| ------------------------------- | -------------- |
| DOM content loaded              | 257.7 ms       |
| Encoded document body           | 11,335 bytes   |
| JavaScript chunk requests       | 10             |
| Encoded JavaScript chunk bodies | 150,153 bytes  |
| Matching 3D renderer requests   | 0              |
| Dashboard canvas elements       | 0              |

This is one local reload sample, not a cold-load benchmark or field Core Web Vitals.
Resource counts are observed requests, not a static bundle-size guarantee. The two new
WebP assets total 89,432 source bytes; the image optimiser may serve different encoded
sizes. The hero loads deliberately, while lower images remain lazy. Existing simulation
view tests confirm that 3D is explicitly loaded and state survives representation changes.
No controlled before/after performance delta was measured or claimed.

Non-blocking output included the existing `NO_COLOR`/`FORCE_COLOR` warning and the
intentional simulated dashboard database error from the passing recovery test. Neither
was suppressed. No real database failure was inferred from that synthetic error.

### Failed-Run History

An intermediate formatting pass rejected transient JSX syntax during the layout
reorganisation; it was corrected before the first successful build. A later manifest
test triggered the repository's unsafe-`any` lint rule; parsed data now stays `unknown`
and is compared directly with the typed manifest. No lint suppression was introduced.

The first full browser run completed with 158 passes and six failures in 8.2 minutes:

- Three phone header cases exposed missing visible mobile branding and ambiguous old
  text selectors. A compact branded home link was added, and tests target that control.
- The owner-menu test matched both the fixture's display name and role (both "Platform
  Owner"). It now verifies the role field specifically, with the same visibility check.
- Reverse Tab from the first native-dialog control could move focus toward browser
  chrome. Explicit first/last keyboard wrapping was added without disabling modality
  or Escape. The original containment assertion remains.
- The smoke test's unscoped school-link selector matched the new sidebar and catalogue.
  It now verifies the real catalogue action inside `main`.

No test failure was ignored, no test was marked skipped, and no production security
control was relaxed to obtain a pass. A second full run was interrupted; its partial
output is not counted as a successful suite. The final run starts from a fresh build
and includes the last visual-viewport alignment regression check.

## Known Limitations

- Local synthetic testing is not live Supabase, production verification or a student
  usability study. No production deployment occurred.
- Five pre-existing live-database integration tests need separate staging credentials
  and are not enabled by this frontend task.
- Browser testing uses Chromium with responsive viewports, not physical-device,
  Safari/Firefox or manual screen-reader certification.
- Initial Next.js streamed application startup still requires JavaScript. The native
  rendered-markup resilience test is not a claim of no-script cold-start support.
- Artwork is concept art, not reviewed technical anatomy or simulated state.
- Asset/request observations are local measurements, not field Core Web Vitals.

## Remaining Verification

To close the PARTIAL verification status, use an authorised student session against an
approved non-production environment for a separate, clearly labelled live-data capture.
Keep it distinct from the synthetic screenshots in this report and exclude unnecessary
personal information. Configure the existing opt-in staging integration suite through
the approved private environment workflow and record its five results. Do not seed real
students, grant roles, approve content or deploy production merely to obtain this evidence.

No further frontend implementation is identified as blocked by these two verification
items. Human visual acceptance of the measured reference differences is still appropriate
before any separate staging promotion task.

## Handover

Local preview: `http://127.0.0.1:3165/dashboard`, isolated existing test-auth mode.
No earlier preview was terminated to obtain this port. The test account is
`active.student@example.test` with password `IndustrialLearn1!`; these are deliberately
synthetic local credentials and are not Supabase accounts.

Ready-to-inspect route groups are listed in
`docs/design/frontend-route-migration-matrix.md`. Public routes include `/`, `/learn`,
`/learn/core-engineering`, `/learn/future-engineering`, `/lessons/basic-fluid-pressure`
and `/simulations`. `/dashboard` and `/assessments` need local test sign-in. Staff routes
need an existing authorised synthetic role; no role is granted by the shared shell.
