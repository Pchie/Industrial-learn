"use client";
import dynamic from "next/dynamic";
import { Component, useState, type ReactNode } from "react";
import { Alert, Button } from "@industrial-learn/design-system";
import { Orbit } from "lucide-react";
import { AnatomyOverlay, type HydraulicInspectionState } from "./hydraulic-inspection";
import styles from "./views.module.css";

const Cylinder3D = dynamic(
  () => import("./three-cylinder-view").then((module) => module.ThreeCylinderView),
  { ssr: false, loading: () => <p role="status">Loading inspection view...</p> }
);

class InspectionBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  override state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  override render() {
    return this.state.failed ? (
      <>
        <Alert title="3D inspection unavailable" tone="warning">
          The cutaway remains available.
        </Alert>
        {this.props.fallback}
      </>
    ) : (
      this.props.children
    );
  }
}

export function Interactive360Viewer(props: HydraulicInspectionState) {
  const [enabled, setEnabled] = useState(false);
  return (
    <div className={styles.inspection}>
      {enabled ? (
        <InspectionBoundary fallback={<AnatomyOverlay {...props} />}>
          <Cylinder3D {...props} />
        </InspectionBoundary>
      ) : (
        <>
          <div className={styles.controls}>
            <Button onClick={() => setEnabled(true)}>
              <Orbit size={18} aria-hidden="true" />
              Load 3D inspection
            </Button>
          </div>
          <p className={styles.caption}>
            Optional 3D download. The cutaway below is available without WebGL.
          </p>
          <AnatomyOverlay {...props} />
        </>
      )}
    </div>
  );
}
