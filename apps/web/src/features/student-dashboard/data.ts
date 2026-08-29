import {
  getCurriculum,
  getModule,
  getProgramme,
  type Module,
  type Programme
} from "../curriculum/data";
import { getPublicLessons } from "../lesson-engine/data";
import { getPublicSimulationCatalog } from "../simulations/catalog";

export type CompetencyLevel =
  "Introduced" | "Understood" | "Calculated" | "Operated" | "Diagnosed" | "Designed";

export type DashboardProfile = {
  id: string;
  displayName: string;
  email: string;
};

export type DashboardEnrolment = {
  id: string;
  programmeSlug: string;
  cohortTitle: string;
  enrolledAt: string;
  currentYear?: number | undefined;
  currentSemester?: number | undefined;
  moduleSlugs: string[];
};

export type LessonProgressRecord = {
  id: string;
  lessonSlug: string;
  moduleSlug: string;
  status: "not_started" | "in_progress" | "submitted" | "graded" | "abandoned";
  percentComplete?: number | undefined;
  startedAt?: string | undefined;
  completedAt?: string | undefined;
  lastActivityAt?: string | undefined;
};

export type AssessmentAttemptRecord = {
  id: string;
  assessmentSlug: string;
  title: string;
  moduleSlug: string;
  status: "not_started" | "in_progress" | "submitted" | "graded" | "abandoned";
  score?: number | undefined;
  maxScore?: number | undefined;
  submittedAt?: string | undefined;
  competencyLevel?: CompetencyLevel | undefined;
  incorrectTopics?: string[] | undefined;
  unitErrors?: number | undefined;
};

export type SimulationAttemptRecord = {
  id: string;
  simulationSlug: string;
  title: string;
  moduleSlug: string;
  mode: string;
  status: "not_started" | "in_progress" | "submitted" | "graded" | "abandoned";
  scenarioState: string;
  faultDiagnosisErrors?: number | undefined;
  completedAt?: string | undefined;
};

export type ProjectSubmissionRecord = {
  id: string;
  projectSlug: string;
  title: string;
  moduleSlug: string;
  status: "not_started" | "in_progress" | "submitted" | "graded" | "abandoned";
  portfolioEvidenceCount?: number | undefined;
  requiredEvidenceCount?: number | undefined;
  submittedAt?: string | undefined;
  reviewedAt?: string | undefined;
};

export type SavedLessonRecord = {
  id: string;
  lessonSlug: string;
  savedAt: string;
};

export type StudentDashboardData = {
  profile: DashboardProfile;
  enrolments: DashboardEnrolment[];
  lessonProgress: LessonProgressRecord[];
  assessmentAttempts: AssessmentAttemptRecord[];
  simulationAttempts: SimulationAttemptRecord[];
  projectSubmissions: ProjectSubmissionRecord[];
  savedLessons: SavedLessonRecord[];
  dismissedRecommendationIds: string[];
  loadedAt: string;
  partialDataWarnings: string[];
};

export type ProgressCalculation = {
  available: boolean;
  completedEvidence: number;
  requiredEvidence: number;
  percent?: number | undefined;
  explanation: string;
};

export type ModuleProgress = {
  moduleSlug: string;
  moduleTitle: string;
  completedLessons: number;
  totalLessons: number;
  completedAssessments: number;
  totalAssessments: number;
  completedSimulations: number;
  totalSimulations: number;
  completedProjects: number;
  totalProjects: number;
  progress: ProgressCalculation;
};

export type AssessmentResult = {
  assessmentId: string;
  title: string;
  submittedAt: string;
  earnedPoints?: number | undefined;
  maxPoints?: number | undefined;
  competencyLevel: CompetencyLevel;
};

export type SimulationActivity = {
  simulationId: string;
  title: string;
  mode: string;
  lastRunAt?: string | undefined;
  resultSummary: string;
};

export type WeakTopicRecommendation = {
  id: string;
  topic: string;
  reason: string;
  recommendedActivity: string;
  estimatedRevisionTime: string;
  href: string;
};

export type ActiveProject = {
  id: string;
  title: string;
  status: string;
  portfolioEvidenceCount?: number | undefined;
  requiredEvidenceCount?: number | undefined;
};

