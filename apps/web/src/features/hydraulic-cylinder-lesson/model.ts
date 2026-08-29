import {
  convertFromSi,
  convertToSi,
  forceFromPressureAndArea,
  pistonAreaFromDiameter,
  type EngineeringCalculationResult
} from "@industrial-learn/engineering-core";
import {
  hydraulicCylinderForceSimulation,
  type SimulationState
} from "@industrial-learn/simulation-engine";

import type {
  EngineeringChallengeContract,
  MeasurementPointDefinition,
  MeasurementReading,
  VisualOperatingState
} from "../visual-simulation/contracts";
import { evaluateChallenge } from "../visual-simulation/state";

export const HYDRAULIC_CYLINDER_LESSON_LIMITS = {
  pressureMPa: { min: 0, max: 20, step: 0.5, defaultValue: 5 },
  pistonDiameterMm: { min: 25, max: 100, step: 1, defaultValue: 50 }
} as const;

export const HYDRAULIC_CYLINDER_LOAD_FORCE_N = 15_000;

export const HYDRAULIC_CYLINDER_FORCE_VECTOR_SCALE = {
  domainMin: 0,
  domainMax: 160_000,
  visualMin: 24,
  visualMax: 132
} as const;

export const HYDRAULIC_CYLINDER_CHALLENGE: EngineeringChallengeContract = {
  id: "CH-HYD-CYL-LIFT-001",
  objective: "Lift the load",
  startingState: {
    pressureMPa: HYDRAULIC_CYLINDER_LESSON_LIMITS.pressureMPa.defaultValue,
    pistonDiameterMm: HYDRAULIC_CYLINDER_LESSON_LIMITS.pistonDiameterMm.defaultValue
  },
  allowedControls: ["pressureMPa", "pistonDiameterMm"],
  conditions: [
    {
      id: "theoretical-force-meets-load",
      stateKey: "cylinderForceN",
      operator: "at-least",
      target: HYDRAULIC_CYLINDER_LOAD_FORCE_N,
      displayTarget: 15,
      displayUnit: "kN",
      unit: "N"
    }
  ],
  hints: [
    "Increase pressure while holding diameter constant and observe the force.",
    "Increase diameter and observe how the circular piston area changes."
  ],
  competencyRelationship: "Practice only; this challenge does not award competency.",
  explanationBeforeCompletion:
    "Adjust pressure or piston diameter, then check whether the theoretical force reaches 15 kN.",
  explanationAfterCompletion:
    "The cylinder now produces sufficient theoretical force for this idealised load."
};

export const HYDRAULIC_CYLINDER_MEASUREMENT_POINTS: MeasurementPointDefinition[] = [
  {
    id: "POINT-HYD-CYL-CAP-END-001",
    componentId: "COMP-HYD-CYL-CHAMBER-001",
    label: "Cap-end chamber pressure point",
    quantity: "pressure",
    compatibleInstruments: ["pressure-gauge", "digital-pressure"]
  }
];

export type HydraulicCylinderLessonInput = {
  pressureMPa: number;
  pistonDiameterMm: number;
};

type HydraulicCylinderVisualExtension = Record<string, unknown> & {
  displayDiameterRatio: number;
  pressureState: "unpressurised" | "pressurised";
};

export type HydraulicCylinderLessonModel = {
  input: HydraulicCylinderLessonInput;
  validity: { status: "valid" | "invalid"; errors: string[] };
  pressureConversion: EngineeringCalculationResult<"Pa"> | null;
  diameterConversion: EngineeringCalculationResult<"m"> | null;
  areaCalculation: EngineeringCalculationResult<"m^2"> | null;
  forceCalculation: EngineeringCalculationResult<"N"> | null;
  pressureDisplayConversion: EngineeringCalculationResult<"MPa"> | null;
  forceDisplayConversion: EngineeringCalculationResult<"kN"> | null;
  challengeMarginDisplayConversion: EngineeringCalculationResult<"kN"> | null;
  simulationState: SimulationState | null;
  visualState: VisualOperatingState<HydraulicCylinderVisualExtension> | null;
  pressureReading: MeasurementReading | null;
  challenge: ReturnType<typeof evaluateChallenge>;
  challengeMarginN: number | null;
};

