import { ProtectedPage } from "@/features/auth/protected-page";
import { requireStudentProfile } from "@/features/auth/server";
import { loadStudentDashboardData } from "@/features/student-dashboard/server-data";
import { buildDashboardExperience } from "@/features/student-dashboard/experience";
import { LearningLibrary } from "@/features/student-dashboard/learning-library-view";
import {
  buildLearningLibrary,
  learningView
} from "@/features/student-dashboard/learning-library";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function MyLearningPage({
  searchParams
}: {
  searchParams: Promise<{ view?: string; q?: string }>;
}) {
  const session = await requireStudentProfile("/my-learning");
  const [params, data] = await Promise.all([
    searchParams,
    loadStudentDashboardData(session, true)
  ]);
  const view = learningView(params.view);
  const query = typeof params.q === "string" ? params.q.slice(0, 200) : "";

  return (
    <ProtectedPage
      description="Pick up your studies, revisit saved lessons and review your progress."
      session={session}
      title="My learning"
    >
      <LearningLibrary
        model={buildDashboardExperience(data)}
        library={buildLearningLibrary(data, view, query)}
        view={view}
        query={query}
      />
    </ProtectedPage>
  );
}
