import Link from "next/link";

import {
  AuthForm,
  AuthPageShell,
  AuthSubmit,
  PasswordInput
} from "@/features/auth/components";
import { resetPasswordAction } from "@/features/auth/actions";
import { authMessageForUrl, readRecoveryToken } from "@/features/auth/server";

type ResetPasswordPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function ResetPasswordPage({
  searchParams
}: ResetPasswordPageProps) {
  const params = await searchParams;
  const recoveryToken = await readRecoveryToken();

  return (
    <AuthPageShell
      description="Choose a new password from a valid reset link."
      error={
        authMessageForUrl(params.error) ||
        (!recoveryToken
          ? "Open a valid recovery email before changing your password."
          : undefined)
      }
      title="Update password"
    >
      {recoveryToken ? (
        <form action={resetPasswordAction}>
          <AuthForm
            footer={<Link href="/auth/sign-in">Return to sign in</Link>}
            title="New password"
          >
            <PasswordInput label="New password" autoComplete="new-password" />
            <AuthSubmit>Update password</AuthSubmit>
          </AuthForm>
        </form>
      ) : (
        <Link href="/auth/forgot-password">Request a recovery email</Link>
      )}
    </AuthPageShell>
  );
}
