# Simulation Lab Product Specification

Status: Implemented through the Prompt 39G controlled replication gate
Date: 2026-08-27
Internal references: IL-PRD-001, IL-SIM-001, IL-VISUAL-STANDARD-V1,
IL-SIM-LAB-39F

## Purpose

Simulation Lab is Industrial Learn's practical engineering workspace. Its product promise
is: **Operate engineering systems. Change variables. See the physics. Diagnose problems.**
It is a laboratory and discovery surface, not a second course catalogue.

The lab exposes reviewed simulation capability already registered in the platform. It does
not fabricate activity, competency, simulations, engineering approval, or availability.

## Routes

- `/simulations` is the public discovery surface with optional authenticated activity.
- `/simulations/[simulationSlug]` is the visual briefing and mode-selection page.
- `/simulations/[simulationSlug]/attempt/[attemptId]` is the focused authenticated
  workspace.
- `/simulations/[simulationSlug]/attempt/[attemptId]/review` is the private completed-attempt
  review.
- `/simulations/history` is the private simulation history.

The catalogue and detail routes may be inspected without signing in. Starting, resuming,
completing, or reviewing an attempt requires an authenticated student session.

## Main Lab Experience

The first screen contains a concise heading and purpose statement, deterministic search,
discipline shortcuts, and real private activity when a student is authenticated. The
catalogue follows immediately. Long theory and marketing copy are excluded.

Students can combine discipline, difficulty, simulation type, interaction mode, career
pathway, and text search. Empty categories state that work is being prepared. A registered
simulation whose technical review gate is incomplete may appear as a non-actionable
`Coming later` card so students can discover the planned scope without receiving a start
path. Curriculum items with no registered implementation appear only inside curated
collections as `Coming later`.

## Simulation Detail

The detail route prioritises a large lightweight visual preview, the main concept,
operable variables, learning outcomes, review state, difficulty, estimated time, related
module, and available modes. For an available simulation, the primary action starts the
registered beginner mode, currently Explore for Hydraulic Cylinder Force. A review-gated
detail route shows no start or mode action and explains the remaining gate. Technical IDs,
equations, sources, and limitations remain available in a secondary disclosure.

Mode language is fixed:

- Learn: Show me what everything does.
- Guided: Walk me through an engineering task.
- Explore: Let me experiment.
- Diagnose: Give me a fault.
- Assessment: Test what I know.

Unsupported modes are omitted because mode availability comes from the simulation-engine
definition.

## Focused Workspace

The attempt route suppresses unrelated global navigation while retaining clear exits to
Simulation Lab and the related lesson. The order is visual, controls, measurements,
challenge or fault interaction, and equation/help where the selected mode permits it.
Fault controls and equation help respect the central mode-capability policy.

Starting or opening an attempt awards no competency. Only completed persisted attempts can
provide competency evidence, under the existing server-controlled award rules.

## Status And Prerequisites

Every catalogue record has an explicit availability and review state. Visible status labels
include `Available`, `Engineering review required`, `Coming later`, and `Locked by
prerequisite`; technical review is displayed separately from operational availability.

Required prerequisites lock a simulation until authenticated completion evidence exists.
Recommended prerequisites remain visible and operable. Hydraulic Cylinder Force uses a
recommended Basic Fluid Pressure prerequisite so the visual-first beginner experience is
not blocked by a theory-first gate.

## Authenticated Personalisation

Recent, in-progress, and completed activity comes only from the authenticated student's
persisted attempt data. Recommendations are deterministic and require one of these evidence
paths:

- an in-progress attempt; or
- the student's current module plus completed prerequisite evidence.

No recommendation is emitted when the required evidence is absent. Competency labels are
shown only for submitted or graded attempts with an actual competency award.

## Responsive And Accessible Behaviour

Desktop places the visual and operating information in a wide engineering workspace.
Mobile preserves a usable visual before controls and progressively stacks measurements,
tasks, and help. Filters remain labelled; discipline shortcuts scroll horizontally at
narrow widths; controls meet a 44 px minimum target; all actions are keyboard operable.

Status and success never rely on colour alone. Previews provide text alternatives, dynamic
runtime updates have text equivalents, focus remains visible, zoom is not disabled, and the
existing reduced-motion policy remains active.

## Low-Data And Performance

Catalogue cards use inline lightweight SVG previews and descriptive fallback text. Card
links disable speculative route prefetch. The interactive attempt client is imported only
by the attempt route, so catalogue and detail browsing do not preload simulation controls,
scoring UI, or runtime-specific form code.

## First Release Boundary

Hydraulic Cylinder Force is the only available flagship simulation. Thermal System
Boundary is a registered and tested internal candidate, but it remains non-actionable and
labelled `Coming later` plus `Engineering review required` until independent human review
and release records exist. Other planned fluid-power, thermodynamics, and electrical items
remain curriculum-backed collection entries marked `Coming later`. AI search, AI
recommendations, a large simulation library, high-frequency telemetry, thermodynamic
property data, and new simulation-domain equations remain outside this scope.
