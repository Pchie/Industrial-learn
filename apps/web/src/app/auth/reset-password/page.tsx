import Link from "next/link";

import {
  AuthForm,
  AuthPageShell,
  AuthSubmit,
  PasswordInput
} from "@/features/auth/components";
import { resetPasswordAction } from "@/features/auth/actions";
import { authMessageForUrl } from "@/features/auth/server";

type ResetPasswordPageProps = {
  searchParams: Promise<{ error?: string; token?: string }>;
};

export default async function ResetPasswordPage({
  searchParams
}: ResetPasswordPageProps) {
  const params = await searchParams;

  return (
    <AuthPageShell
      description="Choose a new password from a valid reset link."
      error={authMessageForUrl(params.error)}
      title="Update password"
    >
      <form action={resetPasswordAction}>
        <AuthForm
          footer={<Link href="/auth/sign-in">Return to sign in</Link>}
          title="New password"
        >
          <input name="token" type="hidden" value={params.token ?? ""} />
          <PasswordInput label="New password" />
          <AuthSubmit>Update password</AuthSubmit>
        </AuthForm>
      </form>
    </AuthPageShell>
  );
}
