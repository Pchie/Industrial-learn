import type { EngineeringCalculationResult } from "@industrial-learn/engineering-core";
import type { VisualStateSemantic } from "@industrial-learn/design-system";
import type { ReviewStatus, SimulationMode } from "@industrial-learn/simulation-engine";

export type VisualSimulationMode = SimulationMode | "demonstration";

export type PersistenceRequirement = "none" | "optional" | "required";

export type SimulationModeCapability = {
  controlsEnabled: boolean;
  hintsVisible: boolean;
  equationsVisible: boolean;
  faultsEnabled: boolean;
  competencyMayBeAwarded: boolean;
  persistence: PersistenceRequirement;
};

export const SIMULATION_MODE_CAPABILITIES = {
  learn: {
    controlsEnabled: true,
    hintsVisible: true,
    equationsVisible: true,
    faultsEnabled: false,
    competencyMayBeAwarded: true,
    persistence: "required"
  },
  guided: {
    controlsEnabled: true,
    hintsVisible: true,
    equationsVisible: true,
    faultsEnabled: false,
    competencyMayBeAwarded: true,
    persistence: "required"
  },
  explore: {
    controlsEnabled: true,
    hintsVisible: true,
    equationsVisible: true,
    faultsEnabled: false,
    competencyMayBeAwarded: false,
    persistence: "optional"
  },
  "fault-diagnosis": {
    controlsEnabled: true,
    hintsVisible: false,
    equationsVisible: false,
    faultsEnabled: true,
    competencyMayBeAwarded: true,
    persistence: "required"
  },
  assessment: {
    controlsEnabled: true,
    hintsVisible: false,
    equationsVisible: false,
    faultsEnabled: true,
    competencyMayBeAwarded: true,
    persistence: "required"
  },
  demonstration: {
    controlsEnabled: true,
    hintsVisible: true,
    equationsVisible: true,
    faultsEnabled: false,
    competencyMayBeAwarded: false,
    persistence: "none"
  }
} as const satisfies Record<VisualSimulationMode, SimulationModeCapability>;

export type VisualDirection =
  "forward" | "reverse" | "clockwise" | "counter-clockwise" | "none";

export type VisualQuantity = {
  value: number;
  unit: string;
  validity?: "valid" | "invalid";
};

export type VisualPosition = {
  x: number;
  y: number;
  reference: "normalized" | "viewport";
};

export type VisualEngineeringState<
  Extension extends Record<string, unknown> = Record<string, unknown>
> = {
  componentId: string;
  active?: boolean;
  direction?: VisualDirection;
  magnitude?: VisualQuantity;
  position?: VisualPosition;
  rotationDegrees?: number;
  pressure?: VisualQuantity;
  flow?: VisualQuantity;
  temperature?: VisualQuantity;
  voltage?: VisualQuantity;
  current?: VisualQuantity;
  force?: VisualQuantity;
  torque?: VisualQuantity;
  velocity?: VisualQuantity;
  warning?: string;
  fault?: string;
  selected?: boolean;
  measured?: boolean;
  semantics?: VisualStateSemantic[];
  extension?: Extension;
};

export type VisualOperatingState<
  Extension extends Record<string, unknown> = Record<string, unknown>
> = {
  status: "idle" | "running" | "paused" | "faulted" | "invalid";
  summary: string;
  components: Record<string, VisualEngineeringState<Extension>>;
};

export type VisualStateAdapter<
  DomainState,
  Extension extends Record<string, unknown> = Record<string, unknown>
> = (domainState: DomainState) => VisualOperatingState<Extension>;

export type PlaybackStatus = "idle" | "playing" | "paused";
export type PlaybackSpeed = 0.5 | 1 | 2;

export type PlaybackState = {
  status: PlaybackStatus;
  frame: number;
  displayTimeSeconds: number;
  speed: PlaybackSpeed;
};

export type RenderPreference = {
  reducedMotion: boolean;
  lowData: boolean;
};

export type RenderPolicy = {
  animate: boolean;
  particleCount: number;
  showStaticDirectionArrows: boolean;
  loadHighDetailAssets: boolean;
};

export type FlowDirection = "forward" | "reverse" | "stopped";

export type FlowVisualState = {
  direction: FlowDirection;
  magnitudeNormalized: number;
  restricted: boolean;
  label: string;
};

export type VectorKind = "force" | "velocity" | "acceleration" | "torque" | "heat-flow";

export type VectorScale = {
  domainMin: number;
  domainMax: number;
  visualMin: number;
  visualMax: number;
};

export type MeasurementQuantity =
  "pressure" | "flow" | "temperature" | "voltage" | "current" | "speed";

export type InstrumentType =
  | "pressure-gauge"
  | "digital-pressure"
  | "flow-meter"
  | "thermometer"
  | "voltmeter"
  | "ammeter"
  | "tachometer";

export type InstrumentConfiguration = {
  id: string;
  type: InstrumentType;
  label: string;
  quantity: MeasurementQuantity;
  unit: string;
  min: number;
  max: number;
  warningRange?: { min?: number; max?: number };
  precision: number;
};

export type MeasurementPointDefinition = {
  id: string;
  componentId: string;
  label: string;
  quantity: MeasurementQuantity;
  compatibleInstruments: InstrumentType[];
};

export type MeasurementReading = {
  pointId: string;
  quantity: MeasurementQuantity;
  value: number;
  unit: string;
  validity: "valid" | "invalid";
  status?: string;
};

export type MeasurementSelection = {
  point: MeasurementPointDefinition | null;
  reading: MeasurementReading | null;
  error: string | null;
};

export type RepresentationMode = "external" | "cutaway" | "schematic";

export type RepresentationDefinition = {
  mode: RepresentationMode;
  label: string;
  description: string;
};

export type LinkedComponentDefinition = {
  componentId: string;
  label: string;
  representations: Partial<Record<RepresentationMode, string>>;
};

export type LinkedSelectionState = {
  selectedComponentId: string | null;
};

export type ChallengeOperator = "at-least" | "at-most" | "within";

export type ChallengeCondition = {
  id: string;
  stateKey: string;
  operator: ChallengeOperator;
  target: number;
  displayTarget?: number;
  displayUnit?: string;
  tolerance?: number;
  unit: string;
};

export type EngineeringChallengeContract = {
  id: string;
  objective: string;
  startingState: Record<string, number>;
  allowedControls: string[];
  conditions: ChallengeCondition[];
  hints: string[];
  competencyRelationship?: string;
  explanationBeforeCompletion?: string;
  explanationAfterCompletion: string;
};

export type ChallengeEvaluation = {
  complete: boolean;
  conditions: Array<{
    conditionId: string;
    met: boolean;
    actualValue: number | null;
  }>;
};

export type FaultVisualisationContract = {
  faultId: string;
  name: string;
  affectedComponentId: string;
  observableSymptoms: string[];
  visualIndicators: string[];
  measurementChanges: string[];
  diagnosticEvidence: string[];
  supportedModes: VisualSimulationMode[];
  sourceIds: string[];
  reviewStatus: ReviewStatus;
};

export type EquationSymbol = {
  symbol: string;
  name: string;
  unit: string;
};

export type LiveEquationModel<Unit extends string = string> = {
  name: string;
  expression: string;
  symbols: EquationSymbol[];
  result: EngineeringCalculationResult<Unit>;
};

export type ContentDepth = "quick" | "engineering" | "deep-dive";
