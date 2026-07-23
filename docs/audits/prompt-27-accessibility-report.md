# Prompt 27 Accessibility Report

## Scope

Browser-level accessibility and responsive UI audit for representative Industrial Learn routes and states.

Standard targeted: WCAG 2.2 Level AA where applicable. This report is not a formal legal certification.

## Routes And States Tested

| Route or State                              | State Tested                                                               |
| ------------------------------------------- | -------------------------------------------------------------------------- |
| `/`                                         | Public homepage                                                            |
| `/auth/sign-in`                             | Authentication form                                                        |
| `/auth/forgot-password`                     | Password reset form                                                        |
| invalid sign-in                             | Authentication error                                                       |
| `/learn`                                    | Learn catalogue                                                            |
| `/learn/core-engineering`                   | Core Engineering catalogue                                                 |
| `/learn/future-engineering`                 | Future Engineering catalogue                                               |
| `/programmes/mechanical-foundations`        | Programme page                                                             |
| `/programmes/mechanical-foundations/year/1` | Semester/year page                                                         |
| `/modules/fluid-mechanics-foundations`      | Module page                                                                |
| `/lessons/basic-fluid-pressure`             | Lesson page with equations and tables                                      |
| `/dashboard`                                | Authenticated active student dashboard                                     |
| `/assessments`                              | Authenticated protected placeholder                                        |
| `/simulations/history`                      | Authenticated protected placeholder                                        |
| `/author`                                   | Authenticated content-author workspace                                     |
| `/review`                                   | Authenticated engineering-review workspace                                 |
| `/internal/design-system`                   | Component states, tabs, modal, drawer and simulation controls              |
| access denied routes                        | Existing auth denial coverage                                              |
| loading and error states                    | Existing route components reviewed; dashboard error remains covered by E2E |

## Issue Inventory And Fixes

| Finding                                                                                                            | Severity | Evidence                                                                              | Fix                                                                                                                               | Remaining Risk                                                                   |
| ------------------------------------------------------------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Primary orange action buttons failed WCAG AA contrast with white text.                                             | High     | Axe `color-contrast`, ratio 3.55:1 on `.il-button--primary` and `.curriculum-action`. | Darkened the brand action orange token to improve contrast while preserving the white/orange brand.                               | Re-check future custom colour additions.                                         |
| Global navigation used homepage-only anchor links on all routes.                                                   | High     | Header links targeted `#schools`, `#foundation`, `#status` even on non-home routes.   | Replaced with real application routes: Home, Learn, Core Engineering, Future Engineering and Dashboard.                           | Active route styling can be added later.                                         |
| Modal and drawer examples lacked verified focus management.                                                        | High     | Reusable components rendered dialogs without scoped focus or trigger return.          | Added client `FocusScope`, Escape dismissal support and trigger focus return; demo overlays are explicitly opened by buttons.     | Future production dialogs need the same pattern and manual screen-reader checks. |
| Tabs exposed ARIA tab roles without keyboard arrow behaviour.                                                      | High     | Playwright keyboard test showed ArrowRight did not move focus/selection.              | Added client `AccessibleTabs` with ArrowLeft, ArrowRight, Home, End and click selection.                                          | Future tab variants must reuse this component.                                   |
| Fault/auth errors were not reliably queried as app alerts because the Next route announcer also uses `role=alert`. | Medium   | Test initially matched empty Next route announcer.                                    | Fault-tone alerts now default to `role="alert"` and tests target the app alert text.                                              | Keep alert announcements concise to avoid noise.                                 |
| Lesson equation visual token referenced a missing CSS variable.                                                    | Medium   | CSS used `--il-color-state-hydraulic`, which was undefined.                           | Replaced with `--il-color-domain-hydraulic`.                                                                                      | None known.                                                                      |
| Long source IDs, equations, and dashboard rows risked overflow on narrow screens/zoom.                             | Medium   | Manual CSS review and responsive test planning.                                       | Added wrapping, `min-width: 0`, scrollable equation/table containers and overflow checks at 320, 375, 430, 768, 1024 and 1366 px. | Complex future diagrams may still require designed scroll/zoom controls.         |
| Dark appearance demo inherited light text colour.                                                                  | High     | Axe contrast failure on dark demo section.                                            | Applied text colour inheritance for `[data-theme="dark"]`.                                                                        | Re-check future dark themed nested surfaces.                                     |

## Tests Added

- `tests/e2e/accessibility.spec.ts`

Coverage includes:

- Axe scans for public and authenticated routes.
- Skip link focus.
- Authentication alert announcement.
- Modal focus, Escape dismissal and focus return.
- Drawer focus, Escape dismissal and focus return.
- Tabs keyboard behaviour.
- Reduced-motion scroll behaviour.
- Mobile/no-horizontal-overflow checks at six viewport widths.
- Lesson equation and symbol-table accessibility.
- Simulation control labelling through the design-system route.
- Dashboard progress labelling.

## Commands Executed

- `npm install --save-dev @axe-core/playwright --package-lock-only --ignore-scripts`
- `npm install --save-dev @axe-core/playwright --ignore-scripts`
- `npm run typecheck`
- `npm run lint`
- `npm run test:unit -- --run packages/design-system/src/components.test.tsx`
- `npm run build`
- `npx playwright test tests/e2e/accessibility.spec.ts`
- `npm run format`
- `npm run format:check`
- `npm run test:unit`
- `npm run test:e2e`

## Final Results

- Formatting: passed.
- Type checking: passed.
- Linting: passed.
- Unit tests: passed, 16 files and 139 tests.
- Production build: passed.
- Accessibility E2E spec: passed, 25 tests.
- Full E2E suite: passed, 52 tests.

## Dependency Note

Added `@axe-core/playwright` as a dev dependency for automated browser-level accessibility scans. The dependency is documented in `docs/architecture/dependency-rationale.md`.

`npm install` reported 1 moderate and 2 high dependency audit findings. They were not remediated in this task because dependency security remediation may require breaking updates outside the accessibility audit scope.

## Remaining Limitations

See `docs/accessibility/known-limitations.md`.

## Recommended Next Prompt

Perform a manual screen-reader and keyboard walkthrough of the first complete lesson, assessment and simulation once the production simulation and graded assessment pages are built.
