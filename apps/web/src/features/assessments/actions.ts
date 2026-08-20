"use server";

import { redirect } from "next/navigation";

import { requireStudentProfile } from "../auth/server";
import { recordError, safeHashIdentifier } from "../monitoring/server";
import { parseAssessmentAnswers } from "./answers";
import {
  loadAssessmentAttemptPage,
  saveAssessmentAttemptForStudent,
  startAssessmentForStudent,
  submitAssessmentAttemptForStudent
} from "./server";

export async function startAssessmentAction(formData: FormData) {
  const slug = requiredString(formData, "assessmentSlug");
  const session = await requireStudentProfile(`/assessments/${slug}`);
  const attempt = await startAssessmentForStudent(session, slug).catch((error) => {
    recordError({
      category: "assessment_operation_failure",
      operation: "start_assessment_attempt",
      route: `/assessments/${slug}`,
      safeUserId: safeHashIdentifier(session.profile.id),
      error,
      details: { assessmentSlug: slug }
    });
    throw error;
  });

  redirect(`/assessments/${slug}/attempt/${attempt.id}`);
}

export async function saveAssessmentProgressAction(formData: FormData) {
  const slug = requiredString(formData, "assessmentSlug");
  const attemptId = requiredString(formData, "attemptId");
  const session = await requireStudentProfile(
    `/assessments/${slug}/attempt/${attemptId}`
  );
  const page = await loadAssessmentAttemptPage(session, slug, attemptId);

  if (!page) {
    redirect(`/assessments/${slug}?error=attempt_not_found`);
  }

  const parsed = parseAssessmentAnswers(page.deliveredAssessment, formData, {
    requireComplete: false
  });

  if (parsed.invalidMessages.length > 0) {
    recordError({
      category: "assessment_operation_failure",
      operation: "save_assessment_progress_validation",
      route: `/assessments/${slug}/attempt/${attemptId}`,
      safeUserId: safeHashIdentifier(session.profile.id),
      error: new Error("Assessment progress validation failed."),
      details: {
        assessmentSlug: slug,
        attemptId,
        invalidMessageCount: parsed.invalidMessages.length
      }
    });
    redirect(
      `/assessments/${slug}/attempt/${attemptId}?error=${encodeURIComponent(
        parsed.invalidMessages[0] ?? "Invalid answer."
      )}`
    );
  }

  await saveAssessmentAttemptForStudent({
    session,
    slug,
    attemptId,
    answers: parsed.answers
  }).catch((error) => {
    recordError({
      category: "assessment_operation_failure",
      operation: "save_assessment_progress",
      route: `/assessments/${slug}/attempt/${attemptId}`,
      safeUserId: safeHashIdentifier(session.profile.id),
      error,
      details: { assessmentSlug: slug, attemptId }
    });
    throw error;
  });

  redirect(`/assessments/${slug}/attempt/${attemptId}?saved=1`);
}

export async function submitAssessmentAction(formData: FormData) {
  const slug = requiredString(formData, "assessmentSlug");
  const attemptId = requiredString(formData, "attemptId");
  const idempotencyKey =
    stringValue(formData.get("idempotencyKey")) || `${attemptId}:final-submit`;
  const session = await requireStudentProfile(
    `/assessments/${slug}/attempt/${attemptId}`
  );
  const page = await loadAssessmentAttemptPage(session, slug, attemptId);

  if (!page) {
    redirect(`/assessments/${slug}?error=attempt_not_found`);
  }

  const parsed = parseAssessmentAnswers(page.deliveredAssessment, formData, {
    requireComplete: true
  });

  if (parsed.invalidMessages.length > 0 || parsed.missingQuestionIds.length > 0) {
    await saveAssessmentAttemptForStudent({
      session,
      slug,
      attemptId,
      answers: parsed.answers
    });
    recordError({
      category: "assessment_operation_failure",
      operation: "submit_assessment_validation",
      route: `/assessments/${slug}/attempt/${attemptId}`,
      safeUserId: safeHashIdentifier(session.profile.id),
      error: new Error("Assessment final submission validation failed."),
      details: {
        assessmentSlug: slug,
        attemptId,
        invalidMessageCount: parsed.invalidMessages.length,
        missingQuestionCount: parsed.missingQuestionIds.length
      }
    });
    const message =
      parsed.invalidMessages[0] ??
      `Answer every question before final submission. Missing: ${parsed.missingQuestionIds.join(", ")}.`;
    redirect(
      `/assessments/${slug}/attempt/${attemptId}?error=${encodeURIComponent(message)}`
    );
  }

  await submitAssessmentAttemptForStudent({
    session,
    slug,
    attemptId,
    answers: parsed.answers,
    idempotencyKey
  }).catch((error) => {
    recordError({
      category: "assessment_operation_failure",
      operation: "submit_assessment_attempt",
      route: `/assessments/${slug}/attempt/${attemptId}`,
      safeUserId: safeHashIdentifier(session.profile.id),
      error,
      details: { assessmentSlug: slug, attemptId }
    });
    throw error;
  });

  redirect(`/assessments/${slug}/attempt/${attemptId}/review`);
}

function requiredString(formData: FormData, key: string) {
  const value = stringValue(formData.get(key));
  if (!value) {
    throw new Error(`Missing ${key}.`);
  }
  return value;
}

function stringValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}
