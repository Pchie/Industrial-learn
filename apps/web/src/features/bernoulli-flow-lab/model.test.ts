import { describe, expect, it } from "vitest";

import {
  BERNOULLI_FLOW_LESSON_LIMITS,
  constrainBernoulliInput,
  createBernoulliFlowLessonModel,
  evaluatePressurePrediction,
  scaleOutletDiameterForDisplay
} from "./model";

describe("Bernoulli flow visual lesson model", () => {
  it("calculates the default two-section state through engineering-core", () => {
    const model = createBernoulliFlowLessonModel({
      flowRateLps: 3,
      outletDiameterMm: 30
    });

    expect(model.validity.status).toBe("valid");
    expect(model.flowRateConversion?.calculatedValue).toBe(0.003);
    expect(model.outletDiameterConversion?.calculatedValue).toBe(0.03);
    expect(model.area1Calculation?.calculatedValue).toBeCloseTo(
      (Math.PI * 0.06 ** 2) / 4
    );
    expect(model.area2Calculation?.calculatedValue).toBeCloseTo(
      (Math.PI * 0.03 ** 2) / 4
    );
    expect(model.velocity1Calculation?.calculatedValue).toBeCloseTo(
      0.003 / ((Math.PI * 0.06 ** 2) / 4)
    );
    expect(model.velocity2Calculation?.calculatedValue).toBeCloseTo(
      0.003 / ((Math.PI * 0.03 ** 2) / 4)
    );
    expect(model.pressure2Calculation?.calculatedValue).toBeCloseTo(241_556.56840384024);
    expect(model.simulationState?.outputs.pressure2).toBeCloseTo(
      model.pressure2Calculation?.calculatedValue ?? 0
    );
  });

  it("updates velocity and ideal pressure when flow or diameter changes", () => {
    const base = createBernoulliFlowLessonModel({
      flowRateLps: 3,
      outletDiameterMm: 30
    });
    const greaterFlow = createBernoulliFlowLessonModel({
      flowRateLps: 6,
      outletDiameterMm: 30
    });
    const equalDiameter = createBernoulliFlowLessonModel({
      flowRateLps: 3,
      outletDiameterMm: 60
    });

    expect(greaterFlow.velocity2Calculation?.calculatedValue).toBeCloseTo(
      (base.velocity2Calculation?.calculatedValue ?? 0) * 2
    );
    expect(greaterFlow.pressure2Calculation?.calculatedValue).toBeLessThan(
      base.pressure2Calculation?.calculatedValue ?? 0
    );
    expect(equalDiameter.velocity2Calculation?.calculatedValue).toBeCloseTo(
      equalDiameter.velocity1Calculation?.calculatedValue ?? 0
    );
    expect(equalDiameter.pressure2Calculation?.calculatedValue).toBeCloseTo(250_000);
    expect(equalDiameter.pressureRelation).toBe("same");
  });

  it("preserves ideal total head and exposes simulation-state measurements", () => {
    const model = createBernoulliFlowLessonModel({
      flowRateLps: 5,
      outletDiameterMm: 25
    });

    expect(model.simulationState?.outputs.totalHead2).toBeCloseTo(
      model.simulationState?.outputs.totalHead1 ?? 0
    );
    expect(model.pressureReadings).toEqual([
      expect.objectContaining({
        pointId: "POINT-FLUID-BERNOULLI-1",
        unit: "kPa",
        validity: "valid"
      }),
      expect.objectContaining({
        pointId: "POINT-FLUID-BERNOULLI-2",
        unit: "kPa",
        validity: "valid"
      })
    ]);
    expect(model.visualState?.components["COMP-FLUID-BERNOULLI-SECTION-2"]).toMatchObject(
      { measured: true, direction: "forward" }
    );
  });

  it("evaluates the velocity target and pressure prediction deterministically", () => {
    const nearTarget = createBernoulliFlowLessonModel({
      flowRateLps: 3,
      outletDiameterMm: 25.2
    });

    expect(nearTarget.velocity2Calculation?.calculatedValue).toBeCloseTo(6.015, 2);
    expect(nearTarget.velocityChallenge.complete).toBe(true);
    expect(nearTarget.velocityDifferenceMps).toBeCloseTo(0.015, 2);
    expect(evaluatePressurePrediction("lower", nearTarget.pressureRelation)).toEqual({
      complete: true,
      answered: true,
      actual: "lower"
    });
    expect(evaluatePressurePrediction(null, nearTarget.pressureRelation).answered).toBe(
      false
    );
  });

  it("accepts declared boundaries and rejects invalid values", () => {
    const limits = BERNOULLI_FLOW_LESSON_LIMITS;
    expect(
      createBernoulliFlowLessonModel({
        flowRateLps: limits.flowRateLps.min,
        outletDiameterMm: limits.outletDiameterMm.min
      }).validity.status
    ).toBe("valid");
    expect(
      createBernoulliFlowLessonModel({
        flowRateLps: limits.flowRateLps.max,
        outletDiameterMm: limits.outletDiameterMm.max
      }).validity.status
    ).toBe("valid");

    for (const input of [
      { flowRateLps: 0, outletDiameterMm: 30 },
      { flowRateLps: 7, outletDiameterMm: 30 },
      { flowRateLps: 3, outletDiameterMm: 19 },
      { flowRateLps: 3, outletDiameterMm: 61 },
      { flowRateLps: Number.NaN, outletDiameterMm: 30 }
    ]) {
      const invalid = createBernoulliFlowLessonModel(input);
      expect(invalid.validity.status).toBe("invalid");
      expect(invalid.pressure2Calculation).toBeNull();
      expect(invalid.simulationState).toBeNull();
    }
  });

  it("constrains UI values explicitly and normalises only the visual diameter", () => {
    expect(constrainBernoulliInput("flowRateLps", 10)).toEqual({
      value: 6,
      message: "Flow rate was constrained to the educational range 1 to 6."
    });
    expect(constrainBernoulliInput("outletDiameterMm", 10)).toEqual({
      value: 20,
      message: "Section 2 diameter was constrained to the educational range 20 to 60."
    });
    expect(constrainBernoulliInput("flowRateLps", Number.NaN)).toEqual({
      value: null,
      message: "Flow rate must be a finite number."
    });
    expect(scaleOutletDiameterForDisplay(20)).toBe(0);
    expect(scaleOutletDiameterForDisplay(40)).toBe(0.5);
    expect(scaleOutletDiameterForDisplay(60)).toBe(1);
    expect(scaleOutletDiameterForDisplay(100)).toBe(1);
  });
});
