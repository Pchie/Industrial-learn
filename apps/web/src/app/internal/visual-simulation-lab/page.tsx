import type { Metadata } from "next";
import Link from "next/link";

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

  return (
    <div className="page-stack">
      <nav className="inspection-entry-links" aria-label="Flagship inspection previews">
        <Link href="/internal/simulations/hydraulic-cylinder-force">
          Hydraulic Cylinder inspection
        </Link>
        <Link href="/internal/simulations/bernoulli-flow-lab">
          Bernoulli Flow inspection
        </Link>
      </nav>
      <VisualSimulationLab />
    </div>
  );
}
