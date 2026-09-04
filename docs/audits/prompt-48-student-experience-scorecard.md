# Prompt 48 Student Experience Scorecard

Audit date: 2026-09-04

Target: Basic Fluid Pressure `0.4.0` on protected staging

Scale: **PASS** meets the audited requirement; **PARTIAL** is safe but incomplete;
**FAIL** does not meet the requirement. No aggregate percentage is assigned because the
categories are not equally important and a numeric total could conceal a release blocker.

## Scorecard

| Student-experience area       | Result      | Evidence and student impact                                                    |
| ----------------------------- | ----------- | ------------------------------------------------------------------------------ |
| Learn catalogue discovery     | **PASS**    | Listed on `/learn` with honest published/review state                          |
| Core Engineering discovery    | **PASS**    | Listed under Core Engineering                                                  |
| Search                        | **PASS**    | Deterministic search for `pressure` returns the lesson                         |
| Parent module discovery       | **PARTIAL** | Parent module is unpublished, so the module route remains unavailable          |
| Direct lesson access          | **PASS**    | `/lessons/basic-fluid-pressure` loads the exact published lesson               |
| First-screen orientation      | **PASS**    | Visual pressure experience appears before detailed theory                      |
| Force interaction             | **PASS**    | Slider and numeric input stay synchronized and keyboard-operable               |
| Area interaction              | **PASS**    | Slider and numeric input stay synchronized and keyboard-operable               |
| Immediate observation         | **PASS**    | Pressure value, visual state, equation, and text summary update together       |
| Live equation                 | **PASS**    | `p = F / A` uses current SI values and displays the kPa conversion             |
| Known-answer accuracy         | **PASS**    | 100/200/50 kPa representative cases produced the expected results              |
| Challenge                     | **PASS**    | 200 kPa threshold works and feedback avoids professional-safety claims         |
| Visual honesty                | **PASS**    | Normalized arrows/patterns are disclosed; flow and dynamics are not invented   |
| Theory burden                 | **PASS**    | Required explanation is concise and detailed material follows interaction      |
| Real-world application        | **PASS**    | Application context is present with appropriate model limitations              |
| Formal assessment             | **FAIL**    | Live version `1` fixture does not match application-expected version `2`       |
| Hidden-answer protection      | **PASS**    | Student context cannot read choices, correctness, feedback, or explanations    |
| Scoring architecture          | **PASS**    | Server controls units, tolerance, scoring, completion, and competency          |
| No false mastery on open      | **PASS**    | Opening and interacting creates no progress or competency                      |
| Activity progress             | **PARTIAL** | Challenge completion is not persisted                                          |
| Authenticated progress copy   | **FAIL**    | Authenticated exact-build session receives the signed-out progress message     |
| Assessment competency         | **PARTIAL** | Correct rules exist, but the mismatched live assessment cannot be completed    |
| Keyboard access               | **PASS**    | All tested lesson controls and challenge actions work without a pointer        |
| Screen-reader state           | **PASS**    | State, equation, visual meaning, and challenge feedback have text equivalents  |
| Reduced motion                | **PASS**    | Reduced-motion behaviour passed the accessibility suite                        |
| Colour independence           | **PASS**    | Meaning and success state are also conveyed through labels and text            |
| Mobile 320 px                 | **PASS**    | No overflow; simulation, controls, equation, and challenge remain usable       |
| Mobile 375 px                 | **PASS**    | No overflow; simulation, controls, equation, and challenge remain usable       |
| Mobile 430 px                 | **PASS**    | No overflow; simulation, controls, equation, and challenge remain usable       |
| Narrow global navigation      | **PARTIAL** | Header labels wrap heavily at 320 px and 375 px, but do not block lesson use   |
| Interaction responsiveness    | **PASS**    | Exact-build interaction remained responsive during input changes               |
| Student privacy and isolation | **PASS**    | Reviewer data, drafts, source files, hidden answers, and other students denied |

## Required Learning Flow

| Stage     | Result   | Observation                                                                    |
| --------- | -------- | ------------------------------------------------------------------------------ |
| See       | **PASS** | Visual force-on-area representation is immediately visible                     |
| Interact  | **PASS** | Force and area can be changed by slider, keyboard, or numeric input            |
| Observe   | **PASS** | Numerical, visual, and accessible state update together                        |
| Explain   | **PASS** | Concise interpretation connects pressure, force, and area                      |
| Calculate | **PASS** | Live SI substitution is shown through the approved equation                    |
| Challenge | **PASS** | Student can reach and verify the educational pressure target                   |
| Apply     | **PASS** | Hydraulic application context is included without overstating the simple model |

## Mobile Measurements

| Width  | Horizontal overflow | Keyboard input synchronization | Equation overflow | Challenge |
| ------ | ------------------- | ------------------------------ | ----------------- | --------- |
| 320 px | 0 px                | PASS                           | 0 px              | PASS      |
| 375 px | 0 px                | PASS                           | 0 px              | PASS      |
| 430 px | 0 px                | PASS                           | 0 px              | PASS      |

The global header wrapping is a polish concern, not a failure of the lesson simulation or
its controls. Mobile results come from the exact release build because automated live
mobile access was intercepted by Vercel deployment protection.

## Student-Safe Pilot Boundary

The student experience is **READY WITH LIMITATIONS** for a small, supervised,
non-scored lesson pilot. The visual interaction, equation, challenge, application context,
accessibility, and data isolation are suitable for observation and qualitative feedback.

The following must be presented as unavailable during that pilot:

- formal assessment and competency award;
- persisted lesson/challenge progress; and
- navigation through the unpublished parent module.

The pilot must not be described as scored, mastery-tracked, or a complete module journey.
The assessment mismatch is the exact blocker to a scored pilot; progress integration is the
exact blocker to a progress-tracked pilot.
