import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  DigitalMeasurement,
  EngineeringChallenge,
  EngineeringVector,
  FlowPath,
  Gauge,
  LinkedComponentView,
  LiveEquation,
  MeasurementPointSelector,
  MicroTheory,
  ObservationPrompt,
  RepresentationSwitcher,
  SimulationPlaybackControls
} from "./components";
import type {
  InstrumentConfiguration,
  LiveEquationModel,
  MeasurementPointDefinition,
  PlaybackState
} from "./contracts";

describe("visual simulation components", () => {
  it("renders LiveEquation from the supplied result without recalculating it", () => {
    const model = equationModel(777);
    const markup = renderToStaticMarkup(createElement(LiveEquation, { model }));

    expect(markup).toContain("F = p × A");
    expect(markup).toContain("777 N");
    expect(markup).toContain("100 Pa");
    expect(markup).toContain("2 m^2");
    expect(markup).not.toContain("200 N");
    expect(markup).toContain("Result supplied by");
    expect(markup).toContain("Calculation steps");
    expect(markup).toContain("Supplied result.");
  });

  it("updates LiveEquation output when a new supplied result is rendered", () => {
    const first = renderToStaticMarkup(
      createElement(LiveEquation, { model: equationModel(500) })
    );
    const second = renderToStaticMarkup(
      createElement(LiveEquation, { model: equationModel(900) })
    );

    expect(first).toContain("500 N");
    expect(second).toContain("900 N");
  });

  it("renders an accessible clamped gauge and explicit overflow message", () => {
    const configuration: InstrumentConfiguration = {
      id: "GAUGE-TEST",
      type: "pressure-gauge",
      label: "Test pressure",
      quantity: "pressure",
      unit: "MPa",
      min: 0,
      max: 10,
      precision: 1
    };
    const markup = renderToStaticMarkup(
      createElement(Gauge, { configuration, value: 12 })
    );

    expect(markup).toContain('role="img"');
    expect(markup).toContain("Test pressure: 12.0 MPa");
    expect(markup).toContain("outside the display range");
  });

  it("keeps measurement status inside the definition value", () => {
    const configuration: InstrumentConfiguration = {
      id: "DIGITAL-TEST",
      type: "digital-pressure",
      label: "Test pressure",
      quantity: "pressure",
      unit: "Pa",
      min: 0,
      max: 100,
      precision: 0
    };
    const markup = renderToStaticMarkup(
      createElement(DigitalMeasurement, {
        configuration,
        reading: {
          pointId: "POINT-A",
          quantity: "pressure",
          value: 50,
          unit: "Pa",
          validity: "valid",
          status: "Validated reading"
        }
      })
    );

    expect(markup).toContain("Validated reading</span></dd>");
    expect(markup).not.toContain("</dd><p>");
  });

  it("uses static flow direction for reduced-motion and low-data rendering", () => {
    const markup = renderToStaticMarkup(
      createElement(FlowPath, {
        policy: {
          animate: false,
          particleCount: 0,
          showStaticDirectionArrows: true,
          loadHighDetailAssets: false
        },
        state: {
          direction: "forward",
          magnitudeNormalized: 0.5,
          restricted: true,
          label: "Restricted flow"
        }
      })
    );

    expect(markup).toContain("Flow →");
    expect(markup).toContain("The path is restricted");
    expect(markup).not.toContain("animateMotion");
  });

  it("renders vector value, direction, and normalized SVG length", () => {
    const markup = renderToStaticMarkup(
      createElement(EngineeringVector, {
        angleDegrees: 90,
        kind: "force",
        label: "Applied force",
        scale: { domainMin: 0, domainMax: 100, visualMin: 20, visualMax: 120 },
        unit: "N",
        value: 50
      })
    );

    expect(markup).toContain("Applied force: 50 N, direction 90 degrees");
    expect(markup).toContain('x2="158"');
  });

  it("renders labelled playback, measurement, and representation controls", () => {
    const playback: PlaybackState = {
      status: "paused",
      frame: 2,
      displayTimeSeconds: 2,
      speed: 1
    };
    const points: MeasurementPointDefinition[] = [
      {
        id: "POINT-A",
        componentId: "COMPONENT-A",
        label: "Pressure port",
        quantity: "pressure",
        compatibleInstruments: ["pressure-gauge"]
      }
    ];
    const playbackMarkup = renderToStaticMarkup(
      createElement(SimulationPlaybackControls, {
        onPause() {},
        onPlay() {},
        onReset() {},
        onSpeedChange() {},
        onStep() {},
        playback
      })
    );
    const pointMarkup = renderToStaticMarkup(
      createElement(MeasurementPointSelector, {
        instrumentType: "pressure-gauge",
        onSelect() {},
        points,
        selectedPointId: "POINT-A"
      })
    );
    const representationMarkup = renderToStaticMarkup(
      createElement(RepresentationSwitcher, {
        activeMode: "external",
        onChange() {},
        representations: [
          { mode: "external", label: "External", description: "External view" },
          { mode: "schematic", label: "Schematic", description: "Schematic view" }
        ]
      })
    );

    expect(playbackMarkup).toContain('aria-label="Simulation playback controls"');
    expect(playbackMarkup).toContain("Play");
    expect(playbackMarkup).toContain("Pause");
    expect(playbackMarkup).toContain("Step");
    expect(pointMarkup).toContain("Pressure port");
    expect(representationMarkup).toContain("Equipment view");
  });

  it("links selected physical and schematic component IDs", () => {
    const components = [
      {
        componentId: "COMPONENT-A",
        label: "Valve",
        representations: {
          external: "Physical valve",
          schematic: "Valve symbol"
        }
      }
    ];
    const physical = renderToStaticMarkup(
      createElement(LinkedComponentView, {
        components,
        mode: "external",
        onSelect() {},
        selectedComponentId: "COMPONENT-A"
      })
    );
    const schematic = renderToStaticMarkup(
      createElement(LinkedComponentView, {
        components,
        mode: "schematic",
        onSelect() {},
        selectedComponentId: "COMPONENT-A"
      })
    );

    expect(physical).toContain('aria-pressed="true"');
    expect(physical).toContain("Physical valve");
    expect(schematic).toContain('aria-pressed="true"');
    expect(schematic).toContain("Valve symbol");
    expect(schematic).toContain("COMPONENT-A");
  });

  it("keeps observation and expanded theory lightweight and non-graded", () => {
    const observation = renderToStaticMarkup(
      createElement(ObservationPrompt, {
        explanation: "Supplied state changed.",
        hint: "Compare the labels.",
        prompt: "What changed?"
      })
    );
    const theory = renderToStaticMarkup(
      createElement(MicroTheory, {
        deeperTheory: createElement("p", null, "Expanded theory."),
        principle: "One state drives every view.",
        title: "State synchronization"
      })
    );

    expect(observation).toContain("not graded");
    expect(observation).toContain("Show hint");
    expect(theory).toContain("Explain more");
    expect(theory).toContain("Expanded theory");
  });

  it("keeps challenge results hidden until an explicit check", () => {
    const challenge = {
      id: "CH-TEST-001",
      objective: "Reach the target",
      startingState: {},
      allowedControls: ["input"],
      conditions: [
        {
          id: "target",
          stateKey: "forceN",
          operator: "at-least" as const,
          target: 20_000,
          displayTarget: 20,
          displayUnit: "kN",
          unit: "N"
        }
      ],
      hints: [],
      explanationBeforeCompletion: "Adjust the input, then check.",
      explanationAfterCompletion: "Target met."
    };
    const evaluation = {
      complete: false,
      conditions: [{ conditionId: "target", met: false, actualValue: 10_000 }]
    };
    const beforeCheck = renderToStaticMarkup(
      createElement(EngineeringChallenge, {
        challenge,
        evaluation,
        showResult: false
      })
    );
    const afterCheck = renderToStaticMarkup(
      createElement(EngineeringChallenge, {
        challenge,
        evaluation,
        showResult: true
      })
    );

    expect(beforeCheck).toContain("Target:</strong> at-least 20 kN");
    expect(beforeCheck).toContain("Ready to check");
    expect(beforeCheck).not.toContain("Not yet");
    expect(afterCheck).toContain("Not yet");
  });
});

function equationModel(value: number): LiveEquationModel<"N"> {
  return {
    name: "Supplied force",
    expression: "F = p × A",
    symbols: [
      { symbol: "F", name: "force", unit: "N" },
      { symbol: "p", name: "pressure", unit: "Pa" },
      { symbol: "A", name: "area", unit: "m^2" }
    ],
    result: {
      calculatedValue: value,
      unit: "N",
      inputValues: {
        p: { value: 100, unit: "Pa" },
        A: { value: 2, unit: "m^2" }
      },
      equationId: "EQ-SUPPLIED-TEST",
      calculationSteps: ["Supplied result."],
      assumptions: ["Test fixture."],
      warnings: [],
      validity: { status: "valid", errors: [] }
    }
  };
}
