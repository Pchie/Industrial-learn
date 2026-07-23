import {
  forceFromPressureAndArea,
  getEngineeringEquationMetadata,
  type EngineeringCalculationResult
} from "@industrial-learn/engineering-core";

export type SimulationMode =
  "learn" | "guided" | "explore" | "fault-diagnosis" | "assessment";

export type SimulationStatus = "idle" | "running" | "paused" | "faulted";

export type ReviewStatus =
  | "Draft"
  | "Source required"
  | "Source checked"
  | "Equation checked"
  | "Simulation checked"
  | "Engineering review required"
  | "Approved for student use";

export type SimulationInputDefinition = {
  id: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  defaultValue: number;
};

export type SimulationOutputDefinition = {
  id: string;
  label: string;
  unit: string;
};

export type OperatingStateDefinition = {
  id: string;
  label: string;
  description: string;
};

export type FaultModeDefinition = {
  id: string;
  label: string;
  description: string;
  alarmMessage: string;
};

export type VirtualInstrumentType =
  | "pressure-gauge"
  | "flow-meter"
  | "thermometer"
  | "voltmeter"
  | "ammeter"
  | "digital-status-display";

export type VirtualInstrumentDefinition = {
  id: string;
  type: VirtualInstrumentType;
  label: string;
  measurementId: string;
  unit: string;
};

export type Measurement = {
  id: string;
  label: string;
  value: number;
  unit: string;
  instrumentType: VirtualInstrumentType;
  diagnostic: boolean;
};

export type SimulationEvent = {
  timeSeconds: number;
  type:
    | "created"
    | "started"
    | "paused"
    | "reset"
    | "speed-changed"
    | "input-changed"
    | "fault-injected"
    | "fault-cleared"
    | "stepped"
    | "invalid-input"
    | "assessment-scored";
  message: string;
};

export type SimulationDefinition = {
  simulationId: string;
  title: string;
  discipline: string;
  lessonIds: string[];
  knowledgeFileIds: string[];
  sourceIds: string[];
  modes: SimulationMode[];
  inputs: SimulationInputDefinition[];
  outputs: SimulationOutputDefinition[];
  equations: Array<{
    equationId: string;
    purpose: string;
    sourceIds: string[];
    reviewStatus: ReviewStatus;
  }>;
  operatingStates: OperatingStateDefinition[];
  faultModes: FaultModeDefinition[];
  instruments: VirtualInstrumentDefinition[];
  validityAssumptions: string[];
  inputRanges: Array<{ inputId: string; min: number; max: number; unit: string }>;
  safetyLimitations: string[];
  visualRepresentation: {
    type: "schematic";
    description: string;
    measurementIds: string[];
  };
  learningInstructions: string[];
  assessment: {
    prompt: string;
    expectedOutputId: string;
    toleranceFraction: number;
  };
  testCases: Array<{ id: string; description: string }>;
  reviewStatus: ReviewStatus;
};

export type SimulationModelResult = {
  outputs: Record<string, number>;
  measurements: Measurement[];
  diagnosticMeasurements: Measurement[];
  alarms: string[];
  calculation: EngineeringCalculationResult<string>;
  calculationExplanation: string[];
  resultsInterpretation: string;
};

export type SimulationState = {
  definition: SimulationDefinition;
  mode: SimulationMode;
  status: SimulationStatus;
  elapsedTimeSeconds: number;
  speedMultiplier: number;
  inputs: Record<string, number>;
  outputs: Record<string, number>;
  liveMeasurements: Measurement[];
  diagnosticMeasurements: Measurement[];
  alarms: string[];
  eventHistory: SimulationEvent[];
  activeFaultIds: string[];
  calculationExplanation: string[];
  resultsInterpretation: string;
  assessmentScore: number | null;
  validity: {
    status: "valid" | "invalid";
    errors: string[];
  };
};

