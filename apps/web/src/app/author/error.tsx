"use client";

import { MonitoringErrorBoundaryView } from "@/features/monitoring/error-boundary-view";

type AuthorErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AuthorError({ error, reset }: AuthorErrorProps) {
  return (
    <MonitoringErrorBoundaryView
      title="Authoring workspace needs attention"
      description="The content authoring workflow caught an unexpected problem. Draft content is not shown in this error state."
      reference={error.digest}
      reset={reset}
    />
  );
}
