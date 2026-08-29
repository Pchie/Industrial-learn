import { useId, type KeyboardEvent } from "react";

import type { RepresentationMode } from "../visual-simulation/contracts";

import styles from "./bernoulli-flow-lab.module.css";

export function BernoulliFlowScene({
  flowRateLps,
  outletDiameterMm,
  onSelectComponent,
  onSelectPoint,
  presentationPlaying,
  pressure1KPa,
  pressure2KPa,
  pressureHead1M,
  pressureHead2M,
  representation,
  selectedComponentId,
  selectedPointId,
  totalHeadM,
  velocity1Mps,
  velocity2Mps,
  velocityHead1M,
  velocityHead2M
}: {
  flowRateLps: number;
  outletDiameterMm: number;
  onSelectComponent: (componentId: string) => void;
  onSelectPoint: (pointId: string) => void;
  presentationPlaying: boolean;
  pressure1KPa: number;
  pressure2KPa: number;
  pressureHead1M: number;
  pressureHead2M: number;
  representation: RepresentationMode;
  selectedComponentId: string | null;
  selectedPointId: string;
  totalHeadM: number;
  velocity1Mps: number;
  velocity2Mps: number;
  velocityHead1M: number;
  velocityHead2M: number;
}) {
  const id = useId().replaceAll(":", "");
  const markerId = `bernoulli-arrow-${id}`;
  const outletHalfHeight = 24 + ((outletDiameterMm - 20) / 40) * 48;
  const outletTop = 224 - outletHalfHeight;
  const outletBottom = 224 + outletHalfHeight;
  const selectedPoint = selectedPointId.endsWith("1") ? "point 1" : "point 2";
  const description = `${flowRateLps.toFixed(1)} litres per second moves left to right. Section 1 average velocity is ${velocity1Mps.toFixed(2)} metres per second at ${pressure1KPa.toFixed(1)} kilopascals absolute. Section 2 average velocity is ${velocity2Mps.toFixed(2)} metres per second at ${pressure2KPa.toFixed(1)} kilopascals absolute. ${selectedPoint} is selected.`;

  if (representation === "schematic") {
    return (
      <svg
        aria-label={`Linked Bernoulli schematic. ${description}`}
        className={styles.sceneSvg}
        role="group"
        viewBox="0 0 980 520"
      >
        <title>Linked two-section Bernoulli schematic</title>
        <desc>{description}</desc>
        <defs>
          <marker
            id={markerId}
            markerHeight="9"
            markerWidth="9"
            orient="auto"
            refX="8"
            refY="4.5"
            viewBox="0 0 9 9"
          >
            <path className={styles.flowArrowHead} d="M0 0 L9 4.5 L0 9 Z" />
          </marker>
        </defs>
        <rect className={styles.sceneBackground} height="520" width="980" />
        <text className={styles.sceneTitle} x="40" y="48">
          Linked hydraulic schematic
        </text>
        <path
          className={styles.schematicPipe}
          d="M90 224 H390 L500 178 H860 M390 224 L500 270 H860"
        />
        <path
          className={styles.flowDirection}
          d="M120 224 H820"
          markerEnd={`url(#${markerId})`}
        />
        <SchematicSection
          componentId="COMP-FLUID-BERNOULLI-SECTION-1"
          label="SECTION 1"
          onSelect={onSelectComponent}
          selected={selectedComponentId === "COMP-FLUID-BERNOULLI-SECTION-1"}
          x={255}
        />
        <SchematicSection
          componentId="COMP-FLUID-BERNOULLI-SECTION-2"
          label="SECTION 2"
          onSelect={onSelectComponent}
          selected={selectedComponentId === "COMP-FLUID-BERNOULLI-SECTION-2"}
          x={675}
        />
        <MeasurementPoint
          id="POINT-FLUID-BERNOULLI-1"
          label="P1"
          onSelect={onSelectPoint}
          selected={selectedPointId === "POINT-FLUID-BERNOULLI-1"}
          x={255}
          y={224}
        />
        <MeasurementPoint
          id="POINT-FLUID-BERNOULLI-2"
          label="P2"
          onSelect={onSelectPoint}
          selected={selectedPointId === "POINT-FLUID-BERNOULLI-2"}
          x={675}
          y={224}
        />
        <text className={styles.sceneLabel} textAnchor="middle" x="255" y="350">
          D1 = 60 mm
        </text>
        <text className={styles.sceneLabel} textAnchor="middle" x="675" y="350">
          D2 = {outletDiameterMm.toFixed(0)} mm
        </text>
        <text className={styles.modelNote} x="40" y="488">
          Direction and measurement linkage only. No valve, pump, loss, or transient model
          is implied.
        </text>
      </svg>
    );
  }

  return (
    <svg
      aria-label={`Cutaway ideal pipe-flow view. ${description}`}
      className={styles.sceneSvg}
      role="group"
      viewBox="0 0 980 520"
    >
      <title>Horizontal pipe contraction with two measurement points</title>
      <desc>{description}</desc>
      <defs>
        <clipPath id={`pipe-clip-${id}`}>
          <path
            d={`M72 146 H390 L510 ${outletTop} H908 V${outletBottom} H510 L390 302 H72 Z`}
          />
        </clipPath>
        <marker
          id={markerId}
          markerHeight="9"
          markerWidth="9"
          orient="auto"
          refX="8"
          refY="4.5"
          viewBox="0 0 9 9"
        >
          <path className={styles.flowArrowHead} d="M0 0 L9 4.5 L0 9 Z" />
        </marker>
      </defs>
      <rect className={styles.sceneBackground} height="520" width="980" />
      <text className={styles.sceneTitle} x="40" y="44">
        Horizontal ideal flow through a contraction
      </text>

      <g
        aria-label="Select physical section 1"
        aria-pressed={selectedComponentId === "COMP-FLUID-BERNOULLI-SECTION-1"}
        className={selectedClass(
          selectedComponentId === "COMP-FLUID-BERNOULLI-SECTION-1"
        )}
        onClick={() => onSelectComponent("COMP-FLUID-BERNOULLI-SECTION-1")}
        onKeyDown={(event) =>
          activateWithKeyboard(event, () =>
            onSelectComponent("COMP-FLUID-BERNOULLI-SECTION-1")
          )
        }
        role="button"
        tabIndex={0}
      >
        <path className={styles.pipeWall} d="M72 146 H390 M72 302 H390" />
        <rect
          className={styles.selectionTarget}
          height="190"
          width="318"
          x="72"
          y="130"
        />
      </g>
      <g
        aria-label="Select physical contraction"
        aria-pressed={selectedComponentId === "COMP-FLUID-BERNOULLI-CONTRACTION"}
        className={selectedClass(
          selectedComponentId === "COMP-FLUID-BERNOULLI-CONTRACTION"
        )}
        onClick={() => onSelectComponent("COMP-FLUID-BERNOULLI-CONTRACTION")}
        onKeyDown={(event) =>
          activateWithKeyboard(event, () =>
            onSelectComponent("COMP-FLUID-BERNOULLI-CONTRACTION")
          )
        }
        role="button"
        tabIndex={0}
      >
        <path
          className={styles.pipeWall}
          d={`M390 146 L510 ${outletTop} M390 302 L510 ${outletBottom}`}
        />
        <path className={styles.selectionTarget} d="M382 130 H518 V318 H382 Z" />
      </g>
      <g
        aria-label="Select physical section 2"
        aria-pressed={selectedComponentId === "COMP-FLUID-BERNOULLI-SECTION-2"}
        className={selectedClass(
          selectedComponentId === "COMP-FLUID-BERNOULLI-SECTION-2"
        )}
        onClick={() => onSelectComponent("COMP-FLUID-BERNOULLI-SECTION-2")}
        onKeyDown={(event) =>
          activateWithKeyboard(event, () =>
            onSelectComponent("COMP-FLUID-BERNOULLI-SECTION-2")
          )
        }
        role="button"
        tabIndex={0}
      >
        <path
          className={styles.pipeWall}
          d={`M510 ${outletTop} H908 M510 ${outletBottom} H908`}
        />
        <rect
          className={styles.selectionTarget}
          height={outletHalfHeight * 2 + 32}
          width="398"
          x="510"
          y={outletTop - 16}
        />
      </g>

      <path
        className={styles.fluidBody}
        clipPath={`url(#pipe-clip-${id})`}
        d="M62 128 H920 V320 H62 Z"
      />
      <path
        className={styles.flowDirection}
        d="M104 224 H850"
        markerEnd={`url(#${markerId})`}
      />
      {[0, 1, 2].map((index) => (
        <circle
          aria-hidden="true"
          className={`${styles.flowParticle} ${
            presentationPlaying ? "" : styles.flowParticlePaused
          }`}
          cx="120"
          cy="224"
          key={index}
          r="7"
          style={{ animationDelay: `${index * -0.8}s` }}
        />
      ))}
      <text className={styles.flowLabel} textAnchor="middle" x="490" y="352">
        Q = {flowRateLps.toFixed(1)} L/s; presentation motion is not a time solution
      </text>

      <MeasurementPoint
        id="POINT-FLUID-BERNOULLI-1"
        label="P1"
        onSelect={onSelectPoint}
        selected={selectedPointId === "POINT-FLUID-BERNOULLI-1"}
        x={270}
        y={146}
      />
      <MeasurementPoint
        id="POINT-FLUID-BERNOULLI-2"
        label="P2"
        onSelect={onSelectPoint}
        selected={selectedPointId === "POINT-FLUID-BERNOULLI-2"}
        x={700}
        y={outletTop}
      />

      <VelocityArrow
        label={`v1 ${velocity1Mps.toFixed(2)} m/s`}
        markerId={markerId}
        relativeLength={Math.min(125, 48 + velocity1Mps * 8)}
        x={178}
        y={224}
      />
      <VelocityArrow
        label={`v2 ${velocity2Mps.toFixed(2)} m/s`}
        markerId={markerId}
        relativeLength={Math.min(150, 48 + velocity2Mps * 8)}
        x={620}
        y={224}
      />

      <HeadStack
        pressureHead={pressureHead1M}
        totalHead={totalHeadM}
        velocityHead={velocityHead1M}
        x={226}
      />
      <HeadStack
        pressureHead={pressureHead2M}
        totalHead={totalHeadM}
        velocityHead={velocityHead2M}
        x={656}
      />
      <text className={styles.modelNote} x="40" y="492">
        Horizontal ideal model: z1 = z2 = 0 m. Head bars are normalised visual
        comparisons, not physical column dimensions.
      </text>
    </svg>
  );
}

