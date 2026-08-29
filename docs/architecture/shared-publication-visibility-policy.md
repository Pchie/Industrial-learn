# Shared Publication Visibility Policy

Date: 2026-08-28
Status: implemented for shared-domain use; route enforcement is reserved for Prompt 43

## Purpose

Industrial Learn requires one fail-closed decision for whether a content version may be
delivered to an audience. Status badges are informational and are not authorization.

The policy is implemented at:

- `packages/content-review-workflow/src/publication-visibility.ts`
- package export `@industrial-learn/content-review-workflow/publication-visibility`

The content-review workflow is the owner because it already owns review states,
publication transitions, version history, reviewer identity, and approval rules. The new
module is pure TypeScript and has no React, browser, database-client, Node filesystem, or
service-role dependency.

## Contracts

### Audiences

- `public`
- `student`
- `lecturer`
- `content_author`
- `engineering_reviewer`
- `administrator`

### Repository Status Enums

Review status uses the existing sequence:

- `Draft`
- `Source required`
- `Source checked`
- `Equation checked`
- `Simulation checked`
- `Engineering review required`
- `Approved for student use`

Publication status mirrors the PostgreSQL enum in migration `0001`:

- `draft`
- `internal`
- `scheduled`
- `published`
- `archived`

The constants are exported with their TypeScript union types so consumers do not need to
repeat literals.

### Publication Metadata

The policy accepts fields already represented by repository content, source, workflow, or
database models:

- `publicationStatus`
- `reviewStatus`
- candidate `version`
- governance `currentVersion`
- governance `publishedVersion`
- `archivedAt`
- aggregate source `evidenceStatus`
- `authorProfileId`

Versions accept positive integers from PostgreSQL governance records and non-empty strings
from structured content. Number/string coercion is not performed. A mismatched adapter
therefore fails closed.

The policy deliberately does not invent publication-window, withdrawal, supersession, or
review-assignment columns. The current model represents:

- future publication with `scheduled`;
- rollback, withdrawal, and expiry with `archived` plus `archivedAt` or governance history;
- supersession with a candidate version that does not equal `publishedVersion`; and
- reviewer/lecturer authorization as an explicit decision supplied by the trusted caller.

If first-class publication start/end or withdrawal fields are later migrated into the data
model, the shared contract and tests must be extended before those fields affect delivery.

## Public And Student Rule

Public and student delivery is allowed only when every condition is true:

1. `publicationStatus` is `published`.
2. `reviewStatus` is `Approved for student use`.
3. `evidenceStatus` is `approved`.
4. candidate `version` exists.
5. `publishedVersion` exists.
6. candidate `version` exactly equals `publishedVersion`.
7. `archivedAt` is empty.
8. a numeric `publishedVersion` does not exceed numeric `currentVersion` when both exist.

Missing or invalid metadata is denied. `draft`, `internal`, `scheduled`, `archived`, every
intermediate review status, missing evidence, partial evidence, and old/newer candidate
versions are denied.

## Internal Role Rule

Published student-visible content is visible to internal audiences without an additional
grant. Unapproved or unpublished content requires explicit internal authorization:

| Audience             | Required internal authorization                                                                            |
| -------------------- | ---------------------------------------------------------------------------------------------------------- |
| Content author       | Actor matches `authorProfileId`, or the trusted caller supplies `contentAuthorAuthorized`.                 |
| Lecturer             | The trusted caller supplies `lecturerAuthorized`, normally after course/module authorization.              |
| Engineering reviewer | The trusted caller supplies `reviewerAuthorized`, normally after review-assignment/evidence authorization. |
| Administrator        | The trusted caller supplies `administratorAuthorized`.                                                     |

Selecting an internal audience alone does not grant draft access. The policy returns scope
`internal`, not `public`, for these decisions. It does not approve content, modify workflow
state, publish a version, grant student-data access, or replace RLS.

Prompt 43 adapters must calculate authorization from the authenticated server session and
existing ownership, module, workflow, or RLS evidence. Browser-supplied authorization flags
must never be trusted.

## Version Resolution

| Scenario                                | Decision for public/student                                                     |
| --------------------------------------- | ------------------------------------------------------------------------------- |
| Current published version               | Visible if all other gates pass.                                                |
| Newer draft exists                      | The existing `publishedVersion` remains visible; the newer candidate is hidden. |
| Historical published snapshot           | Visible only while it is the current `publishedVersion`.                        |
| Old or superseded version               | Hidden because candidate and `publishedVersion` differ.                         |
| Rolled-back version                     | Hidden after normalization to `archived`.                                       |
| Archived, withdrawn, or expired version | Hidden after normalization to `archived`/`archivedAt`.                          |
| Missing published-version relationship  | Hidden.                                                                         |

Student attempt history may retain bounded submitted-answer or result summaries under its
separate ownership policy. That does not authorize delivery of withdrawn lesson or
simulation content.

## Decision API

`evaluatePublicationVisibility(input)` returns:

- `visible`: boolean;
- `scope`: `public`, `internal`, or `none`; and
- a stable reason code suitable for tests, logs, and safe not-found behavior.

`isContentVisible(input)` is the boolean convenience wrapper.

Consumers must use the decision at both collection and direct-resource boundaries. Filtering
only a catalogue or static-parameter list is insufficient.

## Safe Failure

Public/student checks fail closed for:

- missing or invalid publication status;
- missing or invalid review status;
- missing or invalid evidence status;
- missing candidate or published version;
- candidate/published version mismatch;
- impossible numeric version relationships; and
- archived records.

Internal visibility also fails closed unless the content is public or a trusted caller
provides the role-specific authorization.

## Prompt 43 Integration Boundary

Prompt 43 must consume this policy in:

- structured lesson enumeration and direct lookup;
- curriculum listing and direct routes;
- simulation catalogue filtering;
- standalone simulation detail and attempt-start resolution;
- service-role simulation lookups, including parent content checks;
- lesson-embedded visual simulations;
- search, recommendations, related links, and source projections; and
- static parameter generation.

Prompt 43 must add adapters that derive approved evidence and version relationships. It must
not weaken the policy to accommodate current draft JSON. Until a current published-version
relationship exists, the correct student result is hidden.

## Test Coverage

`publication-visibility.test.ts` covers:

- all seven review statuses;
- draft/internal implications through unpublished checks;
- approved-unpublished and published-unapproved records;
- scheduled, archived, withdrawn/expired normalization, and archival timestamps;
- current published, newer draft, old, superseded, and rolled-back versions;
- missing and invalid runtime metadata;
- missing/partial source evidence;
- public, student, lecturer, author, reviewer, and administrator behavior; and
- explicit internal authorization and fail-closed defaults.

## Known Limitations

- Publication start/end timestamps do not exist in the current content-governance schema.
- Withdrawal is not a first-class content field; current callers must normalize it to
  archived state.
- Reviewer assignment is not a first-class persisted relation in the inspected schema. The
  trusted caller must derive explicit reviewer authorization from existing workflow
  evidence, and Prompt 43 must not infer it from role alone.
- Structured JSON does not currently carry `publishedVersion`; public adapters must obtain
  the relationship from governance data or deny delivery.
- Database RLS remains independently authoritative for row access. This policy closes the
  application-delivery boundary; it does not replace RLS.
