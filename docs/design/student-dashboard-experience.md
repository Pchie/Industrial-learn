# Student Dashboard Experience

Prompt 53 implementation, 2026-09-07. Route: `/dashboard`.

## Purpose and Scope

The dashboard is a study workspace: next action, recorded learning location, current
learning, permitted practice, and reviewable results. It is not an analytics dashboard
or a new scoring system. The existing server session, capabilities, RLS, lesson and
simulation publication gates, assessment version checks and competency awards remain
authoritative.

Prompt 51's shared header, Appearance selector and semantic theme tokens are reused.
No Prompt 52 implementation or report was found in this checkout. This task does not
claim to complete Prompt 52 or replace the shared header on its behalf.

## Information Hierarchy

1. Authenticated display name and compact study context. Programme/year/semester appear
   only when authorised records supply them. An email address is never curriculum data.
2. One prominent Continue learning surface, with an original lightweight lesson visual,
   difficulty/duration, recorded last-activity date when available, and Start lesson or
   Return to lesson. The thumbnail is labelled as an illustration, not restored state.
3. My learning: a compact sequence of eligible lessons and explicitly assigned modules.
   Available, In progress, Completed and Progress unavailable are text labels. Knowledge
   prerequisites are expandable; the UI does not manufacture an unmet competency lock
   from free-text prerequisite descriptions.
4. Practice: up to three eligible related simulations, or a link to the current lesson's
   visual activity when no standalone simulation qualifies. Existing evidence-based
   revision suggestions remain secondary and retain supported dismissal/hide actions.
5. Results and progress: recorded visible-lesson completions, a completion explanation,
   up to five review-permitted graded assessment results, explicit competency awards,
   and real activity records. No decorative chart, streak, rank or time-based mastery.
6. Saved content only when the student has saved a currently published lesson.

The student navigation rail contains Overview, My learning (an in-page destination),
Simulations, Assessments, conditional Saved content and Explore learning. Author,
reviewer and owner tools are not added to it. The existing header retains authorised
workspace switching and theme/account controls. An owner's student perspective retains
that owner's identity and the existing explanatory banner.

## Data Sources and Boundaries

`page.tsx` resolves `requireStudentProfile` on the server, then calls the existing
`loadStudentDashboardData` service. `summary-queries.ts` defines explicit bounded reads;
the REST adapter uses the current session token, anon key, owner filters and no-store.
There is no service-role credential in this path.

| Section                    | Persisted source                                                    | Maximum loaded records               |
| -------------------------- | ------------------------------------------------------------------- | ------------------------------------ |
| Study context              | Active enrolments, cohort, programme slug and assigned module slugs | 5 enrolments                         |
| Lesson location/completion | `lesson_progress`                                                   | 25                                   |
| Assessment summaries       | `assessment_attempts` plus publication metadata from `assessments`  | 10                                   |
| Simulation activity        | `simulation_attempts` plus simulation title/slug                    | 10                                   |
| Project compatibility data | Existing `project_submissions` summary read                         | 10; no unusable project action shown |
| Saved content              | `saved_lessons` plus lesson slug                                    | 10                                   |
| Recommendation dismissals  | `dashboard_recommendation_dismissals`                               | 100                                  |

All seven reads filter by the server-resolved `student_profile_id`. The enrolment read
also excludes withdrawn records. Exact limits, ordering and selectors are tested. No
answer payload, private explanation, scoring summary or animation history is requested.
Reaching a limit is conservatively reported as an incomplete history, not a platform-wide
total. Seven reads are bounded in their top-level record counts; cohort-module membership
is the authorised relationship list, not a separate all-student query.

Assessment review links require the existing publication gate, matching content/version,
artifact and parent-lesson metadata, approved review/authorisation, server-only answer
protection, no unresolved blockers and matching source/equation/outcome IDs. The destination
still independently enforces ownership and review policy. Earlier or unverifiable attempts
get an unavailable notice without their answers or a misleading review link.

`experience.ts` is a read-only presentation projection. It uses the existing completion
predicate and calculation functions unchanged. Module percentages are withheld when
their complete evidence scope is unavailable or mixes unsupported activity denominators.
Visible lesson completions are deduplicated within the loaded records. The displayed
competency values require explicit persisted awards; legacy score/mode-based inference
is not presented as a new award. Opening a page, changing themes or camera views does
not write completion or competency.

## Supported States

| State                       | Behaviour                                                                            |
| --------------------------- | ------------------------------------------------------------------------------------ |
| New student/no enrolment    | Eligible first lesson, no invented programme or progress, exploration links          |
| Returning student           | Recorded lesson location/date, existing completion state and available saved content |
| Withdrawn previous lesson   | Generic unavailable notice and an eligible alternative; no draft title/link leak     |
| No published content        | Honest empty state and catalogue navigation                                          |
| No progress records         | No recorded completion, not a fabricated programme percentage                        |
| Partial service failure     | Keep successful sections; identify unavailable sections and provide reload           |
| Expired/invalid session     | Existing sign-in redirect; session-related data-query rejection fails closed         |
| Access denied               | Existing server capability enforcement; no client-only role check                    |
| Complete service failure    | Safe error boundary with retry and learning navigation                               |
| Old/unreviewable assessment | No result detail or answer delivery; explicit unavailable notice                     |

## Responsive and Accessible Behaviour

Desktop uses a compact rail and a flexible main column, with the lesson visual beside the
next action. Tablet stacks that visual when space is constrained. Mobile uses a native
Study navigation disclosure, consistent with the shared header's disclosure pattern,
and places the lesson action before its thumbnail. The content order remains Continue
learning, My learning, Practice, Results. No second bottom bar or nested scroll container
is added. The desktop rail and mobile disclosure share one link definition; only the
appropriate navigation is exposed at each width.

The dashboard uses the existing Slate Blue, Muted Teal, Pearl White and Deep Blue Grey
semantic tokens, including contrasting dark-mode action variants. Native links, details
and existing buttons retain keyboard operation and focus styling. Navigation links have
44px minimum height. Status remains understandable without colour; the static visual
has a descriptive text alternative. No motion is introduced, and shared reduced-motion
and Appearance preferences remain effective. Verification covers 320, 375, 430, 768,
1024 and 1440 CSS-pixel widths in Light and Dark.

## Deliberately Unavailable Capabilities

- Production enrolments do not currently supply an explicit current academic year or
  semester. Those labels stay absent until an authorised integration supplies them.
- There is no exact lesson-step or simulation-state restoration. Return to lesson means
  the lesson location, and simulation entry uses its existing guarded overview/start flow.
- Project pages and learning-preference editing are not usable workflows in this checkout;
  no dashboard action pretends otherwise. The shared global navigation is unchanged.
- The catalogue currently permits the Basic Fluid Pressure lesson. Hydraulic and Bernoulli
  previews remain unpublished; this dashboard does not promote them to student content.
- Overall programme/mastery percentages are not inferred from limited recent records.
- No new AI, analytics, recommendation rules, enrolment forms, save controls or storage
  are introduced. Existing recommendation and saved-content records are read when available.

See the [verification report](../audits/prompt-53-student-dashboard-redesign.md) for actual
test results, screenshot locations, performance measurements and live-verification limits.
