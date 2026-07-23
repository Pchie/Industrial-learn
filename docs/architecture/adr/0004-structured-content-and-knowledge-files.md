# ADR 0004: Structured Content And Knowledge Files

Status: Proposed

## Context

Industrial Learn depends on reviewed technical content, approved source IDs, content statuses, and connected Core Engineering and Future Engineering modules. Important technical statements must reference approved source IDs. Sources: IL-AGENTS-001, IL-PRD-001.

## Decision

Use structured course content and knowledge files with explicit source IDs, review state, assumptions, limitations, learning outcomes, and activity references.

## Consequences

- Content can be reviewed, searched, and later retrieved by AI services with stronger governance.
- Authors must follow structured content rules rather than writing untracked free-form material.
- Tooling will be needed to validate missing source IDs and invalid status transitions.
