import Link from "next/link";

import {
  AuthForm,
  AuthPageShell,
  AuthSubmit,
  EmailInput,
  HiddenNext,
  PasswordInput
} from "@/features/auth/components";
import { signInAction } from "@/features/auth/actions";
import { authMessageForUrl } from "@/features/auth/server";
import { safeInternalRedirect } from "@/features/auth/session-core";

type SignInPageProps = {
  searchParams: Promise<{ error?: string; next?: string; status?: string }>;
};

const statusMessages: Record<string, string> = {
  signed_out: "You have been signed out.",
  password_updated: "Your password has been updated. Sign in with the new password.",
  verify_email: "Check your email to complete verification before signing in."
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const params = await searchParams;
  const next = safeInternalRedirect(params.next, "/dashboard");

  return (
    <AuthPageShell
      description="Sign in with your verified Industrial Learn account."
      error={authMessageForUrl(params.error)}
      status={params.status ? statusMessages[params.status] : undefined}
      title="Sign in"
    >
      <form action={signInAction}>
        <AuthForm
          footer={
            <>
              <Link href="/auth/forgot-password">Forgot password?</Link>{" "}
              <span aria-hidden="true">|</span>{" "}
              <Link href={`/auth/sign-up?next=${encodeURIComponent(next)}`}>
                Create account
              </Link>
            </>
          }
          title="Account access"
        >
          <HiddenNext next={next} />
          <EmailInput />
          <PasswordInput />
          <AuthSubmit>Sign in</AuthSubmit>
        </AuthForm>
      </form>
    </AuthPageShell>
  );
}
