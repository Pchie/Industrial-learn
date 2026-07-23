import type { Caller, DataAccessRole, Principal } from "./domain.js";
import { ApplicationError } from "./errors.js";

export function requireAuthenticated(caller: Caller): Principal {
  if (caller.kind !== "authenticated") {
    throw new ApplicationError("authentication_required");
  }

  return caller.principal;
}

export function hasRole(principal: Principal, role: DataAccessRole) {
  return principal.roles.includes(role);
}

export function hasAnyRole(principal: Principal, roles: DataAccessRole[]) {
  return roles.some((role) => hasRole(principal, role));
}

export function requireAnyRole(principal: Principal, roles: DataAccessRole[]) {
  if (!hasAnyRole(principal, roles)) {
    throw new ApplicationError("access_denied");
  }
}

export function assertSelfOrAdmin(principal: Principal, profileId: string) {
  if (principal.profileId !== profileId && !hasRole(principal, "administrator")) {
    throw new ApplicationError("access_denied");
  }
}

export function assertStudentPrivateAccess(
  principal: Principal,
  studentProfileId: string,
  lecturerAuthorised: boolean
) {
  if (principal.profileId === studentProfileId) {
    return;
  }

  if (hasRole(principal, "administrator")) {
    return;
  }

  if (hasRole(principal, "lecturer") && lecturerAuthorised) {
    return;
  }

  throw new ApplicationError("access_denied");
}

export function assertContentStaff(principal: Principal) {
  requireAnyRole(principal, ["content_author", "engineering_reviewer", "administrator"]);
}
