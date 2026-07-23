import Link from "next/link";

import {
  AuthForm,
  AuthPageShell,
  AuthSubmit,
  EmailInput
} from "@/features/auth/components";
import { forgotPasswordAction } from "@/features/auth/actions";

type ForgotPasswordPageProps = {
  searchParams: Promise<{ status?: string }>;
};

export default async function ForgotPasswordPage({
  searchParams
}: ForgotPasswordPageProps) {
  const params = await searchParams;

  return (
    <AuthPageShell
      description="Request a password reset link. The response is the same whether or not the email address exists."
      status={
        params.status === "reset_requested"
          ? "If that account can receive password reset email, instructions have been sent."
          : undefined
      }
      title="Reset your password"
    >
      <form action={forgotPasswordAction}>
        <AuthForm
          footer={<Link href="/auth/sign-in">Return to sign in</Link>}
          title="Password reset request"
        >
          <EmailInput />
          <AuthSubmit>Request reset link</AuthSubmit>
        </AuthForm>
      </form>
    </AuthPageShell>
  );
}
