import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, CheckCircle2, FlaskConical } from "lucide-react";
import { ProgressIndicator } from "@industrial-learn/design-system";
import { SimulationPreview } from "../simulations/simulation-preview";
import { dismissRecommendationAction } from "./actions";
import { dashboardDate, type DashboardExperience } from "./experience";
import { DashboardOverview } from "./dashboard-overview";
import { buildDashboardOverview } from "./overview-model";
import styles from "./dashboard.module.css";

export function StudentDashboard({
  hideRecommendations,
  model
}: {
  hideRecommendations: boolean;
  model: DashboardExperience;
}) {
  const hasAwards = Object.values(model.awards).some((value) => value > 0);
  return (
    <div className={styles.dashboard}>
      <div className={styles.content}>
        <DashboardOverview
          data={buildDashboardOverview(model)}
          hideRecommendations={hideRecommendations}
        />
        <Section title="Current programme" id="current-programme">
          <h3>
            {model.programmeTitle ??
              (model.unavailable.includes("enrolments")
                ? "Enrolment details unavailable"
                : model.hasEnrolment
                  ? "Programme details unavailable"
                  : "No current enrolment")}
          </h3>
          {(model.currentYear || model.currentSemester) && (
            <p>
              {[
                model.currentYear ? `Year ${model.currentYear}` : "",
                model.currentSemester ? `Semester ${model.currentSemester}` : ""
              ]
                .filter(Boolean)
                .join(", ")}
            </p>
          )}
          {!model.hasEnrolment && !model.unavailable.includes("enrolments") && (
            <p>You can still explore approved learning.</p>
          )}
          <Link href="/learn">
            Explore programmes <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </Section>
        <Section
          title="Practice"
          id="practice"
          action={
            <Link href="/simulations">
              Simulation Lab <ArrowRight size={16} aria-hidden="true" />
            </Link>
          }
        >
          {model.practice.length > 0 ? (
            <div className={styles.practiceList}>
              {model.practice.map((simulation) => (
                <article key={simulation.slug} className={styles.practiceItem}>
                  <SimulationPreview preview={simulation.preview} />
                  <div>
                    <h3>{simulation.definition.title}</h3>
                    <p>{simulation.reason}</p>
                    <p>{simulation.recommendedMode} mode</p>
                    <Link href={`/simulations/${simulation.slug}`}>
                      Open simulation <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                    <small>
                      Starts a new operating state; previous settings are not restored.
                    </small>
                  </div>
                </article>
              ))}
            </div>
          ) : model.next ? (
            <div className={styles.practiceEmpty}>
              <FlaskConical size={26} aria-hidden="true" />
              <div>
                <h3>Practise within your lesson</h3>
                <p>
                  Open the visual activity and challenge in your lesson. A separate
                  simulation is not available for this topic yet.
                </p>
                <Link href={`/lessons/${model.next.slug}`}>
                  Open lesson activity <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </div>
          ) : (
            <p>Relevant simulations will appear when approved learning is available.</p>
          )}
          {model.recommendations.length > 0 || hideRecommendations ? (
            <div className={styles.recommendations}>
              <div className={styles.sectionHeading}>
                <h3>Suggested revision</h3>
                <Link
                  href={
                    hideRecommendations
                      ? "/dashboard"
                      : "/dashboard?hideRecommendations=1"
                  }
                >
                  {hideRecommendations ? "Show recommendations" : "Hide recommendations"}
                </Link>
              </div>
              {hideRecommendations ? (
                <p>Optional recommendations are hidden for this view.</p>
              ) : (
                model.recommendations.map((item) => (
                  <article key={item.id} className={styles.resultRow}>
                    <div>
                      <h4>{item.topic}</h4>
                      <p>{item.reason}</p>
                      <p>{item.recommendedActivity}</p>
                      <Link href={item.href}>Open recommended activity</Link>
                    </div>
                    <form action={dismissRecommendationAction}>
                      <input type="hidden" name="recommendationId" value={item.id} />
                      <button className="il-button il-button--secondary" type="submit">
                        Dismiss
                      </button>
                    </form>
                  </article>
                ))
              )}
            </div>
          ) : null}
        </Section>
        <Section title="Results and progress" id="results">
          {model.learning.map((lesson) => (
            <div key={lesson.id}>
              {lesson.prerequisites.length > 0 && (
                <details>
                  <summary>Prerequisite knowledge</summary>
                  <ul>
                    {lesson.prerequisites.map((text) => (
                      <li key={text}>{text}</li>
                    ))}
                  </ul>
                  <p>These knowledge requirements are not verified competency awards.</p>
                </details>
              )}
            </div>
          ))}
          {model.moduleCards.map((module) => (
            <div key={module.moduleSlug} className={styles.moduleRow}>
              <h3>
                <Link href={`/modules/${module.moduleSlug}`}>{module.moduleTitle}</Link>
              </h3>
              {module.displayProgress && module.progress.percent !== undefined ? (
                <>
                  <ProgressIndicator
                    label={`Module progress: ${module.moduleTitle}`}
                    value={module.progress.percent}
                  />
                  <p>
                    {module.progress.completedEvidence} of{" "}
                    {module.progress.requiredEvidence} assigned activities completed.
                  </p>
                </>
              ) : (
                <p>
                  Module progress is unavailable until its complete evidence scope can be
                  verified.
                </p>
              )}
            </div>
          ))}
          {!model.hasEnrolment && !model.unavailable.includes("enrolments") && (
            <p className={styles.secondary}>
              You can explore without an enrolment. No programme or semester has been
              assigned.
            </p>
          )}

          <div className={styles.progressSummary}>
            <CheckCircle2 size={24} aria-hidden="true" />
            <p>
              {model.unavailable.includes("lessons")
                ? "Lesson progress is temporarily unavailable."
                : model.completedLessonCount === undefined
                  ? "No recorded lesson completion yet."
                  : `${model.completedLessonCount} currently available lesson${model.completedLessonCount === 1 ? "" : "s"} completed in the loaded records.`}
            </p>
          </div>
          <details className={styles.explanation}>
            <summary>Progress calculation</summary>
            <p>
              Completion uses recorded lesson completion, graded status or 100%
              completion, according to the existing progress model. Opening a lesson does
              not award progress. Practice and camera changes do not award mastery.
              Competency requires assessed evidence, not time spent.
            </p>
            <p>
              Module percentages appear only when the complete assigned evidence scope is
              known. Unavailable progress is not zero.
            </p>
          </details>
          {model.limited.length > 0 && (
            <p role="status">
              Only recent records are loaded. Overall progress is unavailable for
              incomplete histories.
            </p>
          )}
          <div
            role="region"
            aria-label="Recent assessment results"
            className={styles.results}
          >
            <h3>Recent assessment results</h3>
            {model.unavailable.includes("assessments") ? (
              <p>
                Assessment results are temporarily unavailable.{" "}
                <Link href="/dashboard">Try again</Link>
              </p>
            ) : model.results.length > 0 ? (
              model.results.map((result) => (
                <article key={result.id} className={styles.resultRow}>
                  <div>
                    <h4>{result.title}</h4>
                    <p>
                      {dashboardDate(result.submittedAt)} · Graded assessment · Version{" "}
                      {result.contentVersion}
                    </p>
                  </div>
                  <div className={styles.resultAction}>
                    <strong>
                      {result.score === undefined || result.maxScore === undefined
                        ? "Score unavailable"
                        : `${result.score}/${result.maxScore} points`}
                    </strong>
                    <Link
                      href={`/assessments/${result.assessmentSlug}/attempt/${result.id}/review`}
                    >
                      Review result <ArrowRight size={16} aria-hidden="true" />
                    </Link>
                  </div>
                </article>
              ))
            ) : (
              <p>No reviewable completed assessments yet.</p>
            )}
            {model.unavailableResults && (
              <p className={styles.secondary}>
                Some earlier results cannot currently be reviewed. Their content or
                version is unavailable; no answers are shown here.
              </p>
            )}
          </div>
          {hasAwards && (
            <div role="region" aria-label="Competency profile" className={styles.results}>
              <h3>Competency profile</h3>
              <p className={styles.secondary}>
                Server-awarded evidence from the available records, not a mastery rating.
              </p>
              <div className={styles.competencies}>
                {Object.entries(model.awards)
                  .filter(([, value]) => value > 0)
                  .map(([level, value]) => (
                    <article key={level}>
                      <h4>{level}</h4>
                      <p>{value} assessed evidence points</p>
                    </article>
                  ))}
              </div>
            </div>
          )}
          {model.simulationActivity.length > 0 && (
            <div
              role="region"
              aria-label="Simulation activity"
              className={styles.results}
            >
              <h3>Simulation activity</h3>
              {model.simulationActivity.map((item) => (
                <article key={item.simulationId} className={styles.resultRow}>
                  <div>
                    <h4>{item.title}</h4>
                    <p>
                      {dashboardDate(item.lastRunAt)} · {item.mode} · {item.resultSummary}
                    </p>
                  </div>
                  <Link href="/simulations/history">Review activity</Link>
                </article>
              ))}
            </div>
          )}
        </Section>
        <Section title="Saved content" id="saved">
          {model.savedLessons.length === 0 && (
            <p>No saved lessons yet. Save available lessons as you learn.</p>
          )}
          {model.savedLessons.map((lesson) => (
            <div className={styles.resultRow} key={lesson.slug}>
              <div>
                <h3>{lesson.title}</h3>
                <p>Saved {dashboardDate(lesson.savedAt)}</p>
              </div>
              <Link href={`/lessons/${lesson.slug}`}>
                Open saved lesson <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          ))}
        </Section>
      </div>
    </div>
  );
}
function Section({
  title,
  id,
  children,
  action,
  className = ""
}: {
  title: string;
  id: string;
  children: ReactNode;
  action?: ReactNode;
  className?: string | undefined;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className={`${styles.section} ${className}`}
    >
      <div className={styles.sectionHeading}>
        <h2 id={`${id}-title`}>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
export function AccessDeniedState() {
  return (
    <section className="dashboard-state">
      <h1>Access denied</h1>
      <p>Sign in with an authorised account to view your learning.</p>
      <Link href="/auth/sign-in?next=%2Fdashboard">Sign in</Link>
    </section>
  );
}
