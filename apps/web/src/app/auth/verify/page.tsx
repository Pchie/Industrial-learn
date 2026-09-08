import Link from "next/link";

import { AuthPageShell, AuthSubmit } from "@/features/auth/components";
import { confirmEmailAction } from "@/features/auth/actions";
import { authMessageForUrl } from "@/features/auth/server";

export const dynamic = "force-dynamic";

type VerifyPageProps = {
  searchParams: Promise<{ token_hash?: string; type?: string; error?: string }>;
};

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const params = await searchParams;
  const valid = Boolean(
    params.token_hash &&
    params.token_hash.length <= 512 &&
    (params.type === "email" || params.type === "recovery")
  );

  return (
    <AuthPageShell
      description="Continue only if you requested this email."
      error={
        authMessageForUrl(params.error) ||
        (!valid
          ? "This link is missing, invalid or expired. Request a new email."
          : undefined)
      }
      title={
        params.type === "recovery" ? "Confirm password recovery" : "Email verification"
      }
    >
      {valid && (
        <form action={confirmEmailAction}>
          <input type="hidden" name="token_hash" value={params.token_hash} />
          <input type="hidden" name="type" value={params.type} />
          <AuthSubmit>
            {params.type === "recovery"
              ? "Continue password recovery"
              : "Confirm email address"}
          </AuthSubmit>
        </form>
      )}
      <div className="auth-links">
        <Link href="/auth/sign-in">Continue to sign in</Link>
        <Link href="/auth/forgot-password">Request a new recovery email</Link>
      </div>
    </AuthPageShell>
  );
}
