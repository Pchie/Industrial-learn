# Website Design Consistency

## Reference

The accepted reference remains `docs/design/reference-dashboard-v2.md`. This pass
extends its white surfaces, blue actions, restrained teal and semantic accents,
self-hosted Inter typography, 8px-or-smaller framing, and shared sidebar/header to
the inner pages. It does not replace the dashboard or introduce a second shell.

## Page Families

| Family                                 | Presentation                                                                                                                           |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Home and learning discovery            | Compact heading, existing engineering artwork, clear learning destinations, publication-filtered lesson cards                          |
| Schools                                | Full-width image band using existing Core/Future artwork, followed by real disciplines and programmes                                  |
| Programme, year, module and pathway    | Common headings, readable metadata, prerequisite states and consistent individual cards                                                |
| Pilot                                  | Image-led introduction and three ordered steps; lesson and assessment availability checks unchanged                                    |
| Lesson                                 | Existing engineering visual remains first; compact header, optional theory and source records remain intact                            |
| Simulation catalogue                   | Existing cylinder artwork, search, discipline navigation, filters and truthful availability states                                     |
| Simulation detail, attempt and history | Existing model/visual/control system; consistent page width, headings, measurements, history and return navigation                     |
| Assessments                            | Image-led catalogue, compact overview, clear question groups and selected-answer states; no added artwork or hints in graded questions |
| Authentication                         | One framed form surface, a lightweight existing image strip, consistent labels, recovery links and feedback                            |
| Student utility pages                  | Real destinations for learning; explicit project-workspace preparation state, not invented project data                                |
| Staff workspaces                       | Compact identity and access strip, role-specific icons, real queue counts and working section navigation                               |
| Review evidence                        | Unframed document sections, readable source and version fields, unchanged decision controls                                            |
| Loading, missing pages and errors      | Consistent status typography, icons, recovery actions and accessible loading announcements                                             |

## Reusable Pieces

`apps/web/src/features/page-layout/` contains page headings, full-width artwork
bands, action links, honest empty states and loading states. These components
contain no authentication, scoring, progress or engineering logic.

Family-specific styling remains in the existing feature stylesheets and global
stylesheet. The dashboard CSS and its verified desktop geometry are unchanged.

## Artwork

All imagery is reused from the existing `frontendAssets` registry. No new image
generation, dependency or external image request is required. The reused images
include the pressure assembly, pressure contact detail, water vessel, hydraulic
cylinder and Future Engineering city. Existing dashboard and study-support artwork
remains in place.

These images are decorative concept illustrations. They are not reviewed
technical diagrams, manufacturer specifications, evidence of publication, or new
available courses. Image bands use empty alternative text because the adjacent
heading supplies the context; interactive engineering diagrams retain their own
accessible descriptions and measurement equivalents.

Images are responsive and fixed-format. Below-the-fold images remain lazy-loaded;
primary header artwork can be prioritised. Simulation engines are not imported by
the page-layout components.

## Preserved Boundaries

- No new curriculum, lesson, simulation or assessment is published.
- No equation, scoring rule, persistence action, database schema or RLS policy changes.
- Review queue counts come from the existing permission-filtered model. A failed
  query does not display invented zero counts.
- Project creation remains unavailable; the page offers actual learning destinations.
- The exact-reference demo remains behind its existing local-only access gate.
- A visual refresh is not an engineering approval or a production release decision.

## Verification

`tests/e2e/website-consistency.spec.ts` adds a route matrix for desktop light and
mobile dark appearances, including image decoding, clipped controls, document
overflow, runtime errors and WCAG automated checks. It also checks management
anchors, staff-specific Lab navigation, explicit banner-copy colour and the
visual-first lesson boundary. Existing interaction, access-control,
assessment, simulation, dashboard geometry, reduced-motion and small-screen tests
remain required.

The paired audit report records actual execution results and limitations. All
authenticated browser verification uses isolated synthetic local accounts, never
private live learner records.
