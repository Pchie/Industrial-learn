import type { Metadata } from "next";

import { requireCapability } from "@/features/auth/server";
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
  await requireCapability("content:preview", "/internal/visual-simulation-lab");

  return <VisualSimulationLab />;
}
