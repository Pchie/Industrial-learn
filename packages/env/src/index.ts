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

const envSchema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    NEXT_PUBLIC_SUPABASE_URL: optionalUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalSecret,
    SUPABASE_SERVICE_ROLE_KEY: optionalSecret
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
  });

export type IndustrialLearnEnv = {
  nodeEnv: "development" | "test" | "production";
  supabase: {
    isConfigured: boolean;
    url: string | undefined;
    anonKey: string | undefined;
    serviceRoleKey: string | undefined;
  };
};

export function getServerEnv(input: NodeJS.ProcessEnv = process.env): IndustrialLearnEnv {
  const parsed = envSchema.parse(input);

  return {
    nodeEnv: parsed.NODE_ENV,
    supabase: {
      isConfigured: Boolean(
        parsed.NEXT_PUBLIC_SUPABASE_URL && parsed.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ),
      url: parsed.NEXT_PUBLIC_SUPABASE_URL,
      anonKey: parsed.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      serviceRoleKey: parsed.SUPABASE_SERVICE_ROLE_KEY
    }
  };
}

export function getPublicEnv(input: NodeJS.ProcessEnv = process.env) {
  const env = getServerEnv(input);

  return {
    supabase: {
      isConfigured: env.supabase.isConfigured,
      url: env.supabase.url,
      anonKey: env.supabase.anonKey
    }
  };
}
