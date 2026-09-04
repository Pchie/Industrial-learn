"use client";

import Link from "next/link";
import { Alert, Button, NumberInput, Slider } from "@industrial-learn/design-system";
import { useMemo, useState } from "react";

import {
  ContentDepthSelector,
  DigitalMeasurement,
  EngineeringChallenge,
  LiveEquation,
  MicroTheory,
  ObservationPrompt,
  RealWorldApplication,
  SimulationShell,
  SimulationViewport
} from "../visual-simulation/components";
import type {
  ContentDepth,
  InstrumentConfiguration
} from "../visual-simulation/contracts";
import { getModeCapability } from "../visual-simulation/state";

import { BasicFluidPressureScene } from "./basic-fluid-pressure-scene";
import type { BasicPressureExperienceContent } from "./content";
import {
  BASIC_PRESSURE_CHALLENGE,
  BASIC_PRESSURE_EQUATION,
  BASIC_PRESSURE_LIMITS,
  BASIC_PRESSURE_TARGET_KPA,
  constrainBasicPressureInput,
  createBasicPressureLessonModel,
  type BasicPressureInput
} from "./model";
import styles from "./basic-fluid-pressure-lesson.module.css";

const pressureDisplay: InstrumentConfiguration = {
  id: "DISPLAY-FLUID-PRESSURE-001",
  type: "digital-pressure",
  label: "Calculated pressure",
  quantity: "pressure",
  unit: "kPa",
  min: 0,
  max: 1_000,
  precision: 1
};

