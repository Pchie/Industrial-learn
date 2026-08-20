const sensitiveKeyFragments = [
  "answer",
  "authorization",
  "body",
  "cookie",
  "correct",
  "credential",
  "email",
  "hidden",
  "password",
  "private",
  "projectsubmission",
  "refresh",
  "reset",
  "secret",
  "service",
  "source",
  "submitted",
  "token"
];

const maxDepth = 5;

export type RedactedJson =
  string | number | boolean | null | RedactedJson[] | { [key: string]: RedactedJson };

export function redactMonitoringPayload(value: unknown): RedactedJson {
  return redactValue(value, 0);
}

export function isSensitiveMonitoringKey(key: string) {
  const normalised = key.replace(/[^a-z0-9]/gi, "").toLowerCase();
  return sensitiveKeyFragments.some((fragment) => normalised.includes(fragment));
}

function redactValue(value: unknown, depth: number): RedactedJson {
  if (depth > maxDepth) {
    return "[Truncated]";
  }

  if (value === null) {
    return null;
  }

  if (typeof value === "string") {
    return redactString(value);
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "boolean") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.slice(0, 20).map((item) => redactValue(item, depth + 1));
  }

  if (typeof value === "object") {
    const record: Record<string, RedactedJson> = {};
    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      record[key] = isSensitiveMonitoringKey(key)
        ? "[Redacted]"
        : redactValue(item, depth + 1);
    }
    return record;
  }

  if (typeof value === "bigint") {
    return value.toString();
  }

  if (typeof value === "undefined") {
    return "undefined";
  }

  if (typeof value === "function") {
    return "[Function]";
  }

  if (typeof value === "symbol") {
    return value.description ?? "symbol";
  }

  return "[Unsupported]";
}

function redactString(value: string) {
  if (
    /bearer\s+[a-z0-9._-]+/i.test(value) ||
    /eyJ[a-z0-9._-]+/i.test(value) ||
    /password|reset|token|secret|service_role/i.test(value)
  ) {
    return "[Redacted]";
  }

  return value.length > 240 ? `${value.slice(0, 240)}...` : value;
}
