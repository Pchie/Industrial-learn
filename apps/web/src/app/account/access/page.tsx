import { Badge, Breadcrumbs } from "@industrial-learn/design-system";
import { getServerEnv } from "@industrial-learn/env";

import { requireAuthenticatedUser } from "@/features/auth/server";
import {
  availableWorkspaces,
  primaryRoleLabel,
  roleLabel
} from "@/features/auth/workspace-access";

export default async function AccountAccessPage() {
  const session = await requireAuthenticatedUser("/account/access");
  const environment = getServerEnv().appEnv;

  return (
    <div className="operational-page page-stack">
      <Breadcrumbs
        items={[
          { href: "/workspace", label: "Workspace" },
          { href: "/account/access", label: "Account access" }
        ]}
      />
      <header className="operational-header">
        <p className="eyebrow">Profile and permissions</p>
        <h1>Account access</h1>
        <p>Review the roles and workspaces resolved by the trusted server session.</p>
      </header>
      <section className="management-section" aria-labelledby="identity-title">
        <h2 id="identity-title">Identity</h2>
        <dl className="definition-grid">
          <div>
            <dt>Name</dt>
            <dd>{session.profile.displayName}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{session.email}</dd>
          </div>
          <div>
            <dt>Primary role</dt>
            <dd>{primaryRoleLabel(session.roles)}</dd>
          </div>
          <div>
            <dt>Account status</dt>
            <dd>{session.profile.accountStatus}</dd>
          </div>
          <div>
            <dt>Environment</dt>
            <dd>{environment}</dd>
          </div>
        </dl>
      </section>
      <section className="management-section" aria-labelledby="roles-title">
        <h2 id="roles-title">Assigned roles</h2>
        <div className="role-list">
          {session.roles.map((role) => (
            <Badge key={role} tone="info">
              {roleLabel(role)}
            </Badge>
          ))}
        </div>
        <p>
          Role changes take effect on the next page request; no token or secret is shown
          here.
        </p>
      </section>
      <section className="management-section" aria-labelledby="workspaces-title">
        <h2 id="workspaces-title">Authorised workspaces</h2>
        <ul>
          {availableWorkspaces(session).map((workspace) => (
            <li key={`${workspace.key}-${workspace.href}`}>{workspace.label}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}
