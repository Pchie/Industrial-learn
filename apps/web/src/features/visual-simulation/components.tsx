import {
  Alert,
  Badge,
  Button,
  NumberInput,
  Select
} from "@industrial-learn/design-system";
import { useId, type ChangeEvent, type ReactNode } from "react";

import {
  type ChallengeEvaluation,
  type ContentDepth,
  type EngineeringChallengeContract,
  type FaultVisualisationContract,
  type FlowVisualState,
  type InstrumentConfiguration,
  type InstrumentType,
  type LinkedComponentDefinition,
  type LiveEquationModel,
  type MeasurementPointDefinition,
  type MeasurementReading,
  type PlaybackSpeed,
  type PlaybackState,
  type RenderPolicy,
  type RepresentationDefinition,
  type RepresentationMode,
  type SimulationModeCapability,
  type VectorKind,
  type VectorScale,
  type VisualSimulationMode
} from "./contracts";
import { clampGaugeValue, scaleFlowLineWeight, scaleVectorLength } from "./state";
import styles from "./visual-simulation.module.css";

function cx(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function SimulationShell({
  challenge,
  children,
  controls,
  eyebrow = "Visual simulation foundation",
  equation,
  fault,
  guidance,
  measurements,
  mode,
  modeCapability,
  playbackControls,
  primaryControls,
  status,
  title
}: {
  challenge?: ReactNode;
  children: ReactNode;
  controls?: ReactNode;
  eyebrow?: string;
  equation?: ReactNode;
  fault?: ReactNode;
  guidance?: ReactNode;
  measurements?: ReactNode;
  mode: VisualSimulationMode;
  modeCapability: SimulationModeCapability;
  playbackControls?: ReactNode;
  primaryControls?: ReactNode;
  status: string;
  title: string;
}) {
  const primaryControlsId = useId();

  return (
    <section className={styles.shell} aria-labelledby="visual-simulation-title">
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h2 id="visual-simulation-title">{title}</h2>
        </div>
        <div className={styles.statuses} aria-label="Simulation mode and status">
          <Badge tone="automation">{formatMode(mode)}</Badge>
          <Badge tone={status === "faulted" ? "fault" : "normal"}>{status}</Badge>
        </div>
        {primaryControls ? (
          <a className={styles.primaryControlJump} href={`#${primaryControlsId}`}>
            Adjust inputs
          </a>
        ) : null}
      </header>

      {playbackControls ? (
        <div className={styles.playbackRegion}>{playbackControls}</div>
      ) : null}

      {primaryControls ? (
        <div className={styles.primaryControlsRegion} id={primaryControlsId}>
          {primaryControls}
        </div>
      ) : null}

      <div className={styles.workbench}>
        <div className={styles.viewportRegion}>{children}</div>
        <aside
          className={styles.contextRegion}
          aria-label="Simulation controls and context"
        >
          {controls ? <Panel title="Controls">{controls}</Panel> : null}
          {measurements ? <Panel title="Measurements">{measurements}</Panel> : null}
          {modeCapability.equationsVisible && equation ? (
            <Panel title="Live equation">{equation}</Panel>
          ) : null}
        </aside>
      </div>

      <div className={styles.learningRegion}>
        {guidance ? <Panel title="Guidance">{guidance}</Panel> : null}
        {challenge ? <Panel title="Challenge">{challenge}</Panel> : null}
        {modeCapability.faultsEnabled && fault ? (
          <Panel title="Fault mode">{fault}</Panel>
        ) : null}
      </div>
    </section>
  );
}

export function SimulationViewport({
  announceState = false,
  children,
  layout = "split",
  stateSummary,
  title
}: {
  children: ReactNode;
  announceState?: boolean;
  layout?: "split" | "single";
  stateSummary: string;
  title: string;
}) {
  const titleId = useId();
  const summaryId = useId();

  return (
    <section
      aria-describedby={summaryId}
      aria-labelledby={titleId}
      className={styles.viewport}
    >
      <h3 className={styles.viewportTitle} id={titleId}>
        {title}
      </h3>
      <div className={cx(styles.canvas, layout === "single" && styles.canvasSingle)}>
        {children}
      </div>
      <p
        aria-live={announceState ? "polite" : "off"}
        className={styles.stateSummary}
        id={summaryId}
        role={announceState ? "status" : undefined}
      >
        <strong>Current state:</strong> {stateSummary}
      </p>
    </section>
  );
}

export function SimulationPlaybackControls({
  disabled = false,
  onPause,
  onPlay,
  onReset,
  onSpeedChange,
  onStep,
  playback
}: {
  disabled?: boolean;
  onPause: () => void;
  onPlay: () => void;
  onReset: () => void;
  onSpeedChange: (speed: PlaybackSpeed) => void;
  onStep: () => void;
  playback: PlaybackState;
}) {
  return (
    <div
      className={styles.playback}
      aria-label="Simulation playback controls"
      role="group"
    >
      <Button
        aria-pressed={playback.status === "playing"}
        disabled={disabled}
        onClick={onPlay}
        size="sm"
      >
        <span aria-hidden="true">▶</span> Play
      </Button>
      <Button disabled={disabled} onClick={onPause} size="sm" variant="secondary">
        <span aria-hidden="true">Ⅱ</span> Pause
      </Button>
      <Button disabled={disabled} onClick={onStep} size="sm" variant="secondary">
        <span aria-hidden="true">▮▶</span> Step
      </Button>
      <Button disabled={disabled} onClick={onReset} size="sm" variant="quiet">
        <span aria-hidden="true">↺</span> Reset
      </Button>
      <Select
        aria-label="Simulation speed"
        disabled={disabled}
        label="Speed"
        onChange={(event) => onSpeedChange(Number(event.target.value) as PlaybackSpeed)}
        options={[
          { label: "Slow (0.5x)", value: "0.5" },
          { label: "Normal (1x)", value: "1" },
          { label: "Fast demo (2x)", value: "2" }
        ]}
        value={String(playback.speed)}
      />
      <output className={styles.frameReadout} aria-live="off">
        Frame {playback.frame}
      </output>
    </div>
  );
}

export function ModeCapabilitySummary({
  capability
}: {
  capability: SimulationModeCapability;
}) {
  return (
    <dl className={styles.capabilityList}>
      <Capability label="Controls" value={capability.controlsEnabled} />
      <Capability label="Hints" value={capability.hintsVisible} />
      <Capability label="Equations" value={capability.equationsVisible} />
      <Capability label="Faults" value={capability.faultsEnabled} />
      <Capability label="Competency" value={capability.competencyMayBeAwarded} />
      <div>
        <dt>Persistence</dt>
        <dd>{capability.persistence}</dd>
      </div>
    </dl>
  );
}

function Capability({ label, value }: { label: string; value: boolean }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value ? "Enabled" : "Not enabled"}</dd>
    </div>
  );
}

