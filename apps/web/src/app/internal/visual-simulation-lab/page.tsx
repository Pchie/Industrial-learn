import type { Metadata } from "next";

import { requireAnyRole } from "@/features/auth/server";
import { VisualSimulationLab } from "@/features/visual-simulation/visual-simulation-lab";

export const metadata: Metadata = {
  title: "Visual Simulation Lab | Industrial Learn",
  description: "Private component playground for the visual simulation foundation.",
  robots: {
    index: false,
    follow: false
  }
};

export default async function VisualSimulationLabPage() {
  await requireAnyRole(
    ["content_author", "engineering_reviewer", "administrator"],
    "/internal/visual-simulation-lab"
  );

  return <VisualSimulationLab />;
}
