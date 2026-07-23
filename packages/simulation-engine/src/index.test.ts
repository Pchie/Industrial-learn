import { describe, expect, it } from "vitest";

import {
  getSimulation,
  hydraulicCylinderForceSimulation,
  hydraulicCylinderForceSimulationDefinition,
  sharedVirtualInstruments,
  simulationRegistry,
  validateSimulationTraceability
} from "./index";

function forceValue(
  state: ReturnType<typeof hydraulicCylinderForceSimulation.createInitialState>
) {
  return state.outputs.cylinderForce;
}

describe("simulation engine registry and shared capabilities", () => {
  it("registers the hydraulic cylinder force simulation", () => {
    expect(simulationRegistry.has("SIM-HYD-CYL-FORCE-001")).toBe(true);
    expect(getSimulation("SIM-HYD-CYL-FORCE-001")).toBe(hydraulicCylinderForceSimulation);
  });

  it("declares all required operating modes and shared virtual instruments", () => {
    expect(hydraulicCylinderForceSimulationDefinition.modes).toEqual([
      "learn",
      "guided",
      "explore",
      "fault-diagnosis",
      "assessment"
    ]);
    expect(sharedVirtualInstruments.map((instrument) => instrument.type)).toEqual([
      "pressure-gauge",
      "flow-meter",
      "thermometer",
      "voltmeter",
      "ammeter",
      "digital-status-display"
    ]);
  });

  it("declares source-gated simulation traceability without approving it", () => {
    const result = validateSimulationTraceability(
      hydraulicCylinderForceSimulationDefinition
    );

    expect(result.errors).toEqual([]);
    expect(hydraulicCylinderForceSimulationDefinition.sourceIds).toEqual([
      "SRC-HYDRAULIC-CYLINDER-PLACEHOLDER-001"
    ]);
    expect(hydraulicCylinderForceSimulationDefinition.equations[0]).toMatchObject({
      equationId: "EQ-FLUID-FORCE-PRESSURE-AREA-001",
      reviewStatus: "Source required",
      sourceIds: ["SRC-HYDRAULIC-CYLINDER-PLACEHOLDER-001"]
    });
    expect(hydraulicCylinderForceSimulationDefinition.safetyLimitations).toContain(
      "Simulation ranges are training boundaries, not equipment ratings."
    );
  });

  it("blocks approved simulations when equations remain unreviewed", () => {
    const result = validateSimulationTraceability({
      ...hydraulicCylinderForceSimulationDefinition,
      reviewStatus: "Approved for student use"
    });

    expect(result.errors).toContainEqual(expect.stringContaining("cannot be approved"));
  });
});

