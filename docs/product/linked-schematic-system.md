# Linked Schematic System

## Purpose

Linked Schematic connects physical equipment, internal cutaways, and engineering schematics through one component identity and one simulation state. It lets a student move between what a system looks like, what is happening inside it, and how engineers represent it.

## Representation Model

Applicable simulations expose a segmented view control:

- **External**: housing, ports, controls, connections, and observable motion.
- **Internal**: reviewed cutaway geometry, working parts, flow or energy paths, and measurement points.
- **Schematic**: engineering symbols, connections, states, and instruments.

The views are alternate renderers, not separate simulations. Switching views preserves inputs, time, selected component, active fault, measurements, and challenge state.

## Identity Contract

Every linkable item has a stable `componentId` shared across the simulation definition and representation manifests. A representation maps that ID to one or more visual elements and supplies:

- Display name and component type.
- Representation-specific asset or geometry reference.
- Selectable and operable state.
- Related control command IDs.
- Measurement-point IDs.
- Label, description, source IDs, and review status.
- Accessible state phrase and keyboard focus target.

Visual element IDs are renderer details and cannot replace the domain `componentId`.

## Interaction Flow

```text
select or operate a component in any view
        |
        v
feature orchestrator resolves componentId / commandId
        |
        v
simulation runtime validates and updates state once
        |
        v
VisualState adapter derives selection and engineering state
        |
        +---- external view
        +---- internal view
        +---- schematic view
        +---- controls and instruments
        +---- accessible summary
```

Selecting a physical relief valve can highlight the same component in the schematic. Operating it sends one runtime command; every view then reflects the returned state. A renderer must not directly mutate another renderer.

## Highlight And State Conventions

Selection uses focus outline, shape emphasis, label, and optional brand accent. Engineering states use the conventions in `engineering-animation-guidelines.md`: paths, arrows, geometry, patterns, symbols, labels, and readings rather than colour alone.

When a view omits a physical item because of scale or abstraction, a linked list or breadcrumb still exposes the component and explains the abstraction.

## Schematic Vocabulary

Symbols require an approved project vocabulary with source/licensing records and semantic names. The initial implementation must not claim compliance with a specific standard until that standard and its usage rights have been reviewed. Component symbols, line types, connection semantics, and state overlays are versioned independently from lesson prose.

## X-Ray And Cutaway Integrity

- Cutaways show only geometry needed for the learning outcome.
- Omitted or simplified parts are disclosed.
- Movement and fluid/electrical/thermal paths come from simulation state.
- Cross-sections and exploded views include orientation and a legend.
- External-to-internal transitions are optional; reduced-motion mode switches instantly.
- Imported manufacturer drawings are not used without permission and provenance.

## Measurement Points

Measurement points are domain declarations attached to components or connections. Students select a compatible virtual instrument, then a point. The runtime returns the reading. The renderer may show a probe location but cannot calculate from screen coordinates.

Invalid instrument/point combinations produce a specific explanation. Assessment mode records relevant selections without persisting continuous pointer movement.

## Accessibility

- View controls use semantic tabs or a segmented radio group with keyboard support.
- Components are reachable through a synchronized component list, not only by clicking a drawing.
- Selection, state, connections, upstream/downstream relationships, and available operations have text equivalents.
- A linear schematic summary describes the active path and measurements.
- Zoom and pan have buttons and keyboard controls; essential content remains available at 200% zoom.
- Reduced motion preserves all state changes through snapshots and summaries.

## Performance

Load the default representation first and fetch alternate assets on intent or idle time. Reuse one state store and one component manifest. Prefer SVG symbol reuse for schematics; lazy-load high-detail cutaways. Low-data mode defaults to schematic or simplified SVG plus text summary.

## Validation And Tests

- Every representation reference resolves to a known component ID.
- One command yields equivalent state in every view.
- Selection synchronizes in both directions.
- Measurement-point compatibility is enforced by the runtime.
- Missing representations have explicit fallbacks.
- Keyboard, screen-reader, reduced-motion, mobile, and zoom paths work independently of pointer hit areas.
- Technical reviewers compare symbols, paths, labels, and cutaways to approved evidence.
