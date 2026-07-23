import Link from "next/link";

import { AuthPageShell } from "@/features/auth/components";
import { getAuthProvider } from "@/features/auth/server";

type VerifyPageProps = {
  searchParams: Promise<{ token?: string; type?: string }>;
};

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const params = await searchParams;
  const result = params.token
    ? await (await getAuthProvider()).verifyEmail(params.token, params.type)
    : undefined;

  return (
    <AuthPageShell
      description="Email verification confirms that this browser flow can continue with the signed-in account."
      error={result && !result.ok ? result.message : undefined}
      status={result?.ok ? "Email verification completed." : undefined}
      title="Email verification"
    >
      <div className="auth-links">
        <Link href="/auth/sign-in">Continue to sign in</Link>
      </div>
    </AuthPageShell>
  );
}
