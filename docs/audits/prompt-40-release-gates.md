# Prompt 40 Release Gates

Date: 2026-08-27

## Decision Matrix

| Target                        | Verdict            | Blocking gate IDs                                    |
| ----------------------------- | ------------------ | ---------------------------------------------------- |
| Continued staging development | **CONDITIONAL GO** | DEV-01, DEV-02, DEV-03 before integration/deployment |
| Controlled student pilot      | **NO-GO**          | PILOT-01 through PILOT-09                            |
| Production release            | **NO-GO**          | PROD-01 through PROD-10                              |
| AI Mentor implementation      | **NO-GO**          | AI-01 through AI-07                                  |

## Continued Staging Development

Development may continue only on feature branches and without presenting the current
staging deployment to students.

| Gate                                                | Current state                                          | Exit evidence                                                                                                 |
| --------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| DEV-01 Restore staging backend                      | **OPEN**: Supabase staging is `INACTIVE`.              | Auth health, REST health, database connection, and readiness endpoint pass against `lgjujyaclrpaopdabyzg`.    |
| DEV-02 Recover a reviewable Git state               | **OPEN**: 58 modified and 78 untracked status entries. | Prompt 39 work split into intentional commits/PRs; no accidental migration/content inclusion; clean worktree. |
| DEV-03 Close publication bypasses before deployment | **OPEN**: P40-C01 and P40-C02.                         | Direct-slug negative tests for draft/unapproved lessons and simulations pass in server code and live staging. |
| DEV-04 Local quality                                | **PASS WITH CAVEAT**.                                  | Existing passes retained; Playwright startup timeout stabilised.                                              |
| DEV-05 Remote CI                                    | **PASS FOR e094d98 ONLY**.                             | Green CI for the eventual Prompt 39 integration commit.                                                       |

**Permitted now:** source review, code review, feature-branch implementation, local tests,
and remediation planning.
**Not permitted now:** student pilot, approval labels, production promotion, AI retrieval
implementation, or treating the dirty worktree as a staging release.

## Controlled Student Pilot

All gates below are mandatory.

| Gate                                         | Current state       | Exit evidence                                                                                                                                             |
| -------------------------------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| PILOT-01 Stable staging Auth/REST/database   | **FAIL**            | Staging project active and repeatable readiness checks pass.                                                                                              |
| PILOT-02 End-to-end content publication gate | **FAIL**            | Draft/internal/source-required content returns not found or access denied by direct URL and catalogue paths.                                              |
| PILOT-03 Approved pilot content              | **FAIL**            | Named independent reviewer, review date, version, valid source/equation/simulation/safety records, and Approved for student use status.                   |
| PILOT-04 Live authentication lifecycle       | **FAIL/UNVERIFIED** | Registration, verification, sign-in/out, reset, refresh, expiry, profile, roles, and redirect tests pass live.                                            |
| PILOT-05 Live RLS matrix                     | **FAIL/UNVERIFIED** | Current cross-student and role matrix passes for profiles, progress, attempts, submissions, saved lessons, preferences, review records, and audit events. |
| PILOT-06 Live assessment journey             | **FAIL/UNVERIFIED** | Start/save/resume/submit/server-score/unit/persist/competency/review/dashboard/idempotency and hidden-answer tests pass.                                  |
| PILOT-07 Live simulation journey             | **FAIL/UNVERIFIED** | Modes, controls, measurements, reset, diagnosis, complete, persist, competency, history, review, mobile/keyboard, and review-gate tests pass.             |
| PILOT-08 Accessibility                       | **CONDITIONAL**     | Automated suite remains green and a manual keyboard/screen-reader walkthrough is recorded.                                                                |
| PILOT-09 Operational monitoring              | **CONDITIONAL**     | Alert notification route is connected and a safe synthetic alert is received.                                                                             |

## Production Release

Production inherits every student-pilot gate and adds the following:

