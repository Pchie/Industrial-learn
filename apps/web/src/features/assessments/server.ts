import "server-only";

import { unstable_noStore as noStore } from "next/cache";
import { getServerEnv, type IndustrialLearnEnv } from "@industrial-learn/env";
import {
  createAttemptPersistenceServices,
  type AssessmentAttemptRepository,
  type AttemptAuditRepository,
  type AttemptContext,
  type AttemptPersistenceRepositories,
  type AttemptTransactionRunner,
  type Caller,
  type PersistedAssessmentAttempt,
  type PersistenceAttemptStatus,
  type SimulationAttemptRepository
} from "@industrial-learn/database";
import type {
  Assessment,
  AssessmentAttempt,
  CompetencyLevel,
  DeliveredAssessment,
  QuestionResult,
  StudentAnswer
} from "@industrial-learn/assessment-core";
import { STUDENT_PUBLICATION_REQUIREMENTS } from "@industrial-learn/content-review-workflow/publication-visibility";

import type { AuthenticatedSession } from "../auth/session-core";
import { createAssessmentFromCatalog, getAssessmentCatalogBySlug } from "./catalog";
import {
  createLocalAssessmentPersistence,
  listLocalAssessmentAttempts
} from "./local-store";

export type AssessmentSummary = {
  slug: string;
  title: string;
  description: string;
  lessonTitle: string;
  moduleTitle: string;
  estimatedMinutes: number;
  sourceIds: string[];
  reviewStatus: string;
  publicationStatus: string;
  contentVersion: number;
  latestAttempt?: PersistedAssessmentAttempt | undefined;
};

export type AssessmentOverview = AssessmentSummary & {
  assessment: Assessment;
  attempts: PersistedAssessmentAttempt[];
};

export type AttemptPageModel = {
  summary: AssessmentSummary;
  deliveredAssessment: DeliveredAssessment;
  attempt: PersistedAssessmentAttempt;
};

export type ReviewPageModel = {
  summary: AssessmentSummary;
  assessment: Assessment;
  attempt: PersistedAssessmentAttempt & { scoringSummary: AssessmentAttempt };
};

type AssessmentRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  lesson_id: string | null;
  version: number;
  technical_review_status: string;
  publication_status: string;
};

type AssessmentAttemptRow = {
  id: string;
  assessment_id: string;
  student_profile_id: string;
  content_version?: number | null;
  attempt_number?: number | null;
  status: PersistenceAttemptStatus;
  submitted_answers?: unknown;
  scoring_summary?: unknown;
  competency_awards?: unknown;
  idempotency_key?: string | null;
  started_at: string;
  submitted_at?: string | null;
  graded_at?: string | null;
  score?: number | null;
  max_score?: number | null;
};

export async function listAssessmentsForStudent(
  session: AuthenticatedSession
): Promise<AssessmentSummary[]> {
  noStore();
  const records = await Promise.all(
    ["staging-pressure-check"].map((slug) => loadAssessmentOverview(session, slug))
  );

  return records.filter((record): record is AssessmentOverview => Boolean(record));
}

export async function loadAssessmentOverview(
  session: AuthenticatedSession,
  slug: string
): Promise<AssessmentOverview | null> {
  noStore();
  const entry = getAssessmentCatalogBySlug(slug);
  if (!entry) {
    return null;
  }

  if (isLocalAssessmentMode()) {
    const assessment = createAssessmentFromCatalog(entry);
    const attempts = listLocalAssessmentAttempts({
      studentProfileId: session.profile.id,
      assessmentId: assessment.id
    });

    return {
      ...summaryFromAssessment(entry.slug, entry, assessment, attempts[0]),
      assessment,
      attempts
    };
  }

  const row = await getSupabaseAssessmentRowBySlug(slug);
  if (!row) {
    return null;
  }

  const assessment = createAssessmentFromCatalog(entry, {
    id: row.id,
    title: row.title,
    lessonId: row.lesson_id ?? entry.lessonId,
    reviewStatus: row.technical_review_status
  });
  const repositories = createSupabaseAttemptRepositories();
  const attempts = await listSupabaseAttempts({
    repositories,
    studentProfileId: session.profile.id,
    assessmentId: assessment.id
  });

  return {
    ...summaryFromRow(entry.slug, entry, row, attempts[0]),
    assessment,
    attempts
  };
}

