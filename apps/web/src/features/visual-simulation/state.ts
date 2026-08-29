import {
  SIMULATION_MODE_CAPABILITIES,
  type ChallengeCondition,
  type ChallengeEvaluation,
  type EngineeringChallengeContract,
  type InstrumentType,
  type LinkedSelectionState,
  type MeasurementPointDefinition,
  type MeasurementReading,
  type MeasurementSelection,
  type PlaybackSpeed,
  type PlaybackState,
  type RenderPolicy,
  type RenderPreference,
  type RepresentationMode,
  type VectorScale,
  type VisualSimulationMode
} from "./contracts";

export function getModeCapability(mode: VisualSimulationMode) {
  return SIMULATION_MODE_CAPABILITIES[mode];
}

export function createPlaybackState(): PlaybackState {
  return {
    status: "idle",
    frame: 0,
    displayTimeSeconds: 0,
    speed: 1
  };
}

export function playPlayback(state: PlaybackState): PlaybackState {
  return { ...state, status: "playing" };
}

export function pausePlayback(state: PlaybackState): PlaybackState {
  return { ...state, status: "paused" };
}

export function resetPlayback(): PlaybackState {
  return createPlaybackState();
}

export function setPlaybackSpeed(
  state: PlaybackState,
  speed: PlaybackSpeed
): PlaybackState {
  return { ...state, speed };
}

export function stepPlayback(
  state: PlaybackState,
  displayStepSeconds = 1
): PlaybackState {
  const safeStep = Number.isFinite(displayStepSeconds)
    ? Math.max(0, displayStepSeconds)
    : 0;

  return {
    ...state,
    frame: state.frame + 1,
    displayTimeSeconds: state.displayTimeSeconds + safeStep * state.speed
  };
}

export function deriveRenderPolicy(preference: RenderPreference): RenderPolicy {
  const constrained = preference.reducedMotion || preference.lowData;

  return {
    animate: !constrained,
    particleCount: preference.lowData ? 0 : preference.reducedMotion ? 0 : 3,
    showStaticDirectionArrows: constrained,
    loadHighDetailAssets: !preference.lowData
  };
}

export function clampGaugeValue(value: number, min: number, max: number) {
  if (!Number.isFinite(value) || !Number.isFinite(min) || !Number.isFinite(max)) {
    return { displayValue: min, rangeStatus: "invalid" as const, clipped: true };
  }

  if (max <= min) {
    return { displayValue: min, rangeStatus: "invalid" as const, clipped: true };
  }

  if (value < min) {
    return { displayValue: min, rangeStatus: "below" as const, clipped: true };
  }

  if (value > max) {
    return { displayValue: max, rangeStatus: "above" as const, clipped: true };
  }

  return { displayValue: value, rangeStatus: "within" as const, clipped: false };
}

export function scaleVectorLength(value: number, scale: VectorScale) {
  const magnitude = Math.abs(value);
  const domainSpan = scale.domainMax - scale.domainMin;
  const visualSpan = scale.visualMax - scale.visualMin;

  if (
    !Number.isFinite(magnitude) ||
    domainSpan <= 0 ||
    visualSpan < 0 ||
    scale.visualMin < 0
  ) {
    return scale.visualMin;
  }

  const normalized = Math.min(1, Math.max(0, (magnitude - scale.domainMin) / domainSpan));

  return scale.visualMin + normalized * visualSpan;
}

export function scaleFlowLineWeight(magnitudeNormalized: number) {
  const normalized = Number.isFinite(magnitudeNormalized)
    ? Math.min(1, Math.max(0, magnitudeNormalized))
    : 0;

  return 4 + normalized * 8;
}

export function selectMeasurementPoint(
  points: MeasurementPointDefinition[],
  readings: MeasurementReading[],
  pointId: string,
  instrumentType: InstrumentType
): MeasurementSelection {
  const point = points.find((candidate) => candidate.id === pointId) ?? null;

  if (!point) {
    return { point: null, reading: null, error: "Measurement point was not found." };
  }

  if (!point.compatibleInstruments.includes(instrumentType)) {
    return {
      point,
      reading: null,
      error: `${instrumentType} is not compatible with ${point.label}.`
    };
  }

  const reading = readings.find((candidate) => candidate.pointId === pointId) ?? null;

  if (!reading || reading.quantity !== point.quantity) {
    return {
      point,
      reading: null,
      error: `No valid ${point.quantity} reading is available at ${point.label}.`
    };
  }

  return { point, reading, error: null };
}

export function selectRepresentation(
  supported: RepresentationMode[],
  requested: RepresentationMode
) {
  return supported.includes(requested) ? requested : (supported[0] ?? null);
}

export function selectLinkedComponent(
  state: LinkedSelectionState,
  componentIds: string[],
  componentId: string
): LinkedSelectionState {
  return componentIds.includes(componentId)
    ? { selectedComponentId: componentId }
    : state;
}

function conditionMet(condition: ChallengeCondition, actualValue: number) {
  const tolerance = Math.max(0, condition.tolerance ?? 0);

  switch (condition.operator) {
    case "at-least":
      return actualValue + tolerance >= condition.target;
    case "at-most":
      return actualValue - tolerance <= condition.target;
    case "within":
      return Math.abs(actualValue - condition.target) <= tolerance;
  }
}

export function evaluateChallenge(
  challenge: EngineeringChallengeContract,
  stateValues: Record<string, number>
): ChallengeEvaluation {
  const conditions = challenge.conditions.map((condition) => {
    const value = stateValues[condition.stateKey];
    const actualValue = Number.isFinite(value) ? (value as number) : null;

    return {
      conditionId: condition.id,
      actualValue,
      met: actualValue === null ? false : conditionMet(condition, actualValue)
    };
  });

  return {
    complete: conditions.length > 0 && conditions.every((condition) => condition.met),
    conditions
  };
}
