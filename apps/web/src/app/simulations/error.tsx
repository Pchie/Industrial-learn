"use client";

import { MonitoringErrorBoundaryView } from "@/features/monitoring/error-boundary-view";

type SimulationsErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function SimulationsError({ error, reset }: SimulationsErrorProps) {
  return (
    <MonitoringErrorBoundaryView
      title="Simulation needs attention"
      description="The simulation workflow caught an unexpected problem. Saved attempt summaries remain protected."
      reference={error.digest}
      reset={reset}
    />
  );
}
