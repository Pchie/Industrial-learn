import type { Metadata } from "next"; // Add this import
import { ProtectedPage } from "@/features/auth/protected-page";
import { requireAnyRole } from "@/features/auth/server";
import { AuthorWorkspace } from "@/features/content-governance/components";
import { loadAuthorGovernanceModel } from "@/features/content-governance/server-data";

// Export the metadata object so Next.js injects it into the <head>
export const metadata: Metadata = {
  title: "Author Workspace | Industrial Learn",
  description: "Content authoring and governance workspace.",
};

export default async function AuthorPage() {
  const session = await requireAnyRole(["content_author", "administrator"], "/author");
  const model = loadAuthorGovernanceModel(session);

  return (
    <ProtectedPage
      description="Authoring requires a trusted content-author or administrator role from database-backed profile records."
      session={session}
      title="Author workspace"
    >
      <AuthorWorkspace model={model} />
    </ProtectedPage>
  );
}

