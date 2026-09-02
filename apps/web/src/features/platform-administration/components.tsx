import { Alert, Badge, Button } from "@industrial-learn/design-system";

import type { AppRole, AuthenticatedSession } from "../auth/session-core";
import { roleLabel } from "../auth/workspace-access";

import {
  inviteRoleHolderAction,
  manageReviewAssignmentAction,
  manageRoleAction,
  setAccountStatusAction
} from "./actions";
import type { PlatformAdministrationModel } from "./server-data";

const assignableRoles: AppRole[] = [
  "student",
  "lecturer",
  "content_author",
  "engineering_reviewer",
  "administrator",
  "platform_owner"
];

const resultMessages: Record<string, { title: string; message: string }> = {
  role_changed: {
    title: "Role updated",
    message: "The audited role change is active on the user's next request."
  },
  account_disabled: {
    title: "Account disabled",
    message: "The account can no longer resolve an active application session."
  },
  account_enabled: {
    title: "Account enabled",
    message: "The account may authenticate again with its assigned roles."
  },
  invitation_sent: {
    title: "Invitation sent",
    message: "The invited role holder has been registered and an invitation was sent."
  },
  review_assigned: {
    title: "Review assigned",
    message: "The exact content version is now visible in the reviewer's workspace."
  },
  review_cancelled: {
    title: "Review assignment cancelled",
    message: "The reviewer no longer has this active assignment."
  }
};

