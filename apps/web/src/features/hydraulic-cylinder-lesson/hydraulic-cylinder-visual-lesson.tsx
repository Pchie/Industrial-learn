"use client";

import { Alert, Button, NumberInput, Slider } from "@industrial-learn/design-system";
import Link from "next/link";
import { useMemo, useState } from "react";

import {
  ContentDepthSelector,
  EngineeringChallenge,
  Gauge,
  LiveEquation,
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
  scaleVectorLength
} from "../visual-simulation/state";

import type { HydraulicCylinderExperienceContent } from "./content";
import { HydraulicCylinderScene } from "./hydraulic-cylinder-scene";
import {
  constrainHydraulicCylinderInput,
  createHydraulicCylinderLessonModel,
  HYDRAULIC_CYLINDER_CHALLENGE,
  HYDRAULIC_CYLINDER_FORCE_VECTOR_SCALE,
  HYDRAULIC_CYLINDER_LESSON_LIMITS,
  type HydraulicCylinderLessonInput
} from "./model";
import styles from "./hydraulic-cylinder-lesson.module.css";

const pressureGauge: InstrumentConfiguration = {
  id: "GAUGE-HYD-CYL-PRESSURE-001",
  type: "pressure-gauge",
  label: "Cap-end chamber pressure",
  quantity: "pressure",
  unit: "MPa",
  min: 0,
  max: 20,
  precision: 1
};

const linkedComponents: LinkedComponentDefinition[] = [
  {
    componentId: "COMP-HYD-SOURCE-001",
    label: "Pressure source",
    representations: {
      external: "Pressure source",
      cutaway: "Pressure source",
      schematic: "Pressure-source symbol"
    }
  },
  {
    componentId: "COMP-HYD-CYL-PISTON-001",
    label: "Cylinder",
    representations: {
      external: "Cylinder exterior",
      cutaway: "Piston and cap-end chamber",
      schematic: "Cylinder symbol"
    }
  },
  {
    componentId: "COMP-HYD-LOAD-001",
    label: "Training load",
    representations: {
      external: "External training load",
      cutaway: "External training load",
      schematic: "Opposing-force condition"
    }
  }
];

const representations: RepresentationDefinition[] = [
  {
    mode: "external",
    label: "External",
    description: "Cylinder exterior, pressure source and load"
  },
  {
    mode: "cutaway",
    label: "Cutaway",
    description: "Cap-end chamber, piston and rod"
  },
  {
    mode: "schematic",
    label: "Schematic",
    description: "Pressure source, line and cylinder symbol"
  }
];

