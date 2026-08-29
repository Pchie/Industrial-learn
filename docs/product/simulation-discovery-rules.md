# Simulation Discovery Rules

Status: V1 deterministic discovery
Date: 2026-08-27
Internal references: IL-PRD-001, IL-CURRICULUM-001, IL-SIM-LAB-39F

## Search

Search is local, deterministic, case-insensitive, and substring based. Leading and trailing
space is ignored. The index is composed only from registered metadata:

- title;
- main concept and topic;
- related module;
- discipline;
- components and systems; and
- declared common abbreviations.

Search does not use AI, external sources, student free text, hidden assessment content, or
unpublished technical documents. A term such as `PLC` returns no result until a real
registered simulation declares that abbreviation.

## Combined Filters

Discipline, difficulty, simulation type, mode, and pathway filters use AND semantics.
Values within a multi-valued simulation field, such as type or mode, use membership. Text
search is applied after the same structured checks. Clearing filters restores the complete
registered catalogue.

Discipline counts report operationally available entries. A registered review-gated item
does not increase the available count even though it remains searchable by its honest
status.

## Empty Results

No-result states remain actionable and honest. The Thermodynamics view may show the
registered Thermal System Boundary candidate as `Coming later` and `Engineering review
required`, with no start action. Other empty states state that no registered simulation
matches and offer a clear-filter action. Unimplemented curriculum items remain in
collections as `Coming later`, never as available search results.

## Prerequisite Resolution

Resolution first honours catalogue availability. A non-available item cannot be unlocked by
progress. For an available item:

- `recommended` keeps the item available;
- `required` requires every declared prerequisite lesson slug to have submitted or graded
  progress for the authenticated student;
- missing required evidence resolves to `locked-by-prerequisite`.

Opening a page is not prerequisite evidence and cannot unlock a simulation.

## Recent Activity

Anonymous users see a sign-in invitation and no fabricated activity. Authenticated users
see only their own persisted recent attempts, limited to recognised registry simulations.
The list distinguishes in-progress, submitted, graded, and abandoned records through the
existing attempt status rather than inferred time spent.

When private history cannot be loaded, the catalogue remains usable but the personal strip
explicitly reports that activity is unavailable. It does not substitute seed values or
global activity.

## Deterministic Recommendations

V1 may recommend a simulation only when:

- the student has an in-progress attempt for it; or
- it belongs to a current enrolled module and all declared prerequisites have completion
  evidence.

No general popularity ranking, AI inference, time-spent heuristic, or cross-student data is
Non-available entries are excluded before recommendation evidence is evaluated.

## Competency Display

The catalogue reads competency from completed persisted simulation attempts. A competency
level appears only when the attempt is submitted or graded and its stored award value is
positive. Opening, starting, resetting, or merely spending time in a simulation cannot
create a catalogue competency label.

## Ordering

V1 preserves explicit registry order. It does not silently reorder content by engagement,
score, commercial priority, or unavailable future work. Any future ranking rule requires a
documented deterministic policy and privacy review.
