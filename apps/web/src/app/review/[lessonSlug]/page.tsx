import { notFound, redirect } from "next/navigation";

import { Breadcrumbs } from "@industrial-learn/design-system";

import { ProtectedPage } from "@/features/auth/protected-page";
import { readSessionTokens, requireCapability } from "@/features/auth/server";
import { hasCapability } from "@/features/auth/session-core";
import { BasicPressureReviewDetail } from "@/features/content-governance/review-detail";
import { getBasicPressureReviewEvidence } from "@/features/content-governance/review-evidence";
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
  const session = await requireCapability("workspace:review", `/review/${lessonSlug}`);
  const { accessToken } = await readSessionTokens();
  const model = await loadReviewGovernanceModel(session, accessToken);
  const item = model.items.find((candidate) => candidate.slug === lessonSlug);

  if (!item) {
    redirect(
      `/auth/error?error=review_assignment_required&next=${encodeURIComponent(`/review/${lessonSlug}`)}`
    );
  }

  const relatedLessonSlug = item.relatedLessonSlug ?? lessonSlug;
  const lesson = getInternalLessonBySlug({
    slug: relatedLessonSlug,
    audience: "engineering_reviewer",
    access: { reviewerAuthorized: true }
  });

  if (!lesson || lesson.slug !== "basic-fluid-pressure") {
    notFound();
  }

  const visualStageOverrides = getInternalVisualExperienceOverrides(lesson);
  const evidence = getBasicPressureReviewEvidence();
  const { review_result: reviewResult } = await searchParams;
  const activeAssignment =
    item.assignment?.reviewerProfileId === session.profile.id &&
    (item.assignment.status === "assigned" || item.assignment.status === "in_progress");
  const canRecordDecision =
    hasCapability(session, "content:review:approve") &&
    (session.roles.includes("administrator") || activeAssignment);
  const canApprove = canRecordDecision && item.authorProfileId !== session.profile.id;

  return (
    <div className="operational-page page-stack">
      <Breadcrumbs
        items={[
          { href: "/workspace", label: "Workspace" },
          { href: "/review", label: "Engineering Review" },
          { href: `/review/${item.slug}`, label: item.title },
          {
            href: `/review/${item.slug}#review-target-title`,
            label: `Version ${item.contentVersion}`
          }
        ]}
      />
      <ProtectedPage
        description="Inspect the exact governed version, evidence, assessment scope, and related learning experience before recording a human decision."
        session={session}
        title={`${item.title} review`}
      >
        <BasicPressureReviewDetail
          assessment={evidence.assessment}
          canApprove={canApprove}
          canRecordDecision={canRecordDecision}
          item={item}
          result={reviewResult}
          sources={evidence.sources}
        />
        <section aria-labelledby="review-lesson-preview">
          <h2 id="review-lesson-preview">Exact lesson preview</h2>
          <LessonRenderer
            lesson={lesson}
            sources={getSourceRecordsById(lesson.sourceIds)}
            {...(visualStageOverrides ? { visualStageOverrides } : {})}
          />
        </section>
      </ProtectedPage>
    </div>
  );
}
