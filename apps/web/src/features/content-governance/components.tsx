import Link from "next/link";

import { Alert, Badge } from "@industrial-learn/design-system";

import type { GovernanceInterfaceItem, GovernanceInterfaceModel } from "./server-data";

export function AuthorWorkspace({ model }: { model: GovernanceInterfaceModel }) {
  return (
    <div className="dashboard-list" aria-label="Author governance workspace">
      <Alert title="Structured draft editor" tone="info">
        Draft editing uses structured content versions. Published versions are not
        overwritten in place.
      </Alert>
      <AuthorSection title="My drafts" items={model.items} />
      <AuthorSection
        title="Lessons requiring changes"
        items={model.items.filter((item) =>
          item.decisionHistory.some(
            (decision) => decision.decision === "changes_requested"
          )
        )}
      />
      <section className="management-section" aria-labelledby="author-tools-title">
        <h2 id="author-tools-title">Authoring tools</h2>
        <ul className="capability-list">
          <li>Create lesson and edit structured content</li>
          <li>Attach source evidence</li>
          <li>Prepare simulation and assessment content</li>
          <li>Submit an exact content version for review</li>
          <li>Inspect version history</li>
        </ul>
        <p>
          These controls remain version-gated. This workspace does not expose unrelated
          student-private records.
        </p>
      </section>
      <ReviewHistory model={model} mode="author" />
    </div>
  );
}

export function ReviewWorkspace({ model }: { model: GovernanceInterfaceModel }) {
  const awaiting = model.items.filter(
    (item) =>
      !item.isAssignedToActor &&
      item.workflowStatus === "Engineering review required" &&
      !item.decisionHistory.some((decision) => decision.decision === "approved")
  );
  const assigned = model.items.filter((item) => item.isAssignedToActor);
  const changesRequested = model.items.filter((item) =>
    item.decisionHistory.some((decision) => decision.decision === "changes_requested")
  );
  const approved = model.items.filter(
    (item) =>
      item.workflowStatus === "Approved for student use" ||
      item.decisionHistory.some((decision) => decision.decision === "approved")
  );

  return (
    <div className="dashboard-list" aria-label="Engineering review workspace">
      <Alert title="Publication gate" tone="warning">
        Access authority is separate from independent review authority. Approval requires
        required evidence, a qualified named reviewer, and an exact-version review date.
      </Alert>
      {model.error ? (
        <Alert title="Review data unavailable" tone="fault">
          {model.error}
        </Alert>
      ) : null}
      {!model.error && model.items.length === 0 ? (
        <Alert title="No assigned reviews" tone="info">
          No governed review package is currently assigned to this account. The Platform
          Owner or an administrator can assign an exact content version.
        </Alert>
      ) : null}
      <ReviewQueueSection items={awaiting} title="Awaiting review" />
      <ReviewQueueSection items={assigned} title="Assigned to me" />
      <ReviewQueueSection items={changesRequested} title="Changes requested" />
      <ReviewQueueSection items={approved} title="Approved" />
      <ReviewHistory model={model} mode="review" />
    </div>
  );
}

function AuthorSection({
  items,
  title
}: {
  items: GovernanceInterfaceItem[];
  title: string;
}) {
  const id = `author-${title.toLowerCase().replaceAll(" ", "-")}`;
  return (
    <section aria-labelledby={id}>
      <h2 id={id}>{title}</h2>
      {items.length === 0 ? (
        <p>No items in this section.</p>
      ) : (
        items.map((item) => <GovernanceCard item={item} key={item.id} mode="author" />)
      )}
    </section>
  );
}

function ReviewQueueSection({
  items,
  title
}: {
  items: GovernanceInterfaceItem[];
  title: string;
}) {
  const id = `review-${title.toLowerCase().replaceAll(" ", "-")}`;
  return (
    <section aria-labelledby={id}>
      <h2 id={id}>{title}</h2>
      {items.length === 0 ? (
        <p>No review items in this section.</p>
      ) : (
        items.map((item) => <GovernanceCard item={item} key={item.id} mode="review" />)
      )}
    </section>
  );
}

function GovernanceCard({
  item,
  mode
}: {
  item: GovernanceInterfaceItem;
  mode: "author" | "review";
}) {
  return (
    <article className="dashboard-card">
      <header className="governance-card__header">
        <div>
          <h3>{item.title}</h3>
          <p>{item.moduleTitle}</p>
        </div>
        <Badge tone="warning">{item.workflowStatus}</Badge>
      </header>
      <dl className="definition-grid">
        <div>
          <dt>Version</dt>
          <dd>{item.contentVersion}</dd>
        </div>
        <div>
          <dt>Author</dt>
          <dd>{item.authorName}</dd>
        </div>
        <div>
          <dt>Review type</dt>
          <dd>{item.reviewType}</dd>
        </div>
        <div>
          <dt>Sources</dt>
          <dd>{item.sourceStatus}</dd>
        </div>
        <div>
          <dt>Equation</dt>
          <dd>{item.equationStatus}</dd>
        </div>
        <div>
          <dt>Simulation</dt>
          <dd>{item.simulationStatus}</dd>
        </div>
        <div>
          <dt>Accessibility</dt>
          <dd>{item.accessibilityStatus}</dd>
        </div>
        <div>
          <dt>Governance state</dt>
          <dd>{item.publicationStatus}</dd>
        </div>
        {item.assignment ? (
          <div>
            <dt>Assignment</dt>
            <dd>
              {item.assignment.status.replaceAll("_", " ")} for revision{" "}
              {item.assignment.contentVersion}
            </dd>
          </div>
        ) : null}
      </dl>
      {mode === "review" ? (
        <Link
          className="il-button il-button--secondary il-button--md"
          href={`/review/${item.slug}`}
        >
          Open review package
        </Link>
      ) : (
        <p>Current version: {item.currentVersion}. Version history remains preserved.</p>
      )}
    </article>
  );
}

function ReviewHistory({
  mode,
  model
}: {
  mode: "author" | "review";
  model: GovernanceInterfaceModel;
}) {
  const decisions = model.items.flatMap((item) =>
    item.decisionHistory.map((decision) => ({ item, decision }))
  );
  return (
    <section aria-labelledby={`${mode}-review-history`}>
      <h2 id={`${mode}-review-history`}>Review history</h2>
      {decisions.length === 0 ? (
        <p>No human review decisions have been recorded.</p>
      ) : (
        <ol>
          {decisions.map(({ decision, item }) => (
            <li key={decision.id}>
              {item.title}: {decision.decision.replaceAll("_", " ")} for version{" "}
              {decision.governanceVersion}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
