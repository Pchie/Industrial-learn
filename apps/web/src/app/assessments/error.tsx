"use client";

import { MonitoringErrorBoundaryView } from "@/features/monitoring/error-boundary-view";

type AssessmentsErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AssessmentsError({ error, reset }: AssessmentsErrorProps) {
  return (
    <MonitoringErrorBoundaryView
      title="Assessment attempt needs attention"
      description="The assessment workflow caught an unexpected problem. Your answers are protected; try again when ready."
      reference={error.digest}
      reset={reset}
    />
  );
}