export function createHydraulicCylinderLessonModel(
  input: HydraulicCylinderLessonInput
): HydraulicCylinderLessonModel {
  const inputErrors = validateHydraulicCylinderLessonInput(input);
  if (inputErrors.length > 0) {
    return invalidLessonModel(input, inputErrors);
  }

  const pressureConversion = convertToSi({
    quantity: "pressure",
    value: input.pressureMPa,
    fromUnit: "MPa",
    toUnit: "Pa"
  });
  const diameterConversion = convertToSi({
    quantity: "length",
    value: input.pistonDiameterMm,
    fromUnit: "mm",
    toUnit: "m"
  });

  if (
    pressureConversion.calculatedValue === null ||
    diameterConversion.calculatedValue === null
  ) {
    return invalidLessonModel(input, [
      ...pressureConversion.validity.errors,
      ...diameterConversion.validity.errors
    ]);
  }

  const areaCalculation = pistonAreaFromDiameter({
    diameter: { value: diameterConversion.calculatedValue, unit: "m" }
  });
  if (areaCalculation.calculatedValue === null) {
    return invalidLessonModel(input, areaCalculation.validity.errors);
  }

  const forceCalculation = forceFromPressureAndArea({
    pressure: { value: pressureConversion.calculatedValue, unit: "Pa" },
    area: { value: areaCalculation.calculatedValue, unit: "m^2" }
  });
  if (forceCalculation.calculatedValue === null) {
    return invalidLessonModel(input, forceCalculation.validity.errors);
  }

  const simulationState = hydraulicCylinderForceSimulation.updateInput(
    hydraulicCylinderForceSimulation.updateInput(
      hydraulicCylinderForceSimulation.createInitialState("learn"),
      "pressure",
      pressureConversion.calculatedValue
    ),
    "pistonArea",
    areaCalculation.calculatedValue
  );
  const simulationForce = simulationState.outputs.cylinderForce;

  if (
    simulationState.validity.status === "invalid" ||
    simulationForce === undefined ||
    !nearlyEqual(simulationForce, forceCalculation.calculatedValue)
  ) {
    return invalidLessonModel(input, [
      ...simulationState.validity.errors,
      "The simulation output did not match the engineering-core force result."
    ]);
  }

  const pressureMeasurement = simulationState.liveMeasurements.find(
    (measurement) => measurement.id === "pressure"
  );
  const pressureDisplayConversion = convertFromSi({
    quantity: "pressure",
    value: pressureMeasurement?.value ?? pressureConversion.calculatedValue,
    fromUnit: "Pa",
    toUnit: "MPa"
  });
  const forceDisplayConversion = convertFromSi({
    quantity: "force",
    value: forceCalculation.calculatedValue,
    fromUnit: "N",
    toUnit: "kN"
  });
  const challengeMarginN = simulationForce - HYDRAULIC_CYLINDER_LOAD_FORCE_N;
  const challengeMarginDisplayConversion = convertFromSi({
    quantity: "force",
    value: challengeMarginN,
    fromUnit: "N",
    toUnit: "kN"
  });
  const pressureReading: MeasurementReading | null =
    pressureMeasurement && pressureDisplayConversion.calculatedValue !== null
      ? {
          pointId: HYDRAULIC_CYLINDER_MEASUREMENT_POINTS[0]?.id ?? "",
          quantity: "pressure",
          value: pressureDisplayConversion.calculatedValue,
          unit: pressureDisplayConversion.unit,
          validity: "valid",
          status: "Simulation-state pressure, explicitly displayed in MPa"
        }
      : null;
  const challenge = evaluateChallenge(HYDRAULIC_CYLINDER_CHALLENGE, {
    cylinderForceN: simulationForce
  });

  return {
    input,
    validity: { status: "valid", errors: [] },
    pressureConversion,
    diameterConversion,
    areaCalculation,
    forceCalculation,
    pressureDisplayConversion,
    forceDisplayConversion,
    challengeMarginDisplayConversion,
    simulationState,
    visualState: adaptHydraulicCylinderVisualState(
      simulationState,
      input.pistonDiameterMm,
      input.pressureMPa,
      forceCalculation.calculatedValue,
      forceDisplayConversion.calculatedValue ?? 0
    ),
    pressureReading,
    challenge,
    challengeMarginN
  };
}

export function constrainHydraulicCylinderInput(
  field: keyof HydraulicCylinderLessonInput,
  value: number
) {
  const range = HYDRAULIC_CYLINDER_LESSON_LIMITS[field];
  if (!Number.isFinite(value)) {
    return {
      value: null,
      message: `${inputLabel(field)} must be a finite number.`
    };
  }

  const constrained = Math.min(range.max, Math.max(range.min, value));
  return {
    value: constrained,
    message:
      constrained === value
        ? null
        : `${inputLabel(field)} was constrained to the educational interaction range ${range.min} to ${range.max}.`
  };
}

export function scalePistonDiameterForDisplay(diameterMm: number) {
  const range = HYDRAULIC_CYLINDER_LESSON_LIMITS.pistonDiameterMm;
  const normalized = (diameterMm - range.min) / (range.max - range.min);
  return Math.min(1, Math.max(0, normalized));
}

