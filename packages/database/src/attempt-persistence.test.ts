import { describe, expect, it } from "vitest";
import fluidPressureAssessment from "../../../content/assessments/fluid-pressure/basic-fluid-pressure-assessment.json";
import { hydraulicCylinderForceSimulation } from "@industrial-learn/simulation-engine";
import {
  createAttemptPersistenceServices,
  type AssessmentAttemptRepository,
  type AttemptAuditRepository,
  type AttemptPersistenceRepositories,
  type AttemptTransactionRunner,
  type Caller,
  type PersistedAssessmentAttempt,
  type PersistedSimulationAttempt,
  type SimulationAttemptRepository
} from "./index";
import type {
  Assessment,
  CompetencyLevel,
  StudentAnswer
} from "@industrial-learn/assessment-core";

const assessment = {
  ...(fluidPressureAssessment as Assessment),
  reviewStatus: "Approved for student use"
} satisfies Assessment;
const studentA = "11111111-1111-4111-8111-111111111111";
const studentB = "22222222-2222-4222-8222-222222222222";
const lessonId = "LES-FLUID-PRESSURE-001";
const simulationId = "SIM-HYD-CYL-FORCE-001";

function caller(profileId = studentA): Caller {
  return {
    kind: "authenticated",
    principal: {
      profileId,
      authUserId: profileId,
      email: `${profileId}@example.test`,
      roles: ["student"]
    }
  };
}

