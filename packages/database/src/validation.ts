import { z } from "zod";
import { ApplicationError } from "./errors";

export const uuidSchema = z.string().uuid();

export const paginationSchema = z
  .object({
    limit: z.coerce.number().int().min(1).max(100).default(25),
    cursor: z.string().min(1).optional()
  })
  .strict();

export const profileIdInputSchema = z
  .object({
    profileId: uuidSchema
  })
  .strict();

export const studentRecordListInputSchema = z
  .object({
    studentProfileId: uuidSchema,
    limit: z.coerce.number().int().min(1).max(100).default(25),
    cursor: z.string().min(1).optional(),
    sortDirection: z.enum(["asc", "desc"]).default("desc")
  })
  .strict();

export const updateProfileInputSchema = z
  .object({
    profileId: uuidSchema,
    displayName: z.string().trim().min(1).max(120).optional(),
    preferredName: z.string().trim().max(120).optional(),
    institutionName: z.string().trim().max(160).optional()
  })
  .strict();

export const publishedContentInputSchema = z
  .object({
    slug: z
      .string()
      .trim()
      .min(1)
      .max(160)
      .regex(/^[a-z0-9-]+$/)
  })
  .strict();

export const publishedAssessmentInputSchema = z
  .object({
    assessmentId: uuidSchema
  })
  .strict();

export const auditEventSchema = z
  .object({
    actorProfileId: uuidSchema,
    action: z.string().trim().min(3).max(160),
    entityTable: z.string().trim().min(1).max(80).optional(),
    entityId: uuidSchema.optional(),
    severity: z.enum(["info", "warning", "security", "critical"]),
    metadata: z
      .record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()]))
      .optional()
  })
  .strict();

export const submitAssessmentAttemptInputSchema = z
  .object({
    assessmentId: uuidSchema,
    studentProfileId: uuidSchema,
    answers: z
      .array(
        z
          .object({
            questionId: uuidSchema,
            value: z.unknown()
          })
          .strict()
      )
      .min(1)
  })
  .strict();

export function parseInput<T>(schema: z.ZodType<T>, input: unknown): T {
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    throw new ApplicationError("invalid_input", {
      context: {
        reason: parsed.error.issues.map((issue) => issue.message).join("; ")
      }
    });
  }

  return parsed.data;
}
