import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import type { SessionTokens } from "./session-core";

const purpose = "industrial-learn:password-recovery:v1:";
const ticketSchema = z
  .object({
    version: z.literal(1),
    accessToken: z.string().min(1).max(2048),
    expiresAt: z.number().int().positive()
  })
  .strict();

function signature(payload: string, secret: string) {
  return createHmac("sha256", secret).update(purpose).update(payload).digest();
}

export function createRecoveryTicket(
  tokens: SessionTokens,
  secret: string,
  now = Date.now()
) {
  if (!secret) throw new Error("Recovery signing is unavailable.");
  const expiresAt = Math.min(Date.parse(tokens.expiresAt), now + 600_000);
  const ticket = ticketSchema.parse({
    version: 1,
    accessToken: tokens.accessToken,
    expiresAt
  });
  if (expiresAt <= now) throw new Error("Recovery authority has expired.");
  const payload = Buffer.from(JSON.stringify(ticket)).toString("base64url");
  return `${payload}.${signature(payload, secret).toString("hex")}`;
}

export function verifyRecoveryTicket(
  value: string | undefined,
  secret: string,
  now = Date.now()
): string | undefined {
  if (!value || !secret || value.length > 4096) return undefined;
  const parts = value.split(".");
  if (parts.length !== 2) return undefined;
  const [payload, mac] = parts;
  if (!payload || !mac || !/^[a-f0-9]{64}$/.test(mac)) return undefined;
  if (!timingSafeEqual(Buffer.from(mac, "hex"), signature(payload, secret)))
    return undefined;
  try {
    const parsed: unknown = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    );
    const ticket = ticketSchema.safeParse(parsed);
    if (
      !ticket.success ||
      ticket.data.expiresAt <= now ||
      ticket.data.expiresAt > now + 600_000
    )
      return undefined;
    return ticket.data.accessToken;
  } catch {
    return undefined;
  }
}
