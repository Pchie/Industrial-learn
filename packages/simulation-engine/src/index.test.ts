import { describe, expect, it } from "vitest";

import {
  bernoulliFlowSimulation,
  bernoulliFlowSimulationDefinition,
  classifyThermodynamicSystemBoundary,
  getSimulation,
  hydraulicCylinderForceSimulation,
  hydraulicCylinderForceSimulationDefinition,
  sharedVirtualInstruments,
  simulationRegistry,
  thermodynamicSystemBoundarySimulation,
  thermodynamicSystemBoundarySimulationDefinition,
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

  it("registers the review-gated thermodynamic boundary simulation", () => {
    expect(simulationRegistry.has("sim-core-thermal-system-001")).toBe(true);
    expect(getSimulation("sim-core-thermal-system-001")).toBe(
      thermodynamicSystemBoundarySimulation
    );
    expect(thermodynamicSystemBoundarySimulationDefinition.reviewStatus).toBe(
      "Engineering review required"
    );
    expect(thermodynamicSystemBoundarySimulationDefinition.equations).toEqual([]);
    expect(thermodynamicSystemBoundarySimulationDefinition.sourceIds).toEqual([
      "SRC-PURDUE-ME200-THERMO-DEFINITIONS-2021",
      "SRC-OPENSTAX-COLLEGE-PHYSICS-2012"
    ]);
    expect(
      validateSimulationTraceability(thermodynamicSystemBoundarySimulationDefinition)
        .errors
    ).toEqual([]);
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

  it("declares equation-checked simulation traceability without approving it", () => {
    const result = validateSimulationTraceability(
      hydraulicCylinderForceSimulationDefinition
    );

    expect(result.errors).toEqual([]);
    expect(hydraulicCylinderForceSimulationDefinition.sourceIds).toEqual([
      "SRC-PARKER-140H8-CYLINDER-2024"
    ]);
    expect(hydraulicCylinderForceSimulationDefinition.equations[0]).toMatchObject({
      equationId: "EQ-FLUID-FORCE-PRESSURE-AREA-001",
      reviewStatus: "Equation checked",
      sourceIds: ["SRC-PARKER-140H8-CYLINDER-2024"]
    });
    expect(hydraulicCylinderForceSimulationDefinition.reviewStatus).toBe(
      "Equation checked"
    );
    expect(hydraulicCylinderForceSimulationDefinition.safetyLimitations).toContain(
      "Simulation ranges are training boundaries, not equipment ratings."
    );
    expect(hydraulicCylinderForceSimulationDefinition.validityAssumptions).toContain(
      "Fault reductions are training behaviours and are not manufacturer diagnostic data."
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

describe("thermodynamic system boundary classification", () => {
  it("classifies open, closed, and isolated systems from declared crossings", () => {
    expect(
      classifyThermodynamicSystemBoundary({
        massCrossing: 1,
        energyCrossing: 1,
        boundaryConsistent: true
      }).calculatedValue
    ).toBe(1);
    expect(
      classifyThermodynamicSystemBoundary({
        massCrossing: 0,
        energyCrossing: 1,
        boundaryConsistent: true
      }).calculatedValue
    ).toBe(2);
    expect(
      classifyThermodynamicSystemBoundary({
        massCrossing: 0,
        energyCrossing: 0,
        boundaryConsistent: true
      }).calculatedValue
    ).toBe(3);
  });

  it("rejects undeclared crossing values", () => {
    const result = classifyThermodynamicSystemBoundary({
      massCrossing: 0.5,
      energyCrossing: 1,
      boundaryConsistent: true
    });

    expect(result.validity.status).toBe("invalid");
    expect(result.calculatedValue).toBeNull();
    expect(result.validity.errors).toContain(
      "Mass crossing must use a declared selection."
    );
  });

  it("creates a valid closed-system initial state without property data", () => {
    const state = thermodynamicSystemBoundarySimulation.createInitialState();

    expect(state.status).toBe("idle");
    expect(state.inputs).toEqual({ massCrossing: 0, energyCrossing: 1 });
    expect(state.outputs.classificationCode).toBe(2);
    expect(state.liveMeasurements[0]).toMatchObject({
      id: "classificationCode",
      value: 2,
      unit: "classification"
    });
    expect(state.calculationExplanation[0]).toContain("closed system");
  });

  it("updates the visual model across open and isolated boundary states", () => {
    const open = thermodynamicSystemBoundarySimulation.updateInput(
      thermodynamicSystemBoundarySimulation.createInitialState("explore"),
      "massCrossing",
      1
    );
    const isolated = thermodynamicSystemBoundarySimulation.updateInput(
      thermodynamicSystemBoundarySimulation.updateInput(
        thermodynamicSystemBoundarySimulation.createInitialState("guided"),
        "massCrossing",
        0
      ),
      "energyCrossing",
      0
    );

    expect(open.outputs.classificationCode).toBe(1);
    expect(isolated.outputs.classificationCode).toBe(3);
  });

  it("rejects invalid discrete input and does not emit a classification", () => {
    const state = thermodynamicSystemBoundarySimulation.updateInput(
      thermodynamicSystemBoundarySimulation.createInitialState(),
      "massCrossing",
      0.5
    );

    expect(state.validity.status).toBe("invalid");
    expect(state.outputs).toEqual({});
    expect(state.validity.errors[0]).toContain("declared selection");
  });

  it("represents an inconsistent boundary as a source-backed diagnostic fault", () => {
    const faulted = thermodynamicSystemBoundarySimulation.injectFault(
      thermodynamicSystemBoundarySimulation.start(
        thermodynamicSystemBoundarySimulation.createInitialState("fault-diagnosis")
      ),
      "boundary-shift"
    );

    expect(faulted.status).toBe("faulted");
    expect(faulted.outputs.classificationCode).toBe(0);
    expect(faulted.alarms[0]).toContain("Boundary consistency fault");
    expect(faulted.resultsInterpretation).toContain("Restate one selected system");
  });

  it("resets selections and does not imply time dynamics", () => {
    const running = thermodynamicSystemBoundarySimulation.start(
      thermodynamicSystemBoundarySimulation.updateInput(
        thermodynamicSystemBoundarySimulation.createInitialState("guided"),
        "massCrossing",
        1
      )
    );
    const stepped = thermodynamicSystemBoundarySimulation.step(running, 5);
    const reset = thermodynamicSystemBoundarySimulation.reset(stepped);

    expect(stepped.elapsedTimeSeconds).toBe(0);
    expect(reset.mode).toBe("guided");
    expect(reset.status).toBe("idle");
    expect(reset.inputs).toEqual({ massCrossing: 0, energyCrossing: 1 });
    expect(reset.outputs.classificationCode).toBe(2);
  });

  it("rejects assessment scoring because the mode is not declared", () => {
    const state = thermodynamicSystemBoundarySimulation.createInitialState();
    const scored = thermodynamicSystemBoundarySimulation.scoreAssessment(state, 2);

    expect(scored.validity.status).toBe("invalid");
    expect(scored.validity.errors).toContain("Assessment mode is not supported.");
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

describe("Bernoulli flow simulation", () => {
  it("registers a source-gated, non-approved flagship definition", () => {
    expect(simulationRegistry.has("SIM-FLUID-BERNOULLI-FLOW-001")).toBe(true);
    expect(getSimulation("SIM-FLUID-BERNOULLI-FLOW-001")).toBe(bernoulliFlowSimulation);
    expect(bernoulliFlowSimulationDefinition.modes).toEqual([
      "learn",
      "guided",
      "explore"
    ]);
    expect(bernoulliFlowSimulationDefinition.faultModes).toEqual([]);
    expect(bernoulliFlowSimulationDefinition.supportsTimeProgression).toBe(false);
    expect(bernoulliFlowSimulationDefinition.reviewStatus).toBe(
      "Engineering review required"
    );
    expect(
      validateSimulationTraceability(bernoulliFlowSimulationDefinition).errors
    ).toEqual([]);
  });

  it("creates the expected initial ideal flow state and measurements", () => {
    const state = bernoulliFlowSimulation.createInitialState();

    expect(state.status).toBe("idle");
    expect(state.inputs).toEqual({ flowRate: 0.003, outletDiameter: 0.03 });
    expect(state.validity.status).toBe("valid");
    expect(state.outputs.velocity2).toBeGreaterThan(state.outputs.velocity1!);
    expect(state.outputs.pressure2).toBeLessThan(state.outputs.pressure1!);
    expect(state.outputs.totalHead2).toBeCloseTo(state.outputs.totalHead1!);
    expect(state.liveMeasurements.map((measurement) => measurement.id)).toEqual([
      "pressure1",
      "pressure2",
      "flowRate",
      "velocity1",
      "velocity2"
    ]);
  });

  it("updates pressure and velocity from flow-rate and diameter changes", () => {
    const greaterFlow = bernoulliFlowSimulation.updateInput(
      bernoulliFlowSimulation.createInitialState("explore"),
      "flowRate",
      0.006
    );
    const equalDiameter = bernoulliFlowSimulation.updateInput(
      greaterFlow,
      "outletDiameter",
      0.06
    );

    expect(greaterFlow.outputs.velocity2).toBeGreaterThan(8);
    expect(greaterFlow.outputs.pressure2).toBeLessThan(220_000);
    expect(equalDiameter.outputs.velocity2).toBeCloseTo(equalDiameter.outputs.velocity1!);
    expect(equalDiameter.outputs.pressure2).toBeCloseTo(equalDiameter.outputs.pressure1!);
  });

  it("accepts declared boundaries and rejects invalid values", () => {
    const minimum = bernoulliFlowSimulation.updateInput(
      bernoulliFlowSimulation.updateInput(
        bernoulliFlowSimulation.createInitialState(),
        "flowRate",
        0.001
      ),
      "outletDiameter",
      0.02
    );
    const maximum = bernoulliFlowSimulation.updateInput(
      bernoulliFlowSimulation.updateInput(
        bernoulliFlowSimulation.createInitialState(),
        "flowRate",
        0.006
      ),
      "outletDiameter",
      0.06
    );
    const invalidFlow = bernoulliFlowSimulation.updateInput(
      bernoulliFlowSimulation.createInitialState(),
      "flowRate",
      0
    );
    const invalidDiameter = bernoulliFlowSimulation.updateInput(
      bernoulliFlowSimulation.createInitialState(),
      "outletDiameter",
      Number.NaN
    );

    expect(minimum.validity.status).toBe("valid");
    expect(maximum.validity.status).toBe("valid");
    expect(invalidFlow.validity.status).toBe("invalid");
    expect(invalidFlow.outputs).toEqual({});
    expect(invalidDiameter.validity.status).toBe("invalid");
    expect(invalidDiameter.liveMeasurements).toEqual([]);
  });

  it("starts and pauses without claiming calculated time progression", () => {
    const started = bernoulliFlowSimulation.start(
      bernoulliFlowSimulation.createInitialState("guided")
    );
    const stepped = bernoulliFlowSimulation.step(started, 5);
    const paused = bernoulliFlowSimulation.pause(stepped);

    expect(started.status).toBe("running");
    expect(stepped.elapsedTimeSeconds).toBe(0);
    expect(paused.status).toBe("paused");
  });

  it("resets inputs and cannot inject unsupported faults or score assessments", () => {
    const changed = bernoulliFlowSimulation.updateInput(
      bernoulliFlowSimulation.createInitialState("explore"),
      "outletDiameter",
      0.02
    );
    const reset = bernoulliFlowSimulation.reset(changed);
    const fault = bernoulliFlowSimulation.injectFault(reset, "invented-fault");
    const assessment = bernoulliFlowSimulation.scoreAssessment(reset, 1);

    expect(reset.inputs).toEqual({ flowRate: 0.003, outletDiameter: 0.03 });
    expect(reset.status).toBe("idle");
    expect(reset.mode).toBe("explore");
    expect(fault.validity.status).toBe("invalid");
    expect(assessment.validity.errors).toContain("Assessment mode is not supported.");
  });
});
