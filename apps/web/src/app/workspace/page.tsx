import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  FilePenLine,
  ShieldCheck,
  GraduationCap,
  Settings2
} from "lucide-react";

import { Badge, Breadcrumbs } from "@industrial-learn/design-system";

import { requireAuthenticatedUser } from "@/features/auth/server";
import { availableWorkspaces, primaryRoleLabel } from "@/features/auth/workspace-access";
import { PageHeading } from "@/features/page-layout/components";

const workspaceIcons = {
  student: BookOpen,
  author: FilePenLine,
  reviewer: ShieldCheck,
  lecturer: GraduationCap,
  owner: Settings2
};

export default async function WorkspacePage() {
  const session = await requireAuthenticatedUser("/workspace");
  const workspaces = availableWorkspaces(session);

  return (
    <div className="operational-page page-stack">
      <Breadcrumbs items={[{ href: "/workspace", label: "Workspace" }]} />
      <PageHeading
        title="Where do you want to work?"
        eyebrow="Your workspaces"
        description={`Welcome, ${session.profile.displayName}. Choose an authorised workspace.`}
      >
        <Badge tone="normal">{primaryRoleLabel(session.roles)}</Badge>
      </PageHeading>
      <div className="workspace-grid">
        {workspaces.map((workspace) => {
          const Icon = workspaceIcons[workspace.key];
          return (
            <article
              className="workspace-card"
              key={`${workspace.key}-${workspace.href}`}
            >
              <span className="workspace-icon" data-workspace={workspace.key}>
                <Icon size={24} aria-hidden="true" />
              </span>
              <h2>{workspace.label}</h2>
              <p>{workspace.description}</p>
              <Link
                className="il-button il-button--primary il-button--md"
                href={workspace.href}
              >
                Open {workspace.shortLabel} workspace
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
}