export function HydraulicCylinderVisualLesson({
  content
}: {
  content: HydraulicCylinderExperienceContent;
}) {
  const [input, setInput] = useState<HydraulicCylinderLessonInput>({
    pressureMPa: HYDRAULIC_CYLINDER_LESSON_LIMITS.pressureMPa.defaultValue,
    pistonDiameterMm: HYDRAULIC_CYLINDER_LESSON_LIMITS.pistonDiameterMm.defaultValue
  });
  const [inputMessage, setInputMessage] = useState<string | null>(null);
  const [representation, setRepresentation] = useState<RepresentationMode>("cutaway");
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(
    "COMP-HYD-CYL-PISTON-001"
  );
  const [depth, setDepth] = useState<ContentDepth>("quick");
  const [challengeStarted, setChallengeStarted] = useState(false);
  const [challengeChecked, setChallengeChecked] = useState(false);

  const model = useMemo(() => createHydraulicCylinderLessonModel(input), [input]);
  const capability = getModeCapability("learn");
  const forceN = model.forceCalculation?.calculatedValue ?? 0;
  const forceKN = model.forceDisplayConversion?.calculatedValue ?? 0;
  const pressureMPa = model.pressureDisplayConversion?.calculatedValue ?? 0;
  const areaM2 = model.areaCalculation?.calculatedValue ?? 0;
  const forceVectorLength = scaleVectorLength(
    forceN,
    HYDRAULIC_CYLINDER_FORCE_VECTOR_SCALE
  );

  function updateInput(field: keyof HydraulicCylinderLessonInput, value: number) {
    const constrained = constrainHydraulicCylinderInput(field, value);
    setInputMessage(constrained.message);
    if (constrained.value !== null) {
      setInput((current) => ({ ...current, [field]: constrained.value }));
      setChallengeChecked(false);
    }
  }

  function reset() {
    setInput({
      pressureMPa: HYDRAULIC_CYLINDER_LESSON_LIMITS.pressureMPa.defaultValue,
      pistonDiameterMm: HYDRAULIC_CYLINDER_LESSON_LIMITS.pistonDiameterMm.defaultValue
    });
    setRepresentation("cutaway");
    setSelectedComponentId("COMP-HYD-CYL-PISTON-001");
    setDepth("quick");
    setChallengeStarted(false);
    setChallengeChecked(false);
    setInputMessage(null);
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
  }

  return (
    <div className={styles.experience} data-testid="hydraulic-cylinder-visual-lesson">
      <section
        aria-label="See and explore hydraulic cylinder force"
        className={styles.stage}
      >
        <SimulationShell
          measurements={
            <div className={styles.measurements}>
              <Gauge configuration={pressureGauge} value={pressureMPa} />
              <dl className={styles.outputReadings}>
                <div>
                  <dt>Cap-end piston area</dt>
                  <dd>
                    <output>{formatNumber(areaM2, 8)}</output> m²
                  </dd>
                </div>
                <div>
                  <dt>Theoretical extension force</dt>
                  <dd>
                    <output>{formatNumber(forceKN, 2)}</output> kN
                  </dd>
                </div>
              </dl>
            </div>
          }
          mode="learn"
          modeCapability={capability}
          primaryControls={
            <div className={styles.primaryControls}>
              <HydraulicInputs
                input={input}
                inputMessage={inputMessage}
                onChange={updateInput}
              />
              <Button onClick={reset} size="sm" variant="quiet">
                Reset inputs
              </Button>
            </div>
          }
          status={model.validity.status === "valid" ? "ready" : "invalid"}
          title="Pressure acting over piston area produces force."
        >
          <SimulationViewport
            announceState
            layout="single"
            stateSummary={
              model.visualState?.summary ??
              "Inputs are outside the visual model validity boundary."
            }
            title="Hydraulic cylinder visual model"
          >
            <div className={styles.sceneRegion}>
              <RepresentationSwitcher
                activeMode={representation}
                onChange={setRepresentation}
                representations={representations}
              />
              <HydraulicCylinderScene
                forceKN={forceKN}
                forceVectorLength={forceVectorLength}
                onSelectComponent={selectComponent}
                pistonDiameterRatio={
                  model.visualState?.components["COMP-HYD-CYL-PISTON-001"]?.extension
                    ?.displayDiameterRatio ?? 0
                }
                pressureMPa={pressureMPa}
                representation={representation}
                selectedComponentId={selectedComponentId}
              />
              <ol className={styles.sceneLegend} aria-label="Hydraulic state path">
                <li>Pressure source</li>
                <li>Pressurised line</li>
                <li>Cap-end chamber</li>
                <li>Piston and rod</li>
                <li>15 kN target load</li>
              </ol>
              <p className={styles.pressureStateNote}>
                Pressurised hydraulic state. Flow rate and piston velocity are not
                calculated by this model. Force-arrow length is normalised and is not a
                physical distance.
              </p>
            </div>
          </SimulationViewport>
        </SimulationShell>

        {model.validity.status === "invalid" ? (
          <Alert role="alert" title="Outside model validity" tone="fault">
            {model.validity.errors.join(" ")}
          </Alert>
        ) : null}
      </section>

      <section aria-labelledby="observe-title" className={styles.stage}>
        <div className={styles.stageHeading}>
          <p>2. Play with it, then observe</p>
          <h2 id="observe-title">Compare what changes</h2>
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

      <section aria-labelledby="explain-title" className={styles.stage}>
        <div className={styles.stageHeading}>
          <p>3. Explain and calculate</p>
          <h2 id="explain-title">Connect the visual state to the equations</h2>
        </div>
        <ContentDepthSelector
          availableDepths={["quick", "engineering"]}
          depth={depth}
          onChange={setDepth}
        />
        <MicroTheory
          engineeringNote="Pressure alone does not define actuator force; the effective pressurised area is also required."
          principle={content.microTheory.principle}
          title={content.microTheory.title}
        />

        {depth === "quick" ? (
          <div className={styles.quickEquation}>
            <strong>Pressure × piston area → theoretical extension force</strong>
            <span>
              Current state: {input.pressureMPa} MPa, {input.pistonDiameterMm} mm piston,{" "}
              {formatNumber(forceKN, 2)} kN theoretical force.
            </span>
          </div>
        ) : model.areaCalculation && model.forceCalculation ? (
          <div className={styles.equationGrid}>
            <LiveEquation
              model={{
                expression: "A = πD² / 4",
                name: "Cap-end piston area",
                result: model.areaCalculation,
                symbols: [
                  { symbol: "A", name: "cap-end piston area", unit: "m²" },
                  { symbol: "D", name: "piston diameter", unit: "m" }
                ]
              }}
            />
            <LiveEquation
              model={{
                expression: "F = p × A",
                name: "Ideal theoretical extension force",
                result: model.forceCalculation,
                symbols: [
                  { symbol: "F", name: "theoretical extension force", unit: "N" },
                  { symbol: "p", name: "cap-end pressure", unit: "Pa" },
                  { symbol: "A", name: "cap-end piston area", unit: "m²" }
                ]
              }}
            />
          </div>
        ) : null}

        <p className={styles.deepDiveLink}>
          Detailed derivation, SI reasoning and model limitations remain available in the
          optional Deep Dive below the main learning path.
        </p>
      </section>

      <section aria-labelledby="challenge-title" className={styles.stage}>
        <div className={styles.stageHeading}>
          <p>4. Challenge</p>
          <h2 id="challenge-title">{content.challenge.objective}</h2>
        </div>
        <p>{content.challenge.description}</p>
        {!challengeStarted ? (
          <Button onClick={() => setChallengeStarted(true)}>Start load challenge</Button>
        ) : (
          <div className={styles.challengeGrid}>
            <EngineeringChallenge
              challenge={HYDRAULIC_CYLINDER_CHALLENGE}
              evaluation={model.challenge}
              showResult={challengeChecked}
            />
            <dl className={styles.challengeReadings}>
              <div>
                <dt>Required theoretical force</dt>
                <dd>{HYDRAULIC_CYLINDER_CHALLENGE.conditions[0]?.displayTarget} kN</dd>
              </div>
              <div>
                <dt>Calculated theoretical force</dt>
                <dd>{formatNumber(forceKN, 2)} kN</dd>
              </div>
              <div>
                <dt>Margin</dt>
                <dd>
                  {formatSignedNumber(
                    model.challengeMarginDisplayConversion?.calculatedValue ?? 0,
                    2
                  )}{" "}
                  kN
                </dd>
              </div>
            </dl>
            <Button onClick={() => setChallengeChecked(true)} variant="secondary">
              Check current result
            </Button>
          </div>
        )}
        <p className={styles.modelBoundary}>
          This idealised challenge does not establish that a real cylinder design or
          lifting operation is safe.
        </p>
      </section>

      <section aria-labelledby="application-title" className={styles.stage}>
        <div className={styles.stageHeading}>
          <p>5. Apply</p>
          <h2 id="application-title">Where is this used?</h2>
        </div>
        <RealWorldApplication
          principle={content.application.principle}
          relatedSimulation={content.application.relatedSimulationId}
          systemType={content.application.systemType}
          title={content.application.title}
          visual={<ExcavatorApplicationVisual />}
          visualDescription={content.application.accessibility.textAlternative}
        />
        <p>
          Real boom performance also depends on linkage geometry, load position, losses,
          cylinder mounting and system pressure. The pressure-area relationship alone does
          not predict machine lifting capacity.
        </p>
      </section>

      <section aria-label="Next learning actions" className={styles.nextActions}>
        <Alert title="Fault diagnosis" tone="info">
          Fault diagnosis is introduced in a later hydraulic system lesson. No unsupported
          fault is active in this visual pilot.
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
            href="/assessments/staging-pressure-check"
          >
            Open formal assessment
          </Link>
        </div>
        <p>
          The formal assessment remains authenticated and server scored. Operating this
          visual lesson alone does not award progress or competency.
        </p>
      </section>
    </div>
  );
}

