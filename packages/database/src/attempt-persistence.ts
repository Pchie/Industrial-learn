import {
  deliverAssessment,
  submitAssessment,
  type Assessment,
  type AssessmentAttempt,
  type CompetencyLevel,
  type DeliveredAssessment,
  type NumericEngineeringQuestion,
  type StudentAnswer,
  type UnitAwareAnswer
} from "@industrial-learn/assessment-core";
import { convertToSi } from "@industrial-learn/engineering-core";
import {
  getSimulation,
  type Measurement,
  type SimulationMode,
  type SimulationState
} from "@industrial-learn/simulation-engine";

import { assertSelfOrAdmin, requireAuthenticated } from "./authorization";
import type { Caller } from "./domain";
import { ApplicationError, translateDatabaseError } from "./errors";

export type PersistenceAttemptStatus =
  "not_started" | "in_progress" | "submitted" | "graded" | "abandoned";

export type PersistedAssessmentAttempt = {
  id: string;
  assessmentId: string;
  studentProfileId: string;
  contentVersion: number;
  attemptNumber: number;
  status: PersistenceAttemptStatus;
  submittedAnswers: StudentAnswer[];
  scoringSummary?: AssessmentAttempt | undefined;
  competencyAwards: Partial<Record<CompetencyLevel, number>>;
  idempotencyKey?: string | undefined;
  startedAt: string;
  submittedAt?: string | undefined;
  gradedAt?: string | undefined;
};

export type PersistedSimulationAttempt = {
  id: string;
  simulationId: string;
  simulationVersion: number;
  lessonId: string;
  studentProfileId: string;
  mode: SimulationMode;
  status: PersistenceAttemptStatus;
  startedAt: string;
  completedAt?: string | undefined;
  inputState: Record<string, number>;
  outputSummary: Record<string, number | string | boolean | null>;
  faultIntroduced?: string | undefined;
  measurementsTaken: Measurement[];
  diagnosisSubmitted: Record<string, unknown>;
  score?: number | undefined;
  competencyAwards: Partial<Record<CompetencyLevel, number>>;
  idempotencyKey?: string | undefined;
};

export type AssessmentAttemptRepository = {
  getAssessment(assessmentId: string): Promise<Assessment | null>;
  getStartedAssessmentAttempt(input: {
    studentProfileId: string;
    assessmentId: string;
    attemptNumber: number;
  }): Promise<PersistedAssessmentAttempt | null>;
  getAssessmentAttemptForReview(input: {
    studentProfileId: string;
    attemptId: string;
  }): Promise<PersistedAssessmentAttempt | null>;
  nextAssessmentAttemptNumber(input: {
    studentProfileId: string;
    assessmentId: string;
  }): Promise<number>;
  createAssessmentAttempt(
    attempt: PersistedAssessmentAttempt
  ): Promise<PersistedAssessmentAttempt>;
  updateAssessmentProgress(input: {
    studentProfileId: string;
    attemptId: string;
    answers: StudentAnswer[];
  }): Promise<PersistedAssessmentAttempt>;
  completeAssessmentAttempt(input: {
    studentProfileId: string;
    attemptId: string;
    answers: StudentAnswer[];
    scoringSummary: AssessmentAttempt;
    competencyAwards: Partial<Record<CompetencyLevel, number>>;
    idempotencyKey: string;
    submittedAt: string;
    auditMetadata?: Record<string, string | number | boolean | null> | undefined;
  }): Promise<PersistedAssessmentAttempt>;
  findCompletedAssessmentByIdempotency(input: {
    studentProfileId: string;
    assessmentId: string;
    idempotencyKey: string;
  }): Promise<PersistedAssessmentAttempt | null>;
  recordCompetencyAwards(input: {
    studentProfileId: string;
    sourceAttemptId: string;
    awards: Partial<Record<CompetencyLevel, number>>;
  }): Promise<void>;
  updateLessonProgressFromAssessment(input: {
    studentProfileId: string;
    assessmentId: string;
    sourceAttemptId: string;
  }): Promise<void>;
};

