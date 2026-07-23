# ADR 0009: Managed MVP Deployment

Status: Proposed

## Context

The first release must be achievable by a small development team. It must support a responsive web application, PostgreSQL, file storage, background jobs, search, logging, and monitoring without creating unnecessary operational burden. Source: IL-MVP-001.

## Decision

Prefer managed deployment services for the MVP, including managed PostgreSQL, managed application hosting, managed object storage, and managed logging or error monitoring.

## Consequences

- The small team can focus on product correctness and learning value.
- Vendor and hosting decisions must still satisfy security and privacy requirements.
- Infrastructure can be revisited when scale or institutional requirements demand it.