function HydraulicInputs({
  input,
  inputMessage,
  onChange
}: {
  input: HydraulicCylinderLessonInput;
  inputMessage: string | null;
  onChange: (field: keyof HydraulicCylinderLessonInput, value: number) => void;
}) {
  const pressure = HYDRAULIC_CYLINDER_LESSON_LIMITS.pressureMPa;
  const diameter = HYDRAULIC_CYLINDER_LESSON_LIMITS.pistonDiameterMm;

  return (
    <div className={styles.inputControls}>
      <div className={styles.pairedInput}>
        <Slider
          aria-label="Pressure slider"
          label="Pressure"
          max={pressure.max}
          min={pressure.min}
          onChange={(event) => onChange("pressureMPa", event.currentTarget.valueAsNumber)}
          output={`${input.pressureMPa} MPa`}
          step={pressure.step}
          value={input.pressureMPa}
        />
        <NumberInput
          aria-label="Pressure numeric input"
          helperText="MPa; converted explicitly to Pa"
          label="Pressure value"
          max={pressure.max}
          min={pressure.min}
          onChange={(event) => onChange("pressureMPa", event.currentTarget.valueAsNumber)}
          step={pressure.step}
          value={input.pressureMPa}
        />
      </div>
      <div className={styles.pairedInput}>
        <Slider
          aria-label="Piston diameter slider"
          label="Piston diameter"
          max={diameter.max}
          min={diameter.min}
          onChange={(event) =>
            onChange("pistonDiameterMm", event.currentTarget.valueAsNumber)
          }
          output={`${input.pistonDiameterMm} mm`}
          step={diameter.step}
          value={input.pistonDiameterMm}
        />
        <NumberInput
          aria-label="Piston diameter numeric input"
          helperText="mm; converted explicitly to m"
          label="Piston diameter value"
          max={diameter.max}
          min={diameter.min}
          onChange={(event) =>
            onChange("pistonDiameterMm", event.currentTarget.valueAsNumber)
          }
          step={diameter.step}
          value={input.pistonDiameterMm}
        />
      </div>
      <p className={styles.rangeNote}>
        Interaction bounds: {pressure.min}–{pressure.max} MPa and {diameter.min}–
        {diameter.max} mm. These are educational controls, not equipment ratings.
      </p>
      {inputMessage ? (
        <Alert role="status" title="Input constrained" tone="warning">
          {inputMessage}
        </Alert>
      ) : null}
    </div>
  );
}

