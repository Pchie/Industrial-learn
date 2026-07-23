# ADR 0003: Object Storage For Files

Status: Proposed

## Context

Industrial Learn will need lesson assets, simulation assets, project attachments, reviewer attachments, exported reports, and knowledge source files where policy allows storage. PostgreSQL should remain the operational data store, not the binary file store.

## Decision

Use object storage for binary files and store file metadata, ownership, and access policy references in PostgreSQL.

## Consequences

- File access must be authorised through the application.
- Private files should use short-lived access rather than public object URLs.
- Storage lifecycle and upload limits must be defined before production launch.