function validateHydraulicCylinderLessonInput(input: HydraulicCylinderLessonInput) {
  const errors: string[] = [];

  for (const field of ["pressureMPa", "pistonDiameterMm"] as const) {
    const value = input[field];
    const range = HYDRAULIC_CYLINDER_LESSON_LIMITS[field];
    if (!Number.isFinite(value)) {
      errors.push(`${inputLabel(field)} must be a finite number.`);
    } else if (value < range.min || value > range.max) {
      errors.push(
        `${inputLabel(field)} must be between ${range.min} and ${range.max} for this educational model.`
      );
    }
  }

  return errors;
}

function adaptHydraulicCylinderVisualState(
  simulationState: SimulationState,
  diameterMm: number,
  pressureMPa: number,
  forceN: number,
  forceKN: number
): VisualOperatingState<HydraulicCylinderVisualExtension> {
  const pressurePa = simulationState.inputs.pressure ?? 0;
  const pressurised = pressurePa > 0;
  const extension: HydraulicCylinderVisualExtension = {
    displayDiameterRatio: scalePistonDiameterForDisplay(diameterMm),
    pressureState: pressurised ? "pressurised" : "unpressurised"
  };

  return {
    status:
      simulationState.validity.status === "invalid"
        ? "invalid"
        : simulationState.status === "running"
          ? "running"
          : simulationState.status === "paused"
            ? "paused"
            : "idle",
    summary: `${pressureMPa.toLocaleString()} MPa acts on a ${diameterMm.toLocaleString()} mm circular cap-end piston, producing ${forceKN.toLocaleString(undefined, { maximumFractionDigits: 2 })} kN ideal theoretical extension force.`,
    components: {
      "COMP-HYD-SOURCE-001": {
        componentId: "COMP-HYD-SOURCE-001",
        active: pressurised,
        semantics: [pressurised ? "active" : "normal"],
        pressure: { value: pressurePa, unit: "Pa", validity: "valid" },
        extension
      },
      "COMP-HYD-LINE-001": {
        componentId: "COMP-HYD-LINE-001",
        active: pressurised,
        semantics: [pressurised ? "active" : "normal"],
        direction: pressurised ? "forward" : "none",
        pressure: { value: pressurePa, unit: "Pa", validity: "valid" },
        extension
      },
      "COMP-HYD-CYL-CHAMBER-001": {
        componentId: "COMP-HYD-CYL-CHAMBER-001",
        active: pressurised,
        pressure: { value: pressurePa, unit: "Pa", validity: "valid" },
        measured: true,
        semantics: [pressurised ? "active" : "normal", "measurement"],
        extension
      },
      "COMP-HYD-CYL-PISTON-001": {
        componentId: "COMP-HYD-CYL-PISTON-001",
        active: pressurised,
        semantics: [pressurised ? "active" : "normal"],
        force: { value: forceN, unit: "N", validity: "valid" },
        direction: pressurised ? "forward" : "none",
        extension
      },
      "COMP-HYD-CYL-ROD-001": {
        componentId: "COMP-HYD-CYL-ROD-001",
        active: pressurised,
        semantics: [pressurised ? "active" : "normal"],
        force: { value: forceN, unit: "N", validity: "valid" },
        direction: pressurised ? "forward" : "none",
        extension
      },
      "COMP-HYD-LOAD-001": {
        componentId: "COMP-HYD-LOAD-001",
        active: forceN >= HYDRAULIC_CYLINDER_LOAD_FORCE_N,
        semantics: [
          "target",
          forceN >= HYDRAULIC_CYLINDER_LOAD_FORCE_N ? "active" : "normal"
        ],
        force: {
          value: HYDRAULIC_CYLINDER_LOAD_FORCE_N,
          unit: "N",
          validity: "valid"
        },
        extension
      }
    }
  };
}

function invalidLessonModel(
  input: HydraulicCylinderLessonInput,
  errors: string[]
): HydraulicCylinderLessonModel {
  return {
    input,
    validity: { status: "invalid", errors },
    pressureConversion: null,
    diameterConversion: null,
    areaCalculation: null,
    forceCalculation: null,
    pressureDisplayConversion: null,
    forceDisplayConversion: null,
    challengeMarginDisplayConversion: null,
    simulationState: null,
    visualState: null,
    pressureReading: null,
    challenge: evaluateChallenge(HYDRAULIC_CYLINDER_CHALLENGE, {}),
    challengeMarginN: null
  };
}

function inputLabel(field: keyof HydraulicCylinderLessonInput) {
  return field === "pressureMPa" ? "Pressure" : "Piston diameter";
}

function nearlyEqual(left: number, right: number) {
  const scale = Math.max(1, Math.abs(left), Math.abs(right));
  return Math.abs(left - right) <= scale * Number.EPSILON * 8;
}
