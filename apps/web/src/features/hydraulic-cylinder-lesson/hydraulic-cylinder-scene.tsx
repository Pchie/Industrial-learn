import { useId, type KeyboardEvent } from "react";

import type { RepresentationMode } from "../visual-simulation/contracts";

import styles from "./hydraulic-cylinder-lesson.module.css";

export function HydraulicCylinderScene({
  forceKN,
  forceVectorLength,
  onSelectComponent,
  pistonDiameterRatio,
  pressureMPa,
  representation,
  selectedComponentId
}: {
  forceKN: number;
  forceVectorLength: number;
  onSelectComponent: (componentId: string) => void;
  pistonDiameterRatio: number;
  pressureMPa: number;
  representation: RepresentationMode;
  selectedComponentId: string | null;
}) {
  const id = useId().replaceAll(":", "");
  const forceMarkerId = `force-arrow-${id}`;
  const pistonHeight = 82 + pistonDiameterRatio * 68;
  const pistonX = 544;
  const pistonY = 220 - pistonHeight / 2;
  const pressureActive = pressureMPa > 0;
  const loadY = 184;
  const stateDescription = `${pressureMPa.toLocaleString()} megapascals is applied to the cap-end chamber. The circular piston produces ${forceKN.toLocaleString(undefined, { maximumFractionDigits: 2 })} kilonewtons of ideal theoretical extension force. No piston velocity or stroke is calculated.`;

  if (representation === "schematic") {
    return (
      <svg
        aria-label={`Hydraulic cylinder schematic. ${stateDescription}`}
        className={styles.sceneSvg}
        role="group"
        viewBox="0 0 960 440"
      >
        <title>Hydraulic cylinder schematic</title>
        <desc>{stateDescription}</desc>
        <defs>
          <marker
            id={forceMarkerId}
            markerHeight="10"
            markerWidth="10"
            orient="auto"
            refX="9"
            refY="5"
            viewBox="0 0 10 10"
          >
            <path className={styles.forceArrowHead} d="M 0 0 L 10 5 L 0 10 z" />
          </marker>
        </defs>
        <rect className={styles.sceneBackground} height="440" width="960" />
        <text className={styles.sceneTitle} x="48" y="52">
          Simplified hydraulic schematic
        </text>
        <g>
          <rect className={styles.reservoir} height="88" width="112" x="60" y="262" />
          <path className={styles.reservoirFluid} d="M 72 304 H 160 V 338 H 72 Z" />
          <text className={styles.sceneLabel} textAnchor="middle" x="116" y="380">
            Supply context
          </text>
        </g>
        <g>
          <circle className={styles.pressureSource} cx="252" cy="220" r="54" />
          <text className={styles.sourceSymbol} textAnchor="middle" x="252" y="230">
            P
          </text>
          <text className={styles.sceneLabel} textAnchor="middle" x="252" y="300">
            Pressure source
          </text>
        </g>
        <path
          className={pressureActive ? styles.pressurisedLine : styles.inactiveLine}
          d="M 306 220 H 472"
        />
        <circle className={styles.measurementPoint} cx="402" cy="220" r="10" />
        <text className={styles.smallLabel} textAnchor="middle" x="402" y="194">
          P1
        </text>
        <g
          aria-label="Select schematic cylinder"
          aria-pressed={selectedComponentId === "COMP-HYD-CYL-PISTON-001"}
          className={selectedClass(selectedComponentId === "COMP-HYD-CYL-PISTON-001")}
          onClick={() => onSelectComponent("COMP-HYD-CYL-PISTON-001")}
          onKeyDown={(event) =>
            activateWithKeyboard(event, () =>
              onSelectComponent("COMP-HYD-CYL-PISTON-001")
            )
          }
          role="button"
          tabIndex={0}
        >
          <rect
            className={styles.schematicCylinder}
            height="128"
            width="262"
            x="472"
            y="156"
          />
          <line className={styles.schematicPiston} x1="608" x2="608" y1="156" y2="284" />
          <line className={styles.schematicRod} x1="608" x2="808" y1="220" y2="220" />
          <path
            className={styles.forceArrow}
            d={`M 738 220 H ${738 + forceVectorLength}`}
            markerEnd={`url(#${forceMarkerId})`}
          />
          <text className={styles.sceneLabel} textAnchor="middle" x="603" y="332">
            Double-area symbol shown for extension concept only
          </text>
        </g>
        <text className={styles.pressureLabel} x="342" y="252">
          {pressureMPa.toLocaleString()} MPa
        </text>
        <text className={styles.forceLabel} textAnchor="middle" x="804" y="188">
          {formatForce(forceKN)}
        </text>
        <text className={styles.modelNote} x="48" y="414">
          Pressurised state only. Flow rate, speed, valves and relief functions are not
          modelled.
        </text>
      </svg>
    );
  }

  const cutaway = representation === "cutaway";

  return (
    <svg
      aria-label={`${cutaway ? "Cutaway" : "External"} hydraulic cylinder view. ${stateDescription}`}
      className={styles.sceneSvg}
      role="group"
      viewBox="0 0 960 440"
    >
      <title>
        {cutaway ? "Hydraulic cylinder cutaway" : "Hydraulic cylinder exterior"}
      </title>
      <desc>{stateDescription}</desc>
      <defs>
        <linearGradient id={`barrel-${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#d7dee5" />
          <stop offset="0.48" stopColor="#f7f9fa" />
          <stop offset="1" stopColor="#aeb9c3" />
        </linearGradient>
        <pattern
          height="12"
          id={`pressure-pattern-${id}`}
          width="12"
          patternUnits="userSpaceOnUse"
        >
          <path
            className={styles.pressurePattern}
            d="M -3 3 L 3 -3 M 0 12 L 12 0 M 9 15 L 15 9"
          />
        </pattern>
        <marker
          id={forceMarkerId}
          markerHeight="10"
          markerWidth="10"
          orient="auto"
          refX="9"
          refY="5"
          viewBox="0 0 10 10"
        >
          <path className={styles.forceArrowHead} d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
      </defs>
      <rect className={styles.sceneBackground} height="440" width="960" />
      <text className={styles.sceneTitle} x="48" y="48">
        {cutaway ? "Cap-end extension cutaway" : "Hydraulic actuator exterior"}
      </text>
      <g>
        <rect className={styles.reservoir} height="78" width="105" x="48" y="280" />
        <path className={styles.reservoirFluid} d="M 60 316 H 141 V 346 H 60 Z" />
        <text className={styles.smallLabel} textAnchor="middle" x="100" y="384">
          Supply context
        </text>
        <circle className={styles.pressureSource} cx="215" cy="250" r="45" />
        <text className={styles.sourceSymbol} textAnchor="middle" x="215" y="260">
          P
        </text>
        <text className={styles.smallLabel} textAnchor="middle" x="215" y="318">
          Pressure source
        </text>
      </g>
      <path
        className={pressureActive ? styles.pressurisedLine : styles.inactiveLine}
        d="M 260 250 H 326 V 276 H 366"
      />
      <circle className={styles.measurementPoint} cx="326" cy="250" r="10" />
      <text className={styles.smallLabel} textAnchor="middle" x="326" y="226">
        P1
      </text>
      <text className={styles.pressureLabel} x="272" y="302">
        {pressureMPa.toLocaleString()} MPa
      </text>

      <g
        aria-label="Select physical cylinder"
        aria-pressed={selectedComponentId === "COMP-HYD-CYL-PISTON-001"}
        className={selectedClass(selectedComponentId === "COMP-HYD-CYL-PISTON-001")}
        onClick={() => onSelectComponent("COMP-HYD-CYL-PISTON-001")}
        onKeyDown={(event) =>
          activateWithKeyboard(event, () => onSelectComponent("COMP-HYD-CYL-PISTON-001"))
        }
        role="button"
        tabIndex={0}
      >
        <rect
          fill={`url(#barrel-${id})`}
          className={styles.cylinderBarrel}
          height="210"
          rx="16"
          width="430"
          x="356"
          y="108"
        />
        {cutaway ? (
          <>
            <rect
              className={pressureActive ? styles.pressureChamber : styles.inactiveChamber}
              fill={pressureActive ? `url(#pressure-pattern-${id})` : undefined}
              height="174"
              width={Math.max(0, pistonX - 374)}
              x="374"
              y="126"
            />
            <rect
              className={styles.piston}
              height={pistonHeight}
              width="24"
              x={pistonX}
              y={pistonY}
            />
            <text
              className={styles.smallLabel}
              textAnchor="middle"
              x={pistonX + 12}
              y="92"
            >
              Piston
            </text>
            <text className={styles.smallLabel} textAnchor="middle" x="440" y="170">
              Pressurised cap-end chamber
            </text>
          </>
        ) : (
          <text className={styles.externalLabel} textAnchor="middle" x="570" y="220">
            Select Cutaway to inspect the piston and chamber
          </text>
        )}
        <rect
          className={styles.rod}
          height="30"
          rx="10"
          width={830 - pistonX}
          x={pistonX + 20}
          y="205"
        />
      </g>

      <path
        className={styles.forceArrow}
        d={`M 686 164 H ${686 + forceVectorLength}`}
        markerEnd={`url(#${forceMarkerId})`}
      />
      <text className={styles.forceLabel} textAnchor="middle" x="770" y="144">
        Theoretical force {formatForce(forceKN)}
      </text>
      <g className={styles.loadWaiting}>
        <rect className={styles.loadBlock} height="82" width="76" x="846" y={loadY} />
        <text className={styles.loadText} textAnchor="middle" x="884" y={loadY + 36}>
          LOAD
        </text>
        <text className={styles.loadText} textAnchor="middle" x="884" y={loadY + 58}>
          15 kN
        </text>
      </g>
      <text className={styles.modelNote} x="48" y="414">
        Static pressure state. Flow rate, piston speed, stroke and load motion are not
        calculated.
      </text>
    </svg>
  );

  function selectedClass(selected: boolean) {
    return selected ? styles.selectableSelected : styles.selectable;
  }
}

function activateWithKeyboard(event: KeyboardEvent<SVGGElement>, activate: () => void) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    activate();
  }
}

function formatForce(forceKN: number) {
  return `${forceKN.toFixed(2)} kN`;
}