export async function startAssessmentForStudent(
  session: AuthenticatedSession,
  slug: string
) {
  noStore();
  const overview = await loadAssessmentOverview(session, slug);
  if (!overview) {
    throw new Error("Assessment was not found or is not published.");
  }

  const activeAttempt = overview.attempts.find(
    (attempt) => attempt.status === "in_progress"
  );
  if (activeAttempt) {
    return activeAttempt;
  }

  const { services } = createPersistenceForSession();
  return services.startAssessmentAttempt(callerContext(session), {
    assessmentId: overview.assessment.id,
    contentVersion: overview.contentVersion
  });
}

export async function loadAssessmentAttemptPage(
  session: AuthenticatedSession,
  slug: string,
  attemptId: string
): Promise<AttemptPageModel | null> {
  noStore();
  const overview = await loadAssessmentOverview(session, slug);
  if (!overview) {
    return null;
  }

  const { repositories, services } = createPersistenceForSession();
  const attempt = await repositories.assessments.getAssessmentAttemptForReview({
    studentProfileId: session.profile.id,
    attemptId
  });

  if (!attempt || attempt.assessmentId !== overview.assessment.id) {
    return null;
  }

  const deliveredAssessment = await services.deliverAssessmentForStudent(
    callerContext(session),
    {
      assessmentId: overview.assessment.id,
      mode: "assessment"
    }
  );

  return {
    summary: overview,
    deliveredAssessment,
    attempt
  };
}

export async function saveAssessmentAttemptForStudent(input: {
  session: AuthenticatedSession;
  slug: string;
  attemptId: string;
  answers: StudentAnswer[];
}) {
  const { services } = createPersistenceForSession();
  return services.saveAssessmentProgress(callerContext(input.session), {
    attemptId: input.attemptId,
    studentProfileId: input.session.profile.id,
    answers: input.answers
  });
}

export async function submitAssessmentAttemptForStudent(input: {
  session: AuthenticatedSession;
  slug: string;
  attemptId: string;
  answers: StudentAnswer[];
  idempotencyKey: string;
}) {
  const { services } = createPersistenceForSession();
  return services.submitAssessmentAttempt(callerContext(input.session), {
    attemptId: input.attemptId,
    studentProfileId: input.session.profile.id,
    answers: input.answers,
    idempotencyKey: input.idempotencyKey
  });
}

export async function loadCompletedAssessmentReview(
  session: AuthenticatedSession,
  slug: string,
  attemptId: string
): Promise<ReviewPageModel | null> {
  noStore();
  const overview = await loadAssessmentOverview(session, slug);
  if (!overview) {
    return null;
  }

  const { services } = createPersistenceForSession();
  const attempt = await services
    .reviewCompletedAssessmentAttempt(callerContext(session), {
      studentProfileId: session.profile.id,
      attemptId
    })
    .catch(() => null);

  if (
    !attempt ||
    attempt.assessmentId !== overview.assessment.id ||
    !attempt.scoringSummary
  ) {
    return null;
  }

  return {
    summary: overview,
    assessment: overview.assessment,
    attempt: { ...attempt, scoringSummary: attempt.scoringSummary }
  };
}

export function resultForQuestion(
  results: QuestionResult[],
  questionId: string
): QuestionResult | undefined {
  return results.find((result) => result.questionId === questionId);
}

function createPersistenceForSession() {
  if (isLocalAssessmentMode()) {
    return createLocalAssessmentPersistence();
  }

  const repositories = createSupabaseAttemptRepositories();
  return {
    repositories,
    services: createAttemptPersistenceServices(repositories)
  };
}

function callerContext(session: AuthenticatedSession): AttemptContext {
  return {
    caller: callerFromSession(session)
  };
}

