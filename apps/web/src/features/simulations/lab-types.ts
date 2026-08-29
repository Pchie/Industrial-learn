import type { CompetencyLevel } from "@industrial-learn/assessment-core";
import type { SimulationMode } from "@industrial-learn/simulation-engine";

import type {
  SimulationAvailability,
  SimulationCollection,
  SimulationDifficulty,
  SimulationDiscipline,
  SimulationPreviewMetadata,
  SimulationType
} from "./catalog";

export type SimulationLabCard = {
  slug: string;
  simulationId: string;
  title: string;
  description: string;
  mainConcept: string;
  topic: string;
  components: string[];
  systems: string[];
  abbreviations: string[];
  discipline: SimulationDiscipline;
  difficulty: SimulationDifficulty;
  types: SimulationType[];
  modes: SimulationMode[];
  estimatedMinutes: number;
  moduleSlug: string;
  moduleTitle: string;
  lessonSlug: string;
  lessonTitle: string;
  prerequisitePolicy: "required" | "recommended";
  prerequisiteLessonIds: string[];
  prerequisiteLessonSlugs: string[];
  careerPathwaySlugs: string[];
  reviewStatus: string;
  publicationStatus: string;
  availability: SimulationAvailability;
  availableChallenge?: string | undefined;
  faultModeStatus: "available" | "evidence-required" | "not-available";
  preview: SimulationPreviewMetadata;
  recommendedMode: SimulationMode;
  whatStudentsOperate: string[];
  learningOutcomes: string[];
  latestAttempt?: SimulationLabAttemptSummary | undefined;
  verifiedCompetencies: CompetencyLevel[];
};

export type SimulationLabAttemptSummary = {
  id: string;
  simulationSlug: string;
  title: string;
  mode: string;
  status: "not_started" | "in_progress" | "submitted" | "graded" | "abandoned";
  completedAt?: string | undefined;
};

export type SimulationRecommendation = {
  simulationSlug: string;
  reason: string;
};

export type SimulationLabModel = {
  simulations: SimulationLabCard[];
  collections: SimulationCollection[];
  authenticated: boolean;
  recentAttempts: SimulationLabAttemptSummary[];
  recommendations: SimulationRecommendation[];
  historyAvailable: boolean;
};

export type SimulationDiscoveryFilters = {
  query: string;
  discipline: "all" | SimulationDiscipline;
  difficulty: "all" | SimulationDifficulty;
  type: "all" | SimulationType;
  mode: "all" | SimulationMode;
  pathway: string;
};
