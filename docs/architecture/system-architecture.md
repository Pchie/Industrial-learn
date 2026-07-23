# Industrial Learn System Architecture

## Source IDs

Architecture decisions in this document are grounded in these repository sources:

- IL-AGENTS-001: `AGENTS.md`
- IL-PRD-001: `docs/product/product-requirements.md`
- IL-MVP-001: `docs/product/mvp-scope.md`
- IL-JOURNEY-001: `docs/product/user-journeys.md`

## Architecture Goals

Industrial Learn uses a modular web architecture that keeps learning content, assessment content, engineering calculations, simulation logic, database access, authentication, AI services, and UI components separate. This boundary model is required because the product depends on reviewed technical knowledge, tested calculations, accessible interactive learning, and controlled student data access. Sources: IL-AGENTS-001, IL-PRD-001, IL-MVP-001.

The first release should be a responsive web application with a small reviewed content library, one to three Core Engineering modules, one connected Future Engineering module, limited simulations, formative assessments, progress tracking, lecturer visibility, author workflow, and engineering review workflow. Source: IL-MVP-001.

## Proposed Modular System

The system is organised into these modules:

- Frontend application
- Design system
- Authentication and authorisation
- Course and lesson content
- Knowledge files and source references
- Engineering calculation library
- Unit conversion library
- Simulation engine and simulation definitions
- Assessments
- Student progress
- Projects
- Content review
- Search
- Future AI mentor
- Analytics
- Logging and error monitoring
- File storage
- PostgreSQL data layer
- Deployment and operations

## Frontend Application

The frontend is a responsive web application for students, lecturers, content authors, and engineering reviewers. It should expose role-appropriate routes and screens while using shared feature modules underneath. Source: IL-PRD-001.

Frontend responsibilities:

- Render learning journeys.
- Render topic, lesson, assessment, simulation, project, lecturer, author, and review interfaces.
- Collect user input.
- Display calculation results returned by approved calculation functions.
- Display simulation state returned by simulation logic.
- Provide accessible navigation, forms, controls, feedback, and status messaging.

Frontend non-responsibilities:

- It must not contain engineering formulas.
- It must not own database access.
- It must not expose secrets or service credentials.
- It must not make final content approval decisions.

## Design System

The design system provides reusable UI primitives, layout rules, interaction patterns, accessibility conventions, and visual status treatments.

Design system responsibilities:

- Buttons, inputs, tabs, dialogs, tables, cards, progress indicators, forms, alerts, and navigation primitives.
- Keyboard interaction patterns.
- Colour-plus-text status indicators so meaning is not conveyed by colour alone.
- Responsive layout rules for mobile, tablet, and desktop.
- Simulation control patterns for sliders, numeric inputs, toggles, segmented controls, and reset actions.

Design system non-responsibilities:

- It must not contain lesson content.
- It must not contain assessment questions.
- It must not contain engineering formulas.
- It must not call databases or AI services.

## Authentication And Authorisation

Authentication verifies user identity. Authorisation controls what the authenticated user can access.

Core roles:

- Student
- Lecturer
- Content author
- Engineering reviewer
- Administrator

Access-control policy:

- Students can access assigned content, available approved content, their own progress, and their own submissions.
- Lecturers can access authorised cohorts, assignments, aggregate progress, and relevant student submissions.
- Content authors can create and edit draft content within assigned areas.
- Engineering reviewers can review submitted content and create review records.
- Administrators can manage users, roles, cohorts, and policy settings.

No user data should be accessible without an ownership and access-control policy. Source: IL-AGENTS-001.

## PostgreSQL Database

PostgreSQL is the primary relational system of record.

Database responsibilities:

- Users, roles, institutions, cohorts, enrolments, and assignments.
- Course structure, module metadata, topic metadata, and content status metadata.
- Assessment attempts, answers, scores, feedback references, and progress events.
- Project submissions and rubric results.
- Engineering review records.
- Source reference registry metadata.
- File metadata and storage pointers.
- Audit records for important authoring, reviewing, access, and administrative events.

Database non-responsibilities:

- It should not store large binary files directly.
- It should not contain unversioned schema changes.
- It should not replace source-controlled lesson and knowledge files where file-based review is required.

All database changes must use version-controlled migrations. Source: IL-AGENTS-001.

## File Storage

File storage holds binary and document-like assets that do not belong directly in PostgreSQL.

Stored file categories:

