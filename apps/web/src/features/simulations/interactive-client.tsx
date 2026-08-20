"use client";

import { useMemo, useState, useTransition } from "react";
import { getSimulation, type SimulationState } from "@industrial-learn/simulation-engine";

import { completeSimulationAction } from "./actions";
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

  const [state, setState] = useState(model.initialState);
  const [diagnosis, setDiagnosis] = useState("pressure-loss");
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
    const faultId =
      state.mode === "fault-diagnosis" || state.mode === "assessment"
        ? diagnosis
        : "pressure-loss";
    setState((current) => simulationRuntime.injectFault(current, faultId));
  }

  function reset() {
    setState((current) => simulationRuntime.reset(current));
  }

  return (
    <section className="simulation-workbench" aria-label="Hydraulic simulation attempt">
      <div
        className="simulation-visual"
        aria-label={state.definition.visualRepresentation.description}
      >
        <div className="simulation-cylinder" aria-hidden="true">
          <span className="simulation-cylinder__bar" />
          <span className="simulation-cylinder__piston" />
        </div>
        <div className="simulation-visual__readout">
          <span>Mode</span>
          <strong>{formatMode(state.mode)}</strong>
        </div>
        <div className="simulation-visual__readout">
          <span>Status</span>
          <strong>{state.status}</strong>
        </div>
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

        {state.definition.inputs.map((input) => (
          <label className="simulation-field" key={input.id}>
            <span>
              {input.label} ({input.unit})
            </span>
            <input
              aria-describedby={`${input.id}-range`}
              max={input.max}
              min={input.min}
              name={input.id}
              onChange={(event) => updateInput(input.id, Number(event.target.value))}
              step={input.id === "pressure" ? 100000 : 0.0001}
              type="number"
              value={state.inputs[input.id] ?? input.defaultValue}
            />
            <small id={`${input.id}-range`}>
              Range {input.min} to {input.max} {input.unit}
            </small>
          </label>
        ))}

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
          <button className="button button--secondary" onClick={applyFault} type="button">
            Introduce fault
          </button>
        </div>

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

          {state.mode === "assessment" ? (
            <label className="simulation-field">
              <span>Submitted cylinder force answer (N)</span>
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
              <strong>
                {formatNumber(measurement.value)} {measurement.unit}
              </strong>
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

      <div className="simulation-panel">
        <h2>Calculation explanation</h2>
        <p>Equation ID: {state.definition.equations[0]?.equationId}</p>
        <ol className="simulation-list">
          {state.calculationExplanation.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p>{state.resultsInterpretation}</p>
      </div>

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
