"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import type { AppRole } from "./session-core";
import type { WorkspaceDestination } from "./workspace-access";
import { workspaceForPath } from "./workspace-access";

type AccountAccessSummary = {
  authenticated: true;
  displayName: string;
  primaryRole: string;
  roles: AppRole[];
  workspaces: WorkspaceDestination[];
};

export function SiteNavigation() {
  const pathname = usePathname();
  const [account, setAccount] = useState<AccountAccessSummary | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/account/access", {
      cache: "no-store",
      credentials: "same-origin",
      signal: controller.signal
    })
      .then(async (response) =>
        response.ok ? ((await response.json()) as AccountAccessSummary) : null
      )
      .then(setAccount)
      .catch(() => undefined);

    return () => controller.abort();
  }, [pathname]);

  return (
    <nav className="site-nav" aria-label="Primary navigation">
      <Link href="/">Home</Link>
      <Link href="/learn">Learn</Link>
      <Link href="/simulations">Simulations</Link>
      <Link href="/projects">Projects</Link>
      {account ? (
        <>
          <Link href="/account/access">Profile</Link>
          <details className="workspace-menu">
            <summary>
              <span>Workspace: {workspaceForPath(pathname)}</span>
              <small>{account.primaryRole}</small>
            </summary>
            <div className="workspace-menu__panel">
              <p className="workspace-menu__identity">
                <strong>{account.displayName}</strong>
                <span>{account.primaryRole}</span>
              </p>
              <p className="workspace-menu__label">Switch workspace</p>
              {account.workspaces.map((workspace) => (
                <Link href={workspace.href} key={`${workspace.key}-${workspace.href}`}>
                  {workspace.shortLabel}
                </Link>
              ))}
              <Link href="/workspace">All workspaces</Link>
              <Link href="/account/access">Account access</Link>
              <Link href="/auth/sign-out">Sign out</Link>
            </div>
          </details>
        </>
      ) : (
        <Link href={`/auth/sign-in?next=${encodeURIComponent("/workspace")}`}>
          Sign in
        </Link>
      )}
    </nav>
  );
}