export type RecentActivity = {
  id: string;
  title: string;
  occurredAt?: string | undefined;
  summary: string;
};

export type StudentDashboardModel = {
  studentId: string;
  displayName: string;
  programmeTitle?: string | undefined;
  currentProgramme?: Programme | undefined;
  currentYear?: number | undefined;
  currentSemester?: number | undefined;
  currentModules: Module[];
  state:
    | "new_student"
    | "no_enrolment"
    | "active_student"
    | "partial_data"
    | "no_recent_activity";
  continueLessonSlug?: string | undefined;
  continueLearningTitle?: string | undefined;
  weeklyPlan: Array<{ id: string; title: string; estimate: string; href: string }>;
  moduleCards: ModuleProgress[];
  competencyProfile: Record<CompetencyLevel, number>;
  recentAssessmentResults: AssessmentResult[];
  simulationActivity: SimulationActivity[];
  weakTopicRecommendations: WeakTopicRecommendation[];
  savedLessons: Array<{ slug: string; title: string; savedAt: string }>;
  activeProjects: ActiveProject[];
  recentActivity: RecentActivity[];
  moduleProgress: ProgressCalculation;
  programmeProgress: ProgressCalculation;
  careerPathwayProgress: ProgressCalculation;
  portfolioProgress: ProgressCalculation;
  partialDataWarnings: string[];
};

export function buildStudentDashboardModel(
  data: StudentDashboardData
): StudentDashboardModel {
  const currentEnrolment = chooseCurrentEnrolment(data.enrolments);
  const programmeRecord = currentEnrolment
    ? getProgramme(currentEnrolment.programmeSlug)
    : undefined;
  const currentProgramme = programmeRecord?.programme;
  const currentYear = currentEnrolment?.currentYear ?? inferCurrentYear(currentProgramme);
  const currentSemester =
    currentEnrolment?.currentSemester ??
    inferCurrentSemester(currentProgramme, currentYear);
  const currentModules = currentEnrolment
    ? modulesForEnrolment(
        currentEnrolment,
        currentProgramme,
        currentYear,
        currentSemester
      )
    : [];
  const moduleCards = currentModules.map((module) =>
    calculateModuleProgress(module, data)
  );
  const competencyProfile = calculateCompetencyProfile(data);
  const visibleLessonSlugs = new Set([
    ...getPublicLessons().map((lesson) => lesson.slug),
    ...currentModules.flatMap((module) =>
      module.units.flatMap((unit) => unit.lessons.map((lesson) => lesson.slug))
    )
  ]);
  const visibleSimulationIds = new Set(
    getPublicSimulationCatalog().map((simulation) => simulation.slug)
  );
  const recommendations = buildWeakTopicRecommendations(data).filter(
    (recommendation) =>
      !data.dismissedRecommendationIds.includes(recommendation.id) &&
      recommendationTargetsPublicModule(recommendation)
  );
  const continueLessonSlug = findContinueLessonSlug(
    currentModules,
    data.lessonProgress,
    visibleLessonSlugs
  );
  const activeProjects = data.projectSubmissions
    .filter(
      (project) => project.status === "in_progress" || project.status === "submitted"
    )
    .slice(0, 5)
    .map((project) => ({
      id: project.id,
      title: project.title,
      status: project.status,
      portfolioEvidenceCount: project.portfolioEvidenceCount,
      requiredEvidenceCount: project.requiredEvidenceCount
    }));
  const recentActivity = buildRecentActivity(
    data,
    visibleLessonSlugs,
    visibleSimulationIds
  );
  const partialDataWarnings = [
    ...data.partialDataWarnings,
    ...(currentEnrolment && !programmeRecord
      ? ["The enrolled programme is not available in the curriculum catalogue."]
      : [])
  ];

  return {
    studentId: data.profile.id,
    displayName: data.profile.displayName,
    programmeTitle: currentProgramme?.title,
    currentProgramme,
    currentYear,
    currentSemester,
    currentModules,
    state: dashboardState(data, currentEnrolment, recentActivity, partialDataWarnings),
    continueLessonSlug,
    continueLearningTitle: continueLessonSlug
      ? lessonTitleBySlug(continueLessonSlug)
      : undefined,
    weeklyPlan: buildWeeklyPlan(currentModules, data.lessonProgress),
    moduleCards,
    competencyProfile,
    recentAssessmentResults: data.assessmentAttempts
      .filter((attempt) => attempt.status === "submitted" || attempt.status === "graded")
      .sort(descendingByDate((attempt) => attempt.submittedAt))
      .slice(0, 5)
      .map((attempt) => ({
        assessmentId: attempt.id,
        title: attempt.title,
        submittedAt: attempt.submittedAt ?? "Submission date unavailable",
        earnedPoints: attempt.score,
        maxPoints: attempt.maxScore,
        competencyLevel: attempt.competencyLevel ?? competencyFromAssessmentScore(attempt)
      })),
    simulationActivity: data.simulationAttempts
      .filter(
        (attempt) =>
          attempt.status !== "not_started" &&
          visibleSimulationIds.has(attempt.simulationSlug)
      )
      .sort(descendingByDate((attempt) => attempt.completedAt))
      .slice(0, 5)
      .map((attempt) => ({
        simulationId: attempt.id,
        title: attempt.title,
        mode: attempt.mode,
        lastRunAt: attempt.completedAt,
        resultSummary:
          attempt.status === "graded" || attempt.status === "submitted"
            ? `Completed ${attempt.scenarioState} scenario`
            : `Incomplete ${attempt.scenarioState} scenario`
      })),
    weakTopicRecommendations: recommendations,
    savedLessons: data.savedLessons
      .filter((lesson) => visibleLessonSlugs.has(lesson.lessonSlug))
      .slice(0, 6)
      .map((lesson) => ({
        slug: lesson.lessonSlug,
        title: lessonTitleBySlug(lesson.lessonSlug),
        savedAt: lesson.savedAt
      })),
    activeProjects,
    recentActivity,
    moduleProgress: combineProgress(moduleCards.map((module) => module.progress)),
    programmeProgress: calculateProgrammeProgress(currentModules, data),
    careerPathwayProgress: calculateCareerPathwayProgress(currentModules, data),
    portfolioProgress: calculatePortfolioProgress(data.projectSubmissions),
    partialDataWarnings
  };
}

