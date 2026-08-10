import "server-only";

import { unstable_noStore as noStore } from "next/cache";
import {
  createAttemptPersistenceServices,
  type AssessmentAttemptRepository,
  type AttemptAuditRepository,
  type AttemptContext,
  type AttemptPersistenceRepositories,
  type Caller,
  type PersistedSimulationAttempt,
  type PersistenceAttemptStatus,
  type SimulationAttemptRepository
} from "@industrial-learn/database";
import { getServerEnv, type IndustrialLearnEnv } from "@industrial-learn/env";
import {
  getSimulation,
  type Measurement,
  type SimulationMode,
  type SimulationState
} from "@industrial-learn/simulation-engine";
import type { CompetencyLevel } from "@industrial-learn/assessment-core";

import type { AuthenticatedSession } from "../auth/session-core";
import { getSimulationCatalogBySlug, simulationCatalog } from "./catalog";
import {
  createLocalSimulationPersistence,
  listLocalSimulationAttempts
} from "./local-store";

export type SimulationSummary = {
  slug: string;
  title: string;
  description: string;
  moduleTitle: string;
  lessonTitle: string;
  estimatedMinutes: number;
  simulationId: string;
  version: number;
  reviewStatus: string;
  publicationStatus: string;
  sourceIds: string[];
  equationIds: string[];
  latestAttempt?: PersistedSimulationAttempt | undefined;
};

export type SimulationOverview = SimulationSummary & {
  modes: SimulationMode[];
  inputRanges: Array<{ inputId: string; min: number; max: number; unit: string }>;
  faultModes: Array<{ id: string; label: string; description: string }>;
  attempts: PersistedSimulationAttempt[];
};

export type SimulationAttemptPageModel = {
  overview: SimulationOverview;
  attempt: PersistedSimulationAttempt;
  initialState: SimulationState;
};

export type SimulationReviewPageModel = {
  overview: SimulationOverview;
  attempt: PersistedSimulationAttempt;
};

type SimulationRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  lesson_id: string | null;
  version: number;
  technical_review_status: string;
  publication_status: string;
};

type SimulationAttemptRow = {
  id: string;
  simulation_id: string;
  student_profile_id: string;
  status: PersistenceAttemptStatus;
  scenario_state?: string | null;
  input_state?: unknown;
  output_summary?: unknown;
  output_state?: unknown;
  diagnostic_response?: unknown;
  simulation_version?: number | null;
  lesson_id?: string | null;
  mode?: SimulationMode | null;
  idempotency_key?: string | null;
  fault_introduced?: string | null;
  measurements_taken?: unknown;
  diagnosis_submitted?: unknown;
  score?: number | null;
  competency_awards?: unknown;
  started_at: string;
  completed_at?: string | null;
};

export async function listSimulationsForStudent(
  session: AuthenticatedSession
): Promise<SimulationSummary[]> {
  noStore();
  const records = await Promise.all(
    simulationCatalog.map((entry) => loadSimulationOverview(session, entry.slug))
  );
  return records.filter((record): record is SimulationOverview => Boolean(record));
}

export async function loadSimulationOverview(
  session: AuthenticatedSession,
  slug: string
): Promise<SimulationOverview | null> {
  noStore();
  const entry = getSimulationCatalogBySlug(slug);
  if (!entry) {
    return null;
  }

  const runtime = getSimulation(entry.definition.simulationId);
  if (!runtime) {
    return null;
  }

  if (isLocalSimulationMode()) {
    const attempts = listLocalSimulationAttempts({
      studentProfileId: session.profile.id,
      simulationId: entry.definition.simulationId
    });
    return {
      ...summaryFromDefinition(slug, entry, attempts[0]),
      modes: runtime.definition.modes,
      inputRanges: runtime.definition.inputRanges,
      faultModes: runtime.definition.faultModes,
      attempts
    };
  }

  const row = await getSupabaseSimulationRowBySlug(slug);
  if (!row) {
    return null;
  }

  const repositories = createSupabaseSimulationRepositories();
  const attempts = await listSupabaseSimulationAttempts({
    repositories,
    studentProfileId: session.profile.id,
    simulationRow: row
  });

  return {
    ...summaryFromRow(slug, entry, row, attempts[0]),
    modes: runtime.definition.modes,
    inputRanges: runtime.definition.inputRanges,
    faultModes: runtime.definition.faultModes,
    attempts
  };
}

