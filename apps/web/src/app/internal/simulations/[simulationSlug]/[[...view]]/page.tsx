import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Alert } from "@industrial-learn/design-system";
import { requireCapability } from "@/features/auth/server";
import { getSimulationCatalogBySlugForInternalUse } from "@/features/simulations/catalog";
import { getInternalLessonBySlug } from "@/features/lesson-engine/data";
import { isSupportedView } from "@/features/simulation-views/capabilities";
import { InspectionWorkspace } from "@/features/simulation-views/inspection-workspace";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Protected Simulation Inspection | Industrial Learn",
  robots: { index: false, follow: false }
};

export default async function InternalSimulationInspection({
  params
}: {
  params: Promise<{ simulationSlug: string; view?: string[] }>;
}) {
  const { simulationSlug, view = [] } = await params;
  const basePath = `/internal/simulations/${simulationSlug}`;
  await requireCapability(
    "content:preview",
    basePath + (view.length ? `/${view.join("/")}` : "")
  );
  const mode = view[0] ?? "standard";
  if (view.length > 1 || !isSupportedView(simulationSlug, mode)) notFound();
  const entry = getSimulationCatalogBySlugForInternalUse(simulationSlug);
  const lesson =
    entry &&
    getInternalLessonBySlug({
      slug: entry.lessonSlug,
      audience: "engineering_reviewer",
      access: { reviewerAuthorized: true }
    });
  if (!lesson || !entry) notFound();
  return (
    <div className="page-stack">
      <header className="inspection-workspace-header">
        <h1>{entry.lessonTitle}</h1>
        <Link href="/internal/visual-simulation-lab">Exit to visual lab</Link>
      </header>
      <Alert title="Engineering review required" tone="warning">
        Protected inspection preview. Lesson version {lesson.version}; visual assembly
        revision 1. These views do not approve or publish content, save an attempt, or
        award competency.
      </Alert>
      <InspectionWorkspace
        slug={simulationSlug}
        lesson={lesson}
        inspectionEnabled
        navigation={{ basePath, initialView: mode }}
      />
    </div>
  );
}
