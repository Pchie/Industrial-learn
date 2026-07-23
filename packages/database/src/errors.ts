export type AppErrorCode =
  | "authentication_required"
  | "access_denied"
  | "resource_not_found"
  | "invalid_input"
  | "conflict"
  | "rate_limited"
  | "database_unavailable"
  | "unexpected_server_error";

const publicMessages: Record<AppErrorCode, string> = {
  authentication_required: "Sign in is required to access this resource.",
  access_denied: "You do not have access to this resource.",
  resource_not_found: "The requested resource was not found.",
  invalid_input: "The submitted data is invalid.",
  conflict: "The resource could not be updated because it has changed.",
  rate_limited: "Too many requests. Please try again later.",
  database_unavailable: "The data service is temporarily unavailable.",
  unexpected_server_error: "An unexpected server error occurred."
};

export class ApplicationError extends Error {
  readonly code: AppErrorCode;
  readonly status: number;
  readonly context: Record<string, string>;

  constructor(
    code: AppErrorCode,
    options: {
      status?: number | undefined;
      message?: string | undefined;
      context?: Record<string, string> | undefined;
    } = {}
  ) {
    super(options.message ?? publicMessages[code]);
    this.name = "ApplicationError";
    this.code = code;
    this.status = options.status ?? statusForCode(code);
    this.context = options.context ?? {};
  }
}

export function statusForCode(code: AppErrorCode) {
  switch (code) {
    case "authentication_required":
      return 401;
    case "access_denied":
      return 403;
    case "resource_not_found":
      return 404;
    case "invalid_input":
      return 400;
    case "conflict":
      return 409;
    case "rate_limited":
      return 429;
    case "database_unavailable":
      return 503;
    case "unexpected_server_error":
      return 500;
  }
}

export function toPublicError(error: unknown) {
  if (error instanceof ApplicationError) {
    return {
      code: error.code,
      message: error.message,
      status: error.status
    };
  }

  return {
    code: "unexpected_server_error" as const,
    message: publicMessages.unexpected_server_error,
    status: 500
  };
}

export function translateDatabaseError(error: unknown): ApplicationError {
  const message = error instanceof Error ? error.message.toLowerCase() : "";

  if (
    message.includes("network") ||
    message.includes("timeout") ||
    message.includes("fetch failed")
  ) {
    return new ApplicationError("database_unavailable");
  }

  if (message.includes("duplicate") || message.includes("unique")) {
    return new ApplicationError("conflict");
  }

  return new ApplicationError("unexpected_server_error");
}
