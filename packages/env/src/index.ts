import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .url()
  .optional()
  .or(z.literal("").transform(() => undefined));

const optionalSecret = z
  .string()
  .trim()
  .min(1)
  .optional()
  .or(z.literal("").transform(() => undefined));

const optionalPlainValue = optionalSecret;

const appEnvSchema = z
  .enum(["development", "test", "staging", "production"])
  .default("development");

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    NEXT_PUBLIC_APP_ENV: appEnvSchema,
    APP_BASE_URL: optionalUrl,
    NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalSecret,
    SUPABASE_SERVICE_ROLE_KEY: optionalSecret,
    SUPABASE_PROJECT_REF: optionalPlainValue,
    SUPABASE_DB_URL: optionalSecret,
    INDUSTRIAL_LEARN_AUTH_MODE: z.enum(["supabase", "local"]).default("supabase"),
    INDUSTRIAL_LEARN_E2E: z.enum(["true", "false"]).optional()
  })
  .superRefine((value, context) => {
    const hasPublicUrl = Boolean(value.NEXT_PUBLIC_SUPABASE_URL);
    const hasAnonKey = Boolean(value.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    if (hasPublicUrl !== hasAnonKey) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be provided together.",
        path: ["NEXT_PUBLIC_SUPABASE_URL"]
      });
    }

    if (
      (value.NEXT_PUBLIC_APP_ENV === "staging" ||
        value.NEXT_PUBLIC_APP_ENV === "production") &&
      value.INDUSTRIAL_LEARN_AUTH_MODE === "local"
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Local test authentication is not allowed in staging or production.",
        path: ["INDUSTRIAL_LEARN_AUTH_MODE"]
      });
    }

    if (value.NEXT_PUBLIC_APP_ENV === "staging") {
      for (const key of [
        "NEXT_PUBLIC_SUPABASE_URL",
        "NEXT_PUBLIC_SUPABASE_ANON_KEY",
        "SUPABASE_SERVICE_ROLE_KEY",
        "SUPABASE_PROJECT_REF",
        "SUPABASE_DB_URL",
        "APP_BASE_URL"
      ] as const) {
        if (!value[key]) {
          context.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${key} is required for staging.`,
            path: [key]
          });
        }
      }
    }
  });

export type IndustrialLearnEnv = {
  nodeEnv: "development" | "test" | "production";
  appEnv: "development" | "test" | "staging" | "production";
  appBaseUrl: string | undefined;
  authMode: "supabase" | "local";
  isE2E: boolean;
  supabase: {
    isConfigured: boolean;
    url: string | undefined;
    anonKey: string | undefined;
    serviceRoleKey: string | undefined;
    projectRef: string | undefined;
    dbUrl: string | undefined;
  };
};

export type LocalTestAuthSafetyInput = Pick<
  IndustrialLearnEnv,
  "appEnv" | "appBaseUrl" | "authMode" | "isE2E"
>;

const stagingRuntimeVariableNames = [
  "NEXT_PUBLIC_APP_ENV",
  "APP_BASE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_PROJECT_REF",
  "SUPABASE_DB_URL",
  "INDUSTRIAL_LEARN_AUTH_MODE"
] as const;

const signupVariableNames = [
  "APP_BASE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY"
] as const;

export function getServerEnv(input: NodeJS.ProcessEnv = process.env): IndustrialLearnEnv {
  const parsed = envSchema.parse(input);

  return {
    nodeEnv: parsed.NODE_ENV,
    appEnv: parsed.NEXT_PUBLIC_APP_ENV,
    appBaseUrl: parsed.APP_BASE_URL,
    authMode: parsed.INDUSTRIAL_LEARN_AUTH_MODE,
    isE2E: parsed.INDUSTRIAL_LEARN_E2E === "true",
    supabase: {
      isConfigured: Boolean(
        parsed.NEXT_PUBLIC_SUPABASE_URL && parsed.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ),
      url: parsed.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: parsed.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceRoleKey: parsed.SUPABASE_SERVICE_ROLE_KEY,
      projectRef: parsed.SUPABASE_PROJECT_REF,
      dbUrl: parsed.SUPABASE_DB_URL
    }
  };
}

export function getPublicEnv(input: NodeJS.ProcessEnv = process.env) {
  const env = getServerEnv(input);

  return {
    appEnv: env.appEnv,
    supabase: {
      isConfigured: env.supabase.isConfigured,
      url: env.supabase.url,
      anonKey: env.supabase.anonKey
    }
  };
}

export function getAuthConfigurationDiagnostics(input: NodeJS.ProcessEnv = process.env) {
  return {
    appEnvironment: input.NEXT_PUBLIC_APP_ENV?.trim() || "defaulted",
    authMode: input.INDUSTRIAL_LEARN_AUTH_MODE?.trim() || "defaulted",
    vercelEnvironment: input.VERCEL_ENV?.trim() || "unavailable",
    missingSignupVariables: missingVariableNames(input, signupVariableNames),
    missingStagingVariables: missingVariableNames(input, stagingRuntimeVariableNames)
  };
}

export function validateLocalTestAuthSafety(env: LocalTestAuthSafetyInput) {
  if (env.authMode !== "local") {
    return;
  }

  if (env.appEnv === "staging" || env.appEnv === "production") {
    throw new Error("Local test authentication is not allowed in staging or production.");
  }

  if (!env.isE2E) {
    throw new Error("Local test authentication requires INDUSTRIAL_LEARN_E2E=true.");
  }

  const host = hostFromAppBaseUrl(env.appBaseUrl);
  if (!host || !isApprovedLocalTestHost(host)) {
    throw new Error("Local test authentication requires an approved local test host.");
  }
}

function hostFromAppBaseUrl(appBaseUrl: string | undefined) {
  if (!appBaseUrl) {
    return undefined;
  }

  try {
    return new URL(appBaseUrl).hostname.toLowerCase();
  } catch {
    return undefined;
  }
}

function isApprovedLocalTestHost(host: string) {
  return host === "localhost" || host === "127.0.0.1" || host === "[::1]";
}

function missingVariableNames(input: NodeJS.ProcessEnv, names: readonly string[]) {
  return names.filter((name) => !input[name]?.trim());
}
