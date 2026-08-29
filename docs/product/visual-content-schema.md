# Visual Content Schema

Visual Standard V1 amendment: 2026-08-27

The Visual Standard V1 conventions below supersede the original pilot examples where
they differ. The additive contract is implemented in `lesson.schema.json` and validated
by `@industrial-learn/content-system`.

## Decision

Extend the structured lesson contract through versioned, discriminated visual blocks. Do not replace the existing `sections` object or invalidate current lessons in one migration.

## Version Strategy

Lessons use these presentation fields:

- `schemaVersion`: the content contract version; Visual Standard V1 lessons use `3.0.0`.
- `experienceModel`: `linear-v1` or `visual-v2`.
- `lessonType`: one of the six visual categories for `visual-v2`, or `theory` for a
  non-visual linear lesson.
- `visualStandardVersion`: `1.0.0` for a conforming visual lesson.
- `visualMetadata`: first-screen, progression, input, and output declarations.

Current lessons without these fields are interpreted as `linear-v1`. During migration the validator accepts both models. A normalization adapter maps old sections to the common lesson-stage view model, while native `visual-v2` lessons declare an `experienceSequence`.

No database migration is implied. These are versioned content-file and renderer contracts; persistence changes would require a separate approved architecture task if later needed.

## Visual V2 Lesson Shape

A `visual-v2` lesson retains all current identity, duration, difficulty, prerequisite, learning-outcome, knowledge-file, source, quiz, project, publication, review, and version fields. It adds:

```json
{
  "schemaVersion": "3.0.0",
  "experienceModel": "visual-v2",
  "lessonType": "phenomenon",
  "visualStandardVersion": "1.0.0",
  "visualMetadata": {
    "firstScreen": {
      "purpose": "Change the input and observe the result.",
      "primaryVisualBlockId": "VIS-EXAMPLE-HERO-001",
      "primaryControlIds": ["input-one"]
    },
    "progression": ["see", "play", "calculate", "challenge", "apply", "check"],
    "inputs": [
      {
        "id": "input-one",
        "label": "Input",
        "quantity": "declared quantity",
        "unit": "display unit",
        "internalUnit": "SI unit",
        "default": 1,
        "minimum": 0,
        "maximum": 10,
        "step": 1,
        "validation": "Reject non-finite and out-of-range values.",
        "modelValidityRange": { "minimum": 0, "maximum": 10 },
        "accessibilityLabel": "Input in its displayed unit",
        "educationalDescription": "Changes the declared model input."
      }
    ],
    "outputs": [
      {
        "id": "output-one",
        "label": "Output",
        "quantity": "declared quantity",
        "unit": "display unit",
        "internalUnit": "SI unit",
        "interpretation": "Explains the current model response.",
        "validityState": "valid",
        "measurementSource": "Registered simulation or equation output"
      }
    ]
  },
  "experienceSequence": [
    { "stage": "heroExperience", "title": "See cylinder force", "blocks": [] },
    { "stage": "explore", "title": "Change the inputs", "blocks": [] },
    { "stage": "observe", "title": "What changed?", "blocks": [] }
  ]
}
```

Allowed stages are `heroExperience`, `explore`, `observe`, `microTheory`, `liveEquation`, `engineeringChallenge`, `faultMode`, `realWorldApplication`, `knowledgeCheck`, `deepDive`, and `sources`.

Category contracts determine required blocks. Not every stage is mandatory, Deep Dive is
optional, and source records remain available through the final renderer even when a
separate `sources` stage is omitted. Fault mode is never required when evidence is
insufficient.

## Common Visual Block Fields

Every new block has:

- `type`, stable block `id`, title or accessible label, and optional learning-outcome IDs.
- Source IDs for technical claims and asset-source IDs for imported assets.
- `reviewRequirements` and minimum content/simulation/equation status.
- Quick, Engineering, and Deep Dive content references where applicable.
- `accessibility` with text alternative, state-summary strategy, keyboard path, and reduced-motion fallback.
- `loading` with lazy/eager policy, low-data fallback, and print fallback.
- Optional feature flag and authoring notes that are never rendered to students.

