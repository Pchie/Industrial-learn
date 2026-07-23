import { ProtectedPage } from "@/features/auth/protected-page";
import { requireAuthenticatedUser } from "@/features/auth/server";

export default async function AssessmentsPage() {
  const session = await requireAuthenticatedUser("/assessments");

  return (
    <ProtectedPage
      description="Assessment attempts require authenticated session ownership before private results are loaded."
      session={session}
      title="Assessments"
    />
  );
}
