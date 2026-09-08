export function referencePreviewEnabled(env: Record<string, string | undefined>) {
  if (
    env.INDUSTRIAL_LEARN_E2E !== "true" ||
    env.INDUSTRIAL_LEARN_AUTH_MODE !== "local" ||
    env.NEXT_PUBLIC_APP_ENV !== "test"
  )
    return false;
  try {
    return ["localhost", "127.0.0.1", "[::1]"].includes(
      new URL(env.APP_BASE_URL ?? "").hostname
    );
  } catch {
    return false;
  }
}
