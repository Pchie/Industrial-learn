import type {
  EngineeringChallengeBlock,
  HeroSimulationBlock,
  MicroTheoryBlock,
  ObservationQuestionBlock,
  RealWorldApplicationBlock,
  StructuredLesson,
  VisualLessonStage
} from "../lesson-engine/types";

export type HydraulicCylinderExperienceContent = {
  hero: HeroSimulationBlock;
  observations: ObservationQuestionBlock[];
  microTheory: MicroTheoryBlock;
  challenge: EngineeringChallengeBlock;
  application: RealWorldApplicationBlock;
};

export function getHydraulicCylinderExperienceContent(
  lesson: StructuredLesson
): HydraulicCylinderExperienceContent {
  const heroStage = lesson.experienceSequence?.find(
    (stage) => stage.stage === "heroExperience"
  );

  if (!heroStage) {
    throw new Error(`Lesson ${lesson.id} requires a heroExperience stage.`);
  }

  return {
    hero: requireBlock(heroStage, "heroSimulation"),
    observations: heroStage.blocks.filter(
      (block): block is ObservationQuestionBlock => block.type === "observationQuestion"
    ),
    microTheory: requireBlock(heroStage, "microTheory"),
    challenge: requireBlock(heroStage, "engineeringChallenge"),
    application: requireBlock(heroStage, "realWorldApplication")
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
  "heroSimulation" | "microTheory" | "engineeringChallenge" | "realWorldApplication";
