import Link from "next/link";

import { Alert, Badge, Button } from "@industrial-learn/design-system";

import { recordContentReviewDecisionAction } from "./actions";
import type { ReviewAssessmentQuestion, ReviewSourceEvidence } from "./review-evidence";
import styles from "./review-detail.module.css";
import type { GovernanceInterfaceItem } from "./server-data";

export function BasicPressureReviewDetail({
  assessment,
  canApprove,
  canRecordDecision,
  item,
  result,
  sources
}: {
  assessment: ReviewAssessmentQuestion[];
  canApprove: boolean;
  canRecordDecision: boolean;
  item: GovernanceInterfaceItem | undefined;
  result?: string | undefined;
  sources: ReviewSourceEvidence[];
}) {
  if (!item?.governanceItemId) {
    return (
      <Alert title="Review record unavailable" tone="fault">
        The exact staging governance item is not available. Decision controls remain
        disabled and no approval can be recorded.
      </Alert>
    );
  }

  return (
    <div
      className={`dashboard-list ${styles.reviewDetail}`}
      aria-label="Basic Fluid Pressure review evidence"
    >
      <ReviewResult result={result} />

      <nav aria-label="Review package sections" className={styles.sectionNavigation}>
        <a href="#review-overview">Overview</a>
        <a href="#review-sources">Sources</a>
        <a href="#review-engineering">Engineering</a>
        <a href="#review-visual">Visual Experience</a>
        <a href="#review-assessment">Assessment</a>
        <a href="#review-accessibility">Accessibility</a>
        <a href="#review-decision-title">Final Decision</a>
      </nav>

      <section
        className="dashboard-card"
        id="review-overview"
        aria-labelledby="review-target-title"
      >
        <p className="eyebrow">Overview</p>
        <h2 id="review-target-title">{item.title}</h2>
        <dl>
          <ReviewField
            label={item.entityType === "assessment" ? "Assessment ID" : "Lesson ID"}
            value={item.id}
          />
          <ReviewField label="Module" value={item.moduleTitle} />
          <ReviewField label="Content version" value={item.contentVersion} />
          <ReviewField label="Governance revision" value={String(item.currentVersion)} />
          <ReviewField label="Author" value={item.authorName} />
          <ReviewField label="Review type" value={item.reviewType} />
          <ReviewField label="Review status" value={item.workflowStatus} />
          <ReviewField label="Publication status" value={item.publicationStatus} />
          {item.artifactSha256 ? (
            <ReviewField label="Artifact SHA-256" value={item.artifactSha256} />
          ) : null}
          {item.relatedLessonId ? (
            <ReviewField
              label="Related lesson"
              value={`${item.relatedLessonId}, version ${item.relatedLessonVersion ?? "unrecorded"}`}
            />
          ) : null}
          <ReviewField
            label="Last modified"
            value={new Date(item.lastModified).toLocaleString("en-ZA")}
          />
        </dl>
        <Badge tone="warning">{item.workflowStatus}</Badge>
        <p>
          A decision applies only to content version {item.contentVersion}, governance
          revision {item.currentVersion}. Publication remains a separate authorised
          action.
        </p>
      </section>

      <section
        className="dashboard-card"
        id="review-sources"
        aria-labelledby="review-sources-title"
      >
        <p className="eyebrow">Sources</p>
        <h2 id="review-sources-title">Source evidence</h2>
        <p>Status: {item.sourceStatus}</p>
        <div className={styles.evidenceGrid}>
          {sources.map((source) => (
            <article className={styles.evidenceItem} key={source.id}>
              <h3>{source.title}</h3>
              <dl>
                <ReviewField label="Source ID" value={source.id} />
                <ReviewField label="Publisher / institution" value={source.publisher} />
                <ReviewField label="Author" value={source.author} />
                <ReviewField label="Edition" value={source.edition} />
                <ReviewField label="Version" value={source.version} />
                <ReviewField
                  label="Relevant section"
                  value={source.sections.join(", ") || "No fixed section recorded"}
                />
                <ReviewField
                  label="Relevant pages"
                  value={source.pages.join(", ") || "Web source; no fixed pages"}
                />
                <ReviewField label="Reliability" value={source.reliability} />
                <ReviewField label="Access / copyright" value={source.accessStatus} />
              </dl>
              {source.viewUrl ? (
                <a href={source.viewUrl} rel="noreferrer" target="_blank">
                  View source evidence
                </a>
              ) : (
                <p>Source file access is restricted; metadata is available for review.</p>
              )}
            </article>
          ))}
        </div>
      </section>

      <section
        className="dashboard-card"
        id="review-engineering"
        aria-labelledby="review-engineering-title"
      >
        <p className="eyebrow">Engineering</p>
        <h2 id="review-engineering-title">Equation and model review</h2>
        <p>
          <strong>Equation:</strong> P = F / A
        </p>
        <dl>
          <ReviewField label="P" value="Pressure, Pa" />
          <ReviewField label="F" value="Magnitude of normal force, N" />
          <ReviewField label="A" value="Area over which the force acts, m^2" />
          <ReviewField label="Equation ID" value={item.equationIds.join(", ")} />
          <ReviewField label="Implementation status" value={item.equationStatus} />
        </dl>
        <h3>Known-answer case</h3>
        <p>
          For F = 200 N and A = 0.50 m^2, the reviewed expected result is P = 400 Pa.
          Evidence: {item.sourceIds.join(", ")}.
        </p>
        <h3>Assumptions and limitations</h3>
        <p>
          The model represents a normal force over a positive stated area with SI inputs.
          It does not model flow, leakage, compressibility, losses, transient response,
          equipment ratings, or structural capacity. Evidence: {item.sourceIds.join(", ")}
          .
        </p>
        <p>
          <strong>Simulation status:</strong> {item.simulationStatus}
        </p>
      </section>

      <section
        className="dashboard-card"
        id="review-visual"
        aria-labelledby="review-visual-title"
      >
        <p className="eyebrow">Visual Experience</p>
        <h2 id="review-visual-title">Student interaction review</h2>
        <p>
          Test the force control, area control, pressure response, live equation,
          challenge, and responsive layout for the exact reviewed version.
        </p>
        <Link
          className="il-button il-button--primary il-button--md"
          href={`/preview/lessons/${item.relatedLessonSlug ?? item.slug}?version=${encodeURIComponent(item.relatedLessonVersion ?? item.contentVersion)}`}
        >
          {item.entityType === "assessment"
            ? "Preview related lesson as Student"
            : "Preview as Student"}
        </Link>
      </section>

      <section
        className="dashboard-card"
        id="review-assessment"
        aria-labelledby="review-assessment-title"
      >
        <p className="eyebrow">Assessment</p>
        <h2 id="review-assessment-title">Protected answer review</h2>
        <Alert title="Reviewer-only evidence" tone="warning">
          Expected answers and explanations on this page must remain absent from
          pre-submission student assessment routes.
        </Alert>
        <div className={styles.evidenceGrid}>
          {assessment.map((question) => (
            <article className={styles.evidenceItem} key={question.id}>
              <h3>{question.id}</h3>
              <p>
                <strong>Learning outcome:</strong> {question.learningOutcomes.join(", ")}
              </p>
              <p>
                <strong>Question:</strong> {question.prompt}
              </p>
              <p>
                <strong>Expected answer:</strong> {question.expectedAnswer}
              </p>
              <p>
                <strong>Explanation:</strong> {question.explanation}
              </p>
              <p>
                <strong>Units / tolerance:</strong> {question.unitsAndTolerance}
              </p>
              <p>
                <strong>Competency:</strong> {question.competency}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section
        className="dashboard-card"
        id="review-accessibility"
        aria-labelledby="review-accessibility-title"
      >
        <p className="eyebrow">Accessibility</p>
        <h2 id="review-accessibility-title">Automated and human checks</h2>
        <p>{item.accessibilityStatus}</p>
        <ul>
          <li>Keyboard operation and visible focus</li>
          <li>Accessible labels and text equivalents</li>
          <li>Contrast and non-colour status communication</li>
          <li>Reduced-motion behaviour</li>
          <li>Mobile layout and zoom</li>
          <li>Numeric alternatives to range controls</li>
        </ul>
      </section>

      <section className="dashboard-card" aria-labelledby="review-history-title">
        <h2 id="review-history-title">Review history</h2>
        {item.decisionHistory.length === 0 ? (
          <p>No human decision has been recorded for this version.</p>
        ) : (
          <ol>
            {item.decisionHistory.map((decision) => (
              <li key={decision.id}>
                <strong>{formatDecision(decision.decision)}</strong> on{" "}
                {new Date(decision.reviewedAt).toLocaleString("en-ZA")}:{" "}
                {decision.comments}
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="dashboard-card" aria-labelledby="review-decision-title">
        <p className="eyebrow">Final Decision</p>
        <h2 id="review-decision-title">Record exact-version decision</h2>
        <Alert title="Independent human decision" tone="warning">
          Access to this package does not grant approval authority. Approval requires an
          authorised reviewer who is not the accountable content author. This action does
          not publish the lesson.
        </Alert>
        {!canRecordDecision ? (
          <Alert title="Inspection access only" tone="info">
            Your current role may inspect and manage this review package but cannot record
            an independent engineering decision. Assign a qualified Engineering Reviewer
            through Users and roles.
          </Alert>
        ) : (
          <form
            action={recordContentReviewDecisionAction}
            className={`dashboard-list ${styles.decisionForm}`}
          >
            <input name="governanceItemId" type="hidden" value={item.governanceItemId} />
            <input name="governanceVersion" type="hidden" value={item.currentVersion} />
            <input name="contentVersion" type="hidden" value={item.contentVersion} />
            <input name="itemSlug" type="hidden" value={item.slug} />

            <fieldset>
              <legend>Decision</legend>
              <DecisionRadio disabled={!canApprove} label="Approve" value="approved" />
              <DecisionRadio label="Request changes" value="changes_requested" />
              <DecisionRadio label="Reject" value="rejected" />
            </fieldset>
            {!canApprove ? (
              <Alert title="Independent approval unavailable" tone="fault">
                Independent engineering review must be completed by another qualified
                reviewer.
              </Alert>
            ) : null}

            <fieldset>
              <legend>Required review attestations</legend>
              <ReviewCheckbox
                label="Sources exist, resolve, support the lesson claims, and have acceptable use status."
                name="sourceReviewComplete"
              />
              <ReviewCheckbox
                label="The equation, units, worked example, and tested cases are correct."
                name="equationReviewComplete"
              />
              <ReviewCheckbox
                label="Safety and model limitations are accurate and do not overstate the model."
                name="safetyLimitationsReviewComplete"
              />
              <ReviewCheckbox
                label="The visual-first sequence, challenge, application, and assessment suit the learning outcomes."
                name="educationalReviewComplete"
              />
              <ReviewCheckbox
                label="Keyboard, numeric alternatives, text equivalents, reduced motion, and mobile behavior are acceptable."
                name="accessibilityReviewComplete"
              />
            </fieldset>

            <label>
              Safety and limitations outcome
              <select defaultValue="" name="safetyReviewOutcome" required>
                <option disabled value="">
                  Select outcome
                </option>
                <option value="passed">Passed</option>
                <option value="not_applicable">
                  No equipment safety procedure in lesson; limitations checked
                </option>
              </select>
            </label>

            <label>
              Review comment or attestation
              <textarea minLength={20} name="comments" required rows={6} />
            </label>
            <ReviewCheckbox
              label={
                item.entityType === "assessment"
                  ? `I confirm that I reviewed the listed sources, governing equation, learning outcomes, protected answers, units, tolerances, explanations, and related lesson for assessment version ${item.contentVersion}.`
                  : `I confirm that I reviewed the listed sources, governing equation, model assumptions, student visualisation, and assessment for content version ${item.contentVersion}.`
              }
              name="exactVersionAttestation"
              required
            />

            <div className={styles.decisionActions}>
              <Button type="submit">Submit review decision</Button>
            </div>
          </form>
        )}
      </section>
    </div>
  );
}

function ReviewResult({ result }: { result?: string | undefined }) {
  if (!result) return null;
  const success = [
    "approved",
    "changes_requested",
    "rejected",
    "local_approved",
    "local_changes_requested",
    "local_rejected"
  ].includes(result);
  return (
    <Alert
      title={success ? "Review decision accepted" : "Review decision not recorded"}
      tone={success ? "normal" : "fault"}
    >
      {success
        ? "The decision was accepted for the exact reviewed version. Approval does not publish the lesson."
        : "The secure review gate rejected this submission. Recheck the current version, required attestations, role, and comment."}
    </Alert>
  );
}

function ReviewField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function ReviewCheckbox({
  label,
  name,
  required = false
}: {
  label: string;
  name: string;
  required?: boolean;
}) {
  return (
    <label>
      <input name={name} required={required} type="checkbox" /> <span>{label}</span>
    </label>
  );
}

function DecisionRadio({
  disabled = false,
  label,
  value
}: {
  disabled?: boolean;
  label: string;
  value: string;
}) {
  return (
    <label>
      <input disabled={disabled} name="decision" required type="radio" value={value} />{" "}
      <span>{label}</span>
    </label>
  );
}

function formatDecision(
  decision: GovernanceInterfaceItem["decisionHistory"][number]["decision"]
) {
  return decision.replaceAll("_", " ");
}
