import { Alert, Badge } from "@industrial-learn/design-system";
import Link from "next/link";
import type { GovernanceInterfaceModel } from "./server-data";

export function AuthorWorkspace({ model }: { model: GovernanceInterfaceModel }) {
  return (
    <div className="dashboard-list" aria-label="Author governance workspace">
      <Alert title="Structured draft editor" tone="info">
        Draft editing uses structured content versions. Published versions are not
        overwritten in place.
      </Alert>
      <GovernanceSections model={model} mode="author" />
    </div>
  );
}

export function ReviewWorkspace({ model }: { model: GovernanceInterfaceModel }) {
  return (
    <div className="dashboard-list" aria-label="Engineering review workspace">
      <Alert title="Publication gate" tone="warning">
        Approval requires required evidence, named reviewer records, and review dates.
      </Alert>
      {model.error ? (
        <Alert title="Review data unavailable" tone="fault">
          {model.error}
        </Alert>
      ) : null}
      <GovernanceSections model={model} mode="review" />
    </div>
  );
}

function GovernanceSections({
  mode,
  model
}: {
  mode: "author" | "review";
  model: GovernanceInterfaceModel;
}) {
  if (model.items.length === 0) {
    return <p>No content governance records are available for {model.actorName}.</p>;
  }

  return (
    <>
      <section aria-labelledby={`${mode}-draft-list`}>
        <h2 id={`${mode}-draft-list`}>
          {mode === "author" ? "Draft list" : "Review queue"}
        </h2>
        {model.items.map((item) => (
          <article className="dashboard-card" key={item.id}>
            <h3>{item.title}</h3>
            <p>{item.entityType}</p>
            <Badge tone="info">{item.workflowStatus}</Badge>
            <Badge tone="normal">{item.publicationStatus}</Badge>
            <dl>
              <div>
                <dt>Current version</dt>
                <dd>{item.currentVersion}</dd>
              </div>
              <div>
                <dt>Published version</dt>
                <dd>{item.publishedVersion ?? "Not published"}</dd>
              </div>
            </dl>
            {mode === "review" ? (
              <Link
                className="il-button il-button--secondary il-button--md"
                href={`/review/${item.slug}`}
              >
                Open review item
              </Link>
            ) : null}
          </article>
        ))}
      </section>

      <section aria-labelledby={`${mode}-detail`}>
        <h2 id={`${mode}-detail`}>Review detail</h2>
        {model.items.map((item) => (
          <article className="dashboard-card" key={`${item.id}-detail`}>
            <h3>{item.title}</h3>
            <p>Source attachment: {item.sourceIds.join(", ") || "Source required"}</p>
            <p>Required reviews: {item.requiredReviews.join(", ")}</p>
            <p>Completed reviews: {item.completedReviews.join(", ") || "None"}</p>
            <p>Reviewer comments: {item.reviewerComments.join(" ") || "None"}</p>
            <div className="dashboard-section__action">
              {mode === "review" ? (
                <Link
                  className="il-button il-button--secondary il-button--md"
                  href={`/review/${item.slug}#review-decision-title`}
                >
                  Review exact version
                </Link>
              ) : null}
            </div>
          </article>
        ))}
      </section>

      <section aria-labelledby={`${mode}-history`}>
        <h2 id={`${mode}-history`}>Version history</h2>
        <p>Published versions remain reproducible for historical assessment attempts.</p>
      </section>
    </>
  );
}
