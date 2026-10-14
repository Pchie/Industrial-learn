import Image from "next/image";
import Link from "next/link";
import { Alert } from "@industrial-learn/design-system";
import { ArrowRight, BookOpen, ClipboardCheck, FlaskConical, Search } from "lucide-react";
import { frontendAssets } from "../app-shell/assets";
import { ImageBand, PageLink, WorkspaceEmptyState } from "../page-layout/components";
import { dashboardDate, type DashboardExperience } from "./experience";
import {
  type buildLearningLibrary,
  learningViews,
  type LearningView
} from "./learning-library";
import { RemoveUnavailableSavedLesson, SaveLesson } from "./save-lesson";
import styles from "./learning-library.module.css";

const labels: Record<LearningView, string> = {
  all: "All learning",
  "in-progress": "In progress",
  completed: "Completed",
  saved: "Saved"
};

export function LearningLibrary({
  model,
  library,
  view,
  query
}: {
  model: DashboardExperience;
  library: ReturnType<typeof buildLearningLibrary>;
  view: LearningView;
  query: string;
}) {
  return (
    <div className={styles.library}>
      {model.next && (
        <ImageBand
          image="pressureScene"
          priority
          title={model.next.title}
          eyebrow="Continue learning"
          description={model.next.description}
        >
          <PageLink href={`/lessons/${model.next.slug}`}>{model.nextAction}</PageLink>
          <Link href="/learn/pilot">View learning path</Link>
        </ImageBand>
      )}
      <nav className={styles.shortcuts} aria-label="My learning shortcuts">
        <Link href="/learn">
          <BookOpen aria-hidden="true" />
          <span>
            Browse learning<small>Explore the two schools</small>
          </span>
          <ArrowRight aria-hidden="true" />
        </Link>
        <Link href="/assessments">
          <ClipboardCheck aria-hidden="true" />
          <span>
            Your assessments<small>Practise and review results</small>
          </span>
          <ArrowRight aria-hidden="true" />
        </Link>
        <Link href="/simulations">
          <FlaskConical aria-hidden="true" />
          <span>
            Simulation Lab<small>Explore available simulations</small>
          </span>
          <ArrowRight aria-hidden="true" />
        </Link>
      </nav>
      {model.warnings.length > 0 && (
        <Alert title="Some learning records are unavailable" tone="warning">
          Your available lessons are shown below. Refresh the page to retry loading your
          records.
        </Alert>
      )}
      <section aria-labelledby="learning-library-title" className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <p className="eyebrow">Your learning library</p>
            <h2 id="learning-library-title">Pick up where you left off</h2>
          </div>
          <Link href="/dashboard#results">
            View progress <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <div className={styles.filters}>
          <nav aria-label="Filter your learning" className={styles.tabs}>
            {learningViews.map((item) => (
              <Link
                key={item}
                href={`/my-learning?${new URLSearchParams({ view: item, ...(query ? { q: query } : {}) })}`}
                aria-current={view === item ? "page" : undefined}
              >
                {labels[item]}
                <span>
                  {model.unavailable.includes(item === "saved" ? "saved" : "lessons") &&
                  item !== "all"
                    ? "—"
                    : library.counts[item]}
                </span>
              </Link>
            ))}
          </nav>
          <form
            action="/my-learning"
            className={styles.search}
            role="search"
            aria-label="Search your learning"
          >
            <input type="hidden" name="view" value={view} />
            <label className="sr-only" htmlFor="library-search">
              Search your learning
            </label>
            <input
              key={query}
              id="library-search"
              type="search"
              name="q"
              defaultValue={query}
              maxLength={200}
              placeholder="Find a lesson…"
            />
            <button type="submit" aria-label="Search your learning">
              <Search size={18} aria-hidden="true" />
            </button>
          </form>
        </div>
        {model.limited.includes("saved") && view === "saved" && (
          <p>Showing your most recent saved lessons.</p>
        )}
        {(view === "all" || view === "saved") &&
          !query &&
          library.unavailableSaved.length > 0 && (
            <Alert title="Unavailable saved lessons" tone="warning">
              <p>
                Some saved lessons are no longer available. You can remove their
                bookmarks.
              </p>
              {library.unavailableSaved.map((bookmark) => (
                <RemoveUnavailableSavedLesson key={bookmark.id} id={bookmark.id} />
              ))}
            </Alert>
          )}
        {library.lessons.length ? (
          <div className={styles.grid}>
            {library.lessons.map((lesson) => (
              <article
                className={styles.card}
                key={lesson.slug}
                aria-labelledby={`library-${lesson.slug}`}
              >
                <Link href={`/lessons/${lesson.slug}`} tabIndex={-1} aria-hidden="true">
                  <Image
                    {...frontendAssets.pressureWater.image}
                    alt=""
                    sizes="(max-width: 700px) 100vw, 420px"
                  />
                </Link>
                <div className={styles.cardBody}>
                  <div className={styles.cardMeta}>
                    <span>{lesson.state}</span>
                    <span>{lesson.estimatedCompletionTime}</span>
                  </div>
                  <h3 id={`library-${lesson.slug}`}>
                    <Link href={`/lessons/${lesson.slug}`}>{lesson.title}</Link>
                  </h3>
                  <p>{lesson.description}</p>
                  <div className={styles.cardActions}>
                    <PageLink href={`/lessons/${lesson.slug}`}>
                      {lesson.state === "Completed"
                        ? "Revisit lesson"
                        : lesson.state === "In progress"
                          ? "Continue lesson"
                          : "Open lesson"}
                    </PageLink>
                    {!model.unavailable.includes("saved") && (
                      <SaveLesson slug={lesson.slug} saved={lesson.saved} />
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <WorkspaceEmptyState
            title={
              view === "saved" && model.unavailable.includes("saved")
                ? "Saved lessons unavailable"
                : query
                  ? "No matching lessons"
                  : view === "saved"
                    ? library.unavailableSaved.length
                      ? "No available saved lessons"
                      : "No saved lessons yet"
                    : view === "completed"
                      ? "No completed lessons yet"
                      : "Your next lesson is waiting"
            }
            kind="learning"
            action={<PageLink href="/my-learning">View all learning</PageLink>}
          >
            <p>
              {view === "saved" && model.unavailable.includes("saved")
                ? "Refresh the page to retry loading your saved lessons."
                : query
                  ? "Try a different search or return to all learning."
                  : view === "saved"
                    ? "Use Save lesson on a lesson page to keep it here."
                    : "Choose an available lesson and complete its activities to record your progress."}
            </p>
          </WorkspaceEmptyState>
        )}
      </section>
      <section className={styles.section} aria-labelledby="library-results-title">
        <div className={styles.sectionHeading}>
          <h2 id="library-results-title">Recent assessment results</h2>
          <Link href="/assessments">
            All assessments <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
        {model.results.length ? (
          <ul className={styles.results}>
            {model.results.map((result) => (
              <li key={result.id}>
                <div>
                  <strong>{result.title}</strong>
                  <small>{dashboardDate(result.submittedAt)}</small>
                </div>
                <span>
                  {result.score === undefined || result.maxScore === undefined
                    ? "Score unavailable"
                    : `${result.score} / ${result.maxScore}`}
                </span>
                <Link
                  href={`/assessments/${result.assessmentSlug}/attempt/${result.id}/review`}
                >
                  Review result <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p>
            {model.unavailable.includes("assessments")
              ? "Assessment results are temporarily unavailable."
              : "Your completed assessments will appear here."}
          </p>
        )}
        <Link href="/simulations/history">
          View simulation history <ArrowRight size={16} aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}