export function calculateModuleProgress(
  module: Module,
  data: StudentDashboardData
): ModuleProgress {
  const lessonSlugs = module.units.flatMap((unit) =>
    unit.lessons.map((lesson) => lesson.slug)
  );
  const assessmentIds = module.assessmentIds;
  const simulationIds = module.units.flatMap((unit) =>
    unit.lessons.flatMap((lesson) => lesson.simulationIds)
  );
  const projectIds = module.projectIds;
  const completedLessons = data.lessonProgress.filter(
    (progress) =>
      lessonSlugs.includes(progress.lessonSlug) && lessonHasCompletionEvidence(progress)
  ).length;
  const completedAssessments = data.assessmentAttempts.filter(
    (attempt) =>
      assessmentIds.includes(attempt.assessmentSlug) &&
      assessmentHasCompletionEvidence(attempt)
  ).length;
  const completedSimulations = data.simulationAttempts.filter(
    (attempt) =>
      simulationIds.includes(attempt.simulationSlug) &&
      simulationHasCompletionEvidence(attempt)
  ).length;
  const completedProjects = data.projectSubmissions.filter(
    (project) =>
      projectIds.includes(project.projectSlug) && projectHasCompletionEvidence(project)
  ).length;
  const requiredEvidence =
    lessonSlugs.length + assessmentIds.length + simulationIds.length + projectIds.length;
  const completedEvidence =
    completedLessons + completedAssessments + completedSimulations + completedProjects;

  return {
    moduleSlug: module.slug,
    moduleTitle: module.title,
    completedLessons,
    totalLessons: lessonSlugs.length,
    completedAssessments,
    totalAssessments: assessmentIds.length,
    completedSimulations,
    totalSimulations: simulationIds.length,
    completedProjects,
    totalProjects: projectIds.length,
    progress: progressCalculation(completedEvidence, requiredEvidence)
  };
}

