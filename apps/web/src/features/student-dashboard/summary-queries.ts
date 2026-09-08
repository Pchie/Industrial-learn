import type { DashboardDataSection } from "./data";

export const dashboardQueries = [
  {
    key: "enrolments",
    table: "enrolments",
    limit: 5,
    order: "enrolled_at.desc",
    select: "id,enrolled_at,cohorts(title,programmes(slug),cohort_modules(modules(slug)))"
  },
  {
    key: "lessons",
    table: "lesson_progress",
    limit: 25,
    order: "last_activity_at.desc.nullslast",
    select:
      "id,lesson_slug,module_slug,status,percent_complete,started_at,completed_at,last_activity_at"
  },
  {
    key: "assessments",
    table: "assessment_attempts",
    limit: 10,
    order: "submitted_at.desc.nullslast",
    select:
      "id,assessment_id,content_version,status,score,max_score,submitted_at,competency_awards,assessments(slug,title,module_slug,content_id,version,published_version,artifact_sha256,lesson_content_id,lesson_slug,lesson_content_version,technical_review_status,publication_status,governance_item_id,review_record_id,publication_authorization_id,answer_protection_status,unresolved_review_blockers,published_at,source_ids,equation_ids,learning_outcome_ids)"
  },
  {
    key: "simulations",
    table: "simulation_attempts",
    limit: 10,
    order: "completed_at.desc.nullslast",
    select:
      "id,status,mode,scenario_state,started_at,completed_at,competency_awards,simulations(slug,title)"
  },
  {
    key: "projects",
    table: "project_submissions",
    limit: 10,
    order: "submitted_at.desc.nullslast",
    select: "id,project_id,status,submitted_at,reviewed_at"
  },
  {
    key: "saved",
    table: "saved_lessons",
    limit: 10,
    order: "saved_at.desc",
    select: "id,saved_at,lessons(slug)"
  },
  {
    key: "dismissals",
    table: "dashboard_recommendation_dismissals",
    limit: 100,
    order: "dismissed_at.desc",
    select: "recommendation_id"
  }
] as const satisfies readonly {
  key: DashboardDataSection;
  table: string;
  limit: number;
  order: string;
  select: string;
}[];

export class DashboardSessionError extends Error {}

export async function readDashboardSummaries(
  get: (
    table: string,
    params: Record<string, string>
  ) => Promise<Record<string, unknown>[]>,
  studentProfileId: string
) {
  const results = await Promise.allSettled(
    dashboardQueries.map((query) =>
      get(query.table, {
        select: query.select,
        student_profile_id: `eq.${studentProfileId}`,
        order: query.order,
        limit: String(query.limit),
        ...(query.key === "enrolments" ? { withdrawn_at: "is.null" } : {})
      })
    )
  );
  if (
    results.some(
      (result) =>
        result.status === "rejected" && result.reason instanceof DashboardSessionError
    )
  ) {
    throw new DashboardSessionError("Dashboard session could not be verified.");
  }
  if (results.every((result) => result.status === "rejected"))
    throw new Error("Dashboard services are unavailable.");
  const unavailableSections: DashboardDataSection[] = [];
  const limitedSections: DashboardDataSection[] = [];
  const rows = {} as Record<DashboardDataSection, Record<string, unknown>[]>;
  results.forEach((result, index) => {
    const query = dashboardQueries[index]!;
    if (result.status === "fulfilled") {
      rows[query.key] = result.value;
      if (result.value.length >= query.limit) limitedSections.push(query.key);
    } else {
      rows[query.key] = [];
      unavailableSections.push(query.key);
    }
  });
  return { rows, unavailableSections, limitedSections };
}