export function FlowPath({
  path = "M 50 60 H 590",
  policy,
  state
}: {
  path?: string;
  policy: RenderPolicy;
  state: FlowVisualState;
}) {
  const markerId = useId().replaceAll(":", "");
  const lineWeight = scaleFlowLineWeight(state.magnitudeNormalized);
  const moving = state.direction !== "stopped" && policy.animate;
  const directionDescription =
    state.direction === "stopped"
      ? "Flow is stopped."
      : `Flow direction is ${state.direction}.`;

  return (
    <figure className={styles.visualFigure}>
      <svg
        aria-labelledby={`${markerId}-title ${markerId}-description`}
        className={styles.flowSvg}
        role="img"
        viewBox="0 0 640 120"
      >
        <title id={`${markerId}-title`}>{state.label}</title>
        <desc id={`${markerId}-description`}>
          {directionDescription} Relative flow magnitude is{" "}
          {state.magnitudeNormalized.toFixed(2)}.
          {state.restricted ? " The path is restricted." : ""}
        </desc>
        <defs>
          <marker
            id={markerId}
            markerHeight="8"
            markerWidth="8"
            orient="auto-start-reverse"
            refX="7"
            refY="4"
            viewBox="0 0 8 8"
          >
            <path className={styles.flowArrow} d="M 0 0 L 8 4 L 0 8 z" />
          </marker>
          <pattern
            height="8"
            id={`${markerId}-restriction`}
            patternUnits="userSpaceOnUse"
            width="8"
          >
            <path className={styles.restrictionPattern} d="M 0 8 L 8 0" />
          </pattern>
        </defs>
        <path
          className={cx(
            styles.flowBase,
            state.direction === "stopped" && styles.flowStopped,
            state.restricted && styles.flowRestricted
          )}
          d={path}
          fill="none"
          markerEnd={state.direction === "forward" ? `url(#${markerId})` : undefined}
          markerStart={state.direction === "reverse" ? `url(#${markerId})` : undefined}
          strokeWidth={lineWeight}
        />
        {state.restricted ? (
          <rect
            aria-hidden="true"
            fill={`url(#${markerId}-restriction)`}
            height="52"
            width="34"
            x="303"
            y="34"
          />
        ) : null}
        {moving
          ? Array.from({ length: policy.particleCount }, (_, index) => (
              <circle className={styles.flowParticle} key={index} r="5">
                <animateMotion
                  begin={`${index * 0.35}s`}
                  dur="2s"
                  keyPoints={state.direction === "reverse" ? "1;0" : "0;1"}
                  keyTimes="0;1"
                  path={path}
                  repeatCount="indefinite"
                />
              </circle>
            ))
          : null}
        {policy.showStaticDirectionArrows && state.direction !== "stopped" ? (
          <text className={styles.flowLabel} textAnchor="middle" x="320" y="108">
            {state.direction === "forward" ? "Flow →" : "← Flow"}
          </text>
        ) : null}
        {state.direction === "stopped" ? (
          <g aria-hidden="true" className={styles.stopMark}>
            <line x1="311" x2="329" y1="48" y2="72" />
            <line x1="329" x2="311" y1="48" y2="72" />
          </g>
        ) : null}
      </svg>
      <figcaption>{state.label}</figcaption>
    </figure>
  );
}

