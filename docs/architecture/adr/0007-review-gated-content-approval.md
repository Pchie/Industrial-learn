# ADR 0007: Review-Gated Content Approval

Status: Proposed

## Context

Industrial Learn must not label content approved unless a review record exists. Engineering reviewers must check source IDs, equations, assumptions, units, and simulation behaviour. Sources: IL-AGENTS-001, IL-PRD-001.

## Decision

Make content approval a review-gated workflow. Student-facing approved status must require a linked review record.

## Consequences

- Draft and reviewed content remain clearly separated.
- Content status changes require explicit workflow rules.
- Review records become critical operational data and must be auditable.
