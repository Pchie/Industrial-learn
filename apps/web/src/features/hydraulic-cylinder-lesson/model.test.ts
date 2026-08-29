import { describe, expect, it } from "vitest";

import {
  constrainHydraulicCylinderInput,
  createHydraulicCylinderLessonModel,
  HYDRAULIC_CYLINDER_LESSON_LIMITS,
  scalePistonDiameterForDisplay
} from "./model";

describe("hydraulic cylinder visual lesson model", () => {
  it("calculates the known 50 mm cap-end area and force through engineering-core", () => {
    const model = createHydraulicCylinderLessonModel({
      pressureMPa: 10,
      pistonDiameterMm: 50
    });

    expect(model.validity.status).toBe("valid");
    expect(model.areaCalculation?.calculatedValue).toBeCloseTo(0.001963495408493621);
    expect(model.forceCalculation?.calculatedValue).toBeCloseTo(19_634.95408493621);
    expect(model.areaCalculation?.equationId).toBe("EQ-HYD-PISTON-AREA-DIAMETER-001");
    expect(model.forceCalculation?.equationId).toBe("EQ-FLUID-FORCE-PRESSURE-AREA-001");
    expect(model.simulationState?.outputs.cylinderForce).toBeCloseTo(
      model.forceCalculation?.calculatedValue ?? 0
    );
  });

  it("converts MPa and mm explicitly before the SI calculations", () => {
    const model = createHydraulicCylinderLessonModel({
      pressureMPa: 5,
      pistonDiameterMm: 50
    });

    expect(model.pressureConversion).toMatchObject({
      calculatedValue: 5_000_000,
      unit: "Pa",
      equationId: "EQ-SI-CONVERSION-EXPLICIT-001"
    });
    expect(model.diameterConversion).toMatchObject({
      calculatedValue: 0.05,
      unit: "m",
      equationId: "EQ-SI-CONVERSION-EXPLICIT-001"
    });
    expect(model.pressureDisplayConversion).toMatchObject({
      calculatedValue: 5,
      unit: "MPa",
      equationId: "EQ-SI-CONVERSION-EXPLICIT-001"
    });
    expect(model.forceDisplayConversion).toMatchObject({
      unit: "kN",
      equationId: "EQ-SI-CONVERSION-EXPLICIT-001"
    });
  });

  it("updates force directly with pressure and by squared diameter through area", () => {
    const base = createHydraulicCylinderLessonModel({
      pressureMPa: 5,
      pistonDiameterMm: 50
    });
    const doubledPressure = createHydraulicCylinderLessonModel({
      pressureMPa: 10,
      pistonDiameterMm: 50
    });
    const doubledDiameter = createHydraulicCylinderLessonModel({
      pressureMPa: 5,
      pistonDiameterMm: 100
    });

    expect(doubledPressure.forceCalculation?.calculatedValue).toBeCloseTo(
      (base.forceCalculation?.calculatedValue ?? 0) * 2
    );
    expect(doubledDiameter.areaCalculation?.calculatedValue).toBeCloseTo(
      (base.areaCalculation?.calculatedValue ?? 0) * 4
    );
    expect(doubledDiameter.forceCalculation?.calculatedValue).toBeCloseTo(
      (base.forceCalculation?.calculatedValue ?? 0) * 4
    );
  });

  it("accepts educational boundaries and rejects out-of-range or invalid inputs", () => {
    const limits = HYDRAULIC_CYLINDER_LESSON_LIMITS;
    const minimum = createHydraulicCylinderLessonModel({
      pressureMPa: limits.pressureMPa.min,
      pistonDiameterMm: limits.pistonDiameterMm.min
    });
    const maximum = createHydraulicCylinderLessonModel({
      pressureMPa: limits.pressureMPa.max,
      pistonDiameterMm: limits.pistonDiameterMm.max
    });

    expect(minimum.validity.status).toBe("valid");
    expect(minimum.forceCalculation?.calculatedValue).toBe(0);
    expect(maximum.validity.status).toBe("valid");
    expect(maximum.forceCalculation?.calculatedValue).toBeCloseTo(157_079.63267948967);

    for (const input of [
      { pressureMPa: -0.1, pistonDiameterMm: 50 },
      { pressureMPa: 20.1, pistonDiameterMm: 50 },
      { pressureMPa: 5, pistonDiameterMm: 24 },
      { pressureMPa: 5, pistonDiameterMm: 101 },
      { pressureMPa: Number.NaN, pistonDiameterMm: 50 }
    ]) {
      const invalid = createHydraulicCylinderLessonModel(input);
      expect(invalid.validity.status).toBe("invalid");
      expect(invalid.forceCalculation).toBeNull();
      expect(invalid.simulationState).toBeNull();
    }
  });

  it("constrains UI values explicitly instead of silently accepting them", () => {
    expect(constrainHydraulicCylinderInput("pressureMPa", 25)).toEqual({
      value: 20,
      message: "Pressure was constrained to the educational interaction range 0 to 20."
    });
    expect(constrainHydraulicCylinderInput("pistonDiameterMm", 10)).toEqual({
      value: 25,
      message:
        "Piston diameter was constrained to the educational interaction range 25 to 100."
    });
    expect(constrainHydraulicCylinderInput("pressureMPa", Number.NaN)).toEqual({
      value: null,
      message: "Pressure must be a finite number."
    });
  });

  it("uses simulation-state pressure for the selectable chamber measurement", () => {
    const model = createHydraulicCylinderLessonModel({
      pressureMPa: 7.5,
      pistonDiameterMm: 60
    });

    expect(model.pressureReading).toMatchObject({
      pointId: "POINT-HYD-CYL-CAP-END-001",
      value: 7.5,
      unit: "MPa",
      validity: "valid"
    });
    expect(model.simulationState?.activeFaultIds).toEqual([]);
  });

  it("evaluates the load threshold and reports a signed margin", () => {
    const below = createHydraulicCylinderLessonModel({
      pressureMPa: 5,
      pistonDiameterMm: 50
    });
    const above = createHydraulicCylinderLessonModel({
      pressureMPa: 8,
      pistonDiameterMm: 50
    });

    expect(below.challenge.complete).toBe(false);
    expect(below.challengeMarginN).toBeCloseTo(-5_182.522957531895);
    expect(above.challenge.complete).toBe(true);
    expect(above.challengeMarginN).toBeCloseTo(707.9632679489665);
    expect(above.challengeMarginDisplayConversion?.calculatedValue).toBeCloseTo(
      0.7079632679489665
    );
  });

  it("applies shared visual-state semantics without relying on colour", () => {
    const model = createHydraulicCylinderLessonModel({
      pressureMPa: 8,
      pistonDiameterMm: 50
    });

    expect(model.visualState?.components["COMP-HYD-CYL-CHAMBER-001"]?.semantics).toEqual([
      "active",
      "measurement"
    ]);
    expect(model.visualState?.components["COMP-HYD-LOAD-001"]?.semantics).toEqual([
      "target",
      "active"
    ]);
  });

  it("normalises piston diameter only for bounded visual scaling", () => {
    expect(scalePistonDiameterForDisplay(25)).toBe(0);
    expect(scalePistonDiameterForDisplay(62.5)).toBe(0.5);
    expect(scalePistonDiameterForDisplay(100)).toBe(1);
    expect(scalePistonDiameterForDisplay(1_000)).toBe(1);
  });
});
