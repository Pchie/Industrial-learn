# Prompt 45 Release Candidate Report

Date: 2026-08-30

Release identifier: `student-pilot-rc2`

This report supersedes the earlier Prompt 45 RC1 report for current release-candidate
status. Immutable RC1 evidence remains in `docs/releases/student-pilot-rc1.md` and
`docs/releases/student-pilot-rc1-evidence.md`.

## Executive Verdict

| Decision                     | Verdict                                                       |
| ---------------------------- | ------------------------------------------------------------- |
| Release candidate integrity  | **CONDITIONAL PASS**                                          |
| Protected staging deployment | **PASS**                                                      |
| Prompt 46 readiness          | **NO-GO until one reviewed lesson is published and verified** |

The exact current `development` payload is clean, reproducible, quality-gated, remotely
verified, and deployed to protected staging. Publication controls fail closed and focused
live RLS checks pass. The candidate is conditional only because Industrial Learn has no
genuinely approved and published lesson for the mandatory positive student-delivery test.

## Git Classification And Release Structure

The original working tree was clean on `development` at
`343f14f92f60bbc20a57dec1bb4d8266513fdd2c`, exactly matching
`origin/development`. There were no modified, staged, or untracked Prompt 39-44 files.

The three commits after RC1 were already reviewed and merged:

- `9394cb6` - RC1 release evidence.
- `937cae8` - versioned static technical-review-record enforcement.
- `343f14f` - academic source-quality policy enforcement.

RC2 uses `release/student-pilot-rc2` for release evidence and
`student-pilot-rc2` as an immutable tag on the application payload. RC1 was not moved or
overwritten. `main` and production were not changed.

## Quality Results

Every required local gate passed:

- secret scan;
- formatting;
- strict type checking;
- linting;
- 29 content-validation tests;
- 16 migration-validation tests;
- 340 unit/integration tests, with 5 intentional staging-dependent skips;
- production build with 33 routes;
- 36 accessibility checks;
- 5 smoke tests; and
- 94 end-to-end tests.

The dependency audit reported zero vulnerabilities. GitHub CI run `33310980671` passed on
the exact payload commit. Both Vercel projects reported successful deployment status, but
only `industrial-learn-staging` was used as protected staging evidence.

## Branch Protection Review

Active GitHub repository rulesets protect both integration and production branches.
`development` requires the strict repository verification check and blocks deletion and
force pushes. `main` additionally requires pull requests, one approval, review-thread
resolution, and linear history. Neither ruleset has a bypass actor.

## Protected Staging Verification

GitHub deployment `6166509559` ties Vercel staging deployment
`DgGdoxfu7tGiNnUEVysWdFyVNgZ8` to payload commit `343f14f`. The homepage, curriculum,
Simulation Lab, and sign-in route load. Draft and review-required lessons return the
generic not-found view. The unapproved hydraulic simulation is absent from the catalogue
and denied by direct URL.

The Simulation Lab reports zero approved simulations rather than presenting unfinished
material as available. There is likewise no positive published lesson to display.

## Supabase And RLS Verification

The confirmed staging project is `lgjujyaclrpaopdabyzg`; production was excluded. The
local staging environment passes repository validation and remains ignored by Git.

Read-only live checks confirm the expected migration ledger, complete RLS coverage,
80 policies, no `PUBLIC` table grants, and service-role-only completion functions. A fresh
5-case RLS integration run passed with two temporary students, and both identities and
profiles were removed afterward.

The comprehensive 55-case Prompt 44 matrix remains applicable for role separation,
content-state visibility, assessment/simulation transaction atomicity, idempotency, and
rollback because RC2 changed no database code or authentication code.

## Remaining Risks And Limitations

1. No approved published lesson exists. The positive publication smoke gate is blocked,
   so controlled student pilot and Prompt 46 remain NO-GO.
2. No approved simulation exists; the public Simulation Lab is intentionally empty.
3. Vercel deployment protection prevented unauthenticated command-line access to the exact
   readiness endpoint. Public UI behavior and GitHub deployment identity were verified,
   while RC1 remains the most recent authenticated deployed-session matrix.
4. Reviewer assignment is role-based rather than assignment-scoped.

## Required Next Action

Complete a real, independent engineering review for one source-complete lesson. The review
record must name the reviewer, match the exact content version, record the decision and
date, and include equation and safety outcomes where applicable. Only then may publication
be authorised and the positive/negative deployed publication matrix rerun.

## Change Summary

- Established `student-pilot-rc2` from the clean current integration payload.
- Preserved RC1 history and kept production unchanged.
- Reverified all local gates, dependency state, GitHub protection, exact staging delivery,
  migration state, completion-function privilege boundaries, and focused live RLS.
- Recorded the missing genuine content approval as a release condition rather than
  bypassing it.

## Known Limitation

Prompt 45 is a **CONDITIONAL PASS** and Prompt 46 is **NO-GO** until a real reviewer
approves one lesson and its deployed positive publication test passes.