export function EngineeringVector({
  angleDegrees,
  kind,
  label,
  scale,
  selected = false,
  unit,
  value
}: {
  angleDegrees: number;
  kind: VectorKind;
  label: string;
  scale: VectorScale;
  selected?: boolean;
  unit: string;
  value: number;
}) {
  const markerId = useId().replaceAll(":", "");
  const length = scaleVectorLength(value, scale);
  const description = `${label}: ${value.toLocaleString()} ${unit}, direction ${angleDegrees} degrees.`;

  return (
    <figure className={styles.visualFigure}>
      <svg
        aria-label={description}
        className={cx(styles.vectorSvg, selected && styles.selectedVisual)}
        role="img"
        viewBox="0 0 320 180"
      >
        <defs>
          <marker
            id={markerId}
            markerHeight="8"
            markerWidth="8"
            orient="auto"
            refX="7"
            refY="4"
            viewBox="0 0 8 8"
          >
            <path className={styles.vectorArrow} d="M 0 0 L 8 4 L 0 8 z" />
          </marker>
        </defs>
        <circle className={styles.vectorOrigin} cx="88" cy="90" r="8" />
        {kind === "torque" ? (
          <path
            className={styles.vectorLine}
            d="M 88 42 A 48 48 0 1 1 42 103"
            fill="none"
            markerEnd={`url(#${markerId})`}
          />
        ) : (
          <g transform={`rotate(${angleDegrees} 88 90)`}>
            <line
              className={styles.vectorLine}
              markerEnd={`url(#${markerId})`}
              x1="88"
              x2={88 + length}
              y1="90"
              y2="90"
            />
          </g>
        )}
        <text className={styles.vectorLabel} x="160" y="154">
          {value.toLocaleString()} {unit}
        </text>
      </svg>
      <figcaption>
        {label} <span className={styles.muted}>({kind})</span>
      </figcaption>
    </figure>
  );
}

