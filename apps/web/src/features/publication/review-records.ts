import type { StaticTechnicalReviewRecord } from "@industrial-learn/content-review-workflow/static-review-record";

const staticTechnicalReviewRecords: readonly StaticTechnicalReviewRecord[] = [];

export function getStaticTechnicalReviewRecords() {
  return staticTechnicalReviewRecords;
}
