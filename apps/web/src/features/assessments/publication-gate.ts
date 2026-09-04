export type AssessmentReleaseDescriptor = {
  slug: string;
  contentId: string;
  contentVersion: number;
  artifactSha256: string;
  lessonId: string;
  lessonSlug: string;
  lessonVersion: string;
  moduleSlug: string;
};

export type AssessmentPublicationRecord = {
  slug: string;
  content_id?: string | null;
  version: number;
  published_version?: number | null;
  artifact_sha256?: string | null;
  lesson_content_id?: string | null;
  lesson_slug?: string | null;
  lesson_content_version?: string | null;
  module_slug?: string | null;
  technical_review_status: string;
  publication_status: string;
  governance_item_id?: string | null;
  review_record_id?: string | null;
  publication_authorization_id?: string | null;
  answer_protection_status?: string | null;
  unresolved_review_blockers?: boolean | null;
  published_at?: string | null;
};

export type AssessmentPublicationGate = {
  allowed: boolean;
  reasons: string[];
};

export function evaluateAssessmentPublicationGate(
  descriptor: AssessmentReleaseDescriptor,
  record: AssessmentPublicationRecord
): AssessmentPublicationGate {
  const reasons: string[] = [];

  check(reasons, record.slug === descriptor.slug, "Assessment slug does not match.");
  check(
    reasons,
    record.content_id === descriptor.contentId,
    "Assessment content ID does not match."
  );
  check(
    reasons,
    record.version === descriptor.contentVersion,
    "Assessment content version does not match."
  );
  check(
    reasons,
    record.published_version === descriptor.contentVersion,
    "Assessment published-version pointer does not match."
  );
  check(
    reasons,
    record.artifact_sha256 === descriptor.artifactSha256,
    "Assessment artifact hash does not match."
  );
  check(
    reasons,
    record.lesson_content_id === descriptor.lessonId,
    "Related lesson ID does not match."
  );
  check(
    reasons,
    record.lesson_slug === descriptor.lessonSlug,
    "Related lesson slug does not match."
  );
  check(
    reasons,
    record.lesson_content_version === descriptor.lessonVersion,
    "Related lesson version does not match."
  );
  check(
    reasons,
    record.module_slug === descriptor.moduleSlug,
    "Related module slug does not match."
  );
  check(
    reasons,
    record.technical_review_status === "Approved for student use",
    "Assessment is not approved for student use."
  );
  check(
    reasons,
    record.publication_status === "published",
    "Assessment is not published."
  );
  check(
    reasons,
    Boolean(record.governance_item_id),
    "Assessment governance item is missing."
  );
  check(
    reasons,
    Boolean(record.review_record_id),
    "Assessment review record is missing."
  );
  check(
    reasons,
    Boolean(record.publication_authorization_id),
    "Assessment publication authorization is missing."
  );
  check(
    reasons,
    record.answer_protection_status === "server_only",
    "Assessment answer protection is not verified."
  );
  check(
    reasons,
    record.unresolved_review_blockers === false,
    "Assessment has an unresolved review blocker."
  );
  check(reasons, Boolean(record.published_at), "Assessment publication time is missing.");

  return { allowed: reasons.length === 0, reasons };
}

function check(reasons: string[], condition: boolean, reason: string) {
  if (!condition) {
    reasons.push(reason);
  }
}
