import { Breadcrumbs } from "@industrial-learn/design-system";

import { readSessionTokens, requirePlatformManager } from "@/features/auth/server";
import { UserRoleManagement } from "@/features/platform-administration/components";
import { loadPlatformAdministrationModel } from "@/features/platform-administration/server-data";

type AdminUsersPageProps = {
  searchParams: Promise<{ q?: string; result?: string }>;
};

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const session = await requirePlatformManager("/admin/users");
  const { accessToken } = await readSessionTokens();
  const model = await loadPlatformAdministrationModel(session, accessToken);
  const { q, result } = await searchParams;

  return (
    <div className="operational-page page-stack">
      <Breadcrumbs
        items={[
          { href: "/workspace", label: "Workspace" },
          {
            href: session.roles.includes("platform_owner") ? "/owner" : "/admin",
            label: "Platform Management"
          },
          { href: "/admin/users", label: "Users and roles" }
        ]}
      />
      <header className="operational-header">
        <p className="eyebrow">Audited administration</p>
        <h1>Users and roles</h1>
        <p>
          Invite trusted role holders and manage database-backed access without exposing
          service credentials to the browser.
        </p>
      </header>
      <UserRoleManagement
        model={model}
        query={q?.trim() ?? ""}
        result={result}
        session={session}
      />
    </div>
  );
}
