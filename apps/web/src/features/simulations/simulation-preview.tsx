import type { SimulationPreviewMetadata } from "./catalog";
import styles from "./simulation-lab.module.css";

export function SimulationPreview({
  preview,
  size = "card",
  active = false,
  accessibleDescription,
  boundaryState
}: {
  preview: SimulationPreviewMetadata;
  size?: "card" | "detail";
  active?: boolean;
  accessibleDescription?: string;
  boundaryState?:
    | {
        massCrossing: boolean;
        energyCrossing: boolean;
        consistent: boolean;
      }
    | undefined;
}) {
  return (
    <figure
      className={`${styles.preview} ${
        size === "detail" ? styles.previewDetail : styles.previewCard
      }`}
      data-testid="simulation-preview"
    >
      {preview.kind === "hydraulic-cylinder" ? (
        <svg
          aria-label={accessibleDescription ?? preview.alt}
          className={styles.previewSvg}
          role="img"
          viewBox="0 0 760 320"
        >
          <rect className={styles.previewBackdrop} height="320" width="760" />
          <text className={styles.previewCaption} x="40" y="46">
            PRESSURE SOURCE
          </text>
          <circle className={styles.previewSource} cx="95" cy="160" r="47" />
          <path className={styles.previewSourceArrow} d="M75 180 L112 143" />
          <path className={styles.previewSourceArrowHead} d="M99 144 L114 141 L111 156" />
          <text className={styles.previewSymbol} x="84" y="174">
            P
          </text>
          <path className={styles.previewLine} d="M142 160 H250 V218 H315" />
          <circle className={styles.previewMeasurement} cx="250" cy="160" r="12" />
          <text className={styles.previewSmallLabel} x="228" y="130">
            P1
          </text>
          <rect
            className={styles.previewCylinder}
            height="120"
            rx="5"
            width="300"
            x="315"
            y="98"
          />
          <rect
            className={`${styles.previewChamber} ${
              active ? styles.previewChamberActive : ""
            }`}
            height="108"
            width="112"
            x="321"
            y="104"
          />
          <rect
            className={styles.previewPiston}
            height="108"
            width="20"
            x="433"
            y="104"
          />
          <rect className={styles.previewRod} height="30" width="205" x="453" y="143" />
          <path className={styles.previewForce} d="M603 78 H700" />
          <path className={styles.previewForceHead} d="M700 78 L680 65 M700 78 L680 91" />
          <text className={styles.previewForceLabel} x="620" y="52">
            FORCE
          </text>
          <text className={styles.previewChamberLabel} x="331" y="258">
            PRESSURISED
          </text>
          <text className={styles.previewChamberLabel} x="350" y="279">
            CHAMBER
          </text>
          <text className={styles.previewCylinderLabel} x="520" y="279">
            CYLINDER
          </text>
        </svg>
      ) : preview.kind === "bernoulli-flow" ? (
        <svg
          aria-label={accessibleDescription ?? preview.alt}
          className={styles.previewSvg}
          role="img"
          viewBox="0 0 760 320"
        >
          <rect className={styles.previewBackdrop} height="320" width="760" />
          <text className={styles.previewCaption} x="38" y="42">
            IDEAL HORIZONTAL FLOW
          </text>
          <path className={styles.previewBernoulliPipe} d="M45 98 H285 L410 133 H715" />
          <path className={styles.previewBernoulliPipe} d="M45 246 H285 L410 211 H715" />
          <path
            className={styles.previewBernoulliFluid}
            d="M51 108 H283 L406 143 H709 V201 H406 L283 236 H51 Z"
          />
          <path className={styles.previewBernoulliFlow} d="M90 172 H665" />
          <path
            className={styles.previewBernoulliFlowHead}
            d="M665 172 L644 158 M665 172 L644 186"
          />
          <circle className={styles.previewMeasurement} cx="205" cy="98" r="11" />
          <circle className={styles.previewMeasurement} cx="550" cy="133" r="11" />
          <text className={styles.previewSmallLabel} textAnchor="middle" x="205" y="76">
            P1
          </text>
          <text className={styles.previewSmallLabel} textAnchor="middle" x="550" y="111">
            P2
          </text>
          <path className={styles.previewBernoulliVelocity} d="M125 172 H235" />
          <path className={styles.previewBernoulliVelocity} d="M470 172 H630" />
          <text className={styles.previewSmallLabel} textAnchor="middle" x="180" y="203">
            v1
          </text>
          <text className={styles.previewSmallLabel} textAnchor="middle" x="550" y="203">
            v2
          </text>
          <text
            className={styles.previewChamberLabel}
            textAnchor="middle"
            x="205"
            y="286"
          >
            SECTION 1
          </text>
          <text
            className={styles.previewChamberLabel}
            textAnchor="middle"
            x="550"
            y="286"
          >
            SECTION 2
          </text>
        </svg>
      ) : preview.kind === "thermodynamic-boundary" ? (
        <svg
          aria-label={accessibleDescription ?? preview.alt}
          className={styles.previewSvg}
          role="img"
          viewBox="0 0 760 320"
        >
          <rect className={styles.previewBackdrop} height="320" width="760" />
          <text className={styles.previewCaption} x="38" y="42">
            SURROUNDINGS
          </text>
          <rect
            className={`${styles.previewBoundary} ${
              boundaryState && !boundaryState.consistent
                ? styles.previewBoundaryFault
                : ""
            }`}
            height="190"
            rx="76"
            width="390"
            x="185"
            y="66"
          />
          <rect
            className={styles.previewThermalSystem}
            height="94"
            rx="6"
            width="210"
            x="275"
            y="113"
          />
          <text
            className={styles.previewBoundaryLabel}
            textAnchor="middle"
            x="380"
            y="155"
          >
            SELECTED SYSTEM
          </text>
          <text className={styles.previewSmallLabel} textAnchor="middle" x="380" y="184">
            STATED BOUNDARY
          </text>
          <path
            className={`${styles.previewCrossing} ${
              boundaryState && !boundaryState.massCrossing
                ? styles.previewCrossingHeld
                : ""
            }`}
            d={
              boundaryState && !boundaryState.massCrossing
                ? "M58 134 H170"
                : "M58 134 H302"
            }
          />
          <path
            className={styles.previewCrossingHead}
            d={
              boundaryState && !boundaryState.massCrossing
                ? "M170 123 V145"
                : "M302 134 L284 122 M302 134 L284 146"
            }
          />
          <text className={styles.previewCrossingLabel} x="58" y="108">
            {boundaryState
              ? boundaryState.massCrossing
                ? "MASS MAY CROSS"
                : "MASS HELD"
              : "MASS CROSSING?"}
          </text>
          <path
            className={`${styles.previewCrossing} ${
              boundaryState && !boundaryState.energyCrossing
                ? styles.previewCrossingHeld
                : ""
            }`}
            d={
              boundaryState && !boundaryState.energyCrossing
                ? "M590 224 H702"
                : "M458 224 H702"
            }
          />
          <path
            className={styles.previewCrossingHead}
            d={
              boundaryState && !boundaryState.energyCrossing
                ? "M590 213 V235"
                : "M458 224 L476 212 M458 224 L476 236"
            }
          />
          <text className={styles.previewCrossingLabel} textAnchor="end" x="702" y="268">
            {boundaryState
              ? boundaryState.energyCrossing
                ? "ENERGY MAY CROSS"
                : "ENERGY HELD"
              : "ENERGY CROSSING?"}
          </text>
          {boundaryState && !boundaryState.consistent ? (
            <text
              className={styles.previewFaultLabel}
              textAnchor="middle"
              x="380"
              y="294"
            >
              BOUNDARY MUST BE RESTATED
            </text>
          ) : null}
        </svg>
      ) : (
        <div aria-label={preview.alt} className={styles.previewFallback} role="img">
          <span>Engineering schematic preview</span>
        </div>
      )}
      <figcaption>{preview.lowDataDescription}</figcaption>
    </figure>
  );
}
