import Link from "next/link";

import { SimulationAttemptClient } from "./interactive-client";
import { SimulationHeader } from "./components";
import type { SimulationAttemptPageModel } from "./server";

export function SimulationAttemptView({
  model,
  message
}: {
  model: SimulationAttemptPageModel;
  message?: string | undefined;
}) {
  if (model.attempt.status === "submitted" || model.attempt.status === "graded") {
    return (
      <div className="simulation-shell">
        <SimulationHeader summary={model.overview} />
        <section className="simulation-card">
          <h2>This attempt has already been completed</h2>
          <p>Completed simulation attempts cannot be changed or submitted again.</p>
          <Link
            className="button button--primary"
            href={`/simulations/${model.overview.slug}/attempt/${model.attempt.id}/review`}
          >
            Review completed attempt
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="simulation-shell simulation-shell--attempt">
      <nav aria-label="Simulation workspace" className="simulation-workspace-nav">
        <Link href="/simulations">Exit to Simulation Lab</Link>
        <h1>{model.overview.title}</h1>
        <Link href={`/lessons/${model.overview.lessonSlug}`}>Related lesson</Link>
      </nav>
      {message ? (
        <div className="simulation-alert" role="alert">
          {message}
        </div>
      ) : null}
      <SimulationAttemptClient model={model} />
    </div>
  );
}
