# Data-Access Threat Model

## Scope

This threat model covers the Industrial Learn server-side data-access layer in `packages/database/src/`.

Source IDs: IL-AGENTS-001, IL-SEC-001, IL-DB-001, IL-AUTH-001.

## Assets

- Student profiles
- Student progress
- Assessment attempts
- Simulation attempts
- Project submissions
- Review records
- Source and knowledge metadata
- Audit events
- Supabase anonymous and service-role credentials

## Main Threats And Controls

| Threat                                  | Control                                                           |
| --------------------------------------- | ----------------------------------------------------------------- |
| UI directly queries private tables      | Repository contracts and server-only service boundary             |
| Student accesses another student record | Application ownership checks plus PostgreSQL row-level security   |
| Lecturer accesses unrelated cohort      | `lecturerCanAccessStudent()` gate before private student queries  |
| Reviewer accesses private student data  | Reviewer role is limited to review services                       |
| Hidden assessment answers leak          | DTO filtering excludes answer keys and in-progress answer details |
| Unpublished content leaks               | Published-content service returns only approved published DTOs    |
| Raw database error leaks                | Error translation returns controlled public messages              |
| Service-role key enters browser bundle  | Dedicated server-only client factory and package tests            |
| Partial multi-write update              | Transaction runner for multi-write services                       |
| Audit log contains sensitive free text  | Audit input uses minimal structured metadata                      |

## Prompt-Injection And AI Boundary

The data-access layer does not expose unrestricted database access to the future AI mentor. AI retrieval must call approved application services and may receive only DTOs permitted for the authenticated student and learning context.

## Residual Risks

- Live RLS behaviour still needs an integration test environment with seeded users, cohorts, and policies.
- Service-role misuse must be reviewed whenever a new administrative service is added.
- Frontend route integration must be reviewed to ensure no feature module bypasses the service layer.
