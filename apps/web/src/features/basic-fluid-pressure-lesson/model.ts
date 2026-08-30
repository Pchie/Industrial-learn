import {
  convertFromSi,
  engineeringEquationMetadata,
  pressureFromForceAndArea,
  type EngineeringCalculationResult
} from "@industrial-learn/engineering-core";

import type {
  EngineeringChallengeContract,
  MeasurementReading,
  VectorScale
} from "../visual-simulation/contracts";
import { evaluateChallenge, scaleVectorLength } from "../visual-simulation/state";

export const BASIC_PRESSURE_LIMITS = {
  forceN: { min: 0, max: 5_000, step: 50, defaultValue: 1_000 },
  areaM2: { min: 0.005, max: 0.05, step: 0.001, defaultValue: 0.01 }
} as const;

export const BASIC_PRESSURE_TARGET_PA = 200_000;
export const BASIC_PRESSURE_TARGET_KPA = 200;
export const BASIC_PRESSURE_TARGET_TOLERANCE_PA = 1_000;
export const BASIC_PRESSURE_EQUATION =
  engineeringEquationMetadata["EQ-FLUID-PRESSURE-001"];

export const BASIC_PRESSURE_FORCE_VECTOR_SCALE: VectorScale = {
  domainMin: BASIC_PRESSURE_LIMITS.forceN.min,
  domainMax: BASIC_PRESSURE_LIMITS.forceN.max,
  visualMin: 28,
  visualMax: 118
};

export const BASIC_PRESSURE_CHALLENGE: EngineeringChallengeContract = {
  id: "CH-FLUID-PRESSURE-200KPA-001",
  objective: "Create 200 kPa of pressure",
  startingState: {
    forceN: BASIC_PRESSURE_LIMITS.forceN.defaultValue,
    areaM2: BASIC_PRESSURE_LIMITS.areaM2.defaultValue
  },
  allowedControls: ["forceN", "areaM2"],
  conditions: [
    {
      id: "pressure-within-target",
      stateKey: "pressurePa",
      operator: "within",
      target: BASIC_PRESSURE_TARGET_PA,
      tolerance: BASIC_PRESSURE_TARGET_TOLERANCE_PA,
      displayTarget: 200,
      displayUnit: "kPa",
      unit: "Pa"
    }
  ],
  hints: [
    "Increase normal force while holding area constant.",
    "Reduce contact area while holding force constant."
  ],
  competencyRelationship: "Practice only; this challenge does not award competency.",
  explanationBeforeCompletion:
    "Adjust normal force or contact area, then check whether the result is within 1 kPa of 200 kPa.",
  explanationAfterCompletion:
    "The selected force and area produce the 200 kPa educational target."
};

export type BasicPressureInput = {
  forceN: number;
  areaM2: number;
};

export type BasicPressureLessonModel = {
  input: BasicPressureInput;
  validity: { status: "valid" | "invalid"; errors: string[] };
  pressureCalculation: EngineeringCalculationResult<"Pa">;
  pressureDisplayConversion: EngineeringCalculationResult<"kPa"> | null;
  pressureReading: MeasurementReading | null;
  forceVectorLength: number;
  contactSideLength: number;
  pressureIntensity: number;
  challenge: ReturnType<typeof evaluateChallenge>;
  challengeDifferencePa: number | null;
  challengeDifferenceKPa: number | null;
  stateSummary: string;
};