function MeasurementPoint({
  id,
  label,
  onSelect,
  selected,
  x,
  y
}: {
  id: string;
  label: string;
  onSelect: (pointId: string) => void;
  selected: boolean;
  x: number;
  y: number;
}) {
  return (
    <g
      aria-label={`Select ${label} pressure measurement point`}
      aria-pressed={selected}
      className={selected ? styles.pointSelected : styles.point}
      onClick={() => onSelect(id)}
      onKeyDown={(event) => activateWithKeyboard(event, () => onSelect(id))}
      role="button"
      tabIndex={0}
    >
      <line className={styles.pressureTap} x1={x} x2={x} y1={y} y2={82} />
      <circle className={styles.measurementPoint} cx={x} cy={y} r="11" />
      <text className={styles.pointLabel} textAnchor="middle" x={x} y="68">
        {label}
      </text>
    </g>
  );
}

function VelocityArrow({
  label,
  markerId,
  relativeLength,
  x,
  y
}: {
  label: string;
  markerId: string;
  relativeLength: number;
  x: number;
  y: number;
}) {
  return (
    <g aria-hidden="true">
      <path
        className={styles.velocityArrow}
        d={`M${x} ${y} H${x + relativeLength}`}
        markerEnd={`url(#${markerId})`}
      />
      <text
        className={styles.velocityLabel}
        textAnchor="middle"
        x={x + relativeLength / 2}
        y={y - 20}
      >
        {label}
      </text>
    </g>
  );
}

