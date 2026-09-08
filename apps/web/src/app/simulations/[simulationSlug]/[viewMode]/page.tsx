import { notFound } from "next/navigation";
import { getPublicSimulationCatalogBySlug } from "@/features/simulations/catalog";
import { getPublicLessonBySlug } from "@/features/lesson-engine/data";
import {
  isStudentViewReleased,
  isSupportedView
} from "@/features/simulation-views/capabilities";
import { InspectionWorkspace } from "@/features/simulation-views/inspection-workspace";

export const dynamic = "force-dynamic";

export default async function PublicSimulationInspection({
  params
}: {
  params: Promise<{ simulationSlug: string; viewMode: string }>;
}) {
  const { simulationSlug, viewMode } = await params;
  const entry = getPublicSimulationCatalogBySlug(simulationSlug);
  if (
    !entry ||
    !isSupportedView(simulationSlug, viewMode) ||
    !isStudentViewReleased(viewMode)
  )
    notFound();
  const lesson = getPublicLessonBySlug(entry.lessonSlug);
  if (!lesson) notFound();
  return (
    <InspectionWorkspace
      slug={simulationSlug}
      lesson={lesson}
      navigation={{ basePath: `/simulations/${simulationSlug}`, initialView: viewMode }}
    />
  );
}
