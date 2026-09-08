"use client";
import { useId } from "react";
import styles from "./views.module.css";

export function AerialSystemView({
  pressure1KPa,
  pressure2KPa,
  velocity1Mps,
  velocity2Mps,
  outletDiameterMm,
  onSelectPoint,
  selectedPointId
}: {
  pressure1KPa: number;
  pressure2KPa: number;
  velocity1Mps: number;
  velocity2Mps: number;
  outletDiameterMm: number;
  onSelectPoint: (id: string) => void;
  selectedPointId: string | null;
}) {
  const id = useId().replaceAll(":", "");
  const outletHalf = Math.min(70, Math.max(25, outletDiameterMm * 0.7));
  return (
    <div className={styles.inspection}>
      <svg
        className={styles.diagram}
        role="img"
        aria-label={`Plan view of the same horizontal pipe. Upstream ${pressure1KPa.toFixed(1)} kPa absolute, ${velocity1Mps.toFixed(2)} metres per second. Downstream ${pressure2KPa.toFixed(1)} kPa absolute, ${velocity2Mps.toFixed(2)} metres per second. Both sections have equal elevation.`}
        viewBox="0 0 900 420"
      >
        <defs>
          <pattern id={id} width="16" height="16" patternUnits="userSpaceOnUse">
            <path d="M0 16L16 0" className={styles.leader} opacity=".25" />
          </pattern>
        </defs>
        <text x="210" y="48" textAnchor="middle">
          Upstream / section 1
        </text>
        <text x="680" y="48" textAnchor="middle">
          Downstream / section 2
        </text>
        <path
          d={`M60 120H345L495 ${190 - outletHalf}H840V${190 + outletHalf}H495L345 260H60Z`}
          className={styles.metal}
        />
        <path
          d={`M65 132H340L500 ${202 - outletHalf}H835V${178 + outletHalf}H500L340 248H65Z`}
          className={styles.fluid}
        />
        <path
          d={`M495 ${190 - outletHalf}H840V${190 + outletHalf}H495Z`}
          fill={`url(#${id})`}
        />
        <path
          d="M150 190H295L280 180M295 190L280 200M565 190H775L760 180M775 190L760 200"
          className={styles.force}
        />
        <text x="205" y="100" textAnchor="middle">
          P1: {pressure1KPa.toFixed(1)} kPa abs
        </text>
        <text x="685" y="100" textAnchor="middle">
          P2: {pressure2KPa.toFixed(1)} kPa abs
        </text>
        <text x="205" y="303" textAnchor="middle">
          v1: {velocity1Mps.toFixed(2)} m/s
        </text>
        <text x="685" y="303" textAnchor="middle">
          v2: {velocity2Mps.toFixed(2)} m/s
        </text>
        <path className={styles.leader} d="M80 350H820" />
        <text x="450" y="385" textAnchor="middle">
          Elevation: z1 = z2 = 0 m (shared datum)
        </text>
      </svg>
      <div className={styles.parts} role="group" aria-label="Plan pressure measurements">
        {[1, 2].map((point) => (
          <button
            key={point}
            type="button"
            aria-pressed={selectedPointId === `POINT-FLUID-BERNOULLI-${point}`}
            onClick={() => onSelectPoint(`POINT-FLUID-BERNOULLI-${point}`)}
          >
            Measure P{point}
          </button>
        ))}
      </div>
      <p className={styles.boundary}>
        Plan view of the existing two-section horizontal model, not a wider plant network.
        Arrows indicate direction, not particle speed. No additional fittings, losses or
        elevations are modelled.
      </p>
    </div>
  );
}