export function UserRoleManagement({
  model,
  query,
  result,
  session
}: {
  model: PlatformAdministrationModel;
  query: string;
  result?: string | undefined;
  session: AuthenticatedSession;
}) {
  const success = result ? resultMessages[result] : undefined;
  const failed = Boolean(result && !success);
  const owner = session.roles.includes("platform_owner");
  const normalisedQuery = query.toLowerCase();
  const visibleUsers = model.users.filter(
    (user) =>
      !normalisedQuery ||
      user.displayName.toLowerCase().includes(normalisedQuery) ||
      user.email.toLowerCase().includes(normalisedQuery)
  );

  return (
    <div className="management-stack">
      {success ? (
        <Alert title={success.title} tone="normal">
          {success.message}
        </Alert>
      ) : null}
      {failed ? (
        <Alert title="Change not completed" tone="fault">
          The secure management boundary rejected the request. Check the target,
          confirmation, reason, and your authority.
        </Alert>
      ) : null}
      {model.error ? (
        <Alert title="Management data unavailable" tone="fault">
          {model.error}
        </Alert>
      ) : null}

      <section aria-labelledby="invite-user-title" className="management-section">
        <h2 id="invite-user-title">Invite a role holder</h2>
        <p>
          Invitations may create Lecturer, Content Author, or Engineering Reviewer access.
          Owner and administrator access must be assigned separately.
        </p>
        <form action={inviteRoleHolderAction} className="management-form">
          <label>
            Display name
            <input name="displayName" required type="text" />
          </label>
          <label>
            Email address
            <input autoComplete="email" name="email" required type="email" />
          </label>
          <label>
            Initial role
            <select defaultValue="engineering_reviewer" name="role">
              <option value="engineering_reviewer">Engineering Reviewer</option>
              <option value="content_author">Content Author</option>
              <option value="lecturer">Lecturer</option>
            </select>
          </label>
          <label>
            Audit reason
            <textarea minLength={10} name="reason" required rows={3} />
          </label>
          <Confirmation label="I confirm this person requires the selected access." />
          <Button type="submit">Send invitation</Button>
        </form>
      </section>

      <section aria-labelledby="managed-users-title" className="management-section">
        <h2 id="managed-users-title">Users and roles</h2>
        <p>
          Role changes are server-authorised and audited. Users cannot change their own
          privileged access.
        </p>
        <form className="management-form" method="get" role="search">
          <label>
            Find user by name or email
            <input defaultValue={query} name="q" type="search" />
          </label>
          <Button type="submit" variant="secondary">
            Find user
          </Button>
        </form>
        {visibleUsers.length === 0 ? (
          <p>No manageable user records are available.</p>
        ) : (
          <div className="managed-user-list">
            {visibleUsers.map((user) => {
              const isSelf = user.profileId === session.profile.id;
              const isOwnerAccount = user.roles.includes("platform_owner");
              return (
                <article className="managed-user" key={user.profileId}>
                  <header>
                    <div>
                      <h3>{user.displayName}</h3>
                      <p>{user.email}</p>
                    </div>
                    <Badge tone={user.accountStatus === "active" ? "normal" : "fault"}>
                      {user.accountStatus}
                    </Badge>
                  </header>
                  <div aria-label={`Roles for ${user.displayName}`} className="role-list">
                    {user.roles.map((role) => (
                      <Badge key={role} tone="info">
                        {roleLabel(role)}
                      </Badge>
                    ))}
                  </div>
                  {isSelf ? (
                    <Alert title="Current account" tone="info">
                      Self-service privileged role changes are blocked.
                    </Alert>
                  ) : (
                    <div className="management-actions">
                      <form action={manageRoleAction} className="management-form">
                        <input
                          name="targetProfileId"
                          type="hidden"
                          value={user.profileId}
                        />
                        <label>
                          Role
                          <select defaultValue="engineering_reviewer" name="role">
                            {assignableRoles
                              .filter((role) => owner || role !== "platform_owner")
                              .map((role) => (
                                <option key={role} value={role}>
                                  {roleLabel(role)}
                                </option>
                              ))}
                          </select>
                        </label>
                        <label>
                          Change
                          <select defaultValue="add" name="operation">
                            <option value="add">Assign role</option>
                            <option value="remove">Remove role</option>
                          </select>
                        </label>
                        <label>
                          Audit reason
                          <input minLength={10} name="reason" required type="text" />
                        </label>
                        <Confirmation label="I confirm this role change." />
                        <Button type="submit" variant="secondary">
                          Apply role change
                        </Button>
                      </form>

                      {!isOwnerAccount ? (
                        <form action={setAccountStatusAction} className="management-form">
                          <input
                            name="targetProfileId"
                            type="hidden"
                            value={user.profileId}
                          />
                          <input
                            name="operation"
                            type="hidden"
                            value={user.accountStatus === "active" ? "disable" : "enable"}
                          />
                          <label>
                            Account-status reason
                            <input minLength={10} name="reason" required type="text" />
                          </label>
                          <Confirmation
                            label={`I confirm this account should be ${
                              user.accountStatus === "active" ? "disabled" : "enabled"
                            }.`}
                          />
                          <Button type="submit" variant="secondary">
                            {user.accountStatus === "active"
                              ? "Disable account"
                              : "Enable account"}
                          </Button>
                        </form>
                      ) : null}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <ReviewAssignmentManagement model={model} />

      <section aria-labelledby="access-audit-title" className="management-section">
        <h2 id="access-audit-title">Access audit</h2>
        {model.audit.length === 0 ? (
          <p>No role, invitation, or account-status events are recorded yet.</p>
        ) : (
          <ol className="audit-list">
            {model.audit.map((event) => (
              <li key={event.id}>
                <strong>{event.action}</strong>
                <span>{new Date(event.occurredAt).toLocaleString("en-ZA")}</span>
                <span>Target: {event.targetProfileId ?? "System"}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}

function ReviewAssignmentManagement({ model }: { model: PlatformAdministrationModel }) {
  const reviewers = model.users.filter(
    (user) =>
      user.accountStatus === "active" && user.roles.includes("engineering_reviewer")
  );
  const userById = new Map(model.users.map((user) => [user.profileId, user]));

  return (
    <section aria-labelledby="review-assignment-title" className="management-section">
      <h2 id="review-assignment-title">Engineering review assignments</h2>
      <p>
        Assign one named Engineering Reviewer to one exact governed content version.
        Assignment permits review access; it does not publish or approve content.
      </p>
      {model.reviewItems.length === 0 ? (
        <p>No governed items are available for assignment.</p>
      ) : (
        <div className="managed-user-list">
          {model.reviewItems.map((item) => {
            const assignments = model.reviewAssignments.filter(
              (assignment) => assignment.governanceItemId === item.governanceItemId
            );
            return (
              <article className="managed-user" key={item.governanceItemId}>
                <header>
                  <div>
                    <h3>{item.title}</h3>
                    <p>
                      Version {item.contentVersionLabel} (governance revision{" "}
                      {item.contentVersion})
                    </p>
                  </div>
                  <Badge tone="warning">{item.workflowStatus}</Badge>
                </header>
                <p>Publication status: {item.publicationStatus}</p>
                {reviewers.length === 0 ? (
                  <Alert title="Reviewer role required" tone="warning">
                    Assign Engineering Reviewer to an active user before assigning this
                    review.
                  </Alert>
                ) : (
                  <form action={manageReviewAssignmentAction} className="management-form">
                    <input
                      name="governanceItemId"
                      type="hidden"
                      value={item.governanceItemId}
                    />
                    <input
                      name="contentVersion"
                      type="hidden"
                      value={item.contentVersion}
                    />
                    <input name="operation" type="hidden" value="assign" />
                    <label>
                      Engineering Reviewer
                      <select name="reviewerProfileId" required>
                        {reviewers.map((reviewer) => (
                          <option key={reviewer.profileId} value={reviewer.profileId}>
                            {reviewer.displayName} ({reviewer.email})
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Assignment reason
                      <input minLength={10} name="reason" required type="text" />
                    </label>
                    <Confirmation
                      label={`I confirm assignment of content version ${item.contentVersionLabel}.`}
                    />
                    <Button type="submit" variant="secondary">
                      Assign exact version
                    </Button>
                  </form>
                )}
                <h4>Assignment history</h4>
                {assignments.length === 0 ? (
                  <p>No reviewer has been assigned to this version.</p>
                ) : (
                  <div className="dashboard-list">
                    {assignments.map((assignment) => {
                      const reviewer = userById.get(assignment.reviewerProfileId);
                      const canCancel =
                        assignment.status === "assigned" ||
                        assignment.status === "in_progress";
                      return (
                        <div key={assignment.id}>
                          <p>
                            <strong>
                              {reviewer?.displayName ?? "Named Engineering Reviewer"}
                            </strong>
                            : {assignment.status.replaceAll("_", " ")} since{" "}
                            {new Date(assignment.assignedAt).toLocaleString("en-ZA")}
                          </p>
                          <p>
                            Review type: independent engineering approval; exact revision:{" "}
                            {assignment.contentVersion}
                          </p>
                          {canCancel ? (
                            <form
                              action={manageReviewAssignmentAction}
                              className="management-form"
                            >
                              <input
                                name="governanceItemId"
                                type="hidden"
                                value={assignment.governanceItemId}
                              />
                              <input
                                name="contentVersion"
                                type="hidden"
                                value={assignment.contentVersion}
                              />
                              <input
                                name="reviewerProfileId"
                                type="hidden"
                                value={assignment.reviewerProfileId}
                              />
                              <input name="operation" type="hidden" value="cancel" />
                              <label>
                                Cancellation reason
                                <input
                                  minLength={10}
                                  name="reason"
                                  required
                                  type="text"
                                />
                              </label>
                              <Confirmation label="I confirm cancellation of this assignment." />
                              <Button type="submit" variant="secondary">
                                Cancel assignment
                              </Button>
                            </form>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function Confirmation({ label }: { label: string }) {
  return (
    <label className="management-confirmation">
      <input name="confirmed" required type="checkbox" /> <span>{label}</span>
    </label>
  );
}
