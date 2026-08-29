import {
  bernoulliPressureAtPoint2,
  circularAreaFromDiameter,
  convertFromSi,
  convertToSi,
  fluidVelocity,
  getEngineeringEquationMetadata,
  type EngineeringCalculationResult
} from "@industrial-learn/engineering-core";
import {
  BERNOULLI_FLOW_MODEL_PARAMETERS,
  bernoulliFlowSimulation,
  type SimulationState
} from "@industrial-learn/simulation-engine";

import type {
  EngineeringChallengeContract,
  LiveEquationModel,
  MeasurementPointDefinition,
  MeasurementReading,
  VisualOperatingState
} from "../visual-simulation/contracts";
import { evaluateChallenge } from "../visual-simulation/state";

export const BERNOULLI_FLOW_LESSON_LIMITS = {
  flowRateLps: { min: 1, max: 6, step: 0.1, defaultValue: 3 },
  outletDiameterMm: { min: 20, max: 60, step: 1, defaultValue: 30 }
} as const;

export const BERNOULLI_VELOCITY_TARGET_MPS = 6;
export const BERNOULLI_VELOCITY_TOLERANCE_MPS = 0.2;

export const BERNOULLI_VELOCITY_CHALLENGE: EngineeringChallengeContract = {
  id: "CH-FLUID-BERNOULLI-VELOCITY-001",
  objective: "Reach 6 m/s at section 2",
  startingState: {
    flowRateLps: BERNOULLI_FLOW_LESSON_LIMITS.flowRateLps.defaultValue,
    outletDiameterMm: BERNOULLI_FLOW_LESSON_LIMITS.outletDiameterMm.defaultValue
  },
  allowedControls: ["flowRateLps", "outletDiameterMm"],
  conditions: [
    {
      id: "section-2-velocity-target",
      stateKey: "velocity2Mps",
      operator: "within",
      target: BERNOULLI_VELOCITY_TARGET_MPS,
      tolerance: BERNOULLI_VELOCITY_TOLERANCE_MPS,
      displayTarget: BERNOULLI_VELOCITY_TARGET_MPS,
      displayUnit: "m/s",
      unit: "m/s"
    }
  ],
  hints: [
    "At fixed diameter, increasing flow rate increases average velocity.",
    "At fixed flow rate, decreasing diameter reduces area and increases average velocity."
  ],
  competencyRelationship: "Practice only; this challenge does not award competency.",
  explanationBeforeCompletion:
    "Adjust flow rate or section 2 diameter, then check whether the calculated average velocity is within 0.2 m/s of 6 m/s.",
  explanationAfterCompletion:
    "The section 2 average velocity is within the ideal challenge tolerance."
};

export const BERNOULLI_MEASUREMENT_POINTS: MeasurementPointDefinition[] = [
  {
    id: "POINT-FLUID-BERNOULLI-1",
    componentId: "COMP-FLUID-BERNOULLI-SECTION-1",
    label: "Section 1 pressure point",
    quantity: "pressure",
    compatibleInstruments: ["pressure-gauge", "digital-pressure"]
  },
  {
    id: "POINT-FLUID-BERNOULLI-2",
    componentId: "COMP-FLUID-BERNOULLI-SECTION-2",
    label: "Section 2 pressure point",
    quantity: "pressure",
    compatibleInstruments: ["pressure-gauge", "digital-pressure"]
  }
];

export type BernoulliFlowLessonInput = {
  flowRateLps: number;
  outletDiameterMm: number;
};

export type PressurePrediction = "higher" | "lower" | "same";

type BernoulliVisualExtension = Record<string, unknown> & {
  diameterRatio: number;
  flowMagnitudeNormalized: number;
  pressureRelation: PressurePrediction;
};

export type BernoulliFlowLessonModel = {
  input: BernoulliFlowLessonInput;
  validity: { status: "valid" | "invalid"; errors: string[] };
  flowRateConversion: EngineeringCalculationResult<"m^3/s"> | null;
  outletDiameterConversion: EngineeringCalculationResult<"m"> | null;
  area1Calculation: EngineeringCalculationResult<"m^2"> | null;
  area2Calculation: EngineeringCalculationResult<"m^2"> | null;
  velocity1Calculation: EngineeringCalculationResult<"m/s"> | null;
  velocity2Calculation: EngineeringCalculationResult<"m/s"> | null;
  pressure2Calculation: EngineeringCalculationResult<"Pa"> | null;
  velocity2Equation: LiveEquationModel<"m/s"> | null;
  pressure2Equation: LiveEquationModel<"Pa"> | null;
  pressure1DisplayConversion: EngineeringCalculationResult<"kPa"> | null;
  pressure2DisplayConversion: EngineeringCalculationResult<"kPa"> | null;
  simulationState: SimulationState | null;
  visualState: VisualOperatingState<BernoulliVisualExtension> | null;
  pressureReadings: MeasurementReading[];
  velocityChallenge: ReturnType<typeof evaluateChallenge>;
  velocityDifferenceMps: number | null;
  pressureRelation: PressurePrediction | null;
};