function callerFromSession(session: AuthenticatedSession): Caller {
  return {
    kind: "authenticated",
    principal: {
      profileId: session.profile.id,
      authUserId: session.authUserId,
      email: session.email,
      roles: session.roles
    }
  };
}

function isLocalAssessmentMode() {
  return (
    process.env.INDUSTRIAL_LEARN_AUTH_MODE === "local" &&
    process.env.INDUSTRIAL_LEARN_E2E === "true"
  );
}

function summaryFromAssessment(
  slug: string,
  entry: NonNullable<ReturnType<typeof getAssessmentCatalogBySlug>>,
  assessment: Assessment,
  latestAttempt?: PersistedAssessmentAttempt
): AssessmentSummary {
  return {
    slug,
    title: assessment.title,
    description: entry.description,
    lessonTitle: entry.lessonTitle,
    moduleTitle: entry.moduleTitle,
    estimatedMinutes: entry.estimatedMinutes,
    sourceIds: assessment.sourceIds,
    reviewStatus: assessment.reviewStatus,
    publicationStatus: "published",
    contentVersion: entry.contentVersion,
    latestAttempt
  };
}

function summaryFromRow(
  slug: string,
  entry: NonNullable<ReturnType<typeof getAssessmentCatalogBySlug>>,
  row: AssessmentRow,
  latestAttempt?: PersistedAssessmentAttempt
): AssessmentSummary {
  return {
    slug,
    title: row.title,
    description: row.description || entry.description,
    lessonTitle: entry.lessonTitle,
    moduleTitle: entry.moduleTitle,
    estimatedMinutes: entry.estimatedMinutes,
    sourceIds: entry.sourceIds,
    reviewStatus: row.technical_review_status,
    publicationStatus: row.publication_status,
    contentVersion: row.version,
    latestAttempt
  };
}

