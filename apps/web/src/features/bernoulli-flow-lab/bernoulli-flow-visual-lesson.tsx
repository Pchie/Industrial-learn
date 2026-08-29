"use client";

import { Alert, Button, NumberInput, Slider } from "@industrial-learn/design-system";
import Link from "next/link";
import { useMemo, useState } from "react";

import {
  ContentDepthSelector,
  EngineeringChallenge,
  Gauge,
  LiveEquation,
  MeasurementPointSelector,
  MicroTheory,
  ObservationPrompt,
  RealWorldApplication,
  RepresentationSwitcher,
  SimulationShell,
  SimulationViewport
} from "../visual-simulation/components";
import type {
  ContentDepth,
  InstrumentConfiguration,
  LinkedComponentDefinition,
  RepresentationDefinition,
  RepresentationMode
} from "../visual-simulation/contracts";
import {
  getModeCapability,
  selectLinkedComponent,
  selectMeasurementPoint
} from "../visual-simulation/state";

import { BernoulliFlowScene } from "./bernoulli-flow-scene";
import type { BernoulliFlowExperienceContent } from "./content";
import {
  BERNOULLI_FLOW_LESSON_LIMITS,
  BERNOULLI_MEASUREMENT_POINTS,
  BERNOULLI_VELOCITY_CHALLENGE,
  constrainBernoulliInput,
  createBernoulliFlowLessonModel,
  evaluatePressurePrediction,
  type BernoulliFlowLessonInput,
  type PressurePrediction
} from "./model";
import styles from "./bernoulli-flow-lab.module.css";

const pressureGauge: InstrumentConfiguration = {
  id: "GAUGE-FLUID-BERNOULLI-PRESSURE",
  type: "pressure-gauge",
  label: "Selected absolute pressure",
  quantity: "pressure",
  unit: "kPa",
  min: 0,
  max: 260,
  precision: 1
};

const linkedComponents: LinkedComponentDefinition[] = [
  {
    componentId: "COMP-FLUID-BERNOULLI-SECTION-1",
    label: "Section 1",
    representations: {
      cutaway: "Wide pipe section and point P1",
      schematic: "Wide section symbol and point P1"
    }
  },
  {
    componentId: "COMP-FLUID-BERNOULLI-CONTRACTION",
    label: "Contraction",
    representations: {
      cutaway: "Transition from section 1 to section 2",
      schematic: "Converging connection"
    }
  },
  {
    componentId: "COMP-FLUID-BERNOULLI-SECTION-2",
    label: "Section 2",
    representations: {
      cutaway: "Adjustable pipe section and point P2",
      schematic: "Adjustable section symbol and point P2"
    }
  }
];

const representations: RepresentationDefinition[] = [
  {
    mode: "cutaway",
    label: "Cutaway",
    description: "Pipe interior, contraction, direction, velocity, and pressure points"
  },
  {
    mode: "schematic",
    label: "Schematic",
    description: "Linked sections and pressure measurement points"
  }
];

