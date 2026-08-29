import bernoulliFlowLesson from "../../../../../content/lessons/fluid-mechanics/bernoulli-flow-lab.json";
import hydraulicCylinderLesson from "../../../../../content/lessons/hydraulics/hydraulic-cylinder-force.json";
import thermodynamicBoundaryLesson from "../../../../../content/lessons/thermodynamics/systems-surroundings-boundaries.json";
import type {
  ContentAudience,
  PublicationAccessContext,
  PublicationVisibilityDecision
} from "@industrial-learn/content-review-workflow/publication-visibility";
import {
  bernoulliFlowSimulationDefinition,
  hydraulicCylinderForceSimulationDefinition,
  thermodynamicSystemBoundarySimulationDefinition,
  type SimulationDefinition,
  type SimulationMode
} from "@industrial-learn/simulation-engine";
import { getCurriculum } from "../curriculum/data";
import { getStaticSourceRecordsById } from "../publication/source-records";
import {
  evaluateStaticPublicationVisibility,
  type StaticGovernedContent,
  type StaticPublicationAuthority
} from "../publication/static-publication";
import type {
  SimulationAvailability,
  SimulationDifficulty,
  SimulationDiscipline,
  SimulationPreviewMetadata,
  SimulationType
} from "./catalog-contract";

export {
  simulationDifficulties,
  simulationDisciplines,
  simulationTypes
} from "./catalog-contract";
export type {
  SimulationAvailability,
  SimulationDifficulty,
  SimulationDiscipline,
  SimulationPreviewMetadata,
  SimulationType
} from "./catalog-contract";

export type SimulationCatalogEntry = {
  slug: string;
  moduleId: string;
  moduleSlug: string;
  moduleTitle: string;
  lessonSlug: string;
  lessonTitle: string;
  mainConcept: string;
  topic: string;
  components: string[];
  systems: string[];
  abbreviations: string[];
  discipline: SimulationDiscipline;
  difficulty: SimulationDifficulty;
  types: SimulationType[];
  estimatedMinutes: number;
  recommendedMode: SimulationMode;
  prerequisitePolicy: "required" | "recommended";
  prerequisiteLessonIds: string[];
  prerequisiteLessonSlugs: string[];
  careerPathwaySlugs: string[];
  reviewStatus: string;
  publicationStatus: string;
  version: number;
  intendedAvailability: SimulationAvailability;
  availableChallenge?: string | undefined;
  faultModeStatus: "available" | "evidence-required" | "not-available";
  preview: SimulationPreviewMetadata;
  whatStudentsOperate: string[];
  learningOutcomes: string[];
  definition: SimulationDefinition;
};

const hydraulicModuleId = "mod-core-fluid-mechanics-001";
const thermodynamicsModuleId = "mod-core-thermodynamics-001";