export type SimulationRuntime = {
  definition: SimulationDefinition;
  createInitialState: (mode?: SimulationMode) => SimulationState;
  start: (state: SimulationState) => SimulationState;
  pause: (state: SimulationState) => SimulationState;
  reset: (state: SimulationState) => SimulationState;
  changeSpeed: (state: SimulationState, speedMultiplier: number) => SimulationState;
  updateInput: (
    state: SimulationState,
    inputId: string,
    value: number
  ) => SimulationState;
  injectFault: (state: SimulationState, faultId: string) => SimulationState;
  clearFault: (state: SimulationState, faultId: string) => SimulationState;
  step: (state: SimulationState, deltaTimeSeconds: number) => SimulationState;
  scoreAssessment: (state: SimulationState, submittedValue: number) => SimulationState;
};

export const sharedVirtualInstruments: VirtualInstrumentDefinition[] = [
  {
    id: "instrument-pressure-gauge",
    type: "pressure-gauge",
    label: "Pressure gauge",
    measurementId: "pressure",
    unit: "Pa"
  },
  {
    id: "instrument-flow-meter",
    type: "flow-meter",
    label: "Flow meter",
    measurementId: "flowRate",
    unit: "m^3/s"
  },
  {
    id: "instrument-thermometer",
    type: "thermometer",
    label: "Thermometer",
    measurementId: "temperature",
    unit: "K"
  },
  {
    id: "instrument-voltmeter",
    type: "voltmeter",
    label: "Voltmeter",
    measurementId: "voltage",
    unit: "V"
  },
  {
    id: "instrument-ammeter",
    type: "ammeter",
    label: "Ammeter",
    measurementId: "current",
    unit: "A"
  },
  {
    id: "instrument-status-display",
    type: "digital-status-display",
    label: "Digital status display",
    measurementId: "statusCode",
    unit: "state"
  }
];

