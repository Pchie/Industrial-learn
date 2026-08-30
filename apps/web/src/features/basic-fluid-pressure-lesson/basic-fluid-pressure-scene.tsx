import { useId } from "react";

import styles from "./basic-fluid-pressure-lesson.module.css";

export function BasicFluidPressureScene({
  areaM2,
  contactSideLength,
  forceN,
  forceVectorLength,
  pressureIntensity,
  pressureKPa
}: {
  areaM2: number;
  contactSideLength: number;
  forceN: number;
  forceVectorLength: number;
  pressureIntensity: number;
  pressureKPa: number;
}) {
  const markerId = `normal-force-${useId().replaceAll(":", "")}`;
  const surfaceX = (760 - contactSideLength) / 2;
  const stateDescription = `${formatNumber(forceN, 0)} newtons acts normally over ${formatNumber(areaM2, 3)} square metres, producing ${formatNumber(pressureKPa, 1)} kilopascals. The arrow and surface sizes are normalised teaching visuals, not physical dimensions.`;

  return (
    <svg
      aria-label={`Force over area pressure visual. ${stateDescription}`}
      className={styles.scene}
      role="img"
      viewBox="0 0 760 400"
    >
      <title>Normal force distributed over contact area</title>
      <desc>{stateDescription}</desc>
      <defs>
        <marker
          id={markerId}
          markerHeight="10"
          markerWidth="10"
          orient="auto"
          refX="9"
          refY="5"
          viewBox="0 0 10 10"
        >
          <path className={styles.forceArrowHead} d="M 0 0 L 10 5 L 0 10 z" />
        </marker>
        <pattern
          height="14"
          id={`${markerId}-pressure-pattern`}
          patternUnits="userSpaceOnUse"
          width="14"
        >
          <path className={styles.pressurePattern} d="M 0 14 L 14 0" />
        </pattern>
      </defs>
      <rect className={styles.sceneBackground} height="400" width="760" />
      <text className={styles.sceneTitle} textAnchor="middle" x="380" y="42">
        Force acting normally over a surface
      </text>
      {forceN > 0 ? (
        <line
          className={styles.forceArrow}
          markerEnd={`url(#${markerId})`}
          x1="380"
          x2="380"
          y1={226 - forceVectorLength}
          y2="226"
        />
      ) : null}
      <text className={styles.forceLabel} textAnchor="middle" x="470" y="132">
        F = {formatNumber(forceN, 0)} N
      </text>
      <rect
        className={styles.contactSurface}
        height="54"
        width={contactSideLength}
        x={surfaceX}
        y="240"
      />
      {pressureKPa > 0 ? (
        <rect
          className={styles.pressureField}
          fill={`url(#${markerId}-pressure-pattern)`}
          height="54"
          opacity={0.24 + pressureIntensity * 0.7}
          width={contactSideLength}
          x={surfaceX}
          y="240"
        />
      ) : null}
      <path className={styles.foundation} d="M 90 310 H 670" />
      <text className={styles.areaLabel} textAnchor="middle" x="380" y="342">
        A = {formatNumber(areaM2, 3)} m² contact area
      </text>
      <text className={styles.pressureLabel} textAnchor="middle" x="380" y="378">
        p = {formatNumber(pressureKPa, 1)} kPa
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
