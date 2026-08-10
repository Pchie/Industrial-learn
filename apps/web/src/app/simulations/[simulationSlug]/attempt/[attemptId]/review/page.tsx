import { notFound } from "next/navigation";

import { requireStudentProfile } from "@/features/auth/server";
import { SimulationReviewView } from "@/features/simulations/components";
import { loadCompletedSimulationReview } from "@/features/simulations/server";

export default async function SimulationReviewPage({
  params
}: {
  params: Promise<{ simulationSlug: string; attemptId: string }>;
}) {
  const { simulationSlug, attemptId } = await params;
  const session = await requireStudentProfile(
    `/simulations/${simulationSlug}/attempt/${attemptId}/review`
  );
  const model = await loadCompletedSimulationReview(session, simulationSlug, attemptId);

  if (!model) {
    notFound();
  }

  return <SimulationReviewView model={model} />;
}
