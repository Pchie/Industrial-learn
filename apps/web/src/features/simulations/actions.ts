"use server";

import { redirect } from "next/navigation";

import { requireStudentProfile } from "../auth/server";
import { recordError, safeHashIdentifier } from "../monitoring/server";
import {
  completeSimulationForStudent,
  loadSimulationAttemptPage,
  startSimulationForStudent
} from "./server";
import { parseSimulationCompletionPayload, parseSimulationMode } from "./state";

export async function startSimulationAction(formData: FormData) {
  const slug = requiredString(formData, "simulationSlug");
  const mode = parseSimulationMode(requiredString(formData, "mode"));
  if (!mode) {
    redirect(`/simulations/${slug}?error=invalid_mode`);
  }

  const session = await requireStudentProfile(`/simulations/${slug}`);
  const attempt = await startSimulationForStudent(session, slug, mode).catch((error) => {
    recordError({
      category: "simulation_operation_failure",
      operation: "start_simulation_attempt",
      route: `/simulations/${slug}`,
      safeUserId: safeHashIdentifier(session.profile.id),
      error,
      details: { simulationSlug: slug, mode }
    });
    throw error;
  });
  redirect(`/simulations/${slug}/attempt/${attempt.id}`);
}

export async function completeSimulationAction(formData: FormData) {
  const slug = requiredString(formData, "simulationSlug");
  const attemptId = requiredString(formData, "attemptId");
  const idempotencyKey =
    stringValue(formData.get("idempotencyKey")) || `${attemptId}:simulation-final`;
  const session = await requireStudentProfile(
    `/simulations/${slug}/attempt/${attemptId}`
  );
  const page = await loadSimulationAttemptPage(session, slug, attemptId);

  if (!page) {
    redirect(`/simulations/${slug}?error=attempt_not_found`);
  }

  try {
    const parsed = parseSimulationCompletionPayload(
      requiredString(formData, "simulationState"),
      stringValue(formData.get("diagnosisSubmitted")) || "{}",
      stringValue(formData.get("submittedAssessmentValue")) || ""
    );

    await completeSimulationForStudent({
      session,
      slug,
      attemptId,
      finalState: parsed.finalState,
      diagnosisSubmitted: {
        ...parsed.diagnosisSubmitted,
        mode: page.attempt.mode
      },
      submittedAssessmentValue: parsed.submittedAssessmentValue,
      idempotencyKey
    });
  } catch (error) {
    recordError({
      category: "simulation_operation_failure",
      operation: "complete_simulation_attempt",
      route: `/simulations/${slug}/attempt/${attemptId}`,
      safeUserId: safeHashIdentifier(session.profile.id),
      error,
      details: { simulationSlug: slug, attemptId, mode: page.attempt.mode }
    });
    const message =
      error instanceof Error ? error.message : "Simulation completion failed.";
    redirect(
      `/simulations/${slug}/attempt/${attemptId}?error=${encodeURIComponent(message)}`
    );
  }

  redirect(`/simulations/${slug}/attempt/${attemptId}/review`);
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
