export const COMPETENCY_LEVELS = [
  "Introduced",
  "Understood",
  "Calculated",
  "Operated",
  "Diagnosed",
  "Designed"
] as const;

export type CompetencyLevel = (typeof COMPETENCY_LEVELS)[number];

export type AssessmentQuestionType =
  | "multiple-choice"
  | "numeric-engineering-calculation"
  | "component-identification"
  | "diagram-question"
  | "sequence-question"
  | "simulation-task"
  | "fault-diagnosis"
  | "design-challenge";

export type AssessmentMode = "practice" | "assessment";

export type UnitAwareAnswer = {
  value: number;
  unit: string;
};

export type Choice = {
  id: string;
  text: string;
};

export type QuestionBase = {
  id: string;
  type: AssessmentQuestionType;
  prompt: string;
  learningOutcomeIds: string[];
  competencyLevel: CompetencyLevel;
  points: number;
  explanation: string;
  sourceIds: string[];
};

export type MultipleChoiceQuestion = QuestionBase & {
  type: "multiple-choice";
  choices: Choice[];
  correctChoiceId: string;
};

export type NumericEngineeringQuestion = QuestionBase & {
  type: "numeric-engineering-calculation";
  expectedAnswer: UnitAwareAnswer;
  tolerance: {
    absolute: number;
  };
  equationId: string;
};

export type ComponentIdentificationQuestion = QuestionBase & {
  type: "component-identification";
  components: Choice[];
  correctComponentIds: string[];
};

export type DiagramQuestion = QuestionBase & {
  type: "diagram-question";
  diagramId: string;
  altText: string;
  correctLabelIds: string[];
};

export type SequenceQuestion = QuestionBase & {
  type: "sequence-question";
  steps: Choice[];
  correctStepOrder: string[];
};

export type SimulationTaskQuestion = QuestionBase & {
  type: "simulation-task";
  simulationId: string;
  assessmentModeHiddenHints: string[];
  expectedMeasurements: Record<string, UnitAwareAnswer>;
  tolerance: {
    absolute: number;
  };
};

export type FaultDiagnosisQuestion = QuestionBase & {
  type: "fault-diagnosis";
  faultOptions: Choice[];
  correctFaultId: string;
  diagnosticEvidenceIds: string[];
};

export type DesignChallengeQuestion = QuestionBase & {
  type: "design-challenge";
  rubric: Array<{
    id: string;
    description: string;
    points: number;
  }>;
};

export type AssessmentQuestion =
  | MultipleChoiceQuestion
  | NumericEngineeringQuestion
  | ComponentIdentificationQuestion
  | DiagramQuestion
  | SequenceQuestion
  | SimulationTaskQuestion
  | FaultDiagnosisQuestion
  | DesignChallengeQuestion;

export type Assessment = {
  id: string;
  lessonId: string;
  title: string;
  learningOutcomeIds: string[];
  questions: AssessmentQuestion[];
  sourceIds: string[];
  reviewStatus: string;
};

export type StudentAnswer =
  | { questionId: string; type: "multiple-choice"; choiceId: string }
  | {
      questionId: string;
      type: "numeric-engineering-calculation";
      answer: UnitAwareAnswer;
    }
  | { questionId: string; type: "component-identification"; componentIds: string[] }
  | { questionId: string; type: "diagram-question"; labelIds: string[] }
  | { questionId: string; type: "sequence-question"; stepOrder: string[] }
  | {
      questionId: string;
      type: "simulation-task";
      measurements: Record<string, UnitAwareAnswer>;
    }
  | {
      questionId: string;
      type: "fault-diagnosis";
      faultId: string;
      evidenceIds: string[];
    }
  | {
      questionId: string;
      type: "design-challenge";
      rubricAwardedPoints: Record<string, number>;
    };

export type QuestionResult = {
  questionId: string;
  type: AssessmentQuestionType;
  earnedPoints: number;
  maxPoints: number;
  correct: boolean;
  explanation: string;
  competencyLevel: CompetencyLevel;
  learningOutcomeIds: string[];
  errors: string[];
};

export type AssessmentAttempt = {
  id: string;
  assessmentId: string;
  studentId: string;
  submittedAt: string;
  status: "completed";
  answers: StudentAnswer[];
  questionResults: QuestionResult[];
  earnedPoints: number;
  maxPoints: number;
  competencyProgress: Partial<Record<CompetencyLevel, number>>;
};

export type DeliveredAssessment = Omit<Assessment, "questions"> & {
  questions: DeliveredQuestion[];
};

export type DeliveredQuestion = Omit<
  AssessmentQuestion,
  | "correctChoiceId"
  | "expectedAnswer"
  | "correctComponentIds"
  | "correctLabelIds"
  | "correctStepOrder"
  | "expectedMeasurements"
  | "correctFaultId"
  | "diagnosticEvidenceIds"
  | "rubric"
  | "explanation"
  | "simulationId"
  | "assessmentModeHiddenHints"
