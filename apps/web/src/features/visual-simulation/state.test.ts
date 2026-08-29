import { describe, expect, it } from "vitest";

import type {
  EngineeringChallengeContract,
  MeasurementPointDefinition,
  MeasurementReading
} from "./contracts";
import {
  clampGaugeValue,
  createPlaybackState,
  deriveRenderPolicy,
  evaluateChallenge,
  getModeCapability,
  pausePlayback,
  playPlayback,
  resetPlayback,
  scaleFlowLineWeight,
  scaleVectorLength,
  selectLinkedComponent,
  selectMeasurementPoint,
  selectRepresentation,
  setPlaybackSpeed,
  stepPlayback
} from "./state";

describe("visual simulation mode capabilities", () => {
  it("centralizes capabilities for every supported mode", () => {
    expect(getModeCapability("learn")).toMatchObject({
      controlsEnabled: true,
      equationsVisible: true,
      persistence: "required"
    });
    expect(getModeCapability("fault-diagnosis")).toMatchObject({
      faultsEnabled: true,
      hintsVisible: false,
      persistence: "required"
    });
    expect(getModeCapability("assessment").equationsVisible).toBe(false);
    expect(getModeCapability("demonstration")).toMatchObject({
      competencyMayBeAwarded: false,
      persistence: "none"
    });
  });
});

describe("deterministic display playback", () => {
  it("supports play, pause, speed, step, and reset without engineering values", () => {
    const initial = createPlaybackState();
    const playing = playPlayback(initial);
    const fast = setPlaybackSpeed(playing, 2);
    const stepped = stepPlayback(fast, 0.5);
    const paused = pausePlayback(stepped);

    expect(initial).toEqual({
      status: "idle",
      frame: 0,
      displayTimeSeconds: 0,
      speed: 1
    });
    expect(stepped).toMatchObject({ frame: 1, displayTimeSeconds: 1, speed: 2 });
    expect(paused.status).toBe("paused");
    expect(resetPlayback()).toEqual(initial);
  });

  it("uses static states for reduced-motion and low-data preferences", () => {
    expect(deriveRenderPolicy({ reducedMotion: true, lowData: false })).toEqual({
      animate: false,
      particleCount: 0,
      showStaticDirectionArrows: true,
      loadHighDetailAssets: true
    });
    expect(deriveRenderPolicy({ reducedMotion: false, lowData: true })).toEqual({
      animate: false,
      particleCount: 0,
      showStaticDirectionArrows: true,
      loadHighDetailAssets: false
    });
  });
});

describe("engineering visual mappings", () => {
  it("clamps gauge display position while preserving explicit range status", () => {
    expect(clampGaugeValue(-2, 0, 10)).toEqual({
      displayValue: 0,
      rangeStatus: "below",
      clipped: true
    });
    expect(clampGaugeValue(12, 0, 10)).toEqual({
      displayValue: 10,
      rangeStatus: "above",
      clipped: true
    });
    expect(clampGaugeValue(6, 0, 10)).toEqual({
      displayValue: 6,
      rangeStatus: "within",
      clipped: false
    });
  });

  it("scales vectors from a documented bounded domain", () => {
    const scale = { domainMin: 0, domainMax: 100, visualMin: 20, visualMax: 120 };

    expect(scaleVectorLength(0, scale)).toBe(20);
    expect(scaleVectorLength(50, scale)).toBe(70);
    expect(scaleVectorLength(100, scale)).toBe(120);
    expect(scaleVectorLength(1_000, scale)).toBe(120);
    expect(scaleVectorLength(-50, scale)).toBe(70);
  });

  it("bounds flow line weight independently of engineering units", () => {
    expect(scaleFlowLineWeight(-1)).toBe(4);
    expect(scaleFlowLineWeight(0.5)).toBe(8);
    expect(scaleFlowLineWeight(2)).toBe(12);
  });
});

describe("measurement point and linked representation state", () => {
  const points: MeasurementPointDefinition[] = [
    {
      id: "POINT-PRESSURE",
      componentId: "COMPONENT-A",
      label: "Pressure port",
      quantity: "pressure",
      compatibleInstruments: ["pressure-gauge"]
    }
  ];
  const readings: MeasurementReading[] = [
    {
      pointId: "POINT-PRESSURE",
      quantity: "pressure",
      value: 5,
      unit: "MPa",
      validity: "valid"
    }
  ];

  it("selects only compatible instruments and state-supplied readings", () => {
    expect(
      selectMeasurementPoint(points, readings, "POINT-PRESSURE", "pressure-gauge")
    ).toMatchObject({ error: null, reading: { value: 5, unit: "MPa" } });

    const incompatible = selectMeasurementPoint(
      points,
      readings,
      "POINT-PRESSURE",
      "voltmeter"
    );
    expect(incompatible.reading).toBeNull();
    expect(incompatible.error).toContain("not compatible");
  });

  it("keeps X-Ray and linked selections inside declared representations", () => {
    expect(selectRepresentation(["external", "schematic"], "cutaway")).toBe("external");
    expect(selectRepresentation(["external", "schematic"], "schematic")).toBe(
      "schematic"
    );

    const selected = selectLinkedComponent(
      { selectedComponentId: null },
      ["COMPONENT-A", "COMPONENT-B"],
      "COMPONENT-B"
    );
    expect(selected.selectedComponentId).toBe("COMPONENT-B");
    expect(
      selectLinkedComponent(selected, ["COMPONENT-A", "COMPONENT-B"], "UNKNOWN")
    ).toEqual(selected);
  });
});

describe("engineering challenge evaluator", () => {
  const challenge: EngineeringChallengeContract = {
    id: "CH-TEST-001",
    objective: "Meet both supplied limits.",
    startingState: {},
    allowedControls: ["input"],
    conditions: [
      {
        id: "MIN-FORCE",
        stateKey: "force",
        operator: "at-least",
        target: 15_000,
        tolerance: 10,
        unit: "N"
      },
      {
        id: "MAX-PRESSURE",
        stateKey: "pressure",
        operator: "at-most",
        target: 12_000_000,
        unit: "Pa"
      }
    ],
    hints: [],
    explanationAfterCompletion: "Complete."
  };

  it("evaluates supplied simulation values without embedding challenge logic in visuals", () => {
    expect(
      evaluateChallenge(challenge, { force: 15_000, pressure: 10_000_000 }).complete
    ).toBe(true);
    expect(
      evaluateChallenge(challenge, { force: 12_000, pressure: 10_000_000 }).complete
    ).toBe(false);
    expect(evaluateChallenge(challenge, { force: 15_000 }).complete).toBe(false);
  });
});
