# Prompt 42 Publication Policy Report

Date: 2026-08-28
Scope: Git baseline recovery and shared publication visibility policy only

## Executive Verdict

**PASS for Prompt 42's restricted scope.** The pre-existing worktree was classified path
by path, Prompt 40 and Prompt 41 evidence was isolated into local commits, and a pure,
server-safe publication policy was implemented and tested in the content-review workflow
package. No route was broadly rewired, no content was approved, no migration was applied,
no Supabase project was activated, and nothing was deployed or pushed.

This verdict does not authorize integration, staging deployment, a student pilot,
production, or AI Mentor work. Public lesson and simulation delivery remain unsafe until
Prompt 43 consumes the policy at every listing and direct-resource boundary.

## Git Recovery Result

### Original State

| Item                         | Original value                             |
| ---------------------------- | ------------------------------------------ |
| Branch                       | `codex/prompt-39-approved-sources`         |
| HEAD                         | `e094d985f2be55f3ac96bcb23750863ed4a05d7f` |
| Baseline relation            | Equal to local and remote `development`    |
| Dirty paths                  | 167: 58 modified, 109 untracked, 0 deleted |
| Staged paths                 | 0                                          |
| Unknown paths                | 0 after classification                     |
| Unrelated/pre-existing paths | 0 detected                                 |

Every original dirty path is recorded in
`docs/remediation/git-baseline-recovery.md`. Classification totals are:

| Class | Scope                                    | Paths |
| ----- | ---------------------------------------- | ----: |
| A     | Prompt 39 visual-learning implementation |   157 |
| B     | Prompt 40 audit                          |     4 |
| C     | Prompt 41 remediation planning           |     4 |
| D     | Database/RLS registration work           |     2 |
| E     | Unrelated/pre-existing                   |     0 |
| F     | Unknown                                  |     0 |

### Local Commits Created

| Commit    | Message                                                | Scope                                                         |
| --------- | ------------------------------------------------------ | ------------------------------------------------------------- |
| `ff8319f` | `audit: add Prompt 40 independent staging audit`       | Four Prompt 40 evidence files                                 |
| `b98fc5c` | `docs: add Prompt 41 remediation plan`                 | Four Prompt 41 planning files                                 |
| `3bab559` | `governance: add shared publication visibility policy` | Policy, tests, package export, and recovery/architecture docs |

The final report is intentionally a separate local audit commit so it can cite the earlier
hashes. Its own hash is omitted from the file to avoid a self-referential commit.

No commit was made on `main` or `development`, no history was rewritten, and no push
occurred. The feature branch remains based on `origin/development` at `e094d985`.

### Remaining Worktree

After the first three commits, 159 classified paths remain: 58 modified and 101 untracked.
They are exactly A=157 Prompt 39 paths and D=2 database paths. No file is staged.

The Prompt 39 paths remain prepared in documented ownership groups rather than committed:
shared engine, route, package, lock, and Playwright files contain changes from several
Prompt 39 phases, and the current route/registry code includes the publication defects that
Prompt 43 must close. A broad local commit would be traceable but not sufficiently
reviewable; fabricated prompt-by-prompt history would be worse.

The database group remains explicitly held:

- `database/migrations/0010_bernoulli_flow_simulation_registration.sql`
- `packages/database/src/schema.test.ts`

Migration `0010` must not be applied or staged as written because it registers an
`Engineering review required` simulation as `published`. Live migration state remains
unknown while the dedicated staging project is inactive.

## Secret And Generated-File Safety

`npm run scan:secrets` passed before staging and during every commit review. Staged path
lists were inspected explicitly, and `git diff --cached --check` passed before each commit.

The tracked environment-file list contains templates only:

- `.env.example`
- `.env.staging.example`

The existing `.gitignore` excludes real environment files, the private production-owner
record, dependencies, Next.js output, coverage, Playwright reports, test results, Vercel
metadata, editor/OS files, temporary files, and local databases. Local environment files
were checked by name only; no value was printed. No secret or generated path was staged.

## Shared Policy

### Location And Boundary

The implementation is:

- `packages/content-review-workflow/src/publication-visibility.ts`
- export `@industrial-learn/content-review-workflow/publication-visibility`

The content-review workflow package owns the review and publication lifecycle already. The
policy is pure TypeScript with no React, browser, database-client, filesystem, or service-role
dependency, so server loaders, route handlers, catalogues, search, recommendations, and
related-content projections can reuse the same decision.

### Public And Student Rule

Public or student delivery is allowed only when all gates pass:

1. publication status is `published`;
2. review status is `Approved for student use`;
3. source/evidence status is `approved`;
4. candidate and published versions both exist;
5. candidate version exactly equals the published version;
6. no archival timestamp is present; and
7. a numeric published version does not exceed the numeric current version.