function createTestRepositories(options: { failCompetency?: boolean } = {}) {
  const assessmentAttempts = new Map<string, PersistedAssessmentAttempt>();
  const simulationAttempts = new Map<string, PersistedSimulationAttempt>();
  const auditEvents: string[] = [];
  const competencyEvents: Array<{
    studentProfileId: string;
    sourceAttemptId: string;
    awards: Partial<Record<CompetencyLevel, number>>;
  }> = [];
  const progressEvents: string[] = [];

  const assessmentRepository: AssessmentAttemptRepository = {
    getAssessment(assessmentId) {
      return Promise.resolve(assessmentId === assessment.id ? assessment : null);
    },
    getStartedAssessmentAttempt(input) {
      return Promise.resolve(
        Array.from(assessmentAttempts.values()).find(
          (attempt) =>
            attempt.studentProfileId === input.studentProfileId &&
            attempt.assessmentId === input.assessmentId &&
            attempt.attemptNumber === input.attemptNumber
        ) ?? null
      );
    },
    getAssessmentAttemptForReview(input) {
      return Promise.resolve(
        assessmentAttempts.get(key(input.studentProfileId, input.attemptId)) ?? null
      );
    },
    nextAssessmentAttemptNumber(input) {
      const count = Array.from(assessmentAttempts.values()).filter(
        (attempt) =>
          attempt.studentProfileId === input.studentProfileId &&
          attempt.assessmentId === input.assessmentId
      ).length;
      return Promise.resolve(count + 1);
    },
    createAssessmentAttempt(attempt) {
      assessmentAttempts.set(key(attempt.studentProfileId, attempt.id), attempt);
      return Promise.resolve(attempt);
    },
    updateAssessmentProgress(input) {
      const existing = assessmentAttempts.get(
        key(input.studentProfileId, input.attemptId)
      );
      if (!existing) {
        return Promise.reject(new Error("missing attempt"));
      }
      const updated = { ...existing, submittedAnswers: input.answers };
      assessmentAttempts.set(key(input.studentProfileId, input.attemptId), updated);
      return Promise.resolve(updated);
    },
    completeAssessmentAttempt(input) {
      const existing = assessmentAttempts.get(
        key(input.studentProfileId, input.attemptId)
      );
      if (!existing) {
        return Promise.reject(new Error("missing attempt"));
      }
      const updated: PersistedAssessmentAttempt = {
        ...existing,
        status: "graded",
        submittedAnswers: input.answers,
        scoringSummary: input.scoringSummary,
        competencyAwards: input.competencyAwards,
        idempotencyKey: input.idempotencyKey,
        submittedAt: input.submittedAt,
        gradedAt: input.submittedAt
      };
      assessmentAttempts.set(key(input.studentProfileId, input.attemptId), updated);
      return Promise.resolve(updated);
    },
    findCompletedAssessmentByIdempotency(input) {
      return Promise.resolve(
        Array.from(assessmentAttempts.values()).find(
          (attempt) =>
            attempt.studentProfileId === input.studentProfileId &&
            attempt.assessmentId === input.assessmentId &&
            attempt.idempotencyKey === input.idempotencyKey &&
            (attempt.status === "submitted" || attempt.status === "graded")
        ) ?? null
      );
    },
    recordCompetencyAwards(input) {
      if (options.failCompetency) {
        return Promise.reject(new Error("competency write failed"));
      }
      competencyEvents.push(input);
      return Promise.resolve();
    },
    updateLessonProgressFromAssessment(input) {
      progressEvents.push(input.sourceAttemptId);
      return Promise.resolve();
    }
  };

  const simulationRepository: SimulationAttemptRepository = {
    createSimulationAttempt(attempt) {
      simulationAttempts.set(key(attempt.studentProfileId, attempt.id), attempt);
      return Promise.resolve(attempt);
    },
    getSimulationAttempt(input) {
      return Promise.resolve(
        simulationAttempts.get(key(input.studentProfileId, input.attemptId)) ?? null
      );
    },
    findCompletedSimulationByIdempotency(input) {
      return Promise.resolve(
        Array.from(simulationAttempts.values()).find(
          (attempt) =>
            attempt.studentProfileId === input.studentProfileId &&
            attempt.simulationId === input.simulationId &&
            attempt.idempotencyKey === input.idempotencyKey &&
            (attempt.status === "submitted" || attempt.status === "graded")
        ) ?? null
      );
    },
    completeSimulationAttempt(input) {
      const existing = simulationAttempts.get(
        key(input.studentProfileId, input.attemptId)
      );
      if (!existing) {
        return Promise.reject(new Error("missing simulation attempt"));
      }
      const updated: PersistedSimulationAttempt = {
        ...existing,
        status: input.status,
        completedAt: input.completedAt,
        inputState: input.inputState,
        outputSummary: input.outputSummary,
        faultIntroduced: input.faultIntroduced,
        measurementsTaken: input.measurementsTaken,
        diagnosisSubmitted: input.diagnosisSubmitted,
        score: input.score,
        competencyAwards: input.competencyAwards,
        idempotencyKey: input.idempotencyKey
      };
      simulationAttempts.set(key(input.studentProfileId, input.attemptId), updated);
      return Promise.resolve(updated);
    },
    recordCompetencyAwards(input) {
      if (options.failCompetency) {
        return Promise.reject(new Error("competency write failed"));
      }
      competencyEvents.push(input);
      return Promise.resolve();
    },
    updateLessonProgressFromSimulation(input) {
      progressEvents.push(input.sourceAttemptId);
      return Promise.resolve();
    }
  };

  const auditRepository: AttemptAuditRepository = {
    recordEvent(input) {
      auditEvents.push(input.action);
      return Promise.resolve();
    }
  };

  const transactionRunner: AttemptTransactionRunner = {
    async transaction(operation) {
      const assessmentSnapshot = new Map(assessmentAttempts);
      const simulationSnapshot = new Map(simulationAttempts);
      const auditSnapshot = [...auditEvents];
      const competencySnapshot = [...competencyEvents];
      const progressSnapshot = [...progressEvents];
      try {
        return await operation();
      } catch (error) {
        assessmentAttempts.clear();
        for (const [snapshotKey, value] of assessmentSnapshot) {
          assessmentAttempts.set(snapshotKey, value);
        }
        simulationAttempts.clear();
        for (const [snapshotKey, value] of simulationSnapshot) {
          simulationAttempts.set(snapshotKey, value);
        }
        auditEvents.splice(0, auditEvents.length, ...auditSnapshot);
        competencyEvents.splice(0, competencyEvents.length, ...competencySnapshot);
        progressEvents.splice(0, progressEvents.length, ...progressSnapshot);
        throw error;
      }
    }
  };

  const repositories: AttemptPersistenceRepositories = {
    assessments: assessmentRepository,
    simulations: simulationRepository,
    audit: auditRepository,
    transactions: transactionRunner
  };

  return {
    repositories,
    assessmentAttempts,
    simulationAttempts,
    auditEvents,
    competencyEvents,
    progressEvents
  };
}

