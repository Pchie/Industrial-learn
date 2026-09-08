# Reference Dashboard V2 Verification

Date: 2026-09-08.

Status: local implementation and verification complete. The shared live-data layout
and guarded reference preview are ready for visual review. No production release or
engineering approval is implied.

## Scope

The user requested a closer visual match to the supplied 1536 x 1024 concept and
approved an honest live dashboard plus an explicitly fictional reference preview.
The initial Prompt 53D implementation was visually rechecked before editing.

The existing branch is `codex/prompt-53d-shared-reference-layout`, with base commit
`adffe83e6842387a00ca818354dfabdbd114d4da`. Earlier uncommitted work was preserved.
No files were staged, committed, pushed or deployed in this refinement.

## Changes

- Extracted a shared dashboard overview, backed by the existing live model or guarded
  fictional presentation data.
- Replaced the sparse one-card row with one published lesson and its three existing
  activity entry points; no unavailable curriculum is published.
- Added a four-panel records rail with explicit evidence/denominator boundaries.
- Refined shared typography, navigation, search, account controls and spacing.
- Added local Inter font/licence and seven optimised original concept illustrations.
- Preserved existing lower-page learning functions and all server access boundaries.

Source files are limited to the shared shell, theme tokens, dashboard presentation,
the internal reference route, associated assets and tests. No engineering equations,
lesson content, migrations, scoring, RLS or authentication providers were changed by
this refinement.

## Comparison And Evidence

The first browser pass measured the same 256/76/880/296 px frame and a 290 px hero.
It revealed delayed artwork decoding in the capture and a streamed-page timing issue
in the demo header. Both were corrected before final verification. The hero framing
was adjusted to keep the equipment clear of the text.

Final browser evidence is in `docs/design/evidence/reference-dashboard-v2/`:

- [Reference left, demo right](../design/evidence/reference-dashboard-v2/reference-and-demo.webp)
- [Reference left, live-data layout right](../design/evidence/reference-dashboard-v2/reference-and-live.webp)
- [Demo desktop](../design/evidence/reference-dashboard-v2/demo-1536-light.webp)
- [Live-data desktop](../design/evidence/reference-dashboard-v2/live-1536-light.webp)
- [Demo mobile](../design/evidence/reference-dashboard-v2/demo-375-light.webp)
- [Live-data mobile](../design/evidence/reference-dashboard-v2/live-375-light.webp)
- [Before refinement](../design/evidence/reference-dashboard-v2/before-desktop.webp)
- [Measured geometry](../design/evidence/reference-dashboard-v2/geometry.json)
- [Short desktop window](../design/evidence/reference-dashboard-v2/short-sidebar.png)
- [Collapsed sidebar](../design/evidence/reference-dashboard-v2/collapsed-sidebar.png)

Both themes were captured at 1536 x 1024 and 375 x 900 after font loading and image
decoding. The captures use local synthetic accounts and the production-mode build,
not live Supabase students. The capture session reported zero page-level JavaScript
errors. Comparisons are unmasked and contain the mandatory fictional-data notice.

| Region        | Final measured layout                    | Supplied reference                      |
| ------------- | ---------------------------------------- | --------------------------------------- |
| Sidebar       | 256 px                                   | 256 px                                  |
| Header        | 76 px high, x256                         | 76 px high, x256                        |
| Hero          | x296, y155, 880 x 290 px                 | approximately x297, y154, 880 x 290 px  |
| Right rail    | x1204, y97, 296 x 803 px                 | approximately x1205, y97, 296 x 803 px  |
| Learning row  | y465, four 200 px tracks with 20 px gaps | approximately y465, four 200 px cards   |
| Lower panels  | x296, y708, 862 x 182 px                 | approximately x297, y708                |
| Future banner | x296, y910, 1204 x 104 px                | approximately x297, y910, 1204 x 104 px |

The original large empty learning row is gone. The hero uses a substantial,
right-aligned equipment image with legible text on the left. Real records retain
honest status and scoped progress wording. The demo follows the reference composition
without making its fictional course availability or AI functionality real.

The generated artwork, initials avatar, Lucide glyphs, 8 px corners and mandatory demo
label remain deliberate differences; no unsupported "100% pixel match" score is claimed.

## Quality Results

Executed results:

| Check                | Result                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------ |
| Secret scanning      | PASS                                                                                             |
| Formatting           | PASS after correcting a non-idempotent first formatting pass on a multiline CSS grid declaration |
| Strict type checking | PASS                                                                                             |
| Linting              | PASS                                                                                             |
| Content validation   | 29 passed                                                                                        |
| Migration validation | 24 passed                                                                                        |
| Full unit suite      | 440 passed; 5 existing live-staging checks skipped                                               |
| Production build     | PASS                                                                                             |
| Full browser suite   | 169 passed in 26.1 minutes; no retries or skipped browser cases                                  |
| Final preview checks | 3 passed in 2.3 minutes after the last demo-only CSS correction                                  |

