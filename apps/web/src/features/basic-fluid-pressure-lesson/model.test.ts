import { describe, expect, it } from "vitest";

import {
  BASIC_PRESSURE_LIMITS,
  createBasicPressureLessonModel,
  constrainBasicPressureInput,
  scaleBasicPressureForceVector,
  scaleContactAreaForDisplay,
  scalePressureIntensity
} from "./model";

describe("Basic Fluid Pressure lesson model", () => {
  it("calculates the known pressure result through engineering-core", () => {
    const model = createBasicPressureLessonModel({ forceN: 1_000, areaM2: 0.01 });

    expect(model.validity.status).toBe("valid");
    expect(model.pressureCalculation.calculatedValue).toBe(100_000);
    expect(model.pressureCalculation.equationId).toBe("EQ-FLUID-PRESSURE-001");
    expect(model.pressureDisplayConversion?.calculatedValue).toBe(100);
  });

  it("supports zero force without drawing force or pressure", () => {
    const zeroForce = createBasicPressureLessonModel({ forceN: 0, areaM2: 0.01 });

    expect(zeroForce.pressureCalculation.calculatedValue).toBe(0);
    expect(zeroForce.pressureReading?.value).toBe(0);
    expect(zeroForce.forceVectorLength).toBe(0);
    expect(zeroForce.pressureIntensity).toBe(0);
    expect(scaleBasicPressureForceVector(0)).toBe(0);
  });

  it("rejects zero area", () => {
    expect(
      createBasicPressureLessonModel({ forceN: 1_000, areaM2: 0 }).validity.status
    ).toBe("invalid");
  });

  it("constrains interaction inputs explicitly", () => {
    expect(constrainBasicPressureInput("forceN", -1).value).toBe(
      BASIC_PRESSURE_LIMITS.forceN.min
    );
    expect(constrainBasicPressureInput("areaM2", 1).value).toBe(
      BASIC_PRESSURE_LIMITS.areaM2.max
    );
    expect(constrainBasicPressureInput("forceN", Number.NaN).value).toBeNull();
  });

  it("evaluates the 200 kPa target and signed challenge difference", () => {
    const complete = createBasicPressureLessonModel({ forceN: 2_000, areaM2: 0.01 });
    const incomplete = createBasicPressureLessonModel({ forceN: 1_000, areaM2: 0.01 });

    expect(complete.challenge.complete).toBe(true);
    expect(complete.challengeDifferencePa).toBe(0);
    expect(incomplete.challenge.complete).toBe(false);
    expect(incomplete.challengeDifferencePa).toBe(-100_000);
  });

  it("keeps documented visual scales bounded", () => {
    expect(scaleContactAreaForDisplay(BASIC_PRESSURE_LIMITS.areaM2.min)).toBe(110);
    expect(scaleContactAreaForDisplay(BASIC_PRESSURE_LIMITS.areaM2.max)).toBe(280);
    expect(scalePressureIntensity(-1)).toBe(0);
    expect(scalePressureIntensity(10_000_000)).toBe(1);
  });
});
