# Industrial Learn Data Flow

## Source IDs

- IL-AGENTS-001: `AGENTS.md`
- IL-PRD-001: `docs/product/product-requirements.md`
- IL-MVP-001: `docs/product/mvp-scope.md`
- IL-JOURNEY-001: `docs/product/user-journeys.md`

## Data Flow Principles

- Browser clients never access PostgreSQL, object storage, or privileged services directly.
- UI components call feature-level application services through approved API routes.
- Domain logic runs on the server or in isolated pure libraries.
- Engineering calculations are pure functions and use consistent SI units internally.
- Content approval state controls what students can see.
- Analytics and logs must minimise personal data.

Sources: IL-AGENTS-001, IL-PRD-001.

## Student Lesson Flow

1. Student authenticates.
2. Frontend requests available schools, modules, topics, and assignments.
3. API checks student access against enrolment, cohort, assignment, and content status.
4. API returns approved lesson metadata and structured content.
5. Frontend renders the lesson using design system components.
6. Student completes reading, calculation, simulation, and assessment activities.
7. Activity results are sent to the progress service.
8. Progress service writes completion, attempt, feedback, and skill state to PostgreSQL.
9. Lecturer summaries are updated from progress data.

## Calculation Activity Flow

1. Student enters values and units in the frontend.
2. Frontend sends activity ID and user input to the calculation endpoint.
3. API loads the approved activity definition and allowed calculation function reference.
4. Unit conversion converts input values into internal SI units.
5. Engineering calculation library runs a pure function.
6. Calculation result returns numeric outputs, unit metadata, validation feedback, and step data where allowed.
7. Frontend renders feedback and worked steps.
8. Progress service records the attempt outcome.

The UI never owns the formula. Source: IL-AGENTS-001.

## Simulation Flow

1. Student opens a simulation activity.
2. API checks access and returns simulation definition, labels, allowed ranges, source IDs, scenario states, and initial state.
3. Frontend renders controls and visual state.
4. User changes inputs.
5. Simulation logic computes state transitions and derived values.
6. Engineering calculation functions are called only from the simulation logic or domain layer.
7. Frontend renders normal, boundary, or fault-state feedback.
8. Progress service records completion and diagnostic outcomes.

Each simulation must have normal-state, boundary-state, and fault-state tests. Source: IL-AGENTS-001.

## Assessment Flow

1. Student starts an assessment.
2. API verifies access and returns assessment content appropriate to the user and assignment.
3. Student submits answers.
4. Assessment engine evaluates answers using assessment rules and calculation functions where needed.
5. API stores the attempt, response details, feedback, and score.
6. Progress service updates topic and skill progress.
7. Lecturer dashboard reads authorised summary data.

## Project Flow

1. Student opens a project linked to a topic.
2. API returns instructions, constraints, deliverables, rubric, source IDs, assumptions, and limitations.
3. Student creates a submission and uploads any allowed attachments.
4. File metadata is stored in PostgreSQL and binary files are stored in object storage.
5. Lecturer or reviewer assesses the submission against the rubric.
6. Progress service records project completion and feedback.

## Content Authoring Flow

1. Author creates or edits draft content.
2. Author adds learning outcomes, prerequisites, source IDs, assumptions, limitations, activities, assessment content, and simulation specifications.
3. Author submits content for review.
4. Review service creates a review request.
5. Reviewer checks source IDs, equations, units, safety framing, and simulation behaviour.
6. Review service stores review outcome and notes.
7. Content status changes only according to review policy.
8. Student-facing approval requires a review record.

Sources: IL-AGENTS-001, IL-JOURNEY-001.

## Search Indexing Flow

1. Content or review state changes.
2. Background job receives indexing task.
3. Indexer loads content, source metadata, approval state, and access category.
4. Indexer writes permitted fields to the search index.
5. Search API filters results again by role, content status, cohort access, and ownership.

Search indexing does not replace server-side access control.

## Future AI Mentor Flow

1. Student asks a question.
2. AI service receives user, role, cohort, and question metadata.
3. Retrieval service searches only policy-authorised knowledge chunks.
4. AI service generates an answer with source IDs.
5. Calculation requests are routed to tested calculation functions instead of free-form AI reasoning.
6. Response is returned with limitations where needed.
7. Interaction is logged according to privacy policy.

The AI mentor is future scope and must not bypass review, source, or safety controls. Sources: IL-AGENTS-001, IL-MVP-001.

## Analytics Flow

1. Product and learning events are emitted from server-side workflows and selected client interactions.
2. Events are validated against an approved event schema.
3. Events are stored with minimal personal data.
4. Aggregation jobs produce lecturer, product, and educational success summaries.
5. Dashboards apply access-control rules before displaying analytics.
