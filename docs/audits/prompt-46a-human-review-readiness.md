# Prompt 46A Human Review Readiness

Date: 2026-08-30

Lesson: `LES-FLUID-PRESSURE-001`, Basic Fluid Pressure

Reviewed remediation version: `0.4.0`

Branch: `codex/prompt-46a-basic-pressure-remediation`

This report records technical preparation for an independent human review. It is not an
engineering approval, publication decision, or production release record.

## Executive Verdict

Human review readiness: **READY WITH LIMITATIONS**

The source, lesson, engineering model, assessment, visual-learning, accessibility, and
review-control defects identified by Prompt 46 have been remediated and pass local quality
gates. Supabase staging migration `0013` and the exact draft review item are live and
verified. The remaining limitation is deployment evidence: the Prompt 46A application
revision must be deployed to the protected staging alias before the human reviewer follows
the URL in the guide. This report must be updated to **READY** only after that route is
verified on the deployed revision.

The lesson remains `Engineering review required` and `draft`. It is not approved for
student use and is not published.

## Previous Blockers

| Prompt 46 finding                                        | Previous verdict                |
| -------------------------------------------------------- | ------------------------------- |
| Penn State source omitted from runtime registry          | Source completeness FAIL        |
| Preferred textbook not lawfully available                | Academic source quality PARTIAL |
| Unsupported safety and diagnostic claims                 | Source/model changes required   |
| Text-first lesson with no interaction or challenge       | Visual learning FAIL            |
| Undeclared outcome IDs and out-of-scope assessment tasks | Educational alignment blocked   |
| Dynamic accessibility untested                           | Accessibility PARTIAL           |
| No exact-version human decision workflow                 | Human review blocked            |

## Blockers Resolved

### Source And Scope

- Registered `SRC-PSU-CIMBALA-PRESSURE-BASICS` in the runtime source registry and added a
  publication-enforcement test for both cited records.
- Kept the McGraw Hill candidate at **ACQUISITION REQUIRED**. It has no source ID and is
  not cited by version `0.4.0`.
- Removed advanced diagnostic, fault, and unsupported safety procedure claims.
- Limited the lesson to pressure meaning, normal force over area, SI units, force/area
  changes, introductory calculation, and a bounded press application.

### Assessment

- Declared `LO-FP-001` through `LO-FP-003` in the lesson schema and content.
- Added validator enforcement that assessment outcome IDs must exist in the related
  lesson.
- Reduced the assessment from eight mixed-scope items to five focused questions.
- Removed simulation, fault-diagnosis, sequence, component, and design tasks.
- Limited competency evidence to `Understood` and `Calculated`.
- Preserved trusted server scoring, unit validation, hidden answers, attempt ownership,
  duplicate-completion protection, and cross-student denial.

### Visual Learning And Model

- Placed the interactive force-over-area visual before required theory.
- Added synchronised force and area sliders plus numeric inputs.
- Used `pressureFromForceAndArea` and explicit `Pa` to `kPa` conversion from
  engineering-core as the numerical source of truth.
- Added accessible force, area, pressure, live equation, observation, micro-theory,
  optional depth, reset, `200 kPa` challenge, and hydraulic-press application experiences.
- Documented calculated, representational, and not-modelled behavior.
- Corrected the zero-force boundary so no force arrow or pressure field appears at zero.

### Governance

- Added protected `/review/basic-fluid-pressure` exact-version preview and evidence.
- Added Approve, Request changes, and Reject controls backed by a server action.
- Applied staging migration `0013_atomic_content_review_decision.sql`.
- Revoked authenticated direct writes to `review_records`.
- Required an authenticated engineering reviewer or administrator, a substantive
  comment, exact governance revision and content version, and all required attestations
  before approval.
- Enforced reviewer/author separation for approval in the database function.
- Made the review record, workflow update, and audit event atomic.
- Kept publication as a separate action.

## Source Status

| Source                              | Status                                               | Decision                |
| ----------------------------------- | ---------------------------------------------------- | ----------------------- |
| `SRC-OPENSTAX-COLLEGE-PHYSICS-2012` | Source checked; evidence approved for bounded claims | Retained                |
| `SRC-PSU-CIMBALA-PRESSURE-BASICS`   | Source checked; evidence approved for bounded claims | Registered and retained |
| McGraw Hill textbook candidate      | ACQUISITION REQUIRED                                 | Not cited; not approved |

Academic-source status: **SUFFICIENT FOR HUMAN REVIEW OF THIS BOUNDED FOUNDATION**, subject
to the independent human source decision. McGraw Hill remains the preferred future
textbook benchmark.

## Visual And Accessibility Status

Visual-learning status: **PASS FOR HUMAN REVIEW**.

Accessibility status: **PASS FOR HUMAN REVIEW**, not formal WCAG certification.

Evidence includes native keyboard controls, numeric alternatives, SVG title/description,
text state and force-vector equivalents, polite pressure/challenge feedback, status text
in addition to colour, reduced motion, and no horizontal overflow at the tested phone,
tablet, and desktop widths.

## Assessment Status

Assessment scope status: **ALIGNED FOR HUMAN REVIEW**.

