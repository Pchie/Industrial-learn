"use client";

import { Alert, Checkbox, Select } from "@industrial-learn/design-system";
import { useEffect, useMemo, useState } from "react";

import {
  ContentDepthSelector,
  DigitalMeasurement,
  EngineeringChallenge,
  EngineeringVector,
  FaultStatePanel,
  FlowPath,
  Gauge,
  LinkedComponentView,
  LiveEquation,
  MeasurementPointSelector,
  MicroTheory,
  ModeCapabilitySummary,
  ObservationPrompt,
  RealWorldApplication,
  RepresentationSwitcher,
  SimulationPlaybackControls,
  SimulationShell,
  SimulationViewport
} from "./components";
import {
  type ContentDepth,
  type EngineeringChallengeContract,
  type FaultVisualisationContract,
  type InstrumentConfiguration,
  type InstrumentType,
  type LinkedComponentDefinition,
  type LiveEquationModel,
  type MeasurementPointDefinition,
  type MeasurementReading,
  type RepresentationDefinition,
  type RepresentationMode,
  type VisualSimulationMode
} from "./contracts";
import {
  createPlaybackState,
  deriveRenderPolicy,
  evaluateChallenge,
  getModeCapability,
  pausePlayback,
  playPlayback,
  resetPlayback,
  selectLinkedComponent,
  selectMeasurementPoint,
  selectRepresentation,
  setPlaybackSpeed,
  stepPlayback
} from "./state";
import styles from "./visual-simulation.module.css";

const demoFrames = [
  {
    pressureMPa: 4,
    forceN: 8_000,
    flowMagnitude: 0.3,
    result: createDemoResult(4_000_000, 8_000)
  },
  {
    pressureMPa: 7,
    forceN: 14_000,
    flowMagnitude: 0.6,
    result: createDemoResult(7_000_000, 14_000)
  },
  {
    pressureMPa: 10,
    forceN: 20_000,
    flowMagnitude: 0.9,
    result: createDemoResult(10_000_000, 20_000)
  }
] as const;

const representations: RepresentationDefinition[] = [
  {
    mode: "external",
    label: "External",
    description: "Simplified equipment housing and controls."
  },
  {
    mode: "cutaway",
    label: "Cutaway",
    description: "Simplified internal component relationship."
  },
  {
    mode: "schematic",
    label: "Schematic",
    description: "Abstract linked engineering representation."
  }
];

const components: LinkedComponentDefinition[] = [
  {
    componentId: "DEMO-COMPONENT-CONTROL",
    label: "Control element",
    representations: {
      external: "Control handle",
      cutaway: "Control passage",
      schematic: "Control symbol"
    }
  },
  {
    componentId: "DEMO-COMPONENT-ACTUATOR",
    label: "Actuator",
    representations: {
      external: "Actuator housing",
      cutaway: "Moving element",
      schematic: "Actuator symbol"
    }
  }
];

const measurementPoints: MeasurementPointDefinition[] = [
  {
    id: "DEMO-POINT-PRESSURE",
    componentId: "DEMO-COMPONENT-CONTROL",
    label: "Demonstration pressure point",
    quantity: "pressure",
    compatibleInstruments: ["pressure-gauge", "digital-pressure"]
  },
  {
    id: "DEMO-POINT-FLOW",
    componentId: "DEMO-COMPONENT-ACTUATOR",
    label: "Demonstration flow point",
    quantity: "flow",
    compatibleInstruments: ["flow-meter"]
  }
];

const pressureGauge: InstrumentConfiguration = {
  id: "DEMO-INSTRUMENT-PRESSURE",
  type: "pressure-gauge",
  label: "Demonstration pressure gauge",
  quantity: "pressure",
  unit: "MPa",
  min: 0,
  max: 12,
  warningRange: { max: 10 },
  precision: 1
};

const flowMeter: InstrumentConfiguration = {
  id: "DEMO-INSTRUMENT-FLOW",
  type: "flow-meter",
  label: "Demonstration flow display",
  quantity: "flow",
  unit: "relative",
  min: 0,
  max: 1,
  precision: 2
};

