"use client";

import { MonitoringErrorBoundaryView } from "@/features/monitoring/error-boundary-view";

type ReviewErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ReviewError({ error, reset }: ReviewErrorProps) {
  return (
    <MonitoringErrorBoundaryView
      title="Review workflow needs attention"
      description="The engineering review workflow caught an unexpected problem. Reviewer records are not exposed in this error state."
      reference={error.digest}
      reset={reset}
    />
  );
}
