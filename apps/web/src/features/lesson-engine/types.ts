export type ReviewStatus =
  | "Draft"
  | "Source required"
  | "Source checked"
  | "Equation checked"
  | "Simulation checked"
  | "Engineering review required"
  | "Approved for student use";

export type LessonSectionId =
  | "lessonHeader"
  | "estimatedCompletionTime"
  | "difficulty"
  | "prerequisites"
  | "learningOutcomes"
  | "whyTopicMatters"
  | "keyTerminology"
  | "visualExplanation"
  | "theory"
  | "equations"
  | "workedExamples"
  | "interactiveActivity"
  | "faultFindingExercise"
  | "safetyConsiderations"
  | "knowledgeCheck"
  | "summary"
  | "sources"
  | "nextRecommendedLesson";

export type SymbolRecord = {
  symbol: string;
  name: string;
  unit: string;
};

type BlockBase = {
  id: string;
  sourceIds?: string[];
};

export type VisualAccessibility = {
  label: string;
  textAlternative: string;
  keyboardInstructions: string;
  reducedMotionFallback: string;
};

type VisualBlockBase = {
  id: string;
  title: string;
  description: string;
  sourceIds: string[];
  reviewStatus: ReviewStatus;
  accessibility: VisualAccessibility;
};

export type ParagraphBlock = BlockBase & {
  type: "paragraph";
  text: string;
};

export type DefinitionBlock = BlockBase & {
  type: "definition";
  term: string;
  definition: string;
};

export type DiagramBlock = BlockBase & {
  type: "diagram";
  title: string;
  altText: string;
  description: string;
  caption?: string;
};

export type EquationBlock = BlockBase & {
  type: "equation";
  name: string;
  expression: string;
  symbols: SymbolRecord[];
};

export type SymbolTableBlock = BlockBase & {
  type: "symbolTable";
  symbols: SymbolRecord[];
};

export type UnitNoteBlock = BlockBase & {
  type: "unitNote";
  quantity: string;
  siUnit: string;
  note: string;
};

export type AssumptionBlock = BlockBase & {
  type: "assumption";
  text: string;
};

export type WorkedCalculationBlock = BlockBase & {
  type: "workedCalculation";
  title: string;
  given: string[];
  steps: Array<{
    label: string;
    expression?: string;
    explanation: string;
  }>;
  result: string;
  interpretation: string;
};

export type EngineeringInterpretationBlock = BlockBase & {
  type: "engineeringInterpretation";
  text: string;
};

export type WarningBlock = BlockBase & {
  type: "warning";
  severity: "info" | "warning" | "fault";
  title: string;
  text: string;
};

export type FaultCaseBlock = BlockBase & {
  type: "faultCase";
  title: string;
  symptoms: string[];
  likelyCauses: string[];
  safeResponse: string;
};

export type QuestionBlock = BlockBase & {
  type: "question";
  prompt: string;
  options: Array<{
    id: string;
    text: string;
    isCorrect: boolean;
  }>;
  answerExplanation: string;
};

export type SourceCitationBlock = {
  id: string;
  type: "sourceCitation";
  sourceId: string;
  note: string;
};

export type HeroSimulationBlock = VisualBlockBase & {
  type: "heroSimulation";
  simulationId: string;
  mode:
    "learn" | "guided" | "explore" | "fault-diagnosis" | "assessment" | "demonstration";
};

export type InteractiveDiagramBlock = VisualBlockBase & {
  type: "interactiveDiagram";
  diagramId: string;
  componentIds: string[];
};

export type AnimationBlock = VisualBlockBase & {
  type: "animation";
  animationId: string;
};

export type ObservationQuestionBlock = VisualBlockBase & {
  type: "observationQuestion";
  prompt: string;
  hint?: string;
  explanation?: string;
  graded: false;
};

export type MicroTheoryBlock = VisualBlockBase & {
  type: "microTheory";
  principle: string;
  expandedExplanation?: string;
  safetyInformation?: string;
};

export type LiveEquationBlock = VisualBlockBase & {
  type: "liveEquation";
  equationId: string;
  inputBindings: Record<string, string>;
  outputBinding: string;
};

export type ComponentCutawayBlock = VisualBlockBase & {
  type: "componentCutaway";
  componentId: string;
  representations: Array<"external" | "cutaway" | "schematic">;
};

export type LinkedSchematicBlock = VisualBlockBase & {
  type: "linkedSchematic";
  simulationId: string;
  componentIds: string[];
};

