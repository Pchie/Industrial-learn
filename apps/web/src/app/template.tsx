import type { ReactNode } from "react";
import { getBackendMode } from "@industrial-learn/env";
import { AccountBoundary } from "@/features/auth/account-boundary";
import { resolveAuthenticatedSession } from "@/features/auth/server";
import { identityScope } from "@/features/auth/identity-scope";

export default async function Template({ children }: { children: ReactNode }) {
  const result = await resolveAuthenticatedSession();
  return (
    <AccountBoundary scope={identityScope(result.ok ? result.value : null)}>
      {result.ok && getBackendMode() === "local" && (
        <p className="local-preview-notice" role="status">
          Local preview · Learning records here are temporary test data.
        </p>
      )}
      {children}
    </AccountBoundary>
  );
}
