import { requireStudentProfile } from "@/features/auth/server";
import { SimulationList } from "@/features/simulations/components";
import { listSimulationsForStudent } from "@/features/simulations/server";

export default async function SimulationsPage() {
  const session = await requireStudentProfile("/simulations");
  const simulations = await listSimulationsForStudent(session);

  return <SimulationList simulations={simulations} />;
}
