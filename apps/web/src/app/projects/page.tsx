import { ProtectedPage } from "@/features/auth/protected-page";
import { requireAuthenticatedUser } from "@/features/auth/server";
import { PageLink, WorkspaceEmptyState } from "@/features/page-layout/components";

export default async function ProjectsPage() {
  const session = await requireAuthenticatedUser("/projects");

  return (
    <ProtectedPage
      description="Put your engineering knowledge into practice."
      session={session}
      title="Projects"
    >
      <WorkspaceEmptyState
        title="Project workspace is being prepared"
        kind="projects"
        action={<PageLink href="/dashboard">Open your learning dashboard</PageLink>}
      >
        <p>
          Project creation and submission are not available here yet. Continue with your
          available lessons and practical challenges.
        </p>
      </WorkspaceEmptyState>
    </ProtectedPage>
  );
}