const demoChallenge: EngineeringChallengeContract = {
  id: "DEMO-CHALLENGE-FORCE",
  objective: "Reach the demonstration force target by stepping through supplied states.",
  startingState: { forceN: 8_000 },
  allowedControls: ["play", "pause", "step", "reset"],
  conditions: [
    {
      id: "DEMO-CONDITION-FORCE",
      stateKey: "forceN",
      operator: "at-least",
      target: 15_000,
      unit: "N"
    }
  ],
  hints: ["Use Step to inspect each supplied state."],
  explanationAfterCompletion:
    "The evaluator compared the supplied force value with the target; it did not calculate force."
};

const demoFaultContract: FaultVisualisationContract = {
  faultId: "DEMO-FAULT-CONTRACT-ONLY",
  name: "Fault contract demonstration",
  affectedComponentId: "DEMO-COMPONENT-CONTROL",
  observableSymptoms: [],
  visualIndicators: [],
  measurementChanges: [],
  diagnosticEvidence: [],
  supportedModes: ["fault-diagnosis"],
  sourceIds: [],
  reviewStatus: "Draft"
};

const visualModes: Array<{ label: string; value: VisualSimulationMode }> = [
  { label: "Learn", value: "learn" },
  { label: "Guided", value: "guided" },
  { label: "Explore", value: "explore" },
  { label: "Fault diagnosis", value: "fault-diagnosis" },
  { label: "Assessment", value: "assessment" },
  { label: "Demonstration", value: "demonstration" }
];

