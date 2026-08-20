import {
  AssessmentAttemptView,
  AssessmentNotFound
} from "@/features/assessments/components";
import { loadAssessmentAttemptPage } from "@/features/assessments/server";
import { requireStudentProfile } from "@/features/auth/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type AssessmentAttemptPageProps = {
  params: Promise<{
    assessmentSlug: string;
    attemptId: string;
  }>;
  searchParams: Promise<{
    error?: string;
    saved?: string;
  }>;
};

export default async function AssessmentAttemptPage({
  params,
  searchParams
}: AssessmentAttemptPageProps) {
  const { assessmentSlug, attemptId } = await params;
  const query = await searchParams;
  const session = await requireStudentProfile(
    `/assessments/${assessmentSlug}/attempt/${attemptId}`
  );
  const model = await loadAssessmentAttemptPage(session, assessmentSlug, attemptId);

  if (!model) {
    return <AssessmentNotFound title="Attempt unavailable" />;
  }

  const message = query.error
    ? decodeURIComponent(query.error)
    : query.saved
      ? "Progress saved."
      : undefined;

  return <AssessmentAttemptView message={message} model={model} />;
}