export function Gauge({
  configuration,
  label,
  value
}: {
  configuration: InstrumentConfiguration;
  label?: string;
  value: number;
}) {
  const range = clampGaugeValue(value, configuration.min, configuration.max);
  const normalized =
    configuration.max > configuration.min
      ? (range.displayValue - configuration.min) / (configuration.max - configuration.min)
      : 0;
  const needleAngle = -120 + normalized * 240;
  const warning = isWarningValue(value, configuration);
  const displayLabel = label ?? configuration.label;

  return (
    <figure className={styles.gauge}>
      <svg
        aria-label={`${displayLabel}: ${value.toFixed(configuration.precision)} ${configuration.unit}. Range ${configuration.min} to ${configuration.max} ${configuration.unit}.`}
        role="img"
        viewBox="0 0 220 150"
      >
        <path className={styles.gaugeArc} d="M 40 120 A 80 80 0 1 1 180 120" />
        <line
          className={cx(styles.gaugeNeedle, warning && styles.gaugeNeedleWarning)}
          style={{ transform: `rotate(${needleAngle}deg)` }}
          x1="110"
          x2="110"
          y1="120"
          y2="58"
        />
        <circle className={styles.gaugeHub} cx="110" cy="120" r="8" />
        <text className={styles.gaugeMin} x="30" y="142">
          {configuration.min}
        </text>
        <text className={styles.gaugeMax} textAnchor="end" x="190" y="142">
          {configuration.max}
        </text>
      </svg>
      <figcaption>
        <strong>{displayLabel}</strong>
        <span>
          {value.toFixed(configuration.precision)} {configuration.unit}
        </span>
        {range.clipped ? (
          <span className={styles.instrumentWarning}>
            Value is outside the display range.
          </span>
        ) : warning ? (
          <span className={styles.instrumentWarning}>Warning range</span>
        ) : null}
      </figcaption>
    </figure>
  );
}

export function DigitalMeasurement({
  configuration,
  reading
}: {
  configuration: InstrumentConfiguration;
  reading: MeasurementReading | null;
}) {
  return (
    <dl className={styles.digitalMeasurement}>
      <div>
        <dt>{configuration.label}</dt>
        <dd>
          <output aria-live="off">
            {reading && reading.validity === "valid"
              ? reading.value.toFixed(configuration.precision)
              : "Unavailable"}
          </output>{" "}
          <span>{configuration.unit}</span>
          {reading?.status ? (
            <span className={styles.measurementStatus}>{reading.status}</span>
          ) : null}
        </dd>
      </div>
    </dl>
  );
}

export function MeasurementPointSelector({
  instrumentType,
  onSelect,
  points,
  selectedPointId
}: {
  instrumentType: InstrumentType;
  onSelect: (pointId: string) => void;
  points: MeasurementPointDefinition[];
  selectedPointId: string | null;
}) {
  return (
    <fieldset className={styles.selectionGroup}>
      <legend>Measurement point</legend>
      {points.map((point) => {
        const compatible = point.compatibleInstruments.includes(instrumentType);
        return (
          <label key={point.id}>
            <input
              checked={point.id === selectedPointId}
              disabled={!compatible}
              name="measurement-point"
              onChange={() => onSelect(point.id)}
              type="radio"
              value={point.id}
            />
            <span>{point.label}</span>
            <small>{compatible ? point.quantity : "Incompatible instrument"}</small>
          </label>
        );
      })}
    </fieldset>
  );
}