export function calculateCompetencyProfile(data: StudentDashboardData) {
  const profile: Record<CompetencyLevel, number> = {
    Introduced: 0,
    Understood: 0,
    Calculated: 0,
    Operated: 0,
    Diagnosed: 0,
    Designed: 0
  };

  for (const attempt of data.assessmentAttempts) {
    if (assessmentHasCompletionEvidence(attempt)) {
      profile[attempt.competencyLevel ?? competencyFromAssessmentScore(attempt)] += 1;
    }
  }

  for (const attempt of data.simulationAttempts) {
    if (simulationHasCompletionEvidence(attempt)) {
      profile[
        attempt.scenarioState.toLowerCase().includes("fault") ? "Diagnosed" : "Operated"
      ] += 1;
    }
  }

  for (const project of data.projectSubmissions) {
    if (projectHasCompletionEvidence(project)) {
      profile.Designed += 1;
    }
  }

  return profile;
}

export function buildWeakTopicRecommendations(
  data: StudentDashboardData
): WeakTopicRecommendation[] {
  const recommendations = new Map<string, WeakTopicRecommendation>();

  for (const attempt of data.assessmentAttempts) {
    const scoreRatio =
      attempt.score !== undefined && attempt.maxScore
        ? attempt.score / attempt.maxScore
        : undefined;

    if (scoreRatio !== undefined && scoreRatio < 0.7) {
      recommendations.set(`assessment-${attempt.assessmentSlug}`, {
        id: `assessment-${attempt.assessmentSlug}`,
        topic: attempt.title,
        reason: `Latest score was ${Math.round(scoreRatio * 100)}%, below the 70% review threshold.`,
        recommendedActivity: "Review the worked example and retry the knowledge check.",
        estimatedRevisionTime: "20 minutes",
        href: `/modules/${attempt.moduleSlug}`
      });
    }

    for (const topic of attempt.incorrectTopics ?? []) {
      recommendations.set(`topic-${slugify(topic)}`, {
        id: `topic-${slugify(topic)}`,
        topic,
        reason: "Repeated incorrect answers were recorded for this topic.",
        recommendedActivity:
          "Revisit the prerequisite lesson and complete one calculation practice.",
        estimatedRevisionTime: "15 minutes",
        href: `/modules/${attempt.moduleSlug}`
      });
    }

    if ((attempt.unitErrors ?? 0) > 0) {
      recommendations.set(`units-${attempt.assessmentSlug}`, {
        id: `units-${attempt.assessmentSlug}`,
        topic: "SI unit handling",
        reason: `${attempt.unitErrors} unit validation issue${attempt.unitErrors === 1 ? "" : "s"} were recorded.`,
        recommendedActivity:
          "Practice symbol definitions and unit conversions before the next calculation.",
        estimatedRevisionTime: "10 minutes",
        href: `/modules/${attempt.moduleSlug}`
      });
    }
  }

  for (const simulation of data.simulationAttempts) {
    if (
      simulation.status === "in_progress" ||
      (simulation.faultDiagnosisErrors ?? 0) > 0
    ) {
      recommendations.set(`simulation-${simulation.simulationSlug}`, {
        id: `simulation-${simulation.simulationSlug}`,
        topic: simulation.title,
        reason:
          simulation.status === "in_progress"
            ? "A simulation attempt is incomplete."
            : "Fault-diagnosis errors were recorded during simulation work.",
        recommendedActivity:
          "Run the guided simulation mode and compare normal and fault measurements.",
        estimatedRevisionTime: "25 minutes",
        href: `/modules/${simulation.moduleSlug}`
      });
    }
  }

  return Array.from(recommendations.values()).slice(0, 6);
}

function chooseCurrentEnrolment(enrolments: DashboardEnrolment[]) {
  return [...enrolments].sort((left, right) =>
    right.enrolledAt.localeCompare(left.enrolledAt)
  )[0];
}

function inferCurrentYear(programme: Programme | undefined) {
  return programme?.academicYears[0]?.yearNumber;
}

function inferCurrentSemester(programme: Programme | undefined, yearNumber?: number) {
  return programme?.academicYears
    .find((year) => year.yearNumber === yearNumber)
    ?.semesters.at(0)?.semesterNumber;
}

