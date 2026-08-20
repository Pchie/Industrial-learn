# Simulation Browser Security

Source IDs: IL-AGENTS-001, IL-AUTH-001, IL-DAL-001, IL-DB-001.

## Protected Data

Simulation attempts are private student learning records. Browser routes must not accept a student ID from form input or URL parameters. The authenticated server session determines the student profile for start, completion, review, history, and dashboard integration.

## Trusted Server Controls

- Simulation start binds the authenticated student, simulation version, lesson context, and mode.
- Completion reconstructs and validates simulation state on the server using the registered simulation runtime.
- Assessment-mode score and competency awards are server-controlled.
- The browser may display live state for learning, but it is not trusted for scoring.
- Completion uses an idempotency key so duplicate requests do not award evidence twice.

## Persistence Boundary

The database stores bounded summaries rather than animation frames:

- input state
- output summary
- fault introduced
- measurements taken
- diagnosis submitted
- score
- competency awards
- start and completion time

## Row-Level Access

Students may read only their own simulation attempts. Lecturers may read only authorised student records. Engineering reviewers do not automatically receive student-data access.

## Current Limitation

The web adapter uses service-role server contexts for trusted persistence. Service credentials must remain server-only and must never be exposed to client components or browser bundles.
