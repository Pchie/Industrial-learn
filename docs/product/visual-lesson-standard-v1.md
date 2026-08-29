# Industrial Learn Visual Lesson Standard V1

Status: Permanent product standard

Version: 1.0.0

Effective date: 2026-08-27

## Purpose

Suitable engineering lessons begin with a phenomenon, component, system, calculation,
diagnostic situation, or design objective that a student can see and influence. They do
not begin with a long theory sequence and place the visual experience at the bottom.

The default learning order is:

`HOOK -> HERO VISUAL -> EXPLORE -> OBSERVE -> MICRO THEORY -> LIVE EQUATION -> CHALLENGE -> APPLICATION -> CHECK -> DEEP DIVE -> SOURCES`

This is an information hierarchy, not a mandatory slideshow. Authors omit blocks that do
not serve the outcome and follow the category contracts in
`docs/product/visual-lesson-types.md`.

## First-Screen Standard

Within the initial viewport at a representative desktop and mobile size, a suitable
visual lesson must expose:

- Lesson title.
- One-sentence purpose.
- Main visual, or enough of it to identify the engineering system.
- Primary control or start action.

The following must not displace the main visual from the first screen:

- Expanded prerequisite or outcome panels.
- Source records and review detail.
- Detailed theory or derivation.
- Large lesson navigation explanations.

Prerequisites, outcomes, status, and version remain available in compact form. The visual
lesson progression is an orientation aid and must not impose a wizard.

## Learning Depth

### Quick

Quick is the default. It contains the primary visual, meaningful controls, priority
measurements, one concise concept, and a compact relationship or equation when relevant.

### Engineering

Engineering exposes reviewed equations, substitutions, explicit SI units, assumptions,
limitations, and worked interpretation. Values come from engineering-core results, not
duplicated UI calculations.

### Deep Dive

Deep Dive is optional and follows the main learning path. It may contain derivations,
extended explanations, model limitations, additional examples, engineering notes,
prerequisite links, and source detail. It must preserve academic depth without becoming
a prerequisite for the hero interaction.

## Micro-Theory Standard

Default Micro Theory should communicate:

- One concept.
- One concise explanation.
- One supporting visual state.
- One equation where relevant.

The same statement must not be repeated in the hero, observation feedback, Micro Theory,
Engineering, and Deep Dive. Mandatory safety and model-boundary language may be repeated
only when the repetition prevents a credible misunderstanding.

## Learning Outcomes

Learning outcomes remain required. In a visual lesson they appear in a compact disclosure
after the hero experience. Use action-focused language such as explain, calculate,
operate, diagnose, or design. Do not place a large academic outcome panel before the
first interaction.

## Progression Indicator

Visual Standard V1 uses:

`SEE -> EXPLORE -> CALCULATE -> CHALLENGE -> APPLY -> CHECK`

Lessons declare only the steps they actually contain. The indicator must wrap or reflow
on mobile, expose text labels, remain non-interactive unless it becomes genuine
navigation, and never imply that every lesson is a fixed sequence of screens.

## Component Standard

Use the existing design system for:

- A concise simulation title and textual status.
- Quantity-first control labels with units.
- Shared gauge and measurement styles.
- Bounded and labelled vectors.
- Text-plus-token warning and fault states.
- Live Equation and challenge surfaces.
- External, Cutaway, X-Ray, and Schematic controls only where they add learning value.
- Help close to the control or state it explains.

Controls must represent a real model input or meaningful view choice. Do not expose
playback, speed, frame, fault, or measurement-selection controls when the underlying
model does not support those actions.

## Visual State Semantics

All domains use the same semantic states:

| State       | Meaning                                                                      | Required non-colour cue                          |
| ----------- | ---------------------------------------------------------------------------- | ------------------------------------------------ |
| Normal      | Valid expected state                                                         | Normal status text                               |
| Active      | Currently energised, pressurised, moving, or applied as defined by the model | Active text and a directional or activity marker |
| Selected    | Current learner selection                                                    | Selection outline and selected text              |
| Warning     | Approaching or crossing a declared caution boundary                          | Warning icon and text                            |
| Fault       | Evidence-supported fault state                                               | Fault icon and text                              |
| Disabled    | Action is unavailable                                                        | Native disabled state and text where needed      |
| Measurement | Instrument or point supplies the displayed value                             | Instrument marker and measured value             |
| Target      | Challenge objective or reference state                                       | Target marker and target value                   |

The canonical definitions are exported by `@industrial-learn/design-system`. Domain
colours reinforce these meanings but never carry them alone.

## Engineering Unit Standard

Calculations use consistent SI units internally. Display conversions are explicit and
use the engineering-core conversion record.

| Quantity    | Internal examples                | Learner display examples                                             |
| ----------- | -------------------------------- | -------------------------------------------------------------------- |
| Pressure    | Pa                               | Pa, kPa, MPa; bar only when an approved conversion and context exist |
| Flow        | m^3/s                            | m^3/s, L/s, L/min where explicitly converted                         |
| Force       | N                                | N, kN                                                                |
| Power       | W                                | W, kW                                                                |
| Temperature | K where required by the equation | degC or K according to the quantity and equation                     |

The displayed unit is always visible. Educational conversions remain inspectable in
Engineering mode. Dimensionally different units are never treated as interchangeable.

## Simulation Input Contract

Every input declares:

- Stable ID, label, quantity, display unit, and internal unit.
- Default, minimum, maximum, and step.
- Validation behaviour and model-validity range.
- Accessibility label and educational description.

Bounds are educational model limits unless reviewed evidence identifies them as something
else. They must never be presented as component ratings by inference.

## Simulation Output Contract

Every output declares:

- Stable ID, label, quantity, display unit, and internal unit.
- Interpretation and current validity state.
- Warning text where required.
- Simulation, equation, or instrument measurement source.

Prioritise the few outputs that explain the intended cause and effect. Do not surface raw
telemetry merely because the model can produce it.

## Challenge Contract

Reusable patterns are `target`, `constraint`, `diagnosis`, and `design`. Every challenge
declares its goal, allowed actions, success condition, before/success/incomplete feedback,
and model assumptions.

Practice challenges require an intentional Check action. A changing visual may preview
state, but it must not duplicate or prematurely announce checked feedback. Graded
challenges retain server-side scoring, answer protection, authenticated ownership, and
the existing assessment policies.

## Real-World Application

Where suitable, the application answers:

- Where is this used?
- What does the principle control or influence?
- Which real factors are outside the lesson model?
- Which later lesson expands the system?

Keep this connection concise, source-linked, and explicit about simplification. Do not
turn a governing relationship into a professional design or safety claim.

## Theory-First Exceptions

A theory-first or discussion-first lesson may be appropriate for engineering ethics,
professional communication, contract fundamentals, regulatory interpretation,
mathematical proof, historical context, and other outcomes without a meaningful
manipulable state. Such lessons use `lessonType: theory` with the existing linear model.

Do not add decorative simulations merely to satisfy a visual quota. The author must
record why a visual lesson category would not improve the intended outcome.

## Content And Review Rules

- New visual lessons use `experienceModel: visual-v2`, `schemaVersion: 3.0.0`,
  `visualStandardVersion: 1.0.0`, and one of the six visual `lessonType` values.
- Existing linear lessons remain readable without visual metadata.
- Source, equation, simulation, publication, and review gates remain unchanged.
- Deep Dive is optional.
- A first-screen visual ID must resolve to the hero stage.
- Category-required block types must validate.
- Publication status never upgrades review status.

The release checklist in `docs/product/visual-lesson-release-checklist.md` is required
before a visual lesson is proposed for publication.