export function BernoulliFlowVisualLesson({
  content
}: {
  content: BernoulliFlowExperienceContent;
}) {
  const [input, setInput] = useState<BernoulliFlowLessonInput>({
    flowRateLps: BERNOULLI_FLOW_LESSON_LIMITS.flowRateLps.defaultValue,
    outletDiameterMm: BERNOULLI_FLOW_LESSON_LIMITS.outletDiameterMm.defaultValue
  });
  const [inputMessage, setInputMessage] = useState<string | null>(null);
  const [representation, setRepresentation] = useState<RepresentationMode>("cutaway");
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(
    "COMP-FLUID-BERNOULLI-SECTION-2"
  );
  const [selectedPointId, setSelectedPointId] = useState("POINT-FLUID-BERNOULLI-2");
  const [depth, setDepth] = useState<ContentDepth>("quick");
  const [presentationPlaying, setPresentationPlaying] = useState(false);
  const [velocityChallengeStarted, setVelocityChallengeStarted] = useState(false);
  const [velocityChallengeChecked, setVelocityChallengeChecked] = useState(false);
  const [pressurePrediction, setPressurePrediction] = useState<PressurePrediction | null>(
    null
  );
  const [predictionRevealed, setPredictionRevealed] = useState(false);

  const model = useMemo(() => createBernoulliFlowLessonModel(input), [input]);
  const capability = getModeCapability("learn");
  const selectedMeasurement = selectMeasurementPoint(
    BERNOULLI_MEASUREMENT_POINTS,
    model.pressureReadings,
    selectedPointId,
    "pressure-gauge"
  );
  const outputs = model.simulationState?.outputs;
  const velocity1 = outputs?.velocity1 ?? 0;
  const velocity2 = outputs?.velocity2 ?? 0;
  const pressure1KPa = model.pressure1DisplayConversion?.calculatedValue ?? 0;
  const pressure2KPa = model.pressure2DisplayConversion?.calculatedValue ?? 0;
  const predictionResult = evaluatePressurePrediction(
    pressurePrediction,
    model.pressureRelation
  );

  function updateInput(field: keyof BernoulliFlowLessonInput, value: number) {
    const constrained = constrainBernoulliInput(field, value);
    setInputMessage(constrained.message);
    if (constrained.value !== null) {
      setInput((current) => ({ ...current, [field]: constrained.value }));
      setVelocityChallengeChecked(false);
      setPredictionRevealed(false);
    }
  }

  function reset() {
    setInput({
      flowRateLps: BERNOULLI_FLOW_LESSON_LIMITS.flowRateLps.defaultValue,
      outletDiameterMm: BERNOULLI_FLOW_LESSON_LIMITS.outletDiameterMm.defaultValue
    });
    setInputMessage(null);
    setRepresentation("cutaway");
    setSelectedComponentId("COMP-FLUID-BERNOULLI-SECTION-2");
    setSelectedPointId("POINT-FLUID-BERNOULLI-2");
    setDepth("quick");
    setPresentationPlaying(false);
    setVelocityChallengeStarted(false);
    setVelocityChallengeChecked(false);
    setPressurePrediction(null);
    setPredictionRevealed(false);
  }

  function selectComponent(componentId: string) {
    setSelectedComponentId(
      (current) =>
        selectLinkedComponent(
          { selectedComponentId: current },
          linkedComponents.map((component) => component.componentId),
          componentId
        ).selectedComponentId
    );
    if (componentId.endsWith("SECTION-1")) {
      setSelectedPointId("POINT-FLUID-BERNOULLI-1");
    } else if (componentId.endsWith("SECTION-2")) {
      setSelectedPointId("POINT-FLUID-BERNOULLI-2");
    }
  }

  function selectPoint(pointId: string) {
    setSelectedPointId(pointId);
    setSelectedComponentId(
      pointId.endsWith("1")
        ? "COMP-FLUID-BERNOULLI-SECTION-1"
        : "COMP-FLUID-BERNOULLI-SECTION-2"
    );
  }

  return (
    <div className={styles.experience} data-testid="bernoulli-flow-visual-lesson">
      <section aria-label="See and explore Bernoulli flow" className={styles.stage}>
        <SimulationShell
          measurements={
            <div className={styles.measurements}>
              <MeasurementPointSelector
                instrumentType="pressure-gauge"
                onSelect={selectPoint}
                points={BERNOULLI_MEASUREMENT_POINTS}
                selectedPointId={selectedPointId}
              />
              <Gauge
                configuration={pressureGauge}
                label={selectedMeasurement.point?.label ?? pressureGauge.label}
                value={selectedMeasurement.reading?.value ?? 0}
              />
              <dl className={styles.readingGrid}>
                <div>
                  <dt>Section 1 velocity</dt>
                  <dd>{formatNumber(velocity1, 2)} m/s</dd>
                </div>
                <div>
                  <dt>Section 2 velocity</dt>
                  <dd>{formatNumber(velocity2, 2)} m/s</dd>
                </div>
                <div>
                  <dt>Section 1 pressure</dt>
                  <dd>{formatNumber(pressure1KPa, 1)} kPa abs</dd>
                </div>
                <div>
                  <dt>Section 2 pressure</dt>
                  <dd>{formatNumber(pressure2KPa, 1)} kPa abs</dd>
                </div>
              </dl>
            </div>
          }
          mode="learn"
          modeCapability={capability}
          primaryControls={
            <div className={styles.primaryControls}>
              <BernoulliInputs
                input={input}
                inputMessage={inputMessage}
                onChange={updateInput}
              />
              <Button onClick={reset} size="sm" variant="quiet">
                <span aria-hidden="true">↺</span> Reset
              </Button>
            </div>
          }
          status={model.validity.status === "valid" ? "ready" : "invalid"}
          title="A smaller flow area changes velocity and ideal pressure."
        >
          <SimulationViewport
            announceState
            layout="single"
            stateSummary={
              model.visualState?.summary ??
              "Inputs are outside the ideal Bernoulli model validity boundary."
            }
            title="Two-section horizontal flow model"
          >
            <div>
              <RepresentationSwitcher
                activeMode={representation}
                onChange={setRepresentation}
                representations={representations}
              />
              <div className={styles.nextActions}>
                <div aria-label="Presentation motion controls" role="group">
                  <Button
                    aria-pressed={presentationPlaying}
                    onClick={() => setPresentationPlaying(true)}
                    size="sm"
                  >
                    <span aria-hidden="true">▶</span> Play flow cue
                  </Button>
                  <Button
                    onClick={() => setPresentationPlaying(false)}
                    size="sm"
                    variant="secondary"
                  >
                    <span aria-hidden="true">Ⅱ</span> Pause
                  </Button>
                </div>
              </div>
              <BernoulliFlowScene
                flowRateLps={input.flowRateLps}
                onSelectComponent={selectComponent}
                onSelectPoint={selectPoint}
                outletDiameterMm={input.outletDiameterMm}
                presentationPlaying={presentationPlaying}
                pressure1KPa={pressure1KPa}
                pressure2KPa={pressure2KPa}
                pressureHead1M={outputs?.pressureHead1 ?? 0}
                pressureHead2M={outputs?.pressureHead2 ?? 0}
                representation={representation}
                selectedComponentId={selectedComponentId}
                selectedPointId={selectedPointId}
                totalHeadM={outputs?.totalHead1 ?? 0}
                velocity1Mps={velocity1}
                velocity2Mps={velocity2}
                velocityHead1M={outputs?.velocityHead1 ?? 0}
                velocityHead2M={outputs?.velocityHead2 ?? 0}
              />
              <p className={styles.visualNote}>
                Moving dots are a bounded direction cue only. The model does not calculate
                particle paths, flow development, or elapsed-time dynamics.
              </p>
            </div>
          </SimulationViewport>
        </SimulationShell>

        <Alert title="Engineering review required" tone="warning">
          Source evidence is checked, but independent engineering and educational review
          is still required before student-use approval.
        </Alert>
        {model.validity.status === "invalid" ? (
          <Alert role="alert" title="Outside model validity" tone="fault">
            {model.validity.errors.join(" ")}
          </Alert>
        ) : null}
      </section>

      <section aria-labelledby="bernoulli-observe-title" className={styles.stage}>
        <div className={styles.stageHeading}>
          <p>2. Play, then observe</p>
          <h2 id="bernoulli-observe-title">Compare both measurement points</h2>
        </div>
        <div className={styles.observationGrid}>
          {content.observations.map((observation) => (
            <ObservationPrompt
              explanation={observation.explanation}
              hint={observation.hint}
              key={observation.id}
              prompt={observation.prompt}
            />
          ))}
        </div>
      </section>

      <section aria-labelledby="bernoulli-explain-title" className={styles.stage}>
        <div className={styles.stageHeading}>
          <p>3. Explain and calculate</p>
          <h2 id="bernoulli-explain-title">Connect area, velocity, pressure, and head</h2>
        </div>
        <ContentDepthSelector depth={depth} onChange={setDepth} />
        <MicroTheory
          engineeringNote="The pressure comparison is valid only for the declared horizontal, steady, incompressible, frictionless model."
          principle={content.microTheory.principle}
          title={content.microTheory.title}
        />

        {depth === "quick" ? (
          <div className={styles.quickSummary}>
            <strong>
              Smaller area → greater average velocity → lower ideal static pressure
            </strong>
            <span>
              Current state: D2 {input.outletDiameterMm} mm, v2{" "}
              {formatNumber(velocity2, 2)}
              m/s, P2 {formatNumber(pressure2KPa, 1)} kPa absolute.
            </span>
          </div>
        ) : (
          <div className={styles.equationGrid}>
            {model.velocity2Equation ? (
              <LiveEquation model={model.velocity2Equation} />
            ) : null}
            {model.pressure2Equation ? (
              <LiveEquation model={model.pressure2Equation} />
            ) : null}
          </div>
        )}

        {depth === "deep-dive" ? (
          <div className={styles.quickSummary}>
            <strong>{content.deepDive.title}</strong>
            <p>{content.deepDive.content}</p>
            <dl className={styles.headReadings}>
              <div>
                <dt>Point 1 pressure / velocity / elevation head</dt>
                <dd>
                  {formatNumber(outputs?.pressureHead1 ?? 0, 3)} /{" "}
                  {formatNumber(outputs?.velocityHead1 ?? 0, 3)} / 0 m
                </dd>
              </div>
              <div>
                <dt>Point 2 pressure / velocity / elevation head</dt>
                <dd>
                  {formatNumber(outputs?.pressureHead2 ?? 0, 3)} /{" "}
                  {formatNumber(outputs?.velocityHead2 ?? 0, 3)} / 0 m
                </dd>
              </div>
              <div>
                <dt>Total ideal head at both points</dt>
                <dd>{formatNumber(outputs?.totalHead1 ?? 0, 3)} m</dd>
              </div>
            </dl>
          </div>
        ) : null}
      </section>

      <section aria-labelledby="bernoulli-challenge-title" className={styles.stage}>
        <div className={styles.stageHeading}>
          <p>4. Challenge</p>
          <h2 id="bernoulli-challenge-title">Control and predict the ideal state</h2>
        </div>
        <div className={styles.challengeGrid}>
          <div>
            <h3>{content.challenges[0]?.objective ?? "Velocity target"}</h3>
            {!velocityChallengeStarted ? (
              <Button onClick={() => setVelocityChallengeStarted(true)}>
                Start velocity challenge
              </Button>
            ) : (
              <>
                <EngineeringChallenge
                  challenge={BERNOULLI_VELOCITY_CHALLENGE}
                  evaluation={model.velocityChallenge}
                  showResult={velocityChallengeChecked}
                />
                <p>
                  Current difference:{" "}
                  {formatSignedNumber(model.velocityDifferenceMps ?? 0, 2)} m/s
                </p>
                <Button
                  onClick={() => setVelocityChallengeChecked(true)}
                  variant="secondary"
                >
                  Check current state
                </Button>
              </>
            )}
          </div>
          <div>
            <h3>{content.challenges[1]?.objective ?? "Pressure prediction"}</h3>
            <fieldset className={styles.predictionOptions}>
              <legend>Compared with P1, P2 will be</legend>
              {(["higher", "lower", "same"] as const).map((option) => (
                <label key={option}>
                  <input
                    checked={pressurePrediction === option}
                    name="pressure-prediction"
                    onChange={() => {
                      setPressurePrediction(option);
                      setPredictionRevealed(false);
                    }}
                    type="radio"
                    value={option}
                  />
                  <span>{formatPrediction(option)}</span>
                </label>
              ))}
            </fieldset>
            <Button
              disabled={!pressurePrediction}
              onClick={() => setPredictionRevealed(true)}
              variant="secondary"
            >
              Reveal calculated comparison
            </Button>
            <p aria-live="polite" role="status">
              {!predictionRevealed
                ? "Choose a prediction before revealing the current ideal result."
                : predictionResult.complete
                  ? `Correct. P2 is ${formatPrediction(model.pressureRelation!)} than P1 for the current state.`
                  : `Not for this state. P2 is ${formatPrediction(model.pressureRelation!)} than P1.`}
            </p>
          </div>
        </div>
        <p className={styles.modelBoundary}>
          Both challenges are ungraded practice. They do not award progress or competency.
        </p>
      </section>

      <section aria-labelledby="bernoulli-application-title" className={styles.stage}>
        <div className={styles.stageHeading}>
          <p>5. Apply</p>
          <h2 id="bernoulli-application-title">Where is this used?</h2>
        </div>
        <RealWorldApplication
          principle={content.application.principle}
          relatedSimulation={content.application.relatedSimulationId}
          systemType={content.application.systemType}
          title={content.application.title}
          visual={<VenturiApplicationVisual />}
          visualDescription={content.application.accessibility.textAlternative}
        />
        <p>
          A real differential-pressure flow meter also needs reviewed geometry,
          calibration, fluid properties, and loss treatment. This lab does not calculate a
          calibrated flow-meter result.
        </p>
      </section>

      <section aria-label="Next learning actions" className={styles.nextActions}>
        <Alert title="Fault diagnosis" tone="info">
          Fault diagnosis is introduced in a later fluid-system lesson. No unsupported
          blockage, leak, sensor, or cavitation fault is enabled here.
        </Alert>
        <div>
          <Link
            className="il-button il-button--secondary il-button--md"
            href="#visual-2-knowledgeCheck"
          >
            Continue to knowledge check
          </Link>
          <Link
            className="il-button il-button--quiet il-button--md"
            href="#visual-2-sources"
          >
            Review sources
          </Link>
        </div>
      </section>
    </div>
  );
}

