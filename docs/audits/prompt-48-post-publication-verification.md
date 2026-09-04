# Prompt 48 Post-Publication Verification

Audit date: 2026-09-04

Audit mode: Independent, read-only verification

Target: Basic Fluid Pressure, lesson `LES-FLUID-PRESSURE-001`, version `0.4.0`

Environment: Protected staging (`lgjujyaclrpaopdabyzg`)

Application: `https://industrial-learn-staging-git-development-kolobe.vercel.app`

Repository commit audited: `51bbd963314a1177e9edd6324d268518138b3366`

## Executive Verdict

The exact Basic Fluid Pressure lesson instructional object is the reviewed version, its
atomic staging publication record is internally consistent, and its engineering,
visual-learning, accessibility, and security behaviour passed the checks that could be
executed without changing live state.

Publication integrity is nevertheless **FAIL** under Prompt 48's no-mismatch rule. The
lesson references assessment `ASM-FLUID-PRESSURE-001`, while the application catalogue
expects content version `2` and staging contains a different version `1` fixture named
`Staging Pressure Check`. The application correctly refuses to start that mismatched
assessment, so no incorrect score or competency was awarded and no hidden answer was
exposed. This is an integrity blocker, not evidence that the lesson artifact itself was
altered.

| Required verdict                  | Verdict                    |
| --------------------------------- | -------------------------- |
| Publication integrity             | **FAIL**                   |
| Engineering behaviour             | **PASS**                   |
| Visual learning                   | **PASS**                   |
| Accessibility                     | **PASS**                   |
| Security                          | **PASS**                   |
| Controlled-pilot lesson readiness | **READY WITH LIMITATIONS** |

The lesson is suitable only for a very small, supervised, lesson-only pilot that excludes
formal assessment, competency award, and persisted progress. It must be entered through
Learn, Core Engineering, search, or its direct URL because the parent module remains
unpublished.

## Evidence Boundary

The audit combined four independent evidence paths:

- live staging browser checks of public discovery, lesson interaction, protected routes,
  known-answer calculations, and challenge behaviour;
- read-only live staging database queries, including an authenticated synthetic-student
  RLS context and a denied student publication-function invocation;
- an authenticated local release build at the exact deployed repository commit for
  progress, dashboard, keyboard, reduced-motion, and mobile checks; and
- repository artifact hashing, normalized lesson comparison, deployment records, CI
  evidence, and the full non-destructive local quality suite.

The Prompt 47 temporary browser student had already been deleted. No new live credential or
learning record was created because this audit was read-only. Therefore, live authenticated
browser navigation was not re-run; live student authorization was tested at the database
boundary, and authenticated UI behaviour was tested against the exact release build. This
limitation is not replaced by a claim of live end-to-end authentication.

Production was not queried or modified during Prompt 48.

## Version Integrity

| Item                        | Independent result                                                                 |
| --------------------------- | ---------------------------------------------------------------------------------- |
| Lesson identity             | PASS: `LES-FLUID-PRESSURE-001` / `basic-fluid-pressure`                            |
| Reviewed lesson version     | PASS: `0.4.0`                                                                      |
| Published lesson version    | PASS: governance version `4`, content label `0.4.0`                                |
| Reviewed Git artifact       | PASS: commit `bbd81abc0e1351d6280e3fc022d1138ad316ec1e`                            |
| Reviewed artifact SHA-256   | PASS: `f3746a0730b154023a1faea80719f1cfde27477aae22b164bcfe71cab3ca552a`           |
| Instructional object        | PASS: normalized reviewed and published instructional objects are deeply equal     |
| Publication-envelope change | PASS: only authorized publication/review metadata changed after engineering review |
| Source IDs                  | PASS: exact two-source set matched                                                 |
| Equation IDs                | PASS: `EQ-FLUID-PRESSURE-001` matched                                              |
| Simulation version          | N/A: the lesson declares no simulation ID and no simulation inherited publication  |
| Assessment version          | FAIL: catalogue version `2` does not match the staging version `1` fixture         |

The exact source set is:

- `SRC-OPENSTAX-COLLEGE-PHYSICS-2012`
- `SRC-PSU-CIMBALA-PRESSURE-BASICS`

