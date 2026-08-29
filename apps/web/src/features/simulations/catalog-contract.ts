export const simulationDisciplines = [
  "Mechanical",
  "Fluid Systems",
  "Thermodynamics",
  "Electrical",
  "Automation",
  "Energy",
  "Future Engineering"
] as const;

export const simulationTypes = [
  "Component",
  "System",
  "Calculation",
  "Schematic",
  "Fault Diagnosis",
  "Design"
] as const;

export const simulationDifficulties = ["Beginner", "Intermediate", "Advanced"] as const;

export type SimulationDiscipline = (typeof simulationDisciplines)[number];
export type SimulationType = (typeof simulationTypes)[number];
export type SimulationDifficulty = (typeof simulationDifficulties)[number];
export type SimulationAvailability =
  "available" | "coming-later" | "locked-by-prerequisite";

export type SimulationPreviewMetadata = {
  kind:
    | "hydraulic-cylinder"
    | "bernoulli-flow"
    | "thermodynamic-boundary"
    | "schematic-placeholder";
  alt: string;
  lowDataDescription: string;
};
