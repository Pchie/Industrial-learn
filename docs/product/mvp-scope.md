# Industrial Learn MVP Scope

## MVP Principle

The first release must be small enough for a small development team while still proving the Industrial Learn model:

- Two connected schools.
- Reviewed technical content.
- Step-by-step calculations.
- Simulations with tested states.
- Assessments and progress.
- Lecturer visibility.
- Content and engineering review workflow.

The MVP should prioritise depth, correctness, and reviewability over broad curriculum coverage.

## Included In First Release

### Product Structure

- Core Engineering school.
- Future Engineering school.
- Clear links from selected Core Engineering topics to selected Future Engineering topics.
- Topic pages with learning outcomes, prerequisites, content status, and activities.

### Content

- One to three Core Engineering modules.
- One Future Engineering module linked to the selected Core modules.
- Source-backed concept explanations.
- Content status workflow using the approved status list.
- Visible distinction between draft, source-required, reviewed, and approved content.

### Calculations

- Step-by-step calculation activities for the selected modules.
- Engineering calculations implemented as pure tested functions.
- Consistent SI units internally.
- Feedback for common mistakes such as unit errors, missing assumptions, and incorrect substitutions.

### Simulations

- One or two interactive simulations.
- Simulation states covering normal operation, boundary conditions, and fault conditions.
- Automated tests for normal-state, boundary-state, and fault-state behaviour.
- Textual explanation of simulation state for accessibility and low-data fallback.

### Assessments

- Short formative quizzes.
- Calculation practice checks.
- Fault diagnosis questions.
- Feedback linked to concepts, calculation steps, and diagnostic reasoning.

### Student Progress

- Module completion.
- Activity completion.
- Assessment attempts.
- Calculation skill progress.
- Simulation completion.
- Project or design exercise completion.

### Lecturer Tools

- Basic cohort or class overview.
- Assignment of available modules and activities.
- Progress summary by student and topic.
- Identification of common weak areas.

### Authoring And Review

- Content author workflow.
- Engineering reviewer workflow.
- Review records for approved content.
- Required source IDs for important technical statements.
- Review states for source checks, equation checks, simulation checks, and student-use approval.

### Accessibility, Mobile, And Low Data

- Keyboard-accessible interactive components.
- No meaning communicated through colour alone.
- Responsive support for mobile, tablet, and desktop.
- Optimised text-first learning experience.
- Simulations loaded only when needed.

## Suggested MVP Topic Strategy

The MVP should choose topics that are foundational, visual, calculation-friendly, and simulation-friendly.

Recommended pattern:

- Core Engineering module 1: foundational calculation topic.
- Core Engineering module 2: system behaviour or diagnostics topic.
- Core Engineering module 3: optional project-linked topic.
- Future Engineering module 1: connected applied technology topic.

The exact disciplines should be selected after confirming available reviewer expertise and source material.

## MVP Acceptance Criteria

- A student can complete a full topic journey from concept to calculation to simulation to assessment.
- A lecturer can assign that journey and see progress.
- An author can submit content for review.
- A reviewer can approve or request changes.
- Approved content cannot exist without a review record.
- Important technical statements require approved source IDs.
- Calculations are outside UI components and covered by tests.
- Simulations have normal-state, boundary-state, and fault-state tests.
- The experience works on mobile, tablet, and desktop.
- The experience remains usable in low-data conditions.

## MVP Known Limitations

- Limited curriculum coverage.
- Limited number of simulations.
- Limited lecturer analytics.
- Desktop-first authoring and engineering review.
- No high-stakes certification.
- No live equipment integration.
- No broad AI tutoring or automated engineering judgement.
- Limited institutional administration features.
