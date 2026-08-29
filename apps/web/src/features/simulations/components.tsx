import Link from "next/link";
import type { PersistedSimulationAttempt } from "@industrial-learn/database";

import { startSimulationAction } from "./actions";
import { awardsLabel } from "./local-store";
import { SimulationPreview } from "./simulation-preview";
import labStyles from "./simulation-lab.module.css";
import type {
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
  message,
  authenticated
}: {
  overview: SimulationOverview;
  message?: string | undefined;
  authenticated: boolean;
}) {
  const available = overview.availability === "available";

  return (
    <div className={`${labStyles.labPage} ${labStyles.detailPage}`}>
      <nav aria-label="Breadcrumb" className={labStyles.detailBreadcrumb}>
        <Link href="/simulations">Simulation Lab</Link>
        <span aria-hidden="true">/</span>
        <span>{overview.title}</span>
      </nav>
      {message ? (
        <div className="simulation-alert" role="alert">
          {message}
        </div>
      ) : null}

      <header className={labStyles.detailHeader}>
        <div className={labStyles.detailCopy}>
          <div className={labStyles.statusRow}>
            <span
              className={`${labStyles.detailStatus} ${
                available
                  ? labStyles.detailStatusAvailable
                  : labStyles.detailStatusUnavailable
              }`}
            >
              {simulationAvailabilityLabel(overview.availability)}
            </span>
            <span className={labStyles.detailReview}>{overview.reviewStatus}</span>
          </div>
          <p className={labStyles.kicker}>
            {overview.discipline} · {overview.types.join(" · ")}
          </p>
          <h1>{overview.title}</h1>
          <p>{overview.mainConcept}</p>
          <dl className={labStyles.detailFacts}>
            <div>
              <dt>Difficulty</dt>
              <dd>{overview.difficulty}</dd>
            </div>
            <div>
              <dt>Activity time</dt>
              <dd>{overview.estimatedMinutes} minutes</dd>
            </div>
            <div>
              <dt>Related module</dt>
              <dd>{overview.moduleTitle}</dd>
            </div>
          </dl>
          {available ? (
            <form action={startSimulationAction} className={labStyles.quickStart}>
              <input name="simulationSlug" type="hidden" value={overview.slug} />
              <input name="mode" type="hidden" value={overview.recommendedMode} />
              <button className="button button--primary" type="submit">
                Start simulation
              </button>
              <span>Quick start: {formatMode(overview.recommendedMode)}</span>
            </form>
          ) : (
            <p role="status">This simulation cannot be started in its current state.</p>
          )}
        </div>
        <SimulationPreview preview={overview.preview} size="detail" />
      </header>

      <section aria-labelledby="operate-heading" className={labStyles.detailBand}>
        <div>
          <p className={labStyles.kicker}>Operate</p>
          <h2 id="operate-heading">What you can change</h2>
        </div>
        <ul>
          {overview.whatStudentsOperate.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <div>
          <p className={labStyles.kicker}>Learn</p>
          <h2>What you will establish</h2>
        </div>
        <ul>
          {overview.learningOutcomes.map((outcome) => (
            <li key={outcome}>{outcome}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="mode-heading" className={labStyles.modeSection}>
        <div className={labStyles.sectionHeading}>
          <div>
            <p className={labStyles.kicker}>Operating modes</p>
            <h2 id="mode-heading">Choose how to work</h2>
          </div>
        </div>
        <div className="simulation-mode-grid">
          {available ? (
            overview.modes.map((mode) => (
              <form action={startSimulationAction} key={mode}>
                <input name="simulationSlug" type="hidden" value={overview.slug} />
                <input name="mode" type="hidden" value={mode} />
                <button className="simulation-mode-button" type="submit">
                  <span>{formatMode(mode)}</span>
                  <small>{modeDescription(mode)}</small>
                </button>
              </form>
            ))
          ) : (
            <p role="status">
              Operating modes remain unavailable until the declared review gate is
              completed.
            </p>
          )}
        </div>
      </section>

      {authenticated ? (
        <section
          aria-labelledby="simulation-history-title"
          className={labStyles.historyBand}
        >
          <div>
            <p className={labStyles.kicker}>Private learning evidence</p>
            <h2 id="simulation-history-title">Your attempts</h2>
          </div>
          {overview.attempts.length > 0 ? (
            <SimulationAttemptList attempts={overview.attempts} slug={overview.slug} />
          ) : (
            <p>No attempts have been recorded for your account.</p>
          )}
          <Link href="/simulations/history">View full simulation history</Link>
        </section>
      ) : null}

      <details className={labStyles.technicalDetails}>
        <summary>Technical boundaries and traceability</summary>
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
        <Link href={`/lessons/${overview.lessonSlug}`}>Open related lesson</Link>
      </details>
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

export function SimulationHeader({ summary }: { summary: SimulationSummary }) {
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
      return "Show me what everything does.";
    case "guided":
      return "Walk me through an engineering task.";
    case "explore":
      return "Let me experiment.";
    case "fault-diagnosis":
      return "Give me a fault.";
    case "assessment":
      return "Test what I know.";
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

function simulationAvailabilityLabel(availability: SimulationSummary["availability"]) {
  if (availability === "locked-by-prerequisite") {
    return "Locked by prerequisite";
  }
  if (availability === "coming-later") {
    return "Coming later";
  }
  return "Available";
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en", {
    maximumFractionDigits: 4
  }).format(value);
}
