# Academic Source Quality Policy Implementation

Date: 2026-08-30

Branch: `codex/academic-source-quality-policy`

## Change Summary

- Added the permanent academic source quality policy and linked it from `AGENTS.md`.
- Replaced ambiguous `reliabilityLevel` metadata with the policy's Level 1-5
  `authorityLevel` and `authorityCategory` contract.
- Added source-selection rationale, preferred-academic-publisher assessment,
  copyright/access controls, traceability, and conflict metadata.
- Added validator rules for authority/category consistency, Level 3 textbook metadata,
  complete rights records, source conflicts, and independent multiple-source evidence.
- Reclassified existing source records without changing their technical claims.
- Onboarded Penn State's official pressure learning module as Level 4 corroborating
  evidence for Basic Fluid Pressure.
- Refreshed the Basic Fluid Pressure draft and its focused knowledge files to version
  `0.3.0`; no equation or calculation logic changed.

## Source Decisions

The official McGraw Hill product listing confirms that _Fluid Mechanics: Fundamentals
and Applications_ by Yunus A. Cengel and John M. Cimbala covers pressure and fluid
statics. It remains an acquisition candidate because no exact edition and lawful project
access are recorded. No textbook content was copied or cited as inspected evidence.

OpenStax remains the primary Level 4 open-textbook source for the pilot. Penn State is a
second Level 4 university source that independently corroborates pressure as normal force
per unit area and the SI unit relationship. Both require independent human source review
before lesson approval.

## Quality Results

| Gate                               | Result                                       |
| ---------------------------------- | -------------------------------------------- |
| Secret scan                        | PASS                                         |
| Formatting                         | PASS                                         |
| Strict TypeScript                  | PASS                                         |
| Lint                               | PASS                                         |
| Content validation                 | PASS, 29 tests                               |
| Migration validation               | PASS, 16 tests                               |
| Unit and integration tests         | PASS, 340 passed and 5 intentionally skipped |
| Production build                   | PASS, 33 generated routes/pages              |
| Smoke tests                        | PASS, 5 tests                                |
| End-to-end and accessibility tests | PASS, 94 tests                               |

The first smoke attempt could not bind the local test server inside the filesystem
sandbox (`EPERM`). The unchanged command passed when rerun with local-port permission.
Playwright emitted the existing informational `NO_COLOR`/`FORCE_COLOR` warning.

## Known Limitations

- No Level 3 university engineering textbook is currently registered as lawfully
  available to the project.
- Source evidence marked `approved` records successful evidence verification, not
  approval of derived content for students.
- Existing source records retain their requirement for independent human review.
- The Basic Fluid Pressure author ID, stable reviewer ID, review decisions, educational
  review, engineering review, and administrator publication authorization remain absent.
- Other draft simulations and significant equations must be assessed against the new
  corroboration rule before any future student-use approval.
