import Link from "next/link";
import type { PersistedSimulationAttempt } from "@industrial-learn/database";

import { startSimulationAction } from "./actions";
import { SimulationAttemptClient } from "./interactive-client";
import { awardsLabel } from "./local-store";
import type {
  SimulationAttemptPageModel,
  SimulationOverview,
  SimulationSummary,
  SimulationReviewPageModel
} from "./server";

export function SimulationList({ simulations }: { simulations: SimulationSummary[] }) {
  return (
    <div className="simulation-shell">
      <header className="simulation-hero">
        <p className="eyebrow">Authenticated simulations</p>
        <h1>Simulations</h1>
        <p>
          Operate reviewed training scenarios, record meaningful attempt summaries, and
          keep engineering calculations inside the simulation engine.
        </p>
      </header>

      {simulations.length === 0 ? (
        <section className="simulation-card">
          <h2>No simulations available</h2>
          <p>Published simulation activities will appear here when available.</p>
        </section>
      ) : (
        <section className="simulation-grid" aria-label="Available simulations">
          {simulations.map((simulation) => (
            <article className="simulation-card" key={simulation.slug}>
              <div className="simulation-card__meta">
                <span>{simulation.moduleTitle}</span>
                <span>{simulation.estimatedMinutes} min</span>
              </div>
              <h2>{simulation.title}</h2>
              <p>{simulation.description}</p>
              <dl className="simulation-facts">
                <div>
                  <dt>Review</dt>
                  <dd>{simulation.reviewStatus}</dd>
                </div>
                <div>
                  <dt>Latest attempt</dt>
                  <dd>{simulation.latestAttempt?.status ?? "Not started"}</dd>
                </div>
              </dl>
              <Link
                className="button button--primary"
                href={`/simulations/${simulation.slug}`}
              >
                View simulation
              </Link>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

export function SimulationOverviewView({
  overview,
  message
}: {
  overview: SimulationOverview;
  message?: string | undefined;
}) {
  return (
    <div className="simulation-shell">
      <SimulationHeader summary={overview} />
      {message ? (
        <div className="simulation-alert" role="alert">
          {message}
        </div>
      ) : null}
      <section className="simulation-layout">
        <div className="simulation-card">
          <h2>Select operating mode</h2>
          <div className="simulation-mode-grid">
            {overview.modes.map((mode) => (
              <form action={startSimulationAction} key={mode}>
                <input name="simulationSlug" type="hidden" value={overview.slug} />
                <input name="mode" type="hidden" value={mode} />
                <button className="simulation-mode-button" type="submit">
                  <span>{formatMode(mode)}</span>
                  <small>{modeDescription(mode)}</small>
                </button>
              </form>
            ))}
          </div>
        </div>

        <aside className="simulation-card" aria-labelledby="simulation-history-title">
          <h2 id="simulation-history-title">Attempt history</h2>
          {overview.attempts.length > 0 ? (
            <SimulationAttemptList attempts={overview.attempts} slug={overview.slug} />
          ) : (
            <p>No attempts have been recorded for your account.</p>
          )}
          <Link href="/simulations/history">View full simulation history</Link>
        </aside>
      </section>

      <section className="simulation-card">
        <h2>Technical boundaries</h2>
        <dl className="simulation-facts simulation-facts--wide">
          <div>
            <dt>Simulation ID</dt>
            <dd>{overview.simulationId}</dd>
          </div>
          <div>
            <dt>Version</dt>
            <dd>{overview.version}</dd>
          </div>
          <div>
            <dt>Sources</dt>
            <dd>{overview.sourceIds.join(", ")}</dd>
          </div>
          <div>
            <dt>Equations</dt>
            <dd>{overview.equationIds.join(", ")}</dd>
          </div>
        </dl>
        <p>
          This pilot is marked {overview.reviewStatus}. It is a learning simulation and
          must not be treated as engineering approval for real hydraulic equipment.
        </p>
      </section>
    </div>
  );
}

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
    <div className="simulation-shell">
      <SimulationHeader summary={model.overview} />
      {message ? (
        <div className="simulation-alert" role="alert">
          {message}
        </div>
      ) : null}
      <SimulationAttemptClient model={model} />
    </div>
  );
}

export function SimulationReviewView({ model }: { model: SimulationReviewPageModel }) {
  return (
    <div className="simulation-shell">
      <SimulationHeader summary={model.overview} />
      <section className="simulation-card simulation-result-card">
        <h2>Completed simulation attempt</h2>
        <p className="simulation-score">
          {model.attempt.score === undefined
            ? "Practice completed"
            : `${Math.round(model.attempt.score * 100)}% score`}
        </p>
        <dl className="simulation-facts simulation-facts--wide">
          <div>
            <dt>Status</dt>
            <dd>{model.attempt.status}</dd>
          </div>
          <div>
            <dt>Mode</dt>
            <dd>{formatMode(model.attempt.mode)}</dd>
          </div>
          <div>
            <dt>Competency</dt>
            <dd>{awardsLabel(model.attempt.competencyAwards)}</dd>
          </div>
          <div>
            <dt>Fault</dt>
            <dd>{model.attempt.faultIntroduced ?? "None recorded"}</dd>
          </div>
        </dl>
        <Link className="button button--secondary" href="/dashboard">
          View dashboard progress
        </Link>
      </section>

      <section className="simulation-grid" aria-label="Simulation attempt summary">
        <article className="simulation-card">
          <h2>Inputs used</h2>
          <KeyValueList values={model.attempt.inputState} />
        </article>
        <article className="simulation-card">
          <h2>Output summary</h2>
          <KeyValueList values={model.attempt.outputSummary} />
        </article>
        <article className="simulation-card">
          <h2>Measurements recorded</h2>
          <ul className="simulation-list">
            {model.attempt.measurementsTaken.slice(0, 8).map((measurement) => (
              <li key={`${measurement.id}-${measurement.label}`}>
                {measurement.label}: {formatNumber(measurement.value)} {measurement.unit}
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
  );
}

export function SimulationHistoryView({
  attempts
}: {
  attempts: PersistedSimulationAttempt[];
}) {
  return (
    <div className="simulation-shell">
      <header className="simulation-hero">
        <p className="eyebrow">Private learning evidence</p>
        <h1>Simulation history</h1>
        <p>
          Your completed and in-progress simulation attempt summaries are visible only to
          your authenticated account and authorised education staff.
        </p>
      </header>

      <section className="simulation-card">
        {attempts.length > 0 ? (
          <SimulationAttemptList attempts={attempts} />
        ) : (
          <p>No simulation attempts have been recorded for your account.</p>
        )}
      </section>
    </div>
  );
}

function SimulationHeader({ summary }: { summary: SimulationSummary }) {
  return (
    <header className="simulation-hero">
      <p className="eyebrow">{summary.moduleTitle}</p>
      <h1>{summary.title}</h1>
      <p>{summary.description}</p>
      <dl className="simulation-facts">
        <div>
          <dt>Lesson</dt>
          <dd>{summary.lessonTitle}</dd>
        </div>
        <div>
          <dt>Review status</dt>
          <dd>{summary.reviewStatus}</dd>
        </div>
        <div>
          <dt>Duration</dt>
          <dd>{summary.estimatedMinutes} minutes</dd>
        </div>
      </dl>
    </header>
  );
}

function SimulationAttemptList({
  attempts,
  slug
}: {
  attempts: PersistedSimulationAttempt[];
  slug?: string | undefined;
}) {
  return (
    <ol className="simulation-history">
      {attempts.map((attempt) => {
        const simulationSlug = slug ?? slugForAttempt(attempt);
        return (
          <li key={attempt.id}>
            <strong>{formatMode(attempt.mode)}</strong>
            <span>{attempt.status}</span>
            <span>{attempt.completedAt ?? attempt.startedAt}</span>
            {attempt.score !== undefined ? <span>Score {attempt.score}</span> : null}
            {attempt.status === "in_progress" ? (
              <Link href={`/simulations/${simulationSlug}/attempt/${attempt.id}`}>
                Resume
              </Link>
            ) : null}
            {attempt.status === "submitted" || attempt.status === "graded" ? (
              <Link href={`/simulations/${simulationSlug}/attempt/${attempt.id}/review`}>
                Review
              </Link>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}

function KeyValueList({
  values
}: {
  values: Record<string, number | string | boolean | null>;
}) {
  const entries = Object.entries(values);
  return entries.length > 0 ? (
    <dl className="simulation-facts simulation-facts--wide">
      {entries.map(([key, value]) => (
        <div key={key}>
          <dt>{key}</dt>
          <dd>{typeof value === "number" ? formatNumber(value) : String(value)}</dd>
        </div>
      ))}
    </dl>
  ) : (
    <p>No values were recorded.</p>
  );
}

function slugForAttempt(attempt: PersistedSimulationAttempt) {
  return attempt.simulationId === "SIM-HYD-CYL-FORCE-001"
    ? "hydraulic-cylinder-force"
    : attempt.simulationId;
}

function modeDescription(mode: string) {
  switch (mode) {
    case "learn":
      return "Component explanation and equation assistance.";
    case "guided":
      return "Step-by-step operation with hints.";
    case "explore":
      return "Free permitted input adjustment.";
    case "fault-diagnosis":
      return "Observe, measure, diagnose, and submit.";
    case "assessment":
      return "Restricted hints with server scoring.";
    default:
      return "Simulation mode.";
  }
}

function formatMode(mode: string) {
  return mode
    .split("-")
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en", {
    maximumFractionDigits: 4
  }).format(value);
}
