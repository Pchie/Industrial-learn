# Industrial Learn Product Requirements

## Product Vision

Industrial Learn supports engineering students from first semester through junior professional practice. It connects academic theory, step-by-step calculations, interactive simulations, fault diagnosis, design exercises, engineering projects, professional development, and future engineering technologies in one reviewed learning platform.

The platform is organised into two connected schools:

- Core Engineering: foundational engineering knowledge, calculations, simulations, assessments, projects, and professional practice fundamentals.
- Future Engineering: emerging technologies, modern industrial systems, digital engineering, automation, sustainability, AI-supported engineering workflows, and advanced interdisciplinary practice.

The product should help students move from "I can follow the lecture" to "I can solve, test, explain, and defend an engineering decision."

## Product Mission

Industrial Learn exists to make engineering learning more practical, traceable, accessible, and professionally credible by giving students:

- Clear theory explanations.
- Worked calculations with unit discipline.
- Interactive simulations that reveal cause and effect.
- Fault-diagnosis practice.
- Design exercises with constraints.
- Reviewed source-backed technical content.
- Progress tracking from introductory learning to junior practice readiness.

## Primary Target Users

- Undergraduate engineering students in their first semester through final year.
- Diploma and vocational engineering students who need applied, calculation-led learning.
- Early junior engineers who need structured revision and practical confidence.

## Secondary Target Users

- Lecturers and tutors who want assignable, reliable learning activities.
- Content authors creating engineering lessons, simulations, assessments, and projects.
- Engineering reviewers checking formulas, statements, simulations, source references, and professional appropriateness.
- Department administrators who need evidence of student progress and curriculum support.

## Student Problems Being Solved

- Theory is often separated from calculations and practical diagnosis.
- Students may know formulas but not when, why, or how to apply them.
- Unit mistakes are hard to detect early.
- Lab time is limited, and not every fault condition is safe or practical to reproduce.
- Students need repeated practice without waiting for lecturer feedback.
- Students struggle to connect first-year concepts to later professional judgement.
- Future engineering topics can feel disconnected from core fundamentals.

## Lecturer Problems Being Solved

- Repeating the same explanations and calculation corrections consumes teaching time.
- It is difficult to see which concept, unit, or reasoning step caused a student to fail.
- Practical simulations and fault exercises are hard to prepare consistently.
- Assessment evidence can be fragmented across worksheets, learning systems, and lab reports.
- Lecturers need content they can trust, assign, and adapt without losing engineering rigour.

## Engineering Reviewer Requirements

Engineering reviewers must be able to:

- Review technical statements against approved source IDs.
- Review equations, assumptions, input ranges, and SI unit handling.
- Confirm that content is not marked approved without a review record.
- Check simulations for normal-state, boundary-state, and fault-state behaviour.
- See version history for reviewed content.
- Flag unsafe, ambiguous, unsourced, or overconfident engineering claims.
- Require corrections before student-facing approval.

## Main Product Features

- Two connected schools: Core Engineering and Future Engineering.
- Topic-based learning modules.
- Concept explanations with approved source references.
- Step-by-step calculation walkthroughs.
- Pure calculation engines surfaced through learning activities.
- Interactive simulations for selected engineering topics.
- Fault diagnosis exercises.
- Design exercises with constraints, assumptions, and feedback.
- Assessments with attempts, feedback, and progress indicators.
- Student progress tracking by topic, skill, calculation type, simulation, and project.
- Engineering projects that combine theory, calculations, decisions, and reflection.
- Content status workflow from draft to approved for student use.
- Engineering review workflow for sources, equations, and simulations.
- Lecturer assignment and cohort overview features.
- Low-data and mobile-friendly learning access.

## Connected School Model

Core Engineering provides the foundation. Future Engineering builds on it.

Examples:

- A Core Engineering lesson on electric circuits can connect to Future Engineering topics in sensors, industrial automation, renewable systems, and digital twins.
- A Core Engineering lesson on forces and moments can connect to robotics, additive manufacturing, structural optimisation, and maintenance diagnostics.
- A Core Engineering lesson on thermodynamics can connect to energy systems, heat pumps, hydrogen, industrial efficiency, and sustainability.

The product should make these links explicit so students understand that future technologies are extensions of disciplined engineering fundamentals.

## Platform Success Measures

