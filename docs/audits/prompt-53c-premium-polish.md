# Prompt 53C: Premium Dashboard Polish

Date: 2026-09-07. Status: complete for the requested UI-polish scope.

## Design Audit

This is an implementation self-review against the user's concept image, not an
independent finding that software can reliably identify human-made design.

| Before                                                 | Refinement                                                      |
| ------------------------------------------------------ | --------------------------------------------------------------- |
| Hero and cards entered together                        | Short finite stagger establishes reading order                  |
| Hover existed, but press feedback was absent           | 1 px press response with stable control dimensions              |
| In-page navigation kept Dashboard selected             | Location-aware study selection and native history               |
| Native disclosures snapped                             | Progressive intrinsic-size expansion, native fallback           |
| Theme change had no interaction feedback               | Brief appearance-icon settle; readable immediate palette change |
| Tiny technical thumbnail contrasted with polished hero | Matching concept-detail crop, labelled honestly                 |
| Quick actions used almost identical backgrounds        | Blue lab, teal checks and neutral progress treatment            |
| Lesson state was loose text                            | Compact word/icon/rule chip, with unavailable state preserved   |
| Plain hero metadata and uniform snapshot edges         | Small metadata chips and distinct blue/teal record accents      |
| Practice fallback sounded administrative               | Shorter student-facing copy, same eligibility meaning           |

No fake metrics, decorative running simulation, new curriculum, publication bypass,
assessment-answer path or student-data query is introduced.

## Scope

Changed dashboard components/styles; extracted a small study-link client component;
refined shared motion tokens, button/tab styles and theme-switch feedback; added
one local WebP and focused browser tests. No new dependency or lock-file change is
part of this increment. All existing data/engineering/authentication code is retained.

New deliverables:

- `docs/design/dashboard-motion-and-illustration-guidelines.md`
- This report
- `apps/web/public/images/dashboard/pressure-contact-detail.webp`
- `apps/web/src/features/student-dashboard/study-links.tsx`
- `tests/e2e/dashboard-polish.spec.ts`

Existing files refined in this increment:

- `apps/web/src/features/student-dashboard/components.tsx`: companion illustration,
  state labels, native fragment links and extracted study navigation.
- `apps/web/src/features/student-dashboard/dashboard.module.css`: motion, framing,
  chips, surface accents and progressive native disclosure transitions.
- `apps/web/src/app/globals.css`: shared control press, appearance-icon animation and border transitions.
- `packages/design-system/src/styles.css`: motion tokens and shared button/tab details.
- `packages/design-system/src/tokens.ts`: matching exported motion token references.

Five curated comparison images are under `docs/design/evidence/prompt-53c/`.
They are documentation only and are not loaded by the application.

## Verification

| Command/check                             | Result                                                                             |
| ----------------------------------------- | ---------------------------------------------------------------------------------- |
| `npm run ci`                              | PASS, repeated after the final application change                                  |
| `npm run scan:secrets`                    | PASS                                                                               |
| `npm run format:check`                    | PASS                                                                               |
| `npm run typecheck`                       | PASS across workspaces                                                             |
| `npm run lint`                            | PASS                                                                               |
| `npm run validate:content`                | PASS, 29 tests                                                                     |
| `npm run validate:migrations`             | PASS, 24 tests                                                                     |
| `npm run test:unit`                       | PASS, 432 tests; five pre-existing live-staging tests skipped                      |
| `npm run build`                           | PASS; dashboard remains dynamic                                                    |
| `npm run test:e2e`                        | PASS, 159 tests in 9.9 minutes before the final theme-contrast refinement          |
| Final appearance/accessibility regression | 91 passed; one script-pause instrumentation timeout, corrected in the test fixture |
| Corrected polish suite, repeated twice    | PASS, all eight tests twice: 16 executions in 2.1 minutes                          |
| `git diff --check`                        | PASS at implementation checkpoint                                                  |

The five skipped unit/integration cases are in
`packages/database/src/staging-database.integration.test.ts`; this local visual task
does not enable privileged live staging verification. Browser checks use synthetic
accounts with Supabase credentials blank, not real student/reviewer accounts.

The final appearance selection ran these six specs: `accessibility`, `dashboard-concept`,
`dashboard-polish`, `premium-frontend`, `student-dashboard-experience` and
`visual-direction`, using `npx playwright test` with their `tests/e2e/*.spec.ts` paths.
It covered 92 scenarios. Following its test-instrumentation correction, the exact
command was `npx playwright test tests/e2e/dashboard-polish.spec.ts --repeat-each=2`.
No application code changed between the 91 successful appearance checks and that
16-execution passing rerun. The one corrected scenario and all other new polish
scenarios passed twice; this is not being represented as a single 92-test green batch.
The earlier failed runs remain documented below. No pre-existing tests were skipped
or removed, and no production/security control was relaxed.

Final coverage includes six widths (320, 375, 430, 768, 1024 and 1440 px) for new and
returning students in Light and Dark; 200% text; keyboard navigation/history; reduced
motion; disclosures; tab focus; theme persistence; frame-level heading colour;
actual decoded/lazy images; honest missing-data states; and 46 accessibility tests.
The full earlier regression also passed owner isolation, hidden-answer protection,
publication checks, assessment attempts and smoke tests. These are local synthetic
checks, not a new staging or production verification.

Non-blocking logs: terminal colour-variable warnings, and the intentional simulated
dashboard database-failure error in its passing recovery test.

## Before Evidence

Captured from the existing local Prompt 53B build with the same synthetic active-student
account, before these edits:

- `/tmp/industrial-learn-53c/before-desktop.png` (1440 px)
- `/tmp/industrial-learn-53c/before-mobile.png` (375 px)
- `/tmp/industrial-learn-53c/before-metrics.json`

