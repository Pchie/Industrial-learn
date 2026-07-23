# Industrial Learn Data-Access Layer

## Purpose

Industrial Learn reads and writes private application data through a controlled server-side data-access layer. UI components must call a server action or server route, which then calls an application service, which calls a repository, which uses PostgreSQL or Supabase under row-level security.

Source IDs: IL-AGENTS-001, IL-ARCH-001, IL-DB-001, IL-SEC-001, IL-AUTH-001.

## Implemented Boundary

```text
UI
-> server action or server route
-> application service
-> repository contract
-> PostgreSQL/Supabase client
-> row-level security
```

The initial implementation lives in `packages/database/src/`.

| Module                    | Responsibility                                                          |
| ------------------------- | ----------------------------------------------------------------------- |
| `clients.ts`              | Browser-safe, session-bound, and service-role Supabase client factories |
| `domain.ts`               | DTOs, roles, statuses, pagination, audit input types                    |
| `validation.ts`           | Runtime input validation with strict object schemas                     |
| `authorization.ts`        | Application-layer ownership and role checks                             |
| `errors.ts`               | Public application errors and safe database-error translation           |
| `repository-contracts.ts` | Repository ports and ownership documentation per domain                 |
| `services.ts`             | Application services that validate, authorise, filter, and audit        |
| `audit.ts`                | Audit-event helper for service-layer writes                             |

## Client Types

Browser-safe public operations use only the public Supabase URL and anonymous key. This is suitable for public configuration and non-private browser operations.

Session-bound server operations require an authenticated session access token and run only on the server. These operations still rely on row-level security and application-layer authorisation.

Administrative operations require the service-role key, are server-only, and require an explicit justification string such as `profile-provisioning`, `audit-administration`, `content-publication`, or `account-administration`. The service-role factory throws if it is imported into a browser runtime.

## Runtime Validation

External inputs are parsed through strict schemas. Current schemas cover profile IDs, student record listing, pagination, published content slugs, published assessment IDs, audit events, profile updates, and assessment submissions.

Unknown fields are rejected where practical. Invalid UUIDs, invalid pagination, invalid slugs, invalid enum values, and malformed submissions return the controlled `invalid_input` application error.

## Application Errors

Services expose safe errors:

- `authentication_required`
- `access_denied`
- `resource_not_found`
- `invalid_input`
- `conflict`
- `rate_limited`
- `database_unavailable`
- `unexpected_server_error`

Raw SQL details, table names, stack traces, and secret values are not returned to callers.

## Ownership Enforcement

The service layer enforces ownership before repository calls for private student records:

- Students can read their own profiles, progress, attempts, and submissions.
- Lecturers can read a student only when `lecturerCanAccessStudent()` confirms an authorised cohort relationship.
- Engineering reviewers can read review records but do not receive private student-data access.
- Administrators may use elevated access only through explicit administrative service paths.

These application checks complement row-level security; they do not replace it.

## Output Filtering

DTOs avoid unrestricted table rows. Assessment DTOs exclude hidden answer keys. In-progress assessment attempts suppress answer-review details until the attempt is submitted or graded.

Published lesson lookup returns only repository-approved published content. Unpublished or unapproved content is translated to `resource_not_found` for normal callers.

## Transaction Safety

`TransactionRunner` defines a transaction boundary for multi-write operations. The initial assessment-submission service records audit metadata inside a transaction to prevent partial security records. Future services for project submission, publication, rollback, and competency updates must use the same transaction boundary.

## Audit Events

Audit events are recorded by services for security-sensitive and governance-sensitive writes. Audit metadata must stay minimal and must not include unnecessary free text, secrets, hidden answers, or private submissions.

## Current Limitations

- Supabase repository adapters are contract-ready but not yet implemented against a live database.
- RLS behaviour is documented and covered by SQL policy tests; live RLS integration tests require a configured test Supabase or PostgreSQL environment.
- The current implementation is not yet wired into production frontend routes.
