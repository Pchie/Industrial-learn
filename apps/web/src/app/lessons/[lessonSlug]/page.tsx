import { notFound } from "next/navigation";
import Link from "next/link";
import { SaveLesson } from "@/features/student-dashboard/save-lesson";
import { readSavedLesson } from "@/features/student-dashboard/saved-lessons-server";
import { hasCapability } from "@/features/auth/session-core";

import { resolveAuthenticatedSession } from "@/features/auth/server";
import { LessonRenderer } from "@/features/lesson-engine/components";
import { isLiveLessonPublished } from "@/features/lesson-engine/live-publication";
import {
  getPublicLessonBySlug,
  getPublicLessons,
  getSourceRecordsById
} from "@/features/lesson-engine/data";
import {
  getPublicVisualExperienceOverrides,
  projectLessonForPublicDelivery
} from "@/features/lesson-engine/visual-experience-registry";

type LessonPageProps = {
  params: Promise<{
    lessonSlug: string;
  }>;
};

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return getPublicLessons().map((lesson) => ({
    lessonSlug: lesson.slug
  }));
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { lessonSlug } = await params;
  const lesson = getPublicLessonBySlug(lessonSlug);

  if (!lesson || !(await isLiveLessonPublished(lesson))) {
    notFound();
  }

  const publicLesson = projectLessonForPublicDelivery(lesson);
  const session = await resolveAuthenticatedSession();
  const canSaveProgress = session.ok && session.value.roles.includes("student");
  const canSaveLesson = session.ok && hasCapability(session.value, "workspace:student");
  const saved = canSaveLesson
    ? await readSavedLesson(session.value, lessonSlug).catch(() => null)
    : null;
  const visualStageOverrides = getPublicVisualExperienceOverrides(publicLesson, {
    canSaveProgress
  });

  return (
    <LessonRenderer
      isAuthenticated={canSaveProgress}
      lesson={publicLesson}
      learningActions={
        <div className="lesson-workspace-actions">
          {canSaveLesson ? (
            saved === null ? (
              <p role="status">Saved lessons are temporarily unavailable.</p>
            ) : (
              <SaveLesson slug={lessonSlug} saved={saved} />
            )
          ) : !session.ok ? (
            <Link
              href={`/auth/sign-in?next=${encodeURIComponent(`/lessons/${lessonSlug}`)}`}
            >
              Sign in to save this lesson
            </Link>
          ) : null}
          <Link href={canSaveLesson ? "/my-learning" : "/learn"}>
            {canSaveLesson ? "Back to My Learning" : "Browse learning"}
          </Link>
          <a href="#source-records-title">Lesson references</a>
        </div>
      }
      sources={getSourceRecordsById(publicLesson.sourceIds)}
      {...(visualStageOverrides ? { visualStageOverrides } : {})}
    />
  );
}
