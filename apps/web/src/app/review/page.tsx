import { ProtectedPage } from "@/features/auth/protected-page";
import { requireAnyRole } from "@/features/auth/server";
import { ReviewWorkspace } from "@/features/content-governance/components";
import { loadReviewGovernanceModel } from "@/features/content-governance/server-data";

export default async function ReviewPage() {
  const session = await requireAnyRole(
    ["engineering_reviewer", "administrator"],
    "/review"
  );
  const model = loadReviewGovernanceModel(session);

  return (
    <ProtectedPage
      description="Engineering review requires reviewer or administrator authorisation resolved on the server."
      session={session}
      title="Engineering review"
    >
      <ReviewWorkspace model={model} />
    </ProtectedPage>
  );
}