The five retained items cover concept understanding, `400 Pa` calculation with unit-aware
scoring, visual area reasoning, SI-unit awareness, and simple application reasoning.
The graded assessment remains unavailable in staging unless its exact database version is
approved and published; the local approved fixture exists only in isolated E2E mode.

## Live Staging Database Verification

Target project: `lgjujyaclrpaopdabyzg` (staging only)

| Check                                           | Result                                  |
| ----------------------------------------------- | --------------------------------------- |
| Migration `0013` present in live ledger         | PASS                                    |
| Review function executable by `authenticated`   | PASS                                    |
| Review function executable by `anon`            | DENIED                                  |
| Direct authenticated insert to `review_records` | DENIED                                  |
| Draft item title                                | Basic Fluid Pressure                    |
| Governance revision / content version           | `4` / `0.4.0`                           |
| Workflow / publication state                    | `Engineering review required` / `draft` |
| Student visibility of item/version              | `0` / `0` rows                          |
| Engineering reviewer visibility of item/version | `1` / `1` rows                          |
| Existing human decisions                        | `0`                                     |

The staging seed uses distinct synthetic author and engineering-reviewer profiles. It
does not seed a decision, approval, or publication.

## Reviewer Location

- Stable staging base:
  `https://industrial-learn-staging-git-development-kolobe.vercel.app`
- Sign-in route:
  `/auth/sign-in?next=%2Freview%2Fbasic-fluid-pressure`
- Reviewer queue: `/review`
- Exact review workspace: `/review/basic-fluid-pressure`
- Review item: Basic Fluid Pressure, `LES-FLUID-PRESSURE-001`, version `0.4.0`
- Required role: Engineering Reviewer; administrator access follows the same review gate

Deployment status at report creation: **PENDING PROMPT 46A PREVIEW VERIFICATION**.

## Approval Control

The approval button is implemented and protected at three layers:

1. The route and server action require an authenticated reviewer or administrator role.
2. The action reloads the trusted database item and verifies the submitted item ID,
   governance revision, content version, and workflow state.
3. The database function repeats role, version, status, author separation, evidence,
   source, equation, safety/limitations, comment, atomicity, and audit checks.

Client form fields are not trusted. A modified browser request cannot choose a different
version, score, role, author, or publication state.

## Quality Results

| Command                       | Result                                             |
| ----------------------------- | -------------------------------------------------- |
| `npm run scan:secrets`        | PASS                                               |
| `npm run format:check`        | PASS                                               |
| `npm run typecheck`           | PASS                                               |
| `npm run lint`                | PASS                                               |
| `npm run validate:content`    | PASS, 29 tests                                     |
| `npm run validate:migrations` | PASS, 17 tests                                     |
| `npm run test:unit`           | PASS, 352 passed and 5 environment-dependent skips |
| `npm run build`               | PASS, 33 static pages and expected dynamic routes  |
| `npm run test:a11y`           | PASS, 38 browser tests                             |
| `npm run test:smoke`          | PASS, 5 browser tests                              |
| `npm run test:e2e`            | PASS, 96 browser tests                             |

The E2E suite includes expected safe-error-path server logging for a simulated dashboard
database failure; the corresponding test passes.

## Before And After

| Area                                | Version `0.3.0`                       | Version `0.4.0`                         |
| ----------------------------------- | ------------------------------------- | --------------------------------------- |
| First meaningful experience         | Metadata and long structured sequence | Interactive force/area visual           |
| Interactive engineering inputs      | None                                  | Two synchronised slider/numeric pairs   |
| Live engineering result             | None                                  | Pressure display and live equation      |
| Observation                         | None                                  | Three concise non-graded prompts        |
| Challenge                           | None                                  | Bounded `200 kPa` practice challenge    |
| Application                         | Brief text                            | Original hydraulic-press visual/context |
| Mandatory theory before interaction | Multiple required sections            | None                                    |
| Detailed theory                     | Required in main flow                 | Optional Engineering/Deep Dive          |
| Assessment scope                    | Eight items through Designed          | Five items through Calculated           |
| Reviewer control                    | Generic local queue                   | Exact-version live database workflow    |

## Remaining Limitations

1. A qualified independent human reviewer has not yet recorded a decision.
2. The Prompt 46A application revision still requires protected staging deployment
   verification; until then use **READY WITH LIMITATIONS**.
3. McGraw Hill access remains acquisition-required and is not part of the evidence set.
4. The pressure visual is representational, not a dynamic fluid simulation.
5. Automated accessibility checks are not a substitute for human assistive-technology
   review.
6. Approval will not publish the lesson; a separate authorised publication step and
   positive/negative staging visibility test remain required afterward.

## Human Review Sequence

Use `docs/reviews/basic-fluid-pressure-human-review-guide.md` and
`docs/reviews/basic-fluid-pressure-review-checklist.md`. The reviewer must inspect the
frozen evidence hashes, operate the visual, verify equation cases, inspect all five
assessment items, complete the attestations, enter comments, and choose Approve, Request
changes, or Reject. The decision must then appear in the exact-version review history.

## Change Summary

Prompt 46A corrected the remediable source, scope, assessment, visual-learning,
accessibility, model, and reviewer-workflow blockers for Basic Fluid Pressure. It changed
no unrelated curriculum, no governing engineering equation, no production environment,
and no student publication state.
