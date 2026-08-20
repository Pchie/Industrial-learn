import type {
  Choice,
  DeliveredAssessment,
  DeliveredQuestion,
  StudentAnswer
} from "@industrial-learn/assessment-core";

type VisibleSequenceQuestion = DeliveredQuestion & { steps: Choice[] };

export type ParsedAssessmentAnswers = {
  answers: StudentAnswer[];
  missingQuestionIds: string[];
  invalidMessages: string[];
};

export function parseAssessmentAnswers(
  assessment: DeliveredAssessment,
  formData: FormData,
  options: { requireComplete: boolean }
): ParsedAssessmentAnswers {
  const answers: StudentAnswer[] = [];
  const missingQuestionIds: string[] = [];
  const invalidMessages: string[] = [];

  for (const question of assessment.questions) {
    const answer = parseQuestionAnswer(question, formData);

    if (answer.invalidMessage) {
      invalidMessages.push(answer.invalidMessage);
    }

    if (answer.answer) {
      answers.push(answer.answer);
      continue;
    }

    if (options.requireComplete) {
      missingQuestionIds.push(question.id);
    }
  }

  return { answers, missingQuestionIds, invalidMessages };
}

function parseQuestionAnswer(
  question: DeliveredQuestion,
  formData: FormData
): {
  answer?: StudentAnswer | undefined;
  invalidMessage?: string | undefined;
} {
  switch (question.type) {
    case "multiple-choice": {
      const choiceId = textValue(formData.get(field(question.id)));
      return choiceId
        ? { answer: { questionId: question.id, type: question.type, choiceId } }
        : {};
    }
    case "numeric-engineering-calculation": {
      const value = numberValue(formData.get(field(question.id, "value")));
      const unit = textValue(formData.get(field(question.id, "unit")));
      if (value === undefined && !unit) {
        return {};
      }
      if (value === undefined || !unit) {
        return { invalidMessage: `${question.id} requires a numeric value and unit.` };
      }
      return {
        answer: {
          questionId: question.id,
          type: question.type,
          answer: { value, unit }
        }
      };
    }
    case "component-identification": {
      const componentIds = stringValues(formData.getAll(field(question.id)));
      return componentIds.length > 0
        ? { answer: { questionId: question.id, type: question.type, componentIds } }
        : {};
    }
    case "diagram-question": {
      const labelIds = stringValues(formData.getAll(field(question.id)));
      return labelIds.length > 0
        ? { answer: { questionId: question.id, type: question.type, labelIds } }
        : {};
    }
    case "sequence-question": {
      const sequenceQuestion = question as VisibleSequenceQuestion;
      const stepOrder = sequenceQuestion.steps
        .map((_, index) => textValue(formData.get(field(question.id, `step-${index}`))))
        .filter((value): value is string => Boolean(value));
      return stepOrder.length > 0
        ? { answer: { questionId: question.id, type: question.type, stepOrder } }
        : {};
    }
    case "simulation-task": {
      const value = numberValue(
        formData.get(field(question.id, "measurement-cylinderForce-value"))
      );
      const unit = textValue(
        formData.get(field(question.id, "measurement-cylinderForce-unit"))
      );
      if (value === undefined && !unit) {
        return {};
      }
      if (value === undefined || !unit) {
        return {
          invalidMessage: `${question.id} requires the measured force value and unit.`
        };
      }
      return {
        answer: {
          questionId: question.id,
          type: question.type,
          measurements: { cylinderForce: { value, unit } }
        }
      };
    }
    case "fault-diagnosis": {
      const faultId = textValue(formData.get(field(question.id, "fault")));
      const evidenceIds = stringValues(formData.getAll(field(question.id, "evidence")));
      if (!faultId && evidenceIds.length === 0) {
        return {};
      }
      if (!faultId) {
        return { invalidMessage: `${question.id} requires a fault selection.` };
      }
      return {
        answer: {
          questionId: question.id,
          type: question.type,
          faultId,
          evidenceIds
        }
      };
    }
    case "design-challenge": {
      const response = textValue(formData.get(field(question.id, "response")));
      return response
        ? {
            answer: {
              questionId: question.id,
              type: question.type,
              rubricAwardedPoints: {}
            }
          }
        : {};
    }
  }
}

export function field(questionId: string, suffix?: string) {
  return suffix ? `answer-${questionId}-${suffix}` : `answer-${questionId}`;
}

function textValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function stringValues(values: FormDataEntryValue[]) {
  return values
    .map((value) => (typeof value === "string" ? value.trim() : ""))
    .filter(Boolean);
}

function numberValue(value: FormDataEntryValue | null) {
  const text = textValue(value);
  if (!text) {
    return undefined;
  }

  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : undefined;
}