export function createBasicPressureLessonModel(
  input: BasicPressureInput
): BasicPressureLessonModel {
  const inputErrors = validateBasicPressureInput(input);
  const pressureCalculation = pressureFromForceAndArea({
    force: { value: input.forceN, unit: "N" },
    area: { value: input.areaM2, unit: "m^2" }
  });
  const errors = [...inputErrors, ...pressureCalculation.validity.errors];
  const pressurePa = pressureCalculation.calculatedValue;

  if (errors.length > 0 || pressurePa === null) {
    return {
      input,
      validity: { status: "invalid", errors },
      pressureCalculation,
      pressureDisplayConversion: null,
      pressureReading: null,
      forceVectorLength: scaleBasicPressureForceVector(
        Number.isFinite(input.forceN) ? input.forceN : 0
      ),
      contactSideLength: scaleContactAreaForDisplay(input.areaM2),
      pressureIntensity: 0,
      challenge: evaluateChallenge(BASIC_PRESSURE_CHALLENGE, {}),
      challengeDifferencePa: null,
      challengeDifferenceKPa: null,
      stateSummary: "Inputs are outside the educational model validity range."
    };
  }

  const pressureDisplayConversion = convertFromSi({
    quantity: "pressure",
    value: pressurePa,
    fromUnit: "Pa",
    toUnit: "kPa"
  });
  const pressureKPa = pressureDisplayConversion.calculatedValue;
  const challenge = evaluateChallenge(BASIC_PRESSURE_CHALLENGE, { pressurePa });
  const challengeDifferencePa = pressurePa - BASIC_PRESSURE_TARGET_PA;
  const challengeDifferenceConversion = convertFromSi({
    quantity: "pressure",
    value: challengeDifferencePa,
    fromUnit: "Pa",
    toUnit: "kPa"
  });

  return {
    input,
    validity: { status: "valid", errors: [] },
    pressureCalculation,
    pressureDisplayConversion,
    pressureReading:
      pressureKPa === null
        ? null
        : {
            pointId: "POINT-FLUID-PRESSURE-SURFACE-001",
            quantity: "pressure",
            value: pressureKPa,
            unit: "kPa",
            validity: "valid",
            status: "Calculated from normal force and contact area"
          },
    forceVectorLength: scaleBasicPressureForceVector(input.forceN),
    contactSideLength: scaleContactAreaForDisplay(input.areaM2),
    pressureIntensity: scalePressureIntensity(pressurePa),
    challenge,
    challengeDifferencePa,
    challengeDifferenceKPa: challengeDifferenceConversion.calculatedValue,
    stateSummary: `${formatNumber(input.forceN, 0)} N acts normally over ${formatNumber(input.areaM2, 3)} m², producing ${formatNumber(pressureKPa ?? 0, 1)} kPa in the introductory pressure model.`
  };
}

export function scaleBasicPressureForceVector(forceN: number) {
  if (!Number.isFinite(forceN) || forceN <= 0) {
    return 0;
  }

  return scaleVectorLength(forceN, BASIC_PRESSURE_FORCE_VECTOR_SCALE);
}

export function constrainBasicPressureInput(
  field: keyof BasicPressureInput,
  value: number
) {
  const range = BASIC_PRESSURE_LIMITS[field];

  if (!Number.isFinite(value)) {
    return { value: null, message: `${inputLabel(field)} must be a finite number.` };
  }

  const constrained = Math.min(range.max, Math.max(range.min, value));
  return {
    value: constrained,
    message:
      constrained === value
        ? null
        : `${inputLabel(field)} was constrained to ${range.min}–${range.max} ${inputUnit(field)} for this educational model.`
  };
}

export function scaleContactAreaForDisplay(areaM2: number) {
  const range = BASIC_PRESSURE_LIMITS.areaM2;
  const safeArea = Number.isFinite(areaM2)
    ? Math.min(range.max, Math.max(range.min, areaM2))
    : range.min;
  const minimumSide = Math.sqrt(range.min);
  const maximumSide = Math.sqrt(range.max);
  const normalized = (Math.sqrt(safeArea) - minimumSide) / (maximumSide - minimumSide);

  return 110 + normalized * 170;
}

export function scalePressureIntensity(pressurePa: number) {
  const maximumPressure =
    BASIC_PRESSURE_LIMITS.forceN.max / BASIC_PRESSURE_LIMITS.areaM2.min;
  if (!Number.isFinite(pressurePa)) {
    return 0;
  }
  return Math.min(1, Math.max(0, pressurePa / maximumPressure));
}

function validateBasicPressureInput(input: BasicPressureInput) {
  const errors: string[] = [];

  for (const field of ["forceN", "areaM2"] as const) {
    const value = input[field];
    const range = BASIC_PRESSURE_LIMITS[field];
    if (!Number.isFinite(value)) {
      errors.push(`${inputLabel(field)} must be a finite number.`);
    } else if (value < range.min || value > range.max) {
      errors.push(
        `${inputLabel(field)} must be between ${range.min} and ${range.max} ${inputUnit(field)} for this educational model.`
      );
    }
  }

  return errors;
}

function inputLabel(field: keyof BasicPressureInput) {
  return field === "forceN" ? "Normal force" : "Contact area";
}

function inputUnit(field: keyof BasicPressureInput) {
  return field === "forceN" ? "N" : "m²";
}

function formatNumber(value: number, fractionDigits: number) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  });
}
