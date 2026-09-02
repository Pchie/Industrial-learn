import Link from "next/link";

import { AuthPageShell } from "@/features/auth/components";
import { authMessageForUrl, resolveAuthenticatedSession } from "@/features/auth/server";
import { safeInternalRedirect } from "@/features/auth/session-core";
import { primaryRoleLabel } from "@/features/auth/workspace-access";

type AuthErrorPageProps = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

export default async function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const params = await searchParams;
  const next = safeInternalRedirect(params.next, "/dashboard");
  const sessionResult = await resolveAuthenticatedSession();
  const signedIn = sessionResult.ok;
  const requirement = workspaceRequirement(next);
  const error = signedIn
    ? signedInAccessMessage(
        primaryRoleLabel(sessionResult.value.roles),
        requirement,
        params.error
      )
    : authMessageForUrl(params.error) || "Authentication could not continue.";

  return (
    <AuthPageShell
      description="The requested authenticated action could not be completed."
      error={error}
      title="Access denied"
    >
      <div className="auth-links">
        {signedIn ? (
          <>
            <Link href="/workspace">Go to my workspace</Link>
            <Link href="/account/access">Review my access</Link>
            <p>Request the required role from the Platform Owner.</p>
          </>
        ) : (
          <Link href={`/auth/sign-in?next=${encodeURIComponent(next)}`}>Sign in</Link>
        )}
      </div>
    </AuthPageShell>
  );
}

function signedInAccessMessage(
  role: string,
  requirement: string,
  error: string | undefined
) {
  if (error === "review_assignment_required") {
    return `Engineering Review requires an active exact-version assignment. You are signed in as ${role}, but this review is not currently assigned to your account.`;
  }

  return `You are signed in as ${role}. ${requirement} requires ${requirement} access.`;
}

function workspaceRequirement(path: string) {
  if (path.startsWith("/review") || path.startsWith("/preview/lessons")) {
    return "Engineering Reviewer";
  }
  if (path.startsWith("/author")) return "Content Author";
  if (path.startsWith("/lecturer")) return "Lecturer";
  if (path.startsWith("/owner")) return "Platform Owner";
  if (path.startsWith("/admin")) return "Platform Administration";
  return "authorised workspace";
}