describe("assessment attempt persistence", () => {
  it("starts an authenticated assessment attempt", async () => {
    const { repositories } = createTestRepositories();
    const services = createAttemptPersistenceServices(repositories);

    const attempt = await services.startAssessmentAttempt(
      { caller: caller() },
      { assessmentId: assessment.id, contentVersion: 1 }
    );

    expect(attempt.studentProfileId).toBe(studentA);
    expect(attempt.attemptNumber).toBe(1);
    expect(attempt.status).toBe("in_progress");
  });

  it("does not expose hidden answers before submission", async () => {
    const { repositories } = createTestRepositories();
    const services = createAttemptPersistenceServices(repositories);
    const delivered = await services.deliverAssessmentForStudent(
      { caller: caller() },
      { assessmentId: assessment.id, mode: "assessment" }
    );

    expect(JSON.stringify(delivered)).not.toContain("correctChoiceId");
    expect(JSON.stringify(delivered)).not.toContain("expectedAnswer");
    expect(JSON.stringify(delivered)).not.toContain("explanation");
  });

  it("submits valid answers, calculates server score, and records audit and competency", async () => {
    const { repositories, auditEvents, competencyEvents, progressEvents } =
      createTestRepositories();
    const services = createAttemptPersistenceServices(repositories);
    const started = await services.startAssessmentAttempt(
      { caller: caller() },
      { assessmentId: assessment.id, contentVersion: 1 }
    );

    const completed = await services.submitAssessmentAttempt(
      { caller: caller() },
      {
        attemptId: started.id,
        studentProfileId: studentA,
        idempotencyKey: "submit-1",
        clientScore: 999,
        clientCompetencyAwards: { Designed: 999 },
        clientContentVersion: 999,
        answers: correctAnswers()
      }
    );

    expect(completed.scoringSummary?.earnedPoints).toBe(12);
    expect(completed.competencyAwards.Designed).toBe(2);
    expect(completed.contentVersion).toBe(1);
    expect(auditEvents).toEqual(["assessment_attempt_completed"]);
    expect(competencyEvents).toHaveLength(1);
    expect(progressEvents).toEqual([started.id]);
  });

  it("supports explicit unit conversion but rejects dimensionally wrong units", async () => {
    const { repositories } = createTestRepositories();
    const services = createAttemptPersistenceServices(repositories);
    const started = await services.startAssessmentAttempt(
      { caller: caller() },
      { assessmentId: assessment.id, contentVersion: 1 }
    );

    const converted = await services.submitAssessmentAttempt(
      { caller: caller() },
      {
        attemptId: started.id,
        studentProfileId: studentA,
        idempotencyKey: "submit-converted",
        answers: [
          {
            questionId: "Q-FP-NUM-001",
            type: "numeric-engineering-calculation",
            answer: { value: 0.4, unit: "kPa" }
          }
        ]
      }
    );
    const numericResult = converted.scoringSummary?.questionResults.find(
      (result) => result.questionId === "Q-FP-NUM-001"
    );

    expect(converted.submittedAnswers[0]).toMatchObject({
      answer: { value: 0.4, unit: "kPa" }
    });
    expect(converted.scoringSummary?.answers[0]).toMatchObject({
      answer: { value: 400, unit: "Pa" }
    });
    expect(numericResult?.earnedPoints).toBe(2);

    const second = await services.startAssessmentAttempt(
      { caller: caller() },
      { assessmentId: assessment.id, contentVersion: 1 }
    );
    const wrongUnit = await services.submitAssessmentAttempt(
      { caller: caller() },
      {
        attemptId: second.id,
        studentProfileId: studentA,
        idempotencyKey: "submit-wrong-unit",
        answers: [
          {
            questionId: "Q-FP-NUM-001",
            type: "numeric-engineering-calculation",
            answer: { value: 400, unit: "N" }
          }
        ]
      }
    );

    expect(
      wrongUnit.scoringSummary?.questionResults.find(
        (result) => result.questionId === "Q-FP-NUM-001"
      )?.errors[0]
    ).toContain("Unit must be Pa");
  });

  it("prevents duplicate and completed attempt mutation", async () => {
    const { repositories, auditEvents } = createTestRepositories();
    const services = createAttemptPersistenceServices(repositories);
    const started = await services.startAssessmentAttempt(
      { caller: caller() },
      { assessmentId: assessment.id, contentVersion: 1 }
    );

    const first = await services.submitAssessmentAttempt(
      { caller: caller() },
      {
        attemptId: started.id,
        studentProfileId: studentA,
        idempotencyKey: "same-submit",
        answers: correctAnswers()
      }
    );
    const duplicate = await services.submitAssessmentAttempt(
      { caller: caller() },
      {
        attemptId: started.id,
        studentProfileId: studentA,
        idempotencyKey: "same-submit",
        answers: []
      }
    );

    expect(duplicate).toBe(first);
    expect(auditEvents).toHaveLength(1);
    await expect(
      services.saveAssessmentProgress(
        { caller: caller() },
        { attemptId: started.id, studentProfileId: studentA, answers: [] }
      )
    ).rejects.toMatchObject({ code: "conflict" });
  });

  it("denies cross-student assessment submission and rolls back partial completion", async () => {
    const failing = createTestRepositories({ failCompetency: true });
    const services = createAttemptPersistenceServices(failing.repositories);
    const started = await services.startAssessmentAttempt(
      { caller: caller() },
      { assessmentId: assessment.id, contentVersion: 1 }
    );

    await expect(
      services.submitAssessmentAttempt(
        { caller: caller(studentB) },
        {
          attemptId: started.id,
          studentProfileId: studentA,
          idempotencyKey: "cross-student",
          answers: correctAnswers()
        }
      )
    ).rejects.toMatchObject({ code: "access_denied" });

    await expect(
      services.submitAssessmentAttempt(
        { caller: caller() },
        {
          attemptId: started.id,
          studentProfileId: studentA,
          idempotencyKey: "rollback",
          answers: correctAnswers()
        }
      )
    ).rejects.toMatchObject({ code: "unexpected_server_error" });

    expect(failing.assessmentAttempts.get(key(studentA, started.id))?.status).toBe(
      "in_progress"
    );
    expect(failing.auditEvents).toEqual([]);
  });
});

