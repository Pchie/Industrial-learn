# Industrial Learn Technology Decisions

## Source IDs

- IL-AGENTS-001: `AGENTS.md`
- IL-PRD-001: `docs/product/product-requirements.md`
- IL-MVP-001: `docs/product/mvp-scope.md`
- IL-JOURNEY-001: `docs/product/user-journeys.md`

## Decision Status Terms

- Proposed: recommended architecture direction, not yet implemented.
- Accepted: approved for implementation.
- Deferred: intentionally delayed until after MVP.
- Revisit: should be reassessed when scale, team, or requirements change.

## Major Technology Decisions

| Decision                             | Status   | Summary                                                                  | ADR                                                  |
| ------------------------------------ | -------- | ------------------------------------------------------------------------ | ---------------------------------------------------- |
| Modular web application              | Proposed | Use a modular web architecture with clear feature and domain boundaries. | `adr/0001-modular-web-application.md`                |
| PostgreSQL system of record          | Proposed | Use PostgreSQL for operational relational data.                          | `adr/0002-postgresql-system-of-record.md`            |
| Object storage for files             | Proposed | Store binary assets outside PostgreSQL with metadata in PostgreSQL.      | `adr/0003-object-storage-for-files.md`               |
| Source-controlled structured content | Proposed | Keep reviewed content and knowledge files structured and version-aware.  | `adr/0004-structured-content-and-knowledge-files.md` |
| Pure calculation library             | Proposed | Keep engineering formulas in pure tested functions outside UI.           | `adr/0005-pure-engineering-calculation-library.md`   |
| Dedicated simulation boundary        | Proposed | Separate simulation UI, state, logic, and calculation calls.             | `adr/0006-simulation-boundary.md`                    |
| Review-gated content approval        | Proposed | Require review records before approved student-use status.               | `adr/0007-review-gated-content-approval.md`          |
| Search before AI mentor              | Proposed | Build search and reviewed retrieval before introducing AI mentor.        | `adr/0008-search-before-ai-mentor.md`                |
| Managed MVP deployment               | Proposed | Prefer managed services for initial operations.                          | `adr/0009-managed-mvp-deployment.md`                 |

## Recommended First-Release Stack Direction

The first release should use a TypeScript-based web stack, PostgreSQL, object storage, a server-side application layer, a pure calculation package, a dedicated unit conversion package, structured content files, and background jobs for indexing and analytics.

This is a proposed direction, not an implementation. No dependency should be installed without documenting why it is required. Source: IL-AGENTS-001.

## Deferred Decisions

These decisions should be deferred until the MVP needs them:

- Dedicated AI mentor provider and model strategy.
- Dedicated vector database.
- Native mobile applications.
- Large-scale simulation engine.
- Learning management system integrations.
- Multi-institution administration model.
- Advanced analytics warehouse.

Source: IL-MVP-001.

## Dependency Rule

Every future dependency must include:

- Name.
- Purpose.
- Owning module.
- Reason it is required.
- Alternatives considered.
- Security or privacy notes.
- Test impact.

No dependency should be installed without this documentation. Source: IL-AGENTS-001.
