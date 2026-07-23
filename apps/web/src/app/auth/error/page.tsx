import Link from "next/link";

import { AuthPageShell } from "@/features/auth/components";
import { authMessageForUrl } from "@/features/auth/server";
import { safeInternalRedirect } from "@/features/auth/session-core";

type AuthErrorPageProps = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

export default async function AuthErrorPage({ searchParams }: AuthErrorPageProps) {
  const params = await searchParams;
  const next = safeInternalRedirect(params.next, "/dashboard");

  return (
    <AuthPageShell
      description="The requested authenticated action could not be completed."
      error={authMessageForUrl(params.error) || "Authentication could not continue."}
      title="Access denied"
    >
      <div className="auth-links">
        <Link href="/dashboard">Go to dashboard</Link>
        <Link href={`/auth/sign-in?next=${encodeURIComponent(next)}`}>Sign in again</Link>
      </div>
    </AuthPageShell>
  );
}
