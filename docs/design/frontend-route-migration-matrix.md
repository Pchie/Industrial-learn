# Frontend Route Migration Matrix

Prompt 53D, 2026-09-07. All page files below inherit the one server root layout and
shared sidebar/topbar/mobile dialog. Existing paths, loaders and authorisation remain.
No dashboard charts were inserted into non-dashboard pages. API/redirect handlers do
not render a page shell and are intentionally excluded.

| Routes                                                                                                                             | Treatment                                                                         | Access/content boundary                           |
| ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------- |
| `/`                                                                                                                                | Shared frame, existing governed visual feature; image-led lesson and school cards | Public eligible content only                      |
| `/learn`, `/learn/core-engineering`, `/learn/future-engineering`                                                                   | Same frame and image-led cards; existing catalogue filters/search                 | Existing publication filter                       |
| `/learn/pilot`                                                                                                                     | Same frame, existing approved path                                                | No new approvals                                  |
| `/programmes/[programmeSlug]`, `/programmes/[programmeSlug]/year/[year]`                                                           | Same frame, existing hierarchy                                                    | Existing governed module selection                |
| `/modules/[moduleSlug]`, `/pathways/[pathwaySlug]`                                                                                 | Same frame, existing content or honest not-found                                  | Draft direct URLs still denied                    |
| `/lessons/[lessonSlug]`                                                                                                            | Same frame around working visual-first engine                                     | Reviewed content and depth unchanged              |
| `/simulations`                                                                                                                     | Same frame around registry-driven laboratory                                      | Unpublished simulations still absent              |
| `/simulations/[simulationSlug]`, `/simulations/[simulationSlug]/[viewMode]`                                                        | Same frame and existing view-state logic                                          | Direct route publication check retained           |
| `/simulations/history`                                                                                                             | Same frame, existing owned history                                                | Authenticated owner scope                         |
| `/simulations/[simulationSlug]/attempt/[attemptId]`, `/simulations/[simulationSlug]/attempt/[attemptId]/review`                    | Shared frame plus existing focused controls and exit                              | Attempt ownership unchanged                       |
| `/dashboard`                                                                                                                       | Reference composition; no second sidebar                                          | Existing dynamic/no-store projection              |
| `/dashboard#saved`, `/dashboard#results`                                                                                           | Real fragment destinations; saved empty state added                               | Same owned dashboard, no new route/data query     |
| `/my-learning`                                                                                                                     | Same frame around existing protected content                                      | No new learning backend                           |
| `/assessments`, `/assessments/[assessmentSlug]`                                                                                    | Same frame, focused existing assessments                                          | Governed exact-version selection                  |
| `/assessments/[assessmentSlug]/attempt/[attemptId]`, `/assessments/[assessmentSlug]/attempt/[attemptId]/review`                    | Existing answering/review surfaces, same frame                                    | Server scoring and answer protection unchanged    |
| `/projects`                                                                                                                        | Same frame around existing protected project content                              | No fake portfolio/build workflow                  |
| `/account/access`, `/workspace`                                                                                                    | Same frame and compact identity/workspace controls                                | Existing capability response                      |
| `/author`, `/review`, `/review/[lessonSlug]`                                                                                       | Same typography/frame, existing evidence and review actions                       | Independent review and permissions unchanged      |
| `/owner`, `/admin`, `/admin/users`, `/lecturer`                                                                                    | Same frame, operational tables/actions remain                                     | No new roles or student-data permission           |
| `/preview/lessons/[lessonSlug]`                                                                                                    | Same frame and explicit preview status                                            | Privileged preview gate unchanged                 |
| `/internal/simulations/[simulationSlug]/[[...view]]`, `/internal/visual-simulation-lab`                                            | Shared frame around protected inspection tools                                    | Existing role gates; no public publication bypass |
| `/internal/design-system`                                                                                                          | Shared frame around private demonstration controls                                | Existing route/environment gate                   |
| `/auth/sign-in`, `/auth/sign-up`, `/auth/verify`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/error`, `/auth/sign-out` | Public-safe same branding, search and navigation                                  | No identity/private workspace links on auth pages |
| Root not-found/error/loading; nested dashboard/learn/modules/pathways/lessons/simulations/assessments/author/review states         | Inherit root frame, retain working recovery actions                               | No newly exposed data                             |

## Inspection Evidence

The shared-shell browser suite captures Home, Learn, both schools, the approved pressure
lesson, Simulation Lab, assessments, projects, account, author, reviewer and owner pages
in both themes. Existing suites exercise protected previews, live local attempt flows,
advanced simulation views and direct-link denial. The dashboard has a seven-width
320/375/430/768/1024/1280/1536 matrix plus a short desktop and larger text.

No live reviewer or owner account was used. Public hydraulic and Bernoulli student
routes intentionally remain unavailable; authorised local review previews are the
existing inspection path. No permission was weakened to obtain a screenshot.

Saved is a dashboard fragment, not a newly invented `/saved` route. Achievements,
notifications, study groups and AI Mentor have no new operational route.