export const hydraulicCylinderForceSimulationDefinition: SimulationDefinition = {
  simulationId: "SIM-HYD-CYL-FORCE-001",
  title: "Hydraulic Cylinder Force",
  discipline: "Fluid mechanics",
  lessonIds: ["LES-FLUID-PRESSURE-001"],
  knowledgeFileIds: ["KF-HYD-CYL-FORCE-001", "KF-FLUID-PRESSURE-FUNDAMENTALS-001"],
  sourceIds: ["SRC-HYDRAULIC-CYLINDER-PLACEHOLDER-001"],
  modes: ["learn", "guided", "explore", "fault-diagnosis", "assessment"],
  inputs: [
    {
      id: "pressure",
      label: "Cylinder pressure",
      unit: "Pa",
      min: 0,
      max: 20_000_000,
      defaultValue: 1_000_000
    },
    {
      id: "pistonArea",
      label: "Piston area",
      unit: "m^2",
      min: 0.0001,
      max: 0.1,
      defaultValue: 0.01
    }
  ],
  outputs: [{ id: "cylinderForce", label: "Cylinder force", unit: "N" }],
  equations: [
    {
      equationId: "EQ-FLUID-FORCE-PRESSURE-AREA-001",
      purpose: "Calculate cylinder extension force from pressure and piston area.",
      sourceIds: ["SRC-HYDRAULIC-CYLINDER-PLACEHOLDER-001"],
      reviewStatus: "Source required"
    }
  ],
  operatingStates: [
    {
      id: "idle",
      label: "Idle",
      description: "Simulation is ready but not progressing."
    },
    {
      id: "running",
      label: "Running",
      description: "Simulation advances with time progression."
    },
    {
      id: "paused",
      label: "Paused",
      description: "State is held without time progression."
    },
    {
      id: "faulted",
      label: "Faulted",
      description: "One or more injected faults affect measurements or outputs."
    }
  ],
  faultModes: [
    {
      id: "pressure-loss",
      label: "Pressure loss",
      description:
        "Effective cylinder pressure is reduced to 60 percent of the commanded pressure.",
      alarmMessage: "Pressure loss fault active: calculated force is reduced."
    },
    {
      id: "gauge-stuck",
      label: "Gauge stuck",
      description:
        "Pressure gauge remains at the initial pressure while diagnostic pressure shows actual pressure.",
      alarmMessage: "Pressure gauge fault active: compare gauge and diagnostic pressure."
    },
    {
      id: "seal-leak",
      label: "Seal leak",
      description:
        "Cylinder force is reduced by 25 percent while pressure still appears available.",
      alarmMessage: "Seal leak fault active: force is below the pressure-area prediction."
    }
  ],
  instruments: [
    {
      id: "hyd-pressure-gauge",
      type: "pressure-gauge",
      label: "Cylinder pressure gauge",
      measurementId: "pressure",
      unit: "Pa"
    },
    {
      id: "hyd-flow-meter",
      type: "flow-meter",
      label: "Training flow meter",
      measurementId: "flowRate",
      unit: "m^3/s"
    },
    {
      id: "hyd-thermometer",
      type: "thermometer",
      label: "Fluid thermometer",
      measurementId: "temperature",
      unit: "K"
    },
    {
      id: "hyd-force-display",
      type: "digital-status-display",
      label: "Force display",
      measurementId: "cylinderForce",
      unit: "N"
    }
  ],
  validityAssumptions: [
    "Pressure is uniform over the effective piston area.",
    "Inputs are explicit SI values.",
    "Fault reductions are training behaviours and are not manufacturer diagnostic data."
  ],
  inputRanges: [
    { inputId: "pressure", min: 0, max: 20_000_000, unit: "Pa" },
    { inputId: "pistonArea", min: 0.0001, max: 0.1, unit: "m^2" }
  ],
  safetyLimitations: [
    "Simulation ranges are training boundaries, not equipment ratings.",
    "The simulation does not authorise work on pressurised hydraulic equipment.",
    "The simulation remains Source required until equation and safety evidence are reviewed."
  ],
  visualRepresentation: {
    type: "schematic",
    description:
      "Hydraulic cylinder schematic with pressure input, piston area, and force output callouts.",
    measurementIds: ["pressure", "pistonArea", "cylinderForce"]
  },
  learningInstructions: [
    "Set pressure and piston area using SI units.",
    "Start the simulation to calculate live cylinder force.",
    "Use fault diagnosis mode to compare gauge readings, diagnostic measurements, and force output."
  ],
  assessment: {
    prompt:
      "Calculate the expected cylinder force from the current pressure and piston area.",
    expectedOutputId: "cylinderForce",
    toleranceFraction: 0.02
  },
  testCases: [
    {
      id: "initial-state",
      description: "Initial state uses default SI inputs and idle status."
    },
    {
      id: "normal-operation",
      description: "Running state calculates force from pressure and piston area."
    },
    {
      id: "fault-pressure-loss",
      description: "Pressure loss reduces calculated force and raises an alarm."
    },
    {
      id: "fault-gauge-stuck",
      description:
        "Gauge reading differs from diagnostic pressure after pressure changes."
    },
    {
      id: "fault-seal-leak",
      description: "Seal leak reduces output force and raises an alarm."
    }
  ],
  reviewStatus: "Source required"
};

export const hydraulicCylinderForceSimulation = createSimulationRuntime(
  hydraulicCylinderForceSimulationDefinition,
  calculateHydraulicCylinderForce
);

export const simulationRegistry = new Map<string, SimulationRuntime>([
  [
    hydraulicCylinderForceSimulation.definition.simulationId,
    hydraulicCylinderForceSimulation
  ]
]);

export function getSimulation(simulationId: string) {
  return simulationRegistry.get(simulationId);
}