- Lesson images and diagrams.
- Simulation media assets.
- Project attachment uploads.
- Reviewer attachments.
- Exported reports.
- Knowledge file source documents where licensing and policy allow storage.

File metadata belongs in PostgreSQL. Binary objects belong in object storage. Access to files must be checked through application authorisation before issuing download or upload access.

## Structured Course Content

Structured course content should be treated as authored educational material with explicit status, source IDs, prerequisites, learning outcomes, activities, assumptions, and limitations.

Course content entities:

- School
- Programme area
- Module
- Topic
- Lesson
- Activity
- Calculation activity
- Simulation activity
- Assessment activity
- Project activity

Content status values:

- Draft
- Source required
- Source checked
- Equation checked
- Simulation checked
- Engineering review required
- Approved for student use

Content cannot be labelled Approved for student use unless a review record exists. Source: IL-AGENTS-001.

## Knowledge Files

Knowledge files are reviewed technical materials used by lessons, assessments, simulations, projects, search, and the future AI mentor.

Knowledge file responsibilities:

- Store source-backed explanations and reference metadata.
- Keep important technical statements connected to approved source IDs.
- Support review workflows for source, equation, and simulation checks.
- Provide retrievable chunks for search and future AI mentor services.

Knowledge files must not become a place for unsupported standards, clauses, equipment ratings, or manufacturer data. Source: IL-AGENTS-001.

## Simulations

Simulations are interactive learning tools with separated display, state, and domain behaviour.

Simulation boundaries:

- UI controls collect inputs and render state.
- Simulation state stores current inputs, derived state, scenario mode, and feedback state.
- Simulation logic computes behaviour from input state.
- Engineering calculations are imported from the calculation library where formulas are required.
- Simulation content defines prompts, labels, source IDs, assumptions, and fault scenarios.

Every new simulation requires normal-state, boundary-state, and fault-state tests. Source: IL-AGENTS-001.

## Engineering Calculation Library

Engineering calculations are pure functions that accept typed inputs and return typed outputs using consistent SI units internally.

Calculation library responsibilities:

- Implement formulas as pure functions.
- Validate input ranges and required assumptions.
- Return calculation steps and machine-readable results where needed for teaching.
- Keep calculation tests close to calculation logic.
- Avoid UI, database, authentication, and content-rendering dependencies.

Calculation library non-responsibilities:

- It must not render UI.
- It must not read directly from the database.
- It must not decide whether content is approved.
- It must not call external services.

## Unit Conversion

Unit conversion is a dedicated domain utility used by calculation activities, simulations, assessments, and author tooling.

Unit conversion responsibilities:

- Convert student-entered values into internal SI units.
- Convert internal SI results into display units.
- Preserve unit metadata for feedback.
- Detect incompatible units where possible.

Internal calculation functions must use consistent SI units. Source: IL-AGENTS-001.

## Assessments

Assessments are structured learning checks rather than high-stakes certification in the first release. Source: IL-MVP-001.

Assessment boundaries:

- Assessment content defines questions, choices, expected calculation steps, rubrics, feedback, source IDs, and scoring rules.
- Assessment engine evaluates attempts using assessment rules and calculation functions where needed.
- Assessment UI renders questions and feedback.
- Progress module records attempts and outcomes.

Assessment content must remain separate from assessment engine code.

## Student Progress

Student progress tracks learning state across modules, topics, activities, calculations, simulations, assessments, and projects.

Progress responsibilities:

- Record activity completion.
- Record assessment attempts.
- Record calculation practice outcomes.
- Record simulation completion and fault-diagnosis outcomes.
- Record project milestones and rubric outcomes.
- Provide lecturer-visible cohort summaries within access-control limits.

Progress records must be scoped by student ownership, cohort membership, and lecturer authorisation. Sources: IL-AGENTS-001, IL-PRD-001.

## Projects

Projects combine theory, calculations, design reasoning, simulation use where available, assumptions, limitations, and professional reflection. Source: IL-JOURNEY-001.

Project boundaries:

- Project content defines instructions, constraints, deliverables, rubrics, source IDs, and review requirements.
- Project submissions store student work, attachments, reflections, and rubric outcomes.
- Project assessment uses rubric rules and lecturer or reviewer judgement.

Projects must not imply professional certification in the first release. Source: IL-MVP-001.

## Content Review

Content review is a first-class module because Industrial Learn depends on reviewed technical knowledge. Sources: IL-AGENTS-001, IL-PRD-001.

Review responsibilities:

