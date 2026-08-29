import {
  bernoulliPressureAtPoint2,
  circularAreaFromDiameter,
  forceFromPressureAndArea,
  fluidVelocity,
  getEngineeringEquationMetadata,
  pressureHead,
  totalBernoulliHead,
  velocityHead,
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
  options?: Array<{
    value: number;
    label: string;
    description: string;
  }>;
};

export type SimulationOutputDefinition = {
  id: string;
  label: string;
  unit: string;
  valueLabels?: Record<string, string>;
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
  supportsTimeProgression: boolean;
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
  assessment?: {
    prompt: string;
    expectedOutputId: string;
    toleranceFraction: number;
    answerLabel: string;
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
  lessonIds: ["LES-FLUID-PRESSURE-001", "LES-HYD-CYL-FORCE-VISUAL-001"],
  knowledgeFileIds: ["KF-HYD-CYL-FORCE-001", "KF-FLUID-PRESSURE-FUNDAMENTALS-001"],
  sourceIds: ["SRC-PARKER-140H8-CYLINDER-2024"],
  modes: ["learn", "guided", "explore", "fault-diagnosis", "assessment"],
  supportsTimeProgression: true,
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
      sourceIds: ["SRC-PARKER-140H8-CYLINDER-2024"],
      reviewStatus: "Equation checked"
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
    "The fixed fault percentages and input ranges require independent evidence before Simulation checked status."
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
    toleranceFraction: 0.02,
    answerLabel: "Submitted cylinder force answer (N)"
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
  reviewStatus: "Equation checked"
};

export const hydraulicCylinderForceSimulation = createSimulationRuntime(
  hydraulicCylinderForceSimulationDefinition,
  calculateHydraulicCylinderForce
);

export const thermodynamicSystemBoundarySimulationDefinition: SimulationDefinition = {
  simulationId: "sim-core-thermal-system-001",
  title: "Thermal System Boundary Simulation",
  discipline: "Thermodynamics",
  lessonIds: ["LES-THERMO-SYSTEMS-SURROUNDINGS-001"],
  knowledgeFileIds: ["KF-THERMO-SYSTEMS-SURROUNDINGS-001"],
  sourceIds: [
    "SRC-PURDUE-ME200-THERMO-DEFINITIONS-2021",
    "SRC-OPENSTAX-COLLEGE-PHYSICS-2012"
  ],
  modes: ["learn", "guided", "explore", "fault-diagnosis"],
  supportsTimeProgression: false,
  inputs: [
    {
      id: "massCrossing",
      label: "Mass crossing the selected boundary",
      unit: "selection",
      min: 0,
      max: 1,
      defaultValue: 0,
      options: [
        {
          value: 0,
          label: "Mass does not cross",
          description: "The selected boundary does not permit mass transfer."
        },
        {
          value: 1,
          label: "Mass may cross",
          description: "The selected boundary permits mass transfer."
        }
      ]
    },
    {
      id: "energyCrossing",
      label: "Energy crossing the selected boundary",
      unit: "selection",
      min: 0,
      max: 1,
      defaultValue: 1,
      options: [
        {
          value: 0,
          label: "Energy does not cross",
          description: "The selected boundary does not permit energy transfer."
        },
        {
          value: 1,
          label: "Energy may cross",
          description: "The selected boundary permits energy transfer."
        }
      ]
    }
  ],
  outputs: [
    {
      id: "classificationCode",
      label: "System classification",
      unit: "classification",
      valueLabels: {
        "0": "Indeterminate",
        "1": "Open system or control volume",
        "2": "Closed system or control mass",
        "3": "Isolated system"
      }
    }
  ],
  equations: [],
  operatingStates: [
    {
      id: "idle",
      label: "Ready",
      description: "The boundary selections are ready for classification."
    },
    {
      id: "running",
      label: "Classified",
      description: "The selected boundary is classified from the permitted crossings."
    },
    {
      id: "paused",
      label: "Held",
      description: "The current classification is held for inspection."
    },
    {
      id: "faulted",
      label: "Boundary inconsistent",
      description: "The selected system or boundary changed during the analysis."
    }
  ],
  faultModes: [
    {
      id: "boundary-shift",
      label: "Boundary changed mid-analysis",
      description:
        "The selected system boundary changes before classification is complete.",
      alarmMessage:
        "Boundary consistency fault: restate one system and boundary before classifying it."
    }
  ],
  instruments: [
    {
      id: "thermo-classification-display",
      type: "digital-status-display",
      label: "System classification display",
      measurementId: "classificationCode",
      unit: "classification"
    }
  ],
  validityAssumptions: [
    "One selected system and boundary are stated before classification.",
    "Crossing selections describe what may cross that stated boundary.",
    "No property value, process equation, equipment rating, or operating limit is inferred."
  ],
  inputRanges: [
    { inputId: "massCrossing", min: 0, max: 1, unit: "selection" },
    { inputId: "energyCrossing", min: 0, max: 1, unit: "selection" }
  ],
  safetyLimitations: [
    "System classification does not authorise operation, opening, heating, or pressurisation of real equipment.",
    "The activity contains no steam, refrigerant, material-property, pressure-limit, or temperature-limit data.",
    "Independent thermodynamics, educational, and safety review remain required before student-use approval."
  ],
  visualRepresentation: {
    type: "schematic",
    description:
      "Selected thermodynamic system inside a stated boundary, with mass and energy crossing states shown against the surroundings.",
    measurementIds: ["classificationCode"]
  },
  learningInstructions: [
    "State one selected system and boundary.",
    "Choose whether mass and energy may cross that boundary.",
    "Start the activity and compare the visual crossings with the system classification.",
    "Use fault diagnosis mode to identify why changing the boundary makes the classification indeterminate."
  ],
  testCases: [
    {
      id: "initial-closed-state",
      description: "Default selections classify a closed system."
    },
    {
      id: "open-boundary-state",
      description: "Permitted mass crossing classifies an open system."
    },
    {
      id: "isolated-boundary-state",
      description: "No mass or energy crossing classifies an isolated system."
    },
    {
      id: "fault-boundary-shift",
      description: "Changing the selected boundary makes classification indeterminate."
    },
    {
      id: "invalid-discrete-input",
      description: "Undeclared crossing options are rejected."
    }
  ],
  reviewStatus: "Engineering review required"
};

export const thermodynamicSystemBoundarySimulation = createSimulationRuntime(
  thermodynamicSystemBoundarySimulationDefinition,
  calculateThermodynamicSystemBoundary
);

export const BERNOULLI_FLOW_MODEL_PARAMETERS = {
  inletDiameterM: 0.06,
  inletAbsolutePressurePa: 250_000,
  densityKgPerM3: 1_000,
  elevation1M: 0,
  elevation2M: 0,
  gravitationalAccelerationMPerS2: 9.81
} as const;

export const bernoulliFlowSimulationDefinition: SimulationDefinition = {
  simulationId: "SIM-FLUID-BERNOULLI-FLOW-001",
  title: "Bernoulli Flow Lab",
  discipline: "Fluid mechanics",
  lessonIds: ["LES-FLUID-BERNOULLI-VISUAL-001"],
  knowledgeFileIds: ["KF-FLUID-BERNOULLI-001"],
  sourceIds: ["SRC-OPENSTAX-COLLEGE-PHYSICS-2E-2022", "SRC-NASA-GLENN-BERNOULLI"],
  modes: ["learn", "guided", "explore"],
  supportsTimeProgression: false,
  inputs: [
    {
      id: "flowRate",
      label: "Volumetric flow rate",
      unit: "m^3/s",
      min: 0.001,
      max: 0.006,
      defaultValue: 0.003
    },
    {
      id: "outletDiameter",
      label: "Section 2 diameter",
      unit: "m",
      min: 0.02,
      max: 0.06,
      defaultValue: 0.03
    }
  ],
  outputs: [
    { id: "area1", label: "Section 1 area", unit: "m^2" },
    { id: "area2", label: "Section 2 area", unit: "m^2" },
    { id: "velocity1", label: "Section 1 average velocity", unit: "m/s" },
    { id: "velocity2", label: "Section 2 average velocity", unit: "m/s" },
    { id: "pressure1", label: "Section 1 absolute pressure", unit: "Pa" },
    { id: "pressure2", label: "Section 2 absolute pressure", unit: "Pa" },
    { id: "pressureHead1", label: "Section 1 pressure head", unit: "m" },
    { id: "pressureHead2", label: "Section 2 pressure head", unit: "m" },
    { id: "velocityHead1", label: "Section 1 velocity head", unit: "m" },
    { id: "velocityHead2", label: "Section 2 velocity head", unit: "m" },
    { id: "totalHead1", label: "Section 1 total ideal head", unit: "m" },
    { id: "totalHead2", label: "Section 2 total ideal head", unit: "m" }
  ],
  equations: [
    {
      equationId: "EQ-GEOMETRY-CIRCULAR-AREA-DIAMETER-001",
      purpose: "Calculate each circular pipe cross-sectional area.",
      sourceIds: ["SRC-OPENSTAX-COLLEGE-PHYSICS-2E-2022"],
      reviewStatus: "Engineering review required"
    },
    {
      equationId: "EQ-FLUID-VELOCITY-FLOW-AREA-001",
      purpose: "Calculate average velocity from volumetric flow rate and area.",
      sourceIds: ["SRC-OPENSTAX-COLLEGE-PHYSICS-2E-2022"],
      reviewStatus: "Engineering review required"
    },
    {
      equationId: "EQ-FLUID-CONTINUITY-INCOMPRESSIBLE-001",
      purpose: "Explain conservation of volumetric flow between the two sections.",
      sourceIds: ["SRC-OPENSTAX-COLLEGE-PHYSICS-2E-2022"],
      reviewStatus: "Engineering review required"
    },
    {
      equationId: "EQ-FLUID-BERNOULLI-TWO-POINT-001",
      purpose: "Calculate ideal downstream absolute pressure from the two-point state.",
      sourceIds: ["SRC-OPENSTAX-COLLEGE-PHYSICS-2E-2022", "SRC-NASA-GLENN-BERNOULLI"],
      reviewStatus: "Engineering review required"
    }
  ],
  operatingStates: [
    {
      id: "idle",
      label: "Ready",
      description: "The ideal flow state is calculated and held for inspection."
    },
    {
      id: "running",
      label: "Demonstrating",
      description:
        "Presentation cues may animate while the calculated state remains static."
    },
    {
      id: "paused",
      label: "Paused",
      description: "Presentation cues are paused; engineering outputs do not change."
    }
  ],
  faultModes: [],
  instruments: [
    {
      id: "bernoulli-pressure-1",
      type: "pressure-gauge",
      label: "Section 1 pressure gauge",
      measurementId: "pressure1",
      unit: "Pa"
    },
    {
      id: "bernoulli-pressure-2",
      type: "pressure-gauge",
      label: "Section 2 pressure gauge",
      measurementId: "pressure2",
      unit: "Pa"
    },
    {
      id: "bernoulli-flow-meter",
      type: "flow-meter",
      label: "Volumetric flow meter",
      measurementId: "flowRate",
      unit: "m^3/s"
    },
    {
      id: "bernoulli-velocity-1",
      type: "digital-status-display",
      label: "Section 1 velocity display",
      measurementId: "velocity1",
      unit: "m/s"
    },
    {
      id: "bernoulli-velocity-2",
      type: "digital-status-display",
      label: "Section 2 velocity display",
      measurementId: "velocity2",
      unit: "m/s"
    }
  ],
  validityAssumptions: [
    "Flow is steady, incompressible, and frictionless along the modelled path.",
    "The pipe is horizontal, so both elevation terms use the same zero reference.",
    "Density, gravitational acceleration, and inlet absolute pressure are fixed educational model parameters.",
    "No pump, turbine, heat-transfer, loss, turbulence, or cavitation term is included."
  ],
  inputRanges: [
    { inputId: "flowRate", min: 0.001, max: 0.006, unit: "m^3/s" },
    { inputId: "outletDiameter", min: 0.02, max: 0.06, unit: "m" }
  ],
  safetyLimitations: [
    "Interaction bounds are educational controls, not equipment ratings.",
    "The model does not establish safe pipe, pump, valve, or process operation.",
    "Independent engineering, educational, and safety review remain required before student-use approval."
  ],
  visualRepresentation: {
    type: "schematic",
    description:
      "Horizontal circular pipe contraction with two linked pressure points, velocity vectors, and ideal head terms.",
    measurementIds: ["pressure1", "pressure2", "flowRate", "velocity1", "velocity2"]
  },
  learningInstructions: [
    "Change flow rate or section 2 diameter within the educational range.",
    "Compare area, average velocity, and pressure at both measurement points.",
    "Use the ideal head display to connect continuity and Bernoulli's equation.",
    "Treat animated flow indicators as direction cues, not calculated particle trajectories."
  ],
  testCases: [
    {
      id: "initial-state",
      description: "Default SI inputs produce a valid horizontal two-section state."
    },
    {
      id: "diameter-boundaries",
      description: "Reviewed section 2 diameter bounds remain valid."
    },
    {
      id: "flow-boundaries",
      description: "Reviewed flow-rate bounds remain valid."
    },
    {
      id: "pressure-response",
      description: "A smaller section produces greater velocity and lower ideal pressure."
    },
    {
      id: "reset",
      description: "Reset restores the declared default inputs without false completion."
    }
  ],
  reviewStatus: "Engineering review required"
};

export const bernoulliFlowSimulation = createSimulationRuntime(
  bernoulliFlowSimulationDefinition,
  calculateBernoulliFlow
);

export const simulationRegistry = new Map<string, SimulationRuntime>([
  [
    hydraulicCylinderForceSimulation.definition.simulationId,
    hydraulicCylinderForceSimulation
  ],
  [
    thermodynamicSystemBoundarySimulation.definition.simulationId,
    thermodynamicSystemBoundarySimulation
  ],
  [bernoulliFlowSimulation.definition.simulationId, bernoulliFlowSimulation]
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

    if (!definition.supportsTimeProgression) {
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
    if (!definition.assessment) {
      return invalidInputState(state, "Assessment mode is not supported.");
    }

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

export function classifyThermodynamicSystemBoundary(input: {
  massCrossing: number;
  energyCrossing: number;
  boundaryConsistent: boolean;
}): EngineeringCalculationResult<"classification"> {
  const inputValues = {
    massCrossing: input.massCrossing,
    energyCrossing: input.energyCrossing,
    boundaryConsistent: input.boundaryConsistent ? "yes" : "no"
  };
  const errors: string[] = [];
  if (input.massCrossing !== 0 && input.massCrossing !== 1) {
    errors.push("Mass crossing must use a declared selection.");
  }
  if (input.energyCrossing !== 0 && input.energyCrossing !== 1) {
    errors.push("Energy crossing must use a declared selection.");
  }

  if (errors.length > 0) {
    return {
      calculatedValue: null,
      unit: "classification",
      inputValues,
      equationId: "RULE-THERMO-SYSTEM-BOUNDARY-001",
      calculationSteps: [],
      assumptions: ["One selected system and boundary remain consistent."],
      warnings: [],
      validity: { status: "invalid", errors }
    };
  }

  if (!input.boundaryConsistent) {
    return {
      calculatedValue: 0,
      unit: "classification",
      inputValues,
      equationId: "RULE-THERMO-SYSTEM-BOUNDARY-001",
      calculationSteps: [
        "The selected system or boundary changed during the analysis.",
        "Classification is indeterminate until one system and boundary are restated."
      ],
      assumptions: ["Classification applies to one stated system and boundary."],
      warnings: ["The boundary is inconsistent."],
      validity: { status: "valid", errors: [] }
    };
  }

  const classificationCode =
    input.massCrossing === 1 ? 1 : input.energyCrossing === 1 ? 2 : 3;
  const explanation =
    classificationCode === 1
      ? "Mass may cross the selected boundary, so the selected region is an open system or control volume."
      : classificationCode === 2
        ? "Mass does not cross but energy may cross the selected boundary, so the selected matter is a closed system or control mass."
        : "Neither mass nor energy crosses the selected boundary, so the selected system is isolated.";

  return {
    calculatedValue: classificationCode,
    unit: "classification",
    inputValues,
    equationId: "RULE-THERMO-SYSTEM-BOUNDARY-001",
    calculationSteps: [explanation],
    assumptions: [
      "One selected system and boundary remain consistent.",
      "Crossing selections describe what may cross the selected boundary."
    ],
    warnings: [
      "This classification does not provide property data, operating limits, or design approval."
    ],
    validity: { status: "valid", errors: [] }
  };
}

function calculateThermodynamicSystemBoundary(
  state: SimulationState
): SimulationModelResult {
  const massCrossing = requireInput(state, "massCrossing");
  const energyCrossing = requireInput(state, "energyCrossing");
  const boundaryConsistent = !state.activeFaultIds.includes("boundary-shift");
  const classification = classifyThermodynamicSystemBoundary({
    massCrossing,
    energyCrossing,
    boundaryConsistent
  });
  const classificationCode = classification.calculatedValue ?? 0;
  const alarms = state.activeFaultIds
    .map(
      (faultId) =>
        state.definition.faultModes.find((fault) => fault.id === faultId)?.alarmMessage
    )
    .filter((message): message is string => Boolean(message));

  return {
    outputs: { classificationCode },
    measurements: [
      {
        id: "classificationCode",
        label: "System classification",
        value: classificationCode,
        unit: "classification",
        instrumentType: "digital-status-display",
        diagnostic: false
      }
    ],
    diagnosticMeasurements: [],
    alarms,
    calculation: classification,
    calculationExplanation: classification.calculationSteps,
    resultsInterpretation:
      classificationCode === 0
        ? "Restate one selected system and boundary before interpreting crossings."
        : "The result classifies only the stated boundary and does not establish equipment behaviour or safety limits."
  };
}

function calculateBernoulliFlow(state: SimulationState): SimulationModelResult {
  const flowRate = requireInput(state, "flowRate");
  const outletDiameter = requireInput(state, "outletDiameter");
  const parameters = BERNOULLI_FLOW_MODEL_PARAMETERS;
  const area1 = circularAreaFromDiameter({
    diameter: { value: parameters.inletDiameterM, unit: "m" }
  });
  const area2 = circularAreaFromDiameter({
    diameter: { value: outletDiameter, unit: "m" }
  });
  const invalidArea = [area1, area2].find(
    (calculation) => calculation.calculatedValue === null
  );
  if (invalidArea) {
    return invalidBernoulliModel(invalidArea);
  }

  const velocity1 = fluidVelocity({
    flowRate: { value: flowRate, unit: "m^3/s" },
    area: { value: area1.calculatedValue!, unit: "m^2" }
  });
  const velocity2 = fluidVelocity({
    flowRate: { value: flowRate, unit: "m^3/s" },
    area: { value: area2.calculatedValue!, unit: "m^2" }
  });
  const invalidVelocity = [velocity1, velocity2].find(
    (calculation) => calculation.calculatedValue === null
  );
  if (invalidVelocity) {
    return invalidBernoulliModel(invalidVelocity);
  }

  const pressure2 = bernoulliPressureAtPoint2({
    pressure1: { value: parameters.inletAbsolutePressurePa, unit: "Pa" },
    density: { value: parameters.densityKgPerM3, unit: "kg/m^3" },
    velocity1: { value: velocity1.calculatedValue!, unit: "m/s" },
    velocity2: { value: velocity2.calculatedValue!, unit: "m/s" },
    elevation1: { value: parameters.elevation1M, unit: "m" },
    elevation2: { value: parameters.elevation2M, unit: "m" },
    gravitationalAcceleration: {
      value: parameters.gravitationalAccelerationMPerS2,
      unit: "m/s^2"
    }
  });
  if (pressure2.calculatedValue === null) {
    return invalidBernoulliModel(pressure2);
  }

  const headInput = {
    density: { value: parameters.densityKgPerM3, unit: "kg/m^3" as const },
    gravitationalAcceleration: {
      value: parameters.gravitationalAccelerationMPerS2,
      unit: "m/s^2" as const
    }
  };
  const pressureHead1 = pressureHead({
    pressure: { value: parameters.inletAbsolutePressurePa, unit: "Pa" },
    ...headInput
  });
  const pressureHead2 = pressureHead({
    pressure: { value: pressure2.calculatedValue, unit: "Pa" },
    ...headInput
  });
  const velocityHead1 = velocityHead({
    velocity: { value: velocity1.calculatedValue!, unit: "m/s" },
    gravitationalAcceleration: headInput.gravitationalAcceleration
  });
  const velocityHead2 = velocityHead({
    velocity: { value: velocity2.calculatedValue!, unit: "m/s" },
    gravitationalAcceleration: headInput.gravitationalAcceleration
  });
  const totalHead1 = totalBernoulliHead({
    pressure: { value: parameters.inletAbsolutePressurePa, unit: "Pa" },
    velocity: { value: velocity1.calculatedValue!, unit: "m/s" },
    elevation: { value: parameters.elevation1M, unit: "m" },
    ...headInput
  });
  const totalHead2 = totalBernoulliHead({
    pressure: { value: pressure2.calculatedValue, unit: "Pa" },
    velocity: { value: velocity2.calculatedValue!, unit: "m/s" },
    elevation: { value: parameters.elevation2M, unit: "m" },
    ...headInput
  });
  const invalidHead = [
    pressureHead1,
    pressureHead2,
    velocityHead1,
    velocityHead2,
    totalHead1,
    totalHead2
  ].find((calculation) => calculation.calculatedValue === null);
  if (invalidHead) {
    return invalidBernoulliModel(invalidHead);
  }

  const outputs = {
    area1: area1.calculatedValue!,
    area2: area2.calculatedValue!,
    velocity1: velocity1.calculatedValue!,
    velocity2: velocity2.calculatedValue!,
    pressure1: parameters.inletAbsolutePressurePa,
    pressure2: pressure2.calculatedValue,
    pressureHead1: pressureHead1.calculatedValue!,
    pressureHead2: pressureHead2.calculatedValue!,
    velocityHead1: velocityHead1.calculatedValue!,
    velocityHead2: velocityHead2.calculatedValue!,
    totalHead1: totalHead1.calculatedValue!,
    totalHead2: totalHead2.calculatedValue!
  };

  return {
    outputs,
    measurements: [
      {
        id: "pressure1",
        label: "Section 1 absolute pressure",
        value: outputs.pressure1,
        unit: "Pa",
        instrumentType: "pressure-gauge",
        diagnostic: false
      },
      {
        id: "pressure2",
        label: "Section 2 absolute pressure",
        value: outputs.pressure2,
        unit: "Pa",
        instrumentType: "pressure-gauge",
        diagnostic: false
      },
      {
        id: "flowRate",
        label: "Volumetric flow rate",
        value: flowRate,
        unit: "m^3/s",
        instrumentType: "flow-meter",
        diagnostic: false
      },
      {
        id: "velocity1",
        label: "Section 1 average velocity",
        value: outputs.velocity1,
        unit: "m/s",
        instrumentType: "digital-status-display",
        diagnostic: false
      },
      {
        id: "velocity2",
        label: "Section 2 average velocity",
        value: outputs.velocity2,
        unit: "m/s",
        instrumentType: "digital-status-display",
        diagnostic: false
      }
    ],
    diagnosticMeasurements: [],
    alarms: [],
    calculation: pressure2,
    calculationExplanation: [
      ...area1.calculationSteps,
      ...area2.calculationSteps,
      ...velocity1.calculationSteps,
      ...velocity2.calculationSteps,
      ...pressure2.calculationSteps
    ],
    resultsInterpretation:
      outputs.area2 < outputs.area1
        ? "The contraction increases average velocity and lowers ideal static pressure while total ideal head remains constant."
        : "Equal section areas produce equal average velocities and equal ideal static pressures in this horizontal model."
  };
}

function invalidBernoulliModel(
  calculation: EngineeringCalculationResult<string>
): SimulationModelResult {
  return {
    outputs: {},
    measurements: [],
    diagnosticMeasurements: [],
    alarms: [],
    calculation,
    calculationExplanation: calculation.calculationSteps,
    resultsInterpretation:
      "Correct the input state before interpreting this ideal Bernoulli model."
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
      continue;
    }

    if (input.options && !input.options.some((option) => option.value === value)) {
      errors.push(`${input.id} must use a declared selection.`);
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
