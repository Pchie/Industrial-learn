# ADR 0001: Modular Web Application

Status: Proposed

## Context

Industrial Learn must support students, lecturers, authors, reviewers, assessments, simulations, calculations, projects, progress, and future AI services. The repository rules require separation between UI, business logic, engineering calculations, simulation state, content, assessments, database access, authentication, AI retrieval, and source references. Source: IL-AGENTS-001.

## Decision

Use a modular web application architecture for the first release. Keep feature modules and domain modules separated even if they are deployed in one application runtime.

## Consequences

- A small team can build one deployable product while preserving clear boundaries.
- The architecture can later split services if scale requires it.
- Module ownership and import rules must be documented and tested as the codebase grows.
