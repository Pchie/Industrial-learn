import { notFound } from "next/navigation";

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
  const visualStageOverrides = getPublicVisualExperienceOverrides(publicLesson);

  return (
    <LessonRenderer
      lesson={publicLesson}
      sources={getSourceRecordsById(publicLesson.sourceIds)}
      {...(visualStageOverrides ? { visualStageOverrides } : {})}
    />
  );
}
