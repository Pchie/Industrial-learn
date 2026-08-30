import Link from "next/link";

import { Alert, Breadcrumbs } from "@industrial-learn/design-system";

import { ProtectedPage } from "@/features/auth/protected-page";
import { requireCapability } from "@/features/auth/server";
import { WorkspacePerspectiveBanner } from "@/features/auth/workspace-perspective-banner";

type LecturerPageProps = { searchParams: Promise<{ perspective?: string }> };

export default async function LecturerPage({ searchParams }: LecturerPageProps) {
  const session = await requireCapability("workspace:lecturer", "/lecturer");
  const { perspective } = await searchParams;

  return (
    <div className="operational-page page-stack">
      <Breadcrumbs
        items={[
          { href: "/workspace", label: "Workspace" },
          { href: "/lecturer", label: "Lecturer" }
        ]}
      />
      <ProtectedPage
        description="Use authorised teaching and cohort tools without exposing unrelated student-private records."
        session={session}
        title="Lecturer workspace"
      >
        <WorkspacePerspectiveBanner perspective={perspective} session={session} />
        <Alert title="Teaching tools" tone="info">
          Cohort management remains limited to courses assigned to this lecturer.
        </Alert>
        <div className="workspace-links">
          <Link href="/learn">Browse curriculum</Link>
          <Link href="/assessments">Open assessments</Link>
          <Link href="/simulations">Open Simulation Lab</Link>
        </div>
      </ProtectedPage>
    </div>
  );
}