export async function startSimulationForStudent(
  session: AuthenticatedSession,
  slug: string,
  mode: SimulationMode
) {
  noStore();
  const overview = await loadSimulationOverview(session, slug);
  if (!overview) {
    throw new Error("Simulation was not found or is not published.");
  }

  const activeAttempt = overview.attempts.find(
    (attempt) => attempt.status === "in_progress" && attempt.mode === mode
  );
  if (activeAttempt) {
    return activeAttempt;
  }

  const { services } = createPersistenceForSession();
  return services.startSimulationAttempt(callerContext(session), {
    simulationId: overview.simulationId,
    lessonId: getSimulationCatalogBySlug(slug)?.definition.lessonIds[0] ?? "",
    mode,
    simulationVersion: overview.version
  });
}

export async function loadSimulationAttemptPage(
  session: AuthenticatedSession,
  slug: string,
  attemptId: string
): Promise<SimulationAttemptPageModel | null> {
  noStore();
  const overview = await loadSimulationOverview(session, slug);
  if (!overview) {
    return null;
  }

  const { repositories } = createPersistenceForSession();
  const attempt = await repositories.simulations.getSimulationAttempt({
    studentProfileId: session.profile.id,
    attemptId
  });

  if (!attempt || attempt.simulationId !== overview.simulationId) {
    return null;
  }

  const runtime = getSimulation(attempt.simulationId);
  if (!runtime) {
    return null;
  }

  let initialState = runtime.createInitialState(attempt.mode);
  for (const [inputId, value] of Object.entries(attempt.inputState)) {
    initialState = runtime.updateInput(initialState, inputId, value);
  }

  return { overview, attempt, initialState };
}

export async function completeSimulationForStudent(input: {
  session: AuthenticatedSession;
  slug: string;
  attemptId: string;
  finalState: SimulationState;
  diagnosisSubmitted: Record<string, unknown>;
  submittedAssessmentValue?: number | undefined;
  idempotencyKey: string;
}) {
  const { services } = createPersistenceForSession();
  return services.completeSimulationAttempt(callerContext(input.session), {
    attemptId: input.attemptId,
    studentProfileId: input.session.profile.id,
    finalState: input.finalState,
    diagnosisSubmitted: input.diagnosisSubmitted,
    submittedAssessmentValue: input.submittedAssessmentValue,
    idempotencyKey: input.idempotencyKey
  });
}

export async function loadCompletedSimulationReview(
  session: AuthenticatedSession,
  slug: string,
  attemptId: string
): Promise<SimulationReviewPageModel | null> {
  noStore();
  const overview = await loadSimulationOverview(session, slug);
  if (!overview) {
    return null;
  }

  const { repositories } = createPersistenceForSession();
  const attempt = await repositories.simulations.getSimulationAttempt({
    studentProfileId: session.profile.id,
    attemptId
  });

  if (
    !attempt ||
    attempt.simulationId !== overview.simulationId ||
    (attempt.status !== "submitted" && attempt.status !== "graded")
  ) {
    return null;
  }

  return { overview, attempt };
}

