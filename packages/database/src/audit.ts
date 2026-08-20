import type { AuditEventInput, Principal } from "./domain";
import type { AuditRepository } from "./repository-contracts";
import { auditEventSchema, parseInput } from "./validation";

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
