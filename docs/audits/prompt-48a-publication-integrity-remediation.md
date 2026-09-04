# Prompt 48A Publication Integrity Remediation

Audit date: 2026-09-04

Target environment: Supabase staging `lgjujyaclrpaopdabyzg`

Production changes: none

## Executive Status

Implementation and local verification are complete. Live assessment publication remains
blocked until the independently assigned engineering reviewer records an assessment-v2
approval. This report must be updated with the resulting review, publication, deployment,
and synthetic-student evidence before the final Prompt 48A verdict is issued.

## Remediation Implemented

- Established assessment v2 as the canonical lesson-aligned artifact without changing its
  questions or answers.
- Added a reusable exact-version application publication gate.
- Added staging migration `0019` with exact governance, review, lesson-version, hash,
  source, equation, outcome, and answer-protection checks.
- Added an unapproved staging review-item seed for v2.
- Moved attempt creation into an atomic service-only transaction.
- Extended atomic completion to persist external governed lesson progress.
- Removed direct authenticated writes to attempts and lesson progress.
- Kept direct student access to answer choices and private question explanations closed.
- Added a server-verified lesson challenge completion action.
- Projected persisted lesson, assessment, and competency evidence into the dashboard.
- Added `/learn/pilot` without publishing the parent module.
- Corrected narrow-screen header flex behavior at 320, 375, and 430 px.
- Extended the reviewer workspace to inspect an assessment-specific exact-version item.

## Local Verification To Date

| Check                                  | Result                                                |
| -------------------------------------- | ----------------------------------------------------- |
| PostgreSQL staging rollback validation | PASS                                                  |
| Strict type checking                   | PASS                                                  |
| Unit/integration suite                 | PASS: 382 passed, 5 opt-in live tests skipped         |
| Production build                       | PASS: 39 generated static entries plus dynamic routes |
| Focused browser/accessibility suite    | PASS: 50 tests                                        |
| Secret scan                            | PASS                                                  |
| Formatting                             | PASS                                                  |
| Lint                                   | PASS                                                  |
| Content validation                     | PASS: 29 tests                                        |
| Migration validation                   | PASS: 24 tests                                        |
| Smoke                                  | PASS: 5 tests                                         |
| Full end-to-end suite                  | PASS: 113 tests                                       |
| Live migration and review-item seed    | Pending                                               |
| Independent assessment review          | Pending human action                                  |
| Controlled assessment publication      | Blocked by review                                     |
| Live synthetic-student flow            | Blocked by publication                                |

## Security Position

The current code fails closed. A version 1 row cannot launch when the catalogue requires
version 2. The v2 seed cannot make the assessment public. Correct answers remain in the
server-imported assessment artifact and reviewer evidence, not in pre-submission student
delivery. Progress and completion writes require trusted server transactions.

## Provisional Verdicts

| Area                               | Verdict                                                       |
| ---------------------------------- | ------------------------------------------------------------- |
| Assessment version integrity       | BLOCKED pending live review/publication                       |
| Assessment governance              | PARTIAL                                                       |
| Assessment browser flow            | BLOCKED on staging; PASS locally                              |
| Authenticated progress persistence | PARTIAL pending live persistence test                         |
| Parent module / pilot navigation   | PASS WITH PILOT COLLECTION                                    |
| Mobile header                      | PASS                                                          |
| Publication integrity              | FAIL until staging v2 is independently approved and published |
| Complete pilot flow                | NOT READY                                                     |
| Prompt 49 readiness                | NO-GO pending live evidence                                   |

No student pilot may begin from this provisional report.

The only recurring informational warning was Playwright's existing note that `NO_COLOR`
is ignored when `FORCE_COLOR` is set. The intentionally simulated dashboard-failure case
logged its expected server error and passed its safe-error-page assertion.
