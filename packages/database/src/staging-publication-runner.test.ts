import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

describe("staging publication operator guard", () => {
  it("requires an explicit private staging environment file", () => {
    const result = spawnSync(
      process.execPath,
      ["scripts/verify-staging-publication.mjs"],
      {
        encoding: "utf8",
        env: { PATH: process.env.PATH }
      }
    );
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Set STAGING_ENV_FILE");
  });

  it.each(["production", "staging URL with a different database"])(
    "rejects %s before opening a database connection",
    (scenario) => {
      const directory = mkdtempSync(join(tmpdir(), "il-staging-guard-"));
      const file = join(directory, ".env");
      const ref = "lgjujyaclrpaopdabyzg";
      const marker = "never-print-this-test-password";
      try {
        writeFileSync(
          file,
          [
            `SUPABASE_PROJECT_REF=${ref}`,
            `NEXT_PUBLIC_APP_ENV=${scenario === "production" ? "production" : "staging"}`,
            "INDUSTRIAL_LEARN_AUTH_MODE=supabase",
            "INDUSTRIAL_LEARN_E2E=false",
            `NEXT_PUBLIC_SUPABASE_URL=https://${ref}.supabase.co`,
            `SUPABASE_DB_URL=postgresql://postgres:${marker}@db.other-project.supabase.co/postgres`
          ].join("\n"),
          { mode: 0o600 }
        );
        const result = spawnSync(
          process.execPath,
          ["scripts/verify-staging-publication.mjs"],
          { encoding: "utf8", env: { PATH: process.env.PATH, STAGING_ENV_FILE: file } }
        );
        expect(result.status).toBe(1);
        expect(result.stderr).toContain("guard failed");
        expect(result.stdout + result.stderr).not.toContain(marker);
      } finally {
        rmSync(directory, { recursive: true, force: true });
      }
    }
  );
});
