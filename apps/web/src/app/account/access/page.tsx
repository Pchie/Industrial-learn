import { Badge, Breadcrumbs } from "@industrial-learn/design-system";
import { getServerEnv } from "@industrial-learn/env";
import Link from "next/link";
import { PageHeading } from "@/features/page-layout/components";

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
      <PageHeading
        title="Account access"
        eyebrow="Profile and permissions"
        description="Your identity, assigned roles and authorised workspaces."
      />
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
        <ul className="workspace-link-list">
          {availableWorkspaces(session).map((workspace) => (
            <li key={`${workspace.key}-${workspace.href}`}>
              <Link href={workspace.href}>{workspace.label}</Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