export const simulationRegistry: SimulationCatalogEntry[] = [
  {
    slug: "hydraulic-cylinder-force",
    moduleId: hydraulicModuleId,
    moduleSlug: "fluid-mechanics-foundations",
    moduleTitle: "Fluid Mechanics Foundations",
    lessonSlug: hydraulicCylinderLesson.slug,
    lessonTitle: hydraulicCylinderLesson.title,
    mainConcept:
      "See how pressure acting over effective piston area produces ideal theoretical cylinder force.",
    topic: "Hydraulic pressure, piston area and actuator force",
    components: ["Hydraulic cylinder", "Piston", "Pressure gauge"],
    systems: ["Fluid power", "Hydraulic actuation"],
    abbreviations: ["F=PA", "MPa", "kN"],
    discipline: "Fluid Systems",
    difficulty: "Beginner",
    types: ["Component", "Calculation", "Schematic"],
    estimatedMinutes: 20,
    recommendedMode: "explore",
    prerequisitePolicy: "recommended",
    prerequisiteLessonIds: hydraulicCylinderLesson.prerequisites,
    prerequisiteLessonSlugs: ["basic-fluid-pressure"],
    careerPathwaySlugs: pathwaysForModule(hydraulicModuleId),
    reviewStatus: hydraulicCylinderForceSimulationDefinition.reviewStatus,
    publicationStatus: hydraulicCylinderLesson.publicationStatus,
    version: 1,
    intendedAvailability: "available",
    availableChallenge: "Calculate and interpret theoretical cylinder force.",
    faultModeStatus: "evidence-required",
    preview: {
      kind: "hydraulic-cylinder",
      alt: "Hydraulic pressure source connected to the cap end of a cylinder, with a force arrow at the rod.",
      lowDataDescription:
        "Static hydraulic cylinder schematic showing pressure applied to a piston and an extension-force output."
    },
    whatStudentsOperate: [
      "Cylinder pressure",
      "Effective piston area",
      "Reviewed operating modes and fault controls"
    ],
    learningOutcomes: hydraulicCylinderLesson.learningOutcomes,
    definition: hydraulicCylinderForceSimulationDefinition
  },
  {
    slug: "thermal-system-boundary-simulation",
    moduleId: thermodynamicsModuleId,
    moduleSlug: "thermodynamics-foundations",
    moduleTitle: "Thermodynamics Foundations",
    lessonSlug: thermodynamicBoundaryLesson.slug,
    lessonTitle: thermodynamicBoundaryLesson.title,
    mainConcept:
      "Classify a selected thermodynamic system from whether mass and energy may cross its stated boundary.",
    topic: "Thermodynamic systems, surroundings and boundaries",
    components: ["Selected system", "System boundary", "Surroundings"],
    systems: ["Open system", "Closed system", "Isolated system"],
    abbreviations: ["Control volume", "Control mass"],
    discipline: "Thermodynamics",
    difficulty: "Beginner",
    types: ["System", "Schematic"],
    estimatedMinutes: 15,
    recommendedMode: "learn",
    prerequisitePolicy: "recommended",
    prerequisiteLessonIds: [],
    prerequisiteLessonSlugs: [],
    careerPathwaySlugs: pathwaysForModule(thermodynamicsModuleId),
    reviewStatus: thermodynamicSystemBoundarySimulationDefinition.reviewStatus,
    publicationStatus: thermodynamicBoundaryLesson.publicationStatus,
    version: 1,
    intendedAvailability: "coming-later",
    availableChallenge: "Classify one stated boundary without changing the system.",
    faultModeStatus: "evidence-required",
    preview: {
      kind: "thermodynamic-boundary",
      alt: "A selected thermodynamic system enclosed by a boundary, with mass and energy crossing questions and surroundings outside.",
      lowDataDescription:
        "Static system-boundary schematic showing a selected system, its surroundings, and possible mass and energy crossings."
    },
    whatStudentsOperate: [
      "Whether mass may cross the selected boundary",
      "Whether energy may cross the selected boundary",
      "A source-backed inconsistent-boundary diagnostic state"
    ],
    learningOutcomes: thermodynamicBoundaryLesson.learningOutcomes,
    definition: thermodynamicSystemBoundarySimulationDefinition
  },
  {
    slug: "bernoulli-flow-lab",
    moduleId: hydraulicModuleId,
    moduleSlug: "fluid-mechanics-foundations",
    moduleTitle: "Fluid Mechanics Foundations",
    lessonSlug: bernoulliFlowLesson.slug,
    lessonTitle: bernoulliFlowLesson.title,
    mainConcept:
      "Change flow rate and pipe diameter to compare area, average velocity, absolute pressure, and ideal head at two linked sections.",
    topic: "Continuity, Bernoulli equation and horizontal pipe contraction",
    components: ["Circular pipe", "Contraction", "Pressure point", "Flow meter"],
    systems: ["Ideal incompressible flow", "Differential-pressure concept"],
    abbreviations: ["Q", "P1", "P2", "v1", "v2", "Bernoulli"],
    discipline: "Fluid Systems",
    difficulty: "Intermediate",
    types: ["System", "Calculation", "Schematic"],
    estimatedMinutes: 35,
    recommendedMode: "learn",
    prerequisitePolicy: "recommended",
    prerequisiteLessonIds: bernoulliFlowLesson.prerequisites,
    prerequisiteLessonSlugs: ["basic-fluid-pressure"],
    careerPathwaySlugs: pathwaysForModule(hydraulicModuleId),
    reviewStatus: bernoulliFlowSimulationDefinition.reviewStatus,
    publicationStatus: bernoulliFlowLesson.publicationStatus,
    version: 1,
    intendedAvailability: "available",
    availableChallenge: "Reach a target velocity and predict the ideal pressure change.",
    faultModeStatus: "not-available",
    preview: {
      kind: "bernoulli-flow",
      alt: "A horizontal pipe contracts from a wide section to a narrow section, with pressure points P1 and P2 and velocity arrows.",
      lowDataDescription:
        "Static two-section pipe schematic showing a contraction, linked pressure points, and a greater velocity arrow in the smaller section."
    },
    whatStudentsOperate: [
      "Volumetric flow rate",
      "Section 2 internal diameter",
      "Linked pressure measurement point and visual representation"
    ],
    learningOutcomes: bernoulliFlowLesson.learningOutcomes,
    definition: bernoulliFlowSimulationDefinition
  }
];

export type SimulationCollectionItem = {
  simulationId: string;
  slug?: string | undefined;
  title: string;
  availability: "available" | "coming-later";
};

export type SimulationCollection = {
  id: string;
  title: string;
  description: string;
  items: SimulationCollectionItem[];
};

