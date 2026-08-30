import Link from "next/link";
import type {
  Assessment,
  Choice,
  DeliveredQuestion,
  QuestionResult,
  StudentAnswer
} from "@industrial-learn/assessment-core";

import { field } from "./answers";
import {
  resultForQuestion,
  type AssessmentOverview,
  type AssessmentSummary,
  type AttemptPageModel,
  type ReviewPageModel
} from "./server";
import {
  saveAssessmentProgressAction,
  startAssessmentAction,
  submitAssessmentAction
} from "./actions";

type VisibleMultipleChoiceQuestion = DeliveredQuestion & { choices: Choice[] };
type VisibleComponentQuestion = DeliveredQuestion & { components: Choice[] };
type VisibleDiagramQuestion = DeliveredQuestion & {
  altText: string;
  labels: Array<{ id: string; text: string }>;
};
type VisibleSequenceQuestion = DeliveredQuestion & { steps: Choice[] };
type VisibleFaultQuestion = DeliveredQuestion & { faultOptions: Choice[] };

export function AssessmentList({ assessments }: { assessments: AssessmentSummary[] }) {
  return (
    <div className="assessment-shell">
      <header className="assessment-hero">
        <p className="eyebrow">Authenticated assessments</p>
        <h1>Assessments</h1>
        <p>
          Start, resume, submit, and review graded checks. Scores are calculated on the
          trusted server after submission.
        </p>
      </header>

      {assessments.length === 0 ? (
        <section className="assessment-card">
          <h2>No assessments available</h2>
          <p>Published and engineering-reviewed assessments will appear here.</p>
        </section>
      ) : (
        <section className="assessment-grid" aria-label="Available assessments">
          {assessments.map((assessment) => (
            <article className="assessment-card" key={assessment.slug}>
              <div className="assessment-card__meta">
                <span>{assessment.moduleTitle}</span>
                <span>{assessment.estimatedMinutes} min</span>
              </div>
              <h2>{assessment.title}</h2>
              <p>{assessment.description}</p>
              <dl className="assessment-facts">
                <div>
                  <dt>Review</dt>
                  <dd>{assessment.reviewStatus}</dd>
                </div>
                <div>
                  <dt>Latest attempt</dt>
                  <dd>{assessment.latestAttempt?.status ?? "Not started"}</dd>
                </div>
              </dl>
              <Link
                className="button button--primary"
                href={`/assessments/${assessment.slug}`}
              >
                View assessment
              </Link>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}

export function AssessmentOverviewView({ overview }: { overview: AssessmentOverview }) {
  const latest = overview.attempts[0];
  const active = overview.attempts.find((attempt) => attempt.status === "in_progress");
  const completed = overview.attempts.find(
    (attempt) => attempt.status === "graded" || attempt.status === "submitted"
  );

  return (
    <div className="assessment-shell">
      <AssessmentHeader summary={overview} />
      <section className="assessment-layout">
        <div className="assessment-card">
          <h2>Attempt policy</h2>
          <ul className="assessment-list">
            <li>Answers can be saved while the attempt is in progress.</li>
            <li>
              Correct answers and private explanations are hidden before submission.
            </li>
            <li>
              Final scoring, unit validation, and competency updates run on the server.
            </li>
            <li>Opening this page does not award progress.</li>
          </ul>
          <form action={startAssessmentAction}>
            <input name="assessmentSlug" type="hidden" value={overview.slug} />
            <button className="button button--primary" type="submit">
              {active ? "Continue attempt" : "Start assessment"}
            </button>
          </form>
        </div>

        <aside className="assessment-card" aria-labelledby="assessment-history-title">
          <h2 id="assessment-history-title">Attempt history</h2>
          {latest ? (
            <ol className="assessment-history">
              {overview.attempts.map((attempt) => (
                <li key={attempt.id}>
                  <strong>Attempt {attempt.attemptNumber}</strong>
                  <span>{attempt.status}</span>
                  {attempt.scoringSummary ? (
                    <span>
                      {attempt.scoringSummary.earnedPoints} /{" "}
                      {attempt.scoringSummary.maxPoints} points
                    </span>
                  ) : null}
                  {attempt.status === "in_progress" ? (
                    <Link href={`/assessments/${overview.slug}/attempt/${attempt.id}`}>
                      Resume
                    </Link>
                  ) : null}
                  {attempt.status === "graded" || attempt.status === "submitted" ? (
                    <Link
                      href={`/assessments/${overview.slug}/attempt/${attempt.id}/review`}
                    >
                      Review
                    </Link>
                  ) : null}
                </li>
              ))}
            </ol>
          ) : (
            <p>No attempts have been recorded for your account.</p>
          )}
          {completed ? <Link href="/dashboard">View dashboard progress</Link> : null}
        </aside>
      </section>
    </div>
  );
}

export function AssessmentAttemptView({
  model,
  message
}: {
  model: AttemptPageModel;
  message?: string | undefined;
}) {
  if (model.attempt.status === "graded" || model.attempt.status === "submitted") {
    return (
      <div className="assessment-shell">
        <AssessmentHeader summary={model.summary} />
        <section className="assessment-card">
          <h2>This attempt has already been submitted</h2>
          <p>Completed attempts cannot be changed or submitted again.</p>
          <Link
            className="button button--primary"
            href={`/assessments/${model.summary.slug}/attempt/${model.attempt.id}/review`}
          >
            Review completed attempt
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="assessment-shell">
      <AssessmentHeader summary={model.summary} />
      {message ? (
        <div className="assessment-error-summary" role="alert">
          {message}
        </div>
      ) : null}
      <form className="assessment-form">
        <input name="assessmentSlug" type="hidden" value={model.summary.slug} />
        <input name="attemptId" type="hidden" value={model.attempt.id} />
        <input name="idempotencyKey" type="hidden" value={`${model.attempt.id}:final`} />

        {model.deliveredAssessment.questions.map((question, index) => (
          <QuestionInput
            answer={model.attempt.submittedAnswers.find(
              (item) => item.questionId === question.id
            )}
            index={index}
            key={question.id}
            question={question}
          />
        ))}

        <div className="assessment-actions">
          <button
            className="button button--secondary"
            formAction={saveAssessmentProgressAction}
            type="submit"
          >
            Save progress
          </button>
          <button
            className="button button--primary"
            formAction={submitAssessmentAction}
            type="submit"
          >
            Submit final answers
          </button>
        </div>
      </form>
    </div>
  );
}

export function AssessmentReviewView({ model }: { model: ReviewPageModel }) {
  const scoring = model.attempt.scoringSummary;

  return (
    <div className="assessment-shell">
      <AssessmentHeader summary={model.summary} />
      <section
        className="assessment-card assessment-result-card"
        aria-labelledby="score-title"
      >
        <h2 id="score-title">Completed attempt</h2>
        <p className="assessment-score">
          {scoring.earnedPoints} / {scoring.maxPoints} points
        </p>
        <dl className="assessment-facts">
          <div>
            <dt>Status</dt>
            <dd>{model.attempt.status}</dd>
          </div>
          <div>
            <dt>Attempt</dt>
            <dd>{model.attempt.attemptNumber}</dd>
          </div>
          <div>
            <dt>Competency</dt>
            <dd>{formatAwards(scoring.competencyProgress)}</dd>
          </div>
        </dl>
        <Link className="button button--secondary" href="/dashboard">
          View dashboard
        </Link>
      </section>

      <section className="assessment-review-list" aria-label="Question review">
        {model.assessment.questions.map((question, index) => (
          <QuestionReview
            answer={model.attempt.submittedAnswers.find(
              (item) => item.questionId === question.id
            )}
            index={index}
            key={question.id}
            question={question}
            result={resultForQuestion(scoring.questionResults, question.id)}
          />
        ))}
      </section>
    </div>
  );
}

export function AssessmentNotFound({ title = "Assessment unavailable" }) {
  return (
    <div className="assessment-shell">
      <section className="assessment-card">
        <h1>{title}</h1>
        <p>
          The assessment was not found, is unpublished, or is not available to this
          account.
        </p>
        <Link className="button button--primary" href="/assessments">
          Back to assessments
        </Link>
      </section>
    </div>
  );
}

function AssessmentHeader({ summary }: { summary: AssessmentSummary }) {
  return (
    <header className="assessment-hero">
      <p className="eyebrow">{summary.moduleTitle}</p>
      <h1>{summary.title}</h1>
      <p>{summary.description}</p>
      <dl className="assessment-facts">
        <div>
          <dt>Lesson</dt>
          <dd>{summary.lessonTitle}</dd>
        </div>
        <div>
          <dt>Duration</dt>
          <dd>{summary.estimatedMinutes} min</dd>
        </div>
        <div>
          <dt>Review</dt>
          <dd>{summary.reviewStatus}</dd>
        </div>
        <div>
          <dt>Version</dt>
          <dd>{summary.contentVersion}</dd>
        </div>
      </dl>
    </header>
  );
}

function QuestionInput({
  answer,
  index,
  question
}: {
  answer?: StudentAnswer | undefined;
  index: number;
  question: DeliveredQuestion;
}) {
  return (
    <fieldset className="assessment-question">
      <legend>
        <span>Question {index + 1}</span>
        {question.prompt}
      </legend>
      <p className="assessment-question__meta">
        {question.competencyLevel} · {question.points} point
        {question.points === 1 ? "" : "s"}
      </p>
      {renderQuestionInput(question, answer)}
    </fieldset>
  );
}

function renderQuestionInput(question: DeliveredQuestion, answer?: StudentAnswer) {
  switch (question.type) {
    case "multiple-choice": {
      const multipleChoiceQuestion = question as VisibleMultipleChoiceQuestion;
      return (
        <div className="assessment-option-list">
          {multipleChoiceQuestion.choices.map((choice) => (
            <label key={choice.id}>
              <input
                defaultChecked={
                  answer?.type === "multiple-choice" && answer.choiceId === choice.id
                }
                name={field(question.id)}
                type="radio"
                value={choice.id}
              />
              <span>{choice.text}</span>
            </label>
          ))}
        </div>
      );
    }
    case "numeric-engineering-calculation": {
      const numericAnswer =
        answer?.type === "numeric-engineering-calculation" ? answer.answer : undefined;
      return (
        <div className="assessment-inline-inputs">
          <label>
            Value
            <input
              defaultValue={numericAnswer?.value}
              inputMode="decimal"
              name={field(question.id, "value")}
              type="text"
            />
          </label>
          <label>
            Unit
            <input
              defaultValue={numericAnswer?.unit}
              name={field(question.id, "unit")}
              placeholder="Pa"
              type="text"
            />
          </label>
        </div>
      );
    }
    case "component-identification": {
      const componentQuestion = question as VisibleComponentQuestion;
      const selected =
        answer?.type === "component-identification" ? answer.componentIds : [];
      return (
        <div className="assessment-option-list">
          {componentQuestion.components.map((component) => (
            <label key={component.id}>
              <input
                defaultChecked={selected.includes(component.id)}
                name={field(question.id)}
                type="checkbox"
                value={component.id}
              />
              <span>{component.text}</span>
            </label>
          ))}
        </div>
      );
    }
    case "diagram-question": {
      const diagramQuestion = question as VisibleDiagramQuestion;
      const selected = answer?.type === "diagram-question" ? answer.labelIds : [];
      return (
        <div>
          <div
            className="assessment-diagram"
            role="img"
            aria-label={diagramQuestion.altText}
          >
            <span>F</span>
            <span>A</span>
            <span>T</span>
          </div>
          <div className="assessment-option-list">
            {diagramQuestion.labels.map((label) => (
              <label key={label.id}>
                <input
                  defaultChecked={selected.includes(label.id)}
                  name={field(question.id)}
                  type="checkbox"
                  value={label.id}
                />
                <span>{label.text}</span>
              </label>
            ))}
          </div>
        </div>
      );
    }
    case "sequence-question": {
      const sequenceQuestion = question as VisibleSequenceQuestion;
      const selected = answer?.type === "sequence-question" ? answer.stepOrder : [];
      return (
        <div className="assessment-sequence">
          {sequenceQuestion.steps.map((_, index) => (
            <label key={index}>
              Step {index + 1}
              <select
                defaultValue={selected[index] ?? ""}
                name={field(question.id, `step-${index}`)}
              >
                <option value="">Choose a step</option>
                {sequenceQuestion.steps.map((step) => (
                  <option key={step.id} value={step.id}>
                    {step.text}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      );
    }
    case "simulation-task": {
      const measurement =
        answer?.type === "simulation-task"
          ? answer.measurements.cylinderForce
          : undefined;
      return (
        <div className="assessment-inline-inputs">
          <label>
            Cylinder force
            <input
              defaultValue={measurement?.value}
              inputMode="decimal"
              name={field(question.id, "measurement-cylinderForce-value")}
              type="text"
            />
          </label>
          <label>
            Unit
            <input
              defaultValue={measurement?.unit}
              name={field(question.id, "measurement-cylinderForce-unit")}
              placeholder="N"
              type="text"
            />
          </label>
        </div>
      );
    }
    case "fault-diagnosis": {
      const faultQuestion = question as VisibleFaultQuestion;
      const faultId = answer?.type === "fault-diagnosis" ? answer.faultId : "";
      const evidenceIds = answer?.type === "fault-diagnosis" ? answer.evidenceIds : [];
      return (
        <div className="assessment-option-list">
          {faultQuestion.faultOptions.map((option) => (
            <label key={option.id}>
              <input
                defaultChecked={faultId === option.id}
                name={field(question.id, "fault")}
                type="radio"
                value={option.id}
              />
              <span>{option.text}</span>
            </label>
          ))}
          <label>
            <input
              defaultChecked={evidenceIds.includes(
                "force-below-pressure-area-prediction"
              )}
              name={field(question.id, "evidence")}
              type="checkbox"
              value="force-below-pressure-area-prediction"
            />
            <span>Force is below the pressure-area prediction</span>
          </label>
        </div>
      );
    }
    case "design-challenge":
      return (
        <label className="assessment-long-answer">
          Response
          <textarea
            name={field(question.id, "response")}
            rows={4}
            placeholder="Write the safe training boundary."
          />
          <span>
            Written responses are retained for review; students cannot self-award rubric
            points.
          </span>
        </label>
      );
  }
}

function QuestionReview({
  answer,
  index,
  question,
  result
}: {
  answer?: StudentAnswer | undefined;
  index: number;
  question: Assessment["questions"][number];
  result?: QuestionResult | undefined;
}) {
  return (
    <article className="assessment-card assessment-review-result">
      <div className="assessment-card__meta">
        <span>Question {index + 1}</span>
        <span>{result?.correct ? "Correct" : "Needs review"}</span>
      </div>
      <h2>{question.prompt}</h2>
      <dl className="assessment-facts">
        <div>
          <dt>Score</dt>
          <dd>
            {result?.earnedPoints ?? 0} / {result?.maxPoints ?? question.points}
          </dd>
        </div>
        <div>
          <dt>Competency</dt>
          <dd>{question.competencyLevel}</dd>
        </div>
      </dl>
      <p>
        <strong>Your answer:</strong> {formatAnswer(answer)}
      </p>
      <p>
        <strong>Expected:</strong> {formatCorrectAnswer(question)}
      </p>
      {result?.errors.length ? (
        <ul className="assessment-list">
          {result.errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      ) : null}
      <p>{result?.explanation}</p>
    </article>
  );
}

function formatAwards(awards: Record<string, number>) {
  const entries = Object.entries(awards).filter(([, points]) => points > 0);
  return entries.length > 0
    ? entries.map(([level, points]) => `${level}: ${points}`).join(", ")
    : "No competency points awarded";
}

function formatAnswer(answer?: StudentAnswer) {
  if (!answer) {
    return "No answer submitted.";
  }

  switch (answer.type) {
    case "multiple-choice":
      return answer.choiceId;
    case "numeric-engineering-calculation":
      return `${answer.answer.value} ${answer.answer.unit}`;
    case "component-identification":
      return answer.componentIds.join(", ");
    case "diagram-question":
      return answer.labelIds.join(", ");
    case "sequence-question":
      return answer.stepOrder.join(" -> ");
    case "simulation-task":
      return Object.entries(answer.measurements)
        .map(([id, value]) => `${id}: ${value.value} ${value.unit}`)
        .join(", ");
    case "fault-diagnosis":
      return `${answer.faultId}; evidence: ${answer.evidenceIds.join(", ")}`;
    case "design-challenge":
      return "Submitted for review.";
  }
}

function formatCorrectAnswer(question: Assessment["questions"][number]) {
  switch (question.type) {
    case "multiple-choice":
      return question.correctChoiceId;
    case "numeric-engineering-calculation":
      return `${question.expectedAnswer.value} ${question.expectedAnswer.unit}`;
    case "component-identification":
      return question.correctComponentIds.join(", ");
    case "diagram-question":
      return question.correctLabelIds.join(", ");
    case "sequence-question":
      return question.correctStepOrder.join(" -> ");
    case "simulation-task":
      return Object.entries(question.expectedMeasurements)
        .map(([id, value]) => `${id}: ${value.value} ${value.unit}`)
        .join(", ");
    case "fault-diagnosis":
      return `${question.correctFaultId}; evidence: ${question.diagnosticEvidenceIds.join(", ")}`;
    case "design-challenge":
      return question.rubric.map((item) => item.description).join(" ");
  }
}