That sample observed 14 JavaScript resources, 153,715 encoded bytes and 396 DOM nodes.
It includes navigation/prefetch timing and is not a controlled field benchmark.

### Curated Comparison

These repository-owned WebP captures use a synthetic account, not private student data.
They are deliberate design evidence, separate from disposable test reports. Each pair
uses the same width and light theme; a dark phone view is also retained.

| View             | Before                                                              | After                                                             |
| ---------------- | ------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Desktop, 1440 px | [Before desktop](../design/evidence/prompt-53c/before-desktop.webp) | [After desktop](../design/evidence/prompt-53c/after-desktop.webp) |
| Mobile, 375 px   | [Before mobile](../design/evidence/prompt-53c/before-mobile.webp)   | [After mobile](../design/evidence/prompt-53c/after-mobile.webp)   |

[Dark mobile comparison](../design/evidence/prompt-53c/after-mobile-dark.webp).
Additional inspected tablet captures are `/tmp/industrial-learn-53c/after-1024-light.png`
and `/tmp/industrial-learn-53c/after-1024-dark.png`. At the initial visual checkpoint,
375, 1024 and 1440 px measured zero horizontal overflow in both themes.

## Failed-Run History

The first focused run had 11 passes and two failures. A quick action used Next's
client-side fragment navigation without producing the native hash event used by the
new selection indicator. Fragment links now use native anchors; the rerun passed
location selection and browser-back checks. The pointer test also sampled before
the initial entrance had settled; direct inspection confirmed the real pressed
state, and the test now waits for the finite entrance and targets the settled control.
It still asserts the full press transform, unchanged dimensions and release behaviour.

A later frame-by-frame check found the proposed body-text colour transition could
lag the immediate page background change, briefly reducing readability. Large reading
surface/text fades were removed. Theme motion now lives in the appearance icon and
borders; a six-frame heading-colour assertion guards against reintroducing the lag.
This refinement requires the final rebuild and regression results recorded above.

The second focused run had seven passes and one failure in an additional no-JavaScript
cold-load experiment. The existing streamed dashboard remains on its loading state
when initial scripts are disabled. No auth or rendering architecture was changed to
mask this. Full no-JavaScript startup is documented as unsupported; the scoped native
control resilience test uses the actual rendered markup/styles in a JavaScript-disabled
component fixture and checks keyboard fragment navigation and disclosures. This is
not a claim that cold application startup works without JavaScript, nor is the fixture
used as authentication/security evidence. No pre-existing test was removed or weakened.

The first post-contrast appearance run had 91 passes and one timeout in the optional
live script-pause test. Pausing a running Chromium page's JavaScript also interfered
with automation's stability/focus polling; a keyboard-only live-pause probe hit the
same instrumentation limit. The final test uses a context configured without scripts
from the outset and the already-rendered component markup. This preserves the native
control assertions without pausing the automation runtime. The full new-polish test
file is rerun twice after this test-only correction; application code is unchanged.

## Repository Boundary

Branch: `codex/prompt-53c-premium-polish`, created from the previous local dashboard
branch. Starting commit: `adffe83e6842387a00ca818354dfabdbd114d4da`.
Substantial earlier uncommitted work remains untouched; the complete Git diff is not
attributable to this task. Nothing has been committed, pushed or deployed.

## Performance And Local Preview

The final production-mode local preview is `http://127.0.0.1:3164/dashboard`.
It runs with the existing synthetic local-auth provider and blank Supabase runtime
credentials. Older previews were not stopped. The same synthetic returning-student
login used for the before capture successfully loaded the final page; both images
decoded, the thumbnail was lazy, no canvas existed and no page errors were recorded.
The quick-action Progress link also selected the correct study-navigation location.

| Observed local sample             | Before      | After   |
| --------------------------------- | ----------- | ------- |
| JavaScript resources              | 14          | 14      |
| Encoded JavaScript bytes          | 153,715     | 154,966 |
| DOM elements                      | 396         | 379     |
| Running animations after settling | Not sampled | 0       |
| New thumbnail source bytes        | None        | 21,022  |

The sample used the same sign-in/viewport/theme/screenshot sequence. The observed
JavaScript difference is 1,251 bytes, but network cache/prefetch timing makes this a
local observation, not an isolated bundle delta or a field speed claim. The small
navigation component receives only a saved-content availability boolean, not student
records. Motion itself uses CSS, no framework, requestAnimationFrame loop or persistent
GPU layer. The new thumbnail is 960 x 480 WebP with responsive lazy loading; existing
wide/compact hero selection is retained. No simulation engine is added to the dashboard.

Evidence: `/tmp/industrial-learn-53c/after-metrics.json`,
`/tmp/industrial-learn-53c/final-desktop.png` and
`/tmp/industrial-learn-53c/theme-frames.json`. The final frame capture kept the correct
dark-theme heading colour through all six sampled frames, without the former lag.
The metrics and decoded-image checks were repeated on the contrast-corrected build.
Timing under real student hardware and
network conditions still requires field testing; no field Core Web Vitals claim is made.

## Known Limitations

- Concept artwork is not reviewed technical construction or simulated state.
- Native disclosure animation depends on browser support; native operation does not.
- Browser automation is Chromium-based with responsive viewports, not physical-device
  or Safari/Firefox certification.
- Local UI checks do not constitute live Supabase verification or a student usability study.
- Initial dashboard delivery still needs the existing Next.js streaming scripts;
  a completely JavaScript-disabled cold load is not supported by this architecture.
- No claim of field Core Web Vitals, manual screen-reader certification or literal
  human illustration authorship is made.