const collectionDefinitions = [
  {
    id: "fluid-power-basics",
    title: "Fluid Power Basics",
    description: "Pressure, force and system behaviour for introductory fluid power.",
    simulationIds: ["SIM-HYD-CYL-FORCE-001", "sim-core-pump-flow-001"]
  },
  {
    id: "fluid-mechanics-fundamentals",
    title: "Fluid Mechanics Fundamentals",
    description: "Area, flow, velocity and pressure relationships in ideal flow models.",
    simulationIds: ["SIM-FLUID-BERNOULLI-FLOW-001"]
  },
  {
    id: "thermodynamics-fundamentals",
    title: "Thermodynamics Fundamentals",
    description: "System boundaries and energy concepts from the Core curriculum.",
    simulationIds: ["sim-core-thermal-system-001"]
  },
  {
    id: "electrical-fundamentals",
    title: "Electrical Fundamentals",
    description: "Circuit behaviour from the Core electrical foundations curriculum.",
    simulationIds: ["sim-core-dc-circuit-001"]
  }
] as const;

const parentLessonBySlug = new Map<string, StaticGovernedContent>([
  [hydraulicCylinderLesson.slug, hydraulicCylinderLesson],
  [thermodynamicBoundaryLesson.slug, thermodynamicBoundaryLesson],
  [bernoulliFlowLesson.slug, bernoulliFlowLesson]
]);

export type SimulationPublicationAuthorities = {
  simulation?: StaticPublicationAuthority;
  parentLesson?: StaticPublicationAuthority;
};

export function evaluateSimulationCatalogVisibility(
  entry: SimulationCatalogEntry,
  authorities: SimulationPublicationAuthorities = {}
): PublicationVisibilityDecision {
  const parentLesson = parentLessonBySlug.get(entry.lessonSlug);
  if (!parentLesson) {
    return {
      visible: false,
      scope: "none",
      reason: "missing-publication-status"
    };
  }

  return evaluateSimulationPublicationRecords({ entry, parentLesson, authorities });
}

export function evaluateSimulationPublicationRecords(input: {
  entry: SimulationCatalogEntry;
  parentLesson: StaticGovernedContent;
  authorities?: SimulationPublicationAuthorities;
  audience?: ContentAudience;
  access?: PublicationAccessContext;
}): PublicationVisibilityDecision {
  const authorities = input.authorities ?? {};
  const audience = input.audience ?? "student";

  const parentDecision = evaluateStaticPublicationVisibility({
    audience,
    record: input.parentLesson,
    sourceRecords: getStaticSourceRecordsById(input.parentLesson.sourceIds ?? []),
    ...(authorities.parentLesson ? { authority: authorities.parentLesson } : {}),
    ...(input.access ? { access: input.access } : {})
  });
  if (!parentDecision.visible) {
    return parentDecision;
  }

  return evaluateStaticPublicationVisibility({
    audience,
    record: {
      id: input.entry.definition.simulationId,
      publicationStatus: input.entry.publicationStatus,
      reviewStatus: input.entry.reviewStatus,
      version: input.entry.version,
      sourceIds: input.entry.definition.sourceIds
    },
    sourceRecords: getStaticSourceRecordsById(input.entry.definition.sourceIds),
    ...(authorities.simulation ? { authority: authorities.simulation } : {}),
    ...(input.access ? { access: input.access } : {})
  });
}

export function getPublicSimulationCatalog() {
  return simulationRegistry.filter(
    (entry) =>
      entry.intendedAvailability === "available" &&
      evaluateSimulationCatalogVisibility(entry).visible
  );
}

export function getPublicSimulationCollections(
  publicEntries: SimulationCatalogEntry[] = getPublicSimulationCatalog()
): SimulationCollection[] {
  const byId = new Map(
    publicEntries.map((entry) => [entry.definition.simulationId, entry] as const)
  );

  return collectionDefinitions
    .map((collection) => ({
      id: collection.id,
      title: collection.title,
      description: collection.description,
      items: collection.simulationIds.flatMap((simulationId) => {
        const entry = byId.get(simulationId);
        return entry
          ? [
              {
                simulationId,
                slug: entry.slug,
                title: entry.definition.title,
                availability: "available" as const
              }
            ]
          : [];
      })
    }))
    .filter((collection) => collection.items.length > 0);
}

export function getPublicSimulationCatalogBySlug(slug: string) {
  return getPublicSimulationCatalog().find((simulation) => simulation.slug === slug);
}

export function getPublicSimulationCatalogById(simulationId: string) {
  return getPublicSimulationCatalog().find(
    (simulation) => simulation.definition.simulationId === simulationId
  );
}

export function getSimulationCatalogBySlugForInternalUse(slug: string) {
  return simulationRegistry.find((simulation) => simulation.slug === slug);
}

export function getSimulationCatalogByIdForInternalUse(simulationId: string) {
  return simulationRegistry.find(
    (simulation) => simulation.definition.simulationId === simulationId
  );
}

function pathwaysForModule(moduleId: string) {
  return getCurriculum()
    .pathways.filter(
      (pathway) =>
        pathway.coreModuleIds.includes(moduleId) ||
        pathway.futureModuleIds.includes(moduleId)
    )
    .map((pathway) => pathway.slug);
}
