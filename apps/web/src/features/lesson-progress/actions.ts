"use server";

import { redirect } from "next/navigation";

import { requireStudentProfile } from "../auth/server";
import {
  BASIC_PRESSURE_LIMITS,
  createBasicPressureLessonModel
} from "../basic-fluid-pressure-lesson/model";
import { recordError, safeHashIdentifier } from "../monitoring/server";
import { recordBasicPressureActivityProgress } from "./server";

const LESSON_PATH = "/lessons/basic-fluid-pressure";
const ASSESSMENT_PATH = "/assessments/basic-fluid-pressure-check";

export async function completeBasicPressureActivityAction(formData: FormData) {
  const session = await requireStudentProfile(LESSON_PATH);
  const forceN = readFiniteNumber(formData.get("forceN"));
  const areaM2 = readFiniteNumber(formData.get("areaM2"));

  if (!session.roles.includes("student") || forceN === null || areaM2 === null) {
    redirect(`${LESSON_PATH}?progress=invalid`);
  }

  const model = createBasicPressureLessonModel({ forceN, areaM2 });
  const withinReviewedInputs =
    forceN >= BASIC_PRESSURE_LIMITS.forceN.min &&
    forceN <= BASIC_PRESSURE_LIMITS.forceN.max &&
    areaM2 >= BASIC_PRESSURE_LIMITS.areaM2.min &&
    areaM2 <= BASIC_PRESSURE_LIMITS.areaM2.max;

  if (
    !withinReviewedInputs ||
    model.validity.status !== "valid" ||
    !model.challenge.complete
  ) {
    redirect(`${LESSON_PATH}?progress=challenge_required`);
  }

  await recordBasicPressureActivityProgress(session).catch((error) => {
    recordError({
      category: "assessment_operation_failure",
      operation: "record_pilot_lesson_activity",
      route: LESSON_PATH,
      safeUserId: safeHashIdentifier(session.profile.id),
      error,
      details: { lessonSlug: "basic-fluid-pressure" }
    });
    throw error;
  });

  redirect(ASSESSMENT_PATH);
}

function readFiniteNumber(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
