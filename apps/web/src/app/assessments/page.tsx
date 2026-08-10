import { AssessmentList } from "@/features/assessments/components";
import { listAssessmentsForStudent } from "@/features/assessments/server";
import { requireStudentProfile } from "@/features/auth/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AssessmentsPage() {
  const session = await requireStudentProfile("/assessments");
  const assessments = await listAssessmentsForStudent(session);

  return <AssessmentList assessments={assessments} />;
}