export async function listSimulationHistory(session: AuthenticatedSession) {
  noStore();
  if (isLocalSimulationMode()) {
    return listLocalSimulationAttempts({ studentProfileId: session.profile.id });
  }

  const repositories = createSupabaseSimulationRepositories();
  const attempts: PersistedSimulationAttempt[] = [];
  for (const entry of simulationCatalog) {
    const row = await getSupabaseSimulationRowBySlug(entry.slug);
    if (row) {
      attempts.push(
        ...(await listSupabaseSimulationAttempts({
          repositories,
          studentProfileId: session.profile.id,
          simulationRow: row
        }))
      );
    }
  }
  return attempts.sort((left, right) => {
    const leftDate = left.completedAt ?? left.startedAt;
    const rightDate = right.completedAt ?? right.startedAt;
    return Date.parse(rightDate) - Date.parse(leftDate);
  });
}

function createPersistenceForSession() {
  if (isLocalSimulationMode()) {
    return createLocalSimulationPersistence();
  }

  const repositories = createSupabaseSimulationRepositories();
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

function isLocalSimulationMode() {
  return (
    process.env.INDUSTRIAL_LEARN_AUTH_MODE === "local" &&
    process.env.INDUSTRIAL_LEARN_E2E === "true"
  );
}

function summaryFromDefinition(
  slug: string,
  entry: NonNullable<ReturnType<typeof getSimulationCatalogBySlug>>,
  latestAttempt?: PersistedSimulationAttempt
): SimulationSummary {
  return {
    slug,
    title: entry.definition.title,
    description: entry.definition.visualRepresentation.description,
    moduleTitle: entry.moduleTitle,
    lessonTitle: entry.lessonTitle,
    estimatedMinutes: entry.estimatedMinutes,
    simulationId: entry.definition.simulationId,
    version: 1,
    reviewStatus: entry.definition.reviewStatus,
    publicationStatus: "published",
    sourceIds: entry.definition.sourceIds,
    equationIds: entry.definition.equations.map((equation) => equation.equationId),
    latestAttempt
  };
}

function summaryFromRow(
  slug: string,
  entry: NonNullable<ReturnType<typeof getSimulationCatalogBySlug>>,
  row: SimulationRow,
  latestAttempt?: PersistedSimulationAttempt
): SimulationSummary {
  return {
    ...summaryFromDefinition(slug, entry, latestAttempt),
    title: row.title || entry.definition.title,
    description: row.description || entry.definition.visualRepresentation.description,
    version: row.version,
    publicationStatus: row.publication_status,
    reviewStatus: entry.definition.reviewStatus
  };
}

function createSupabaseSimulationRepositories(): AttemptPersistenceRepositories {
  const env = getServerEnv();
  const client = createServiceRestClient(env);

  const simulations: SimulationAttemptRepository = {
    async createSimulationAttempt(attempt) {
      const simulationRow = await getSupabaseSimulationRowForDefinition(
        client,
        attempt.simulationId
      );
      if (!simulationRow) {
        throw new Error("Simulation database row was not found.");
      }

      const rows = await client.post<SimulationAttemptRow>(
        "simulation_attempts",
        {
          simulation_id: simulationRow.id,
          student_profile_id: attempt.studentProfileId,
          status: attempt.status,
          scenario_state: "normal-state",
          input_state: attempt.inputState,
          output_state: attempt.outputSummary,
          output_summary: attempt.outputSummary,
          diagnostic_response: attempt.diagnosisSubmitted,
          simulation_version: attempt.simulationVersion,
          lesson_id: simulationRow.lesson_id,
          mode: attempt.mode,
          measurements_taken: attempt.measurementsTaken,
          diagnosis_submitted: attempt.diagnosisSubmitted,
          competency_awards: attempt.competencyAwards,
          started_at: attempt.startedAt
        },
        true
      );
      return mapSimulationAttemptRow(firstRow(rows), attempt.simulationId);
    },
    async getSimulationAttempt(input) {
      const rows = await client.get<SimulationAttemptRow>("simulation_attempts", {
        student_profile_id: `eq.${input.studentProfileId}`,
        id: `eq.${input.attemptId}`,
        limit: "1"
      });
      const row = rows[0];
      if (!row) {
        return null;
      }
      return mapSimulationAttemptRow(row, await engineIdForSimulationRow(client, row));
    },
    async findCompletedSimulationByIdempotency(input) {
      const simulationRow = await getSupabaseSimulationRowForDefinition(
        client,
        input.simulationId
      );
      if (!simulationRow) {
        return null;
      }
      const rows = await client.get<SimulationAttemptRow>("simulation_attempts", {
        student_profile_id: `eq.${input.studentProfileId}`,
        simulation_id: `eq.${simulationRow.id}`,
        idempotency_key: `eq.${input.idempotencyKey}`,
        limit: "1"
      });
      return rows[0] ? mapSimulationAttemptRow(rows[0], input.simulationId) : null;
    },
    async completeSimulationAttempt(input) {
      const rows = await client.rpc<SimulationAttemptRow>(
        "complete_simulation_attempt_transaction",
        {
          p_student_profile_id: input.studentProfileId,
          p_attempt_id: input.attemptId,
          p_completed_at: input.completedAt,
          p_input_state: input.inputState,
          p_output_summary: {
            ...input.outputSummary,
            scenarioState: input.faultIntroduced ? "fault-state" : "normal-state"
          },
          p_fault_introduced: input.faultIntroduced ?? null,
          p_measurements_taken: input.measurementsTaken,
          p_diagnosis_submitted: input.diagnosisSubmitted,
          p_score: input.score ?? null,
          p_competency_awards: input.competencyAwards,
          p_idempotency_key: input.idempotencyKey,
          p_status: input.status,
          p_audit_metadata: {
            mode: input.diagnosisSubmitted.mode ?? "unknown",
            score: input.score ?? 0,
            measurementCount: input.measurementsTaken.length
          }
        }
      );
      const row = firstRow(rows);
      return mapSimulationAttemptRow(row, await engineIdForSimulationRow(client, row));
    },
    recordCompetencyAwards() {
      return Promise.resolve();
    },
    updateLessonProgressFromSimulation() {
      return Promise.resolve();
    }
  };

  return {
    assessments: unusedAssessmentRepository(),
    simulations,
    audit: unusedAuditRepository(),
    transactions: {
      async transaction(operation) {
        return operation();
      }
    }
  };
}

async function listSupabaseSimulationAttempts(input: {
  repositories: AttemptPersistenceRepositories;
  studentProfileId: string;
  simulationRow: SimulationRow;
}) {
  const client = createServiceRestClient(getServerEnv());
  const rows = await client.get<SimulationAttemptRow>("simulation_attempts", {
    student_profile_id: `eq.${input.studentProfileId}`,
    simulation_id: `eq.${input.simulationRow.id}`,
    order: "started_at.desc",
    limit: "20"
  });
  const entry = getSimulationCatalogBySlug(input.simulationRow.slug);
  const simulationId = entry?.definition.simulationId ?? "";
  return rows.map((row) => mapSimulationAttemptRow(row, simulationId));
}

async function getSupabaseSimulationRowBySlug(slug: string) {
  const env = getServerEnv();
  const client = createServiceRestClient(env);
  const rows = await client.get<SimulationRow>("simulations", {
    slug: `eq.${slug}`,
    publication_status: "eq.published",
    limit: "1"
  });
  return rows[0] ?? null;
}

async function getSupabaseSimulationRowForDefinition(
  client: ReturnType<typeof createServiceRestClient>,
  simulationId: string
) {
  const entry = simulationCatalog.find(
    (catalogEntry) => catalogEntry.definition.simulationId === simulationId
  );
  if (!entry) {
    return null;
  }
  const rows = await client.get<SimulationRow>("simulations", {
    slug: `eq.${entry.slug}`,
    publication_status: "eq.published",
    limit: "1"
  });
  return rows[0] ?? null;
}

async function engineIdForSimulationRow(
  client: ReturnType<typeof createServiceRestClient>,
  row: SimulationAttemptRow
) {
  const rows = await client.get<SimulationRow>("simulations", {
    id: `eq.${row.simulation_id}`,
    limit: "1"
  });
  const entry = rows[0] ? getSimulationCatalogBySlug(rows[0].slug) : undefined;
  return entry?.definition.simulationId ?? row.simulation_id;
}

function createServiceRestClient(env: IndustrialLearnEnv) {
  if (!env.supabase.url || !env.supabase.serviceRoleKey) {
    throw new Error("Simulation persistence is not configured.");
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
        throw new Error(`Simulation database read failed for ${table}.`);
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
        throw new Error(`Simulation database write failed for ${table}.`);
      }
      return returnRows ? ((await response.json()) as T[]) : ([] as T[]);
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
        throw new Error(`Simulation database RPC failed for ${functionName}.`);
      }
      return (await response.json()) as T[];
    }
  };
}