function createSupabaseAttemptRepositories(): AttemptPersistenceRepositories {
  const env = getServerEnv();
  const client = createServiceRestClient(env);

  const assessments: AssessmentAttemptRepository = {
    async getAssessment(assessmentId) {
      const rows = await client.get<AssessmentRow>("assessments", {
        id: `eq.${assessmentId}`,
        publication_status: `eq.${STUDENT_PUBLICATION_REQUIREMENTS.publicationStatus}`,
        technical_review_status: `eq.${STUDENT_PUBLICATION_REQUIREMENTS.reviewStatus}`,
        limit: "1"
      });
      const row = rows[0];
      if (!row) {
        return null;
      }
      const entry = getAssessmentCatalogBySlug(row.slug);
      if (!entry) {
        return null;
      }

      return createAssessmentFromCatalog(entry, {
        id: row.id,
        title: row.title,
        lessonId: row.lesson_id ?? entry.lessonId,
        reviewStatus: row.technical_review_status
      });
    },
    async getStartedAssessmentAttempt(input) {
      const rows = await client.get<AssessmentAttemptRow>("assessment_attempts", {
        student_profile_id: `eq.${input.studentProfileId}`,
        assessment_id: `eq.${input.assessmentId}`,
        attempt_number: `eq.${input.attemptNumber}`,
        limit: "1"
      });
      return rows[0] ? mapAttemptRow(rows[0]) : null;
    },
    async getAssessmentAttemptForReview(input) {
      const rows = await client.get<AssessmentAttemptRow>("assessment_attempts", {
        student_profile_id: `eq.${input.studentProfileId}`,
        id: `eq.${input.attemptId}`,
        limit: "1"
      });
      return rows[0] ? mapAttemptRow(rows[0]) : null;
    },
    async nextAssessmentAttemptNumber(input) {
      const rows = await client.get<AssessmentAttemptRow>("assessment_attempts", {
        student_profile_id: `eq.${input.studentProfileId}`,
        assessment_id: `eq.${input.assessmentId}`,
        order: "attempt_number.desc",
        limit: "1"
      });
      return (rows[0]?.attempt_number ?? 0) + 1;
    },
    async createAssessmentAttempt(attempt) {
      const rows = await client.post<AssessmentAttemptRow>(
        "assessment_attempts",
        {
          assessment_id: attempt.assessmentId,
          student_profile_id: attempt.studentProfileId,
          content_version: attempt.contentVersion,
          attempt_number: attempt.attemptNumber,
          status: attempt.status,
          submitted_answers: attempt.submittedAnswers,
          competency_awards: attempt.competencyAwards,
          started_at: attempt.startedAt
        },
        true
      );
      return mapAttemptRow(firstRow(rows));
    },
    async updateAssessmentProgress(input) {
      const rows = await client.patch<AssessmentAttemptRow>(
        "assessment_attempts",
        {
          submitted_answers: input.answers,
          status: "in_progress"
        },
        {
          student_profile_id: `eq.${input.studentProfileId}`,
          id: `eq.${input.attemptId}`
        }
      );
      return mapAttemptRow(firstRow(rows));
    },
    async completeAssessmentAttempt(input) {
      const rows = await client.rpc<AssessmentAttemptRow>(
        "complete_assessment_attempt_transaction",
        {
          p_student_profile_id: input.studentProfileId,
          p_attempt_id: input.attemptId,
          p_answers: input.answers,
          p_scoring_summary: input.scoringSummary,
          p_competency_awards: input.competencyAwards,
          p_idempotency_key: input.idempotencyKey,
          p_submitted_at: input.submittedAt,
          p_audit_metadata: input.auditMetadata ?? {}
        }
      );
      return mapAttemptRow(firstRow(rows));
    },
    async findCompletedAssessmentByIdempotency(input) {
      const rows = await client.get<AssessmentAttemptRow>("assessment_attempts", {
        student_profile_id: `eq.${input.studentProfileId}`,
        assessment_id: `eq.${input.assessmentId}`,
        idempotency_key: `eq.${input.idempotencyKey}`,
        limit: "1"
      });
      return rows[0] ? mapAttemptRow(rows[0]) : null;
    },
    recordCompetencyAwards() {
      return Promise.resolve();
    },
    updateLessonProgressFromAssessment() {
      return Promise.resolve();
    }
  };

  const simulations: SimulationAttemptRepository = {
    createSimulationAttempt() {
      throw new Error("Simulation attempts are not part of this repository.");
    },
    getSimulationAttempt() {
      return Promise.resolve(null);
    },
    findCompletedSimulationByIdempotency() {
      return Promise.resolve(null);
    },
    completeSimulationAttempt() {
      throw new Error("Simulation attempts are not part of this repository.");
    },
    recordCompetencyAwards() {
      return Promise.resolve();
    },
    updateLessonProgressFromSimulation() {
      return Promise.resolve();
    }
  };

  const audit: AttemptAuditRepository = {
    recordEvent() {
      return Promise.resolve();
    }
  };

  const transactions: AttemptTransactionRunner = {
    async transaction(operation) {
      return operation();
    }
  };

  return {
    assessments,
    simulations,
    audit,
    transactions
  };
}

async function listSupabaseAttempts(input: {
  repositories: AttemptPersistenceRepositories;
  studentProfileId: string;
  assessmentId: string;
}) {
  const attempts: PersistedAssessmentAttempt[] = [];
  const nextNumber = await input.repositories.assessments.nextAssessmentAttemptNumber({
    studentProfileId: input.studentProfileId,
    assessmentId: input.assessmentId
  });

  for (let attemptNumber = 1; attemptNumber < nextNumber; attemptNumber += 1) {
    const attempt = await input.repositories.assessments.getStartedAssessmentAttempt({
      studentProfileId: input.studentProfileId,
      assessmentId: input.assessmentId,
      attemptNumber
    });
    if (attempt) {
      attempts.push(attempt);
    }
  }

  return attempts.sort((left, right) => right.attemptNumber - left.attemptNumber);
}

