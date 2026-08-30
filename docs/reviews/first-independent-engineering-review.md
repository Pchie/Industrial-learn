# First Independent Engineering Review

Review date: 2026-08-30

Candidate: `LES-FLUID-PRESSURE-001`, Basic Fluid Pressure, version `0.3.0`

## Formal Decision

**BLOCKED - HUMAN REVIEW REQUIRED**

Review status remains: `Engineering review required`

Publication status remains: `draft`

No technical-review JSON record was created. No approval or publication metadata was
changed.

## Reviewer Independence Finding

No genuine independent reviewer record exists for the candidate. The repository does not
identify:

- an accountable `authorProfileId` for version `0.3.0`;
- a stable reviewer profile ID;
- a reviewer full name;
- an authorised engineering-reviewer or lecturer role;
- qualification or authority context;
- a dated human decision on the frozen artifacts; or
- separate administrator publication authorization.

Codex prepared prior source, equation, implementation, and audit material. Codex is not a
human engineering reviewer and cannot approve work it helped create or assess. Automated
tests prove software behavior, not technical approval. The role labels `github` and
`reviewer` are not adequate identities.

## Evidence Review Summary

| Gate                    | Verdict               | Principal reason                                                                                           |
| ----------------------- | --------------------- | ---------------------------------------------------------------------------------------------------------- |
| Candidate selection     | PASS                  | Basic Fluid Pressure is the smallest technically bounded candidate and has a frozen review packet          |
| Source completeness     | FAIL                  | Safety/diagnostic claims lack suitable evidence; Penn State is absent from the runtime source registry     |
| Academic source quality | PARTIAL               | Two Level 4 sources are checked; no lawfully accessed Level 3 textbook is registered                       |
| Equation accuracy       | PASS                  | `p = F / A`, SI units, guards, and known answers are correct within scope                                  |
| Engineering model       | PARTIAL               | Static model is sound; associated assessment introduces unreviewed simulation/fault content                |
| Visual learning         | FAIL                  | No early interaction, live state, challenge, or application                                                |
| Accessibility           | PASS WITH LIMITATIONS | Static semantics are strong; content route and future interaction have not received deployed manual review |
| Assessment              | CHANGES REQUIRED      | Outcome IDs do not resolve; competency and simulation/fault items exceed lesson scope                      |
| Safety                  | CHANGES REQUIRED      | Boundary is prudent but lacks appropriate safety evidence                                                  |
| Independent review      | BLOCKED               | No qualified named human reviewer or author identity exists                                                |

## Candidate Comparison

| Candidate                          | Evidence and maturity                                                                     | Publication readiness                                  | Major blocker                                                                                         |
| ---------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| Basic Fluid Pressure               | Two Level 4 sources, one pure tested equation, no simulation, generic accessible renderer | Highest administrative readiness; frozen packet exists | Human identity, source gaps, runtime source registration, visual-first and assessment corrections     |
| Hydraulic Cylinder Force           | Level 1/2 unit and manufacturer evidence, two tested equations, mature visual lesson      | Internal only                                          | Unreviewed training bounds/fault model, simulation approval, prerequisite and assessment dependencies |
| Pump System Units and Measurements | Level 1 NIST and Level 2 DOE evidence, no equation or simulation                          | Draft                                                  | No assessment, no visual-first interaction, no human review                                           |
| Bernoulli Flow Lab                 | Two Level 4 sources, seven equations, mature flagship visual                              | Internal only                                          | Larger equation/model scope, no graded assessment, unapplied held migration, no human review          |

Basic Fluid Pressure was selected because it minimises technical blast radius and does not
require simulation approval. It was not selected for visual polish.

## Approval Preconditions

Before a human reviewer can approve a successor version:

1. Record the accountable author profile ID.
2. Resolve the source, safety, visual-learning, outcome, and assessment findings.
3. Add the Penn State source to the server-side source registry and test aggregation.
4. Increment the content version and regenerate artifact hashes.
5. Assign a qualified reviewer who is not the author.
6. Complete source, educational, equation, safety, and engineering decisions on the exact
   new version.
7. Obtain separate administrator publication authorization.
8. Register immutable review records and then perform staging publication tests.

Until then, `Approved for student use` would be false evidence.