| Gate                                   | Current state       | Exit evidence                                                                                                      |
| -------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------ |
| PROD-01 Critical findings              | **FAIL**            | P40-C01 and P40-C02 fixed and independently retested.                                                              |
| PROD-02 Clean promoted release         | **FAIL**            | Tagged or otherwise immutable candidate, clean tree, PR approvals, exact CI/deployment identity.                   |
| PROD-03 Dependency security            | **FAIL**            | Targeted patched versions; zero unresolved reachable critical/high production blockers; risk register current.     |
| PROD-04 Full CI browser gate           | **OPEN**            | Full E2E suite is blocking CI and self-managed server startup is reliable.                                         |
| PROD-05 Current migration traceability | **FAIL/UNVERIFIED** | Applied migration history matches version-controlled migrations in staging and production.                         |
| PROD-06 Recovery                       | **CONDITIONAL**     | Full managed Supabase reconstruction and non-empty Storage restore rehearsed, with realistic RPO/RTO.              |
| PROD-07 Monitoring and alerting        | **CONDITIONAL**     | Production routing, ownership, escalation, and redaction are proven.                                               |
| PROD-08 Performance baseline           | **OPEN**            | Major route bundles, database queries, request counts, error rate, and submission latency have reviewed baselines. |
| PROD-09 Environment parity             | **OPEN**            | CI/Vercel runtime alignment documented and verified.                                                               |
| PROD-10 Production change control      | **OPEN**            | Explicit production release approval and rollback plan for the exact candidate.                                    |

This audit did not inspect or modify production data and does not grant production
approval.

## AI Mentor Implementation

AI Mentor work must not begin until its trustworthy retrieval boundary exists.

| Gate                             | Current state                    | Exit evidence                                                                                      |
| -------------------------------- | -------------------------------- | -------------------------------------------------------------------------------------------------- |
| AI-01 Secure live authentication | **FAIL/UNVERIFIED**              | PILOT-04 complete.                                                                                 |
| AI-02 Verified current RLS       | **FAIL/UNVERIFIED**              | PILOT-05 complete, including retrieval queries under each role.                                    |
| AI-03 Approved sources           | **FAIL**                         | At least one curated source corpus approved by named reviewers; rights and permitted use recorded. |
| AI-04 Published reviewed lessons | **FAIL**                         | Retrieval candidates are both published and Approved for student use, with no direct-route bypass. |
| AI-05 Assessment answer boundary | **DESIGN PASS, LIVE UNVERIFIED** | Live pre-submission retrieval and API tests prove no hidden answer/private explanation leakage.    |
| AI-06 Student-data boundary      | **DESIGN PASS, LIVE UNVERIFIED** | Retrieval filters and live cross-student tests prove student ownership and least privilege.        |
| AI-07 Stable monitored staging   | **FAIL**                         | Staging active, alerts connected, mentor audit/redaction/evaluation harness ready.                 |

Documentation and prompt design alone do not satisfy these gates. AI Mentor may be
planned architecturally, but implementation against student or technical content is a
**NO-GO**.

## Remediation Sequence

1. Restore staging Supabase health.
2. Correct lesson and simulation publication gates.
3. Re-run current migration and RLS verification.
4. Re-run live auth, dashboard, assessment, and simulation journeys.
5. Complete independent content/source review records.
6. Commit Prompt 39 through reviewable PRs and obtain green remote CI.
7. Patch dependencies and stabilise/full-gate Playwright in CI.
8. Connect alerts and complete manual accessibility review.
9. Establish performance baselines and close managed recovery gaps.
10. Re-run an independent staging audit before changing any NO-GO verdict.

## Gate Ownership

| Area                                    | Required owner                                                   |
| --------------------------------------- | ---------------------------------------------------------------- |
| Staging health and migration state      | Backend/DevOps owner                                             |
| RLS and service-role boundaries         | Database security reviewer                                       |
| Content publication and source approval | Independent engineering reviewer plus content governance owner   |
| Assessment integrity                    | Assessment platform owner and application security reviewer      |
| Simulation accuracy and publication     | Simulation engineer and independent engineering reviewer         |
| Accessibility                           | Accessibility reviewer with manual assistive-technology evidence |
| Monitoring and recovery                 | SRE/operations owner                                             |
| Final pilot/production decision         | Named release owner using the evidence above                     |

No gate was closed merely because an older report claimed success. Historical evidence
is accepted only as context until the current live control can be reproduced.
