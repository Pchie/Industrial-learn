import type {
  AssessmentAttemptRecord,
  DashboardEnrolment,
  SavedLessonRecord,
  SimulationAttemptRecord,
  StudentDashboardData
} from "./data";
import type { AuthProfile } from "../auth/session-core";

const dismissedRecommendations = new Map<string, Set<string>>();
const completedAssessmentAttempts = new Map<string, AssessmentAttemptRecord[]>();
const completedSimulationAttempts = new Map<string, SimulationAttemptRecord[]>();

const baseDate = "2026-07-22T10:00:00.000Z";

export function resetLocalDashboardStoreForTests() {
  dismissedRecommendations.clear();
  completedAssessmentAttempts.clear();
  completedSimulationAttempts.clear();
}

export function dismissLocalDashboardRecommendation(
  studentProfileId: string,
  recommendationId: string
) {
  const current = dismissedRecommendations.get(studentProfileId) ?? new Set<string>();
  current.add(recommendationId);
  dismissedRecommendations.set(studentProfileId, current);
}

export function loadLocalStudentDashboardData(
  profile: AuthProfile
): StudentDashboardData {
  const seed = localDashboardSeeds[profile.email] ?? emptyStudentSeed(profile);
  const dynamicAssessmentAttempts = completedAssessmentAttempts.get(profile.id) ?? [];
  const dynamicSimulationAttempts = completedSimulationAttempts.get(profile.id) ?? [];

  return {
    ...seed,
    assessmentAttempts: [...dynamicAssessmentAttempts, ...seed.assessmentAttempts],
    simulationAttempts: [...dynamicSimulationAttempts, ...seed.simulationAttempts],
    profile: {
      id: profile.id,
      displayName: profile.displayName,
      email: profile.email
    },
    dismissedRecommendationIds: Array.from(dismissedRecommendations.get(profile.id) ?? [])
  };
}

export function recordLocalAssessmentDashboardAttempt(
  studentProfileId: string,
  attempt: AssessmentAttemptRecord
) {
  const current = completedAssessmentAttempts.get(studentProfileId) ?? [];
  const next = [attempt, ...current.filter((item) => item.id !== attempt.id)];
  completedAssessmentAttempts.set(studentProfileId, next);
}

export function recordLocalSimulationDashboardAttempt(
  studentProfileId: string,
  attempt: SimulationAttemptRecord
) {
  const current = completedSimulationAttempts.get(studentProfileId) ?? [];
  const next = [attempt, ...current.filter((item) => item.id !== attempt.id)];
  completedSimulationAttempts.set(studentProfileId, next);
}

function emptyStudentSeed(profile: AuthProfile): StudentDashboardData {
  return {
    profile: {
      id: profile.id,
      displayName: profile.displayName,
      email: profile.email
    },
    enrolments: [],
    lessonProgress: [],
    assessmentAttempts: [],
    simulationAttempts: [],
    projectSubmissions: [],
    savedLessons: [],
    dismissedRecommendationIds: [],
    loadedAt: baseDate,
    partialDataWarnings: []
  };
}

const mechanicalEnrolment: DashboardEnrolment = {
  id: "local-enrolment-mechanical",
  programmeSlug: "mechanical-foundations",
  cohortTitle: "Mechanical Foundations 2026",
  enrolledAt: "2026-02-01T08:00:00.000Z",
  currentYear: 1,
  currentSemester: 1,
  moduleSlugs: ["fluid-mechanics-foundations"]
};

