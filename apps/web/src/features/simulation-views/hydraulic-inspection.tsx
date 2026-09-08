"use client";
import { useEffect, useId, useState } from "react";
import { Button } from "@industrial-learn/design-system";
import { Pause, Play, RotateCcw, StepForward } from "lucide-react";
import styles from "./views.module.css";

export const cylinderParts = [
  "Barrel",
  "Piston",
  "Rod",
  "Seals",
  "End caps",
  "Chambers"
] as const;
export type CylinderPart = (typeof cylinderParts)[number];
export type HydraulicInspectionState = {
  pressureMPa: number;
  forceKN: number;
  diameterRatio: number;
};
export const cylinderInspectionSource = "SRC-PARKER-140H8-CYLINDER-2024";

export function AnatomyOverlay(props: HydraulicInspectionState) {
  return <CylinderInspection {...props} exploded={false} />;
}
export function ExplodedAssemblyView(props: HydraulicInspectionState) {
  return <CylinderInspection {...props} exploded />;
}

function CylinderInspection({
  pressureMPa,
  forceKN,
  diameterRatio,
  exploded
}: HydraulicInspectionState & { exploded: boolean }) {
  const [selected, setSelected] = useState<CylinderPart>("Piston");
  const [separation, setSeparation] = useState(75);
  const [pose, setPose] = useState(25);
  const [playing, setPlaying] = useState(false);
  const [reduced, setReduced] = useState(false);
  const id = useId().replaceAll(":", "");
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      setReduced(media.matches);
      if (media.matches) setPlaying(false);
    };
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  useEffect(() => {
    if (!playing || reduced || pressureMPa <= 0 || exploded) return;
    const timer = window.setInterval(
      () => setPose((value) => Math.min(100, value + 1)),
      40
    );
    return () => window.clearInterval(timer);
  }, [playing, reduced, pressureMPa, exploded]);
  useEffect(() => {
    if (pose >= 100 || pressureMPa <= 0) setPlaying(false);
  }, [pose, pressureMPa]);
  const gap = exploded ? separation * 0.6 : 0;
  const pistonX = 340 + (exploded ? 0 : pose * 1.6);
  const halfHeight = 52 + Math.min(1, Math.max(0, diameterRatio)) * 30;
  const partClass = (part: CylinderPart, base: string | undefined) =>
    `${base} ${selected === part ? styles.selected : ""}`;
  return (
    <div className={styles.inspection}>
      <svg
        className={styles.diagram}
        role="img"
        aria-label={`${exploded ? "Exploded" : "Cutaway"} cylinder. ${selected} selected. ${pressureMPa} MPa cap-end pressure; ${forceKN.toFixed(2)} kN ideal force. Illustrative geometry, not a service drawing.`}
        viewBox="0 0 900 420"
      >
        <defs>
          <linearGradient id={`${id}-metal`} x2="0" y2="1">
            <stop stopColor="var(--il-material-metal-light)" />
            <stop offset=".5" stopColor="var(--il-material-metal-mid)" />
            <stop offset="1" stopColor="var(--il-material-metal-dark)" />
          </linearGradient>
        </defs>
        <path className={styles.leader} strokeDasharray="8 6" d="M40 220H870" />
        <g transform={`translate(0 ${-gap})`}>
          <path
            d={`M180 ${204 - halfHeight}H650V${214 - halfHeight}H200V${226 + halfHeight}H650V${236 + halfHeight}H180Z`}
            className={partClass("Barrel", styles.metal)}
            fill={`url(#${id}-metal)`}
          />
          <path
            d={`M180 ${204 - halfHeight}H650L678 ${190 - halfHeight}H208Z`}
            className={styles.rod}
          />
        </g>
        <text x="420" y="42" textAnchor="middle">
          Barrel / cutaway
        </text>
        <rect
          x={180 - gap}
          y={210 - halfHeight}
          width="30"
          height={20 + halfHeight * 2}
          rx="5"
          className={partClass("End caps", styles.metal)}
        />
        <rect
          x={650 + gap}
          y={210 - halfHeight}
          width="30"
          height={20 + halfHeight * 2}
          rx="5"
          className={partClass("End caps", styles.metal)}
        />
        {!exploded ? (
          <>
            <rect
              x="212"
              y={215 - halfHeight}
              width={pistonX - 212}
              height={10 + halfHeight * 2}
              className={partClass("Chambers", styles.fluid)}
            />
            <path d="M235 345V280" className={styles.force} />
            <path d="M225 294L235 280L245 294" className={styles.force} />
            <text x="235" y="380" textAnchor="middle">
              Cap-end: {pressureMPa.toFixed(1)} MPa
            </text>
            <text x="560" y="345" textAnchor="middle" className={styles.labelSmall}>
              Rod-side force not modelled
            </text>
          </>
        ) : (
          <text x="450" y="408" textAnchor="middle" className={styles.labelSmall}>
            Separated for inspection, not a disassembly sequence
          </text>
        )}
        <g transform={`translate(${gap * 0.4} ${gap})`}>
          <rect
            x={pistonX + 20}
            y="206"
            width="300"
            height="28"
            rx="4"
            className={partClass("Rod", styles.rod)}
          />
          <rect
            x={pistonX}
            y={220 - halfHeight}
            width="46"
            height={halfHeight * 2}
            rx="4"
            className={partClass("Piston", styles.metal)}
          />
          <rect
            x={pistonX + 10}
            y={215 - halfHeight}
            width="8"
            height={halfHeight * 2 + 10}
            rx="3"
            className={partClass("Seals", styles.seal)}
          />
          <rect
            x={pistonX + 30}
            y={215 - halfHeight}
            width="8"
            height={halfHeight * 2 + 10}
            rx="3"
            className={partClass("Seals", styles.seal)}
          />
        </g>
        <text x="805" y="163" textAnchor="middle">
          Rod
        </text>
        {!exploded && forceKN > 0 ? (
          <path d="M730 184H848L835 175M848 184L835 193" className={styles.force} />
        ) : null}
        <text x="790" y="113" textAnchor="middle">
          {forceKN.toFixed(2)} kN
        </text>
        <text x="110" y="111" textAnchor="middle">
          End cap
        </text>
      </svg>
      <div className={styles.parts} role="group" aria-label="Cylinder parts">
        {cylinderParts.map((part) => (
          <button
            type="button"
            key={part}
            aria-pressed={part === selected}
            onClick={() => setSelected(part)}
          >
            {part}
          </button>
        ))}
      </div>
      <p className={styles.caption} role="status">
        Selected: <strong>{selected}</strong>.{" "}
        {selected === "Chambers"
          ? "The shaded cap-end receives the pressure used in F = p × A. The rod-side chamber is shown for orientation only."
          : "The highlighted shape identifies its position within the simplified assembly."}
      </p>
      <div className={styles.controls}>
        {exploded ? (
          <label>
            Assembly separation
            <input
              aria-label="Assembly separation"
              type="range"
              min="0"
              max="100"
              value={separation}
              onChange={(e) => setSeparation(Number(e.target.value))}
            />
          </label>
        ) : (
          <>
            <label>
              Illustrative piston position
              <input
                aria-label="Illustrative piston position"
                type="range"
                min="0"
                max="100"
                value={pose}
                onChange={(e) => {
                  setPlaying(false);
                  setPose(Number(e.target.value));
                }}
              />
            </label>
            <Button
              variant="secondary"
              disabled={reduced || pressureMPa <= 0 || pose >= 100}
              onClick={() => setPlaying(true)}
            >
              <Play size={16} aria-hidden="true" />
              Demonstrate extension
            </Button>
            <Button variant="quiet" onClick={() => setPlaying(false)}>
              <Pause size={16} aria-hidden="true" />
              Pause
            </Button>
            <Button
              variant="quiet"
              disabled={pressureMPa <= 0 || pose >= 100}
              onClick={() => {
                setPlaying(false);
                setPose((value) => Math.min(100, value + 10));
              }}
            >
              <StepForward size={16} aria-hidden="true" />
              Step
            </Button>
            <Button
              variant="quiet"
              onClick={() => {
                setPlaying(false);
                setPose(25);
              }}
            >
              <RotateCcw size={16} aria-hidden="true" />
              Reset pose
            </Button>
          </>
        )}
      </div>
      <p className={styles.boundary}>
        Engineering review required. Original schematic geometry; not a manufacturer
        drawing, seal specification or maintenance procedure. Motion is illustrative only;
        no stroke, speed or flow is calculated. Source: {cylinderInspectionSource},
        catalog p. 3 (parts) and p. 26 (force).
      </p>
    </div>
  );
}
