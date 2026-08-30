import { notFound } from "next/navigation";

import { ProtectedPage } from "@/features/auth/protected-page";
import { readSessionTokens, requireAnyRole } from "@/features/auth/server";
import { BasicPressureReviewDetail } from "@/features/content-governance/review-detail";
import { loadReviewGovernanceModel } from "@/features/content-governance/server-data";
import { LessonRenderer } from "@/features/lesson-engine/components";
import {
  getInternalLessonBySlug,
  getSourceRecordsById
} from "@/features/lesson-engine/data";
import { getInternalVisualExperienceOverrides } from "@/features/lesson-engine/visual-experience-registry";

type ReviewLessonPageProps = {
  params: Promise<{ lessonSlug: string }>;
  searchParams: Promise<{ review_result?: string }>;
};

export default async function ReviewLessonPage({
  params,
  searchParams
}: ReviewLessonPageProps) {
  const { lessonSlug } = await params;
  const session = await requireAnyRole(
    ["engineering_reviewer", "administrator"],
    `/review/${lessonSlug}`
  );
  const lesson = getInternalLessonBySlug({
    slug: lessonSlug,
    audience: "engineering_reviewer",
    access: { reviewerAuthorized: true }
  });

  if (!lesson || lesson.slug !== "basic-fluid-pressure") {
    notFound();
  }

  const { accessToken } = await readSessionTokens();
  const model = await loadReviewGovernanceModel(session, accessToken);
  const item = model.items.find((candidate) => candidate.slug === lesson.slug);
  const visualStageOverrides = getInternalVisualExperienceOverrides(lesson);
  const { review_result: reviewResult } = await searchParams;

  return (
    <ProtectedPage
      description="Inspect the exact lesson, evidence, assessment scope, and model before recording a human decision."
      session={session}
      title="Basic Fluid Pressure review"
    >
      <BasicPressureReviewDetail item={item} result={reviewResult} />
      <section aria-labelledby="review-lesson-preview">
        <h2 id="review-lesson-preview">Exact lesson preview</h2>
        <LessonRenderer
          lesson={lesson}
          sources={getSourceRecordsById(lesson.sourceIds)}
          {...(visualStageOverrides ? { visualStageOverrides } : {})}
        />
      </section>
    </ProtectedPage>
  );
}