`draft`, `internal`, `scheduled`, `archived`, every intermediate review state, missing or
partial evidence, missing metadata, invalid status values, old versions, superseded
versions, and newer draft candidates all fail closed.

### Internal Role Rule

Internal role labels do not grant draft visibility by themselves:

- an author requires matching ownership or explicit trusted author authorization;
- a lecturer requires explicit trusted lecturer authorization;
- a reviewer requires explicit trusted reviewer authorization; and
- an administrator requires explicit trusted administrator authorization.

The policy returns internal visibility only. It does not approve or publish content, grant
student-data access, replace RLS, or trust browser-supplied authorization flags.

### Version Rule

Only the candidate matching `publishedVersion` is public/student visible. A newer draft may
coexist while the existing published version remains visible. Historical, superseded,
rolled-back, archived, withdrawn, or expired candidates are hidden. Because publication
windows and withdrawal are not first-class fields in the current model, callers must
normalize those states to `scheduled` or `archived` until a version-controlled schema change
adds explicit fields.

## Test Results

### Policy Coverage

The focused workflow run passed **35 tests across two files**. This includes both `public`
and `student` decisions for all seven review statuses, unpublished and internal content,
scheduled/archived/withdrawn/expired normalization, source evidence, missing/invalid
metadata, current and superseded versions, and explicit author/lecturer/reviewer/admin
authorization.

### Repository Quality Gates

| Command                       | Final result                                                        |
| ----------------------------- | ------------------------------------------------------------------- |
| `npm run scan:secrets`        | PASS                                                                |
| `npm run format:check`        | PASS                                                                |
| `npm run typecheck`           | PASS for all workspaces                                             |
| `npm run lint`                | PASS                                                                |
| `npm run validate:content`    | PASS, 19 tests                                                      |
| `npm run validate:migrations` | PASS, 14 tests                                                      |
| `npm run test:unit`           | PASS, 33 files passed and 1 skipped; 302 tests passed and 4 skipped |
| `npm run build`               | PASS, production build completed and 54 pages generated             |
| `npm run test:e2e`            | PASS, 103 Chromium tests in 6.6 minutes                             |

The complete E2E run was permitted by the working tree and was executed. Earlier attempts
are retained as evidence rather than hidden:

1. the first command timed out while Playwright waited 120 seconds for its build-backed web
   server, before any browser test ran;
2. an externally started server without the required local E2E authentication variables
   produced 18 passes and four configuration errors before the run was stopped;
3. the correctly configured first full run produced 95 passes, two timing failures, and six
   tests not run;
4. the two affected specs then passed all eight tests on a fresh server; and
5. a fresh, correctly configured complete run passed all 103 tests without source changes.

The final server was stopped intentionally after the run. Its exit code `130` reflects
`Ctrl-C`, not a test failure.

## Scope Compliance

- No product feature was added.
- No lesson or simulation route was wired to the policy yet.
- No engineering equation or curriculum content was changed by Prompt 42.
- No dependency was installed.
- No database schema, policy, or migration was changed or applied.
- No Supabase or production system was contacted for mutation.
- No deployment or push occurred.

## Known Limitations

1. The shared policy exists but the known public lesson and simulation paths do not yet
   consume it.
2. Structured JSON does not carry the authoritative `publishedVersion`; a server adapter
   must load or derive that relation and deny access when it cannot.
3. Publication start/end, withdrawal, and reviewer assignment are not first-class fields in
   the current inspected model.
4. Trusted role-specific authorization adapters are not implemented; browser input must not
   supply these grants.
5. Database RLS is still a separate enforcement layer, and live staging verification remains
   unavailable while Supabase staging is inactive.
6. The branch worktree is classified but not clean because the mixed Prompt 39 stack and
   held migration group remain uncommitted.

## Exact Prompt 43 Scope

Prompt 43 should enforce this unchanged policy at every student/public delivery boundary:

1. adapt structured lesson metadata and governance version/evidence data to the shared
   contract;
2. filter lesson enumeration, curriculum projections, search, recommendations, related
   content, and static parameter generation;
3. deny direct lesson slugs with safe not-found behavior;
4. gate simulation catalogue entries, direct detail routes, quick start, and attempt start;
5. update trusted service-role simulation lookups to require publication, review, evidence,
   version, and parent-content eligibility;
6. gate lesson-embedded visual simulations independently;
7. derive internal authorization from authenticated server-side ownership/assignment data;
8. add route, direct-URL, embedded, service-role, old-version, and cross-student regression
   tests; and
9. keep migration `0010` unapplied until its publication semantics and live state are
   resolved separately.

Prompt 43 may proceed locally on this feature branch. Integration, staging deployment, and
controlled student-pilot decisions remain blocked until its enforcement tests pass and the
remaining Git/database/staging gates are closed.
