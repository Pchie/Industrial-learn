import { ProtectedPage } from "@/features/auth/protected-page";
import { requireAuthenticatedUser } from "@/features/auth/server";

export default async function ProjectsPage() {
  const session = await requireAuthenticatedUser("/projects");

  return (
    <ProtectedPage
      description="Project access is scoped by authenticated profile ownership and future cohort policy."
      session={session}
      title="Projects"
    />
  );
}
