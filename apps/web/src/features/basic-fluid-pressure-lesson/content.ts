import type {
  EngineeringChallengeBlock,
  DeepDiveBlock,
  InteractiveDiagramBlock,
  MicroTheoryBlock,
  ObservationQuestionBlock,
  RealWorldApplicationBlock,
  StructuredLesson,
  VisualLessonStage
} from "../lesson-engine/types";

export type BasicPressureExperienceContent = {
  hero: InteractiveDiagramBlock;
  observations: ObservationQuestionBlock[];
  microTheory: MicroTheoryBlock;
  challenge: EngineeringChallengeBlock;
  application: RealWorldApplicationBlock;
  deepDive: DeepDiveBlock;
};

export function getBasicPressureExperienceContent(
  lesson: StructuredLesson
): BasicPressureExperienceContent {
  const heroStage = lesson.experienceSequence?.find(
    (stage) => stage.stage === "heroExperience"
  );
  if (!heroStage) {
    throw new Error(`Lesson ${lesson.id} requires a heroExperience stage.`);
  }

  return {
    hero: requireBlock(heroStage, "interactiveDiagram"),
    observations: heroStage.blocks.filter(
      (block): block is ObservationQuestionBlock => block.type === "observationQuestion"
    ),
    microTheory: requireBlock(heroStage, "microTheory"),
    challenge: requireBlock(heroStage, "engineeringChallenge"),
    application: requireBlock(heroStage, "realWorldApplication"),
    deepDive: requireBlock(
      lesson.experienceSequence?.find((stage) => stage.stage === "deepDive") ?? heroStage,
      "deepDive"
    )
  };
}

function requireBlock<Type extends VisualBlockType>(
  stage: VisualLessonStage,
  type: Type
): Extract<VisualLessonStage["blocks"][number], { type: Type }> {
  const block = stage.blocks.find(
    (
      candidate
    ): candidate is Extract<VisualLessonStage["blocks"][number], { type: Type }> =>
      candidate.type === type
  );

  if (!block) {
    throw new Error(`Visual stage ${stage.stage} requires a ${type} block.`);
  }

  return block;
}

type VisualBlockType =
  | "interactiveDiagram"
  | "deepDive"
  | "microTheory"
  | "engineeringChallenge"
  | "realWorldApplication";