describe("simulation attempt persistence", () => {
  it("starts and completes guided simulation attempts with competency", async () => {
    const { repositories, competencyEvents } = createTestRepositories();
    const services = createAttemptPersistenceServices(repositories);
    const started = await services.startSimulationAttempt(
      { caller: caller() },
      {
        simulationId,
        lessonId,
        mode: "guided",
        simulationVersion: 1
      }
    );
    const finalState = hydraulicCylinderForceSimulation.start(
      hydraulicCylinderForceSimulation.createInitialState("guided")
    );

    const completed = await services.completeSimulationAttempt(
      { caller: caller() },
      {
        attemptId: started.id,
        studentProfileId: studentA,
        finalState,
        idempotencyKey: "guided-complete"
      }
    );

    expect(completed.status).toBe("submitted");
    expect(completed.competencyAwards.Operated).toBe(1);
    expect(competencyEvents[0]?.awards.Operated).toBe(1);
  });

  it("records fault diagnosis summaries without animation-frame history", async () => {
    const { repositories } = createTestRepositories();
    const services = createAttemptPersistenceServices(repositories);
    const started = await services.startSimulationAttempt(
      { caller: caller() },
      { simulationId, lessonId, mode: "fault-diagnosis", simulationVersion: 1 }
    );
    const finalState = hydraulicCylinderForceSimulation.injectFault(
      hydraulicCylinderForceSimulation.start(
        hydraulicCylinderForceSimulation.createInitialState("fault-diagnosis")
      ),
      "seal-leak"
    );

    const completed = await services.completeSimulationAttempt(
      { caller: caller() },
      {
        attemptId: started.id,
        studentProfileId: studentA,
        finalState,
        diagnosisSubmitted: { faultId: "seal-leak" },
        idempotencyKey: "fault-complete"
      }
    );

    expect(completed.faultIntroduced).toBe("seal-leak");
    expect(completed.measurementsTaken.length).toBeGreaterThan(0);
    expect(completed.measurementsTaken.length).toBeLessThanOrEqual(20);
    expect(completed.competencyAwards.Diagnosed).toBe(1);
  });

  it("rejects invalid simulation IDs, duplicate completion, and cross-student access", async () => {
    const { repositories } = createTestRepositories();
    const services = createAttemptPersistenceServices(repositories);

    await expect(
      services.startSimulationAttempt(
        { caller: caller() },
        {
          simulationId: "unsupported",
          lessonId,
          mode: "guided",
          simulationVersion: 1
        }
      )
    ).rejects.toMatchObject({ code: "resource_not_found" });

    const started = await services.startSimulationAttempt(
      { caller: caller() },
      { simulationId, lessonId, mode: "guided", simulationVersion: 1 }
    );
    const finalState = hydraulicCylinderForceSimulation.start(
      hydraulicCylinderForceSimulation.createInitialState("guided")
    );
    const first = await services.completeSimulationAttempt(
      { caller: caller() },
      {
        attemptId: started.id,
        studentProfileId: studentA,
        finalState,
        idempotencyKey: "duplicate-simulation"
      }
    );
    const duplicate = await services.completeSimulationAttempt(
      { caller: caller() },
      {
        attemptId: started.id,
        studentProfileId: studentA,
        finalState,
        idempotencyKey: "duplicate-simulation"
      }
    );

    expect(duplicate).toBe(first);
    await expect(
      services.completeSimulationAttempt(
        { caller: caller(studentB) },
        {
          attemptId: started.id,
          studentProfileId: studentA,
          finalState,
          idempotencyKey: "cross-student-simulation"
        }
      )
    ).rejects.toMatchObject({ code: "access_denied" });
  });

  it("does not create false completion on reset and scores assessment mode", async () => {
    const { repositories } = createTestRepositories();
    const services = createAttemptPersistenceServices(repositories);
    const resetState = hydraulicCylinderForceSimulation.reset(
      hydraulicCylinderForceSimulation.start(
        hydraulicCylinderForceSimulation.createInitialState("assessment")
      )
    );
    const started = await services.startSimulationAttempt(
      { caller: caller() },
      { simulationId, lessonId, mode: "assessment", simulationVersion: 1 }
    );

    expect(resetState.assessmentScore).toBeNull();

    const completed = await services.completeSimulationAttempt(
      { caller: caller() },
      {
        attemptId: started.id,
        studentProfileId: studentA,
        finalState: hydraulicCylinderForceSimulation.start(
          hydraulicCylinderForceSimulation.createInitialState("assessment")
        ),
        submittedAssessmentValue: 10_000,
        idempotencyKey: "assessment-simulation"
      }
    );

    expect(completed.score).toBe(1);
    expect(completed.competencyAwards.Operated).toBe(1);
  });
});

