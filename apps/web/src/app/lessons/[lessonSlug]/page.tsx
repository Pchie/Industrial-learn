import { notFound } from "next/navigation";

import { resolveAuthenticatedSession } from "@/features/auth/server";
import { LessonRenderer } from "@/features/lesson-engine/components";
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

  if (!lesson) {
    notFound();
  }

  const publicLesson = projectLessonForPublicDelivery(lesson);
  const session = await resolveAuthenticatedSession();
  const canSaveProgress = session.ok && session.value.roles.includes("student");
  const visualStageOverrides = getPublicVisualExperienceOverrides(publicLesson, {
    canSaveProgress
  });

  return (
    <LessonRenderer
      isAuthenticated={canSaveProgress}
      lesson={publicLesson}
      sources={getSourceRecordsById(publicLesson.sourceIds)}
      {...(visualStageOverrides ? { visualStageOverrides } : {})}
    />
  );
}
