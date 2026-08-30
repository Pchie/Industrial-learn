import { unstable_noStore as noStore } from "next/cache";
import { StudentDashboard } from "@/features/student-dashboard/components";
import { buildStudentDashboardModel } from "@/features/student-dashboard/data";
import { loadStudentDashboardData } from "@/features/student-dashboard/server-data";
import { requireStudentProfile } from "@/features/auth/server";
import { WorkspacePerspectiveBanner } from "@/features/auth/workspace-perspective-banner";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type DashboardPageProps = {
  searchParams: Promise<{
    hideRecommendations?: string;
    perspective?: string;
  }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  noStore();
  const params = await searchParams;
  const session = await requireStudentProfile("/dashboard");
  const dashboardData = await loadStudentDashboardData(session);

  return (
    <div className="page-stack">
      <WorkspacePerspectiveBanner perspective={params.perspective} session={session} />
      <StudentDashboard
        hideRecommendations={params.hideRecommendations === "1"}
        model={buildStudentDashboardModel(dashboardData)}
      />
    </div>
  );
}
