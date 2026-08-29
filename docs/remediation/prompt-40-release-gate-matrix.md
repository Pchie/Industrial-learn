# Prompt 40 Remediation Release-Gate Matrix

Date: 2026-08-28
Target: continued staging development and controlled student pilot

## Gate Matrix

| Gate                       | Current state                                                                                                                                                                                                                                  | Required state                                                                                                                                                                                                               | Exit evidence                                                                                                                                                                                                 | Owner                                                                                                                       | Severity           |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| Lesson publication         | **FAIL.** `/lessons/[lessonSlug]` enumerates and renders unrestricted repository JSON. Five current lesson files are draft/internal and `Engineering review required`. Curriculum routes also project draft module/lesson/pathway metadata.    | One fail-closed application policy requires `published` plus `Approved for student use`; enumeration, direct slugs, curriculum projection, sources, and embedded visuals all use it. Staff preview is separately authorized. | Unit matrix; static-param test; public/direct-route negatives; one synthetic approved positive; deployed route verification; database `content_versions` remains student-denied.                              | Codex for implementation/tests; product owner for empty-state behavior; independent reviewer for any positive pilot record. | Critical           |
| Simulation publication     | **FAIL.** Hydraulic and Bernoulli entries are hard-coded `available`; direct details use an unrestricted registry; service-role queries filter only `published`; embedded visuals have no independent gate.                                    | Catalogue, detail, attempts, persistence lookup, parent lesson/module, and embedded paths require publication plus approval. Operational availability can restrict but never elevate.                                        | Registry/service tests; direct URL negative; published-unapproved live row denied; approved positive; attempt-start denial; service-role predicate and parent check; security E2E.                            | Codex for implementation/tests; engineering governance owner for approval; database owner for fixture correction.           | Critical           |
| Supabase live RLS          | **FAIL / UNVERIFIED.** Staging project `lgjujyaclrpaopdabyzg` is `INACTIVE`; DNS and migration inspection fail; synthetic live-test inputs are absent.                                                                                         | Project is `ACTIVE_HEALTHY`; environment/callbacks are attested; exact migration state is known; two synthetic students and role fixtures run the expanded RLS matrix.                                                       | Project/health output; migration comparison; callback screenshots or dashboard record; live test output for cross-student, content, review, hidden-answer, and service-role boundaries; token cleanup record. | Human operator for restore/secrets/dashboard; Codex for preflight and tests after authorization.                            | High               |
| Git baseline               | **FAIL.** HEAD equals `origin/development`, but 58 tracked changes and 109 untracked files now have no commit identity (105 before the four Prompt 41 deliverables). Prompt 39A-39G, migration `0010`, and Prompt 40 evidence are interleaved. | Reviewable commits on a feature branch, no known bypass committed without its fix, no secret staged, clean tree, passing CI, PR into `development`.                                                                          | Commit map; staged-file reviews; secret scan; clean `git status`; CI at exact SHA; PR review.                                                                                                                 | Codex can prepare commits after approval; repository owner approves PR/merge.                                               | High               |
| Controlled pilot readiness | **NO-GO.** No current visual lesson/simulation is approved; content gates fail; staging is unavailable; live RLS is stale; no clean release identity exists.                                                                                   | Git, lesson, simulation, and live RLS gates pass; exactly one bounded, independently reviewed version is published; protected staging E2E passes at a recorded commit/deployment.                                            | Named reviewer/date/version records; source/equation/safety/simulation evidence; staging deployment ID and commit; live student journey; rollback/unpublish procedure; zero open critical gates.              | Product owner and independent reviewers own approval; Codex supplies implementation/evidence; release owner decides pilot.  | Critical aggregate |

## Decision Rules

### Continued Staging Development

Current verdict: **CONDITIONAL GO**.

It becomes **GO** when:

1. the Git baseline is reviewable and CI passes;
2. lesson and simulation delivery fail closed locally; and
3. the corrected commit is the only candidate allowed to move toward staging.

An active Supabase project is not required to write the local remediation, but it is
required before integration is treated as staging-ready or any authenticated release
claim is made.

### Controlled Student Pilot

Current verdict: **NO-GO**.

It may become **CONDITIONAL GO** only if all critical publication gates pass, Supabase is
healthy, current live RLS passes, one independently reviewed version exists, and the only
remaining conditions are non-critical, time-bounded operational observations with named
owners. It becomes **GO** when those conditions are closed and rollback evidence is current.

The following can never be accepted as pilot conditions:

- a draft/internal or unapproved lesson visible to students;
- an unapproved simulation available by catalogue, direct URL, embed, or attempt start;
- missing current cross-student RLS evidence;
- unknown release commit or dirty deployment source;
- missing named engineering/content review record.

## Evidence Owners

| Evidence                                               | Responsible owner             |
| ------------------------------------------------------ | ----------------------------- |
| Application publication predicates and tests           | Software/security engineering |
| Database policies and fixture migration                | Database/security engineering |
| Staging project restore, callbacks, and secret binding | Human staging operator        |
| Independent engineering/content/safety approval        | Named human reviewers         |
| Accessibility approval for pilot                       | Named accessibility reviewer  |
| PR approval and branch integration                     | Repository owner              |
| Pilot release decision and rollback authority          | Product/release owner         |

## Production Boundary

This matrix does not authorize a production release. Production and AI Mentor gates remain
out of scope and NO-GO regardless of progress recorded here.
