# Basic Fluid Pressure Human Review Guide

Prepared: 2026-08-30

Review target: `LES-FLUID-PRESSURE-001`, Basic Fluid Pressure, version `0.4.0`

Required role: Engineering Reviewer, or Administrator acting under the same review policy

Current status: Engineering review required; draft; not published

## Before Starting

The reviewer must be a qualified human reviewer and must not be the accountable content
author. Do not share passwords, session tokens, access keys, or service credentials in a
review comment or document.

The stable protected staging URL is:

`https://industrial-learn-staging-git-development-kolobe.vercel.app`

The Prompt 46A application revision must first be deployed to that `development`-branch
staging alias. Do not use production for this review.

## Review Sequence

1. Open the staging sign-in route:
   `https://industrial-learn-staging-git-development-kolobe.vercel.app/auth/sign-in?next=%2Freview%2Fbasic-fluid-pressure`.
2. Sign in with the private staging account assigned the `Engineering reviewer` role.
3. Open the reviewer workspace at:
   `https://industrial-learn-staging-git-development-kolobe.vercel.app/review`.
4. Select **Basic Fluid Pressure** (`LES-FLUID-PRESSURE-001`) from the queue.
5. Confirm the decision target displays content version `0.4.0`, governance revision `4`,
   workflow status `Engineering review required`, and publication status `draft`.
6. Inspect the source package and verification evidence listed below. Open both official
   source pages and compare the cited sections with the lesson claims.
7. Operate **Normal force over contact area**, visual block
   `VIS-FLUID-PRESSURE-HERO-001`. Change both sliders and numeric inputs, reset the model,
   inspect the text state, and confirm the visual never implies flow or time dynamics.
8. Manually verify the equation cases in the next section and compare them with the live
   equation and pressure display.
9. Inspect all five assessment items and confirm that they map only to `LO-FP-001` through
   `LO-FP-003`, contain no fault or simulation task, and award at most `Calculated`.
10. Complete every applicable attestation in the decision panel. Choose the safety and
    limitations outcome, then enter a substantive review comment of at least 20 characters.
11. Select exactly one decision: **Approve**, **Request changes**, or **Reject**.
12. After approval, the governed workflow becomes `Approved for student use`, but the
    publication status remains `draft`. Approval does not make the lesson visible to
    students; an authorised, separate publication action is still required.
13. Return to the same review page and confirm the decision appears in **Reviewer comments
    and decisions** for governance revision `4`. An authorised database operator may also
    verify the corresponding `review_records` row and audit event without exposing secrets.

## Evidence To Inspect

- `docs/reviews/basic-fluid-pressure-review-evidence.md`
- `docs/reviews/basic-fluid-pressure-review-checklist.md`
- `docs/content/basic-fluid-pressure-model-scope.md`
- `docs/content/approved-textbook-register.md`
- `content/lessons/fluid-pressure/basic-fluid-pressure.json`
- `knowledge/fluid-pressure/basic-fluid-pressure.json`
- `content/assessments/fluid-pressure/basic-fluid-pressure-assessment.json`
- `sources/fluid-pressure/openstax-college-physics.json`
- `sources/fluid-pressure/penn-state-pressure-basics.json`
- `packages/engineering-core/src/index.ts`
- `packages/engineering-core/src/index.test.ts`

The earlier Prompt 46 documents describe version `0.3.0` and its defects. They are useful
as historical baseline evidence but are not the decision target for this review.

## Manual Equation Cases

| Case                  | Expected result                          |
| --------------------- | ---------------------------------------- |
| `1,000 N / 0.01 m^2`  | `100,000 Pa`, displayed as `100 kPa`     |
| `2,000 N / 0.01 m^2`  | `200,000 Pa`, challenge complete         |
| `1,000 N / 0.005 m^2` | `200,000 Pa`, challenge complete         |
| `0 N / 0.01 m^2`      | `0 Pa`, no force arrow or pressure field |
| `1,000 N / 0 m^2`     | invalid; division is not performed       |

Verify that displayed `kPa` values are explicit conversions from the internal `Pa` result.

## Assessment Items

- `Q-FP-MCQ-001`: concept relationship.
- `Q-FP-NUM-001`: `200 N / 0.50 m^2 = 400 Pa`, absolute tolerance `0.5 Pa`.
- `Q-FP-DIAGRAM-001`: smaller-area visual reasoning.
- `Q-FP-UNIT-001`: `1 Pa = 1 N/m^2`.
- `Q-FP-APPLICATION-001`: simple press application reasoning.

Correct answers and private explanations must remain unavailable before submission in the
graded assessment path.

## Decision Meaning

- **Approve** records an independent decision for version `0.4.0` only. It requires every
  attestation and cannot be used by the lesson author to approve their own work.
- **Request changes** records that the identified version needs revision and moves the
  governed item to `Revision required`.
- **Reject** records rejection of the identified version and also moves it to
  `Revision required`.

Any later content change requires a new version and a new review. Never approve by editing
a markdown status or database row directly.
