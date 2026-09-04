import type { Metadata } from "next";
import Link from "next/link";

import {
  Alert,
  Badge,
  Breadcrumbs,
  EngineeringReviewBadge
} from "@industrial-learn/design-system";

import { getPublicLessonBySlug } from "@/features/lesson-engine/data";
import { resolveAuthenticatedSession } from "@/features/auth/server";
import { loadAssessmentOverview } from "@/features/assessments/server";

export const metadata: Metadata = {
  title: "Fluid Engineering Pilot | Industrial Learn",
  description: "The controlled Industrial Learn Fluid Engineering pilot path."
};

export const dynamic = "force-dynamic";

export default async function PilotLearningPathPage() {
  const lesson = getPublicLessonBySlug("basic-fluid-pressure");
  const session = await resolveAuthenticatedSession();
  const studentSession =
    session.ok && session.value.roles.includes("student") ? session.value : null;
  const assessment = studentSession
    ? await loadAssessmentOverview(studentSession, "basic-fluid-pressure-check").catch(
        () => null
      )
    : null;

  return (
    <div className="curriculum-page">
      <Breadcrumbs
        items={[
          { href: "/learn", label: "Learn" },
          { href: "/learn/pilot", label: "Fluid Engineering Pilot" }
        ]}
      />
      <header className="curriculum-hero">
        <p className="eyebrow">Pilot learning path</p>
        <h1>Fluid Engineering Pilot</h1>
        <p>
          Work through one approved visual lesson, complete its practical challenge, then
          submit the linked server-scored assessment.
        </p>
      </header>

      <Alert title="Governed pilot route" tone="info">
        This path is independent of the unpublished parent module and includes only
        content that passes the public lesson publication gate.
      </Alert>

      <section className="curriculum-section" aria-labelledby="pilot-sequence-title">
        <div className="section-heading">
          <p className="eyebrow">Learning sequence</p>
          <h2 id="pilot-sequence-title">Pressure from force and area</h2>
        </div>
        {lesson ? (
          <ol className="dashboard-list">
            <li className="curriculum-card">
              <div className="curriculum-card__topline">
                <p className="il-card-kicker">1. Visual lesson and challenge</p>
                <Badge tone="normal">Published</Badge>
              </div>
              <h3>{lesson.title}</h3>
              <p>{lesson.description}</p>
              <dl className="curriculum-meta">
                <div>
                  <dt>Version</dt>
                  <dd>{lesson.version}</dd>
                </div>
                <div>
                  <dt>Duration</dt>
                  <dd>{lesson.estimatedCompletionTime}</dd>
                </div>
              </dl>
              <EngineeringReviewBadge status={lesson.reviewStatus} />
              <Link className="curriculum-action" href={`/lessons/${lesson.slug}`}>
                Start approved lesson
              </Link>
            </li>
            <li className="curriculum-card">
              <div className="curriculum-card__topline">
                <p className="il-card-kicker">2. Linked assessment</p>
                <Badge tone="info">Authenticated</Badge>
              </div>
              <h3>Basic Fluid Pressure Check</h3>
              {assessment ? (
                <>
                  <p>
                    Continue to the exact approved and published assessment version linked
                    to this lesson.
                  </p>
                  <Link
                    className="curriculum-action"
                    href="/assessments/basic-fluid-pressure-check"
                  >
                    Open linked assessment
                  </Link>
                </>
              ) : studentSession ? (
                <Alert title="Assessment gate closed" tone="warning">
                  No exact approved and published assessment version currently matches
                  this lesson. The pilot remains fail-closed.
                </Alert>
              ) : (
                <>
                  <p>
                    Sign in as a student before the platform checks assessment
                    availability and private attempt history.
                  </p>
                  <Link
                    className="curriculum-action"
                    href="/auth/sign-in?next=%2Flearn%2Fpilot"
                  >
                    Sign in to continue
                  </Link>
                </>
              )}
            </li>
            <li className="curriculum-card">
              <p className="il-card-kicker">3. Saved evidence</p>
              <h3>Review progress</h3>
              <p>
                Completed attempts, score evidence, competency, and lesson progress are
                shown only in the authenticated student workspace.
              </p>
              <Link className="curriculum-action" href="/dashboard">
                View student progress
              </Link>
            </li>
          </ol>
        ) : (
          <Alert title="Pilot lesson unavailable" tone="warning">
            The approved lesson is not currently available, so this path exposes no
            substitute or draft content.
          </Alert>
        )}
      </section>
    </div>
  );
}
