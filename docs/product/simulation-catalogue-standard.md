# Simulation Catalogue Standard

Status: V1
Date: 2026-08-27
Internal references: IL-SIM-001, IL-CURRICULUM-001, IL-VISUAL-STANDARD-V1,
IL-SIM-LAB-39F

## Registry Boundary

The catalogue registry is the application-facing projection of a simulation. It references
the authoritative `SimulationDefinition` from `@industrial-learn/simulation-engine`; it
does not copy engineering equations, input ranges, output logic, modes, source IDs, or test
cases into page components.

Catalogue metadata lives in `apps/web/src/features/simulations/catalog.ts`. Page routes and
cards consume the typed projection from `lab-types.ts`. Frontend pages must not define
private simulation arrays.

## Required Fields

Each registry entry declares:

- stable slug and simulation ID;
- title and engine definition;
- main concept, topic, components, systems, and common abbreviations;
- discipline, difficulty, and one or more simulation types;
- estimated activity time and recommended mode;
- module, lesson, pathway, and prerequisite relationships;
- prerequisite policy: required or recommended;
- technical review status and publication status;
- operational availability;
- available challenge and fault-mode evidence state;
- lightweight preview kind, alternative text, and low-data description;
- concise operable variables and learning outcomes.

IDs remain the cross-layer contract. Slugs are stable public navigation identifiers.

## Controlled Vocabularies

Disciplines are Mechanical, Fluid Systems, Thermodynamics, Electrical, Automation, Energy,
and Future Engineering. The typed list may be extended without changing the catalogue
component contract.

Simulation types are Component, System, Calculation, Schematic, Fault Diagnosis, and
Design. Difficulty is Beginner, Intermediate, or Advanced. Modes remain the values declared
by the simulation engine: Learn, Guided, Explore, Fault diagnosis, and Assessment.

## Availability And Review

Availability is one of `available`, `coming-later`, or `locked-by-prerequisite`. Review and
availability are independent. An operable internal pilot can therefore be `Available` and
`Engineering review required` at the same time without implying approval for professional
use.

`Coming later` is permitted only when the ID and title resolve from curriculum data. An
unimplemented planned item has no detail link. A registered but review-gated candidate may
have a read-only detail route and preview, but it has no start, resume, mode, recommendation,
or competency action. A required prerequisite is evaluated against authenticated
lesson-progress evidence. A recommended prerequisite does not lock access.

The server rejects start requests for any simulation whose resolved availability is not
`available`; client presentation is not the security boundary.

## Collections

Collections are curated curriculum sequences, not an alternative source of simulation
metadata. Each collection stores simulation IDs. Resolution follows this order:

1. Registry entry, preserving its declared operational availability.
2. Existing Core or Future curriculum simulation record, displayed as `Coming later`.
3. Validation error when neither source recognises the ID.

This prevents attractive placeholder cards from becoming false product claims.

## Preview Standard

Card previews must be meaningful, lightweight, and accessible. V1 supports a hydraulic
cylinder SVG, a thermodynamic boundary SVG, and a typed schematic fallback. Every preview
supplies alternative text and a low-data description. Preview metadata must not contain
calculated values that could drift from runtime state.

Large media, WebGL, and simulation-engine code must not be imported by catalogue cards.

## Adding A Simulation

Before an entry becomes available:

1. Register and test its authoritative engine definition.
2. Resolve its lesson, module, prerequisite, pathway, source, and review records.
3. Add the complete catalogue metadata record.
4. Provide an accessible lightweight preview.
5. Add it to a collection only when the curriculum contains its ID.
6. Test search terms, filters, unavailable states, detail routing, modes, and lazy loading.
7. Preserve the honest review state; do not promote it without a review record.

A technically implemented candidate may complete steps 1-6 behind `coming-later` while
step 7 remains open. Unlocking it requires the review records and a separate release change;
implementation completion alone is not publication evidence.
