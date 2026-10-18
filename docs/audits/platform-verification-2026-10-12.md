# Platform verification — 2026-10-12

**Bounded staging release: PASS. Overall platform acceptance: PARTIAL, with the limitations below. AI Mentor is deferred.**

The [staging platform](https://industrial-learn-staging-git-development-kolobe.vercel.app) now points to the tested deployment `dpl_3MpCfxEivqHUfrheW5geR4G8PYh9`. The switch and deployment-ID readback passed on October 12. Deployment protection remains enabled; access may require the existing Vercel team login before the application's own sign-in.

## Verified results

| Verification                                                                                 | Result                           | Evidence dates                  |
| -------------------------------------------------------------------------------------------- | -------------------------------- | ------------------------------- |
| Hosted learning journey, two rounds                                                          | 13/13 each                       | September 29; October 6         |
| Hosted account boundaries, V3, two rounds                                                    | 9/9 each                         | October 5; October 6            |
| Original staging integration suite, unchanged                                                | 7/7 each                         | October 5; October 6            |
| Genuine naturally expired JWT replay with fresh-session positive control                     | 5/5                              | October 6                       |
| Synthetic access retirement                                                                  | 5/5; roles removed, login denied | October 6                       |
| Original bookmark checksum/count, migration ledger, canonical lesson and assessment metadata | 4/4                              | October 6; refreshed October 12 |
| Public canonical resolution and wrong-identity/version denial                                | 3/3                              | October 12                      |
| Staging alias health and anonymous browser boundaries                                        | 6/6                              | October 12                      |
| Observed public JS/CSS assets checked for configured server credentials                      | 15 clean                         | October 12                      |
| Type checking, lint, formatting, repository secret scan                                      | Passed                           | October 12                      |

The 44 qualifying hosted scenario checks and 14 original integration test executions are separate evidence groups. The hosted learning path covered normal sign-in, bookmarks and dashboard synchronization, fresh-browser persistence, challenge progress, assessment v2 submission and exact scoring, stable review, completed-attempt locking and account isolation. Responsive checks used Chromium at 375, 768 and 1440 pixels, light/dark states, selected Axe rules and overflow assertions. They do not constitute human accessibility or all-device approval.

Both original integration runs observed zero student-visible relational lesson and simulation rows. Their publication case therefore provides no positive publication coverage. Canonical governed-pilot resolution is separately verified.

The expired-token checks replayed a genuine JWT issued and naturally expired on October 3. Authentication explicitly rejected expiry, RLS and the hosted account endpoint denied access, and the protected dashboard redirected. A fresh same-account session provided the positive control. No browser clock manipulation or continuously open session claim is involved.

## Changes and preservation

This continuation changed verification harnesses and audit/status documents, retired the five approved synthetic staging identities, and switched only the existing staging alias. No application source, dependencies, formulas, content approvals or migrations changed. The 804-file frozen set still matches `6678b3cc80c7e388567311bb7d2caa4316ea26f6604d7ce82fad3be16839ef24`. New status documents are outside that frozen set. Existing branch changes remain uncommitted.

All task-created bookmarks were removed and checked. Synthetic learning/audit records remain; Auth/profile rows were retained with access disabled. Synthetic passwords and session tokens were removed from the fixture credential store by retirement; the separately retained expired-token test artifact is private and already expired. Preservation comparisons cover the named data, not the entire database. AI Mentor and its configured secret were left untouched.

## Evidence continuity and corrected harness failures

Earlier failed runs remain preserved. The original hosted boundary run encountered a strict locator matching two transitioning identity elements; V2 then assumed a new assessment even though the actor already had an in-progress attempt. V3 checks every visible identity and verifies the exact existing attempt before continuing. The initial expiry check expected HTTP 401 while the provider returned HTTP 403 with an explicit expired-token error; V2 accepts those denial codes only with the expected expiry evidence. Qualifying counts above use the corrected V3 boundary and V2 expiry runs; earlier failures are not silently counted as passes. Historical September outage/upload/anonymous harness failures also remain recorded.

The October 6 automatic approval-review usage limit interrupted release completion after retirement. On October 12 an expired Vercel API session returned 403; the normal CLI account check refreshed it and subsequent health verification passed. Neither event was treated as an application security defect or bypassed.

## Known limitations and remaining work

- Authoritative historical assessment v1 artifact unavailable; no substitute was fabricated.
- No independently reviewed positive relational lesson, standalone simulation or live-withdrawal fixture; both original suites observed zero student-visible lesson/simulation rows.
- Original intermittent owner-assignment failure cause remains unresolved despite subsequent passing runs.
- Natural expired-token replay passed; continuously open browser ageing and refresh behavior were not tested.
- External signup/recovery mail delivery, human device/screen-reader checks and pilot operational/privacy/recovery approvals remain unverified.
- Author UI CRUD remains deferred; AI Mentor integration is deferred by the user.

These prevent a claim of complete contractual acceptance or production/pilot approval. The remaining work requires authoritative content/review evidence and operational/human verification; repeating passing automated checks cannot supply those approvals.

## Evidence locations

Sanitized result records are indexed in `docs/audits/prompt-53f-regression-matrix.json`. Detailed local evidence is under `.private-operations/53f-2026-09-22/`, including `live-state.json`, `original-staging-tests-round1.json`, `original-staging-tests-round2.json`, `alias-apply.json`, and `continuation-2026-10-12/completion-summary.json`. Credential-bearing files are excluded from reports. September 14 full local suites remain dated historical evidence, not October reruns.
