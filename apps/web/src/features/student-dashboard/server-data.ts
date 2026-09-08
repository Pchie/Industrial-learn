import "server-only";

import { getServerEnv } from "@industrial-learn/env";
import type { AuthenticatedSession } from "../auth/session-core";
import { readSessionTokens } from "../auth/server";
import { readCompetencyAwards } from "./data";
import { DashboardSessionError, readDashboardSummaries } from "./summary-queries";
import { canReviewDashboardAssessment } from "./summary-access";
import type {
  AssessmentAttemptRecord,
  DashboardEnrolment,
  LessonProgressRecord,
  ProjectSubmissionRecord,
  SavedLessonRecord,
  SimulationAttemptRecord,
  StudentDashboardData
} from "./data";

type SupabaseRow = Record<string, unknown>;

export async function loadStudentDashboardData(
  session: AuthenticatedSession
): Promise<StudentDashboardData> {
  if (isLocalDashboardMode()) {
    if (session.email === "database.failure@example.test") {
      throw new Error("Simulated dashboard database failure.");
    }

    const { loadLocalStudentDashboardData } = await import("./local-dashboard-store");
    return loadLocalStudentDashboardData(session.profile);
  }

  return loadSupabaseStudentDashboardData(session);
}

export async function dismissDashboardRecommendation(
  session: AuthenticatedSession,
  recommendationId: string
) {
  const safeRecommendationId = recommendationId.trim();

  if (!safeRecommendationId || safeRecommendationId.length > 160) {
    throw new Error("Invalid recommendation identifier.");
  }

  if (isLocalDashboardMode()) {
    const { dismissLocalDashboardRecommendation } =
      await import("./local-dashboard-store");
    dismissLocalDashboardRecommendation(session.profile.id, safeRecommendationId);
    return;
  }

  await insertSupabaseDashboardDismissal(session.profile.id, safeRecommendationId);
}

function isLocalDashboardMode() {
  return (
    process.env.INDUSTRIAL_LEARN_AUTH_MODE === "local" &&
    process.env.INDUSTRIAL_LEARN_E2E === "true"
  );
}

async function loadSupabaseStudentDashboardData(
  session: AuthenticatedSession
): Promise<StudentDashboardData> {
  const env = getServerEnv();
  const { accessToken } = await readSessionTokens();

  if (!env.supabase.url || !env.supabase.anonKey || !accessToken) {
    throw new Error("Dashboard data access is not configured.");
  }

  const client = createRestClient(env.supabase.url, env.supabase.anonKey, accessToken);
  const { rows, unavailableSections, limitedSections } = await readDashboardSummaries(
    (table, params) => client.get(table, params),
    session.profile.id
  );

  return {
    profile: {
      id: session.profile.id,
      displayName: session.profile.displayName,
      email: session.profile.email
    },
    enrolments: rows.enrolments.map(mapEnrolmentRow),
    lessonProgress: rows.lessons.map(mapLessonProgressRow),
    assessmentAttempts: rows.assessments.map(mapAssessmentAttemptRow),
    simulationAttempts: rows.simulations.map(mapSimulationAttemptRow),
    projectSubmissions: rows.projects.map(mapProjectSubmissionRow),
    savedLessons: rows.saved.map(mapSavedLessonRow),
    dismissedRecommendationIds: rows.dismissals
      .map((row) => stringValue(row.recommendation_id))
      .filter((value): value is string => Boolean(value)),
    loadedAt: new Date().toISOString(),
    partialDataWarnings: unavailableSections.map(
      (section) => `${section} data is temporarily unavailable.`
    ),
    unavailableSections,
    limitedSections
  };
}

async function insertSupabaseDashboardDismissal(
  studentProfileId: string,
  recommendationId: string
) {
  const env = getServerEnv();
  const { accessToken } = await readSessionTokens();

  if (!env.supabase.url || !env.supabase.anonKey || !accessToken) {
    throw new Error("Dashboard data access is not configured.");
  }

  const client = createRestClient(env.supabase.url, env.supabase.anonKey, accessToken);
  await client.post("dashboard_recommendation_dismissals", {
    student_profile_id: studentProfileId,
    recommendation_id: recommendationId
  });
}

function createRestClient(url: string, anonKey: string, accessToken: string) {
  const restBase = `${url}/rest/v1`;
  const headers = {
    apikey: anonKey,
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json"
  };

  return {
    async get(table: string, params: Record<string, string>) {
      const query = new URLSearchParams(params);
      const response = await fetch(`${restBase}/${table}?${query}`, {
        headers,
        cache: "no-store"
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 403)
          throw new DashboardSessionError("Dashboard access could not be verified.");
        throw new Error("Dashboard database query failed.");
      }

      return (await response.json()) as SupabaseRow[];
    },
    async post(table: string, body: SupabaseRow) {
      const response = await fetch(`${restBase}/${table}`, {
        method: "POST",
        headers: {
          ...headers,
          Prefer: "resolution=merge-duplicates"
        },
        body: JSON.stringify(body),
        cache: "no-store"
      });

      if (!response.ok) {
        throw new Error("Dashboard database write failed.");
      }
    }
  };
}

