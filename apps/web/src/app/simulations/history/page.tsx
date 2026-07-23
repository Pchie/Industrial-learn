import { ProtectedPage } from "@/features/auth/protected-page";
import { requireAuthenticatedUser } from "@/features/auth/server";

export default async function SimulationHistoryPage() {
  const session = await requireAuthenticatedUser("/simulations/history");

  return (
    <ProtectedPage
      description="Simulation history is private learning evidence and requires server-side session verification."
      session={session}
      title="Simulation history"
    />
  );
}
