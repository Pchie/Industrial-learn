import { ProtectedPage } from "@/features/auth/protected-page";
import { requireAuthenticatedUser } from "@/features/auth/server";

export default async function MyLearningPage() {
  const session = await requireAuthenticatedUser("/my-learning");

  return (
    <ProtectedPage
      description="Personal learning routes require a trusted authenticated session."
      session={session}
      title="My learning"
    />
  );
}