describe("hydraulic cylinder force simulation", () => {
  it("creates a valid initial state with default SI inputs and measurements", () => {
    const state = hydraulicCylinderForceSimulation.createInitialState();

    expect(state.status).toBe("idle");
    expect(state.mode).toBe("learn");
    expect(state.inputs).toMatchObject({ pressure: 1_000_000, pistonArea: 0.01 });
    expect(state.validity.status).toBe("valid");
    expect(forceValue(state)).toBe(10_000);
    expect(
      state.liveMeasurements.some(
        (measurement) => measurement.instrumentType === "pressure-gauge"
      )
    ).toBe(true);
    expect(state.eventHistory[0]?.type).toBe("created");
  });

  it("starts the simulation and records the transition", () => {
    const state = hydraulicCylinderForceSimulation.start(
      hydraulicCylinderForceSimulation.createInitialState("guided")
    );

    expect(state.status).toBe("running");
    expect(state.mode).toBe("guided");
    expect(state.eventHistory.some((event) => event.type === "started")).toBe(true);
  });

  it("advances time in normal operation using simulation speed", () => {
    const running = hydraulicCylinderForceSimulation.start(
      hydraulicCylinderForceSimulation.createInitialState()
    );
    const faster = hydraulicCylinderForceSimulation.changeSpeed(running, 2);
    const stepped = hydraulicCylinderForceSimulation.step(faster, 3);

    expect(stepped.elapsedTimeSeconds).toBe(6);
    expect(stepped.status).toBe("running");
    expect(forceValue(stepped)).toBe(10_000);
    expect(stepped.eventHistory.some((event) => event.type === "stepped")).toBe(true);
  });

  it("calculates force from updated pressure and piston area", () => {
    const state = hydraulicCylinderForceSimulation.start(
      hydraulicCylinderForceSimulation.updateInput(
        hydraulicCylinderForceSimulation.updateInput(
          hydraulicCylinderForceSimulation.createInitialState(),
          "pressure",
          2_000_000
        ),
        "pistonArea",
        0.02
      )
    );

    expect(forceValue(state)).toBe(40_000);
    expect(state.calculationExplanation).toContain("F = 2000000 * 0.02");
    expect(state.resultsInterpretation).toContain("pressure-area calculation");
  });

  it("accepts input boundaries that are physically valid for the simulation", () => {
    const zeroPressure = hydraulicCylinderForceSimulation.updateInput(
      hydraulicCylinderForceSimulation.createInitialState(),
      "pressure",
      0
    );
    const maximumPressure = hydraulicCylinderForceSimulation.updateInput(
      zeroPressure,
      "pressure",
      20_000_000
    );
    const minimumArea = hydraulicCylinderForceSimulation.updateInput(
      maximumPressure,
      "pistonArea",
      0.0001
    );

    expect(zeroPressure.validity.status).toBe("valid");
    expect(forceValue(zeroPressure)).toBe(0);
    expect(minimumArea.validity.status).toBe("valid");
    expect(forceValue(minimumArea)).toBe(2_000);
  });

  it("rejects invalid input values without producing measurements", () => {
    const negativePressure = hydraulicCylinderForceSimulation.updateInput(
      hydraulicCylinderForceSimulation.createInitialState(),
      "pressure",
      -1
    );
    const zeroArea = hydraulicCylinderForceSimulation.updateInput(
      hydraulicCylinderForceSimulation.createInitialState(),
      "pistonArea",
      0
    );
    const notFinite = hydraulicCylinderForceSimulation.updateInput(
      hydraulicCylinderForceSimulation.createInitialState(),
      "pressure",
      Number.NaN
    );

    expect(negativePressure.validity.status).toBe("invalid");
    expect(negativePressure.outputs).toEqual({});
    expect(zeroArea.validity.errors[0]).toContain("pistonArea must be between");
    expect(notFinite.validity.errors[0]).toContain("pressure must be a finite number");
  });

  it("does not start with invalid inputs", () => {
    const invalid = hydraulicCylinderForceSimulation.updateInput(
      hydraulicCylinderForceSimulation.createInitialState(),
      "pistonArea",
      0
    );
    const started = hydraulicCylinderForceSimulation.start(invalid);

    expect(started.status).toBe("idle");
    expect(started.validity.status).toBe("invalid");
    expect(
      started.eventHistory.some((event) => event.message.includes("cannot start"))
    ).toBe(true);
  });

  it("resets state, inputs, faults, score, alarms, and time", () => {
    const changed = hydraulicCylinderForceSimulation.scoreAssessment(
      hydraulicCylinderForceSimulation.injectFault(
        hydraulicCylinderForceSimulation.step(
          hydraulicCylinderForceSimulation.start(
            hydraulicCylinderForceSimulation.updateInput(
              hydraulicCylinderForceSimulation.createInitialState("assessment"),
              "pressure",
              2_000_000
            )
          ),
          4
        ),
        "pressure-loss"
      ),
      12_000
    );
    const reset = hydraulicCylinderForceSimulation.reset(changed);

    expect(reset.mode).toBe("assessment");
    expect(reset.status).toBe("idle");
    expect(reset.elapsedTimeSeconds).toBe(0);
    expect(reset.inputs.pressure).toBe(1_000_000);
    expect(reset.activeFaultIds).toEqual([]);
    expect(reset.alarms).toEqual([]);
    expect(reset.assessmentScore).toBeNull();
    expect(reset.eventHistory.some((event) => event.type === "reset")).toBe(true);
  });

  it("injects pressure loss fault and reduces calculated force", () => {
    const faulted = hydraulicCylinderForceSimulation.injectFault(
      hydraulicCylinderForceSimulation.start(
        hydraulicCylinderForceSimulation.createInitialState("fault-diagnosis")
      ),
      "pressure-loss"
    );

    expect(faulted.status).toBe("faulted");
    expect(forceValue(faulted)).toBe(6_000);
    expect(faulted.alarms).toContain(
      "Pressure loss fault active: calculated force is reduced."
    );
    expect(
      faulted.diagnosticMeasurements.find(
        (measurement) => measurement.id === "effectivePressure"
      )?.value
    ).toBe(600_000);
  });

  it("injects gauge stuck fault and exposes diagnostic pressure disagreement", () => {
    const changedPressure = hydraulicCylinderForceSimulation.updateInput(
      hydraulicCylinderForceSimulation.start(
        hydraulicCylinderForceSimulation.createInitialState("fault-diagnosis")
      ),
      "pressure",
      2_000_000
    );
    const faulted = hydraulicCylinderForceSimulation.injectFault(
      changedPressure,
      "gauge-stuck"
    );
    const displayedPressure = faulted.liveMeasurements.find(
      (measurement) => measurement.id === "pressure"
    );
    const diagnosticPressure = faulted.diagnosticMeasurements.find(
      (measurement) => measurement.id === "diagnosticPressure"
    );

    expect(displayedPressure?.value).toBe(1_000_000);
    expect(diagnosticPressure?.value).toBe(2_000_000);
    expect(faulted.alarms).toContain(
      "Pressure gauge fault active: compare gauge and diagnostic pressure."
    );
  });

  it("injects seal leak fault and reduces force after calculation", () => {
    const faulted = hydraulicCylinderForceSimulation.injectFault(
      hydraulicCylinderForceSimulation.start(
        hydraulicCylinderForceSimulation.createInitialState("fault-diagnosis")
      ),
      "seal-leak"
    );

    expect(forceValue(faulted)).toBe(7_500);
    expect(faulted.calculationExplanation).toContain(
      "Seal leak fault multiplies calculated force by 0.75."
    );
    expect(faulted.alarms).toContain(
      "Seal leak fault active: force is below the pressure-area prediction."
    );
  });

  it("rejects unknown fault modes and invalid speed values", () => {
    const state = hydraulicCylinderForceSimulation.createInitialState();

    expect(
      hydraulicCylinderForceSimulation.injectFault(state, "unsupported-fault").validity
        .status
    ).toBe("invalid");
    expect(hydraulicCylinderForceSimulation.changeSpeed(state, 0).validity.status).toBe(
      "invalid"
    );
  });

  it("scores assessment answers against current calculation results", () => {
    const state = hydraulicCylinderForceSimulation.start(
      hydraulicCylinderForceSimulation.createInitialState("assessment")
    );

    expect(
      hydraulicCylinderForceSimulation.scoreAssessment(state, 10_100).assessmentScore
    ).toBe(1);
    expect(
      hydraulicCylinderForceSimulation.scoreAssessment(state, 11_000).assessmentScore
    ).toBe(0);
  });
});
