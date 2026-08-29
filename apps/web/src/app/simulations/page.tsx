import { resolveAuthenticatedSession } from "@/features/auth/server";
import { SimulationLab } from "@/features/simulations/simulation-lab-client";
import { loadSimulationLabModel } from "@/features/simulations/server";

export default async function SimulationsPage() {
  const auth = await resolveAuthenticatedSession();
  const session = auth.ok && auth.value.roles.includes("student") ? auth.value : null;
  const model = await loadSimulationLabModel(session);

  return <SimulationLab model={model} />;
}