export type SimulationAttemptRepository = {
  createSimulationAttempt(
    attempt: PersistedSimulationAttempt
  ): Promise<PersistedSimulationAttempt>;
  getSimulationAttempt(input: {
    studentProfileId: string;
    attemptId: string;
  }): Promise<PersistedSimulationAttempt | null>;
  findCompletedSimulationByIdempotency(input: {
    studentProfileId: string;
    simulationId: string;
    idempotencyKey: string;
  }): Promise<PersistedSimulationAttempt | null>;
  completeSimulationAttempt(input: {
    studentProfileId: string;
    attemptId: string;
    completedAt: string;
    inputState: Record<string, number>;
    outputSummary: Record<string, number | string | boolean | null>;
    faultIntroduced?: string | undefined;
    measurementsTaken: Measurement[];
    diagnosisSubmitted: Record<string, unknown>;
    score?: number | undefined;
    competencyAwards: Partial<Record<CompetencyLevel, number>>;
    idempotencyKey: string;
    status: PersistenceAttemptStatus;
  }): Promise<PersistedSimulationAttempt>;
  recordCompetencyAwards(input: {
    studentProfileId: string;
    sourceAttemptId: string;
    awards: Partial<Record<CompetencyLevel, number>>;
  }): Promise<void>;
  updateLessonProgressFromSimulation(input: {
    studentProfileId: string;
    lessonId: string;
    sourceAttemptId: string;
  }): Promise<void>;
};

export type AttemptAuditRepository = {
  recordEvent(input: {
    actorProfileId: string;
    action: string;
    entityTable: string;
    entityId: string;
    metadata?: Record<string, string | number | boolean | null> | undefined;
  }): Promise<void>;
};

export type AttemptTransactionRunner = {
  transaction<T>(operation: () => Promise<T>): Promise<T>;
};

export type AttemptPersistenceRepositories = {
  assessments: AssessmentAttemptRepository;
  simulations: SimulationAttemptRepository;
  audit: AttemptAuditRepository;
  transactions: AttemptTransactionRunner;
};

export type AttemptContext = {
  caller: Caller;
};

