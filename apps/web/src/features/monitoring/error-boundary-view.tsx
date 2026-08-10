"use client";

type MonitoringErrorBoundaryViewProps = {
  title: string;
  description: string;
  reference?: string | undefined;
  reset?: (() => void) | undefined;
};

export function MonitoringErrorBoundaryView({
  title,
  description,
  reference,
  reset
}: MonitoringErrorBoundaryViewProps) {
  return (
    <section className="state-page" aria-labelledby="monitoring-error-title">
      <p className="eyebrow">Error boundary</p>
      <h1 id="monitoring-error-title">{title}</h1>
      <p>{description}</p>
      {reference ? <p className="technical-note">Reference: {reference}</p> : null}
      {reset ? (
        <button className="button" type="button" onClick={reset}>
          Try again
        </button>
      ) : null}
    </section>
  );
}