function correctAnswers(): StudentAnswer[] {
  return [
    { questionId: "Q-FP-MCQ-001", type: "multiple-choice", choiceId: "A" },
    {
      questionId: "Q-FP-NUM-001",
      type: "numeric-engineering-calculation",
      answer: { value: 400.2, unit: "Pa" }
    },
    {
      questionId: "Q-FP-COMP-001",
      type: "component-identification",
      componentIds: ["area", "force"]
    },
    {
      questionId: "Q-FP-DIAGRAM-001",
      type: "diagram-question",
      labelIds: ["F", "A"]
    },
    {
      questionId: "Q-FP-SEQ-001",
      type: "sequence-question",
      stepOrder: ["check-units", "substitute", "interpret"]
    },
    {
      questionId: "Q-FP-SIM-001",
      type: "simulation-task",
      measurements: { cylinderForce: { value: 10_000.5, unit: "N" } }
    },
    {
      questionId: "Q-FP-FAULT-001",
      type: "fault-diagnosis",
      faultId: "seal-leak",
      evidenceIds: ["force-below-pressure-area-prediction"]
    },
    {
      questionId: "Q-FP-DESIGN-001",
      type: "design-challenge",
      rubricAwardedPoints: { "safety-boundary": 1, "review-boundary": 1 }
    }
  ];
}

function key(studentProfileId: string, attemptId: string) {
  return `${studentProfileId}:${attemptId}`;
}