> & {
  assessmentModeHiddenHints?: never;
};

export type AttemptStore = {
  recordAttempt: (attempt: AssessmentAttempt) => void;
  getCompletedAttempt: (
    studentId: string,
    attemptId: string
  ) => AssessmentAttempt | undefined;
};

export function createInMemoryAttemptStore(): AttemptStore {
  const attempts = new Map<string, AssessmentAttempt>();

  return {
    recordAttempt(attempt) {
      attempts.set(`${attempt.studentId}:${attempt.id}`, attempt);
    },
    getCompletedAttempt(studentId, attemptId) {
      return attempts.get(`${studentId}:${attemptId}`);
    }
  };
}

export function deliverAssessment(
  assessment: Assessment,
  mode: AssessmentMode
): DeliveredAssessment {
  return {
    ...assessment,
    questions: assessment.questions.map((question) => sanitizeQuestion(question, mode))
  };
}

export function submitAssessment({
  assessment,
  studentId,
  answers,
  submittedAt = new Date().toISOString(),
  attemptId = `ATT-${assessment.id}-${studentId}-${submittedAt}`
}: {
  assessment: Assessment;
  studentId: string;
  answers: StudentAnswer[];
  submittedAt?: string;
  attemptId?: string;
}): AssessmentAttempt {
  const questionResults = assessment.questions.map((question) =>
    scoreQuestion(
      question,
      answers.find((answer) => answer.questionId === question.id)
    )
  );
  const earnedPoints = questionResults.reduce(
    (total, result) => total + result.earnedPoints,
    0
  );
  const maxPoints = questionResults.reduce(
    (total, result) => total + result.maxPoints,
    0
  );

  return {
    id: attemptId,
    assessmentId: assessment.id,
    studentId,
    submittedAt,
    status: "completed",
    answers,
    questionResults,
    earnedPoints,
    maxPoints,
    competencyProgress: competencyProgress(questionResults)
  };
}

export function recordCompletedAttempt(store: AttemptStore, attempt: AssessmentAttempt) {
  store.recordAttempt(attempt);
}

export function reviewCompletedAttempt(
  store: AttemptStore,
  studentId: string,
  attemptId: string
) {
  return store.getCompletedAttempt(studentId, attemptId);
}

export function openingAssessmentProgressAward() {
  return 0;
}

function sanitizeQuestion(
  question: AssessmentQuestion,
  mode: AssessmentMode
): DeliveredQuestion {
  const safeQuestion: Record<string, unknown> = { ...question };

  delete safeQuestion.correctChoiceId;
  delete safeQuestion.expectedAnswer;
  delete safeQuestion.correctComponentIds;
  delete safeQuestion.correctLabelIds;
  delete safeQuestion.correctStepOrder;
  delete safeQuestion.expectedMeasurements;
  delete safeQuestion.correctFaultId;
  delete safeQuestion.diagnosticEvidenceIds;
  delete safeQuestion.rubric;
  delete safeQuestion.explanation;
  delete safeQuestion.simulationId;

  if (mode === "assessment") {
    delete safeQuestion.assessmentModeHiddenHints;
  }

  if (mode === "assessment" && safeQuestion.type === "simulation-task") {
    return safeQuestion as DeliveredQuestion;
  }

  return safeQuestion as DeliveredQuestion;
}

function scoreQuestion(
  question: AssessmentQuestion,
  answer: StudentAnswer | undefined
): QuestionResult {
  if (!answer) {
    return result(question, 0, ["No answer submitted."]);
  }

  if (answer.type !== question.type) {
    return result(question, 0, [
      `Answer type ${answer.type} does not match question type ${question.type}.`
    ]);
  }

  switch (question.type) {
    case "multiple-choice": {
      const typedAnswer = answer as Extract<StudentAnswer, { type: "multiple-choice" }>;
      return result(
        question,
        typedAnswer.choiceId === question.correctChoiceId ? question.points : 0
      );
    }
    case "numeric-engineering-calculation": {
      const typedAnswer = answer as Extract<
        StudentAnswer,
        { type: "numeric-engineering-calculation" }
      >;
      return scoreNumeric(question, typedAnswer.answer);
    }
    case "component-identification": {
      const typedAnswer = answer as Extract<
        StudentAnswer,
        { type: "component-identification" }
      >;
      return result(
        question,
        sameSet(typedAnswer.componentIds, question.correctComponentIds)
          ? question.points
          : 0
      );
    }
    case "diagram-question": {
      const typedAnswer = answer as Extract<StudentAnswer, { type: "diagram-question" }>;
      return result(
        question,
        sameSet(typedAnswer.labelIds, question.correctLabelIds) ? question.points : 0
      );
    }
    case "sequence-question": {
      const typedAnswer = answer as Extract<StudentAnswer, { type: "sequence-question" }>;
      return result(
        question,
        sameOrder(typedAnswer.stepOrder, question.correctStepOrder) ? question.points : 0
      );
    }
    case "simulation-task": {
      const typedAnswer = answer as Extract<StudentAnswer, { type: "simulation-task" }>;
      return scoreSimulationTask(question, typedAnswer.measurements);
    }
    case "fault-diagnosis": {
      const typedAnswer = answer as Extract<StudentAnswer, { type: "fault-diagnosis" }>;
      return result(
        question,
        typedAnswer.faultId === question.correctFaultId &&
          sameSet(typedAnswer.evidenceIds, question.diagnosticEvidenceIds)
          ? question.points
          : 0
      );
    }
    case "design-challenge": {
      const typedAnswer = answer as Extract<StudentAnswer, { type: "design-challenge" }>;
      return scoreDesignChallenge(question, typedAnswer.rubricAwardedPoints);
    }
  }
}

