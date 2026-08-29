# Lesson Publication Enforcement

Completed: 2026-08-29
Status: implemented locally for Prompt 43

## Security Objective

Student and public lesson delivery must fail closed unless the candidate is the approved,
published, current version supported by approved source evidence. A status badge is not an
authorization decision.

The shared decision remains owned by
`@industrial-learn/content-review-workflow/publication-visibility`. Web adapters normalize
repository JSON into that contract; UI components do not reproduce the rule.

## Public Rule

Public or student visibility requires all of the following:

1. publication status is `published`;
2. technical review status is `Approved for student use`;
3. all referenced source records have `evidenceStatus: approved`;
4. candidate and published versions exist and match;
5. the candidate is not archived; and
6. the version relationship is valid.

Missing, invalid, scheduled, draft, internal, archived, superseded, withdrawn-normalized,
or evidence-incomplete records are denied. Structured JSON currently has no authoritative
`publishedVersion` relation, so the static public adapter denies every current lesson. This
is intentional and must remain until trusted governance data supplies that relation.

## Delivery Inventory

| Delivery surface                                                 | Enforcing file and symbol                                                                              | Result                                                                                   |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- |
| Structured lesson enumeration                                    | `apps/web/src/features/lesson-engine/data.ts`, `getPublicLessons`                                      | Shared-policy filtered                                                                   |
| Direct structured lesson lookup                                  | same file, `getPublicLessonBySlug`                                                                     | Shared-policy filtered                                                                   |
| Direct lesson route                                              | `apps/web/src/app/lessons/[lessonSlug]/page.tsx`, `LessonPage`                                         | Calls public lookup before reading sources or rendering; denied records use `notFound()` |
| Static lesson parameters                                         | same route, `generateStaticParams`                                                                     | Enumerates public lessons only                                                           |
| Curriculum projection                                            | `apps/web/src/features/curriculum/data.ts`, `getCurriculum`                                            | Filters modules and nested lessons through the shared adapter                            |
| Module route and static parameters                               | `apps/web/src/app/modules/[moduleSlug]/page.tsx`                                                       | Uses filtered `getModule` and filtered module enumeration                                |
| Pathway route and static parameters                              | `apps/web/src/app/pathways/[pathwaySlug]/page.tsx`                                                     | Uses filtered `getPathway` and filtered pathway enumeration                              |
| Programme and academic-year module lists                         | programme routes through `getCurriculum`                                                               | Preserve empty containers but omit hidden modules and lessons                            |
| Prerequisite graph                                               | `getCurriculum`                                                                                        | Keeps edges only when both module endpoints are public                                   |
| Dashboard continuation, weekly plan, saved lessons, and activity | `apps/web/src/features/student-dashboard/data.ts`, `buildStudentDashboardModel`                        | Projects only public lesson slugs and modules                                            |
| Weak-topic links                                                 | same file, `recommendationTargetsPublicModule`                                                         | Removes recommendations targeting hidden modules                                         |
| Embedded lesson visuals                                          | `apps/web/src/features/lesson-engine/visual-experience-registry.tsx`, `projectLessonForPublicDelivery` | Independently removes hidden simulation IDs and blocks                                   |
| Source serialization                                             | lesson route plus `getSourceRecordsById`                                                               | Sources are resolved only after the lesson gate passes                                   |

No separate public lesson search endpoint, related-lesson registry, lesson JSON API,
sitemap, or public version route exists in the inspected application. Future versions of
those surfaces must call the same public adapters rather than the raw static registry.

## Direct URL Behavior

Guessing a hidden lesson slug renders the generic application not-found view. The response
does not include the lesson title, review status, source IDs, or lesson body. Next.js may
stream the not-found boundary after a successful shell response, so tests assert the
rendered not-found state and absence of governed metadata instead of relying only on the
navigation response code.

## Internal Access

`getInternalLessonBySlug` is separate from the public loader. It accepts only an internal
audience and requires a trusted `PublicationAccessContext`:

- an author needs ownership or explicit trusted author authorization;
- a reviewer needs explicit trusted reviewer authorization;
- a lecturer needs explicit trusted lecturer authorization; and
- an administrator needs explicit trusted administrator authorization.

The `/author` and `/review` workspaces remain protected by authenticated role guards and
their existing governance services. Public lesson routes never infer internal access from
a role and never accept authorization flags from the browser.

## Current Content Result

The five structured lessons are hidden from public/student delivery:

| Slug                                 | Publication | Review                        |
| ------------------------------------ | ----------- | ----------------------------- |
| `basic-fluid-pressure`               | `draft`     | `Engineering review required` |
| `pump-system-units-and-measurements` | `draft`     | `Engineering review required` |
| `hydraulic-cylinder-force`           | `internal`  | `Engineering review required` |
| `bernoulli-flow-lab`                 | `internal`  | `Engineering review required` |
| `systems-surroundings-boundaries`    | `draft`     | `Engineering review required` |

No content status or review record was changed by Prompt 43.

## Client Boundary

The client dashboard error boundary no longer imports runtime values from the server-side
dashboard data module. This prevents its public JavaScript chunk from pulling in static
lesson and simulation registries after publication-aware dashboard filtering was added.

## Known Limitations

- Static JSON has no trusted `publishedVersion` relation, so no current lesson can become
  public merely by editing its status fields.
- The current database-backed governance model is not wired to structured lesson delivery;
  that integration must supply version authority on the trusted server.
- Programme, discipline, school, academic-year, and semester containers remain visible
  with honest empty states. Their hidden module and lesson children are not serialized.
- Next.js streamed not-found rendering can report an initial HTTP 200 while showing the
  generic not-found boundary. No governed metadata is included in the rendered response.
- Live RLS and deployed staging verification are outside Prompt 43.