export function createAttemptPersistenceServices(
  repositories: AttemptPersistenceRepositories
) {
  return {
    async deliverAssessmentForStudent(
      context: AttemptContext,
      input: { assessmentId: string; mode: "practice" | "assessment" }
    ): Promise<DeliveredAssessment> {
      requireAuthenticated(context.caller);
      const assessment = await loadPublishedAssessment(repositories, input.assessmentId);
      return deliverAssessment(assessment, input.mode);
    },

    async startAssessmentAttempt(
      context: AttemptContext,
      input: { assessmentId: string; contentVersion: number }
    ) {
      const principal = requireAuthenticated(context.caller);
      const assessment = await loadPublishedAssessment(repositories, input.assessmentId);
      const attemptNumber = await repositories.assessments.nextAssessmentAttemptNumber({
        studentProfileId: principal.profileId,
        assessmentId: assessment.id
      });

      return safeRepositoryCall(() =>
        repositories.assessments.createAssessmentAttempt({
          id: createAttemptId(
            "assessment",
            assessment.id,
            principal.profileId,
            attemptNumber
          ),
          assessmentId: assessment.id,
          studentProfileId: principal.profileId,
          contentVersion: input.contentVersion,
          attemptNumber,
          status: "in_progress",
          submittedAnswers: [],
          competencyAwards: {},
          startedAt: new Date().toISOString()
        })
      );
    },

    async saveAssessmentProgress(
      context: AttemptContext,
      input: {
        attemptId: string;
        studentProfileId: string;
        answers: StudentAnswer[];
      }
    ) {
      const principal = requireAuthenticated(context.caller);
      assertSelfOrAdmin(principal, input.studentProfileId);

      const attempt = await repositories.assessments.getAssessmentAttemptForReview({
        studentProfileId: input.studentProfileId,
        attemptId: input.attemptId
      });

      if (!attempt) {
        throw new ApplicationError("resource_not_found");
      }

      if (attempt.status === "submitted" || attempt.status === "graded") {
        throw new ApplicationError("conflict", {
          message: "Completed assessment attempts cannot be changed."
        });
      }

      return safeRepositoryCall(() =>
        repositories.assessments.updateAssessmentProgress({
          studentProfileId: input.studentProfileId,
          attemptId: input.attemptId,
          answers: input.answers
        })
      );
    },

    async submitAssessmentAttempt(
      context: AttemptContext,
      input: {
        attemptId: string;
        studentProfileId: string;
        answers: StudentAnswer[];
        idempotencyKey: string;
        clientScore?: number | undefined;
        clientCompetencyAwards?: Partial<Record<CompetencyLevel, number>> | undefined;
        clientContentVersion?: number | undefined;
      }
    ) {
      const principal = requireAuthenticated(context.caller);
      assertSelfOrAdmin(principal, input.studentProfileId);

      return safeRepositoryCall(() =>
        repositories.transactions.transaction(async () => {
          const attempt = await repositories.assessments.getAssessmentAttemptForReview({
            studentProfileId: input.studentProfileId,
            attemptId: input.attemptId
          });

          if (!attempt) {
            throw new ApplicationError("resource_not_found");
          }

          const duplicate =
            await repositories.assessments.findCompletedAssessmentByIdempotency({
              studentProfileId: input.studentProfileId,
              assessmentId: attempt.assessmentId,
              idempotencyKey: input.idempotencyKey
            });

          if (duplicate) {
            return duplicate;
          }

          if (attempt.status === "submitted" || attempt.status === "graded") {
            throw new ApplicationError("conflict", {
              message: "Assessment attempt has already been completed."
            });
          }

          const assessment = await loadPublishedAssessment(
            repositories,
            attempt.assessmentId
          );
          const normalisedAnswers = normaliseAssessmentAnswers(assessment, input.answers);
          const submittedAt = new Date().toISOString();
          const scoringSummary = submitAssessment({
            assessment,
            studentId: input.studentProfileId,
            answers: normalisedAnswers.answers,
            submittedAt,
            attemptId: attempt.id
          });

          const completed = await repositories.assessments.completeAssessmentAttempt({
            studentProfileId: input.studentProfileId,
            attemptId: attempt.id,
            answers: input.answers,
            scoringSummary,
            competencyAwards: scoringSummary.competencyProgress,
            idempotencyKey: input.idempotencyKey,
            submittedAt,
            auditMetadata: {
              earnedPoints: scoringSummary.earnedPoints,
              maxPoints: scoringSummary.maxPoints,
              convertedAnswerCount: normalisedAnswers.convertedAnswerCount
            }
          });

          await repositories.assessments.recordCompetencyAwards({
            studentProfileId: input.studentProfileId,
            sourceAttemptId: attempt.id,
            awards: scoringSummary.competencyProgress
          });
          await repositories.assessments.updateLessonProgressFromAssessment({
            studentProfileId: input.studentProfileId,
            assessmentId: attempt.assessmentId,
            sourceAttemptId: attempt.id
          });
          await repositories.audit.recordEvent({
            actorProfileId: principal.profileId,
            action: "assessment_attempt_completed",
            entityTable: "assessment_attempts",
            entityId: attempt.id,
            metadata: {
              earnedPoints: scoringSummary.earnedPoints,
              maxPoints: scoringSummary.maxPoints,
              convertedAnswerCount: normalisedAnswers.convertedAnswerCount
            }
          });

          return completed;
        })
      );
    },

    async reviewCompletedAssessmentAttempt(
      context: AttemptContext,
      input: { studentProfileId: string; attemptId: string }
    ) {
      const principal = requireAuthenticated(context.caller);
      assertSelfOrAdmin(principal, input.studentProfileId);
      const attempt = await repositories.assessments.getAssessmentAttemptForReview(input);

      if (!attempt || (attempt.status !== "submitted" && attempt.status !== "graded")) {
        throw new ApplicationError("resource_not_found");
      }

      return attempt;
    },

    async startSimulationAttempt(
      context: AttemptContext,
      input: {
        simulationId: string;
        lessonId: string;
        mode: SimulationMode;
        simulationVersion: number;
      }
    ) {
      const principal = requireAuthenticated(context.caller);
      const runtime = getSimulation(input.simulationId);

      if (!runtime) {
        throw new ApplicationError("resource_not_found");
      }

      if (!runtime.definition.modes.includes(input.mode)) {
        throw new ApplicationError("invalid_input");
      }

      const state = runtime.createInitialState(input.mode);
      return safeRepositoryCall(() =>
        repositories.simulations.createSimulationAttempt({
          id: createAttemptId("simulation", input.simulationId, principal.profileId),
          simulationId: input.simulationId,
          simulationVersion: input.simulationVersion,
          lessonId: input.lessonId,
          studentProfileId: principal.profileId,
          mode: input.mode,
          status: "in_progress",
          startedAt: new Date().toISOString(),
          inputState: state.inputs,
          outputSummary: summariseOutputs(state),
          measurementsTaken: [],
          diagnosisSubmitted: {},
          competencyAwards: {}
        })
      );
    },

    async completeSimulationAttempt(
      context: AttemptContext,
      input: {
        attemptId: string;
        studentProfileId: string;
        finalState: SimulationState;
        diagnosisSubmitted?: Record<string, unknown> | undefined;
        submittedAssessmentValue?: number | undefined;
        idempotencyKey: string;
        clientScore?: number | undefined;
        clientCompetencyAwards?: Partial<Record<CompetencyLevel, number>> | undefined;
      }
    ) {
      const principal = requireAuthenticated(context.caller);
      assertSelfOrAdmin(principal, input.studentProfileId);

      return safeRepositoryCall(() =>
        repositories.transactions.transaction(async () => {
          const attempt = await repositories.simulations.getSimulationAttempt({
            studentProfileId: input.studentProfileId,
            attemptId: input.attemptId
          });

          if (!attempt) {
            throw new ApplicationError("resource_not_found");
          }

          const duplicate =
            await repositories.simulations.findCompletedSimulationByIdempotency({
              studentProfileId: input.studentProfileId,
              simulationId: attempt.simulationId,
              idempotencyKey: input.idempotencyKey
            });

          if (duplicate) {
            return duplicate;
          }

          if (attempt.status === "submitted" || attempt.status === "graded") {
            throw new ApplicationError("conflict", {
              message: "Simulation attempt has already been completed."
            });
          }

          const runtime = getSimulation(attempt.simulationId);
          if (!runtime) {
            throw new ApplicationError("resource_not_found");
          }

          const scoredState =
            attempt.mode === "assessment"
              ? runtime.scoreAssessment(
                  input.finalState,
                  requireSubmittedAssessmentValue(input.submittedAssessmentValue)
                )
              : input.finalState;

          const score = simulationScoreForMode(attempt.mode, scoredState);
          const competencyAwards = competencyAwardsForSimulation(attempt.mode, score);
          const completed = await repositories.simulations.completeSimulationAttempt({
            studentProfileId: input.studentProfileId,
            attemptId: input.attemptId,
            completedAt: new Date().toISOString(),
            inputState: scoredState.inputs,
            outputSummary: summariseOutputs(scoredState),
            faultIntroduced: scoredState.activeFaultIds[0],
            measurementsTaken: [
              ...scoredState.liveMeasurements,
              ...scoredState.diagnosticMeasurements
            ].slice(0, 20),
            diagnosisSubmitted: input.diagnosisSubmitted ?? {},
            score,
            competencyAwards,
            idempotencyKey: input.idempotencyKey,
            status: "submitted"
          });

          await repositories.simulations.recordCompetencyAwards({
            studentProfileId: input.studentProfileId,
            sourceAttemptId: attempt.id,
            awards: competencyAwards
          });
          await repositories.simulations.updateLessonProgressFromSimulation({
            studentProfileId: input.studentProfileId,
            lessonId: attempt.lessonId,
            sourceAttemptId: attempt.id
          });
          await repositories.audit.recordEvent({
            actorProfileId: principal.profileId,
            action: "simulation_attempt_completed",
            entityTable: "simulation_attempts",
            entityId: attempt.id,
            metadata: {
              mode: attempt.mode,
              score: score ?? 0,
              measurementCount: completed.measurementsTaken.length
            }
          });

          return completed;
        })
      );
    }
  };
}

