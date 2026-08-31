import Link from "next/link";

import { Badge, Breadcrumbs } from "@industrial-learn/design-system";

import { requireAuthenticatedUser } from "@/features/auth/server";
import { availableWorkspaces, primaryRoleLabel } from "@/features/auth/workspace-access";

export default async function WorkspacePage() {
  const session = await requireAuthenticatedUser("/workspace");
  const workspaces = availableWorkspaces(session);

  return (
    <div className="operational-page page-stack">
      <Breadcrumbs items={[{ href: "/workspace", label: "Workspace" }]} />
      <header className="operational-header">
        <p className="eyebrow">Authenticated portal</p>
        <h1>Where do you want to work?</h1>
        <p>Welcome, {session.profile.displayName}. Choose an authorised workspace.</p>
        <Badge tone="normal">{primaryRoleLabel(session.roles)}</Badge>
      </header>
      <div className="workspace-grid">
        {workspaces.map((workspace) => (
          <article className="workspace-card" key={`${workspace.key}-${workspace.href}`}>
            <h2>{workspace.label}</h2>
            <p>{workspace.description}</p>
            <Link
              className="il-button il-button--primary il-button--md"
              href={workspace.href}
            >
              Open {workspace.shortLabel} workspace
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