function mapSimulationAttemptRow(
  row: SimulationAttemptRow,
  simulationId: string
): PersistedSimulationAttempt {
  return {
    id: row.id,
    simulationId,
    simulationVersion: row.simulation_version ?? 1,
    lessonId: row.lesson_id ?? "",
    studentProfileId: row.student_profile_id,
    mode: row.mode ?? "learn",
    status: row.status,
    startedAt: row.started_at,
    completedAt: row.completed_at ?? undefined,
    inputState: numberRecordFromJson(row.input_state),
    outputSummary: outputRecordFromJson(row.output_summary ?? row.output_state),
    faultIntroduced: row.fault_introduced ?? undefined,
    measurementsTaken: arrayFromJson<Measurement>(row.measurements_taken),
    diagnosisSubmitted: objectFromJson<Record<string, unknown>>(
      row.diagnosis_submitted ?? row.diagnostic_response
    ),
    score: row.score ?? undefined,
    competencyAwards:
      objectFromJson<Partial<Record<CompetencyLevel, number>>>(row.competency_awards) ??
      {},
    idempotencyKey: row.idempotency_key ?? undefined
  };
}

function unusedAssessmentRepository(): AssessmentAttemptRepository {
  return {
    getAssessment: () => Promise.resolve(null),
    getStartedAssessmentAttempt: () => Promise.resolve(null),
    getAssessmentAttemptForReview: () => Promise.resolve(null),
    nextAssessmentAttemptNumber: () => Promise.resolve(1),
    createAssessmentAttempt: () => Promise.reject(new Error("Assessment unused.")),
    updateAssessmentProgress: () => Promise.reject(new Error("Assessment unused.")),
    completeAssessmentAttempt: () => Promise.reject(new Error("Assessment unused.")),
    findCompletedAssessmentByIdempotency: () => Promise.resolve(null),
    recordCompetencyAwards: () => Promise.resolve(),
    updateLessonProgressFromAssessment: () => Promise.resolve()
  };
}

function unusedAuditRepository(): AttemptAuditRepository {
  return {
    recordEvent() {
      return Promise.resolve();
    }
  };
}

function firstRow<T>(rows: T[]) {
  const row = rows[0];
  if (!row) {
    throw new Error("Simulation database operation returned no rows.");
  }
  return row;
}

function numberRecordFromJson(value: unknown): Record<string, number> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const record: Record<string, number> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    if (typeof item === "number" && Number.isFinite(item)) {
      record[key] = item;
    }
  }
  return record;
}

function outputRecordFromJson(
  value: unknown
): Record<string, number | string | boolean | null> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  const record: Record<string, number | string | boolean | null> = {};
  for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
    if (
      item === null ||
      typeof item === "number" ||
      typeof item === "string" ||
      typeof item === "boolean"
    ) {
      record[key] = item;
    }
  }
  return record;
}

function arrayFromJson<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function objectFromJson<T>(value: unknown): T {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as T)
    : ({} as T);
}
