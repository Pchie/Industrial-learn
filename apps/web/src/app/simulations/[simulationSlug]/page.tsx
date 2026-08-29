import { notFound } from "next/navigation";

import { resolveAuthenticatedSession } from "@/features/auth/server";
import { SimulationOverviewView } from "@/features/simulations/components";
import {
  loadPublicSimulationOverview,
  loadSimulationOverview
} from "@/features/simulations/server";

export default async function SimulationOverviewPage({
  params,
  searchParams
}: {
  params: Promise<{ simulationSlug: string }>;
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const { simulationSlug } = await params;
  const auth = await resolveAuthenticatedSession();
  const session = auth.ok && auth.value.roles.includes("student") ? auth.value : null;
  const publicOverview = loadPublicSimulationOverview(simulationSlug);
  const overview =
    session && publicOverview?.availability === "available"
      ? await loadSimulationOverview(session, simulationSlug)
      : publicOverview;

  if (!overview) {
    notFound();
  }

  const query = await searchParams;
  const error = Array.isArray(query.error) ? query.error[0] : query.error;

  return (
    <SimulationOverviewView
      authenticated={Boolean(session)}
      message={error ? "The simulation request could not be completed." : undefined}
      overview={overview}
    />
  );
}