const localDashboardSeeds: Record<string, StudentDashboardData> = {
  "student@example.test": {
    profile: {
      id: "profile-local-student-example-test",
      displayName: "Industrial Student",
      email: "student@example.test"
    },
    enrolments: [],
    lessonProgress: [],
    assessmentAttempts: [],
    simulationAttempts: [],
    projectSubmissions: [],
    savedLessons: [],
    dismissedRecommendationIds: [],
    loadedAt: baseDate,
    partialDataWarnings: []
  },
  "active.student@example.test": {
    profile: {
      id: "profile-local-active-student-example-test",
      displayName: "Active Industrial Student",
      email: "active.student@example.test"
    },
    enrolments: [mechanicalEnrolment],
    lessonProgress: [
      {
        id: "local-progress-fluid-pressure",
        lessonSlug: "basic-fluid-pressure",
        moduleSlug: "fluid-mechanics-foundations",
        status: "graded",
        percentComplete: 100,
        startedAt: "2026-07-14T09:00:00.000Z",
        completedAt: "2026-07-14T10:00:00.000Z",
        lastActivityAt: "2026-07-14T10:00:00.000Z"
      }
    ],
    assessmentAttempts: [
      {
        id: "local-assessment-fluid-pressure",
        assessmentSlug: "fluid-pressure-basic-check",
        title: "Fluid pressure knowledge check",
        moduleSlug: "fluid-mechanics-foundations",
        status: "graded",
        score: 6,
        maxScore: 10,
        submittedAt: "2026-07-15T11:00:00.000Z",
        competencyLevel: "Calculated",
        incorrectTopics: ["Pressure from force and area"],
        unitErrors: 1
      }
    ],
    simulationAttempts: [
      {
        id: "local-simulation-hydraulic-cylinder",
        simulationSlug: "hydraulic-cylinder-force",
        title: "Hydraulic cylinder force simulation",
        moduleSlug: "fluid-mechanics-foundations",
        mode: "Fault diagnosis",
        status: "submitted",
        scenarioState: "fault-state",
        faultDiagnosisErrors: 1,
        completedAt: "2026-07-16T13:30:00.000Z"
      }
    ],
    projectSubmissions: [
      {
        id: "local-project-fluid-pressure",
        projectSlug: "fluid-pressure-observation",
        title: "Fluid pressure observation project",
        moduleSlug: "fluid-mechanics-foundations",
        status: "in_progress",
        portfolioEvidenceCount: 1,
        requiredEvidenceCount: 3,
        submittedAt: "2026-07-17T15:00:00.000Z"
      }
    ],
    savedLessons: [
      {
        id: "local-saved-fluid-pressure",
        lessonSlug: "basic-fluid-pressure",
        savedAt: "2026-07-18T08:00:00.000Z"
      }
    ],
    dismissedRecommendationIds: [],
    loadedAt: baseDate,
    partialDataWarnings: []
  },
  "recommendation.student@example.test": {
    profile: {
      id: "profile-local-recommendation-student-example-test",
      displayName: "Recommendation Student",
      email: "recommendation.student@example.test"
    },
    enrolments: [mechanicalEnrolment],
    lessonProgress: [],
    assessmentAttempts: [
      {
        id: "local-assessment-recommendation",
        assessmentSlug: "fluid-pressure-basic-check",
        title: "Fluid pressure knowledge check",
        moduleSlug: "fluid-mechanics-foundations",
        status: "graded",
        score: 4,
        maxScore: 10,
        submittedAt: "2026-07-15T11:00:00.000Z"
      }
    ],
    simulationAttempts: [],
    projectSubmissions: [],
    savedLessons: [],
    dismissedRecommendationIds: [],
    loadedAt: baseDate,
    partialDataWarnings: []
  },
  "quiet.student@example.test": {
    profile: {
      id: "profile-local-quiet-student-example-test",
      displayName: "Quiet Industrial Student",
      email: "quiet.student@example.test"
    },
    enrolments: [mechanicalEnrolment],
    lessonProgress: [],
    assessmentAttempts: [],
    simulationAttempts: [],
    projectSubmissions: [],
    savedLessons: [] satisfies SavedLessonRecord[],
    dismissedRecommendationIds: [],
    loadedAt: baseDate,
    partialDataWarnings: []
  },
  "database.failure@example.test": {
    profile: {
      id: "profile-local-database-failure-example-test",
      displayName: "Database Failure Student",
      email: "database.failure@example.test"
    },
    enrolments: [],
    lessonProgress: [],
    assessmentAttempts: [],
    simulationAttempts: [],
    projectSubmissions: [],
    savedLessons: [],
    dismissedRecommendationIds: [],
    loadedAt: baseDate,
    partialDataWarnings: ["Local data source was configured to simulate failure."]
  }
};
