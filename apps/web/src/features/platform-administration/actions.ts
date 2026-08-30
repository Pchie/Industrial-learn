"use server";

import {
  createSupabaseServerClient,
  createSupabaseServiceRoleClient
} from "@industrial-learn/database";
import { getServerEnv } from "@industrial-learn/env";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { readSessionTokens, requirePlatformManager } from "../auth/server";
import { isAppRole } from "../auth/session-core";

const ADMIN_USERS_ROUTE = "/admin/users";
const INVITABLE_ROLES = ["lecturer", "content_author", "engineering_reviewer"] as const;

export async function manageRoleAction(formData: FormData) {
  const session = await requirePlatformManager(ADMIN_USERS_ROUTE);
  const targetProfileId = readText(formData.get("targetProfileId"));
  const roleValue = readText(formData.get("role"));
  const operation = readText(formData.get("operation"));
  const reason = readText(formData.get("reason"));

  if (
    !targetProfileId ||
    !isAppRole(roleValue) ||
    !isOperation(operation) ||
    reason.length < 10 ||
    formData.get("confirmed") !== "on"
  ) {
    redirect(resultUrl("invalid_role_change"));
  }

  try {
    if (isLocalAdministrationMode()) {
      const local = await import("../auth/test-local-provider");
      local.manageLocalUserRole({
        actorProfileId: session.profile.id,
        targetProfileId,
        role: roleValue,
        operation,
        reason
      });
    } else {
      const { accessToken } = await readSessionTokens();
      if (!accessToken) {
        throw new Error("Missing session-bound database token.");
      }
      const { error } = await createSupabaseServerClient(getServerEnv(), accessToken).rpc(
        "manage_profile_role",
        {
          p_target_profile_id: targetProfileId,
          p_role: roleValue,
          p_operation: operation,
          p_reason: reason
        }
      );
      if (error) {
        throw error;
      }
    }
  } catch {
    redirect(resultUrl("role_change_denied"));
  }

  revalidatePath(ADMIN_USERS_ROUTE);
  redirect(resultUrl("role_changed"));
}

export async function setAccountStatusAction(formData: FormData) {
  const session = await requirePlatformManager(ADMIN_USERS_ROUTE);
  const targetProfileId = readText(formData.get("targetProfileId"));
  const disabled = readText(formData.get("operation")) === "disable";
  const reason = readText(formData.get("reason"));

  if (!targetProfileId || reason.length < 10 || formData.get("confirmed") !== "on") {
    redirect(resultUrl("invalid_account_change"));
  }

  try {
    if (isLocalAdministrationMode()) {
      const local = await import("../auth/test-local-provider");
      local.setLocalUserDisabled({
        actorProfileId: session.profile.id,
        targetProfileId,
        disabled,
        reason
      });
    } else {
      const { accessToken } = await readSessionTokens();
      if (!accessToken) {
        throw new Error("Missing session-bound database token.");
      }
      const { error } = await createSupabaseServerClient(getServerEnv(), accessToken).rpc(
        "set_profile_disabled",
        {
          p_target_profile_id: targetProfileId,
          p_disabled: disabled,
          p_reason: reason
        }
      );
      if (error) {
        throw error;
      }
    }
  } catch {
    redirect(resultUrl("account_change_denied"));
  }

  revalidatePath(ADMIN_USERS_ROUTE);
  redirect(resultUrl(disabled ? "account_disabled" : "account_enabled"));
}

export async function inviteRoleHolderAction(formData: FormData) {
  const session = await requirePlatformManager(ADMIN_USERS_ROUTE);
  const email = readText(formData.get("email")).toLowerCase();
  const displayName = readText(formData.get("displayName"));
  const role = readText(formData.get("role"));
  const reason = readText(formData.get("reason"));

  if (
    !isInvitableRole(role) ||
    !isEmail(email) ||
    !displayName ||
    reason.length < 10 ||
    formData.get("confirmed") !== "on"
  ) {
    redirect(resultUrl("invalid_invitation"));
  }

  try {
    if (isLocalAdministrationMode()) {
      const local = await import("../auth/test-local-provider");
      local.inviteLocalUser({
        actorProfileId: session.profile.id,
        email,
        displayName,
        role,
        reason
      });
    } else {
      await inviteSupabaseUser({ email, displayName, reason, role });
    }
  } catch {
    redirect(resultUrl("invitation_failed"));
  }

  revalidatePath(ADMIN_USERS_ROUTE);
  redirect(resultUrl("invitation_sent"));
}

async function inviteSupabaseUser(input: {
  email: string;
  displayName: string;
  role: (typeof INVITABLE_ROLES)[number];
  reason: string;
}) {
  const env = getServerEnv();
  const { accessToken } = await readSessionTokens();
  if (!accessToken) {
    throw new Error("Missing session-bound database token.");
  }

  const admin = createSupabaseServiceRoleClient(env, "account-administration");
  const { data, error: inviteError } = await admin.auth.admin.inviteUserByEmail(
    input.email,
    {
      data: { display_name: input.displayName },
      ...(env.appBaseUrl
        ? {
            redirectTo: new URL("/auth/sign-in?status=invited", env.appBaseUrl).toString()
          }
        : {})
    }
  );
  if (inviteError || !data.user) {
    throw inviteError ?? new Error("Invitation did not return a user.");
  }

  const sessionClient = createSupabaseServerClient(env, accessToken);
  const { error: registrationError } = await sessionClient.rpc(
    "register_invited_profile",
    {
      p_target_profile_id: data.user.id,
      p_email: input.email,
      p_display_name: input.displayName,
      p_role: input.role,
      p_reason: input.reason
    }
  );

  if (registrationError) {
    await admin.auth.admin.deleteUser(data.user.id);
    throw registrationError;
  }
}

function readText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function isOperation(value: string): value is "add" | "remove" {
  return value === "add" || value === "remove";
}

function isInvitableRole(value: string): value is (typeof INVITABLE_ROLES)[number] {
  return INVITABLE_ROLES.includes(value as (typeof INVITABLE_ROLES)[number]);
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function resultUrl(result: string) {
  return `${ADMIN_USERS_ROUTE}?result=${encodeURIComponent(result)}`;
}

function isLocalAdministrationMode() {
  return (
    process.env.INDUSTRIAL_LEARN_AUTH_MODE === "local" &&
    process.env.INDUSTRIAL_LEARN_E2E === "true"
  );
}
