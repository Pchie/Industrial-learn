import {
  Alert,
  Badge,
  Breadcrumbs,
  EngineeringReviewBadge,
  SourceReference
} from "@industrial-learn/design-system";
import type { ReactNode } from "react";

import {
  MicroTheory,
  ObservationPrompt,
  RealWorldApplication,
  VisualBlockReference
} from "../visual-simulation/components";

import type {
  DiagramBlock,
  FaultCaseBlock,
  LessonContentBlock,
  LessonSectionId,
  QuestionBlock,
  SourceRecord,
  StructuredLesson,
  SymbolRecord,
  VisualLessonContentBlock,
  VisualProgressionStep,
  VisualLessonStage,
  VisualLessonStageId,
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
  sources,
  visualStageOverrides
}: {
  isAuthenticated?: boolean;
  lesson: StructuredLesson;
  sources: SourceRecord[];
  visualStageOverrides?: Partial<Record<VisualLessonStageId, ReactNode>>;
}) {
  const visualStages =
    lesson.experienceModel === "visual-v2" && lesson.experienceSequence?.length
      ? lesson.experienceSequence
      : null;
  const firstVisualStage = visualStages?.[0];

  return (
    <article className={`lesson-engine${visualStages ? " lesson-engine--visual" : ""}`}>
      <Breadcrumbs
        items={[
          { href: "/learn", label: "Learn" },
          { href: `/lessons/${lesson.slug}`, label: lesson.title }
        ]}
      />
      <header className="lesson-engine__header">
        <div>
          <p className="eyebrow">
            {visualStages ? "Visual-first structured lesson" : "Structured lesson"}
          </p>
          <h1>{lesson.title}</h1>
          <p>{lesson.visualMetadata?.firstScreen.purpose ?? lesson.description}</p>
        </div>
        <div className="lesson-engine__status" aria-label="Lesson status">
          <EngineeringReviewBadge status={lesson.reviewStatus} />
          {!visualStages ? (
            <>
              <Badge
                tone={lesson.publicationStatus === "published" ? "normal" : "warning"}
              >
                {lesson.publicationStatus}
              </Badge>
              <span>Version {lesson.version}</span>
            </>
          ) : null}
        </div>
      </header>

      {lesson.visualMetadata ? (
        <VisualLessonProgression steps={lesson.visualMetadata.progression} />
      ) : null}

      {firstVisualStage ? (
        <VisualLessonStageSection
          index={0}
          override={visualStageOverrides?.[firstVisualStage.stage]}
          stage={firstVisualStage}
        />
      ) : null}

      {visualStages ? (
        <details className="lesson-engine__compact-details">
          <summary>Outcomes, prerequisites and lesson details</summary>
          <div className="lesson-engine__compact-details-content">
            <div>
              <h2>By the end you can</h2>
              <ul>
                {lesson.learningOutcomes.map((outcome) => (
                  <li key={outcome}>{outcome}</li>
                ))}
              </ul>
              <p>
                Publication: {lesson.publicationStatus}. Version {lesson.version}.
              </p>
            </div>
            <LessonMetadata lesson={lesson} />
          </div>
        </details>
      ) : (
        <LessonMetadata lesson={lesson} />
      )}

      <Alert title="Progress" tone="info">
        {isAuthenticated
          ? "Progress saving is available for authenticated sessions."
          : "Progress is not saved in signed-out mode. No completion data is displayed."}
      </Alert>

      {!visualStages ? (
        <nav className="lesson-engine__toc" aria-label="Lesson sections">
          {sectionOrder.map((sectionId) => (
            <a href={`#${sectionId}`} key={sectionId}>
              {lesson.sections[sectionId].title}
            </a>
          ))}
        </nav>
      ) : null}

      <div className="lesson-engine__sections">
        {visualStages
          ? visualStages
              .slice(1)
              .map((stage, index) => (
                <VisualLessonStageSection
                  index={index + 1}
                  key={`${stage.stage}-${index + 1}`}
                  override={visualStageOverrides?.[stage.stage]}
                  stage={stage}
                />
              ))
          : sectionOrder.map((sectionId) => {
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

      <details className="lesson-section lesson-section--sources" open={!visualStages}>
        <summary id="source-records-title">
          <span aria-level={2} role="heading">
            Source records
          </span>
        </summary>
        <div className="lesson-section__blocks">
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
        </div>
      </details>
    </article>
  );
}

function VisualLessonStageSection({
  index,
  override,
  stage
}: {
  index: number;
  override: ReactNode | undefined;
  stage: VisualLessonStage;
}) {
  const overrideProvidesHeading = index === 0 && override !== undefined;

  return (
    <section
      className={`lesson-section${index === 0 ? " lesson-section--visual-hero" : ""}`}
      id={visualStageAnchor(stage, index)}
      key={`${stage.stage}-${index}`}
    >
      {overrideProvidesHeading ? null : <h2>{stage.title}</h2>}
      <div className="lesson-section__blocks">
        {override ??
          stage.blocks.map((block) => (
            <ContentBlockRenderer block={block} key={block.id} />
          ))}
      </div>
    </section>
  );
}

function VisualLessonProgression({ steps }: { steps: VisualProgressionStep[] }) {
  return (
    <nav aria-label="Visual lesson progression" className="lesson-progression">
      <ol>
        {steps.map((step, index) => (
          <li key={step}>
            <span aria-hidden="true">{index + 1}</span>
            {formatProgressionStep(step)}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function LessonMetadata({ lesson }: { lesson: StructuredLesson }) {
  return (
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
  );
}

function formatProgressionStep(step: string) {
  return step === "play" ? "Explore" : `${step.charAt(0).toUpperCase()}${step.slice(1)}`;
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
    case "heroSimulation":
    case "interactiveDiagram":
    case "animation":
    case "observationQuestion":
    case "microTheory":
    case "liveEquation":
    case "componentCutaway":
    case "linkedSchematic":
    case "engineeringChallenge":
    case "faultChallenge":
    case "realWorldApplication":
    case "deepDive":
      return <VisualContentBlockView block={block} />;
  }
}

function VisualContentBlockView({ block }: { block: VisualLessonContentBlock }) {
  if (block.type === "observationQuestion") {
    return (
      <BlockFrame block={block}>
        <ObservationPrompt
          explanation={block.explanation}
          hint={block.hint}
          prompt={block.prompt}
        />
      </BlockFrame>
    );
  }

  if (block.type === "microTheory") {
    return (
      <BlockFrame block={block}>
        <MicroTheory
          deeperTheory={block.expandedExplanation}
          principle={block.principle}
          safetyInformation={
            block.safetyInformation ? (
              <Alert title="Safety context" tone="warning">
                {block.safetyInformation}
              </Alert>
            ) : null
          }
          title={block.title}
        />
      </BlockFrame>
    );
  }

  if (block.type === "realWorldApplication") {
    return (
      <BlockFrame block={block}>
        <RealWorldApplication
          principle={block.principle}
          relatedSimulation={block.relatedSimulationId}
          systemType={block.systemType}
          title={block.title}
          visualDescription={block.accessibility.textAlternative}
        />
      </BlockFrame>
    );
  }

  if (block.type === "deepDive") {
    return (
      <BlockFrame block={block}>
        <details>
          <summary>{block.title}</summary>
          <p>{block.content}</p>
        </details>
      </BlockFrame>
    );
  }

  return (
    <BlockFrame block={block}>
      <VisualBlockReference
        accessibilityLabel={block.accessibility.label}
        description={block.description}
        referenceId={visualBlockReferenceId(block)}
        title={block.title}
        type={block.type}
      />
    </BlockFrame>
  );
}

function visualBlockReferenceId(block: VisualLessonContentBlock) {
  switch (block.type) {
    case "heroSimulation":
    case "linkedSchematic":
    case "faultChallenge":
      return block.simulationId;
    case "interactiveDiagram":
      return block.diagramId;
    case "animation":
      return block.animationId;
    case "liveEquation":
      return block.equationId;
    case "componentCutaway":
      return block.componentId;
    case "engineeringChallenge":
      return block.challengeId;
    case "realWorldApplication":
      return block.applicationId;
    case "observationQuestion":
    case "microTheory":
    case "deepDive":
      return undefined;
  }
}

function visualStageAnchor(stage: VisualLessonStage, index: number) {
  return `visual-${index + 1}-${stage.stage}`;
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