export type EngineeringChallengeBlock = VisualBlockBase & {
  type: "engineeringChallenge";
  challengeId: string;
  objective: string;
  pattern: "target" | "constraint" | "diagnosis" | "design";
  goal: string;
  allowedActions: string[];
  successCondition: string;
  feedback: {
    beforeCheck: string;
    onSuccess: string;
    onIncomplete: string;
  };
  modelAssumptions: string[];
};

export type FaultChallengeBlock = VisualBlockBase & {
  type: "faultChallenge";
  simulationId: string;
  faultId: string;
  pattern: "diagnosis";
  goal: string;
  allowedActions: string[];
  successCondition: string;
  feedback: {
    beforeCheck: string;
    onSuccess: string;
    onIncomplete: string;
  };
  modelAssumptions: string[];
};

export type RealWorldApplicationBlock = VisualBlockBase & {
  type: "realWorldApplication";
  applicationId: string;
  systemType: string;
  principle: string;
  relatedSimulationId?: string;
};

export type DeepDiveBlock = VisualBlockBase & {
  type: "deepDive";
  content: string;
};

export type VisualLessonContentBlock =
  | HeroSimulationBlock
  | InteractiveDiagramBlock
  | AnimationBlock
  | ObservationQuestionBlock
  | MicroTheoryBlock
  | LiveEquationBlock
  | ComponentCutawayBlock
  | LinkedSchematicBlock
  | EngineeringChallengeBlock
  | FaultChallengeBlock
  | RealWorldApplicationBlock
  | DeepDiveBlock;

export type LessonContentBlock =
  | ParagraphBlock
  | DefinitionBlock
  | DiagramBlock
  | EquationBlock
  | SymbolTableBlock
  | UnitNoteBlock
  | AssumptionBlock
  | WorkedCalculationBlock
  | EngineeringInterpretationBlock
  | WarningBlock
  | FaultCaseBlock
  | QuestionBlock
  | SourceCitationBlock
  | VisualLessonContentBlock;

export type LessonSection = {
  title: string;
  blocks: LessonContentBlock[];
};

export type VisualLessonStageId =
  | "heroExperience"
  | "explore"
  | "observe"
  | "microTheory"
  | "liveEquation"
  | "engineeringChallenge"
  | "faultMode"
  | "realWorldApplication"
  | "knowledgeCheck"
  | "deepDive"
  | "sources";

export type VisualLessonStage = {
  stage: VisualLessonStageId;
  title: string;
  blocks: LessonContentBlock[];
};

export type VisualLessonType =
  "phenomenon" | "component" | "system" | "calculation" | "diagnostic" | "design";

export type VisualProgressionStep =
  "see" | "play" | "calculate" | "challenge" | "apply" | "check";

export type VisualLessonMetadata = {
  firstScreen: {
    purpose: string;
    primaryVisualBlockId: string;
    primaryControlIds: string[];
  };
  progression: VisualProgressionStep[];
  inputs: Array<{
    id: string;
    label: string;
    quantity: string;
    unit: string;
    internalUnit: string;
    default: number;
    minimum: number;
    maximum: number;
    step: number;
    validation: string;
    modelValidityRange: { minimum: number; maximum: number };
    accessibilityLabel: string;
    educationalDescription: string;
  }>;
  outputs: Array<{
    id: string;
    label: string;
    quantity: string;
    unit: string;
    internalUnit: string;
    interpretation: string;
    validityState: "valid" | "warning" | "invalid" | "unavailable";
    warning?: string;
    measurementSource: string;
  }>;
};

export type StructuredLesson = {
  id: string;
  slug: string;
  title: string;
  description: string;
  publicationStatus: "draft" | "internal" | "scheduled" | "published" | "archived";
  reviewStatus: ReviewStatus;
  version: string;
  authorProfileId?: string;
  estimatedCompletionTime: string;
  difficulty: string;
  prerequisites: string[];
  knowledgeFileIds: string[];
  sourceIds: string[];
  learningOutcomeIds?: string[];
  learningOutcomes: string[];
  requiredSections: LessonSectionId[];
  sections: Record<LessonSectionId, LessonSection>;
  schemaVersion?: string;
  experienceModel?: "linear-v1" | "visual-v2";
  experienceSequence?: VisualLessonStage[];
  visualLessonType?: string;
  lessonType?: VisualLessonType | "theory";
  visualStandardVersion?: string;
  visualMetadata?: VisualLessonMetadata;
  simulationIds?: string[];
  equationIds?: string[];
  estimatedInteractionTime?: string;
  relatedApplications?: string[];
  relatedAssessmentIds?: string[];
};

export type SourceRecord = {
  id: string;
  title: string;
  citation: string;
  approvalStatus: ReviewStatus;
  reviewStatus: ReviewStatus;
  evidenceStatus: "missing" | "partial" | "approved";
  limitations?: string[];
};