function HeadStack({
  pressureHead,
  totalHead,
  velocityHead,
  x
}: {
  pressureHead: number;
  totalHead: number;
  velocityHead: number;
  x: number;
}) {
  const scale = 104 / Math.max(totalHead, 1);
  const pressureHeight = pressureHead * scale;
  const velocityHeight = velocityHead * scale;
  const baseY = 456;

  return (
    <g aria-hidden="true">
      <rect
        className={styles.pressureHead}
        height={pressureHeight}
        width="86"
        x={x}
        y={baseY - pressureHeight}
      />
      <rect
        className={styles.velocityHead}
        height={velocityHeight}
        width="86"
        x={x}
        y={baseY - pressureHeight - velocityHeight}
      />
      <rect
        className={styles.headOutline}
        height="104"
        width="86"
        x={x}
        y={baseY - 104}
      />
      <text className={styles.headLabel} textAnchor="middle" x={x + 43} y="476">
        ideal head
      </text>
    </g>
  );
}

function SchematicSection({
  componentId,
  label,
  onSelect,
  selected,
  x
}: {
  componentId: string;
  label: string;
  onSelect: (componentId: string) => void;
  selected: boolean;
  x: number;
}) {
  return (
    <g
      aria-label={`Select schematic ${label.toLowerCase()}`}
      aria-pressed={selected}
      className={selected ? styles.schematicSelected : styles.schematicSection}
      onClick={() => onSelect(componentId)}
      onKeyDown={(event) => activateWithKeyboard(event, () => onSelect(componentId))}
      role="button"
      tabIndex={0}
    >
      <rect height="116" width="174" x={x - 87} y="166" />
      <text className={styles.sceneLabel} textAnchor="middle" x={x} y="324">
        {label}
      </text>
    </g>
  );
}

function selectedClass(selected: boolean) {
  return selected ? styles.selectableSelected : styles.selectable;
}

function activateWithKeyboard(event: KeyboardEvent<SVGGElement>, activate: () => void) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    activate();
  }
}
