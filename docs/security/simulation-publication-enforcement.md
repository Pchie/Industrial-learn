# Simulation Publication Enforcement

Completed: 2026-08-29
Status: implemented locally for Prompt 43

## Security Objective

A simulation is not public because a registry entry says that it is operationally
available. Student delivery requires both the parent lesson and the simulation candidate
to pass the shared publication visibility policy.

## Registry Model

`apps/web/src/features/simulations/catalog.ts` now separates two concepts:

- `intendedAvailability` describes product intent such as available or coming later;
- `evaluateSimulationCatalogVisibility` derives governance eligibility.

`getPublicSimulationCatalog` includes an entry only when product intent is `available` and
the parent lesson plus simulation both pass governance. An `intendedAvailability` value can
never override technical review, source evidence, publication, version, or archive checks.

## Governance Inputs

The parent lesson and simulation are independently evaluated for:

- publication status;
- technical review status;
- approved source evidence;
- candidate version;
- authoritative current and published versions; and
- archive state.

The simulation definition supplies source IDs and review status. Registry metadata supplies
the candidate version and parent relationship. Authoritative version relationships must be
supplied by trusted governance data. Missing authority fails closed.

## Delivery Inventory

| Delivery surface            | Enforcing file and symbol                                                     | Result                                                                                |
| --------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Simulation registry         | `apps/web/src/features/simulations/catalog.ts`, `simulationRegistry`          | Stores intent; does not grant visibility                                              |
| Public catalogue            | same file, `getPublicSimulationCatalog`                                       | Shared-policy filtered                                                                |
| Public collections          | same file, `getPublicSimulationCollections`                                   | Built only from public entries; empty collections omitted                             |
| Search and combined filters | `apps/web/src/features/simulations/discovery.ts`, `filterSimulationCatalogue` | Receives only public DTOs                                                             |
| Anonymous/student lab model | `apps/web/src/features/simulations/server.ts`, `loadSimulationLabModel`       | Starts from public catalogue; filters recents and recommendations                     |
| Public detail               | same file, `loadPublicSimulationOverview`                                     | Resolves public slugs only                                                            |
| Authenticated detail        | same file, `loadSimulationOverview`                                           | Rechecks public registry before local or database persistence                         |
| Attempt start               | same file, `startSimulationForStudent`                                        | Requires a public overview                                                            |
| Attempt page and review     | same file, `loadSimulationAttemptPage` and `loadCompletedSimulationReview`    | Requires a public overview and owned attempt                                          |
| Completion                  | same file, `completeSimulationForStudent`                                     | Rechecks public overview and matching simulation ID                                   |
| History                     | same file, `listSimulationHistory`                                            | Removes attempts whose simulation is no longer public                                 |
| Dashboard activity          | `apps/web/src/features/student-dashboard/data.ts`                             | Removes hidden simulation slugs                                                       |
| Lesson embedding            | `apps/web/src/features/lesson-engine/visual-experience-registry.tsx`          | Removes hidden IDs, hero blocks, linked schematics, fault challenges, and related IDs |
| Internal raw resolution     | catalogue functions suffixed `ForInternalUse`                                 | Explicitly named and not used by public routes                                        |
| Internal component lab      | `apps/web/src/app/internal/visual-simulation-lab/page.tsx`                    | Restricted to author, reviewer, or administrator roles                                |

Standalone simulation routes have no `generateStaticParams`, sitemap, or public JSON
registry endpoint. Direct detail and attempt URLs resolve through the same public server
loader used by the catalogue.

## Service-Role Database Boundary

The Supabase simulation loader uses a server-only service-role REST client. Because that
credential bypasses RLS by design, both lookup functions now require:

- `publication_status=published`; and
- `technical_review_status=Approved for student use`.

The literal requirements come from
`STUDENT_PUBLICATION_REQUIREMENTS` in the shared policy package. The application first
requires a public static registry/parent decision, then applies the database predicate.
This preserves defense in depth without duplicating policy literals.

The service-role key is read only through `getServerEnv`; it is never returned in a DTO or
used by a client component.

## Embedded And Assessment Boundaries

`projectLessonForPublicDelivery` independently checks every simulation reference. A public
lesson cannot expose an unapproved simulation through a hero, schematic, fault challenge,
simulation ID list, or related-application ID.

The pilot assessment has a `simulation-task` question referencing the hydraulic simulation.
It does not provide an executable simulation link. Student delivery now also strips the
internal `simulationId` from `DeliveredQuestion`; expected measurements, correct answers,
private explanations, diagnostic evidence, and hints remain server-only before submission.
Trusted server scoring still uses the complete assessment.

## Internal Review

`evaluateSimulationPublicationRecords` accepts an explicit internal audience and trusted
access context. Reviewer-only visibility requires `reviewerAuthorized`; selecting reviewer
as the audience is insufficient. Supplying that reviewer flag to a student audience does
not grant visibility.

The existing internal visual component lab remains available to authenticated authors,
reviewers, and administrators. It is labelled demonstration-only and not reviewed student
content. No student route uses the internal resolver.

## Current Catalogue Result

All current registered simulations are hidden from public/student delivery:

| Slug                                 | Intended availability | Parent publication/review                  | Simulation review             |
| ------------------------------------ | --------------------- | ------------------------------------------ | ----------------------------- |
| `hydraulic-cylinder-force`           | available             | `internal` / `Engineering review required` | `Equation checked`            |
| `bernoulli-flow-lab`                 | available             | `internal` / `Engineering review required` | `Engineering review required` |
| `thermal-system-boundary-simulation` | coming later          | `draft` / `Engineering review required`    | `Engineering review required` |

The Simulation Lab therefore displays: `Reviewed simulations are being prepared.` No
registry item, collection item, search result, recent activity, recommendation, detail
view, start action, or student attempt route is exposed.

## Known Limitations

- The `simulations` table has no source-evidence aggregate, archive timestamp, or explicit
  published-version relation. The static parent/simulation gate supplies those requirements
  and fails closed until trusted authority is available.
- Migration `0010_bernoulli_flow_simulation_registration.sql` remains uncommitted and must
  not be applied with its current unapproved/published semantics.
- Historical attempts are hidden while their simulation is withdrawn. A future approved
  product policy may expose a bounded, content-free attempt summary without restoring the
  simulation implementation.
- Reviewer assignment is not a first-class persisted relation. Current internal tests use
  explicit trusted authorization; no browser-supplied flag is accepted.
- Live Supabase/RLS and deployed staging verification remain outside Prompt 43.
