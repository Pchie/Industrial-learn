import Link from "next/link";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import { Alert, Input } from "@industrial-learn/design-system";

import { AuthSubmitButton } from "./auth-submit-button";
import { PasswordField } from "./password-field";
import { frontendAssets } from "../app-shell/assets";

export function AuthPageShell({
  children,
  description,
  error,
  status,
  title
}: {
  children: ReactNode;
  description: string;
  error?: string | undefined;
  status?: string | undefined;
  title: string;
}) {
  return (
    <section className="auth-shell" aria-labelledby="auth-title">
      <div className="auth-art" aria-hidden="true">
        <Image {...frontendAssets.future.image} alt="" sizes="540px" />
      </div>
      <div className="auth-content">
        <div className="section-heading">
          <p className="eyebrow auth-eyebrow">
            <ShieldCheck size={18} aria-hidden="true" /> Secure access
          </p>
          <h1 id="auth-title">{title}</h1>
          <p>{description}</p>
        </div>
        {error ? (
          <Alert title="Authentication error" tone="fault">
            {error}
          </Alert>
        ) : null}
        {status ? (
          <Alert title="Authentication status" tone="info">
            {status}
          </Alert>
        ) : null}
        {children}
      </div>
    </section>
  );
}

export function AuthForm({
  children,
  footer,
  title
}: {
  children: ReactNode;
  footer: ReactNode;
  title: string;
}) {
  return (
    <div className="auth-card">
      <h2>{title}</h2>
      <div className="auth-form">{children}</div>
      <div className="auth-links">{footer}</div>
    </div>
  );
}

export function EmailInput({ autoComplete = "email" }: { autoComplete?: string }) {
  return (
    <Input
      autoComplete={autoComplete}
      label="Email address"
      name="email"
      required
      type="email"
    />
  );
}

export function DisplayNameInput() {
  return (
    <Input
      autoComplete="name"
      label="Display name"
      name="displayName"
      required
      type="text"
    />
  );
}

export function PasswordInput({
  label = "Password",
  autoComplete = "current-password"
}: {
  label?: string;
  autoComplete?: "new-password" | "current-password";
}) {
  return <PasswordField label={label} name="password" autoComplete={autoComplete} />;
}

export function HiddenNext({ next }: { next: string }) {
  return <input name="next" type="hidden" value={next} />;
}

export function AuthSubmit({ children }: { children: ReactNode }) {
  return <AuthSubmitButton>{children}</AuthSubmitButton>;
}

export function SignInLink({ next = "/dashboard" }: { next?: string }) {
  return <Link href={`/auth/sign-in?next=${encodeURIComponent(next)}`}>Sign in</Link>;
}