The initial focused browser suite passed 18/19. It exposed a same-page progress-link
highlight regression caused by client routing not emitting a native hash-change event.
The link was restored to native anchor behaviour; the unchanged regression assertion
is included in the final full run. Early strict optional-property/import errors were
also corrected. Failures are not suppressed or counted as passing.

The first full browser run passed 162/166. Three tests exceeded their 30-second
budget while each scanned two lengthy lessons in both themes. They were split into
six independently reported lesson/width cases, retaining both theme scans, screenshots
and every assertion. No timeout was increased and no check was skipped. The fourth
failure expected the previous hero background colours. Its precise colour assertions
now specify the selected reference blue (`#0e43ba`) in both themes; its focus, hover,
accessible-image and non-fictional-data assertions remain intact.

The final in-app visual inspection also identified a floating demo notice covering a
heading on a narrow window. The notice now occupies normal page flow below the
desktop breakpoint, with a regression assertion checking that it ends before the
welcome heading. A subsequent regression check proved that a short desktop's
scrolling area extended behind the notice (bottom 650 px versus notice top 614 px).
The demo now reserves a footer outside the scroll area, compensating the old bottom
padding to preserve the reference composition. The notice also moves into page flow
when the sidebar is collapsed. This final fix is demo-only; no live data or source
logic changed. The new short-window/collapsed-sidebar case was observed failing
before this correction.

The first post-correction preview run passed the layout and new sidebar checks but
hit the existing five-second redirect assertion during concurrent fresh-server and
screenshot loading. An isolated rerun passed all three unchanged preview tests.
This comprises two cases already in the 169-test full suite plus one new regression,
not 172 distinct tests. The full 169-case pass preceded only the final demo disclosure
CSS adjustment; all affected preview cases were then rerun on the final build.

The focused follow-up launcher exceeded its existing 120-second server-start budget
before any tests executed. The final production-mode build was therefore run separately,
followed by the existing browser command against a separately started loopback server
on port 3100 with the exact local test configuration from `playwright.config.ts`.
The startup timeout and test timeouts were not changed.

A verification setup error also applied `INDUSTRIAL_LEARN_E2E=true` to a second CI
invocation, suppressing the log expected by one monitoring unit test (439 passed,
1 failed, 5 skipped). This was corrected by rerunning `npm run test:unit` in its normal
environment: 440 passed, 5 existing opt-in staging checks skipped. No monitoring
implementation or test assertion was changed. Browser-only configuration was then
limited to the build and local servers.

### Commands Executed

- `npm run ci`: initial normal-environment pass; later final-source checks also passed
  secret scanning, formatting, type checking, linting, content validation and migration
  validation before the environment-related unit failure described above.
- `npm run test:unit`: final normal-environment pass, 440 passed and 5 skipped.
- `npm run build`: final standalone production-mode pass with local synthetic browser
  configuration; compilation 15.5 seconds, TypeScript 113 seconds, 39 static pages.
- `npm run test:e2e`: first full run 162 passed and 4 failed; complete rerun 169 passed.
- `npx --no-install playwright test tests/e2e/reference-dashboard.spec.ts`: final
  isolated run passed all 3 checks after the last disclosure-only CSS fix.
- `npx --no-install eslint tests/e2e/reference-dashboard.spec.ts`: PASS after adding
  the final regression case; the production TypeScript build also passed again.
- Targeted Playwright runs: initial 18/19 plus the startup-aborted follow-up described above.
- Existing Prettier formatting/checks, `git diff --check`, and staged-file inspection.
- Local screenshot capture after `document.fonts.ready` and image decoding, plus direct
  in-app inspection of the refreshed page and mobile navigation.

The local review server is `http://127.0.0.1:3166`, with the guarded reference at
`/internal/reference-dashboard` and the existing live-data presenter at `/dashboard`.
The preview was visually rechecked after the last CSS correction. It is not a cloud
deployment, and its sessions use synthetic local fixtures.

Chromium's platform-font inspection confirmed `Inter Variable` as a custom font.
The self-hosted font is 352,240 bytes; seven new WebP concept assets total 269,780
bytes on disk. These are asset sizes, not total page transfers or field performance.
The demo assets are not all loaded by the live dashboard.

The final complete-suite dashboard sample measured DOM content loaded at 546 ms,
13,733 response bytes, 10 script requests and 151,159 encoded script bytes, with zero
3D renderer requests. See the [raw measurement](../design/evidence/reference-dashboard-v2/dashboard-metrics.json).
These are one local production-mode sample under synthetic authentication, not field
Core Web Vitals or a guarantee about cloud/mobile-network performance.

## Limitations

- The reference contains fictional course/progress/AI data. It appears only in the
  guarded local demo, never as real student records or operational AI.
- Artwork and Lucide icons are original approximations, not extracted source assets;
  the initials avatar and mandatory demo label intentionally differ.
- Local synthetic sessions verify presentation and access-control regressions, not
  a new live Supabase or production deployment.
- Existing opt-in staging database tests require private live staging credentials.
- The working tree contains earlier unrelated work; this is not a clean standalone
  release or a request to push.
