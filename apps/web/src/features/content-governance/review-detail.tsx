import { Alert, Badge, Button } from "@industrial-learn/design-system";

import { recordContentReviewDecisionAction } from "./actions";
import styles from "./review-detail.module.css";
import type { GovernanceInterfaceItem } from "./server-data";

export function BasicPressureReviewDetail({
  item,
  result
}: {
  item: GovernanceInterfaceItem | undefined;
  result?: string | undefined;
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

      <section className="dashboard-card" aria-labelledby="review-target-title">
        <h2 id="review-target-title">Review target</h2>
        <dl>
          <ReviewField label="Lesson" value={`${item.title} (${item.id})`} />
          <ReviewField label="Content version" value={item.contentVersion} />
          <ReviewField label="Governance revision" value={String(item.currentVersion)} />
          <ReviewField label="Workflow status" value={item.workflowStatus} />
          <ReviewField label="Publication status" value={item.publicationStatus} />
          <ReviewField label="Accountable author" value={item.authorName} />
        </dl>
        <Badge tone="warning">{item.workflowStatus}</Badge>
        <p>
          A decision applies only to content version {item.contentVersion}, governance
          revision {item.currentVersion}. Publication remains a separate administrator
          action.
        </p>
      </section>

      <section className="dashboard-card" aria-labelledby="review-evidence-title">
        <h2 id="review-evidence-title">Evidence package</h2>
        <EvidenceRow label="Source package" value={item.sourceIds.join(", ")} />
        <EvidenceRow
          label="Source verification"
          value="OpenStax section 11.3 and the Penn State pressure module are registered and mapped; McGraw Hill acquisition remains required and is not cited."
        />
        <EvidenceRow
          label="Equation review"
          value={`${item.equationIds.join(", ")} with known-answer, boundary, invalid-input, and explicit-conversion tests.`}
        />
        <EvidenceRow
          label="Model assumptions"
          value="Normal force over a positive stated area; SI inputs; no flow, leakage, compressibility, losses, transient response, equipment rating, or structural capacity model."
        />
        <EvidenceRow
          label="Visual-learning review"
          value="Visual-first force and area interaction, live pressure, three observations, optional depth, 200 kPa challenge, and press application."
        />
        <EvidenceRow
          label="Accessibility review"
          value="Paired sliders and numeric inputs, keyboard controls, text state and vector equivalents, announced results, reduced motion, and mobile layout checks."
        />
        <EvidenceRow
          label="Assessment review"
          value="Five questions map only to LO-FP-001 through LO-FP-003; maximum competency is Calculated."
        />
      </section>

      <section className="dashboard-card" aria-labelledby="review-history-title">
        <h2 id="review-history-title">Reviewer comments and decisions</h2>
        {item.decisionHistory.length === 0 ? (
          <p>No human decision has been recorded for this version.</p>
        ) : (
          <ol>
            {item.decisionHistory.map((decision) => (
              <li key={decision.id}>
                <strong>{formatDecision(decision.decision)}</strong> on{" "}
                {decision.reviewedAt}: {decision.comments}
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="dashboard-card" aria-labelledby="review-decision-title">
        <h2 id="review-decision-title">Decision controls</h2>
        <Alert title="Independent human decision" tone="warning">
          Approve only after operating the visual, checking the exact evidence, and
          confirming that you are not the content author. This form does not publish the
          lesson.
        </Alert>
        <form
          action={recordContentReviewDecisionAction}
          className={`dashboard-list ${styles.decisionForm}`}
        >
          <input name="governanceItemId" type="hidden" value={item.governanceItemId} />
          <input name="governanceVersion" type="hidden" value={item.currentVersion} />
          <input name="contentVersion" type="hidden" value={item.contentVersion} />

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

          <div className={styles.decisionActions}>
            <Button
              name="decision"
              type="submit"
              value="changes_requested"
              variant="secondary"
            >
              Request changes
            </Button>
            <Button name="decision" type="submit" value="approved">
              Approve
            </Button>
            <Button name="decision" type="submit" value="rejected" variant="secondary">
              Reject
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}

function ReviewResult({ result }: { result?: string | undefined }) {
  if (!result) {
    return null;
  }

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

function EvidenceRow({ label, value }: { label: string; value: string }) {
  return (
    <p>
      <strong>{label}:</strong> {value}
    </p>
  );
}

function ReviewCheckbox({ label, name }: { label: string; name: string }) {
  return (
    <label>
      <input name={name} type="checkbox" /> <span>{label}</span>
    </label>
  );
}

function formatDecision(
  decision: GovernanceInterfaceItem["decisionHistory"][number]["decision"]
) {
  return decision.replaceAll("_", " ");
}
