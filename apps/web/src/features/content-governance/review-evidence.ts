import "server-only";

import assessment from "../../../../../content/assessments/fluid-pressure/basic-fluid-pressure-assessment.json";
import openStax from "../../../../../sources/fluid-pressure/openstax-college-physics.json";
import pennState from "../../../../../sources/fluid-pressure/penn-state-pressure-basics.json";

export type ReviewSourceEvidence = {
  id: string;
  title: string;
  publisher: string;
  author: string;
  edition: string;
  version: string;
  sections: string[];
  pages: string[];
  reliability: string;
  accessStatus: string;
  viewUrl?: string;
};

export type ReviewAssessmentQuestion = {
  id: string;
  learningOutcomes: string[];
  prompt: string;
  expectedAnswer: string;
  explanation: string;
  unitsAndTolerance: string;
  competency: string;
};

export function getBasicPressureReviewEvidence() {
  return {
    sources: [openStax, pennState].map((source): ReviewSourceEvidence => ({
      id: source.id,
      title: source.title,
      publisher: source.organisation,
      author: source.author,
      edition: source.edition,
      version: source.version,
      sections: source.relevantSections,
      pages: source.relevantPages,
      reliability: `Level ${source.authorityLevel}: ${source.authorityCategory}`,
      accessStatus: source.copyrightStatus,
      ...(source.rights.studentMayOpenDirectly ? { viewUrl: source.url } : {})
    })),
    assessment: assessment.questions.map((question): ReviewAssessmentQuestion => ({
      id: question.id,
      learningOutcomes: question.learningOutcomeIds,
      prompt: question.prompt,
      expectedAnswer: expectedAnswer(question),
      explanation: question.explanation,
      unitsAndTolerance: question.expectedAnswer
        ? `${question.expectedAnswer.unit}; absolute tolerance ${question.tolerance?.absolute ?? "not recorded"}`
        : "Not a numeric response",
      competency: question.competencyLevel
    }))
  };
}

function expectedAnswer(question: (typeof assessment.questions)[number]) {
  if (question.expectedAnswer) {
    return `${question.expectedAnswer.value} ${question.expectedAnswer.unit}`;
  }
  if (question.correctChoiceId) {
    const choice = question.choices?.find(
      (candidate) => candidate.id === question.correctChoiceId
    );
    return choice ? `${choice.id}: ${choice.text}` : question.correctChoiceId;
  }
  if (question.correctLabelIds) {
    return question.correctLabelIds.join(", ");
  }
  return "No reviewed expected answer is registered.";
}
