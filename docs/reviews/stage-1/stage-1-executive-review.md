# Stage 1 executive review

Date: 13 October 2026. **Verdict: CONDITIONAL PASS.** This is a fresh source/evidence review and bounded baseline exercise by the existing development assistant, not an external human audit or penetration test. No Stage 2 remediation is included.

## Actual state

- Review branch: `codex/stage-1-independent-review`, created at unchanged HEAD `5fd8fc5253314deb403172d2084dc3d216adcd1f`. Original branch: `codex/website-design-consistency`. No commits or pushes occurred.
- Before review: **72 modified tracked files, 77 untracked files, zero staged files**. All 829 nonignored file hashes were inventoried, including prior document artifacts. Full paths/statuses are in [baseline inventory](evidence/baseline-inventory.json).
- The historical **804-file set** still hashes to `6678b3cc80c7e388567311bb7d2caa4316ea26f6604d7ce82fad3be16839ef24` using the recovered method: SHA-256 of sorted compact JSON mapping relative paths to SHA-256 file hashes. Zero original-file mismatches. Re-running the original selection rule over today's additions produces a different 824-file fingerprint; this is not application drift.
- An owner-access-only, hash-verified archive preserves 811 source/configuration-template/test/document files. Prior `tmp/` and `output/` artifacts remain untouched in the original workspace and inventoried, but are outside this source archive. Private environments, operational records, dependencies and build outputs are excluded.
- Remote `development` pointed to HEAD in the October 12 inspection; neither the original feature branch nor the new review branch was present remotely when checked. The dirty working tree is not represented by the base commit. A clone of HEAD alone is **not** the tested platform.
- Fresh read-only staging checks identify READY deployment `dpl_3MpCfxEivqHUfrheW5geR4G8PYh9`, retained Vercel protection and healthy staging auth/database checks. The deployed Git label matches HEAD, but its frozen source metadata also represents the uncommitted overlay. See [environment observations](evidence/environment-observations.json).

## Implemented versus incomplete

The bounded pilot sign-in, governed bookmark/library flow, assessment v2 and stored results have historical hosted evidence. Current code confirms their authentication and persistence paths. Fresh isolated checks are listed in [baseline manifest](baseline-manifest.md); historical results are not relabeled as fresh.

Lecturer `/lecturer` currently provides protected navigation, not a complete cohort/assignment UI. `/projects` explicitly says creation/submission is unavailable. Author draft loading is unavailable outside local fixtures and editing/submission controls remain deferred. These are original MVP gaps, not completed workflows. The [requirements matrix](mvp-requirements-matrix.md) records each retained requirement and its acceptance criteria. AI Mentor remains owner-deferred and is not a core blocker.

## Principal risks

1. **Release reproducibility:** valuable source and migrations are outside any reviewed release commit. Local archive recovery is proven by hashes; independently distributed checkout reproduction is not yet established.
2. **Incomplete MVP:** lecturer, projects and live authoring workflows; catalogue depth; historical v1 artifact; independently reviewed positive relational lesson/simulation/withdrawal evidence.
3. **Privileged persistence:** assessment/simulation/progress use server-held service credentials. Ordinary RLS does not constrain those reads/writes; server ownership/scoring checks and database transaction guards are critical.
4. **Environment provenance:** 24 migrations are recorded, with `0010` held. `0020-0025` match stored whole-file SQL hashes; older entries have absent, split or differently serialized SQL. Version agreement is not full schema-equivalence proof.
5. **Operational acceptance:** mail delivery, named support/incident ownership, recovery custody, privacy decisions and human accessibility remain open. Production logging is disabled by the current staging-only monitoring guard; production was not tested.

## Stage 1 gates

| Gate                       | Assessment             | Evidence / remaining condition                                                                                                                                                          |
| -------------------------- | ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A Preservation             | PASS locally           | Inventory, same-HEAD feature branch, hash-verified source archive; off-device custody still an owner action.                                                                            |
| B Scope reconciliation     | PASS as assessment     | Every audited area has a status/evidence/next acceptance test; missing workflows are not passed.                                                                                        |
| C Architecture/security    | PASS as bounded review | Actual ordinary-session and service-role paths distinguished; findings and limits recorded.                                                                                             |
| D Reproducibility          | CONDITIONAL            | Isolated locked install and local checks executed; no reviewed source-overlay commit or independently accessible handover baseline yet. Final build/browser outcome is in the manifest. |
| E Environment traceability | CONDITIONAL            | Fresh staging deployment/health/ledger metadata; old migration SQL equivalence unresolved; production and decrypted deployed values not inspected.                                      |
| F Work breakdown           | PASS                   | Priorities, dependencies, owners, test criteria and assumption-based ranges supplied.                                                                                                   |
| G Evidence integrity       | PASS                   | Final source/archive checks passed; commands/results recorded; first API timeout retained; historical results separated.                                                                |
| H Change safety            | PASS                   | No source edits, live mutations, migrations, accounts, deployment, secrets disclosure or commits.                                                                                       |

**Do not interpret this verdict as MVP completion, production approval, or closure of Gates D/E.** [Owner decisions](owner-decisions.md) identify the remaining arrangements. [Stage 2 breakdown](stage-2-work-breakdown.md) defines subsequent work; it is not executed here.

## Final independent self-check

A second check compared actual bytes against the pre-review inventory: all **829 existing files remain unchanged**, no staged files exist, HEAD is unchanged, and every archived source file matches its recorded hash. All **811 isolated source files** also remain unchanged after installation, build and tests. See [self-check evidence](evidence/self-check.json). This self-check was performed by the same assistant, not a separate external auditor.

All ten fresh check records were inspected and report exit zero: locked install, secret scan, type checking, lint, formatting, content validation, migration validation, unit tests, build and focused browser tests. **550 unit tests and 18 browser tests passed; seven live tests were skipped intentionally.** Content (29) and migration (28) checks overlap with the unit suite. Existing historical results are labeled separately; the first read-only Vercel timeout remains in the evidence.

The six requested deliverables and sanitized evidence are the only new nonignored files. Private local preservation/testing artifacts were added separately. No existing application file was edited; no commits, pushes, migrations, deployments, live configuration changes, invitations, new live accounts or AI integration occurred. Gates D and E remain conditional for the reasons above.
