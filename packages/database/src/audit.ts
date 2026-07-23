import type { AuditEventInput, Principal } from "./domain.js";
import type { AuditRepository } from "./repository-contracts.js";
import { auditEventSchema, parseInput } from "./validation.js";

export async function recordAuditEvent(
  auditRepository: AuditRepository,
  actor: Principal,
  event: Omit<AuditEventInput, "actorProfileId">
) {
  const input = parseInput(auditEventSchema, {
    ...event,
    actorProfileId: actor.profileId
  });

  await auditRepository.recordEvent(input);
}