export function VisualSimulationLab() {
  const [mode, setMode] = useState<VisualSimulationMode>("demonstration");
  const [playback, setPlayback] = useState(createPlaybackState);
  const [frameIndex, setFrameIndex] = useState(0);
  const [depth, setDepth] = useState<ContentDepth>("quick");
  const [representation, setRepresentation] = useState<RepresentationMode>("external");
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(
    components[0]?.componentId ?? null
  );
  const [instrumentType, setInstrumentType] = useState<InstrumentType>("pressure-gauge");
  const [selectedPointId, setSelectedPointId] = useState<string | null>(
    measurementPoints[0]?.id ?? null
  );
  const [selectedObservation, setSelectedObservation] = useState<string>();
  const [systemReducedMotion, setSystemReducedMotion] = useState(false);
  const [forceReducedMotion, setForceReducedMotion] = useState(false);
  const [lowData, setLowData] = useState(false);

  const reducedMotion = systemReducedMotion || forceReducedMotion;
  const renderPolicy = deriveRenderPolicy({ reducedMotion, lowData });
  const capability = getModeCapability(mode);
  const frame = demoFrames[frameIndex] ?? demoFrames[0];

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setSystemReducedMotion(media.matches);
    updatePreference();
    media.addEventListener("change", updatePreference);
    return () => media.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (reducedMotion && playback.status === "playing") {
      setPlayback((current) => pausePlayback(current));
    }
  }, [playback.status, reducedMotion]);

  useEffect(() => {
    if (playback.status !== "playing" || !renderPolicy.animate) {
      return;
    }

    const timer = window.setInterval(() => {
      setPlayback((current) => stepPlayback(current));
      setFrameIndex((current) => (current + 1) % demoFrames.length);
    }, 1200 / playback.speed);

    return () => window.clearInterval(timer);
  }, [playback.speed, playback.status, renderPolicy.animate]);

  const readings: MeasurementReading[] = useMemo(
    () => [
      {
        pointId: "DEMO-POINT-PRESSURE",
        quantity: "pressure",
        value: frame.pressureMPa,
        unit: "MPa",
        validity: "valid",
        status: "Supplied demonstration state"
      },
      {
        pointId: "DEMO-POINT-FLOW",
        quantity: "flow",
        value: frame.flowMagnitude,
        unit: "relative",
        validity: "valid",
        status: "Supplied demonstration state"
      }
    ],
    [frame]
  );

  const measurement = selectedPointId
    ? selectMeasurementPoint(measurementPoints, readings, selectedPointId, instrumentType)
    : { point: null, reading: null, error: "Select a measurement point." };

  const activeInstrument = instrumentType === "flow-meter" ? flowMeter : pressureGauge;
  const challengeEvaluation = evaluateChallenge(demoChallenge, {
    forceN: frame.forceN
  });

  function stepForward() {
    setPlayback((current) => stepPlayback(current));
    setFrameIndex((current) => (current + 1) % demoFrames.length);
  }

  function reset() {
    setPlayback(resetPlayback());
    setFrameIndex(0);
  }

  function selectComponent(componentId: string) {
    const next = selectLinkedComponent(
      { selectedComponentId },
      components.map((component) => component.componentId),
      componentId
    );
    setSelectedComponentId(next.selectedComponentId);
  }

  function changeRepresentation(requested: RepresentationMode) {
    const supported = representations.map((item) => item.mode);
    setRepresentation(selectRepresentation(supported, requested) ?? "external");
  }

  return (
    <div
      className="page-stack"
      data-low-data={lowData}
      data-reduced-motion={reducedMotion}
    >
      <section className="section-band" aria-labelledby="visual-lab-title">
        <p className="eyebrow">Private internal playground</p>
        <h1 id="visual-lab-title">Visual simulation lab</h1>
        <p>
          Demonstration state only. This page is not student content, does not record
          progress, and does not represent an approved engineering simulation.
        </p>
        <Alert title="Review boundary" tone="warning">
          All values below are a fixed interface demonstration dataset. The visual
          components consume supplied state and do not calculate engineering results.
        </Alert>
      </section>

      <section className="section-band" aria-labelledby="lab-preferences-title">
        <h2 id="lab-preferences-title">Foundation controls</h2>
        <div className={styles.preferenceGrid}>
          <Select
            label="Experience mode"
            onChange={(event) => setMode(event.target.value as VisualSimulationMode)}
            options={visualModes}
            value={mode}
          />
          <Checkbox
            checked={forceReducedMotion}
            label="Use reduced-motion presentation"
            onChange={(event) => setForceReducedMotion(event.target.checked)}
          />
          <Checkbox
            checked={lowData}
            label="Use low-data presentation"
            onChange={(event) => setLowData(event.target.checked)}
          />
          <ContentDepthSelector depth={depth} onChange={setDepth} />
        </div>
        <ModeCapabilitySummary capability={capability} />
      </section>

      <SimulationShell
        challenge={
          <EngineeringChallenge
            challenge={demoChallenge}
            evaluation={challengeEvaluation}
          />
        }
        controls={
          <>
            <RepresentationSwitcher
              activeMode={representation}
              onChange={changeRepresentation}
              representations={representations}
            />
            <Select
              label="Virtual instrument"
              onChange={(event) => {
                const nextInstrument = event.target.value as InstrumentType;
                setInstrumentType(nextInstrument);
                setSelectedPointId(
                  nextInstrument === "flow-meter"
                    ? "DEMO-POINT-FLOW"
                    : "DEMO-POINT-PRESSURE"
                );
              }}
              options={[
                { label: "Pressure gauge", value: "pressure-gauge" },
                { label: "Digital pressure", value: "digital-pressure" },
                { label: "Flow meter", value: "flow-meter" }
              ]}
              value={instrumentType}
            />
            <MeasurementPointSelector
              instrumentType={instrumentType}
              onSelect={setSelectedPointId}
              points={measurementPoints}
              selectedPointId={selectedPointId}
            />
          </>
        }
        equation={<LiveEquation model={createEquationModel(frame.result)} />}
        fault={<FaultStatePanel fault={demoFaultContract} />}
        guidance={
          <>
            <ObservationPrompt
              explanation="The displayed pressure, force vector, and equation result changed because the supplied demonstration frame changed."
              hint={
                capability.hintsVisible ? "Use Step and compare two frames." : undefined
              }
              onResponseChange={setSelectedObservation}
              prompt="What changed after stepping to the next supplied state?"
              responses={[
                { id: "pressure-force", label: "Pressure and displayed force" },
                { id: "nothing", label: "Nothing changed" }
              ]}
              selectedResponseId={selectedObservation}
            />
            <MicroTheory
              deeperTheory={
                depth === "deep-dive" ? (
                  <p>
                    Deep Dive content can include reviewed derivation, limitations, and
                    sources. This playground intentionally supplies no technical source.
                  </p>
                ) : depth === "engineering" ? (
                  <p>
                    Engineering depth can expose SI substitutions and assumptions from a
                    supplied calculation result.
                  </p>
                ) : null
              }
              engineeringNote="The renderer is downstream of calculation and simulation state."
              principle="One supplied state drives the visual, measurement, and equation presentation."
              safetyInformation={
                <Alert title="Mandatory safety context" tone="info">
                  Safety information remains visible at every explanation depth.
                </Alert>
              }
              title="One state, several representations"
            />
          </>
        }
        measurements={
          <>
            {instrumentType === "pressure-gauge" ? (
              <Gauge configuration={pressureGauge} value={frame.pressureMPa} />
            ) : (
              <DigitalMeasurement
                configuration={activeInstrument}
                reading={measurement.reading}
              />
            )}
            {measurement.error ? (
              <Alert title="Measurement unavailable" tone="warning">
                {measurement.error}
              </Alert>
            ) : null}
          </>
        }
        mode={mode}
        modeCapability={capability}
        playbackControls={
          <SimulationPlaybackControls
            disabled={!capability.controlsEnabled}
            onPause={() => setPlayback((current) => pausePlayback(current))}
            onPlay={() => setPlayback((current) => playPlayback(current))}
            onReset={reset}
            onSpeedChange={(speed) =>
              setPlayback((current) => setPlaybackSpeed(current, speed))
            }
            onStep={stepForward}
            playback={playback}
          />
        }
        status={playback.status}
        title="Reusable engineering visual foundation"
      >
        <SimulationViewport
          stateSummary={`Demonstration frame ${frameIndex + 1}. Pressure ${frame.pressureMPa.toFixed(1)} MPa. Supplied force ${frame.forceN.toLocaleString()} N. ${renderPolicy.animate ? "Flow marks may animate." : "Static direction arrows are used."}`}
          title={`${representations.find((item) => item.mode === representation)?.label ?? "Equipment"} view`}
        >
          <LinkedComponentView
            components={components}
            mode={representation}
            onSelect={selectComponent}
            selectedComponentId={selectedComponentId}
          />
          <EngineeringVector
            angleDegrees={0}
            kind="force"
            label="Supplied demonstration force"
            scale={{
              domainMin: 0,
              domainMax: 20_000,
              visualMin: 28,
              visualMax: 160
            }}
            selected={selectedComponentId === "DEMO-COMPONENT-ACTUATOR"}
            unit="N"
            value={frame.forceN}
          />
          <FlowPath
            policy={renderPolicy}
            state={{
              direction: "forward",
              magnitudeNormalized: frame.flowMagnitude,
              restricted: frameIndex === 1,
              label: "Demonstration flow path"
            }}
          />
        </SimulationViewport>
      </SimulationShell>

      <section className="section-band" aria-labelledby="application-demo-title">
        <h2 id="application-demo-title">Real-world application component</h2>
        <RealWorldApplication
          principle="A reviewed application block can connect a principle to equipment without embedding calculation logic in the illustration."
          systemType="Demonstration only"
          title="Generic actuator system"
          visualDescription="A simple original diagram showing a control element connected to an actuator."
        />
      </section>
    </div>
  );
}

function createDemoResult(pressurePa: number, forceN: number) {
  return {
    calculatedValue: forceN,
    unit: "N" as const,
    inputValues: {
      p: { value: pressurePa, unit: "Pa" },
      A: { value: 0.002, unit: "m^2" }
    },
    equationId: "DEMO-EQUATION-NOT-REVIEWED",
    calculationSteps: ["Supplied demonstration substitution."],
    assumptions: [
      "Values are fixed interface demonstration data and are not calculated in this page."
    ],
    warnings: ["Not reviewed engineering content."],
    validity: { status: "valid" as const, errors: [] }
  };
}

function createEquationModel(
  result: ReturnType<typeof createDemoResult>
): LiveEquationModel<"N"> {
  return {
    name: "Demonstration force relationship",
    expression: "F = p × A",
    symbols: [
      { symbol: "F", name: "supplied force", unit: "N" },
      { symbol: "p", name: "supplied pressure", unit: "Pa" },
      { symbol: "A", name: "supplied area", unit: "m^2" }
    ],
    result
  };
}
