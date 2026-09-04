import { completeBasicPressureActivityAction } from "../lesson-progress/actions";
import { BasicFluidPressureVisualLesson } from "./basic-fluid-pressure-visual-lesson";
import type { BasicPressureExperienceContent } from "./content";

export function BasicFluidPressureVisualExperience({
  canSaveProgress,
  content
}: {
  canSaveProgress: boolean;
  content: BasicPressureExperienceContent;
}) {
  return (
    <BasicFluidPressureVisualLesson
      canSaveProgress={canSaveProgress}
      content={content}
      progressAction={completeBasicPressureActivityAction}
    />
  );
}
