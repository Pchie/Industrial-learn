import {
  AssessmentNotFound,
  AssessmentOverviewView
} from "@/features/assessments/components";
import { loadAssessmentOverview } from "@/features/assessments/server";
import { requireStudentProfile } from "@/features/auth/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type AssessmentPageProps = {
  params: Promise<{
    assessmentSlug: string;
  }>;
};

export default async function AssessmentPage({ params }: AssessmentPageProps) {
  const { assessmentSlug } = await params;
  const session = await requireStudentProfile(`/assessments/${assessmentSlug}`);
  const overview = await loadAssessmentOverview(session, assessmentSlug);

  if (!overview) {
    return <AssessmentNotFound />;
  }

  return <AssessmentOverviewView overview={overview} />;
}