function modulesForEnrolment(
  enrolment: DashboardEnrolment,
  programme: Programme | undefined,
  yearNumber: number | undefined,
  semesterNumber: number | undefined
) {
  const curriculumModules = getCurriculum().modules;

  if (enrolment.moduleSlugs.length > 0) {
    return enrolment.moduleSlugs
      .map((slug) => getModule(slug)?.module)
      .filter((module): module is Module => Boolean(module));
  }

  return (
    programme?.academicYears
      .find((year) => year.yearNumber === yearNumber)
      ?.semesters.find((semester) => semester.semesterNumber === semesterNumber)
      ?.modules.filter((module) =>
        curriculumModules.some((knownModule) => knownModule.slug === module.slug)
      ) ?? []
  );
}

function dashboardState(
  data: StudentDashboardData,
  enrolment: DashboardEnrolment | undefined,
  recentActivity: RecentActivity[],
  warnings: string[]
): StudentDashboardModel["state"] {
  if (warnings.length > 0) {
    return "partial_data";
  }

  if (!enrolment) {
    const hasRecords =
      data.lessonProgress.length +
        data.assessmentAttempts.length +
        data.simulationAttempts.length +
        data.projectSubmissions.length ===
      0;
    return hasRecords ? "new_student" : "no_enrolment";
  }

  return recentActivity.length > 0 ? "active_student" : "no_recent_activity";
}

function buildWeeklyPlan(modules: Module[], lessonProgress: LessonProgressRecord[]) {
  const completed = new Set(
    lessonProgress
      .filter((progress) => lessonHasCompletionEvidence(progress))
      .map((progress) => progress.lessonSlug)
  );

  return modules
    .flatMap((module) => module.units.flatMap((unit) => unit.lessons))
    .filter((lesson) => !completed.has(lesson.slug))
    .slice(0, 3)
    .map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      estimate: lesson.estimatedDuration,
      href: `/lessons/${lesson.slug}`
    }));
}

function findContinueLessonSlug(
  modules: Module[],
  lessonProgress: LessonProgressRecord[],
  visibleLessonSlugs: ReadonlySet<string>
) {
  const inProgress = lessonProgress
    .filter(
      (progress) =>
        progress.status === "in_progress" && visibleLessonSlugs.has(progress.lessonSlug)
    )
    .sort(descendingByDate((progress) => progress.lastActivityAt))[0];

  if (inProgress) {
    return inProgress.lessonSlug;
  }

  const completed = new Set(
    lessonProgress
      .filter((progress) => lessonHasCompletionEvidence(progress))
      .map((progress) => progress.lessonSlug)
  );

  return modules
    .flatMap((module) => module.units.flatMap((unit) => unit.lessons))
    .find((lesson) => !completed.has(lesson.slug))?.slug;
}

function buildRecentActivity(
  data: StudentDashboardData,
  visibleLessonSlugs: ReadonlySet<string>,
  visibleSimulationIds: ReadonlySet<string>
): RecentActivity[] {
  return [
    ...data.lessonProgress
      .filter(
        (progress) =>
          visibleLessonSlugs.has(progress.lessonSlug) &&
          (progress.lastActivityAt || progress.completedAt)
      )
      .map((progress) => ({
        id: progress.id,
        title: lessonTitleBySlug(progress.lessonSlug),
        occurredAt: progress.lastActivityAt ?? progress.completedAt,
        summary: `Lesson ${progress.status.replaceAll("_", " ")}`
      })),
    ...data.assessmentAttempts
      .filter((attempt) => attempt.submittedAt)
      .map((attempt) => ({
        id: attempt.id,
        title: attempt.title,
        occurredAt: attempt.submittedAt,
        summary: `Assessment ${attempt.status.replaceAll("_", " ")}`
      })),
    ...data.simulationAttempts
      .filter(
        (attempt) =>
          visibleSimulationIds.has(attempt.simulationSlug) && attempt.completedAt
      )
      .map((attempt) => ({
        id: attempt.id,
        title: attempt.title,
        occurredAt: attempt.completedAt,
        summary: `Simulation ${attempt.status.replaceAll("_", " ")}`
      })),
    ...data.projectSubmissions
      .filter((project) => project.submittedAt)
      .map((project) => ({
        id: project.id,
        title: project.title,
        occurredAt: project.submittedAt,
        summary: `Project ${project.status.replaceAll("_", " ")}`
      }))
  ]
    .sort(descendingByDate((activity) => activity.occurredAt))
    .slice(0, 6);
}

