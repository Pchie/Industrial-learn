"use server";

import { createSupabaseServerClient } from "@industrial-learn/database";
import { getServerEnv } from "@industrial-learn/env";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { readSessionTokens, requireAnyRole } from "../auth/server";

import { loadReviewGovernanceModel } from "./server-data";

const BASIC_PRESSURE_SLUG = "basic-fluid-pressure";

export async function recordContentReviewDecisionAction(formData: FormData) {
  const session = await requireAnyRole(
    ["engineering_reviewer", "administrator"],
    `/review/${BASIC_PRESSURE_SLUG}`
  );
  const { accessToken } = await readSessionTokens();
  const decision = readDecision(formData.get("decision"));
  const comments = readText(formData.get("comments"));
  const governanceItemId = readText(formData.get("governanceItemId"));
  const governanceVersion = Number(formData.get("governanceVersion"));
  const contentVersion = readText(formData.get("contentVersion"));
  const safetyReviewOutcome = readSafetyOutcome(formData.get("safetyReviewOutcome"));

  if (!decision || comments.length < 20 || !accessToken) {
    redirect(reviewUrl("invalid_submission"));
  }

  const model = await loadReviewGovernanceModel(session, accessToken);
  const item = model.items.find(
    (candidate) =>
      candidate.slug === BASIC_PRESSURE_SLUG &&
      candidate.governanceItemId === governanceItemId
  );

  if (
    !item ||
    !item.governanceItemId ||
    item.currentVersion !== governanceVersion ||
    item.contentVersion !== contentVersion ||
    item.workflowStatus !== "Engineering review required"
  ) {
    redirect(reviewUrl("version_conflict"));
  }

  const verifiedGovernanceItemId = item.governanceItemId;

  const evidenceChecked = {
    source_review_complete: formData.get("sourceReviewComplete") === "on",
    equation_review_complete: formData.get("equationReviewComplete") === "on",
    safety_limitations_review_complete:
      formData.get("safetyLimitationsReviewComplete") === "on",
    educational_review_complete: formData.get("educationalReviewComplete") === "on",
    accessibility_review_complete: formData.get("accessibilityReviewComplete") === "on"
  };

  if (
    decision === "approved" &&
    (!Object.values(evidenceChecked).every(Boolean) || !safetyReviewOutcome)
  ) {
    redirect(reviewUrl("incomplete_attestation"));
  }

  if (isLocalGovernanceMode()) {
    redirect(reviewUrl(`local_${decision}`));
  }

  const client = createSupabaseServerClient(getServerEnv(), accessToken);
  const { error } = await client.rpc("record_content_review_decision", {
    p_governance_item_id: verifiedGovernanceItemId,
    p_governance_version: item.currentVersion,
    p_content_version_label: item.contentVersion,
    p_decision: decision,
    p_notes: comments,
    p_evidence_checked: evidenceChecked,
    p_source_ids_checked: item.sourceIds,
    p_equation_ids_checked: item.equationIds,
    p_safety_review_outcome: safetyReviewOutcome ?? "not_applicable"
  });

  if (error) {
    redirect(reviewUrl("database_rejected"));
  }

  revalidatePath("/review");
  revalidatePath(`/review/${BASIC_PRESSURE_SLUG}`);
  redirect(reviewUrl(decision));
}

function readDecision(value: FormDataEntryValue | null) {
  return value === "approved" || value === "changes_requested" || value === "rejected"
    ? value
    : null;
}

function readSafetyOutcome(value: FormDataEntryValue | null) {
  return value === "passed" || value === "not_applicable" ? value : null;
}

function readText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function reviewUrl(result: string) {
  return `/review/${BASIC_PRESSURE_SLUG}?review_result=${encodeURIComponent(result)}`;
}

function isLocalGovernanceMode() {
  return (
    process.env.INDUSTRIAL_LEARN_AUTH_MODE === "local" &&
    process.env.INDUSTRIAL_LEARN_E2E === "true"
  );
}