The reviewed equation set contains only `EQ-FLUID-PRESSURE-001`. The current file differs
from the reviewed artifact only in its authorized publication envelope, including review
status, publication status, published version, approval references, and recorded author
metadata. No lesson paragraph, equation, example, challenge, or question was changed.

### Assessment mismatch

The published lesson metadata relates to `ASM-FLUID-PRESSURE-001`. Repository assessment
content contains five lesson-aligned questions and the application catalogue expects
content version `2`. Live staging instead has version `1`, titled `Staging Pressure Check`,
attached to an earlier fixture lesson, with one question. It is marked approved/published
in the database.

The server rejects the version mismatch and withholds the formal assessment route. This
fail-closed behaviour protects students, but it cannot make the version chain PASS. The
live assessment must not be included in the controlled pilot until it is independently
reviewed and reconciled through the normal governed release process.

## Publication Record

| Check                             | Result                                                     |
| --------------------------------- | ---------------------------------------------------------- |
| Migration ledger                  | PASS: `0018`, `atomic_staging_content_publication`         |
| Governance current version        | PASS: `4`                                                  |
| Governance published version      | PASS: `4`                                                  |
| Workflow/publication state        | PASS: `Published` / `published`                            |
| Publication event                 | PASS: one matching event                                   |
| Duplicate event                   | PASS: count remained exactly one                           |
| Actor                             | PASS: non-null protected platform-management actor         |
| Timestamp                         | PASS: `2026-09-04T14:28:13.657991Z`                        |
| Approval reference                | PASS: review record `31510bc1-aecf-48fb-a40e-c427a86f115e` |
| Release candidate                 | PASS: `basic-fluid-pressure-staging-v0.4.0-rc1`            |
| Release commit                    | PASS: `9b8329a589dee3ac953d6245de51ad2c876a8bae`           |
| Student publication-function call | PASS: denied by platform-management authorization          |

The staging database has one current/published version relation and one publication audit
event. The function remains executable only by authenticated/trusted database roles and
performs an internal platform-management authorization check; anonymous/public execution
is unavailable.

## Deployment And CI

GitHub deployment records show staging deployment `6267611205` and secondary preview
deployment `6267621834` at audited commit
`51bbd963314a1177e9edd6324d268518138b3366`. Both are Preview environments and neither is a
production deployment. Post-merge CI run `33890021369` passed all configured jobs at the
same commit.

## Student Discovery

| Student path                          | Result                                                                |
| ------------------------------------- | --------------------------------------------------------------------- |
| `/learn`                              | PASS: lesson is listed and is the only public lesson                  |
| `/learn/core-engineering`             | PASS: lesson is listed                                                |
| Search for `pressure`                 | PASS: lesson is returned                                              |
| `/lessons/basic-fluid-pressure`       | PASS: direct route loads                                              |
| Parent Fluid Mechanics module         | PARTIAL: module route remains unavailable because it is unpublished   |
| Title and student metadata            | PASS: identity, duration, difficulty, review state, and sources match |
| Internal/reviewer metadata projection | PASS: approval IDs, author IDs, private notes, and file paths omitted |

The module-path failure is honest fail-closed behaviour, but it means the lesson does not
yet satisfy discovery through its complete curriculum hierarchy.

## Draft Isolation

Live route and RLS checks produced the following results:

- a draft/source-required lesson URL returned the generic unavailable experience;
- the engineering-review-required Hydraulic Cylinder lesson URL returned unavailable;
- the old `0.3.0` exact-version preview redirected to sign-in;
- reviewer and author routes redirected to sign-in;
- a guessed raw source-document path returned unavailable;
- synthetic-student RLS returned zero content-version, review-record, audit-event, and
  answer-choice rows;
- synthetic-student RLS returned zero rows belonging to another student's lesson progress,
  assessment attempts, and simulation attempts; and
- direct student invocation of the publication function was denied.

The citation projection exposes source IDs and student-safe citation text, not the source
evidence package or private reviewer material.

## Visual Learning Experience

The first meaningful lesson content is the visual pressure experience, not a theory wall.
The rendered sequence supports the required learning flow:

1. **See:** a force-on-area visual and the current pressure state are immediately visible.
2. **Interact:** synchronized force and area sliders/numeric controls are available.
3. **Observe:** the pressure value, visual state, and accessible state summary update.
4. **Explain:** concise pressure/force/area interpretation follows the interaction.
5. **Calculate:** `p = F / A` and live substitution use the current inputs.
6. **Challenge:** the student aims for the stated 200 kPa educational target.
7. **Apply:** a real-world hydraulic application provides context and limitations.

Detailed material remains below the visual experience. The route does not require a long
reading sequence before interaction.

## Engineering Behaviour

The following live known-answer cases passed:

| Force  | Area     | Expected pressure | Displayed pressure |
| ------ | -------- | ----------------- | ------------------ |
| 1000 N | 0.010 m2 | 100,000 Pa        | 100.0 kPa          |
| 2000 N | 0.010 m2 | 200,000 Pa        | 200.0 kPa          |
| 1000 N | 0.020 m2 | 50,000 Pa         | 50.0 kPa           |

The force and area controls stayed synchronized with their numeric alternatives. The
LiveEquation showed `p = F / A`, SI substitution, a pascal result, and the displayed
kilopascal conversion. The 200 kPa challenge completed at the threshold and used
educational wording rather than claiming professional design safety.

Calculation and unit behaviour is provided by the tested engineering package rather than
duplicated in the UI. Boundary, invalid-input, SI conversion, and physical-validity tests
passed in the quality suite.

## Visual Honesty

The lesson explicitly states that arrow length, surface size, and pressure-pattern
intensity are normalized teaching cues rather than physical dimensions or a time response.
No fluid flow, dynamic velocity, equipment rating, or professional design sufficiency is
claimed. The visual state changes with the computed pressure while the numerical value and
accessible text remain authoritative.

## Assessment And Competency

Repository assessment content is aligned to learning outcomes `LO-FP-001` through
`LO-FP-003`; it contains concept, calculation, and unit-awareness questions and no fault
diagnosis or other out-of-scope diagnostic task. Intended competencies are limited to
`Understood` and `Calculated`.

Delivery and persistence tests confirm that:

- answer keys and private explanations are removed before submission;
- numeric values are normalized to SI on the server;
- compatible units convert explicitly, including `0.4 kPa` to `400 Pa`;
- dimensionally incorrect units such as `N` for pressure are rejected;
- scoring, tolerance, completion, and competency changes are server-controlled;
- duplicate completion is idempotent; and
- transaction rollback, completed-attempt protection, and ownership checks pass.

The live formal assessment was not started or scored because its version does not match the
published lesson release. Live student RLS can read the stale published assessment prompt,
but cannot read answer choices, correctness flags, feedback, or private explanations. This
is secure fail-closed delivery with unresolved content-governance inconsistency.

## Progress Behaviour

Opening and interacting with the lesson did not create lesson progress, assessment
attempts, simulation attempts, dashboard progress, or competency. This passes the
no-false-mastery requirement.

Authenticated exact-build verification also found that the public lesson renderer still
shows the signed-out progress message to an authenticated student. Challenge completion is
not persisted, and the unavailable formal assessment cannot award competency. Progress is
therefore **PARTIAL**: it is safe from false awards but not yet a functioning tracked
learning flow.

## Accessibility And Mobile

The corrected accessibility suite passed all 42 checks, including critical Axe scans,
keyboard operation, synchronized slider/numeric alternatives, dynamic text, reduced
motion, and responsive layouts. The pressure state, equation, visual cues, and challenge
feedback have text equivalents and do not rely on colour alone.

At 320 px, 375 px, and 430 px:

- horizontal overflow was `0 px`;
- the simulation remained visible and usable;
- force and area controls remained readable and keyboard-operable;
- the equation remained within its container;
- the challenge could be completed; and
- the visual experience remained ahead of detailed theory.

The global header navigation wraps heavily at 320 px and 375 px. It did not obscure the
lesson, create horizontal overflow, or block touch/keyboard targets, but it is a mobile
polish limitation. Accessibility PASS is a scoped audit result, not a formal accessibility
certification.

## Performance