export function validateSimulationTraceability(definition: SimulationDefinition) {
  const errors: string[] = [];

  for (const equation of definition.equations) {
    const metadata = getEngineeringEquationMetadata(equation.equationId);

    if (!metadata) {
      errors.push(`Simulation equation ${equation.equationId} has no metadata.`);
      continue;
    }

    if (equation.sourceIds.length === 0 || metadata.sourceIds.length === 0) {
      errors.push(`Simulation equation ${equation.equationId} requires source IDs.`);
    }

    if (
      definition.reviewStatus === "Approved for student use" &&
      (equation.reviewStatus !== "Equation checked" ||
        metadata.engineeringReviewStatus !== "Approved for student use")
    ) {
      errors.push(
        `Simulation ${definition.simulationId} cannot be approved while ${equation.equationId} is not fully reviewed.`
      );
    }
  }

  if (definition.validityAssumptions.length === 0) {
    errors.push(`Simulation ${definition.simulationId} requires validity assumptions.`);
  }

  if (definition.inputRanges.length !== definition.inputs.length) {
    errors.push(`Simulation ${definition.simulationId} requires input ranges.`);
  }

  if (definition.safetyLimitations.length === 0) {
    errors.push(`Simulation ${definition.simulationId} requires safety limitations.`);
  }

  return { errors };
}

