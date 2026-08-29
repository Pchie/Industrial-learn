# Prompt 43 Publication Test Matrix

Completed: 2026-08-29
Scope: local publication enforcement and security regression

## Lesson Matrix

| Requirement                           | Expected result                                                       | Evidence                                                      |
| ------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------- |
| Published, approved, current lesson   | Visible                                                               | Synthetic authority test in `publication-enforcement.test.ts` |
| Draft lesson                          | Hidden                                                                | Shared/app policy parameter test                              |
| Source-required lesson                | Hidden                                                                | Shared/app policy parameter test                              |
| Source-checked-only lesson            | Hidden                                                                | Shared/app policy parameter test                              |
| Equation-checked-only lesson          | Hidden                                                                | Shared/app policy parameter test                              |
| Simulation-checked-only lesson        | Hidden                                                                | Shared/app policy parameter test                              |
| Engineering-review-required lesson    | Hidden                                                                | Shared/app policy parameter test and current fixtures         |
| Approved but unpublished lesson       | Hidden                                                                | App policy test                                               |
| Published but unapproved lesson       | Hidden                                                                | App policy test                                               |
| Archived/withdrawn-normalized lesson  | Hidden                                                                | Shared/app policy tests                                       |
| Missing published-version relation    | Hidden                                                                | App policy test and current public registry                   |
| Old or superseded version             | Hidden                                                                | Shared/app policy tests                                       |
| Direct slug guessing                  | Generic not-found, no title/status/source/body                        | `lesson-engine.spec.ts`, hydraulic and Bernoulli denial specs |
| Static parameter enumeration          | Hidden slugs excluded                                                 | `getPublicLessons` test plus route implementation inspection  |
| Curriculum listing and counts         | Hidden modules/lessons omitted                                        | Curriculum unit and E2E tests                                 |
| Module and pathway direct URLs        | Generic not-found, no hidden names                                    | `curriculum.spec.ts`                                          |
| Dashboard continuation, saved, recent | Hidden links omitted                                                  | Dashboard E2E and public projection implementation            |
| Recommendations                       | Hidden module targets omitted                                         | Dashboard E2E                                                 |
| Related/next content                  | No public related registry exists; hidden lesson bodies cannot render | Delivery inventory review and direct-route tests              |
| Search                                | No public lesson search endpoint exists                               | Route/source inventory review                                 |
| Source serialization                  | No source lookup until lesson passes                                  | Route implementation and direct-route no-leak assertions      |
| Internal author/reviewer access       | Explicit trusted authorization required                               | `publication-enforcement.test.ts`; author/reviewer role E2E   |

## Simulation Matrix

| Requirement                                        | Expected result                                                  | Evidence                                              |
| -------------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------- |
| Approved, published, current parent and simulation | Visible                                                          | Synthetic dual-gate unit test                         |
| Source-required simulation                         | Hidden                                                           | Source evidence and synthetic denial tests            |
| Review-required simulation                         | Hidden                                                           | Current registry and unit tests                       |
| Available intent with failed governance            | Hidden                                                           | Hydraulic/Bernoulli hard-coded-bypass regression test |
| Unapproved parent lesson                           | Hidden                                                           | Synthetic dual-gate unit test                         |
| Catalogue                                          | Contains public DTOs only                                        | Empty catalogue E2E                                   |
| Search and combined filters                        | Cannot reveal hidden records                                     | Simulation Lab E2E                                    |
| Collections/related entries                        | Built only from public records                                   | Unit test and empty catalogue E2E                     |
| Direct detail slug                                 | Generic not-found, no title/status/start control                 | Simulation Lab E2E                                    |
| Direct attempt slug                                | Generic not-found before workspace loads                         | Simulation browser E2E                                |
| Attempt start/completion                           | Rechecks public overview                                         | Server implementation plus direct-route E2E           |
| Embedded simulation                                | Hidden blocks and IDs removed                                    | Public projection unit test                           |
| Dashboard/recent/history                           | Hidden simulation records omitted                                | Dashboard and simulation browser E2E                  |
| Service-role query                                 | Requires published and approved status using shared constants    | Server implementation and build/type checks           |
| Internal reviewer                                  | Explicit reviewer authorization allows internal scope            | App policy unit test and protected internal-lab E2E   |
| Student with reviewer flag                         | Still denied                                                     | App policy unit test                                  |
| Assessment-linked simulation                       | No launch path; internal ID removed from delivered DTO           | Assessment-core delivery test                         |
| Hidden answers                                     | Answers, expected measurements, explanation, hints remain absent | Assessment-core and browser assessment tests          |
| Empty state                                        | `Reviewed simulations are being prepared.`                       | Simulation Lab E2E                                    |
| Client bundle                                      | Empty lab does not download hidden workspace strings             | Simulation Lab preload E2E                            |

## Security Regression Matrix

| Boundary                                        | Evidence                                            |
| ----------------------------------------------- | --------------------------------------------------- |
| Cross-student dashboard denial                  | `student-dashboard.spec.ts`                         |
| Lecturer/reviewer cannot read student dashboard | `student-dashboard.spec.ts`                         |
| Cross-student assessment review denial          | `assessment-browser.spec.ts` and database tests     |
| Assessment hidden-answer protection             | assessment-core, persistence, and browser tests     |
| Simulation attempt ownership                    | `packages/database/src/attempt-persistence.test.ts` |
| Duplicate simulation completion                 | database persistence tests                          |
| Author/reviewer separation                      | content-governance and staging-smoke E2E            |
| Student cannot access internal visual tooling   | `simulation-browser.spec.ts`                        |
| Service credentials remain server-only          | static import review, secret scan, and build        |

## Execution Results

| Command or suite                   | Result                                                               |
| ---------------------------------- | -------------------------------------------------------------------- |
| Focused TypeScript: web workspace  | PASS                                                                 |
| Focused policy/security/unit suite | PASS, 7 files and 86 tests                                           |
| Focused publication browser rerun  | PASS, all 33 selected tests after one test-only hydration correction |
| `npm run scan:secrets`             | PASS                                                                 |
| `npm run format:check`             | PASS                                                                 |
| `npm run typecheck`                | PASS across all workspaces                                           |
| `npm run lint`                     | PASS                                                                 |
| `npm run validate:content`         | PASS, 19 tests                                                       |
| `npm run validate:migrations`      | PASS, 14 tests                                                       |
| `npm run test:unit`                | PASS, 34 files passed and 1 skipped; 322 tests passed and 4 skipped  |
| `npm run build`                    | PASS, production build and 33-page generation completed              |
| `npm run test:smoke`               | PASS, 5 tests                                                        |
| `npm run test:e2e`                 | PASS, 94 tests                                                       |
| `npm run test:a11y`                | PASS, 36 tests                                                       |

The first focused browser run produced 56 passes and 23 failures. Twenty-two failures were
test-contract issues: Next.js streamed not-found navigation status and an authentication
redirect race. The remaining failure exposed a real client-bundle leak through the
dashboard error boundary. That import path was removed. A subsequent focused run passed
the client preload check and 32 of 33 selected tests; the one remaining failure was a
hydration timing assertion and was corrected by waiting for the search input to be enabled.
That test then passed individually, and the complete 94-test E2E run passed. No security
failure was suppressed.
