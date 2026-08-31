import type { Metadata } from "next";

import { Breadcrumbs } from "@industrial-learn/design-system";

import { ProtectedPage } from "@/features/auth/protected-page";
import { requireCapability } from "@/features/auth/server";
import { WorkspacePerspectiveBanner } from "@/features/auth/workspace-perspective-banner";
import { AuthorWorkspace } from "@/features/content-governance/components";
import { loadAuthorGovernanceModel } from "@/features/content-governance/server-data";

export const metadata: Metadata = {
  title: "Author Workspace | Industrial Learn",
  description: "Content authoring and governance workspace."
};

type AuthorPageProps = { searchParams: Promise<{ perspective?: string }> };

export default async function AuthorPage({ searchParams }: AuthorPageProps) {
  const session = await requireCapability("workspace:author", "/author");
  const model = loadAuthorGovernanceModel(session);
  const { perspective } = await searchParams;

  return (
    <div className="operational-page page-stack">
      <Breadcrumbs
        items={[
          { href: "/workspace", label: "Workspace" },
          { href: "/author", label: "Content Authoring" }
        ]}
      />
      <ProtectedPage
        description="Authoring requires a trusted content-author or administrator role from database-backed profile records."
        session={session}
        title="Author workspace"
      >
        <WorkspacePerspectiveBanner perspective={perspective} session={session} />
        <AuthorWorkspace model={model} />
      </ProtectedPage>
    </div>
  );
}
