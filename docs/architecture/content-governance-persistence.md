# Content Governance Persistence

## Purpose

Industrial Learn persists content creation, versioning, technical review, approval, publication, rollback, archive, and audit history through PostgreSQL-backed governance records.

Source IDs: IL-AGENTS-001, IL-DB-001, IL-DAL-001, IL-AUTH-001.

## Persistence Model

Additive migration `database/migrations/0004_content_governance_persistence.sql` adds:

- `content_governance_items`
- governance metadata on `content_versions`
- richer review metadata on `review_records`

Governance items track entity type, author, current version, published version, workflow status, publication status, rollback reason, and archive timestamp.

## Workflow

Supported workflow statuses:

```text
Draft
-> Source required
-> Source checked
-> Equation checked
-> Simulation checked
-> Engineering review required
-> Approved for student use
-> Published
-> Revision required
-> Archived
```

Not every content type requires every stage.

## Application Boundary

`packages/database/src/content-governance.ts` defines repository ports and application services. Services enforce roles, self-approval rules, publication gates, version creation, rollback history, and audit recording.

## Versioning

Material edits create a new `content_versions` record. Published versions remain reproducible. Rollback updates the active published version pointer and records audit metadata without deleting withdrawn versions.

## Current Adapter Status

The service boundary and tests are implemented. A live Supabase/PostgreSQL adapter is still required to execute these repository ports against a configured database.
