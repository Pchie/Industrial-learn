import type { StaticTechnicalReviewRecord } from "@industrial-learn/content-review-workflow/static-review-record";
import basicFluidPressureEngineeringApproval from "../../../../../content/reviews/basic-fluid-pressure-v040-engineering-approval.json";
import basicFluidPressurePublicationAuthorization from "../../../../../content/reviews/basic-fluid-pressure-v040-publication-authorization.json";

const staticTechnicalReviewRecords: readonly StaticTechnicalReviewRecord[] = [
  basicFluidPressureEngineeringApproval as StaticTechnicalReviewRecord,
  basicFluidPressurePublicationAuthorization as StaticTechnicalReviewRecord
];

export function getStaticTechnicalReviewRecords() {
  return staticTechnicalReviewRecords;
}
