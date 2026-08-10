import {
  hydraulicCylinderForceSimulationDefinition,
  type SimulationDefinition
} from "@industrial-learn/simulation-engine";

export type SimulationCatalogEntry = {
  slug: string;
  moduleSlug: string;
  moduleTitle: string;
  lessonSlug: string;
  lessonTitle: string;
  estimatedMinutes: number;
  definition: SimulationDefinition;
};

export const simulationCatalog: SimulationCatalogEntry[] = [
  {
    slug: "hydraulic-cylinder-force",
    moduleSlug: "fluid-mechanics-foundations",
    moduleTitle: "Fluid Mechanics Foundations",
    lessonSlug: "basic-fluid-pressure",
    lessonTitle: "Basic Fluid Pressure",
    estimatedMinutes: 20,
    definition: hydraulicCylinderForceSimulationDefinition
  }
];

export function getSimulationCatalogBySlug(slug: string) {
  return simulationCatalog.find((simulation) => simulation.slug === slug);
}