export function createBernoulliFlowLessonModel(
  input: BernoulliFlowLessonInput
): BernoulliFlowLessonModel {
  const inputErrors = validateBernoulliFlowLessonInput(input);
  if (inputErrors.length > 0) {
    return invalidLessonModel(input, inputErrors);
  }

  const flowRateConversion = convertToSi({
    quantity: "volumetricFlowRate",
    value: input.flowRateLps,
    fromUnit: "L/s",
    toUnit: "m^3/s"
  });
  const outletDiameterConversion = convertToSi({
    quantity: "length",
    value: input.outletDiameterMm,
    fromUnit: "mm",
    toUnit: "m"
  });
  if (
    flowRateConversion.calculatedValue === null ||
    outletDiameterConversion.calculatedValue === null
  ) {
    return invalidLessonModel(input, [
      ...flowRateConversion.validity.errors,
      ...outletDiameterConversion.validity.errors
    ]);
  }

  const parameters = BERNOULLI_FLOW_MODEL_PARAMETERS;
  const area1Calculation = circularAreaFromDiameter({
    diameter: { value: parameters.inletDiameterM, unit: "m" }
  });
  const area2Calculation = circularAreaFromDiameter({
    diameter: { value: outletDiameterConversion.calculatedValue, unit: "m" }
  });
  if (
    area1Calculation.calculatedValue === null ||
    area2Calculation.calculatedValue === null
  ) {
    return invalidLessonModel(input, [
      ...area1Calculation.validity.errors,
      ...area2Calculation.validity.errors
    ]);
  }

  const velocity1Calculation = fluidVelocity({
    flowRate: { value: flowRateConversion.calculatedValue, unit: "m^3/s" },
    area: { value: area1Calculation.calculatedValue, unit: "m^2" }
  });
  const velocity2Calculation = fluidVelocity({
    flowRate: { value: flowRateConversion.calculatedValue, unit: "m^3/s" },
    area: { value: area2Calculation.calculatedValue, unit: "m^2" }
  });
  if (
    velocity1Calculation.calculatedValue === null ||
    velocity2Calculation.calculatedValue === null
  ) {
    return invalidLessonModel(input, [
      ...velocity1Calculation.validity.errors,
      ...velocity2Calculation.validity.errors
    ]);
  }

  const pressure2Calculation = bernoulliPressureAtPoint2({
    pressure1: { value: parameters.inletAbsolutePressurePa, unit: "Pa" },
    density: { value: parameters.densityKgPerM3, unit: "kg/m^3" },
    velocity1: { value: velocity1Calculation.calculatedValue, unit: "m/s" },
    velocity2: { value: velocity2Calculation.calculatedValue, unit: "m/s" },
    elevation1: { value: parameters.elevation1M, unit: "m" },
    elevation2: { value: parameters.elevation2M, unit: "m" },
    gravitationalAcceleration: {
      value: parameters.gravitationalAccelerationMPerS2,
      unit: "m/s^2"
    }
  });
  if (pressure2Calculation.calculatedValue === null) {
    return invalidLessonModel(input, pressure2Calculation.validity.errors);
  }

  const simulationState = bernoulliFlowSimulation.updateInput(
    bernoulliFlowSimulation.updateInput(
      bernoulliFlowSimulation.createInitialState("learn"),
      "flowRate",
      flowRateConversion.calculatedValue
    ),
    "outletDiameter",
    outletDiameterConversion.calculatedValue
  );
  const outputPairs: Array<[number | undefined, number]> = [
    [simulationState.outputs.area1, area1Calculation.calculatedValue],
    [simulationState.outputs.area2, area2Calculation.calculatedValue],
    [simulationState.outputs.velocity1, velocity1Calculation.calculatedValue],
    [simulationState.outputs.velocity2, velocity2Calculation.calculatedValue],
    [simulationState.outputs.pressure2, pressure2Calculation.calculatedValue]
  ];
  if (
    simulationState.validity.status === "invalid" ||
    outputPairs.some(
      ([simulationValue, coreValue]) =>
        simulationValue === undefined || !nearlyEqual(simulationValue, coreValue)
    )
  ) {
    return invalidLessonModel(input, [
      ...simulationState.validity.errors,
      "The simulation output did not match the engineering-core Bernoulli model."
    ]);
  }

  const pressure1DisplayConversion = convertFromSi({
    quantity: "pressure",
    value: parameters.inletAbsolutePressurePa,
    fromUnit: "Pa",
    toUnit: "kPa"
  });
  const pressure2DisplayConversion = convertFromSi({
    quantity: "pressure",
    value: pressure2Calculation.calculatedValue,
    fromUnit: "Pa",
    toUnit: "kPa"
  });
  if (
    pressure1DisplayConversion.calculatedValue === null ||
    pressure2DisplayConversion.calculatedValue === null
  ) {
    return invalidLessonModel(input, [
      ...pressure1DisplayConversion.validity.errors,
      ...pressure2DisplayConversion.validity.errors
    ]);
  }

  const pressureReadings: MeasurementReading[] = [
    {
      pointId: BERNOULLI_MEASUREMENT_POINTS[0]!.id,
      quantity: "pressure",
      value: pressure1DisplayConversion.calculatedValue,
      unit: "kPa",
      validity: "valid",
      status: "Absolute pressure from simulation state"
    },
    {
      pointId: BERNOULLI_MEASUREMENT_POINTS[1]!.id,
      quantity: "pressure",
      value: pressure2DisplayConversion.calculatedValue,
      unit: "kPa",
      validity: "valid",
      status: "Ideal absolute pressure from simulation state"
    }
  ];
  const velocity2Mps = velocity2Calculation.calculatedValue;
  const pressureRelation = comparePressure(
    pressure2Calculation.calculatedValue,
    parameters.inletAbsolutePressurePa
  );

  return {
    input,
    validity: { status: "valid", errors: [] },
    flowRateConversion,
    outletDiameterConversion,
    area1Calculation,
    area2Calculation,
    velocity1Calculation,
    velocity2Calculation,
    pressure2Calculation,
    velocity2Equation: createLiveEquationModel(
      "Section 2 average velocity",
      velocity2Calculation
    ),
    pressure2Equation: createLiveEquationModel(
      "Ideal section 2 absolute pressure",
      pressure2Calculation
    ),
    pressure1DisplayConversion,
    pressure2DisplayConversion,
    simulationState,
    visualState: adaptBernoulliVisualState(
      simulationState,
      input,
      pressure1DisplayConversion.calculatedValue,
      pressure2DisplayConversion.calculatedValue,
      pressureRelation
    ),
    pressureReadings,
    velocityChallenge: evaluateChallenge(BERNOULLI_VELOCITY_CHALLENGE, {
      velocity2Mps
    }),
    velocityDifferenceMps: velocity2Mps - BERNOULLI_VELOCITY_TARGET_MPS,
    pressureRelation
  };
}

