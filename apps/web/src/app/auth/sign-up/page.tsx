import Link from "next/link";

import {
  AuthForm,
  AuthPageShell,
  AuthSubmit,
  DisplayNameInput,
  EmailInput,
  HiddenNext,
  PasswordInput
} from "@/features/auth/components";
import { signUpAction } from "@/features/auth/actions";
import { authMessageForUrl } from "@/features/auth/server";
import { safeInternalRedirect } from "@/features/auth/session-core";

type SignUpPageProps = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const params = await searchParams;
  const next = safeInternalRedirect(params.next, "/dashboard");

  return (
    <AuthPageShell
      description="Create a student account with the safest default role. Elevated roles are assigned only through trusted administration."
      error={authMessageForUrl(params.error)}
      title="Create your Industrial Learn account"
    >
      <form action={signUpAction}>
        <AuthForm
          footer={
            <>
              Already have an account?{" "}
              <Link href={`/auth/sign-in?next=${encodeURIComponent(next)}`}>Sign in</Link>
              .
            </>
          }
          title="Registration"
        >
          <HiddenNext next={next} />
          <DisplayNameInput />
          <EmailInput />
          <PasswordInput />
          <AuthSubmit>Create account</AuthSubmit>
        </AuthForm>
      </form>
    </AuthPageShell>
  );
}
