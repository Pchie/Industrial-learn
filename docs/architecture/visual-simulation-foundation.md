# Visual Simulation Foundation

## Decision

The visual simulation foundation is an application feature boundary at `apps/web/src/features/visual-simulation/`. A new workspace package was not created because the only current consumer is the Next.js application and the foundation is primarily React rendering and lesson orchestration.

Pure contracts and state utilities are kept separate from React components so they can be tested without a browser and can move to a package later if a second application becomes a real consumer.

## Existing Systems Reused

| Existing boundary            | Reuse                                                                       |
| ---------------------------- | --------------------------------------------------------------------------- |
| `packages/engineering-core`  | Structured calculation-result type consumed by Live Equation                |
| `packages/simulation-engine` | Existing operating modes and future source of domain state and measurements |
| `packages/design-system`     | Buttons, inputs, selects, checkboxes, badges, and alerts                    |
| `packages/content-system`    | Source, review-status, and structured-content validation                    |
| Lesson engine                | Backward-compatible rendering entry point                                   |
| Playwright/Vitest            | Accessibility, browser, component, and pure-state tests                     |

The web workspace now declares the existing internal `engineering-core` package as a direct dependency. This is a type-level contract; no external package was installed and no formula moved into the browser.

## Feature Structure

```text
visual-simulation/
  contracts.ts                    shared state and definition contracts
  state.ts                        pure playback, mapping, selection, and evaluation
  components.tsx                  small reusable visual and learning regions
  visual-simulation.module.css    responsive and reduced-motion presentation
  visual-simulation-lab.tsx       private demonstration orchestrator
  state.test.ts                   pure behavior tests
  components.test.tsx             supplied-state rendering tests
```

The private route is `apps/web/src/app/internal/visual-simulation-lab/page.tsx`. It is noindex, stores no progress, and labels all values as fixed demonstration data rather than reviewed engineering content.

## Composition Boundary

`SimulationShell` composes independently testable regions:

- Header, mode, and status.
- Playback controls.
- Main visual viewport.
- Input/control panel.
- Measurement/instrument panel.
- Live Equation panel.
- Guidance and observation panel.
- Challenge panel.
- Fault panel when the central mode policy allows it.

The shell receives these regions as children. It does not own a simulation runtime, calculation, scoring, persistence, or content source.

## Central Mode Capabilities

| Mode            | Controls          | Hints         | Equations     | Faults           | Competency possible | Persistence      |
| --------------- | ----------------- | ------------- | ------------- | ---------------- | ------------------- | ---------------- |
| Learn           | Yes               | Yes           | Yes           | No               | Yes                 | Required if used |
| Guided          | Yes               | Yes           | Yes           | No               | Yes                 | Required         |
| Explore         | Yes               | Yes           | Yes           | No               | No automatic award  | Optional         |
| Fault diagnosis | Yes               | No by default | No by default | Yes              | Yes                 | Required         |
| Assessment      | Yes               | No            | No            | Yes when defined | Yes                 | Required         |
| Demonstration   | Playback controls | Yes           | Yes           | No               | No                  | None             |

The immutable capability table is the single UI policy source. Assessment services and competency rules remain authoritative for actual awards.

## Low-Data And Reduced Motion

`deriveRenderPolicy` converts preferences into one presentation policy. Reduced motion disables automatic particles and uses static direction arrows or Step. Low-data mode also omits high-detail assets. Both retain supplied engineering state, controls, measurements, and equations.

## Scope Boundary

Prompt 39B does not create a hydraulic lesson, publish content, add a reviewed simulation, invent faults, or change persistence. Prompt 39C may supply a real simulation state adapter and reviewed content to this foundation.