export function constrainBernoulliInput(
  field: keyof BernoulliFlowLessonInput,
  value: number
) {
  const range = BERNOULLI_FLOW_LESSON_LIMITS[field];
  if (!Number.isFinite(value)) {
    return { value: null, message: `${inputLabel(field)} must be a finite number.` };
  }

  const constrained = Math.min(range.max, Math.max(range.min, value));
  return {
    value: constrained,
    message:
      constrained === value
        ? null
        : `${inputLabel(field)} was constrained to the educational range ${range.min} to ${range.max}.`
  };
}

export function evaluatePressurePrediction(
  prediction: PressurePrediction | null,
  actual: PressurePrediction | null
) {
  return {
    complete: prediction !== null && actual !== null && prediction === actual,
    answered: prediction !== null,
    actual
  };
}

export function scaleOutletDiameterForDisplay(diameterMm: number) {
  const range = BERNOULLI_FLOW_LESSON_LIMITS.outletDiameterMm;
  return Math.min(1, Math.max(0, (diameterMm - range.min) / (range.max - range.min)));
}

function adaptBernoulliVisualState(
  state: SimulationState,
  input: BernoulliFlowLessonInput,
  pressure1KPa: number,
  pressure2KPa: number,
  pressureRelation: PressurePrediction
): VisualOperatingState<BernoulliVisualExtension> {
  const velocity1 = state.outputs.velocity1 ?? 0;
  const velocity2 = state.outputs.velocity2 ?? 0;
  const extension: BernoulliVisualExtension = {
    diameterRatio: scaleOutletDiameterForDisplay(input.outletDiameterMm),
    flowMagnitudeNormalized:
      input.flowRateLps / BERNOULLI_FLOW_LESSON_LIMITS.flowRateLps.max,
    pressureRelation
  };

  return {
    status: state.validity.status === "invalid" ? "invalid" : "idle",
    summary: `${input.flowRateLps.toLocaleString()} litres per second passes a 60 millimetre section and a ${input.outletDiameterMm.toLocaleString()} millimetre section. Average velocity changes from ${velocity1.toFixed(2)} to ${velocity2.toFixed(2)} metres per second, while ideal absolute pressure changes from ${pressure1KPa.toFixed(1)} to ${pressure2KPa.toFixed(1)} kilopascals.`,
    components: {
      "COMP-FLUID-BERNOULLI-SECTION-1": {
        componentId: "COMP-FLUID-BERNOULLI-SECTION-1",
        active: true,
        direction: "forward",
        pressure: { value: pressure1KPa, unit: "kPa", validity: "valid" },
        velocity: { value: velocity1, unit: "m/s", validity: "valid" },
        measured: true,
        semantics: ["active", "measurement"],
        extension
      },
      "COMP-FLUID-BERNOULLI-CONTRACTION": {
        componentId: "COMP-FLUID-BERNOULLI-CONTRACTION",
        active: true,
        direction: "forward",
        semantics: ["active"],
        extension
      },
      "COMP-FLUID-BERNOULLI-SECTION-2": {
        componentId: "COMP-FLUID-BERNOULLI-SECTION-2",
        active: true,
        direction: "forward",
        pressure: { value: pressure2KPa, unit: "kPa", validity: "valid" },
        velocity: { value: velocity2, unit: "m/s", validity: "valid" },
        measured: true,
        semantics: ["active", "measurement"],
        extension
      }
    }
  };
}

