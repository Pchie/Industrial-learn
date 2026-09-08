export const viewModes = [
  "standard",
  "anatomy",
  "explodedview",
  "360view",
  "aerialview"
] as const;
export type SimulationViewMode = (typeof viewModes)[number];
export const viewLabels: Record<SimulationViewMode, string> = {
  standard: "Standard",
  anatomy: "Anatomy",
  explodedview: "Exploded view",
  "360view": "360 view",
  aerialview: "Aerial view"
};
export const inspectionCapabilities = {
  "basic-fluid-pressure": ["standard"],
  "hydraulic-cylinder-force": ["standard", "anatomy", "explodedview", "360view"],
  "bernoulli-flow-lab": ["standard", "aerialview"]
} as const satisfies Record<string, readonly SimulationViewMode[]>;
export type InspectionSlug = keyof typeof inspectionCapabilities;

export function getSupportedViews(slug: string): readonly SimulationViewMode[] {
  return Object.hasOwn(inspectionCapabilities, slug)
    ? inspectionCapabilities[slug as InspectionSlug]
    : [];
}
export function isSupportedView(slug: string, mode: string): mode is SimulationViewMode {
  return getSupportedViews(slug).some((candidate) => candidate === mode);
}
export function viewHref(basePath: string, mode: SimulationViewMode) {
  return mode === "standard" ? basePath : `${basePath}/${mode}`;
}
// Advanced visuals have no independent student-use approval yet. Existing simulation
// approval must never silently publish a new anatomy/assembly representation.
export function isStudentViewReleased(mode: SimulationViewMode) {
  return mode === "standard";
}

export type ViewNavigation = { basePath: string; initialView: SimulationViewMode };