- Track review requests.
- Store review records.
- Connect approval to source IDs, equation checks, simulation checks, and reviewer identity.
- Prevent approved student-use status without a review record.
- Preserve reviewer notes and required changes.

Review statuses should support the content status list already defined in repository rules.

## Search

Search helps students, lecturers, authors, and reviewers find approved content, draft content where authorised, source references, topics, calculations, simulations, and projects.

Search boundaries:

- Student search should default to approved student-use content.
- Lecturer search should include assignable reviewed content.
- Author and reviewer search may include draft and review-state content where authorised.
- Search indexing must respect content status and access-control policy.

## Future AI Mentor

The AI mentor is a future service boundary, not an MVP core feature. Source: IL-MVP-001.

AI mentor responsibilities when introduced:

- Retrieve only from approved or policy-authorised knowledge sources.
- Cite approved source IDs in important technical statements.
- Refuse to invent standards, clauses, ratings, or manufacturer data.
- Stay separate from calculation authority; calculations should come from tested calculation functions.
- Avoid replacing lecturers, reviewers, or safety instruction.

AI mentor non-responsibilities:

- It must not approve content.
- It must not grade high-stakes work.
- It must not bypass access control.
- It must not become the source of engineering truth.

## Analytics

Analytics support platform and educational success measures without over-collecting personal data.

Analytics categories:

- Product usage events.
- Lesson completion.
- Assessment completion.
- Simulation usage.
- Project submission.
- Review workflow timing.
- Lecturer assignment adoption.
- Low-data and mobile completion indicators.
- Accessibility issue tracking.

Analytics must use privacy-aware event design and respect access-control boundaries. Sources: IL-PRD-001, IL-AGENTS-001.

## Logging And Error Monitoring

Logging and monitoring should support reliability, debugging, review auditability, and security investigation.

Logging categories:

- Application errors.
- API errors.
- Authentication and authorisation failures.
- Content review actions.
- Calculation validation failures.
- Simulation runtime errors.
- File access events for sensitive resources.
- Background job failures.

Logs must avoid secrets, credentials, and unnecessary student personal data. Source: IL-AGENTS-001.

## Security

Security architecture must enforce:

- Server-side authorisation for all protected resources.
- No service secrets in browser code.
- Version-controlled database migrations.
- Content approval gates.
- File access checks.
- Audit trails for review and administrative actions.
- Least-privilege service credentials.
- Environment-specific configuration.

## Data-Access Layer

Application data access is routed through a server-controlled boundary:

```text
UI -> server action or route -> application service -> repository -> PostgreSQL/Supabase -> RLS
```

The initial foundation is implemented in `packages/database/src/` and documented in `docs/architecture/data-access-layer.md`. Frontend components must not query private database tables directly. Services validate runtime inputs, enforce application-layer ownership, map outputs to DTOs, translate database errors safely, and reserve service-role access for explicit server-only administrative modules. Sources: IL-AGENTS-001, IL-SEC-001.

## Deployment

The first release should use a straightforward web deployment:

- Web application runtime.
- PostgreSQL database.
- Object storage.
- Background workers for indexing, analytics processing, file processing, and notification tasks.
- Search index.
- Monitoring and logging services.
- Separate development, staging, and production environments.

Production releases must not be committed directly to the production branch. Source: IL-AGENTS-001.

## Explicit Module Boundaries

| Boundary                 | Owns                                                  | Must Not Own                                                |
| ------------------------ | ----------------------------------------------------- | ----------------------------------------------------------- |
| UI components            | Rendering, layout, controls, accessibility states     | Formulas, database access, secrets, approval rules          |
| Feature modules          | User-facing workflows and orchestration               | Raw SQL, global auth policy, unrelated domains              |
| Database access          | Queries, transactions, persistence mapping            | UI rendering, formulas, simulation behaviour                |
| Domain logic             | Learning workflow rules, review rules, progress rules | UI components, external service credentials                 |
| Engineering calculations | Pure formulas, SI-unit calculation results, tests     | UI rendering, database calls, AI output                     |
| Simulation logic         | Scenario state transitions and behaviour              | Lesson prose, database persistence, UI styling              |
| Lesson content           | Explanations, outcomes, source IDs, assumptions       | Runtime formulas, persistence code                          |
| Assessment content       | Questions, rubrics, feedback, source IDs              | Assessment engine code, database code                       |
| AI services              | Retrieval, response generation, citation policy       | Source of truth, content approval, direct grading authority |