function calculateProgrammeProgress(
  modules: Module[],
  data: StudentDashboardData
): ProgressCalculation {
  if (modules.length === 0) {
    return unavailableProgress(
      "Programme progress is unavailable until enrolment modules are known."
    );
  }

  return combineProgress(
    modules.map((module) => calculateModuleProgress(module, data).progress)
  );
}

function calculateCareerPathwayProgress(
  modules: Module[],
  data: StudentDashboardData
): ProgressCalculation {
  if (modules.length === 0) {
    return unavailableProgress(
      "Career-pathway progress is unavailable until a pathway or module sequence is assigned."
    );
  }

  return combineProgress(
    modules.map((module) => calculateModuleProgress(module, data).progress)
  );
}

function calculatePortfolioProgress(
  projects: ProjectSubmissionRecord[]
): ProgressCalculation {
  const requiredEvidence = projects.reduce(
    (total, project) => total + (project.requiredEvidenceCount ?? 0),
    0
  );
  const completedEvidence = projects.reduce(
    (total, project) => total + (project.portfolioEvidenceCount ?? 0),
    0
  );

  return progressCalculation(
    completedEvidence,
    requiredEvidence,
    "Portfolio progress counts submitted project evidence against required evidence items."
  );
}

export function combineProgress(progressItems: ProgressCalculation[]) {
  const available = progressItems.filter((item) => item.available);

  if (available.length === 0) {
    return unavailableProgress(
      "Progress is unavailable until required competency evidence is assigned."
    );
  }

  return progressCalculation(
    available.reduce((total, item) => total + item.completedEvidence, 0),
    available.reduce((total, item) => total + item.requiredEvidence, 0)
  );
}

function progressCalculation(
  completedEvidence: number,
  requiredEvidence: number,
  explanation = "Progress counts completed lessons, submitted assessments, completed simulations, and submitted project evidence. Opening a lesson does not award progress."
): ProgressCalculation {
  if (requiredEvidence <= 0) {
    return unavailableProgress(
      "Progress is unavailable until required evidence is assigned."
    );
  }

  return {
    available: true,
    completedEvidence,
    requiredEvidence,
    percent: Math.round((completedEvidence / requiredEvidence) * 100),
    explanation
  };
}

function unavailableProgress(explanation: string): ProgressCalculation {
  return {
    available: false,
    completedEvidence: 0,
    requiredEvidence: 0,
    explanation
  };
}

function lessonHasCompletionEvidence(progress: LessonProgressRecord) {
  return (
    Boolean(progress.completedAt) ||
    progress.status === "graded" ||
    progress.percentComplete === 100
  );
}

function assessmentHasCompletionEvidence(attempt: AssessmentAttemptRecord) {
  return attempt.status === "submitted" || attempt.status === "graded";
}

function simulationHasCompletionEvidence(attempt: SimulationAttemptRecord) {
  return attempt.status === "submitted" || attempt.status === "graded";
}

function projectHasCompletionEvidence(project: ProjectSubmissionRecord) {
  return project.status === "submitted" || project.status === "graded";
}

function competencyFromAssessmentScore(
  attempt: AssessmentAttemptRecord
): CompetencyLevel {
  if (attempt.score === undefined || !attempt.maxScore) {
    return "Introduced";
  }

  const ratio = attempt.score / attempt.maxScore;

  if (ratio >= 0.85) {
    return "Calculated";
  }

  if (ratio >= 0.7) {
    return "Understood";
  }

  return "Introduced";
}

function lessonTitleBySlug(slug: string) {
  for (const module of getCurriculum().modules) {
    for (const lesson of module.units.flatMap((unit) => unit.lessons)) {
      if (lesson.slug === slug) {
        return lesson.title;
      }
    }
  }

  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function recommendationTargetsPublicModule(recommendation: WeakTopicRecommendation) {
  const moduleSlug = recommendation.href.match(/^\/modules\/([^/?#]+)/)?.[1];
  return Boolean(moduleSlug && getModule(moduleSlug));
}

function descendingByDate<T>(date: (item: T) => string | undefined) {
  return (left: T, right: T) => {
    const leftDate = date(left) ?? "";
    const rightDate = date(right) ?? "";
    return rightDate.localeCompare(leftDate);
  };
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
