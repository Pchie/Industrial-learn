import { describe, expect, it } from "vitest";
import { createRecoveryTicket, verifyRecoveryTicket } from "./recovery-ticket";

const now = Date.parse("2026-09-08T12:00:00Z");
const tokens = { accessToken: "test-recovery", expiresAt: "2026-09-08T13:00:00Z" };

describe("purpose-bound password recovery tickets", () => {
  it("verifies only with the server signing key", () => {
    const ticket = createRecoveryTicket(tokens, "test-key", now);
    expect(verifyRecoveryTicket(ticket, "test-key", now)).toBe(tokens.accessToken);
    expect(verifyRecoveryTicket(ticket, "other-key", now)).toBeUndefined();
  });

  it("enforces the ten-minute limit on the server even if a cookie is retained", () => {
    const ticket = createRecoveryTicket(tokens, "test-key", now);
    expect(verifyRecoveryTicket(ticket, "test-key", now + 599999)).toBe(
      tokens.accessToken
    );
    expect(verifyRecoveryTicket(ticket, "test-key", now + 600000)).toBeUndefined();
  });

  it("does not extend provider expiry", () => {
    const ticket = createRecoveryTicket(
      { ...tokens, expiresAt: new Date(now + 30000).toISOString() },
      "test-key",
      now
    );
    expect(verifyRecoveryTicket(ticket, "test-key", now + 30000)).toBeUndefined();
  });

  it("rejects changing the signed input or expiry", () => {
    const ticket = createRecoveryTicket(tokens, "test-key", now);
    const mac = ticket.split(".")[1];
    const changed = Buffer.from(
      JSON.stringify({
        version: 1,
        accessToken: "ordinary-session",
        expiresAt: now + 600000
      })
    ).toString("base64url");
    expect(verifyRecoveryTicket(`${changed}.${mac}`, "test-key", now)).toBeUndefined();
    expect(
      verifyRecoveryTicket(`${ticket.slice(0, -1)}z`, "test-key", now)
    ).toBeUndefined();
  });

  it.each([
    undefined,
    "",
    "ordinary-session",
    "a.b.c",
    "a." + "0".repeat(64),
    "x".repeat(4097)
  ])("rejects malformed or unverified recovery authority %s", (value) => {
    expect(verifyRecoveryTicket(value, "test-key", now)).toBeUndefined();
  });

  it("cannot mint tickets without a key or for expired/invalid sessions", () => {
    expect(() => createRecoveryTicket(tokens, "", now)).toThrow();
    expect(() =>
      createRecoveryTicket(
        { ...tokens, expiresAt: new Date(now).toISOString() },
        "test-key",
        now
      )
    ).toThrow();
    expect(() =>
      createRecoveryTicket({ ...tokens, expiresAt: "invalid" }, "test-key", now)
    ).toThrow();
  });
});
