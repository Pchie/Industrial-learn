import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  verifyEmail: vi.fn(),
  updatePassword: vi.fn(),
  requestPasswordReset: vi.fn(),
  readRecoveryToken: vi.fn(),
  setRecoveryCookie: vi.fn(),
  clearRecoveryCookie: vi.fn(),
  clearSessionCookies: vi.fn(),
  setSessionCookies: vi.fn(),
  record: vi.fn()
}));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`redirect:${url}`);
  }
}));
vi.mock("@industrial-learn/env", () => ({
  getServerEnv: () => ({ appBaseUrl: "https://staging.example.test" }),
  getAuthConfigurationDiagnostics: () => ({})
}));
vi.mock("./server", () => ({
  ...mocks,
  getAuthProvider: () => Promise.resolve(mocks),
  readSessionTokens: vi.fn(),
  resolveAuthenticatedSession: vi.fn()
}));
vi.mock("../monitoring/server", () => ({
  recordOperationalEvent: mocks.record,
  safeHashIdentifier: () => "hashed"
}));

import {
  confirmEmailAction,
  forgotPasswordAction,
  resetPasswordAction,
  signInAction
} from "./actions";

function form(values: Record<string, string>) {
  const result = new FormData();
  for (const [key, value] of Object.entries(values)) result.set(key, value);
  return result;
}
const tokens = {
  accessToken: "test-recovery",
  expiresAt: new Date(Date.now() + 600000).toISOString()
};

beforeEach(() => vi.resetAllMocks());

describe("email confirmation and recovery actions", () => {
  it("exchanges recovery only after explicit confirmation and never creates an ordinary login", async () => {
    mocks.verifyEmail.mockResolvedValue({ ok: true, value: { tokens } });
    await expect(
      confirmEmailAction(
        form({
          token_hash: "one-time-hash",
          type: "recovery",
          next: "https://evil.example"
        })
      )
    ).rejects.toThrow("redirect:/auth/reset-password");
    expect(mocks.verifyEmail).toHaveBeenCalledWith("one-time-hash", "recovery");
    expect(mocks.setRecoveryCookie).toHaveBeenCalledWith(tokens);
    expect(mocks.setSessionCookies).not.toHaveBeenCalled();
    expect(mocks.clearSessionCookies).toHaveBeenCalledOnce();
  });
  it("email confirmation redirects to sign-in without persisting the exchanged session", async () => {
    mocks.verifyEmail.mockResolvedValue({ ok: true, value: { tokens } });
    await expect(
      confirmEmailAction(form({ token_hash: "one-time-hash", type: "email" }))
    ).rejects.toThrow("redirect:/auth/sign-in?status=email_verified");
    expect(mocks.signOut).toHaveBeenCalledWith(tokens);
    expect(mocks.setRecoveryCookie).not.toHaveBeenCalled();
  });
  it.each(["invite", "magiclink", "signup", "", "email_change"])(
    "rejects unsupported type %s before contacting the provider",
    async (type) => {
      await expect(
        confirmEmailAction(form({ token_hash: "hash", type }))
      ).rejects.toThrow("redirect:/auth/verify?error=expired_session");
      expect(mocks.verifyEmail).not.toHaveBeenCalled();
    }
  );
  it("rejects expired/reused links with no leaked token in the error or event", async () => {
    mocks.verifyEmail.mockResolvedValue({ ok: false, code: "expired_session" });
    await expect(
      confirmEmailAction(form({ token_hash: "private-used-hash", type: "recovery" }))
    ).rejects.toThrow("redirect:/auth/verify?error=expired_session");
    expect(JSON.stringify(mocks.record.mock.calls)).not.toContain("private-used-hash");
    expect(mocks.setRecoveryCookie).not.toHaveBeenCalled();
  });
  it("ignores client-supplied tokens and refuses password changes without the protected recovery cookie", async () => {
    await expect(
      resetPasswordAction(
        form({
          password: "NewPassword123!",
          token: "attacker-token",
          accessToken: "attacker-token"
        })
      )
    ).rejects.toThrow("expired_reset_link");
    expect(mocks.updatePassword).not.toHaveBeenCalled();
  });
  it("uses only the server recovery token, preserves password whitespace and clears cookies after success", async () => {
    mocks.readRecoveryToken.mockResolvedValue(tokens.accessToken);
    mocks.updatePassword.mockResolvedValue({ ok: true });
    await expect(
      resetPasswordAction(form({ password: " NewPassword123! ", token: "ignored" }))
    ).rejects.toThrow("status=password_updated");
    expect(mocks.updatePassword).toHaveBeenCalledWith({
      password: " NewPassword123! ",
      accessToken: tokens.accessToken
    });
    expect(mocks.signOut).toHaveBeenCalledWith({ accessToken: tokens.accessToken });
    expect(mocks.clearSessionCookies).toHaveBeenCalledOnce();
  });
  it("keeps recovery request responses enumeration-safe but records transport failures", async () => {
    mocks.requestPasswordReset.mockResolvedValue({ ok: false, code: "network_failure" });
    await expect(
      forgotPasswordAction(form({ email: "private@example.test" }))
    ).rejects.toThrow("status=reset_requested");
    expect(mocks.record).toHaveBeenCalledOnce();
    expect(JSON.stringify(mocks.record.mock.calls)).not.toContain("private@example.test");
    expect(mocks.requestPasswordReset).toHaveBeenCalledWith({
      email: "private@example.test",
      redirectTo: "https://staging.example.test/auth/verify"
    });
  });
  it("does not trim passwords on sign-in", async () => {
    mocks.signIn.mockResolvedValue({ ok: false, code: "invalid_credentials" });
    await expect(
      signInAction(form({ email: "student@example.test", password: " Passphrase123! " }))
    ).rejects.toThrow("invalid_credentials");
    expect(mocks.signIn).toHaveBeenCalledWith({
      email: "student@example.test",
      password: " Passphrase123! "
    });
  });
});
