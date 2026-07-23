# Prompt 24 Attempt Persistence Report

## Scope

Connected the existing assessment and simulation domain packages to a secure authenticated persistence service boundary. No assessment scoring logic or engineering calculation logic was changed.

## Persistence Implemented

Created `packages/database/src/attempt-persistence.ts` with:

- Assessment attempt start
- In-progress answer save
- Final assessment submission
- Server-side scoring through `@industrial-learn/assessment-core`
- Explicit supported SI normalisation through `@industrial-learn/engineering-core`
- Completed-attempt review
- Simulation attempt start
- Simulation completion summaries
- Server-side simulation assessment scoring
- Competency award derivation
- Audit event recording
- Transaction and idempotency boundaries

## In-Memory Logic

Production persistence is no longer represented by a production in-memory attempt service. The remaining in-memory usage is isolated to package tests as repository harnesses and the older assessment-core domain test helper.

## Database Changes

Added additive migration:

- `database/migrations/0003_attempt_persistence_metadata.sql`

New metadata includes:

- Assessment content version
- Attempt number
- Idempotency key
- Scoring summary
- Competency awards
- Simulation version
- Simulation lesson ID
- Simulation mode
- Fault, measurements, diagnosis, score, and output summary

## Security Protections

- Attempts are scoped to authenticated student profile IDs.
- Cross-student submission is denied.
- Client score, competency awards, and content version are ignored.
- Hidden answers remain unavailable before submission.
- Unreviewed assessments are protected.
- Duplicate final submission is idempotent.
- Completed attempts cannot be changed.

## Transaction Behaviour

Assessment and simulation completion run inside a transaction runner. Tests verify rollback when competency recording fails.

## Tests Added

`packages/database/src/attempt-persistence.test.ts` covers:

- Start assessment attempt
- Hidden-answer protection
- Valid assessment submission
- Numeric tolerance through existing scorer
- Correct value with wrong unit
- Explicit unit conversion
- Duplicate submission
- Completed-attempt protection
- Cross-student denial
- Transaction rollback
- Start simulation attempt
- Guided completion
- Fault diagnosis summary
- Invalid simulation ID
- Duplicate simulation completion
- Cross-student simulation denial
- Reset does not create false completion
- Assessment-mode simulation scoring

## Commands Executed

| Command                                                                                                             | Result                         |
| ------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| `npm install --package-lock-only --ignore-scripts`                                                                  | Passed                         |
| `npm run format`                                                                                                    | Passed                         |
| `npm run format:check`                                                                                              | Passed                         |
| `npm run typecheck --workspace @industrial-learn/database`                                                          | Passed                         |
| `npm run test:unit -- --run packages/database/src/attempt-persistence.test.ts packages/database/src/schema.test.ts` | Passed, 16 focused tests       |
| `npm run typecheck`                                                                                                 | Passed                         |
| `npm run lint`                                                                                                      | Passed                         |
| `npm run test:unit`                                                                                                 | Passed, 15 files and 128 tests |
| `npm run build`                                                                                                     | Passed, 50 application routes  |
| `npm run test:e2e`                                                                                                  | Passed, 24 tests               |

## Known Limitations

- Supabase/PostgreSQL repository adapters are still required for live persistence.
- Live RLS integration requires a seeded test database.
- Temperature-difference conversion rules need dedicated engineering-core support before graded thermodynamics numeric questions use them.

## Recommended Next Prompt

Implement the Supabase/PostgreSQL repository adapters for `attempt-persistence.ts` and run live RLS integration tests for assessment and simulation attempts.