- Student activation rate.
- Lesson completion rate.
- Assessment completion rate.
- Repeat practice rate.
- Simulation usage rate.
- Project submission rate.
- Lecturer assignment adoption.
- Reviewed content coverage.
- Content review turnaround time.
- Mobile completion rate.
- Low-data session success rate.
- Accessibility issue closure rate.

## Educational Success Measures

- Improvement between first and later assessment attempts.
- Reduction in repeated unit errors.
- Improvement in calculation-step completion.
- Improvement in fault-diagnosis accuracy.
- Student ability to explain assumptions and limitations.
- Student ability to connect theory to design decisions.
- Project rubric improvement over time.
- Lecturer-reported reduction in repeated remedial explanation.

## Technical Risks

- Calculation logic may drift from displayed explanations if not centrally managed.
- Simulations may look convincing while hiding incorrect engineering behaviour.
- Source and review metadata can become inconsistent if treated as optional.
- Mobile performance may suffer if simulations are too heavy.
- Offline and low-data needs may conflict with rich interactive media.
- Assessment and progress models may become too complex for a small first-release team.
- AI retrieval features can create trust issues if introduced before source governance is mature.

## Content Risks

- Unsourced technical claims could damage trust.
- Approved status could be misused without review records.
- Content may become too broad before the review process is ready.
- Future Engineering topics may become speculative if not grounded in reviewed sources.
- Regional curriculum differences may make scope hard to manage.
- Manufacturer-specific examples may accidentally imply unsupported ratings or recommendations.

## Safety Risks

- Students may apply practice examples to real equipment without sufficient context.
- Fault diagnosis exercises may imply unsafe troubleshooting behaviour if not carefully framed.
- Simulations may understate the seriousness of electrical, mechanical, thermal, chemical, or control-system hazards.
- Professional judgement cannot be replaced by the platform.
- Safety-critical content must include source-backed warnings, assumptions, limitations, and review records.

## Privacy Requirements

- Student data must have an ownership and access-control policy.
- Students must be able to understand what progress data is collected.
- Lecturer access must be limited to relevant cohorts or authorised groups.
- Reviewer and author actions must be attributable for audit purposes.
- Secrets and service credentials must never be exposed to the browser.
- Personal data should be minimised for the first release.
- Export and deletion policies must be defined before production launch.

## Accessibility Requirements

- All interactive components must support keyboard use.
- Meaning must not be communicated through colour alone.
- Content must support screen reader navigation through semantic structure.
- Simulations must provide textual state, input labels, and non-visual feedback.
- Assessment feedback must be readable, specific, and not dependent on animation.
- The platform must support mobile, tablet, and desktop layouts.
- Motion should be limited or controllable where it could distract or impair use.

## Low-Data Requirements

- Core learning content must remain usable on limited bandwidth.
- Heavy simulations should load only when needed.
- Images, media, and simulation assets should be optimised.
- Text-first alternatives must exist for essential learning.
- Progress updates should be resilient to intermittent connectivity.
- First release should avoid dependence on continuous streaming media.

## Mobile Requirements

- Students must be able to complete lessons, calculations, quizzes, and reflection tasks on mobile.
- Simulations must have mobile-appropriate controls.
- Inputs must be easy to use without precision pointer devices.
- Tables and calculation steps must reflow without losing meaning.
- Lecturers may review summaries on mobile, but full authoring and review can be desktop-first in the first release.

## First-Release Scope

The first release must be achievable by a small development team. It should prove the learning model, review model, and calculation discipline without trying to cover every engineering field.

First release includes:

- Core product navigation for two schools.
- A small reviewed content library.
- One to three Core Engineering topic modules.
- One introductory Future Engineering topic module connected to Core Engineering.
- Step-by-step calculation activities for selected topics.
- A limited set of pure tested calculation functions.
- One or two interactive simulations.
- Basic fault diagnosis exercises linked to those simulations.
- Basic assessments with feedback.
- Student progress tracking at module and activity level.
- Lecturer assignment and cohort progress overview.
- Content authoring workflow using defined content statuses.
- Engineering review workflow for source, equation, and simulation checks.
- Mobile, tablet, and desktop responsive support.
- Low-data conscious content delivery.

First release should not include full marketplace features, broad curriculum coverage, complex AI tutoring, live equipment integration, or high-stakes certification.
