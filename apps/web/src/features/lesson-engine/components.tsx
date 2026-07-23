import {
  Alert,
  Badge,
  Breadcrumbs,
  EngineeringReviewBadge,
  SourceReference
} from "@industrial-learn/design-system";
import type { ReactNode } from "react";

import type {
  DiagramBlock,
  FaultCaseBlock,
  LessonContentBlock,
  LessonSectionId,
  QuestionBlock,
  SourceRecord,
  StructuredLesson,
  SymbolRecord,
  WarningBlock,
  WorkedCalculationBlock
} from "./types";

const sectionOrder: LessonSectionId[] = [
  "lessonHeader",
  "estimatedCompletionTime",
  "difficulty",
  "prerequisites",
  "learningOutcomes",
  "whyTopicMatters",
  "keyTerminology",
  "visualExplanation",
  "theory",
  "equations",
  "workedExamples",
  "interactiveActivity",
  "faultFindingExercise",
  "safetyConsiderations",
  "knowledgeCheck",
  "summary",
  "sources",
  "nextRecommendedLesson"
];

export function LessonRenderer({
  isAuthenticated = false,
  lesson,
  sources
}: {
  isAuthenticated?: boolean;
  lesson: StructuredLesson;
  sources: SourceRecord[];
}) {
  return (
    <article className="lesson-engine">
      <Breadcrumbs
        items={[
          { href: "/learn", label: "Learn" },
          { href: `/lessons/${lesson.slug}`, label: lesson.title }
        ]}
      />
      <header className="lesson-engine__header">
        <div>
          <p className="eyebrow">Structured lesson</p>
          <h1>{lesson.title}</h1>
          <p>{lesson.description}</p>
        </div>
        <div className="lesson-engine__status" aria-label="Lesson status">
          <EngineeringReviewBadge status={lesson.reviewStatus} />
          <Badge tone={lesson.publicationStatus === "published" ? "normal" : "warning"}>
            {lesson.publicationStatus}
          </Badge>
          <span>Version {lesson.version}</span>
        </div>
      </header>

      <dl className="lesson-engine__meta" aria-label="Lesson metadata">
        <div>
          <dt>Estimated time</dt>
          <dd>{lesson.estimatedCompletionTime}</dd>
        </div>
        <div>
          <dt>Difficulty</dt>
          <dd>{lesson.difficulty}</dd>
        </div>
        <div>
          <dt>Prerequisites</dt>
          <dd>
            {lesson.prerequisites.length > 0
              ? lesson.prerequisites.join(", ")
              : "None listed"}
          </dd>
        </div>
      </dl>

      <Alert title="Progress" tone="info">
        {isAuthenticated
          ? "Progress saving is available for authenticated sessions."
          : "Progress is not saved in signed-out mode. No completion data is displayed."}
      </Alert>

      <nav className="lesson-engine__toc" aria-label="Lesson sections">
        {sectionOrder.map((sectionId) => (
          <a href={`#${sectionId}`} key={sectionId}>
            {lesson.sections[sectionId].title}
          </a>
        ))}
      </nav>

      <div className="lesson-engine__sections">
        {sectionOrder.map((sectionId) => {
          const section = lesson.sections[sectionId];

          return (
            <section className="lesson-section" id={sectionId} key={sectionId}>
              <h2>{section.title}</h2>
              <div className="lesson-section__blocks">
                {section.blocks.map((block) => (
                  <ContentBlockRenderer block={block} key={block.id} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <section
        className="lesson-section lesson-section--sources"
        aria-labelledby="source-records-title"
      >
        <h2 id="source-records-title">Source records</h2>
        {sources.map((source) => (
          <article className="lesson-source-record" key={source.id}>
            <h3>{source.title}</h3>
            <p>{source.citation}</p>
            <dl>
              <div>
                <dt>Source ID</dt>
                <dd>
                  <code>{source.id}</code>
                </dd>
              </div>
              <div>
                <dt>Evidence</dt>
                <dd>{source.evidenceStatus}</dd>
              </div>
              <div>
                <dt>Review</dt>
                <dd>{source.reviewStatus}</dd>
              </div>
            </dl>
          </article>
        ))}
      </section>
    </article>
  );
}

export function ContentBlockRenderer({ block }: { block: LessonContentBlock }) {
  switch (block.type) {
    case "paragraph":
      return (
        <BlockFrame block={block}>
          <p>{block.text}</p>
        </BlockFrame>
      );
    case "definition":
      return (
        <BlockFrame block={block}>
          <dfn>{block.term}</dfn>
          <p>{block.definition}</p>
        </BlockFrame>
      );
    case "diagram":
      return <DiagramBlockView block={block} />;
    case "equation":
      return (
        <BlockFrame block={block}>
          <h3>{block.name}</h3>
          <p className="lesson-equation" aria-label={`Equation: ${block.expression}`}>
            {block.expression}
          </p>
          <SymbolTable symbols={block.symbols} />
        </BlockFrame>
      );
    case "symbolTable":
      return (
        <BlockFrame block={block}>
          <SymbolTable symbols={block.symbols} />
        </BlockFrame>
      );
    case "unitNote":
      return (
        <BlockFrame block={block}>
          <p>
            <strong>{block.quantity}</strong>: {block.siUnit}
          </p>
          <p>{block.note}</p>
        </BlockFrame>
      );
    case "assumption":
      return (
        <BlockFrame block={block}>
          <p>
            <strong>Assumption:</strong> {block.text}
          </p>
        </BlockFrame>
      );
    case "workedCalculation":
      return <WorkedCalculationBlockView block={block} />;
    case "engineeringInterpretation":
      return (
        <BlockFrame block={block}>
          <p>
            <strong>Engineering interpretation:</strong> {block.text}
          </p>
        </BlockFrame>
      );
    case "warning":
      return <WarningBlockView block={block} />;
    case "faultCase":
      return <FaultCaseBlockView block={block} />;
    case "question":
      return <QuestionBlockView block={block} />;
    case "sourceCitation":
      return (
        <BlockFrame block={block}>
          <SourceReference sourceId={block.sourceId} />
          <p>{block.note}</p>
        </BlockFrame>
      );
  }
}

function BlockFrame({
  block,
  children
}: {
  block: LessonContentBlock;
  children: ReactNode;
}) {
  const sourceIds = "sourceIds" in block ? block.sourceIds : undefined;

  return (
    <div className={`lesson-block lesson-block--${block.type}`}>
      {children}
      {sourceIds && sourceIds.length > 0 ? (
        <footer className="lesson-block__sources" aria-label="Source references">
          {sourceIds.map((sourceId) => (
            <SourceReference key={sourceId} sourceId={sourceId} />
          ))}
        </footer>
      ) : null}
    </div>
  );
}

function SymbolTable({ symbols }: { symbols: SymbolRecord[] }) {
  return (
    <table className="lesson-symbol-table">
      <caption>Symbols and SI units</caption>
      <thead>
        <tr>
          <th scope="col">Symbol</th>
          <th scope="col">Meaning</th>
          <th scope="col">SI unit</th>
        </tr>
      </thead>
      <tbody>
        {symbols.map((symbol) => (
          <tr key={symbol.symbol}>
            <td>
              <code>{symbol.symbol}</code>
            </td>
            <td>{symbol.name}</td>
            <td>
              <code>{symbol.unit}</code>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DiagramBlockView({ block }: { block: DiagramBlock }) {
  return (
    <BlockFrame block={block}>
      <figure>
        <div aria-label={block.altText} className="lesson-diagram" role="img">
          <span className="lesson-diagram__force">F</span>
          <span className="lesson-diagram__arrow" aria-hidden="true" />
          <span className="lesson-diagram__area">A</span>
        </div>
        <figcaption>
          <strong>{block.title}.</strong> {block.caption ?? block.description}
        </figcaption>
      </figure>
      <p>{block.description}</p>
    </BlockFrame>
  );
}

function WorkedCalculationBlockView({ block }: { block: WorkedCalculationBlock }) {
  return (
    <BlockFrame block={block}>
      <h3>{block.title}</h3>
      <div className="lesson-worked-calculation__given">
        <h4>Given</h4>
        <ul>
          {block.given.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
      <details className="lesson-worked-calculation__steps">
        <summary>Show calculation steps</summary>
        <ol>
          {block.steps.map((step) => (
            <li key={step.label}>
              <strong>{step.label}</strong>
              {step.expression ? (
                <p
                  className="lesson-equation"
                  aria-label={`Calculation expression: ${step.expression}`}
                >
                  {step.expression}
                </p>
              ) : null}
              <p>{step.explanation}</p>
            </li>
          ))}
        </ol>
      </details>
      <p>
        <strong>Result:</strong> {block.result}
      </p>
      <p>
        <strong>Interpretation:</strong> {block.interpretation}
      </p>
    </BlockFrame>
  );
}

function WarningBlockView({ block }: { block: WarningBlock }) {
  const tone = block.severity === "fault" ? "fault" : block.severity;

  return (
    <BlockFrame block={block}>
      <Alert title={block.title} tone={tone}>
        {block.text}
      </Alert>
    </BlockFrame>
  );
}

function FaultCaseBlockView({ block }: { block: FaultCaseBlock }) {
  return (
    <BlockFrame block={block}>
      <h3>{block.title}</h3>
      <div className="lesson-fault-grid">
        <div>
          <h4>Symptoms</h4>
          <ul>
            {block.symptoms.map((symptom) => (
              <li key={symptom}>{symptom}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4>Likely causes</h4>
          <ul>
            {block.likelyCauses.map((cause) => (
              <li key={cause}>{cause}</li>
            ))}
          </ul>
        </div>
      </div>
      <p>
        <strong>Safe response:</strong> {block.safeResponse}
      </p>
    </BlockFrame>
  );
}

function QuestionBlockView({ block }: { block: QuestionBlock }) {
  return (
    <BlockFrame block={block}>
      <fieldset className="lesson-question">
        <legend>{block.prompt}</legend>
        {block.options.map((option) => (
          <label key={option.id}>
            <input name={block.id} type="radio" value={option.id} />
            <span>{option.text}</span>
          </label>
        ))}
      </fieldset>
      <details>
        <summary>Check explanation</summary>
        <p>{block.answerExplanation}</p>
      </details>
    </BlockFrame>
  );
}