export function BasicFluidPressureVisualLesson({
  canSaveProgress = false,
  content,
  progressAction
}: {
  canSaveProgress?: boolean;
  content: BasicPressureExperienceContent;
  progressAction?: (formData: FormData) => void | Promise<void>;
}) {
  const [input, setInput] = useState<BasicPressureInput>({
    forceN: BASIC_PRESSURE_LIMITS.forceN.defaultValue,
    areaM2: BASIC_PRESSURE_LIMITS.areaM2.defaultValue
  });
  const [inputMessage, setInputMessage] = useState<string | null>(null);
  const [depth, setDepth] = useState<ContentDepth>("quick");
  const [challengeStarted, setChallengeStarted] = useState(false);
  const [challengeChecked, setChallengeChecked] = useState(false);
  const model = useMemo(() => createBasicPressureLessonModel(input), [input]);
  const pressureKPa = model.pressureDisplayConversion?.calculatedValue ?? 0;

  function updateInput(field: keyof BasicPressureInput, value: number) {
    const constrained = constrainBasicPressureInput(field, value);
    setInputMessage(constrained.message);
    if (constrained.value !== null) {
      setInput((current) => ({ ...current, [field]: constrained.value }));
      setChallengeChecked(false);
    }
  }

  function reset() {
    setInput({
      forceN: BASIC_PRESSURE_LIMITS.forceN.defaultValue,
      areaM2: BASIC_PRESSURE_LIMITS.areaM2.defaultValue
    });
    setInputMessage(null);
    setDepth("quick");
    setChallengeStarted(false);
    setChallengeChecked(false);
  }

  return (
    <div className={styles.experience} data-testid="basic-fluid-pressure-visual-lesson">
      <section aria-label="See and explore basic fluid pressure" className={styles.stage}>
        <SimulationShell
          controls={
            <PressureInputs
              input={input}
              inputMessage={inputMessage}
              onChange={updateInput}
              onReset={reset}
            />
          }
          equation={
            <LiveEquation
              model={{
                expression: BASIC_PRESSURE_EQUATION?.expression ?? "",
                name: "Pressure from normal force and area",
                result: model.pressureCalculation,
                symbols: BASIC_PRESSURE_EQUATION?.symbols ?? []
              }}
            />
          }
          eyebrow="Interactive engineering model"
          measurements={
            <DigitalMeasurement
              configuration={pressureDisplay}
              reading={model.pressureReading}
            />
          }
          mode="demonstration"
          modeCapability={getModeCapability("demonstration")}
          status={model.validity.status === "valid" ? "ready" : "invalid"}
          title="Pressure describes how force is distributed over an area."
        >
          <SimulationViewport
            announceState
            layout="single"
            stateSummary={model.stateSummary}
            title="Normal force over contact area"
          >
            <div className={styles.sceneRegion}>
              <BasicFluidPressureScene
                areaM2={input.areaM2}
                contactSideLength={model.contactSideLength}
                forceN={input.forceN}
                forceVectorLength={model.forceVectorLength}
                pressureIntensity={model.pressureIntensity}
                pressureKPa={pressureKPa}
              />
              <p className={styles.visualBoundary}>
                Force-arrow length, surface size, and pattern intensity are normalised
                visual cues. They are not physical dimensions or a time response.
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

      <section aria-labelledby="pressure-observe-title" className={styles.stage}>
        <StageHeading
          eyebrow="2. Observe"
          id="pressure-observe-title"
          title="Compare what changes"
        />
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

      <section aria-labelledby="pressure-explain-title" className={styles.stage}>
        <StageHeading
          eyebrow="3. Explain and calculate"
          id="pressure-explain-title"
          title="Choose the depth you need"
        />
        <ContentDepthSelector depth={depth} onChange={setDepth} />
        {depth === "quick" ? (
          <MicroTheory
            engineeringNote="Pressure alone does not state the total force unless the area is also known."
            principle={content.microTheory.principle}
            title={content.microTheory.title}
          />
        ) : depth === "engineering" ? (
          <div className={styles.depthPanel}>
            <h3>Engineering view</h3>
            <p>{content.microTheory.expandedExplanation}</p>
            <ol>
              {model.pressureCalculation.calculationSteps.map((step) => (
                <li key={step}>
                  <code>{step}</code>
                </li>
              ))}
            </ol>
            <p>
              Current result: {formatNumber(pressureKPa, 1)} kPa. The force acts normally
              over the stated area.
            </p>
          </div>
        ) : (
          <div className={styles.depthPanel}>
            <h3>Deep Dive</h3>
            <p>{content.deepDive.content}</p>
            <p>
              Sources: SRC-OPENSTAX-COLLEGE-PHYSICS-2012 and
              SRC-PSU-CIMBALA-PRESSURE-BASICS.
            </p>
          </div>
        )}
      </section>

      <section aria-labelledby="pressure-challenge-title" className={styles.stage}>
        <StageHeading
          eyebrow="4. Challenge"
          id="pressure-challenge-title"
          title={content.challenge.objective}
        />
        {!challengeStarted ? (
          <Button onClick={() => setChallengeStarted(true)}>Start challenge</Button>
        ) : (
          <div className={styles.challengeGrid}>
            <EngineeringChallenge
              challenge={BASIC_PRESSURE_CHALLENGE}
              evaluation={model.challenge}
              showResult={challengeChecked}
            />
            <dl className={styles.challengeReadings}>
              <div>
                <dt>Target pressure</dt>
                <dd>{BASIC_PRESSURE_TARGET_KPA} kPa</dd>
              </div>
              <div>
                <dt>Current pressure</dt>
                <dd>{formatNumber(pressureKPa, 1)} kPa</dd>
              </div>
              <div>
                <dt>Difference from target</dt>
                <dd>{formatSignedNumber(model.challengeDifferenceKPa ?? 0, 1)} kPa</dd>
              </div>
            </dl>
            <Button onClick={() => setChallengeChecked(true)} variant="secondary">
              Check current result
            </Button>
            {challengeChecked && model.challenge.complete ? (
              canSaveProgress && progressAction ? (
                <form action={progressAction}>
                  <input name="forceN" type="hidden" value={input.forceN} />
                  <input name="areaM2" type="hidden" value={input.areaM2} />
                  <Button type="submit">Save and continue to assessment</Button>
                </form>
              ) : (
                <Alert title="Sign in to save progress" tone="info">
                  <Link href="/auth/sign-in?next=%2Flessons%2Fbasic-fluid-pressure">
                    Sign in as a student
                  </Link>{" "}
                  to save this completed activity and continue to the assessment.
                </Alert>
              )
            ) : null}
          </div>
        )}
        <p className={styles.visualBoundary}>
          This target is an ideal educational calculation, not an equipment rating or
          professional design decision.
        </p>
      </section>

      <section aria-labelledby="pressure-application-title" className={styles.stage}>
        <StageHeading
          eyebrow="5. Apply"
          id="pressure-application-title"
          title="Where is this used?"
        />
        <RealWorldApplication
          principle={content.application.principle}
          systemType={content.application.systemType}
          title={content.application.title}
          visual={<PressApplicationVisual />}
          visualDescription={content.application.accessibility.textAlternative}
        />
        <p>
          Later reviewed lessons apply pressure to cylinders, pumps, valves, and complete
          systems. This foundation does not model those components.
        </p>
      </section>
    </div>
  );
}