async function safeRepositoryCall<T>(operation: () => Promise<T>): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof ApplicationError) {
      throw error;
    }

    throw translateDatabaseError(error);
  }
}

async function loadPublishedAssessment(
  repositories: AttemptPersistenceRepositories,
  assessmentId: string
) {
  const assessment = await repositories.assessments.getAssessment(assessmentId);

  if (!assessment || assessment.reviewStatus !== "Approved for student use") {
    throw new ApplicationError("resource_not_found");
  }

  return assessment;
}

function normaliseAssessmentAnswers(assessment: Assessment, answers: StudentAnswer[]) {
  let convertedAnswerCount = 0;

  return {
    convertedAnswerCount,
    answers: answers.map((answer) => {
      if (answer.type !== "numeric-engineering-calculation") {
        return answer;
      }

      const question = assessment.questions.find(
        (item) =>
          item.id === answer.questionId && item.type === "numeric-engineering-calculation"
      ) as NumericEngineeringQuestion | undefined;

      if (!question || answer.answer.unit === question.expectedAnswer.unit) {
        return answer;
      }

      const conversion = normaliseEngineeringAnswer(
        answer.answer,
        question.expectedAnswer.unit
      );

      if (!conversion.converted) {
        return answer;
      }

      convertedAnswerCount += 1;
      return {
        ...answer,
        answer: {
          value: conversion.value,
          unit: conversion.unit
        }
      };
    })
  };
}

