import { notFound } from "next/navigation";

import { requireStudentProfile } from "@/features/auth/server";
import { SimulationOverviewView } from "@/features/simulations/components";
import { loadSimulationOverview } from "@/features/simulations/server";

export default async function SimulationOverviewPage({
  params,
  searchParams
}: {
  params: Promise<{ simulationSlug: string }>;
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const { simulationSlug } = await params;
  const session = await requireStudentProfile(`/simulations/${simulationSlug}`);
  const overview = await loadSimulationOverview(session, simulationSlug);

  if (!overview) {
    notFound();
  }

  const query = await searchParams;
  const error = Array.isArray(query.error) ? query.error[0] : query.error;

  return (
    <SimulationOverviewView
      message={error ? "The simulation request could not be completed." : undefined}
      overview={overview}
    />
  );
}