function validateBernoulliFlowLessonInput(input: BernoulliFlowLessonInput) {
  const errors: string[] = [];
  for (const field of ["flowRateLps", "outletDiameterMm"] as const) {
    const value = input[field];
    const range = BERNOULLI_FLOW_LESSON_LIMITS[field];
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

function invalidLessonModel(
  input: BernoulliFlowLessonInput,
  errors: string[]
): BernoulliFlowLessonModel {
  return {
    input,
    validity: { status: "invalid", errors },
    flowRateConversion: null,
    outletDiameterConversion: null,
    area1Calculation: null,
    area2Calculation: null,
    velocity1Calculation: null,
    velocity2Calculation: null,
    pressure2Calculation: null,
    velocity2Equation: null,
    pressure2Equation: null,
    pressure1DisplayConversion: null,
    pressure2DisplayConversion: null,
    simulationState: null,
    visualState: null,
    pressureReadings: [],
    velocityChallenge: evaluateChallenge(BERNOULLI_VELOCITY_CHALLENGE, {}),
    velocityDifferenceMps: null,
    pressureRelation: null
  };
}

function comparePressure(pressure2: number, pressure1: number): PressurePrediction {
  const tolerance = Math.max(Math.abs(pressure1), 1) * 1e-10;
  return Math.abs(pressure2 - pressure1) <= tolerance
    ? "same"
    : pressure2 > pressure1
      ? "higher"
      : "lower";
}

function inputLabel(field: keyof BernoulliFlowLessonInput) {
  return field === "flowRateLps" ? "Flow rate" : "Section 2 diameter";
}

function nearlyEqual(left: number, right: number) {
  const scale = Math.max(1, Math.abs(left), Math.abs(right));
  return Math.abs(left - right) <= scale * Number.EPSILON * 16;
}

function createLiveEquationModel<Unit extends string>(
  name: string,
  result: EngineeringCalculationResult<Unit>
): LiveEquationModel<Unit> {
  const metadata = getEngineeringEquationMetadata(result.equationId);
  if (!metadata) {
    throw new Error(`Missing engineering equation metadata for ${result.equationId}.`);
  }

  return {
    name,
    expression: metadata.expression,
    symbols: metadata.symbols,
    result
  };
}