export function LiveEquation({ model }: { model: LiveEquationModel }) {
  const { result } = model;

  return (
    <section className={styles.liveEquation} aria-label={`Live equation: ${model.name}`}>
      <header>
        <h3>{model.name}</h3>
        <code aria-label={`Governing equation: ${model.expression}`}>
          {model.expression}
        </code>
      </header>
      <dl className={styles.substitution}>
        {Object.entries(result.inputValues).map(([symbol, input]) => (
          <div key={symbol}>
            <dt>{symbol}</dt>
            <dd>{formatCalculationInput(input)}</dd>
          </div>
        ))}
      </dl>
      <p className={styles.equationResult}>
        <strong>Result:</strong>{" "}
        {result.calculatedValue === null
          ? "No valid result"
          : `${formatEngineeringNumber(result.calculatedValue)} ${result.unit}`}
      </p>
      {result.calculationSteps.length > 0 ? (
        <details>
          <summary>Calculation steps</summary>
          <ol>
            {result.calculationSteps.map((step) => (
              <li key={step}>
                <code>{step}</code>
              </li>
            ))}
          </ol>
        </details>
      ) : null}
      <details>
        <summary>Symbols and assumptions</summary>
        <table className={styles.symbolTable}>
          <caption>Equation symbols</caption>
          <thead>
            <tr>
              <th scope="col">Symbol</th>
              <th scope="col">Meaning</th>
              <th scope="col">SI unit</th>
            </tr>
          </thead>
          <tbody>
            {model.symbols.map((symbol) => (
              <tr key={symbol.symbol}>
                <td>{symbol.symbol}</td>
                <td>{symbol.name}</td>
                <td>{symbol.unit}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <ul>
          {result.assumptions.map((assumption) => (
            <li key={assumption}>{assumption}</li>
          ))}
        </ul>
      </details>
      {result.validity.status === "invalid" ? (
        <Alert title="Outside model validity" tone="fault">
          {result.validity.errors.join(" ")}
        </Alert>
      ) : result.warnings.length > 0 ? (
        <Alert title="Calculation warning" tone="warning">
          {result.warnings.join(" ")}
        </Alert>
      ) : null}
      <p className={styles.equationId}>
        Result supplied by <code>{result.equationId}</code>
      </p>
    </section>
  );
}

export function ObservationPrompt({
  explanation,
  hint,
  onResponseChange,
  prompt,
  responses,
  selectedResponseId
}: {
  explanation?: string | undefined;
  hint?: string | undefined;
  onResponseChange?: (responseId: string) => void;
  prompt: string;
  responses?: Array<{ id: string; label: string }>;
  selectedResponseId?: string | undefined;
}) {
  const groupId = useId();

  return (
    <section className={styles.observation} aria-labelledby={`${groupId}-title`}>
      <p className={styles.eyebrow}>Observe</p>
      <h3 id={`${groupId}-title`}>{prompt}</h3>
      {responses && responses.length > 0 ? (
        <fieldset className={styles.selectionGroup}>
          <legend>Your observation</legend>
          {responses.map((response) => (
            <label key={response.id}>
              <input
                checked={response.id === selectedResponseId}
                name={groupId}
                onChange={() => onResponseChange?.(response.id)}
                type="radio"
                value={response.id}
              />
              <span>{response.label}</span>
            </label>
          ))}
        </fieldset>
      ) : null}
      {hint ? (
        <details>
          <summary>Show hint</summary>
          <p>{hint}</p>
        </details>
      ) : null}
      {explanation ? (
        <details>
          <summary>Reveal explanation</summary>
          <p>{explanation}</p>
        </details>
      ) : null}
      <p className={styles.muted}>Observation activity: not graded.</p>
    </section>
  );
}

export function MicroTheory({
  children,
  deeperTheory,
  engineeringNote,
  principle,
  safetyInformation,
  title
}: {
  children?: ReactNode;
  deeperTheory?: ReactNode;
  engineeringNote?: string;
  principle: string;
  safetyInformation?: ReactNode;
  title: string;
}) {
  return (
    <section className={styles.microTheory}>
      <p className={styles.eyebrow}>Micro theory</p>
      <h3>{title}</h3>
      <p>{principle}</p>
      {children}
      {engineeringNote ? (
        <p>
          <strong>Engineering note:</strong> {engineeringNote}
        </p>
      ) : null}
      {safetyInformation}
      {deeperTheory ? (
        <details>
          <summary>Explain more</summary>
          {deeperTheory}
        </details>
      ) : null}
    </section>
  );
}

export function ContentDepthSelector({
  availableDepths = ["quick", "engineering", "deep-dive"],
  depth,
  onChange
}: {
  availableDepths?: ContentDepth[];
  depth: ContentDepth;
  onChange: (depth: ContentDepth) => void;
}) {
  const options: Array<{ id: ContentDepth; label: string }> = [
    { id: "quick", label: "Quick" },
    { id: "engineering", label: "Engineering" },
    { id: "deep-dive", label: "Deep Dive" }
  ];

  return (
    <fieldset className={styles.segmentedControl}>
      <legend>Explanation depth</legend>
      <div>
        {options
          .filter((option) => availableDepths.includes(option.id))
          .map((option) => (
            <label key={option.id}>
              <input
                checked={depth === option.id}
                name="content-depth"
                onChange={() => onChange(option.id)}
                type="radio"
                value={option.id}
              />
              <span>{option.label}</span>
            </label>
          ))}
      </div>
    </fieldset>
  );
}

export function RepresentationSwitcher({
  activeMode,
  onChange,
  representations
}: {
  activeMode: RepresentationMode;
  onChange: (mode: RepresentationMode) => void;
  representations: RepresentationDefinition[];
}) {
  return (
    <fieldset className={styles.segmentedControl}>
      <legend>Equipment view</legend>
      <div>
        {representations.map((representation) => (
          <label key={representation.mode}>
            <input
              checked={activeMode === representation.mode}
              name="representation-mode"
              onChange={() => onChange(representation.mode)}
              type="radio"
              value={representation.mode}
            />
            <span>{representation.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function LinkedComponentView({
  components,
  mode,
  onSelect,
  selectedComponentId
}: {
  components: LinkedComponentDefinition[];
  mode: RepresentationMode;
  onSelect: (componentId: string) => void;
  selectedComponentId: string | null;
}) {
  return (
    <section
      className={styles.linkedView}
      aria-label={`${formatMode(mode)} representation`}
    >
      <div className={styles.componentDiagram} data-representation={mode}>
        {components.map((component) => {
          const representation = component.representations[mode];
          if (!representation) {
            return null;
          }

          const selected = selectedComponentId === component.componentId;
          return (
            <button
              aria-pressed={selected}
              className={cx(styles.componentButton, selected && styles.componentSelected)}
              key={component.componentId}
              onClick={() => onSelect(component.componentId)}
              type="button"
            >
              <span aria-hidden="true" className={styles.componentSymbol}>
                {mode === "schematic" ? "◇" : mode === "cutaway" ? "◫" : "▣"}
              </span>
              <span>{representation}</span>
            </button>
          );
        })}
      </div>
      <p className={styles.muted}>
        Shared component ID: <code>{selectedComponentId ?? "none selected"}</code>
      </p>
    </section>
  );
}

export function EngineeringChallenge({
  challenge,
  evaluation,
  showResult = true
}: {
  challenge: EngineeringChallengeContract;
  evaluation: ChallengeEvaluation;
  showResult?: boolean;
}) {
  return (
    <section className={styles.challenge} aria-labelledby={`${challenge.id}-title`}>
      <h3 id={`${challenge.id}-title`}>{challenge.objective}</h3>
      <ul>
        {challenge.conditions.map((condition) => {
          const result = evaluation.conditions.find(
            (candidate) => candidate.conditionId === condition.id
          );
          return (
            <li key={condition.id}>
              <strong>
                {!showResult ? "Target" : result?.met ? "Condition met" : "Not yet"}:
              </strong>{" "}
              {condition.operator}{" "}
              {(condition.displayTarget ?? condition.target).toLocaleString()}{" "}
              {condition.displayUnit ?? condition.unit}
            </li>
          );
        })}
      </ul>
      <Badge tone={showResult && evaluation.complete ? "normal" : "info"}>
        {!showResult
          ? "Ready to check"
          : evaluation.complete
            ? "Challenge complete"
            : "Condition not met"}
      </Badge>
      <p aria-live="polite" role="status">
        {!showResult
          ? (challenge.explanationBeforeCompletion ??
            "Adjust the permitted controls, then check your result.")
          : evaluation.complete
            ? challenge.explanationAfterCompletion
            : (challenge.explanationBeforeCompletion ??
              "The target condition is not yet met.")}
      </p>
    </section>
  );
}

export function FaultStatePanel({ fault }: { fault: FaultVisualisationContract }) {
  return (
    <Alert title={fault.name} tone="fault">
      <p>Affected component: {fault.affectedComponentId}</p>
      <p>Review status: {fault.reviewStatus}</p>
      <p>This contract does not inject or calculate a fault.</p>
    </Alert>
  );
}

export function RealWorldApplication({
  principle,
  relatedSimulation,
  systemType,
  title,
  visual,
  visualDescription
}: {
  principle: string;
  relatedSimulation?: string | undefined;
  systemType: string;
  title: string;
  visual?: ReactNode;
  visualDescription: string;
}) {
  return (
    <article className={styles.application}>
      <div aria-label={visualDescription} className={styles.applicationVisual} role="img">
        {visual ?? (
          <>
            <span aria-hidden="true">▱</span>
            <span aria-hidden="true">→</span>
            <span aria-hidden="true">▰</span>
          </>
        )}
      </div>
      <div>
        <p className={styles.eyebrow}>{systemType}</p>
        <h3>{title}</h3>
        <p>{principle}</p>
        {relatedSimulation ? <p>Related simulation: {relatedSimulation}</p> : null}
      </div>
    </article>
  );
}

export function VisualBlockReference({
  accessibilityLabel,
  description,
  referenceId,
  title,
  type
}: {
  accessibilityLabel: string;
  description: string;
  referenceId?: string | undefined;
  title: string;
  type: string;
}) {
  return (
    <section aria-label={accessibilityLabel} className={styles.referenceBlock}>
      <p className={styles.eyebrow}>{type}</p>
      <h3>{title}</h3>
      <p>{description}</p>
      {referenceId ? (
        <p>
          Reference: <code>{referenceId}</code>
        </p>
      ) : null}
    </section>
  );
}

export function VisualNumberControl({
  label,
  max,
  min,
  onChange,
  step,
  unit,
  value
}: {
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  step: number;
  unit: string;
  value: number;
}) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(Number(event.target.value));
  }

  return (
    <NumberInput
      helperText={`Accepted range ${min} to ${max} ${unit}.`}
      label={`${label} (${unit})`}
      max={max}
      min={min}
      onChange={handleChange}
      step={step}
      value={value}
    />
  );
}

function Panel({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className={styles.panel}>
      <h3>{title}</h3>
      {children}
    </section>
  );
}

function formatCalculationInput(input: unknown) {
  if (input && typeof input === "object" && "value" in input && "unit" in input) {
    const value = input.value;
    return `${typeof value === "number" ? formatEngineeringNumber(value) : String(value)} ${String(input.unit)}`;
  }

  return String(input);
}

function formatEngineeringNumber(value: number) {
  return value.toLocaleString(undefined, {
    maximumFractionDigits: 9,
    maximumSignificantDigits: 8
  });
}

function isWarningValue(value: number, configuration: InstrumentConfiguration) {
  const range = configuration.warningRange;
  if (!range) {
    return false;
  }

  return (range.min !== undefined && value < range.min) ||
    (range.max !== undefined && value > range.max)
    ? true
    : false;
}

function formatMode(mode: string) {
  return mode
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
