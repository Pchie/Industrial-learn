# Prompt 41 Remediation Planning Report

Date: 2026-08-28
Mode: planning and verification only
Repository changes: four requested documentation artifacts only

## Executive Verdict

**PASS for remediation planning.** Prompt 40's four principal blockers were reproduced or
traced to exact application, content, database, environment, and Git boundaries. No issue
was fixed, no content or equation was altered, no dependency was added, no migration was
applied, no deployment occurred, and no commit was created.

Prompt 42 may proceed only as a tightly scoped remediation implementation for the Git and
publication controls. A controlled student pilot remains NO-GO until staging is restored,
live RLS passes, and one bounded content version receives named independent approval.

## Exact Root Causes

### 1. Lesson Visibility

`getLessons()` and `getLessonBySlug()` return an unrestricted array of structured JSON.
`generateStaticParams()` enumerates that array and `LessonPage` renders any matching slug.
Neither path evaluates `publicationStatus` or `reviewStatus`. The curriculum data service
repeats the pattern for draft module, lesson, and pathway metadata. Database RLS is bypassed
because the content is already bundled in the application.

### 2. Simulation Publication

The simulation catalogue hard-codes Hydraulic Cylinder Force and Bernoulli Flow Lab as
`available` despite unapproved review/publication metadata. Public detail resolution trusts
the registry. Authenticated Supabase resolution uses service-role queries that require only
`publication_status=published`, so RLS cannot supply the omitted review and parent checks.
Direct URLs and lesson-embedded visuals inherit these incomplete decisions.

### 3. Supabase Staging

The dedicated linked staging project reports `INACTIVE`. Its Auth hostname does not resolve,
and linked migration inspection times out. Required staging environment keys are present in
an ignored local file and validation passes without printing values, but current values,
Auth configuration, callback settings, migration state, synthetic users, and live RLS cannot
be positively attested while the project is inactive. The current RLS harness also lacks the
two students' short-lived tokens and profile IDs.

### 4. Git State

The branch is still based on `e094d985f2be55f3ac96bcb23750863ed4a05d7f`, matching
`origin/development`, but Prompt 39 work accumulated as 58 tracked changes and 105 untracked
files before this task. The four Prompt 41 deliverables bring the final untracked count to 109. Shared files contain changes from multiple prompts, and untracked migration `0010`
would register an unapproved simulation as `published`. The tree has no auditable release
identity and must not be committed wholesale or deployed.

## Severity And Order

The most severe blocker is **public lesson delivery**, because Prompt 40 demonstrated a
complete draft/source-gated lesson through the public application route. The simulation
bypass is co-critical and has broader service/persistence implications. Git state is handled
first operationally so those security changes can be reviewed safely; Supabase restoration
then enables current live proof.

Recommended order:

1. isolate audit/planning evidence and assign every dirty file to a commit group;
2. create the shared fail-closed student-visibility predicate;
3. close lesson enumeration, direct-route, curriculum, and embedded paths;
4. close simulation catalogue, direct-route, service-role, attempt, and embedded paths;
5. reconcile fixture/migration semantics after the live state is known;
6. pass all local gates and create reviewable commits/PR;
7. have the operator restore and attest Supabase staging;
8. reconcile migrations and run the expanded live RLS matrix;
9. obtain named independent approval for one bounded pilot version; and
10. deploy that exact reviewed commit to protected staging and make a pilot decision.

## Action Ownership

### Codex Can Complete After Authorization

- prepare the safe commit split and staged-file evidence;
- implement and test the shared publication predicate;
- remediate lesson and simulation delivery paths;
- prepare a conditional additive migration when the live state is known;
- run local quality/security gates;
- run project, migration, RLS, and deployed-route checks after secrets and staging access are
  available; and
- update the evidence and release-gate reports.

### Human Action Is Required

- resume or restore Supabase staging and resolve its inactive billing/pausing state;
- confirm Supabase Auth provider and exact callback settings in the dashboard;
- attest Vercel Preview/Development secret bindings;
- authorize live migration and synthetic-user operations;
- provide named independent engineering, education, safety, and accessibility reviews;
- approve the pull request and integration into `development`; and
- authorize a controlled student pilot and rollback.

