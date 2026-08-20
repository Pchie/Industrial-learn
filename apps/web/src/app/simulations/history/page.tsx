import { requireAuthenticatedUser } from "@/features/auth/server";
import { SimulationHistoryView } from "@/features/simulations/components";
import { listSimulationHistory } from "@/features/simulations/server";

export default async function SimulationHistoryPage() {
  const session = await requireAuthenticatedUser("/simulations/history");
  const attempts = await listSimulationHistory(session);

  return <SimulationHistoryView attempts={attempts} />;
}
