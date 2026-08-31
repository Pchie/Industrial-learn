import { ProtectedPage } from "@/features/auth/protected-page";
import { readSessionTokens, requireCapability } from "@/features/auth/server";
import { WorkspacePerspectiveBanner } from "@/features/auth/workspace-perspective-banner";
import { ReviewWorkspace } from "@/features/content-governance/components";
import { loadReviewGovernanceModel } from "@/features/content-governance/server-data";

type ReviewPageProps = { searchParams: Promise<{ perspective?: string }> };

export default async function ReviewPage({ searchParams }: ReviewPageProps) {
  const session = await requireCapability("workspace:review", "/review");
  const { accessToken } = await readSessionTokens();
  const model = await loadReviewGovernanceModel(session, accessToken);
  const { perspective } = await searchParams;

  return (
    <div className="operational-page page-stack">
      <Breadcrumbs
        items={[
          { href: "/workspace", label: "Workspace" },
          { href: "/review", label: "Engineering Review" }
        ]}
      />
      <ProtectedPage
        description="Engineering review requires reviewer or administrator authorisation resolved on the server."
        session={session}
        title="Engineering Review Workspace"
      >
        <WorkspacePerspectiveBanner perspective={perspective} session={session} />
        <ReviewWorkspace model={model} />
      </ProtectedPage>
    </div>
  );
}
import { Breadcrumbs } from "@industrial-learn/design-system";
