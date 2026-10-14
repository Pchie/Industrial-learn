import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
const runner = resolve("scripts/apply-staging-remediation.mjs");
describe("remediation migration operator boundary", () => {
  it("requires an explicit environment file before database access", () => {
    const result = spawnSync(process.execPath, [runner], { encoding: "utf8" });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("No database contacted");
  });
  it("refuses live apply without the specific approval marker before reading credentials", () => {
    const result = spawnSync(
      process.execPath,
      [runner, "--apply", "--config-file", "/does-not-exist"],
      { encoding: "utf8", env: { PATH: process.env.PATH } }
    );
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Operator approval");
    expect(result.stderr).toContain("No database contacted");
  });
});
