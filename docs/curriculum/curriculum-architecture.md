# Industrial Learn Curriculum Architecture

## Purpose

This document defines the curriculum architecture for Industrial Learn. It does not contain complete lesson content. It defines the hierarchy, metadata model, review controls, prerequisite graph, and cross-school connections needed to support Core Engineering and Future Engineering.

## Source IDs

- IL-AGENTS-001: `AGENTS.md`
- IL-PRD-001: `docs/product/product-requirements.md`
- IL-MVP-001: `docs/product/mvp-scope.md`
- IL-JOURNEY-001: `docs/product/user-journeys.md`
- IL-ARCH-001: `docs/architecture/system-architecture.md`

## Curriculum Hierarchy

Industrial Learn curriculum follows this hierarchy:

```text
School
-> Discipline
-> Programme
-> Academic year
-> Semester
-> Module
-> Unit
-> Lesson
-> Simulation
-> Assessment
-> Project
```

The hierarchy supports two connected schools:

- Core Engineering
- Future Engineering

Core Engineering contains foundational engineering disciplines, calculations, simulations, assessments, and projects. Future Engineering extends those foundations into emerging technologies, intelligent systems, sustainability, automation, and advanced professional practice. Source: IL-PRD-001.

## Curriculum File Layout

Curriculum structure is stored in:

- `content/curriculum/core-engineering.json`
- `content/curriculum/future-engineering.json`
- `content/curriculum/prerequisite-graph.json`
- `content/curriculum/career-pathways.json`

These files define metadata and relationships only. They are not page implementations, UI code, or database migrations.

## Required Module Metadata

Every module must support:

- Unique ID
- Slug
- Title
- Description
- Difficulty
- Academic level
- Estimated duration
- Prerequisites
- Learning outcomes
- Knowledge file IDs
- Source IDs
- Simulation IDs
- Assessment IDs
- Project IDs
- Technical review status
- Publication status
- Version

## Required Lesson Metadata

Every lesson must support:

- Unique ID
- Slug
- Title
- Description
- Difficulty
- Academic level
- Estimated duration
- Prerequisites
- Learning outcomes
- Knowledge file IDs
- Source IDs
- Simulation IDs
- Assessment IDs
- Project IDs
- Technical review status
- Publication status
- Version

## Metadata Field Definitions

| Field                   | Purpose                                                                                                                                |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                    | Stable unique identifier for references, prerequisites, analytics, and review records.                                                 |
| `slug`                  | Human-readable route or content identifier.                                                                                            |
| `title`                 | Display title.                                                                                                                         |
| `description`           | Short scope description, not complete lesson content.                                                                                  |
| `difficulty`            | Suggested difficulty such as introductory, developing, intermediate, advanced, or professional.                                        |
| `academicLevel`         | Intended learning stage such as first-year undergraduate, second-year undergraduate, final-year undergraduate, or junior professional. |
| `estimatedDuration`     | Expected learner time for the module or lesson.                                                                                        |
| `prerequisites`         | Required prior module, lesson, or concept IDs.                                                                                         |
| `learningOutcomes`      | Outcomes the learner should be able to demonstrate.                                                                                    |
| `knowledgeFileIds`      | IDs for structured knowledge files used by this item.                                                                                  |
| `sourceIds`             | Approved or required source reference IDs.                                                                                             |
| `simulationIds`         | Referenced simulation IDs.                                                                                                             |
| `assessmentIds`         | Referenced assessment IDs.                                                                                                             |
| `projectIds`            | Referenced project IDs.                                                                                                                |
| `technicalReviewStatus` | Engineering review state using the approved content status vocabulary.                                                                 |
| `publicationStatus`     | Publication state such as draft, internal, scheduled, or published.                                                                    |
| `version`               | Content version.                                                                                                                       |

## Review And Publication Rules

- Draft curriculum may reference planned knowledge files, simulations, assessments, and projects.
- Technical claims require approved source IDs before being marked source checked.
- Content cannot be marked Approved for student use unless a review record exists.
- Engineering formulas must live in the engineering calculation library, not in lesson or UI content.
- Simulations must have normal-state, boundary-state, and fault-state test coverage before being marked simulation checked.

Source: IL-AGENTS-001.

## Cross-School Prerequisite Model

Future Engineering modules depend on Core Engineering foundations. The prerequisite graph stores typed edges so the platform can recommend learning paths and block or warn on advanced activities.

Required cross-school examples:

- Thermodynamics before AI HVAC optimisation.
- Electrical circuits before industrial IoT.
- Programming before machine learning.
- Control systems before robotics.
- Fluid mechanics before smart pump monitoring.
- Strength of materials before generative mechanical design.

## Difficulty Progression

Suggested progression:

- Introductory: first exposure and vocabulary.
- Developing: guided calculations and basic diagnosis.
- Intermediate: multi-step reasoning, simulation use, and design trade-offs.
- Advanced: open-ended design, system integration, and fault diagnosis.
- Professional: junior practice judgement, assumptions, limitations, and communication.

## Academic Progression

The curriculum supports learning from first semester through junior professional practice:

- Academic year 1: foundations, mathematics-linked reasoning, introductory systems.
- Academic year 2: applied systems, calculations, diagnostics, and laboratory-style simulation.
- Academic year 3: design, integration, projects, and professional reasoning.
- Junior professional: revision, decision-making, risk awareness, and future technologies.

## Curriculum Boundaries

The curriculum metadata files own:

- Hierarchy.
- Identifiers.
- Prerequisites.
- References to knowledge files, sources, simulations, assessments, and projects.
- Review and publication status.

The curriculum metadata files do not own:

- Full lesson prose.
- Engineering formulas.
- UI components.
- Database schema.
- Assessment engine code.
- Simulation runtime code.
- AI mentor prompts.
