import { AuthForm, AuthPageShell, AuthSubmit } from "@/features/auth/components";
import { signOutAction } from "@/features/auth/actions";

export default function SignOutPage() {
  return (
    <AuthPageShell
      description="End this browser session and clear Industrial Learn session cookies."
      title="Sign out"
    >
      <form action={signOutAction}>
        <AuthForm
          footer="Use this action before leaving a shared device."
          title="End session"
        >
          <AuthSubmit>Sign out</AuthSubmit>
        </AuthForm>
      </form>
    </AuthPageShell>
  );
}