function BernoulliInputs({
  input,
  inputMessage,
  onChange
}: {
  input: BernoulliFlowLessonInput;
  inputMessage: string | null;
  onChange: (field: keyof BernoulliFlowLessonInput, value: number) => void;
}) {
  const flow = BERNOULLI_FLOW_LESSON_LIMITS.flowRateLps;
  const diameter = BERNOULLI_FLOW_LESSON_LIMITS.outletDiameterMm;

  return (
    <div className={styles.inputControls}>
      <div className={styles.pairedInput}>
        <Slider
          aria-label="Flow rate slider"
          label="Volumetric flow rate"
          max={flow.max}
          min={flow.min}
          onChange={(event) => onChange("flowRateLps", event.currentTarget.valueAsNumber)}
          output={`${input.flowRateLps.toFixed(1)} L/s`}
          step={flow.step}
          value={input.flowRateLps}
        />
        <NumberInput
          aria-label="Flow rate numeric input"
          helperText="L/s; converted explicitly to m^3/s"
          label="Flow rate value"
          max={flow.max}
          min={flow.min}
          onChange={(event) => onChange("flowRateLps", event.currentTarget.valueAsNumber)}
          step={flow.step}
          value={input.flowRateLps}
        />
      </div>
      <div className={styles.pairedInput}>
        <Slider
          aria-label="Section 2 diameter slider"
          label="Section 2 diameter"
          max={diameter.max}
          min={diameter.min}
          onChange={(event) =>
            onChange("outletDiameterMm", event.currentTarget.valueAsNumber)
          }
          output={`${input.outletDiameterMm.toFixed(0)} mm`}
          step={diameter.step}
          value={input.outletDiameterMm}
        />
        <NumberInput
          aria-label="Section 2 diameter numeric input"
          helperText="mm; converted explicitly to m"
          label="Section 2 diameter value"
          max={diameter.max}
          min={diameter.min}
          onChange={(event) =>
            onChange("outletDiameterMm", event.currentTarget.valueAsNumber)
          }
          step={diameter.step}
          value={input.outletDiameterMm}
        />
      </div>
      <p className={styles.rangeNote}>
        Educational ranges: {flow.min}–{flow.max} L/s and section 2 diameter{" "}
        {diameter.min}–{diameter.max} mm. Section 1 remains 60 mm. These are not equipment
        ratings.
      </p>
      {inputMessage ? (
        <Alert role="status" title="Input constrained" tone="warning">
          {inputMessage}
        </Alert>
      ) : null}
    </div>
  );
}

function VenturiApplicationVisual() {
  return (
    <svg
      aria-hidden="true"
      className={styles.applicationSvg}
      focusable="false"
      viewBox="0 0 360 190"
    >
      <path className={styles.applicationPipe} d="M20 60 H135 L190 88 H340" />
      <path className={styles.applicationPipe} d="M20 140 H135 L190 112 H340" />
      <path
        className={styles.applicationFluid}
        d="M24 66 H133 L188 92 H336 V108 H188 L133 134 H24 Z"
      />
      <path className={styles.applicationTap} d="M92 60 V28 H132" />
      <path className={styles.applicationTap} d="M246 88 V28 H206" />
      <circle cx="132" cy="28" fill="currentColor" r="7" />
      <circle cx="206" cy="28" fill="currentColor" r="7" />
      <text x="74" y="176">
        P1
      </text>
      <text x="236" y="176">
        P2
      </text>
    </svg>
  );
}

function formatPrediction(value: PressurePrediction) {
  return value === "same" ? "the same" : value;
}

function formatNumber(value: number, digits: number) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });
}

function formatSignedNumber(value: number, digits: number) {
  const formatted = formatNumber(Math.abs(value), digits);
  return `${value >= 0 ? "+" : "-"}${formatted}`;
}
