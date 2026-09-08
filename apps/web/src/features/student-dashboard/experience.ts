import { getPublicLessons } from "../lesson-engine/data";
import { getPublicSimulationCatalog } from "../simulations/catalog";
import { deriveSimulationAvailability } from "../simulations/discovery";
import { getAssessmentCatalogBySlug } from "../assessments/catalog";
import {
  buildStudentDashboardModel,
  calculateCompetencyProfile,
  lessonHasCompletionEvidence,
  type StudentDashboardData
} from "./data";

// This projection selects trustworthy presentation evidence; it does not award progress.
export function buildDashboardExperience(data: StudentDashboardData) {
  const unavailable = new Set(data.unavailableSections ?? []);
  data = {
    ...data,
    enrolments: unavailable.has("enrolments") ? [] : data.enrolments,
    lessonProgress: unavailable.has("lessons") ? [] : data.lessonProgress,
    assessmentAttempts: unavailable.has("assessments") ? [] : data.assessmentAttempts,
    simulationAttempts: unavailable.has("simulations") ? [] : data.simulationAttempts,
    savedLessons: unavailable.has("saved") ? [] : data.savedLessons
  };
  const base = buildStudentDashboardModel(data);
  const limited = new Set(data.limitedSections ?? []);
  const lessons = getPublicLessons();
  const simulations = getPublicSimulationCatalog();
  const visibleSlugs = new Set(lessons.map((lesson) => lesson.slug));
  const records = unavailable.has("lessons") ? [] : data.lessonProgress;
  const completed = new Set(
    records.filter(lessonHasCompletionEvidence).map((r) => r.lessonSlug)
  );
  const latest = [...records]
    .filter((r) => r.lastActivityAt || r.completedAt)
    .sort((a, b) =>
      (b.lastActivityAt ?? b.completedAt ?? "").localeCompare(
        a.lastActivityAt ?? a.completedAt ?? ""
      )
    )[0];
  const inProgress = [...records]
    .filter((r) => r.status === "in_progress" && visibleSlugs.has(r.lessonSlug))
    .sort((a, b) => (b.lastActivityAt ?? "").localeCompare(a.lastActivityAt ?? ""))[0];
  const next =
    lessons.find((lesson) => lesson.slug === inProgress?.lessonSlug) ??
    lessons.find((lesson) => !completed.has(lesson.slug)) ??
    lessons[0];
  const nextRecord = records.find((r) => r.lessonSlug === next?.slug);
  const enrolment = [...data.enrolments].sort((a, b) =>
    b.enrolledAt.localeCompare(a.enrolledAt)
  )[0];
  const assignedModules =
    enrolment &&
    (enrolment.moduleSlugs.length > 0 ||
      (enrolment.currentYear && enrolment.currentSemester))
      ? base.currentModules
      : [];
  const completedSlugs = [...completed];
  const practice = simulations
    .filter(
      (simulation) =>
        assignedModules.some((module) => module.slug === simulation.moduleSlug) ||
        simulation.lessonSlug === next?.slug ||
        records.some((r) => r.lessonSlug === simulation.lessonSlug)
    )
    .map((simulation) => ({
      ...simulation,
      availability: deriveSimulationAvailability({
        catalogueAvailability: simulation.intendedAvailability,
        prerequisitePolicy: simulation.prerequisitePolicy,
        prerequisiteLessonSlugs: simulation.prerequisiteLessonSlugs,
        completedLessonSlugs: completedSlugs
      }),
      reason:
        simulation.lessonSlug === next?.slug
          ? "Connected to your next lesson."
          : "Connected to your recorded learning."
    }))
    .filter((simulation) => simulation.availability === "available")
    .slice(0, 3);
  const assessmentResults = unavailable.has("assessments")
    ? []
    : data.assessmentAttempts
        .filter((attempt) => {
          const entry = getAssessmentCatalogBySlug(attempt.assessmentSlug);
          return (
            attempt.status === "graded" &&
            attempt.reviewAvailable === true &&
            entry &&
            attempt.contentVersion === entry.contentVersion &&
            lessons.some(
              (lesson) =>
                lesson.slug === entry.lessonSlug && lesson.version === entry.lessonVersion
            )
          );
        })
        .sort((a, b) => (b.submittedAt ?? "").localeCompare(a.submittedAt ?? ""))
        .slice(0, 5);
  const awards = calculateCompetencyProfile({
    ...data,
    assessmentAttempts: assessmentResults.map((attempt) => ({
      ...attempt,
      competencyAwards: attempt.competencyAwards ?? {}
    })),
    simulationAttempts: [],
    projectSubmissions: []
  });
  // Simulation awards must be explicit server records, never inferred from mode or time.
  for (const attempt of unavailable.has("simulations") ? [] : data.simulationAttempts) {
    if (
      attempt.status !== "graded" ||
      !simulations.some((s) => s.slug === attempt.simulationSlug)
    )
      continue;
    for (const level of Object.keys(awards) as (keyof typeof awards)[]) {
      const value = attempt.competencyAwards?.[level];
      if (typeof value === "number" && Number.isFinite(value) && value > 0)
        awards[level] += value;
    }
  }
  const hasRecords =
    records.length + data.assessmentAttempts.length + data.simulationAttempts.length > 0;
  return {
    base,
    displayName: data.profile.displayName,
    programmeTitle: unavailable.has("enrolments") ? undefined : base.programmeTitle,
    currentYear: enrolment?.currentYear,
    currentSemester: enrolment?.currentSemester,
    hasEnrolment: Boolean(enrolment),
    hasRecords,
    next,
    nextAction: nextRecord ? "Return to lesson" : "Start lesson",
    lastActivityAt: nextRecord?.lastActivityAt,
    previousUnavailable: Boolean(latest && !visibleSlugs.has(latest.lessonSlug)),
    learning: lessons
      .filter(
        (lesson) =>
          lesson.slug === next?.slug ||
          records.some((r) => r.lessonSlug === lesson.slug) ||
          assignedModules.some((module) =>
            module.units.some((unit) => unit.lessons.some((l) => l.slug === lesson.slug))
          )
      )
      .slice(0, 6)
      .map((lesson) => ({
        ...lesson,
        state: unavailable.has("lessons")
          ? "Progress unavailable"
          : completed.has(lesson.slug)
            ? "Completed"
            : records.some(
                  (r) => r.lessonSlug === lesson.slug && r.status === "in_progress"
                )
              ? "In progress"
              : "Available"
      })),
    completedLessonCount: records.length
      ? lessons.filter((lesson) => completed.has(lesson.slug)).length
      : undefined,
    moduleCards: base.moduleCards
      .filter((card) => assignedModules.some((module) => module.slug === card.moduleSlug))
      .map((card) => ({
        ...card,
        displayProgress:
          card.progress.available &&
          !unavailable.size &&
          !limited.size &&
          card.totalAssessments === 0 &&
          card.totalSimulations === 0 &&
          card.totalProjects === 0 &&
          card.totalLessons > 0 &&
          card.completedLessons <= card.totalLessons
      })),
    practice,
    results: assessmentResults,
    unavailableResults: data.assessmentAttempts.some(
      (a) =>
        (a.status === "graded" || a.status === "submitted") &&
        !assessmentResults.some((result) => result.id === a.id)
    ),
    awards,
    simulationActivity: data.simulationAttempts
      .filter(
        (attempt) =>
          attempt.status !== "not_started" &&
          simulations.some((simulation) => simulation.slug === attempt.simulationSlug)
      )
      .sort((a, b) =>
        (b.completedAt ?? b.startedAt ?? "").localeCompare(
          a.completedAt ?? a.startedAt ?? ""
        )
      )
      .slice(0, 5)
      .map((attempt) => ({
        simulationId: attempt.id,
        title: attempt.title,
        mode: attempt.mode,
        lastRunAt: attempt.completedAt ?? attempt.startedAt,
        resultSummary:
          attempt.status === "graded"
            ? "Graded result"
            : attempt.mode.toLowerCase() === "assessment"
              ? `Assessment ${attempt.status.replaceAll("_", " ")}`
              : `Practice ${attempt.status.replaceAll("_", " ")}`
      })),
    lessonActivity: base.recentActivity.filter((item) =>
      records.some(
        (record) => record.id === item.id && visibleSlugs.has(record.lessonSlug)
      )
    ),
    recommendations:
      unavailable.has("assessments") ||
      unavailable.has("simulations") ||
      unavailable.has("dismissals")
        ? []
        : base.weakTopicRecommendations,
    savedLessons: base.savedLessons.filter((lesson) => visibleSlugs.has(lesson.slug)),
    warnings: [...base.partialDataWarnings],
    unavailable: [...unavailable],
    limited: [...limited]
  };
}

export type DashboardExperience = ReturnType<typeof buildDashboardExperience>;

export function dashboardDate(value: string | undefined) {
  if (!value || !Number.isFinite(Date.parse(value))) return "Date unavailable";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC"
  }).format(new Date(value));
}
