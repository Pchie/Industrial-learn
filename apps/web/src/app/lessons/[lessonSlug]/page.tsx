import { notFound } from "next/navigation";

import { LessonRenderer } from "@/features/lesson-engine/components";
import {
  getLessonBySlug,
  getLessons,
  getSourceRecordsById
} from "@/features/lesson-engine/data";

type LessonPageProps = {
  params: Promise<{
    lessonSlug: string;
  }>;
};

export function generateStaticParams() {
  return getLessons().map((lesson) => ({
    lessonSlug: lesson.slug
  }));
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { lessonSlug } = await params;
  const lesson = getLessonBySlug(lessonSlug);

  if (!lesson) {
    notFound();
  }

  return (
    <LessonRenderer lesson={lesson} sources={getSourceRecordsById(lesson.sourceIds)} />
  );
}