async function getSupabaseAssessmentRowBySlug(slug: string) {
  const env = getServerEnv();
  const client = createServiceRestClient(env);
  const rows = await client.get<AssessmentRow>("assessments", {
    slug: `eq.${slug}`,
    publication_status: `eq.${STUDENT_PUBLICATION_REQUIREMENTS.publicationStatus}`,
    technical_review_status: `eq.${STUDENT_PUBLICATION_REQUIREMENTS.reviewStatus}`,
    limit: "1"
  });

  return rows[0] ?? null;
}

function createServiceRestClient(env: IndustrialLearnEnv) {
  if (!env.supabase.url || !env.supabase.serviceRoleKey) {
    throw new Error("Assessment persistence is not configured.");
  }

  const baseUrl = `${env.supabase.url}/rest/v1`;
  const headers = {
    apikey: env.supabase.serviceRoleKey,
    Authorization: `Bearer ${env.supabase.serviceRoleKey}`,
    "Content-Type": "application/json"
  };

  return {
    async get<T>(table: string, params: Record<string, string>) {
      const query = new URLSearchParams({ select: "*", ...params });
      const response = await fetch(`${baseUrl}/${table}?${query}`, {
        headers,
        cache: "no-store"
      });
      if (!response.ok) {
        throw new Error(`Assessment database read failed for ${table}.`);
      }
      return (await response.json()) as T[];
    },
    async post<T>(
      table: string,
      body: Record<string, unknown>,
      returnRows = false,
      prefer = "return=representation"
    ) {
      const response = await fetch(`${baseUrl}/${table}`, {
        method: "POST",
        headers: {
          ...headers,
          Prefer: returnRows ? "return=representation" : prefer
        },
        body: JSON.stringify(body),
        cache: "no-store"
      });
      if (!response.ok) {
        throw new Error(`Assessment database write failed for ${table}.`);
      }
      return returnRows ? ((await response.json()) as T[]) : ([] as T[]);
    },
    async patch<T>(
      table: string,
      body: Record<string, unknown>,
      filters: Record<string, string>
    ) {
      const query = new URLSearchParams({ select: "*", ...filters });
      const response = await fetch(`${baseUrl}/${table}?${query}`, {
        method: "PATCH",
        headers: {
          ...headers,
          Prefer: "return=representation"
        },
        body: JSON.stringify(body),
        cache: "no-store"
      });
      if (!response.ok) {
        throw new Error(`Assessment database update failed for ${table}.`);
      }
      const rows = (await response.json()) as T[];
      if (rows.length === 0) {
        throw new Error(`Assessment database update matched no rows for ${table}.`);
      }
      return rows;
    },
    async rpc<T>(functionName: string, body: Record<string, unknown>) {
      const response = await fetch(`${baseUrl}/rpc/${functionName}`, {
        method: "POST",
        headers: {
          ...headers,
          Prefer: "return=representation"
        },
        body: JSON.stringify(body),
        cache: "no-store"
      });
      if (!response.ok) {
        throw new Error(`Assessment database RPC failed for ${functionName}.`);
      }
      return (await response.json()) as T[];
    }
  };
}

function mapAttemptRow(row: AssessmentAttemptRow): PersistedAssessmentAttempt {
  return {
    id: row.id,
    assessmentId: row.assessment_id,
    studentProfileId: row.student_profile_id,
    contentVersion: row.content_version ?? 1,
    attemptNumber: row.attempt_number ?? 1,
    status: row.status,
    submittedAnswers: arrayFromJson<StudentAnswer>(row.submitted_answers),
    scoringSummary: objectFromJson<AssessmentAttempt>(row.scoring_summary),
    competencyAwards:
      objectFromJson<Partial<Record<CompetencyLevel, number>>>(row.competency_awards) ??
      {},
    idempotencyKey: row.idempotency_key ?? undefined,
    startedAt: row.started_at,
    submittedAt: row.submitted_at ?? undefined,
    gradedAt: row.graded_at ?? undefined
  };
}

function firstRow<T>(rows: T[]) {
  const row = rows[0];
  if (!row) {
    throw new Error("Assessment database operation returned no rows.");
  }
  return row;
}

function arrayFromJson<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function objectFromJson<T>(value: unknown): T | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  return value as T;
}
