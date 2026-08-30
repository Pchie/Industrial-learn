import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Alert, Breadcrumbs } from "@industrial-learn/design-system";

import { requireCapability } from "@/features/auth/server";
import { LessonRenderer } from "@/features/lesson-engine/components";
import {
  getInternalLessonBySlug,
  getSourceRecordsById
} from "@/features/lesson-engine/data";
import { getInternalVisualExperienceOverrides } from "@/features/lesson-engine/visual-experience-registry";

export const metadata: Metadata = {
  title: "Protected Lesson Preview | Industrial Learn",
  robots: { index: false, follow: false }
};

type PreviewLessonPageProps = {
  params: Promise<{ lessonSlug: string }>;
  searchParams: Promise<{ version?: string }>;
};

export default async function PreviewLessonPage({
  params,
  searchParams
}: PreviewLessonPageProps) {
  const { lessonSlug } = await params;
  const { version } = await searchParams;
  await requireCapability(
    "content:preview",
    `/preview/lessons/${lessonSlug}?version=${encodeURIComponent(version ?? "")}`
  );

  const lesson = getInternalLessonBySlug({
    slug: lessonSlug,
    audience: "engineering_reviewer",
    access: { reviewerAuthorized: true }
  });

  if (!lesson || !version || lesson.version !== version) {
    notFound();
  }

  const visualStageOverrides = getInternalVisualExperienceOverrides(lesson);

  return (
    <div className="operational-page page-stack">
      <Breadcrumbs
        items={[
          { href: "/workspace", label: "Workspace" },
          { href: "/review", label: "Engineering Review" },
          { href: `/review/${lesson.slug}`, label: lesson.title },
          {
            href: `/preview/lessons/${lesson.slug}?version=${encodeURIComponent(lesson.version)}`,
            label: `Preview ${lesson.version}`
          }
        ]}
      />
      <Alert title="PREVIEW — NOT PUBLISHED" tone="warning">
        You are viewing protected content version {lesson.version}. This route does not
        publish the lesson or add it to student catalogues.
      </Alert>
      <LessonRenderer
        lesson={lesson}
        sources={getSourceRecordsById(lesson.sourceIds)}
        {...(visualStageOverrides ? { visualStageOverrides } : {})}
      />
    </div>
  );
}