function normaliseEngineeringAnswer(answer: UnitAwareAnswer, expectedUnit: string) {
  const quantity = quantityForUnit(expectedUnit);

  if (!quantity) {
    return { converted: false as const };
  }

  const conversion = convertToSi({
    quantity,
    value: answer.value,
    fromUnit: answer.unit,
    toUnit: expectedUnit
  });

  if (conversion.validity.status !== "valid" || conversion.calculatedValue === null) {
    return { converted: false as const };
  }

  return {
    converted: true as const,
    value: conversion.calculatedValue,
    unit: conversion.unit
  };
}

function quantityForUnit(unit: string) {
  switch (unit) {
    case "Pa":
      return "pressure";
    case "N":
      return "force";
    case "m^2":
      return "area";
    case "m^3":
      return "volume";
    case "s":
      return "time";
    case "W":
      return "power";
    case "J":
      return "energy";
    default:
      return undefined;
  }
}

function simulationScoreForMode(mode: SimulationMode, state: SimulationState) {
  if (mode === "assessment") {
    return state.assessmentScore ?? 0;
  }

  if (mode === "fault-diagnosis") {
    return state.activeFaultIds.length > 0 ? 1 : 0;
  }

  if (mode === "guided") {
    return state.validity.status === "valid" ? 1 : 0;
  }

  if (mode === "learn") {
    return state.status === "running" || state.status === "paused" ? 1 : 0;
  }

  return undefined;
}

function competencyAwardsForSimulation(
  mode: SimulationMode,
  score: number | undefined
): Partial<Record<CompetencyLevel, number>> {
  if (!score || score <= 0) {
    return {};
  }

  switch (mode) {
    case "learn":
      return { Introduced: 1 };
    case "guided":
      return { Operated: 1 };
    case "fault-diagnosis":
      return { Diagnosed: 1 };
    case "assessment":
      return { Operated: 1 };
    case "explore":
      return {};
  }
}

function summariseOutputs(state: SimulationState) {
  return {
    ...state.outputs,
    status: state.status,
    elapsedTimeSeconds: state.elapsedTimeSeconds,
    alarmCount: state.alarms.length
  };
}

function requireSubmittedAssessmentValue(value: number | undefined) {
  if (value === undefined || !Number.isFinite(value)) {
    throw new ApplicationError("invalid_input", {
      message: "Assessment mode simulation completion requires a finite submitted value."
    });
  }

  return value;
}

function createAttemptId(
  kind: "assessment" | "simulation",
  entityId: string,
  studentProfileId: string,
  attemptNumber = 1
) {
  return `${kind}-${entityId}-${studentProfileId}-${attemptNumber}`.replace(
    /[^a-zA-Z0-9-_]/g,
    "-"
  );
}