function ExcavatorApplicationVisual() {
  return (
    <svg
      aria-hidden="true"
      className={styles.excavatorSvg}
      focusable="false"
      viewBox="0 0 360 190"
    >
      <path className={styles.excavatorGround} d="M 22 166 H 338" />
      <rect
        className={styles.excavatorTrack}
        height="28"
        rx="12"
        width="132"
        x="46"
        y="132"
      />
      <path className={styles.excavatorBody} d="M 74 130 L 88 82 H 158 L 188 130 Z" />
      <path className={styles.excavatorBoom} d="M 158 92 L 258 40 L 274 58 L 181 114 Z" />
      <path
        className={styles.excavatorStick}
        d="M 258 45 L 306 111 L 290 121 L 248 59 Z"
      />
      <path
        className={styles.excavatorBucket}
        d="M 302 108 Q 340 120 326 154 L 286 140 Z"
      />
      <line className={styles.excavatorCylinder} x1="150" x2="240" y1="108" y2="60" />
      <circle className={styles.excavatorPin} cx="150" cy="108" r="5" />
      <circle className={styles.excavatorPin} cx="240" cy="60" r="5" />
      <text className={styles.excavatorLabel} x="178" y="142">
        Boom cylinder
      </text>
    </svg>
  );
}

function formatNumber(value: number, maximumFractionDigits: number) {
  return value.toLocaleString(undefined, { maximumFractionDigits });
}

function formatSignedNumber(value: number, maximumFractionDigits: number) {
  const formatted = Math.abs(value).toLocaleString(undefined, {
    maximumFractionDigits
  });
  return `${value >= 0 ? "+" : "−"}${formatted}`;
}
