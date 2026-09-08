# Dashboard Live Staging Release Verification

Date: 2026-09-08. Environment: staging only.

Status: live verification and browser regressions passed, with the run-level caveats
recorded below. This report is not production or student-invitation approval.

## Release Identity

- The requested dashboard and shared layout were already merged through
  [PR 41](https://github.com/Pchie/Industrial-learn/pull/41).
- Verified application commit: `93e3d52b2e262b984eb4675bf695740a05cc79bc`.
- [Development CI](https://github.com/Pchie/Industrial-learn/actions/runs/34224691360)
  passed for that exact commit.
- [Staging site](https://industrial-learn-staging-git-development-kolobe.vercel.app).
- [Immutable deployment](https://industrial-learn-staging-n12itwrce-kolobe.vercel.app),
  GitHub deployment `6327287471`, successful Preview deployment.
- The protected readiness endpoint confirmed the same commit, environment `staging`,
  and working configuration, Auth provider and database.
- Supabase target: `lgjujyaclrpaopdabyzg`. Production was not queried or changed.
- Initial local state: clean `development`, synchronized with `origin/development`.
- Follow-up branch: `codex/live-staging-release-verification`.
- Delivery pull request: [PR 42](https://github.com/Pchie/Industrial-learn/pull/42),
  targeting `development`. Its release-verification comment records the final merged
  commit, CI run and post-merge staging identity without a self-referential report hash.

The existing layout was preserved. No application feature, engineering equation,
reviewed lesson, assessment answer, dependency or production setting was changed.
The test launcher now defaults to a fresh fixture server, with explicit local debugging
reuse only. README instructions were corrected to reflect the actual implemented platform
and this verification workflow.

## Database Defect And Correction

The Prompt 49 governance finding was independently reproduced: an ordinary
authenticated database role could read three legacy lesson rows and three simulation
rows without exact review evidence. The application catalogue already excluded them.
This was a real database-policy gap, not cross-student disclosure.

Migration `0020_require_reviewed_lesson_simulation_publication.sql` adds a bounded,
server-side boolean evidence predicate and restrictive SELECT policies. These intersect
with the existing parent/course rules. Access requires the current published version,
matching identity, non-archived content, an independent exact-version engineering
approval, completed assignment, source/equation/educational/accessibility/safety
attestations, matching source sets and no later rejection. Simulation publication also
requires simulation review and test references.

The expanded rollback matrix then exposed an unassigned-lecturer edge case in the first
correction. Migration `0021_scope_lecturer_publication_evidence_access.sql` narrows that
exception to authorized modules. It was added separately rather than rewriting the
already-applied migration. An additional positive-access test caught the restrictive
gate blocking migration `0015`'s Platform Owner read-only oversight. Migration
`0022_preserve_owner_content_oversight.sql` preserves that explicit SELECT exception
without adding the owner to `is_content_staff`, which would inherit write access.
Assigned lecturers and technical content staff retain their intended access; authors,
reviewers and owners still cannot read private student progress.

All three migrations were applied to staging in explicit transactions, each with its migration
ledger insertion. No lesson/simulation status, content, review, existing student record
or historical audit was edited or deleted. The six fixtures remain available to authorized
staff, not ordinary students. No real content was approved by the verification process.

The live ledger now contains 21 migrations through `0022`. Migration `0010` remains
intentionally held for Bernoulli review, as documented in Prompt 44. It was not silently
applied by an unrestricted migration push.

## Security And Transaction Evidence

- All 37 public tables have RLS enabled.
- Assessment start/completion, simulation completion and pilot-progress mutations remain
  executable by `service_role`, not `anon` or `authenticated`.
- The existing five live JWT integration checks and two new publication checks run with
  temporary student tokens in process memory, not committed environment files.
- Rollback-only synthetic fixtures prove positive published access, 14 invalid-evidence
  cases across lessons/simulations, old-version denial, self-review denial, required
  simulation evidence, six legacy-fixture denials, scoped lecturer/staff access and
  preserved read-only owner oversight. Both the rollback matrix and seven live JWT tests
  were repeated successfully after `0022`; all temporary accounts were removed.
- A real completed synthetic attempt survived a same-key retry with changed proposed
  answers/score/competency unchanged and without a duplicate audit. A different final key
  was rejected.
- A deliberately late NOT NULL failure rolled back attempt scoring, competency, lesson
  progress and completion audit together. The surrounding transaction also removed the
  extra started test attempt.
- All generated technical approval fixtures exist only inside rollback transactions.
  They are explicitly test evidence, not engineering approval.

## Reproducible Database Regression

After the migration is installed, an authorized staging operator can run:

```bash
STAGING_ENV_FILE=.env.staging.local node scripts/verify-staging-publication.mjs
```

This requires the existing PostgreSQL `psql` operator tool, not a new npm dependency.
The command checks the exact staging project and database host/user, wraps
`database/tests/publication-evidence.rollback.sql` in `BEGIN`/`ROLLBACK`, and does not
print credentials. It rejects production or mismatched targets. It does not apply
migrations or change publication state. Synthetic rows are never committed.

The separate JWT integration suite uses `RUN_STAGING_DB_INTEGRATION=true` and the
documented `STAGING_STUDENT_*` inputs. For this run, those values were supplied only
to the test process. The ordinary unit command intentionally skips live network tests;
the explicit live command executes them, rather than counting skips as passes.

## Verification Results

| Check                              | Result                                                                          |
| ---------------------------------- | ------------------------------------------------------------------------------- |
| Secret scan                        | PASS; no env, credentials, dependencies or build output staged                  |
| Formatting                         | PASS                                                                            |
| Strict type checking               | PASS                                                                            |
| Linting                            | PASS                                                                            |
| Content validation                 | 29 passed                                                                       |
| Migration validation               | 28 passed                                                                       |
| Unit suite                         | 447 passed; seven opt-in live tests separately executed                         |
| Live JWT integration               | 7 passed; zero skips                                                            |
| Live browser/database journey      | 36 checks passed; zero page-level JavaScript errors                             |
| Live dashboard accessibility       | No WCAG A/AA violations at 375, 768 and 1536 px; no horizontal overflow         |
| Publication rollback matrix        | PASS, including positive access and scoped staff exceptions                     |
| Completion retry and late rollback | PASS                                                                            |
| Production-mode builds             | PASS; application source unchanged by the database correction                   |
| Full local browser suite           | 169 passed; one preview test readiness race corrected, then 5/5 repeated passes |
| Synthetic account cleanup          | Both final-run accounts removed; zero remaining private rows                    |

The live flow used two genuine temporary Supabase Auth accounts, not local E2E fixtures.
The final run began at `2026-09-08T17:50:42Z`. Both students signed out and back in,
reviewed their own attempts, and retained their separate scores. Student B could not
open Student A's completed review. Direct score, version and competency updates and
student invocation of the trusted completion RPC returned HTTP 403.

The three screenshot artifacts were directly inspected. They show a new and an active
synthetic student on the actual protected staging deployment, not an invented dashboard:

- [New student](../design/evidence/live-staging-dashboard/new-student-desktop.png)
- [Active student desktop](../design/evidence/live-staging-dashboard/active-student-desktop.png)
- [Active student phone](../design/evidence/live-staging-dashboard/active-student-mobile.png)
- [Sanitized live results](../design/evidence/live-staging-dashboard/results.json)

Cleanup verifies deletion of the exact created Auth user, profile, attempts and lesson
progress for both final-run identities. Earlier interrupted harness runs also cleaned up
their own exact accounts. Audit history was retained; no real students were used.

The live student path verifies saved progress, unit conversion, score, competency and
dashboard persistence. `0.4 kPa` earns 6/6 and Calculated 2 / Understood 4. The correct
magnitude with unit `N` instead of pressure earns 4/6, with no Calculated credit. This
does not change reviewed scoring logic.

## Corrections During Verification

- The first local browser launch was blocked by sandbox loopback-listen permissions.
  It executed no tests. The server was restarted with the appropriate permission; no
  tests or assertions were disabled.
- Early live harness assertions expected an exact `Learn` title rather than the existing
  `Browse Industrial Learn`, and a bare name rather than the dashboard's welcome heading.
  They were corrected to the rendered contract, not by changing the product.
- Next.js streamed Not Found pages returned HTTP 200 after headers were sent. Verification
  checks the actual Not Found boundary and absence of protected content, not an unsupported
  claim that every streamed denial returns HTTP 404.
- The harness now waits for sign-out navigation to complete before requesting a protected
  page; immediately navigating had interrupted that action during an earlier run.
- The first rollback fixture omitted required lesson metadata and failed closed. Its
  synthetic metadata was completed before the positive/negative policy tests passed.
- The unassigned lecturer regression genuinely failed against `0020`; `0021` fixes it.
- The owner positive-access regression failed against `0021`; `0022` preserves the
  existing read-only exception while the same test proves private progress remains hidden.
- The first full browser run passed 169/170; one two-theme Bernoulli accessibility/screenshot
  case exceeded 30 seconds while live browser work was running concurrently. Its rendered
  page and both screenshots were present. Assertions and timeouts were not weakened.
- A subsequent run incorrectly reused the local fixture server. Existing completed attempts
  and review assignments caused three strict-locator failures; the run was stopped after
  69 passes (one interrupted case and 97 not run). No staging data was involved. The test
  launcher now creates a fresh server by default; `PLAYWRIGHT_REUSE_SERVER=true` is a
  deliberate debugging opt-in only. The complete suite is rerun from a clean fixture state.
- A fresh run exposed a demo test measuring the retained sidebar immediately after URL
  navigation, before the streamed preview arrived and applied its reserved disclosure
  spacing. The test now waits for the disclosure to be visible before measuring either
  box. The no-overlap assertion and timeout are unchanged; no application CSS was altered.
  The fresh full run ended with 169 passes and that one failure (17.5 minutes). The
  corrected case then passed five consecutive executions against another fresh server
  (1.5 minutes including the build). All 170 distinct scenarios therefore have passing
  evidence across these runs; this is not described as a single 170/170 full-suite run.

Commands included `npm run ci`, `npm run typecheck`, `npm run lint`,
`npm run scan:secrets`, `npm run format:check`, `npm run validate:migrations`,
`npm run test:unit`, `npm run build`, and `npm run test:e2e`. The live JWT suite was
invoked with the opt-in environment and `--testTimeout=30000`, appropriate for sequential
remote REST checks. Browser-only local test variables were restricted to the local
build/server; staging continued to use Supabase authentication and real persistence.

The targeted browser command was:

```bash
npm run test:e2e -- tests/e2e/reference-dashboard.spec.ts --grep 'preview disclosure never covers' --repeat-each=5
```

No permanent skip, reduced assertion, increased timeout or automatic retry was added.
The local fixture's deliberately simulated database-error log is expected in its passing
error-boundary test. The `NO_COLOR`/`FORCE_COLOR` notices concern terminal rendering,
not application failures.

## Remaining Boundaries

- This is a verified staging release, not a claim that every possible function, browser,
  device or network condition is perfect.
- No standalone simulation is currently approved for ordinary students. The empty lab and
  blocked hydraulic/Bernoulli routes are intentional governance, not broken links to unlock.
- The reference demo remains local/test-only. Fictional courses, scores and AI Mentor are
  not exposed as real student functionality.
- Synthetic Auth accounts are confirmed administratively without sending email. External
  signup/verification mail and end-to-end password recovery are not proven by these tests.
  The account-lifecycle issues recorded in Prompt 49 remain a separate release gate.
- Vercel protection remains enabled. Automation used the existing private bypass only for
  the exact staging origin. Do not give students that bypass or privileged credentials.
- Emergency withdrawal/recovery rehearsal, named pilot operators, external participant
  access and human assistive-technology checks remain the separate Prompt 49 operational
  gates. Passing this verification does not close those gates or invite students.
- The database policy fix does not add live revocation to the bundled public lesson
  renderer. Emergency withdrawal still needs the documented release-level procedure.
- No production deployment, production migration, invitation, email or AI Mentor work occurred.

## Next Step

Finish the remaining controlled-pilot operational gates from Prompt 49, especially
external email/recovery and safe participant access, then obtain a fresh pilot readiness
decision. Continue using development/staging; do not promote this work to production on
the strength of visual or automated-test results alone.
