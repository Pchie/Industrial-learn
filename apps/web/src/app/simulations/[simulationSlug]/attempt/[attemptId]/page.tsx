import { notFound } from "next/navigation";

import { requireStudentProfile } from "@/features/auth/server";
import { SimulationAttemptView } from "@/features/simulations/components";
import { loadSimulationAttemptPage } from "@/features/simulations/server";

export default async function SimulationAttemptPage({
  params,
  searchParams
}: {
  params: Promise<{ simulationSlug: string; attemptId: string }>;
  searchParams: Promise<{ error?: string | string[] }>;
}) {
  const { simulationSlug, attemptId } = await params;
  const session = await requireStudentProfile(
    `/simulations/${simulationSlug}/attempt/${attemptId}`
  );
  const model = await loadSimulationAttemptPage(session, simulationSlug, attemptId);

  if (!model) {
    notFound();
  }

  const query = await searchParams;
  const error = Array.isArray(query.error) ? query.error[0] : query.error;

  return (
    <SimulationAttemptView
      message={error ? decodeURIComponent(error) : undefined}
      model={model}
    />
  );
}