export function createSimulationRuntime(
  definition: SimulationDefinition,
  model: (state: SimulationState) => SimulationModelResult
): SimulationRuntime {
  function createInitialState(mode: SimulationMode = "learn"): SimulationState {
    const inputs = Object.fromEntries(
      definition.inputs.map((input) => [input.id, input.defaultValue])
    );
    const baseState = appendEvent(
      {
        definition,
        mode,
        status: "idle",
        elapsedTimeSeconds: 0,
        speedMultiplier: 1,
        inputs,
        outputs: {},
        liveMeasurements: [],
        diagnosticMeasurements: [],
        alarms: [],
        eventHistory: [],
        activeFaultIds: [],
        calculationExplanation: [],
        resultsInterpretation: "",
        assessmentScore: null,
        validity: { status: "valid", errors: [] }
      },
      "created",
      "Simulation created."
    );

    return recalculate(baseState);
  }

  function start(state: SimulationState): SimulationState {
    const checkedState = recalculate(state);

    if (checkedState.validity.status === "invalid") {
      return appendEvent(
        checkedState,
        "invalid-input",
        "Simulation cannot start with invalid inputs."
      );
    }

    return recalculate(
      appendEvent(
        {
          ...checkedState,
          status: checkedState.activeFaultIds.length > 0 ? "faulted" : "running"
        },
        "started",
        "Simulation started."
      )
    );
  }

  function pause(state: SimulationState): SimulationState {
    return appendEvent({ ...state, status: "paused" }, "paused", "Simulation paused.");
  }

  function reset(state: SimulationState): SimulationState {
    return appendEvent(
      createInitialState(state.mode),
      "reset",
      "Simulation reset to default inputs."
    );
  }

  function changeSpeed(state: SimulationState, speedMultiplier: number): SimulationState {
    if (
      !Number.isFinite(speedMultiplier) ||
      speedMultiplier <= 0 ||
      speedMultiplier > 10
    ) {
      return {
        ...appendEvent(
          state,
          "invalid-input",
          "Simulation speed must be greater than zero and no more than 10."
        ),
        validity: {
          status: "invalid",
          errors: ["Simulation speed must be greater than zero and no more than 10."]
        }
      };
    }

    return appendEvent(
      { ...state, speedMultiplier, validity: { status: "valid", errors: [] } },
      "speed-changed",
      `Simulation speed changed to ${speedMultiplier}.`
    );
  }

  function updateInput(
    state: SimulationState,
    inputId: string,
    value: number
  ): SimulationState {
    if (!definition.inputs.some((input) => input.id === inputId)) {
      return invalidInputState(state, `Unknown simulation input ${inputId}.`);
    }

    return recalculate(
      appendEvent(
        { ...state, inputs: { ...state.inputs, [inputId]: value } },
        "input-changed",
        `${inputId} changed to ${value}.`
      )
    );
  }

  function injectFault(state: SimulationState, faultId: string): SimulationState {
    if (!definition.faultModes.some((fault) => fault.id === faultId)) {
      return invalidInputState(state, `Unknown fault mode ${faultId}.`);
    }

    const activeFaultIds = state.activeFaultIds.includes(faultId)
      ? state.activeFaultIds
      : [...state.activeFaultIds, faultId];

    return recalculate(
      appendEvent(
        { ...state, activeFaultIds, status: "faulted" },
        "fault-injected",
        `Fault injected: ${faultId}.`
      )
    );
  }

  function clearFault(state: SimulationState, faultId: string): SimulationState {
    const activeFaultIds = state.activeFaultIds.filter(
      (activeFaultId) => activeFaultId !== faultId
    );
    const status =
      state.status === "faulted" && activeFaultIds.length === 0
        ? "running"
        : state.status;

    return recalculate(
      appendEvent(
        { ...state, activeFaultIds, status },
        "fault-cleared",
        `Fault cleared: ${faultId}.`
      )
    );
  }

  function step(state: SimulationState, deltaTimeSeconds: number): SimulationState {
    if (!Number.isFinite(deltaTimeSeconds) || deltaTimeSeconds < 0) {
      return invalidInputState(state, "Time step must be a finite non-negative value.");
    }

    if (state.status !== "running" && state.status !== "faulted") {
      return state;
    }

    return recalculate(
      appendEvent(
        {
          ...state,
          elapsedTimeSeconds:
            state.elapsedTimeSeconds + deltaTimeSeconds * state.speedMultiplier
        },
        "stepped",
        `Simulation advanced by ${deltaTimeSeconds} seconds.`
      )
    );
  }

  function scoreAssessment(
    state: SimulationState,
    submittedValue: number
  ): SimulationState {
    if (state.validity.status === "invalid" || !Number.isFinite(submittedValue)) {
      return invalidInputState(
        state,
        "Assessment requires a valid finite submitted value."
      );
    }

    const expected = state.outputs[definition.assessment.expectedOutputId];
    if (expected === undefined) {
      return invalidInputState(state, "Assessment expected output is not available.");
    }

    const tolerance = Math.max(
      Math.abs(expected) * definition.assessment.toleranceFraction,
      1e-9
    );
    const score = Math.abs(submittedValue - expected) <= tolerance ? 1 : 0;

    return appendEvent(
      { ...state, assessmentScore: score },
      "assessment-scored",
      `Assessment scored ${score}.`
    );
  }

  function recalculate(state: SimulationState): SimulationState {
    const validationErrors = validateInputs(definition, state.inputs);

    if (validationErrors.length > 0) {
      return {
        ...appendEvent(state, "invalid-input", "Simulation input validation failed."),
        outputs: {},
        liveMeasurements: [],
        diagnosticMeasurements: [],
        alarms: [],
        calculationExplanation: [],
        resultsInterpretation:
          "Inputs must be corrected before the simulation can calculate results.",
        validity: { status: "invalid", errors: validationErrors }
      };
    }

    const result = model(state);
    const calculationErrors = result.calculation.validity.errors;

    return {
      ...state,
      outputs: result.outputs,
      liveMeasurements: result.measurements,
      diagnosticMeasurements: result.diagnosticMeasurements,
      alarms: result.alarms,
      calculationExplanation: result.calculationExplanation,
      resultsInterpretation: result.resultsInterpretation,
      validity:
        result.calculation.validity.status === "valid"
          ? { status: "valid", errors: [] }
          : { status: "invalid", errors: calculationErrors }
    };
  }

  return {
    definition,
    createInitialState,
    start,
    pause,
    reset,
    changeSpeed,
    updateInput,
    injectFault,
    clearFault,
    step,
    scoreAssessment
  };
}