function scoreNumeric(question: NumericEngineeringQuestion, answer: UnitAwareAnswer) {
  const unitErrors = validateUnit(answer.unit, question.expectedAnswer.unit);
  if (unitErrors.length > 0) {
    return result(question, 0, unitErrors);
  }

  const withinTolerance =
    Math.abs(answer.value - question.expectedAnswer.value) <= question.tolerance.absolute;
  return result(
    question,
    withinTolerance ? question.points : 0,
    withinTolerance
      ? []
      : [
          `Expected ${question.expectedAnswer.value} ${question.expectedAnswer.unit} within ${question.tolerance.absolute}.`
        ]
  );
}

function scoreSimulationTask(
  question: SimulationTaskQuestion,
  measurements: Record<string, UnitAwareAnswer>
) {
  const errors: string[] = [];
  let allWithinTolerance = true;

  for (const [measurementId, expected] of Object.entries(question.expectedMeasurements)) {
    const submitted = measurements[measurementId];
    if (!submitted) {
      errors.push(`Missing measurement ${measurementId}.`);
      allWithinTolerance = false;
      continue;
    }

    const unitErrors = validateUnit(submitted.unit, expected.unit);
    if (unitErrors.length > 0) {
      errors.push(...unitErrors.map((error) => `${measurementId}: ${error}`));
      allWithinTolerance = false;
      continue;
    }

    if (Math.abs(submitted.value - expected.value) > question.tolerance.absolute) {
      errors.push(`Measurement ${measurementId} is outside tolerance.`);
      allWithinTolerance = false;
    }
  }

  return result(question, allWithinTolerance ? question.points : 0, errors);
}

function scoreDesignChallenge(
  question: DesignChallengeQuestion,
  awardedPoints: Record<string, number>
) {
  const errors: string[] = [];
  const earnedPoints = question.rubric.reduce((total, criterion) => {
    const awarded = awardedPoints[criterion.id] ?? 0;
    if (!Number.isFinite(awarded) || awarded < 0 || awarded > criterion.points) {
      errors.push(
        `Rubric criterion ${criterion.id} must be between 0 and ${criterion.points}.`
      );
      return total;
    }
    return total + awarded;
  }, 0);

  return result(question, errors.length > 0 ? 0 : earnedPoints, errors);
}

function result(
  question: AssessmentQuestion,
  earnedPoints: number,
  errors: string[] = []
): QuestionResult {
  return {
    questionId: question.id,
    type: question.type,
    earnedPoints,
    maxPoints: question.points,
    correct: earnedPoints === question.points,
    explanation: question.explanation,
    competencyLevel: question.competencyLevel,
    learningOutcomeIds: question.learningOutcomeIds,
    errors
  };
}

function competencyProgress(questionResults: QuestionResult[]) {
  return questionResults.reduce<Partial<Record<CompetencyLevel, number>>>(
    (progress, item) => {
      const current = progress[item.competencyLevel] ?? 0;
      return { ...progress, [item.competencyLevel]: current + item.earnedPoints };
    },
    {}
  );
}

function validateUnit(actualUnit: string, expectedUnit: string) {
  return actualUnit === expectedUnit
    ? []
    : [`Unit must be ${expectedUnit}; received ${actualUnit}.`];
}

function sameSet(actual: string[], expected: string[]) {
  return (
    actual.length === expected.length && expected.every((item) => actual.includes(item))
  );
}

function sameOrder(actual: string[], expected: string[]) {
  return (
    actual.length === expected.length &&
    expected.every((item, index) => actual[index] === item)
  );
}
