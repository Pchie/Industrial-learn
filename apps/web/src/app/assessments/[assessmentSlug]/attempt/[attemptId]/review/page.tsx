import {
  AssessmentNotFound,
  AssessmentReviewView
} from "@/features/assessments/components";
import { loadCompletedAssessmentReview } from "@/features/assessments/server";
import { requireStudentProfile } from "@/features/auth/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type AssessmentReviewPageProps = {
  params: Promise<{
    assessmentSlug: string;
    attemptId: string;
  }>;
};

export default async function AssessmentReviewPage({
  params
}: AssessmentReviewPageProps) {
  const { assessmentSlug, attemptId } = await params;
  const session = await requireStudentProfile(
    `/assessments/${assessmentSlug}/attempt/${attemptId}/review`
  );
  const model = await loadCompletedAssessmentReview(session, assessmentSlug, attemptId);

  if (!model) {
    return <AssessmentNotFound title="Review unavailable" />;
  }

  return <AssessmentReviewView model={model} />;
}