An indicative exact-build run at 375 px recorded:

- DOM interactive: approximately 29 ms;
- load event end: approximately 190 ms;
- browser-harness interactive readiness: approximately 210 ms;
- input-to-rendered-result, including automation overhead: approximately 129 ms;
- 27 resources;
- approximately 186 kB of transferred script;
- approximately 15 kB of transferred CSS;
- no raster images, video, canvas, WebGL, or unnecessary simulation library payload.

Interaction remained responsive during slider and numeric-input changes. These local
single-run numbers are indicative rather than a field-performance benchmark. Automated
headless mobile checks against the live URL were intercepted by Vercel deployment
protection; live desktop behaviour was checked in the in-app browser, and exact-release
mobile behaviour was checked locally.

## Security Verdict

Security is **PASS** for the tested publication boundary:

- students cannot enter author or reviewer workspaces;
- students cannot read content versions, review records, private comments, or audit events;
- students cannot invoke the publication function successfully;
- hidden answers and explanations remain unavailable before completion;
- cross-student progress and attempts are denied by RLS; and
- original source files remain unavailable through public routes.

Administrative and service-role access remains confined to trusted server/database
contexts. No administrative credential or secret was delivered to the browser or recorded
in these artifacts.

## Quality Gates

| Gate                            | Result                                        |
| ------------------------------- | --------------------------------------------- |
| Targeted lesson/security tests  | PASS: 97 tests across 7 files                 |
| Secret scan                     | PASS                                          |
| Formatting                      | PASS after audit-document creation            |
| Strict type checking            | PASS across all workspaces                    |
| Lint                            | PASS                                          |
| Content validation              | PASS: 29 tests                                |
| Migration validation            | PASS: 21 tests                                |
| Unit and integration tests      | PASS: 375 passed, 5 opt-in live tests skipped |
| Production build                | PASS: 39 static pages                         |
| Accessibility                   | PASS: 42 checks                               |
| Smoke                           | PASS: 5 tests                                 |
| End-to-end                      | PASS: 108 tests                               |
| Live read-only RLS verification | PASS                                          |
| GitHub CI at audited commit     | PASS: run `33890021369`                       |

The first accessibility invocation reused a server that lacked the E2E test environment,
causing 14 authentication-test failures. No assertion was suppressed: the unchanged suite
was rerun with its documented E2E environment and passed 42 of 42. Playwright emitted the
existing informational `NO_COLOR`/`FORCE_COLOR` warning. The five skipped unit cases are
explicitly opt-in live-database tests; this audit separately executed live read-only SQL.

## Exact Blockers And Limitations

1. **Linked assessment integrity:** assessment `ASM-FLUID-PRESSURE-001` is not the exact
   reviewed version expected by the application. This blocks assessment and competency use.
2. **Progress integration:** authenticated lesson activity and challenge completion are not
   persisted, and the authenticated renderer shows incorrect signed-out wording.
3. **Curriculum discovery:** the parent module remains unpublished, so its module route does
   not lead students to the lesson.
4. **Live authenticated UI evidence:** no new live synthetic account was created during this
   read-only audit; authenticated UI coverage used the exact release build while live RLS
   used an existing synthetic-student identity.
5. **Mobile navigation polish:** global header labels wrap excessively at narrow widths.
6. **Performance evidence:** measurements are local single-run observations, not real-user
   monitoring from average student devices or low-bandwidth networks.

No simulation is attached to the lesson. This is an explicit scope fact, not a missing
simulation version.

## Controlled-Pilot Decision

**READY WITH LIMITATIONS** applies only if all of these controls are accepted:

- the pilot is limited to the Basic Fluid Pressure lesson's visual interaction and
  challenge;
- formal assessment, competency award, and progress tracking are excluded and not
  represented as operational;
- students enter through Learn, Core Engineering, search, or the direct lesson URL;
- a facilitator records qualitative feedback outside the application without collecting
  unnecessary personal data; and
- the assessment mismatch is remediated and re-audited before any scored pilot activity.

Without those controls, the lesson is **NOT READY** for a scored or progress-tracked pilot.
Prompt 48 made no fix, publication change, migration, content edit, approval, deployment,
or production change.
