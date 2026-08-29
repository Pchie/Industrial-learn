import { describe, expect, it } from "vitest";

import { parseSimulationCompletionPayload, parseSimulationMode } from "./state";

describe("simulation browser state parsing", () => {
  it("accepts known simulation modes", () => {
    expect(parseSimulationMode("learn")).toBe("learn");
    expect(parseSimulationMode("fault-diagnosis")).toBe("fault-diagnosis");
    expect(parseSimulationMode("unsupported")).toBeNull();
  });

  it("reconstructs a valid hydraulic cylinder simulation state", () => {
    const parsed = parseSimulationCompletionPayload(
      JSON.stringify({
        definitionId: "SIM-HYD-CYL-FORCE-001",
        mode: "guided",
        status: "running",
        elapsedTimeSeconds: 2,
        speedMultiplier: 1,
        inputs: {
          pressure: 1_000_000,
          pistonArea: 0.01
        },
        activeFaultIds: []
      }),
      "{}",
      ""
    );

    expect(parsed.finalState.outputs.cylinderForce).toBe(10_000);
    expect(parsed.finalState.validity.status).toBe("valid");
  });

  it("rejects invalid physical inputs before persistence", () => {
    expect(() =>
      parseSimulationCompletionPayload(
        JSON.stringify({
          definitionId: "SIM-HYD-CYL-FORCE-001",
          mode: "guided",
          status: "running",
          inputs: {
            pressure: -1,
            pistonArea: 0.01
          },
          activeFaultIds: []
        }),
        "{}",
        ""
      )
    ).toThrow(/pressure must be between/);
  });

  it("reconstructs a valid thermodynamic boundary classification", () => {
    const parsed = parseSimulationCompletionPayload(
      JSON.stringify({
        definitionId: "sim-core-thermal-system-001",
        mode: "guided",
        status: "running",
        elapsedTimeSeconds: 20,
        speedMultiplier: 1,
        inputs: {
          massCrossing: 1,
          energyCrossing: 1
        },
        activeFaultIds: []
      }),
      "{}",
      ""
    );

    expect(parsed.finalState.outputs.classificationCode).toBe(1);
    expect(parsed.finalState.elapsedTimeSeconds).toBe(0);
    expect(parsed.finalState.validity.status).toBe("valid");
  });

  it("reconstructs the inconsistent-boundary diagnostic state", () => {
    const parsed = parseSimulationCompletionPayload(
      JSON.stringify({
        definitionId: "sim-core-thermal-system-001",
        mode: "fault-diagnosis",
        status: "faulted",
        inputs: {
          massCrossing: 0,
          energyCrossing: 1
        },
        activeFaultIds: ["boundary-shift"]
      }),
      JSON.stringify({ selectedDiagnosis: "boundary-shift" }),
      ""
    );

    expect(parsed.finalState.status).toBe("faulted");
    expect(parsed.finalState.outputs.classificationCode).toBe(0);
    expect(parsed.finalState.alarms[0]).toContain("Boundary consistency fault");
  });

  it("rejects undeclared thermodynamic crossing selections before persistence", () => {
    expect(() =>
      parseSimulationCompletionPayload(
        JSON.stringify({
          definitionId: "sim-core-thermal-system-001",
          mode: "guided",
          status: "running",
          inputs: {
            massCrossing: 0.5,
            energyCrossing: 1
          },
          activeFaultIds: []
        }),
        "{}",
        ""
      )
    ).toThrow(/declared selection/);
  });

  it("rejects non-finite assessment answers", () => {
    expect(() =>
      parseSimulationCompletionPayload(
        JSON.stringify({
          definitionId: "SIM-HYD-CYL-FORCE-001",
          mode: "assessment",
          status: "running",
          inputs: {
            pressure: 1_000_000,
            pistonArea: 0.01
          },
          activeFaultIds: []
        }),
        "{}",
        "not-a-number"
      )
    ).toThrow(/finite number/);
  });
});