No automated agent may self-approve technical content.

## Risk Assessment

| Work                     | Risk                                  | Control                                                                                               |
| ------------------------ | ------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Commit split             | Medium-high                           | Path/hunk staging, focused tests per commit, full CI before PR.                                       |
| Lesson gate              | Medium                                | Fail closed, preserve staff preview separately, test direct URLs and static params.                   |
| Simulation gate          | Medium-high                           | Central rule, service-role status and parent checks, attempt-start recheck, history regression tests. |
| Migration reconciliation | High until live state is known        | Never edit applied history; compare first; use a conditional additive migration and preflight.        |
| Supabase restore/secrets | Medium                                | Staging-only project-ref attestation; no value output; production remains unlinked.                   |
| Human content approval   | Low code risk, high governance impact | Independent named records tied to exact content version.                                              |

## Verification Performed

| Verification                                                       | Result                                                                              |
| ------------------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| `git status --short --branch` and branch/remotes                   | Confirmed dirty feature branch and baseline identity                                |
| Tracked/untracked count                                            | 58 tracked changes; 105 untracked before Prompt 41, 109 after its four deliverables |
| Lesson route/registry trace                                        | Confirmed unrestricted enumeration and lookup                                       |
| Curriculum route/data trace                                        | Confirmed draft metadata projection                                                 |
| Simulation registry/detail/service trace                           | Confirmed availability and service-role bypasses                                    |
| Migration `0005` inspection                                        | Confirmed correct published-plus-approved RLS predicate                             |
| Migrations `0009` and `0010` inspection                            | Confirmed unapproved-plus-published fixture semantics                               |
| `supabase projects list`                                           | Staging `INACTIVE`; production not linked                                           |
| `supabase migration list --linked`                                 | Failed with staging login-role timeout                                              |
| Staging Auth health check                                          | DNS unresolved; HTTP `000`                                                          |
| `STAGING_ENV_FILE=.env.staging.local npm run validate:staging-env` | PASS; no values printed                                                             |
| Environment ignore check                                           | Local/staging/production local env files are ignored                                |
| `npm run scan:secrets`                                             | PASS                                                                                |
| `npm run format:check`                                             | PASS                                                                                |
| `npm run typecheck`                                                | PASS across all TypeScript workspaces                                               |
| `npm run lint`                                                     | PASS                                                                                |
| Blocker-map JSON parse and scoped `git diff --check`               | PASS                                                                                |

The Prompt 40 local test evidence remains valid for the inspected worktree: formatting,
type checking, lint, content/migration validation, unit tests, build, smoke, accessibility,
and E2E passed as recorded in `docs/audits/prompt-40-test-results.md`. Prompt 41 reran the
read-only secret, formatting, type-checking, and lint gates listed above. Content/migration
validation, unit, build, smoke, accessibility, and E2E were not rerun because Prompt 41
changes documentation only and must not alter implementation.

## Deliverables

- `docs/remediation/prompt-40-remediation-plan.md`
- `docs/remediation/prompt-40-blocker-map.json`
- `docs/remediation/prompt-40-release-gate-matrix.md`
- `docs/audits/prompt-41-remediation-planning-report.md`

## Remaining Risks

- Supabase staging remains inactive and live state remains unknown.
- No current visual lesson or simulation is approved for student use.
- Prompt 39 implementation remains uncommitted and contains known publication bypasses.
- Migration `0010` remains untracked and must not be applied as written.
- Historical Vercel deployment bundles must remain protected until corrected routes replace
  them.
- The existing four-test staging RLS harness must be expanded for the Prompt 40 exit matrix.

## Prompt 42 Readiness

**GO WITH SCOPE RESTRICTION.** Prompt 42 may implement Git recovery and the fail-closed
lesson/simulation publication remediation. It may not add features, approve content, apply
live migrations, deploy, start a student pilot, touch production, or begin AI Mentor work.
