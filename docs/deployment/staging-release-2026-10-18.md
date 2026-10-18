# Staging release handover — 18 October 2026

## Scope and source

Baseline commit `64bf3e136bcf04171fe6425ec0dc588bbf664a54` preserves the previously uncommitted application, migrations, tests and Stage 1 review. Branch: `codex/stage-1-independent-review`. Review: [PR #44](https://github.com/Pchie/Industrial-learn/pull/44), targeting `development`; do not merge into `main` or promote production as part of this handover.

This follow-up changes the root Next.js pin from 16.3.3 to 16.3.8 and its associated lockfile entries. No new dependency is introduced. The update is required because the baseline CI critical vulnerability gate failed. The [Next.js ImageResponse advisory](https://github.com/advisories/GHSA-vcvr-r3jv-pc5j) identifies the affected versions; this is a dependency finding, not proof that this application's routes are exploitable.

The 18 October lockfile audit reports zero critical, three high and two moderate findings. Remaining packages are brace-expansion, sharp, source-map-js, vitest and @vitest/mocker. Passing the critical-only gate does not resolve those findings. Avoid broad forced upgrades without their own compatibility review.

## Migration state

The 14 October guarded staging ledger query found 24 applied versions: 0001–0025 except intentionally held 0010. Stored hashes for 0020–0025 matched the repository. In particular, 0023–0025 must not be reapplied. No migration was executed in this release task. Recheck the ledger before any later database operation; older migration provenance limitations remain in the Stage 1 review.

## Deployment ownership and observed failures

The automatic feature-branch staging preview for the baseline built successfully but did not inherit staging configuration: readiness returned 503 and environment was development. It was not assigned to the stable staging alias. A build success is not application readiness.

An explicit correctly configured preview was submitted to `kolobe/industrial-learn-staging`, deployment `dpl_8BjV73ChvsgqXrP58St4xTzt5rCL`. Vercel blocked it before building with `TEAM_ACCESS_REQUIRED`: the commit author lacked team access. The October 18 membership check found only the team owner; the Members UI requires a Pro trial to invite additional members. No trial, invitation, billing change or authorship substitution was performed.

The owner selected **pchie will deploy**. The owner must use Vercel's supported authorization/approval route; do not falsify Git attribution, remove access safeguards or present a blocked build as deployed. No production deployment or stable staging alias change was performed by this task.

## Owner deployment checklist

1. Use the latest reviewed commit on PR #44 after its verification results pass. Record its full SHA and exact lockfile identity. Do not deploy from the old base commit alone.
2. Confirm project `industrial-learn-staging`, team `kolobe`, deployment target Preview and Supabase project `lgjujyaclrpaopdabyzg`.
3. Through Vercel's private configuration, ensure the selected preview receives `NEXT_PUBLIC_APP_ENV=staging`, `INDUSTRIAL_LEARN_AUTH_MODE=supabase`, `INDUSTRIAL_LEARN_E2E=false`, the existing stable staging `APP_BASE_URL`, and the matching Supabase URL, public key, server service key, project reference and database connection. Never put credential values in Git, chat, command arguments or browser bundles. Feature-branch previews did not inherit the required branch-scoped settings in the observed run.
4. Resolve Vercel's deployment authorization through the owner's supported workflow. Deploy the reviewed commit; retain deployment protection. Record deployment ID, SHA and target.
5. Before updating the staging alias, verify live and ready endpoints return 200, report staging, and show configuration/auth/database checks passing. Verify an anonymous dashboard request cannot expose protected learner data, and that sign-in renders successfully.
6. Only then point `industrial-learn-staging-git-development-kolobe.vercel.app` to that verified staging deployment. Recheck the alias, health and authentication boundary. Preserve the prior deployment for rollback.
7. Authenticated role/learning and publication-withdrawal acceptance still require approved fixtures and appropriate independent review. The five retired synthetic users must not be silently reactivated. Production remains outside this release.

## Verification interpretation

PR checks and the final task result identify the exact tested patch commit. The baseline fresh-clone run passed install, secret scanning, types, lint, formatting, content/migration validation, 550 unit tests and 18 focused browser tests; seven opt-in live tests were skipped. Baseline hosted CI passed build, accessibility and smoke checks but failed the critical dependency audit. Those historical results do not substitute for patch verification.

The Stage 1 conditional verdict and incomplete MVP workflows remain applicable. AI Mentor remains deferred. Local generated reports, temporary artifacts and the pre-existing duplicate `page 2.tsx` were preserved outside the baseline commit.
