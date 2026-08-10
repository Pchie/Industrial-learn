import {
  getSimulation,
  type SimulationMode,
  type SimulationState
} from "@industrial-learn/simulation-engine";

export type SimulationCompletionPayload = {
  finalState: SimulationState;
  diagnosisSubmitted: Record<string, unknown>;
  submittedAssessmentValue?: number | undefined;
};

const allowedModes = new Set<SimulationMode>([
  "learn",
  "guided",
  "explore",
  "fault-diagnosis",
  "assessment"
]);

export function parseSimulationMode(value: string): SimulationMode | null {
  return allowedModes.has(value as SimulationMode) ? (value as SimulationMode) : null;
}

export function parseSimulationCompletionPayload(
  rawState: string,
  rawDiagnosis: string,
  rawAssessmentValue: string
): SimulationCompletionPayload {
  const parsed = parseJsonObject(rawState);
  const simulationId = stringValue(parsed.definitionId);
  const mode = parseSimulationMode(stringValue(parsed.mode) ?? "");
  const runtime = simulationId ? getSimulation(simulationId) : undefined;

  if (!runtime || !mode) {
    throw new Error("Invalid simulation state.");
  }

  let state = runtime.createInitialState(mode);

  for (const input of runtime.definition.inputs) {
    const value = numberValue((parsed.inputs as Record<string, unknown>)[input.id]);
    if (value === undefined) {
      throw new Error(`Missing ${input.label}.`);
    }
    state = runtime.updateInput(state, input.id, value);
  }

  const speedMultiplier = numberValue(parsed.speedMultiplier);
  if (speedMultiplier !== undefined) {
    state = runtime.changeSpeed(state, speedMultiplier);
  }

  const status = stringValue(parsed.status);
  if (status === "running" || status === "faulted" || status === "paused") {
    state = runtime.start(state);
  }

  for (const faultId of arrayValue(parsed.activeFaultIds)) {
    state = runtime.injectFault(state, faultId);
  }

  const elapsed = numberValue(parsed.elapsedTimeSeconds);
  if (elapsed !== undefined && elapsed > 0) {
    state = runtime.step(state, Math.min(elapsed, 600));
  }

  if (status === "paused") {
    state = runtime.pause(state);
  }

  if (state.validity.status === "invalid") {
    throw new Error(state.validity.errors[0] ?? "Simulation input is invalid.");
  }

  const diagnosisSubmitted = parseJsonObject(rawDiagnosis);
  const submittedValue =
    rawAssessmentValue.trim() === "" ? undefined : Number(rawAssessmentValue);

  if (
    rawAssessmentValue.trim() !== "" &&
    (!Number.isFinite(submittedValue) || submittedValue === undefined)
  ) {
    throw new Error("Assessment answer must be a finite number.");
  }

  return {
    finalState: state,
    diagnosisSubmitted,
    submittedAssessmentValue: submittedValue
  };
}

function parseJsonObject(raw: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(raw || "{}") as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Record<string, unknown>)
      : {};
  } catch {
    throw new Error("Invalid simulation payload.");
  }
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function numberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function arrayValue(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}
