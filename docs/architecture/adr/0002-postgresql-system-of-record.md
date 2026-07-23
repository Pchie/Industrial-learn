# ADR 0002: PostgreSQL System Of Record

Status: Proposed

## Context

Industrial Learn needs relational ownership, cohorts, assignments, progress, assessment attempts, project submissions, content status, review records, source reference metadata, and audit records. Database changes must use version-controlled migrations. Sources: IL-AGENTS-001, IL-PRD-001.

## Decision

Use PostgreSQL as the primary system of record for operational data.

## Consequences

- Relational access-control and progress queries can be modelled directly.
- Migration discipline is required from the first database change.
- Large binary files should remain outside PostgreSQL and be referenced through metadata.
