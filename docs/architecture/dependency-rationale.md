# Dependency Rationale

## Purpose

This file documents why each initial application dependency is required before dependency installation.

## Runtime Dependencies

| Dependency                                  | Owning module                       | Why it is required                                                                                        | Notes                                                                                                |
| ------------------------------------------- | ----------------------------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `next`                                      | `apps/web`                          | Provides the Next.js App Router web application framework requested for the application foundation.       | Used for routing, build, server rendering, error boundaries, loading states, and not-found handling. |
| `react`                                     | `apps/web`                          | Required by Next.js for UI rendering.                                                                     | UI only; engineering formulas must not live in React components.                                     |
| `react-dom`                                 | `apps/web`                          | Required by Next.js and React for browser rendering.                                                      | Browser runtime dependency.                                                                          |
| `zod`                                       | `packages/env`, `packages/database` | Provides runtime environment-variable and data-access input validation.                                   | Used to validate Supabase configuration, route/service inputs, IDs, pagination, and audit metadata.  |
| `@supabase/supabase-js`                     | `packages/database`                 | Provides Supabase client creation for PostgreSQL-compatible session-bound and administrative data access. | Service-role usage must stay server-only and explicitly justified.                                   |
| `@industrial-learn/assessment-core`         | `packages/database`                 | Allows trusted server-side assessment scoring using the existing verified domain logic.                   | Prevents browser-only trusted scoring.                                                               |
| `@industrial-learn/content-review-workflow` | `packages/database`                 | Allows content governance persistence to reuse the existing review workflow types and status model.       | Keeps persistence aligned with domain governance rules.                                              |
| `@industrial-learn/engineering-core`        | `packages/database`                 | Allows explicit supported SI normalisation before scoring numeric engineering answers.                    | Conversions remain explicit and validated.                                                           |
| `@industrial-learn/simulation-engine`       | `packages/database`                 | Allows registered simulation validation and server-side assessment-mode simulation scoring.               | Stores attempt summaries rather than animation frames.                                               |
| `@industrial-learn/engineering-core`        | `apps/web`                          | Provides the existing structured calculation-result type consumed by the visual Live Equation boundary.   | Type-level integration only; visual components do not execute or duplicate engineering formulas.     |
| `@industrial-learn/content-review-workflow` | `apps/web`                          | Provides the shared fail-closed publication visibility policy to server loaders and delivery adapters.    | Internal workspace dependency only; it centralises status decisions and adds no external package.    |

## Security Override Status

No npm dependency override is currently required. Next.js `16.3.3` declares patched
PostCSS `8.5.23` and Sharp `^0.35.3` dependencies directly. The earlier scoped
overrides were removed on 2026-08-30 after that framework patch was installed and
validated.

Transitive Nano ID `3.3.18` and brace-expansion `5.0.9` are locked within the ranges
already declared by their parent packages. They were updated directly in the lock
file to remediate the applicable denial-of-service advisories without changing
application features or adding a dependency.

## Development Dependencies

| Dependency             | Owning module | Why it is required                                                                              | Notes                                                     |
| ---------------------- | ------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `typescript`           | repository    | Provides strict TypeScript type checking.                                                       | Required for `npm run typecheck`.                         |
| `eslint`               | repository    | Provides linting.                                                                               | Required for `npm run lint`.                              |
| `@eslint/js`           | repository    | Provides base ESLint JavaScript rules.                                                          | Used by flat ESLint configuration.                        |
| `typescript-eslint`    | repository    | Adds TypeScript-aware linting.                                                                  | Supports strict TypeScript lint rules.                    |
| `prettier`             | repository    | Provides formatting and formatting checks.                                                      | Required for `npm run format` and `npm run format:check`. |
| `vitest`               | repository    | Provides unit-test runner.                                                                      | Required for `npm run test:unit`.                         |
| `@playwright/test`     | repository    | Provides end-to-end browser testing.                                                            | Required for `npm run test:e2e`.                          |
| `@axe-core/playwright` | repository    | Adds automated WCAG-oriented accessibility scans to the existing Playwright browser test suite. | Test-only dependency; does not replace manual review.     |
| `@types/node`          | repository    | Provides Node.js TypeScript types.                                                              | Required by configuration and environment package.        |
| `@types/react`         | `apps/web`    | Provides React TypeScript types.                                                                | Required for strict TSX type checking.                    |
| `@types/react-dom`     | `apps/web`    | Provides React DOM TypeScript types.                                                            | Required for React DOM typing.                            |

## Installation Rule

Future dependencies must be added to this file before installation, including purpose, owning module, alternatives considered where relevant, and security or privacy notes.
