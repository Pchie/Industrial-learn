# Industrial Learn Repository Contracts

## Purpose

Repository contracts define how application services may access persisted data. They keep database queries out of UI components and make ownership rules testable before frontend integration.

Source IDs: IL-AGENTS-001, IL-DB-001, IL-SEC-001, IL-AUTH-001.

## Shared Rules

Every repository must document:

- Allowed caller
- Ownership rule
- Inputs
- Outputs
- RLS dependency
- Expected errors
- Pagination behaviour
- Audit requirements

Repositories must return DTOs rather than raw database rows. Queries should select explicit columns, apply stable ordering, use pagination, and avoid hidden assessment answers or unpublished content for student callers.

## Contracts

| Repository                   | Allowed caller      | Ownership rule                                        | Audit requirement                         |
| ---------------------------- | ------------------- | ----------------------------------------------------- | ----------------------------------------- |
| `ProfileRepository`          | Authenticated       | Self, authorised lecturer, administrator              | Profile or role-management writes audited |
| `ProgrammeRepository`        | Authenticated       | Published catalogue, enrolment, authorised cohort     | Enrolment changes audited                 |
| `LessonProgressRepository`   | Authenticated       | Student self, authorised lecturer read, administrator | Progress corrections audited              |
| `AssessmentRepository`       | Authenticated       | Published content; own or authorised attempts         | Attempt changes audited                   |
| `SimulationRepository`       | Authenticated       | Student self, authorised lecturer read, administrator | Assessment-mode results audited           |
| `ProjectRepository`          | Authenticated       | Student self, authorised lecturer read, administrator | Submission and review decisions audited   |
| `SavedLessonRepository`      | Authenticated       | Student self, administrator                           | No audit for ordinary save/remove         |
| `PublishedContentRepository` | Authenticated       | Published and approved content only for students      | Publication handled by review service     |
| `ContentReviewRepository`    | Content staff       | Review queues do not grant student-data access        | Review decisions audited                  |
| `AuditRepository`            | Application service | Minimal event metadata                                | Append-only by service design             |

## Pagination

List operations accept `limit`, optional `cursor`, and where relevant `sortDirection`. Limits are constrained to 1 through 100. Ordering must be stable; repositories should use immutable IDs or timestamp-plus-ID ordering when implemented against PostgreSQL.

## Error Behaviour

Repositories may raise internal database errors. Services translate those failures to controlled application errors and must not expose SQL, internal table names, stack traces, or credentials.

## Transaction Contract

`TransactionRunner.transaction()` wraps multi-write operations. It is required for:

- Assessment submission plus progress or competency updates
- Simulation assessment result plus progress updates
- Project submission plus version record creation
- Content publication plus audit event creation
- Publication rollback plus audit event creation

## RLS Dependency

Application services enforce role and ownership checks before repository calls. PostgreSQL row-level security remains the final database boundary. Live repository adapters must use session-bound clients for normal user access and service-role clients only in documented administrative services.