function mapEnrolmentRow(row: SupabaseRow): DashboardEnrolment {
  const cohort = nestedRow(row.cohorts);
  const programme = nestedRow(cohort?.programmes);
  const modules = Array.isArray(cohort?.cohort_modules) ? cohort.cohort_modules : [];
  return {
    id: stringValue(row.id) ?? "unknown-enrolment",
    programmeSlug: stringValue(programme?.slug) ?? "",
    cohortTitle: stringValue(cohort?.title) ?? "Current cohort",
    enrolledAt: stringValue(row.enrolled_at) ?? "",
    currentYear: numberValue(row.current_year),
    currentSemester: numberValue(row.current_semester),
    moduleSlugs: modules
      .map((item) => stringValue(nestedRow(nestedRow(item)?.modules)?.slug))
      .filter((slug): slug is string => Boolean(slug))
  };
}

function mapLessonProgressRow(row: SupabaseRow): LessonProgressRecord {
  return {
    id: stringValue(row.id) ?? "unknown-progress",
    lessonSlug: stringValue(row.lesson_slug) ?? stringValue(row.lesson_id) ?? "",
    moduleSlug: stringValue(row.module_slug) ?? "",
    status: attemptStatus(row.status),
    percentComplete: numberValue(row.percent_complete),
    startedAt: stringValue(row.started_at),
    completedAt: stringValue(row.completed_at),
    lastActivityAt: stringValue(row.last_activity_at)
  };
}

function mapAssessmentAttemptRow(row: SupabaseRow): AssessmentAttemptRecord {
  const assessment = nestedRow(row.assessments);
  const reviewAvailable = canReviewDashboardAssessment(assessment, {
    status: row.status,
    content_version: row.content_version
  });
  return {
    id: stringValue(row.id) ?? "unknown-assessment-attempt",
    contentVersion: numberValue(row.content_version),
    reviewAvailable,
    assessmentSlug:
      stringValue(assessment?.slug) ??
      stringValue(row.assessment_slug) ??
      stringValue(row.assessment_id) ??
      "",
    title:
      stringValue(assessment?.title) ??
      stringValue(row.assessment_title) ??
      "Assessment attempt",
    moduleSlug:
      stringValue(assessment?.module_slug) ?? stringValue(row.module_slug) ?? "",
    status: attemptStatus(row.status),
    score: numberValue(row.score),
    maxScore: numberValue(row.max_score),
    submittedAt: stringValue(row.submitted_at),
    competencyLevel: highestCompetency(row.competency_awards),
    competencyAwards: readCompetencyAwards(row.competency_awards),
    incorrectTopics: arrayValue(row.incorrect_topics),
    unitErrors: numberValue(row.unit_errors)
  };
}

function mapSimulationAttemptRow(row: SupabaseRow): SimulationAttemptRecord {
  const simulation = nestedRow(row.simulations);
  return {
    id: stringValue(row.id) ?? "unknown-simulation-attempt",
    simulationSlug: stringValue(simulation?.slug) ?? "",
    title: stringValue(simulation?.title) ?? "Simulation attempt",
    moduleSlug: stringValue(row.module_slug) ?? "",
    mode: stringValue(row.mode) ?? "Explore",
    status: attemptStatus(row.status),
    scenarioState: stringValue(row.scenario_state) ?? "normal-state",
    faultDiagnosisErrors: numberValue(row.fault_diagnosis_errors),
    completedAt: stringValue(row.completed_at),
    startedAt: stringValue(row.started_at),
    competencyAwards: readCompetencyAwards(row.competency_awards)
  };
}

function mapProjectSubmissionRow(row: SupabaseRow): ProjectSubmissionRecord {
  return {
    id: stringValue(row.id) ?? "unknown-project-submission",
    projectSlug: stringValue(row.project_slug) ?? stringValue(row.project_id) ?? "",
    title: stringValue(row.project_title) ?? "Project submission",
    moduleSlug: stringValue(row.module_slug) ?? "",
    status: attemptStatus(row.status),
    portfolioEvidenceCount: numberValue(row.portfolio_evidence_count),
    requiredEvidenceCount: numberValue(row.required_evidence_count),
    submittedAt: stringValue(row.submitted_at),
    reviewedAt: stringValue(row.reviewed_at)
  };
}

function mapSavedLessonRow(row: SupabaseRow): SavedLessonRecord {
  return {
    id: stringValue(row.id) ?? "unknown-saved-lesson",
    lessonSlug: stringValue(nestedRow(row.lessons)?.slug) ?? "",
    savedAt: stringValue(row.saved_at) ?? stringValue(row.created_at) ?? ""
  };
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function numberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function arrayValue(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function nestedRow(value: unknown): SupabaseRow | undefined {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as SupabaseRow;
  }
  return undefined;
}

function highestCompetency(value: unknown): AssessmentAttemptRecord["competencyLevel"] {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  const awards = value as Record<string, unknown>;
  const levels: NonNullable<AssessmentAttemptRecord["competencyLevel"]>[] = [
    "Introduced",
    "Understood",
    "Calculated",
    "Operated",
    "Diagnosed",
    "Designed"
  ];

  return [...levels]
    .reverse()
    .find((level) => typeof awards[level] === "number" && awards[level] > 0);
}

function attemptStatus(value: unknown) {
  return value === "not_started" ||
    value === "in_progress" ||
    value === "submitted" ||
    value === "graded" ||
    value === "abandoned"
    ? value
    : "not_started";
}
