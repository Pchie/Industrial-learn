"use client";

import { useMemo, useState, useTransition } from "react";
import { getSimulation, type SimulationState } from "@industrial-learn/simulation-engine";

import { getModeCapability } from "../visual-simulation/state";
import { completeSimulationAction } from "./actions";
import { SimulationPreview } from "./simulation-preview";
import type { SimulationAttemptPageModel } from "./server";

export function SimulationAttemptClient({
  model
}: {
  model: SimulationAttemptPageModel;
}) {
  const runtime = getSimulation(model.attempt.simulationId);
  if (!runtime) {
    throw new Error("Simulation runtime is unavailable.");
  }
  const simulationRuntime = runtime;
  const modeCapability = getModeCapability(model.attempt.mode);

  const [state, setState] = useState(model.initialState);
  const [diagnosis, setDiagnosis] = useState(
    simulationRuntime.definition.faultModes[0]?.id ?? ""
  );
  const [assessmentValue, setAssessmentValue] = useState("");
  const [isPending, startTransition] = useTransition();
  const serializedState = useMemo(() => serializeState(state), [state]);
  const diagnosisPayload = JSON.stringify({
    selectedDiagnosis: diagnosis,
    observedFaults: state.activeFaultIds,
    measurementCount: state.liveMeasurements.length + state.diagnosticMeasurements.length
  });

  function updateInput(inputId: string, value: number) {
    setState((current) => simulationRuntime.updateInput(current, inputId, value));
  }

  function applyFault() {
    setState((current) => simulationRuntime.injectFault(current, diagnosis));
  }

  function reset() {
    setState((current) => simulationRuntime.reset(current));
  }

  return (
    <section
      className="simulation-workbench"
      aria-label={`${state.definition.title} simulation attempt`}
    >
      <div
        className="simulation-visual"
        aria-label={state.definition.visualRepresentation.description}
      >
        <SimulationPreview
          accessibleDescription={`${state.definition.title} is ${state.status}. Current controls and model results follow the diagram.`}
          active={state.status === "running"}
          boundaryState={
            state.definition.simulationId === "sim-core-thermal-system-001"
              ? {
                  massCrossing: state.inputs.massCrossing === 1,
                  energyCrossing: state.inputs.energyCrossing === 1,
                  consistent: !state.activeFaultIds.includes("boundary-shift")
                }
              : undefined
          }
          preview={model.overview.preview}
          size="detail"
        />
        <div className="simulation-attempt-readouts">
          <div className="simulation-visual__readout">
            <span>Mode</span>
            <strong>{formatMode(state.mode)}</strong>
          </div>
          <div className="simulation-visual__readout">
            <span>Status</span>
            <strong>{state.status}</strong>
          </div>
        </div>
        <p aria-live="polite" className="simulation-attempt-summary" role="status">
          Runtime state updated. The controls and model results below contain the current
          declared values.
        </p>
      </div>

      <div className="simulation-panel">
        <h2>Controls</h2>
        <div className="simulation-actions" role="group" aria-label="Simulation controls">
          <button
            className="button button--primary"
            onClick={() => setState((current) => simulationRuntime.start(current))}
            type="button"
          >
            Start
          </button>
          <button
            className="button button--secondary"
            onClick={() => setState((current) => simulationRuntime.pause(current))}
            type="button"
          >
            Pause
          </button>
          <button className="button button--secondary" onClick={reset} type="button">
            Reset
          </button>
        </div>

        {state.definition.inputs.map((input) => {
          const value = state.inputs[input.id] ?? input.defaultValue;
          const selectedOption = input.options?.find((option) => option.value === value);

          return (
            <label className="simulation-field" key={input.id}>
              <span>
                {input.label}
                {input.options ? "" : ` (${input.unit})`}
              </span>
              {input.options ? (
                <select
                  aria-describedby={`${input.id}-range`}
                  name={input.id}
                  onChange={(event) => updateInput(input.id, Number(event.target.value))}
                  value={value}
                >
                  {input.options.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  aria-describedby={`${input.id}-range`}
                  max={input.max}
                  min={input.min}
                  name={input.id}
                  onChange={(event) => updateInput(input.id, Number(event.target.value))}
                  step={input.id === "pressure" ? 100000 : 0.0001}
                  type="number"
                  value={value}
                />
              )}
              <small id={`${input.id}-range`}>
                {selectedOption?.description ??
                  `Range ${input.min} to ${input.max} ${input.unit}`}
              </small>
            </label>
          );
        })}

        {state.definition.supportsTimeProgression ? (
          <label className="simulation-field">
            <span>Simulation speed</span>
            <input
              max={10}
              min={0.25}
              onChange={(event) =>
                setState((current) =>
                  simulationRuntime.changeSpeed(current, Number(event.target.value))
                )
              }
              step={0.25}
              type="number"
              value={state.speedMultiplier}
            />
          </label>
        ) : null}

        {modeCapability.faultsEnabled && state.definition.faultModes.length > 0 ? (
          <div className="simulation-actions" role="group" aria-label="Fault controls">
            <label className="simulation-field simulation-field--inline">
              <span>Fault selection</span>
              <select
                onChange={(event) => setDiagnosis(event.target.value)}
                value={diagnosis}
              >
                {state.definition.faultModes.map((fault) => (
                  <option key={fault.id} value={fault.id}>
                    {fault.label}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="button button--secondary"
              onClick={applyFault}
              type="button"
            >
              Introduce fault
            </button>
          </div>
        ) : null}

        <form
          action={(formData) => {
            startTransition(() => {
              void completeSimulationAction(formData);
            });
          }}
          className="simulation-complete-form"
        >
          <input name="simulationSlug" type="hidden" value={model.overview.slug} />
          <input name="attemptId" type="hidden" value={model.attempt.id} />
          <input
            name="idempotencyKey"
            type="hidden"
            value={`${model.attempt.id}:simulation-final`}
          />
          <input name="simulationState" type="hidden" value={serializedState} />
          <input name="diagnosisSubmitted" type="hidden" value={diagnosisPayload} />

          {state.mode === "assessment" && state.definition.assessment ? (
            <label className="simulation-field">
              <span>{state.definition.assessment.answerLabel}</span>
              <input
                name="submittedAssessmentValue"
                onChange={(event) => setAssessmentValue(event.target.value)}
                required
                type="number"
                value={assessmentValue}
              />
            </label>
          ) : (
            <input name="submittedAssessmentValue" type="hidden" value="" />
          )}

          <button className="button button--primary" disabled={isPending} type="submit">
            Complete attempt
          </button>
        </form>
      </div>

      <div className="simulation-panel">
        <h2>Live measurements</h2>
        <div className="measurement-grid" aria-live="polite">
          {state.liveMeasurements.map((measurement) => (
            <div className="measurement-card" key={measurement.id}>
              <span>{measurement.label}</span>
              <strong>{formatMeasurement(measurement, state.definition.outputs)}</strong>
            </div>
          ))}
        </div>

        {state.alarms.length > 0 ? (
          <div className="simulation-alert" role="alert">
            <strong>Fault state</strong>
            <ul>
              {state.alarms.map((alarm) => (
                <li key={alarm}>{alarm}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {state.validity.status === "invalid" ? (
          <div className="simulation-alert" role="alert">
            {state.validity.errors.join(" ")}
          </div>
        ) : null}
      </div>

      {modeCapability.equationsVisible ? (
        <div className="simulation-panel">
          <h2>Model explanation</h2>
          {state.definition.equations[0] ? (
            <p>Equation ID: {state.definition.equations[0].equationId}</p>
          ) : (
            <p>No equation is used for this source-backed classification activity.</p>
          )}
          <ol className="simulation-list">
            {state.calculationExplanation.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <p>{state.resultsInterpretation}</p>
        </div>
      ) : null}

      <div className="simulation-panel">
        <h2>Event history</h2>
        <ol className="simulation-list">
          {state.eventHistory.slice(-8).map((event, index) => (
            <li key={`${event.type}-${index}`}>
              {event.timeSeconds}s: {event.message}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function serializeState(state: SimulationState) {
  return JSON.stringify({
    definitionId: state.definition.simulationId,
    mode: state.mode,
    status: state.status,
    elapsedTimeSeconds: state.elapsedTimeSeconds,
    speedMultiplier: state.speedMultiplier,
    inputs: state.inputs,
    activeFaultIds: state.activeFaultIds
  });
}

function formatMode(mode: string) {
  return mode
    .split("-")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en", {
    maximumFractionDigits: 4
  }).format(value);
}

function formatMeasurement(
  measurement: SimulationState["liveMeasurements"][number],
  outputs: SimulationState["definition"]["outputs"]
) {
  const output = outputs.find((candidate) => candidate.id === measurement.id);
  const label = output?.valueLabels?.[String(measurement.value)];
  return label ?? `${formatNumber(measurement.value)} ${measurement.unit}`;
}