Blocks reference simulations, equations, assets, questions, and components by ID. They do not embed trusted calculations, correct graded answers, or service credentials.

## New Block Contracts

### `heroSimulation`

References simulation ID/version, initial mode, default representation, input/output bindings, and a concise learning prompt. It cannot override simulation limits, fault definitions, or review status.

### `interactiveDiagram`

References an SVG or structured diagram manifest, component IDs, allowed selections/commands, labels, and observation targets. Any state-changing behaviour uses a reviewed feature or simulation command.

### `animation`

References a state timeline or simulation output, playback policy, and explanatory annotations. A scripted conceptual timeline must be labelled as explanatory and reviewed separately from a numerical simulation.

### `observationQuestion`

Declares prompt, response type, related state snapshot, learning outcome, feedback policy, and persistence policy. Ungraded observation answers do not include hidden assessment data.

### `microTheory`

Contains short sourced explanatory blocks and an optional Deep Dive reference. Authoring guidance targets one idea at a time, not a hard word-count publication gate.

### `liveEquation`

References equation ID, symbol-to-input bindings, output binding, unit/precision policy, modes, and invalid-state fallback. The expression and calculation implementation remain outside content/UI.

### `componentCutaway`

References external/internal representation manifests, shared component IDs, annotations, simplifications, orientation, and asset rights.

### `linkedSchematic`

References a schematic manifest, simulation ID/version, physical representation ID, component mapping, selectable measurement points, and symbol-vocabulary version.

### `engineeringChallenge`

Declares an outcome, initial state, permitted controls, target conditions, attempts/hint policy, success event, assessment/practice classification, and server-scoring reference where graded.

### `faultChallenge`

References only fault IDs already declared in the simulation, permitted instruments, diagnostic submission contract, hint policy, scoring reference, and required review record. The renderer omits or safely locks the block if the fault gate fails.

### `realWorldApplication`

Contains an original/licensed asset, source-backed context, concept-to-component links, declared simplifications, and explicit exclusion of operational permission or manufacturer ratings unless reviewed.

### `deepDive`

References structured theory, derivation, assumptions, limitations, prerequisite links, and sources. It can reuse existing paragraph, definition, equation, symbol-table, unit-note, warning, and worked-calculation blocks.

## Compatibility Adapter

The adapter maps old sections without changing their files:

| Linear V1                                                   | Normalized visual stage                              |
| ----------------------------------------------------------- | ---------------------------------------------------- |
| lessonHeader, duration, difficulty, prerequisites, outcomes | Lesson header                                        |
| whyTopicMatters, visualExplanation                          | Hero fallback / micro theory                         |
| keyTerminology, theory                                      | Micro theory / Deep Dive                             |
| equations, workedExamples                                   | Live Equation fallback / Deep Dive                   |
| interactiveActivity                                         | Explore fallback                                     |
| faultFindingExercise                                        | Fault fallback, never treated as reviewed simulation |
| safetyConsiderations                                        | Persistent safety block in applicable stages         |
| knowledgeCheck                                              | Knowledge Check                                      |
| summary, nextRecommendedLesson                              | Completion and next step                             |
| sources                                                     | Sources                                              |

The adapter does not make a static paragraph interactive or upgrade its review status. It only lets one renderer host both generations.

## Validation Rules

1. Block and referenced entity IDs resolve.
2. Source IDs exist; missing technical evidence is reported with block and path.
3. Equation and simulation status meet the block’s declared gate.
4. Published content cannot reference draft-only visual assets or unapproved fault models.
5. Component IDs resolve across cutaway and schematic manifests.
6. Input/output dimensions and instrument compatibility match registered domain definitions.
7. Accessibility, low-data, reduced-motion, and print fallbacks exist for heavy blocks.
8. Graded blocks do not serialize correct answers or private explanations to public lesson content.
9. Review status values remain the existing controlled vocabulary.
10. Legacy lessons continue to validate with deprecation warnings only after an agreed migration window.

## Authoring And Review Output

Validation should produce a visual coverage summary: declared stages, active interactions, reviewed equations/simulations, missing evidence, accessibility fallbacks, and estimated heavy-asset weight. Coverage is an authoring aid, not a score that can substitute for educational or engineering review.