function calculateHydraulicCylinderForce(state: SimulationState): SimulationModelResult {
  const pressure = requireInput(state, "pressure");
  const pistonArea = requireInput(state, "pistonArea");
  const pressureLossActive = state.activeFaultIds.includes("pressure-loss");
  const gaugeStuckActive = state.activeFaultIds.includes("gauge-stuck");
  const sealLeakActive = state.activeFaultIds.includes("seal-leak");
  const effectivePressure = pressureLossActive ? pressure * 0.6 : pressure;
  const baseCalculation = forceFromPressureAndArea({
    pressure: { value: effectivePressure, unit: "Pa" },
    area: { value: pistonArea, unit: "m^2" }
  }) as EngineeringCalculationResult<string>;
  const baseForce = baseCalculation.calculatedValue ?? 0;
  const cylinderForce = sealLeakActive ? baseForce * 0.75 : baseForce;
  const alarms = hydraulicCylinderAlarms(state);
  const displayedPressure = gaugeStuckActive
    ? (state.definition.inputs[0]?.defaultValue ?? pressure)
    : pressure;

  return {
    outputs: { cylinderForce },
    measurements: [
      {
        id: "pressure",
        label: "Cylinder pressure gauge",
        value: displayedPressure,
        unit: "Pa",
        instrumentType: "pressure-gauge",
        diagnostic: false
      },
      {
        id: "flowRate",
        label: "Training flow meter",
        value: state.status === "running" || state.status === "faulted" ? 0.001 : 0,
        unit: "m^3/s",
        instrumentType: "flow-meter",
        diagnostic: false
      },
      {
        id: "temperature",
        label: "Fluid temperature",
        value: 293.15,
        unit: "K",
        instrumentType: "thermometer",
        diagnostic: false
      },
      {
        id: "cylinderForce",
        label: "Cylinder force display",
        value: cylinderForce,
        unit: "N",
        instrumentType: "digital-status-display",
        diagnostic: false
      }
    ],
    diagnosticMeasurements: [
      {
        id: "diagnosticPressure",
        label: "Diagnostic pressure",
        value: pressure,
        unit: "Pa",
        instrumentType: "pressure-gauge",
        diagnostic: true
      },
      {
        id: "effectivePressure",
        label: "Effective pressure used for force calculation",
        value: effectivePressure,
        unit: "Pa",
        instrumentType: "pressure-gauge",
        diagnostic: true
      }
    ],
    alarms,
    calculation: baseCalculation,
    calculationExplanation: [
      ...baseCalculation.calculationSteps,
      ...(sealLeakActive ? ["Seal leak fault multiplies calculated force by 0.75."] : [])
    ],
    resultsInterpretation:
      alarms.length > 0
        ? "Fault diagnosis is required before interpreting this result as normal cylinder force."
        : "Cylinder force follows the pressure-area calculation under the stated assumptions."
  };
}

function hydraulicCylinderAlarms(state: SimulationState) {
  return state.activeFaultIds
    .map(
      (faultId) =>
        state.definition.faultModes.find((fault) => fault.id === faultId)?.alarmMessage
    )
    .filter((message): message is string => Boolean(message));
}

function validateInputs(
  definition: SimulationDefinition,
  inputs: Record<string, number>
) {
  const errors: string[] = [];

  for (const input of definition.inputs) {
    const value = inputs[input.id];

    if (value === undefined) {
      errors.push(`${input.id} is required.`);
      continue;
    }

    if (!Number.isFinite(value)) {
      errors.push(`${input.id} must be a finite number.`);
      continue;
    }

    if (value < input.min || value > input.max) {
      errors.push(
        `${input.id} must be between ${input.min} and ${input.max} ${input.unit}.`
      );
    }
  }

  return errors;
}

function requireInput(state: SimulationState, inputId: string) {
  const value = state.inputs[inputId];

  if (value === undefined) {
    throw new Error(`Simulation input ${inputId} is missing after validation.`);
  }

  return value;
}

function appendEvent(
  state: SimulationState,
  type: SimulationEvent["type"],
  message: string
): SimulationState {
  return {
    ...state,
    eventHistory: [
      ...state.eventHistory,
      { timeSeconds: state.elapsedTimeSeconds, type, message }
    ]
  };
}

function invalidInputState(state: SimulationState, error: string): SimulationState {
  return {
    ...appendEvent(state, "invalid-input", error),
    validity: { status: "invalid", errors: [error] }
  };
}
