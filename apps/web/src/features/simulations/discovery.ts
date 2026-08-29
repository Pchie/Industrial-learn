import type { CompetencyLevel } from "@industrial-learn/assessment-core";
import type { PersistedSimulationAttempt } from "@industrial-learn/database";

import type { SimulationCatalogEntry } from "./catalog";
import type {
  SimulationDiscoveryFilters,
  SimulationLabAttemptSummary,
  SimulationLabCard,
  SimulationRecommendation
} from "./lab-types";

export const emptySimulationFilters: SimulationDiscoveryFilters = {
  query: "",
  discipline: "all",
  difficulty: "all",
  type: "all",
  mode: "all",
  pathway: "all"
};

export function filterSimulationCatalogue(
  simulations: SimulationLabCard[],
  filters: SimulationDiscoveryFilters
) {
  const query = normalize(filters.query);

  return simulations.filter((simulation) => {
    if (filters.discipline !== "all" && simulation.discipline !== filters.discipline) {
      return false;
    }
    if (filters.difficulty !== "all" && simulation.difficulty !== filters.difficulty) {
      return false;
    }
    if (filters.type !== "all" && !simulation.types.includes(filters.type)) {
      return false;
    }
    if (filters.mode !== "all" && !simulation.modes.includes(filters.mode)) {
      return false;
    }
    if (
      filters.pathway !== "all" &&
      !simulation.careerPathwaySlugs.includes(filters.pathway)
    ) {
      return false;
    }
    if (!query) {
      return true;
    }

    return searchText(simulation).includes(query);
  });
}

export function deriveSimulationAvailability(input: {
  catalogueAvailability: SimulationLabCard["availability"];
  prerequisitePolicy: "required" | "recommended";
  prerequisiteLessonSlugs: string[];
  completedLessonSlugs: string[];
}) {
  if (input.catalogueAvailability !== "available") {
    return input.catalogueAvailability;
  }
  if (input.prerequisitePolicy === "recommended") {
    return "available" as const;
  }
  return input.prerequisiteLessonSlugs.every((slug) =>
    input.completedLessonSlugs.includes(slug)
  )
    ? ("available" as const)
    : ("locked-by-prerequisite" as const);
}

export function buildSimulationRecommendations(input: {
  simulations: SimulationLabCard[];
  currentModuleSlugs: string[];
  completedLessonSlugs: string[];
  recentAttempts: SimulationLabAttemptSummary[];
}) {
  const recommendations: SimulationRecommendation[] = [];

  for (const simulation of input.simulations) {
    if (simulation.availability !== "available") {
      continue;
    }

    const inProgress = input.recentAttempts.find(
      (attempt) =>
        attempt.simulationSlug === simulation.slug && attempt.status === "in_progress"
    );
    if (inProgress) {
      recommendations.push({
        simulationSlug: simulation.slug,
        reason: "Continue your in-progress simulation attempt."
      });
      continue;
    }

    const currentModule = input.currentModuleSlugs.includes(simulation.moduleSlug);
    const prerequisitesComplete = simulation.prerequisiteLessonSlugs.every((slug) =>
      input.completedLessonSlugs.includes(slug)
    );
    if (currentModule && prerequisitesComplete) {
      recommendations.push({
        simulationSlug: simulation.slug,
        reason: `Your current ${simulation.moduleTitle} work includes the required prerequisite evidence.`
      });
    }
  }

  return recommendations;
}

export function verifiedCompetenciesForAttempt(
  attempt?: PersistedSimulationAttempt
): CompetencyLevel[] {
  if (!attempt || (attempt.status !== "submitted" && attempt.status !== "graded")) {
    return [];
  }

  return (Object.entries(attempt.competencyAwards) as Array<[CompetencyLevel, number]>)
    .filter(([, value]) => value > 0)
    .map(([competency]) => competency);
}

export function catalogueEntryToLabCard(
  entry: SimulationCatalogEntry,
  latestAttempt?: PersistedSimulationAttempt,
  completedLessonSlugs: string[] = []
): SimulationLabCard {
  return {
    slug: entry.slug,
    simulationId: entry.definition.simulationId,
    title: entry.definition.title,
    description: entry.definition.visualRepresentation.description,
    mainConcept: entry.mainConcept,
    topic: entry.topic,
    components: entry.components,
    systems: entry.systems,
    abbreviations: entry.abbreviations,
    discipline: entry.discipline,
    difficulty: entry.difficulty,
    types: entry.types,
    modes: entry.definition.modes,
    estimatedMinutes: entry.estimatedMinutes,
    moduleSlug: entry.moduleSlug,
    moduleTitle: entry.moduleTitle,
    lessonSlug: entry.lessonSlug,
    lessonTitle: entry.lessonTitle,
    prerequisitePolicy: entry.prerequisitePolicy,
    prerequisiteLessonIds: entry.prerequisiteLessonIds,
    prerequisiteLessonSlugs: entry.prerequisiteLessonSlugs,
    careerPathwaySlugs: entry.careerPathwaySlugs,
    reviewStatus: entry.reviewStatus,
    publicationStatus: entry.publicationStatus,
    availability: deriveSimulationAvailability({
      catalogueAvailability: entry.intendedAvailability,
      prerequisitePolicy: entry.prerequisitePolicy,
      prerequisiteLessonSlugs: entry.prerequisiteLessonSlugs,
      completedLessonSlugs
    }),
    availableChallenge: entry.availableChallenge,
    faultModeStatus: entry.faultModeStatus,
    preview: entry.preview,
    recommendedMode: entry.recommendedMode,
    whatStudentsOperate: entry.whatStudentsOperate,
    learningOutcomes: entry.learningOutcomes,
    latestAttempt: latestAttempt
      ? {
          id: latestAttempt.id,
          simulationSlug: entry.slug,
          title: entry.definition.title,
          mode: latestAttempt.mode,
          status: latestAttempt.status,
          completedAt: latestAttempt.completedAt
        }
      : undefined,
    verifiedCompetencies: verifiedCompetenciesForAttempt(latestAttempt)
  };
}

function searchText(simulation: SimulationLabCard) {
  return normalize(
    [
      simulation.title,
      simulation.mainConcept,
      simulation.topic,
      simulation.moduleTitle,
      simulation.discipline,
      ...simulation.components,
      ...simulation.systems,
      ...simulation.abbreviations
    ].join(" ")
  );
}

function normalize(value: string) {
  return value.trim().toLocaleLowerCase("en");
}
