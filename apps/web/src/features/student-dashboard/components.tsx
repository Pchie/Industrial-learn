import Link from "next/link";
import type { ReactNode } from "react";
import { COMPETENCY_LEVELS } from "@industrial-learn/assessment-core";
import { Alert, Badge, ProgressIndicator } from "@industrial-learn/design-system";

import { dismissRecommendationAction } from "./actions";
import type { StudentDashboardModel } from "./data";

export function StudentDashboard({
  hideRecommendations,
  model
}: {
  hideRecommendations: boolean;
  model: StudentDashboardModel;
}) {
  return (
    <div className="student-dashboard">
      <header className="student-dashboard__hero">
        <div>
          <p className="eyebrow">Student dashboard</p>
          <h1>{model.displayName}</h1>
          <p>
            Private learning data is shown only for the authenticated student record
            resolved on the server.
          </p>
        </div>
        <dl className="student-dashboard__identity">
          <div>
            <dt>Current programme</dt>
            <dd>{model.programmeTitle ?? "No current enrolment"}</dd>
          </div>
          <div>
            <dt>Current year and semester</dt>
            <dd>{yearSemesterLabel(model)}</dd>
          </div>
        </dl>
      </header>

      {model.state === "new_student" ? (
        <Alert title="New student" tone="info">
          No enrolment or learning evidence has been recorded for this student yet.
        </Alert>
      ) : null}

      {model.state === "no_enrolment" ? (
        <Alert title="No current enrolment" tone="warning">
          Learning records exist, but no active enrolment is available for the
          authenticated student.
        </Alert>
      ) : null}

      {model.state === "partial_data" ? (
        <Alert title="Partial dashboard data" tone="warning">
          Some dashboard data is unavailable. Sections with missing evidence are shown as
          unavailable instead of zero.
        </Alert>
      ) : null}

      <Alert title="Progress calculation" tone="info">
        Progress counts completed lessons, submitted assessments, completed simulations,
        and submitted project evidence. Opening a lesson does not award progress.
        Competency is based on assessed evidence, not time spent alone.
      </Alert>

      <DashboardSection title="Pilot learning path">
        <article className="dashboard-card">
          <h3>Fluid Engineering Pilot</h3>
          <p>
            Continue through the approved Basic Fluid Pressure lesson, its practical
            challenge, and the linked assessment.
          </p>
          <Link className="curriculum-action" href="/learn/pilot">
            Open pilot learning path
          </Link>
        </article>
      </DashboardSection>

      <DashboardSection title="Continue learning">
        {model.continueLearningTitle && model.continueLessonSlug ? (
          <article className="dashboard-card">
            <h3>{model.continueLearningTitle}</h3>
            <p>
              Continue from the next incomplete lesson step recorded for this student.
            </p>
            <Link
              className="curriculum-action"
              href={`/lessons/${model.continueLessonSlug}`}
            >
              Continue lesson
            </Link>
          </article>
        ) : (
          <EmptyState message="No in-progress lesson yet. Start from the curriculum browser when ready." />
        )}
      </DashboardSection>

      <DashboardSection title="Weekly learning plan">
        {model.weeklyPlan.length > 0 ? (
          <div className="dashboard-list">
            {model.weeklyPlan.map((item) => (
              <article className="dashboard-row" key={item.id}>
                <h3>{item.title}</h3>
                <p>{item.estimate}</p>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState message="No weekly plan has been assigned yet." />
        )}
      </DashboardSection>

      <DashboardSection title="Module progress">
        {model.moduleCards.length > 0 ? (
          <div className="dashboard-grid">
            {model.moduleCards.map((item) => (
              <article className="dashboard-card" key={item.moduleSlug}>
                <h3>{item.moduleTitle}</h3>
                <ProgressBlock label="Module progress" progress={item.progress} />
                <p>
                  {item.completedLessons} of {item.totalLessons} lessons and{" "}
                  {item.completedAssessments} of {item.totalAssessments} assessments
                  completed. Simulations: {item.completedSimulations} of{" "}
                  {item.totalSimulations}. Projects: {item.completedProjects} of{" "}
                  {item.totalProjects}.
                </p>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState message="No module completion evidence has been recorded yet." />
        )}
      </DashboardSection>

      <DashboardSection title="Competency profile">
        {COMPETENCY_LEVELS.some((level) => (model.competencyProfile[level] ?? 0) > 0) ? (
          <div className="competency-grid">
            {COMPETENCY_LEVELS.map((level) => (
              <article className="dashboard-card" key={level}>
                <h3>{level}</h3>
                <p>{model.competencyProfile[level] ?? 0} assessed evidence points</p>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState message="No competency evidence has been awarded yet." />
        )}
      </DashboardSection>

      <DashboardSection title="Recent assessment results">
        {model.recentAssessmentResults.length > 0 ? (
          <div className="dashboard-list">
            {model.recentAssessmentResults.map((result) => (
              <article className="dashboard-row" key={result.assessmentId}>
                <div>
                  <h3>{result.title}</h3>
                  <p>{result.submittedAt}</p>
                </div>
                <Badge tone="info">{assessmentScoreLabel(result)}</Badge>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState message="Completed assessment attempts will appear here." />
        )}
      </DashboardSection>

      <DashboardSection title="Simulation activity">
        {model.simulationActivity.length > 0 ? (
          <div className="dashboard-list">
            {model.simulationActivity.map((activity) => (
              <article className="dashboard-row" key={activity.simulationId}>
                <div>
                  <h3>{activity.title}</h3>
                  <p>{activity.resultSummary}</p>
                </div>
                <Badge tone="hydraulic">{activity.mode}</Badge>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState message="Simulation runs will appear after a student submits activity evidence." />
        )}
      </DashboardSection>

      <DashboardSection
        action={
          hideRecommendations ? (
            <Link href="/dashboard">Show recommendations</Link>
          ) : (
            <Link href="/dashboard?hideRecommendations=1">Hide recommendations</Link>
          )
        }
        title="Weak-topic recommendations"
      >
        {hideRecommendations ? (
          <EmptyState message="Optional recommendations are hidden for this view." />
        ) : model.weakTopicRecommendations.length > 0 ? (
          <div className="dashboard-list">
            {model.weakTopicRecommendations.map((recommendation) => (
              <article className="dashboard-row" key={recommendation.id}>
                <div>
                  <h3>{recommendation.topic}</h3>
                  <p>{recommendation.reason}</p>
                  <p>{recommendation.recommendedActivity}</p>
                  <p>{recommendation.estimatedRevisionTime}</p>
                  <Link href={recommendation.href}>Open recommended activity</Link>
                </div>
                <form action={dismissRecommendationAction}>
                  <input
                    name="recommendationId"
                    type="hidden"
                    value={recommendation.id}
                  />
                  <button className="curriculum-action" type="submit">
                    Dismiss
                  </button>
                </form>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState message="No weak-topic recommendations are available yet." />
        )}
      </DashboardSection>

      <DashboardSection title="Saved lessons">
        {model.savedLessons.length > 0 ? (
          <div className="dashboard-list">
            {model.savedLessons.map((lesson) => (
              <article className="dashboard-row" key={lesson.slug}>
                <h3>{lesson.title}</h3>
                <Link href={`/lessons/${lesson.slug}`}>Open saved lesson</Link>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState message="Saved lessons will appear here." />
        )}
      </DashboardSection>

      <DashboardSection title="Active projects">
        {model.activeProjects.length > 0 ? (
          <div className="dashboard-list">
            {model.activeProjects.map((project) => (
              <article className="dashboard-row" key={project.id}>
                <div>
                  <h3>{project.title}</h3>
                  <p>{project.status}</p>
                </div>
                <Badge tone="info">
                  {project.portfolioEvidenceCount}/{project.requiredEvidenceCount}{" "}
                  evidence items
                </Badge>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState message="Active projects will appear when a project is assigned or started." />
        )}
      </DashboardSection>

      <DashboardSection title="Portfolio progress">
        {model.activeProjects.length > 0 ? (
          <article className="dashboard-card">
            <ProgressBlock
              label="Portfolio evidence progress"
              progress={model.portfolioProgress}
            />
          </article>
        ) : (
          <EmptyState message="Portfolio progress starts when a project requires evidence." />
        )}
      </DashboardSection>

      <DashboardSection title="Recent learning activity">
        {model.recentActivity.length > 0 ? (
          <div className="dashboard-list">
            {model.recentActivity.map((activity) => (
              <article className="dashboard-row" key={activity.id}>
                <div>
                  <h3>{activity.title}</h3>
                  <p>{activity.summary}</p>
                </div>
                <p>{activity.occurredAt ?? "Date unavailable"}</p>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState message="No recent learning activity has been recorded." />
        )}
      </DashboardSection>
    </div>
  );
}

export function AccessDeniedState() {
  return (
    <section className="dashboard-state" aria-labelledby="access-denied-title">
      <h1 id="access-denied-title">Access denied</h1>
      <p>Sign in with an authorised student account to view private learning progress.</p>
    </section>
  );
}

export function DashboardErrorState() {
  return (
    <section className="dashboard-state" aria-labelledby="dashboard-error-title">
      <h1 id="dashboard-error-title">Dashboard unavailable</h1>
      <p>The student dashboard could not be loaded.</p>
    </section>
  );
}

function DashboardSection({
  action,
  children,
  title
}: {
  action?: ReactNode;
  children: ReactNode;
  title: string;
}) {
  return (
    <section
      className="dashboard-section"
      aria-labelledby={`${title.toLowerCase().replaceAll(" ", "-")}-title`}
    >
      <div className="dashboard-section__heading">
        <h2 id={`${title.toLowerCase().replaceAll(" ", "-")}-title`}>{title}</h2>
        {action ? <div className="dashboard-section__action">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="dashboard-empty" aria-live="polite">
      <p>{message}</p>
    </div>
  );
}

function ProgressBlock({
  label,
  progress
}: {
  label: string;
  progress: StudentDashboardModel["moduleProgress"];
}) {
  return progress.available && progress.percent !== undefined ? (
    <>
      <ProgressIndicator label={label} value={progress.percent} />
      <p>{progress.explanation}</p>
    </>
  ) : (
    <p>{progress.explanation}</p>
  );
}

function yearSemesterLabel(model: StudentDashboardModel) {
  if (model.currentYear && model.currentSemester) {
    return `Year ${model.currentYear}, Semester ${model.currentSemester}`;
  }

  return "Unavailable until enrolment is assigned";
}

function assessmentScoreLabel(
  result: StudentDashboardModel["recentAssessmentResults"][number]
) {
  if (result.earnedPoints === undefined || result.maxPoints === undefined) {
    return result.competencyLevel;
  }

  return `${result.earnedPoints}/${result.maxPoints} points`;
}