function PressureInputs({
  input,
  inputMessage,
  onChange,
  onReset
}: {
  input: BasicPressureInput;
  inputMessage: string | null;
  onChange: (field: keyof BasicPressureInput, value: number) => void;
  onReset: () => void;
}) {
  return (
    <div className={styles.inputControls}>
      <PairedInput
        helperText="N; supplied directly to engineering-core"
        label="Normal force"
        max={BASIC_PRESSURE_LIMITS.forceN.max}
        min={BASIC_PRESSURE_LIMITS.forceN.min}
        onChange={(value) => onChange("forceN", value)}
        output={`${formatNumber(input.forceN, 0)} N`}
        step={BASIC_PRESSURE_LIMITS.forceN.step}
        value={input.forceN}
      />
      <PairedInput
        helperText="m²; area must remain greater than zero"
        label="Contact area"
        max={BASIC_PRESSURE_LIMITS.areaM2.max}
        min={BASIC_PRESSURE_LIMITS.areaM2.min}
        onChange={(value) => onChange("areaM2", value)}
        output={`${formatNumber(input.areaM2, 3)} m²`}
        step={BASIC_PRESSURE_LIMITS.areaM2.step}
        value={input.areaM2}
      />
      <Button onClick={onReset} size="sm" variant="quiet">
        Reset inputs
      </Button>
      {inputMessage ? (
        <Alert role="status" title="Input constrained" tone="warning">
          {inputMessage}
        </Alert>
      ) : null}
    </div>
  );
}

function PairedInput({
  helperText,
  label,
  max,
  min,
  onChange,
  output,
  step,
  value
}: {
  helperText: string;
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  output: string;
  step: number;
  value: number;
}) {
  return (
    <div className={styles.pairedInput}>
      <Slider
        aria-label={`${label} slider`}
        label={label}
        max={max}
        min={min}
        onChange={(event) => onChange(event.currentTarget.valueAsNumber)}
        output={output}
        step={step}
        value={value}
      />
      <NumberInput
        aria-label={`${label} numeric input`}
        helperText={helperText}
        label={`${label} value`}
        max={max}
        min={min}
        onChange={(event) => onChange(event.currentTarget.valueAsNumber)}
        step={step}
        value={value}
      />
    </div>
  );
}

function StageHeading({
  eyebrow,
  id,
  title
}: {
  eyebrow: string;
  id: string;
  title: string;
}) {
  return (
    <div className={styles.stageHeading}>
      <p>{eyebrow}</p>
      <h2 id={id}>{title}</h2>
    </div>
  );
}

function PressApplicationVisual() {
  return (
    <svg aria-hidden="true" className={styles.pressVisual} viewBox="0 0 360 190">
      <path className={styles.pressFrame} d="M 54 158 V 28 H 306 V 158" />
      <rect className={styles.pressRam} height="62" width="72" x="144" y="32" />
      <path className={styles.pressArrow} d="M 180 72 V 120" />
      <rect className={styles.pressWork} height="26" width="160" x="100" y="122" />
      <path className={styles.pressBase} d="M 70 158 H 290" />
      <text className={styles.pressText} textAnchor="middle" x="180" y="178">
        Contact area under normal force
      </text>
    </svg>
  );
}

function formatNumber(value: number, fractionDigits: number) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits
  });
}

function formatSignedNumber(value: number, fractionDigits: number) {
  return `${value >= 0 ? "+" : ""}${formatNumber(value, fractionDigits)}`;
}
