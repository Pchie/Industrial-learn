# Industrial Learn Scaling Strategy

## Source IDs

- IL-AGENTS-001: `AGENTS.md`
- IL-PRD-001: `docs/product/product-requirements.md`
- IL-MVP-001: `docs/product/mvp-scope.md`

## Scaling Philosophy

Industrial Learn should scale by preserving module boundaries before adding infrastructure complexity. The first release should prove correctness, reviewability, accessibility, and learning value with limited content and simple operations. Source: IL-MVP-001.

## Phase 1: MVP

Primary goals:

- Small reviewed content library.
- One to three Core Engineering modules.
- One connected Future Engineering module.
- One or two simulations.
- Basic assessments and progress.
- Lecturer cohort overview.
- Author and reviewer workflow.

Technical approach:

- Single modular web application.
- PostgreSQL system of record.
- Object storage for files.
- Background jobs for indexing and analytics.
- PostgreSQL-backed search if content volume is small.
- Managed hosting where possible.

## Phase 2: More Courses And Cohorts

Triggers:

- More modules across disciplines.
- More active cohorts.
- More lecturer assignments.
- Larger project submissions.
- Increased search and reporting demand.

Actions:

- Optimise database indexes around enrolment, assignment, progress, and content status.
- Add queue-backed background processing for heavy tasks.
- Split read-heavy dashboards into summary tables or materialised views.
- Introduce a dedicated search service if PostgreSQL-backed search becomes limiting.
- Add stronger content versioning and release management.

## Phase 3: Review And Content Scale

Triggers:

- Multiple authors and reviewers.
- Larger knowledge library.
- More review states and content versions.
- Increased need for audit history.

Actions:

- Add structured content release workflows.
- Add reviewer workload dashboards.
- Add source reference registry workflows.
- Improve diff and version comparison for lessons, assessments, simulations, and knowledge files.
- Add automated policy checks for missing source IDs and missing review records.

## Phase 4: Simulation Scale

Triggers:

- More simulations.
- Heavier client performance cost.
- Complex state, fault, and boundary testing needs.

Actions:

- Package simulation logic by domain.
- Add simulation performance budgets.
- Lazy-load simulation assets.
- Add shared simulation test fixtures.
- Consider a dedicated simulation runtime only when required.

## Phase 5: AI Mentor Readiness

Triggers:

- Search quality is mature.
- Knowledge files have strong source metadata.
- Review coverage is high.
- AI safety and privacy policies are approved.

Actions:

- Add retrieval service with strict content-status filtering.
- Add prompt and response policy tests.
- Route calculations to the calculation library.
- Add source ID citation checks.
- Monitor AI mentor responses separately from core learning analytics.

The AI mentor should not precede reviewed knowledge governance. Sources: IL-AGENTS-001, IL-MVP-001.

## Data Scaling

PostgreSQL should scale first through:

- Clear schema ownership.
- Version-controlled migrations.
- Proper indexes.
- Query review for lecturer dashboards.
- Summary tables for aggregate progress.
- Archival policy for old events and logs.

Object storage should scale through:

- Public and private asset separation.
- Lifecycle policies.
- File metadata indexing.
- Controlled upload sizes.

## Organisational Scaling

As the team grows, ownership should remain modular:

- Learning experience team owns student and lecturer workflows.
- Content platform team owns authoring, knowledge files, and review.
- Engineering domain team owns calculations, units, and simulations.
- Platform team owns authentication, database access, deployment, monitoring, and security.

These teams can be virtual ownership areas before they become separate teams.

## Scaling Guardrails

- Do not add broad curriculum coverage before review capacity exists.
- Do not add AI mentor features before source governance is reliable.
- Do not add live equipment integration in the MVP.
- Do not add high-stakes certification in the MVP.
- Do not optimise infrastructure before preserving correctness and modularity.
