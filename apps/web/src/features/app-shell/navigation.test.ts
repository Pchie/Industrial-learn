import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { frontendAssets } from "./assets";
import { navigationIsActive, shellNavigation } from "./navigation";

describe("shared shell presentation contract", () => {
  it("selects one route or saved location without prefix collisions", () => {
    expect(navigationIsActive("/", "/learn", "")).toBe(false);
    expect(navigationIsActive("/learn", "/learn/core-engineering", "")).toBe(false);
    expect(
      navigationIsActive("/learn/core-engineering", "/learn/core-engineering", "")
    ).toBe(true);
    expect(navigationIsActive("/dashboard", "/dashboard", "#saved")).toBe(false);
    expect(navigationIsActive("/dashboard#saved", "/dashboard", "#saved")).toBe(true);
    expect(navigationIsActive("/assessments", "/assessments-extra", "")).toBe(false);
  });
  it("keeps private navigation marked and unsupported capabilities absent", () => {
    expect(
      shellNavigation.filter((item) => item.access === "public").map((item) => item.href)
    ).toEqual(["/", "/learn", "/simulations"]);
    expect(JSON.stringify(shellNavigation)).not.toMatch(
      /mentor|achievement|notification/
    );
  });
  it("uses existing public UI artwork, never instructional approval evidence", () => {
    const register: unknown = JSON.parse(
      readFileSync("docs/design/frontend-asset-manifest.json", "utf8")
    );
    expect(register).toMatchObject({ assets: frontendAssets });
    for (const asset of Object.values(frontendAssets)) {
      expect(existsSync(resolve("apps/web/public", asset.image.src.slice(1)))).toBe(true);
      expect(asset.image.width).toBeGreaterThan(0);
      expect(asset.image.height).toBeGreaterThan(0);
      expect(asset.classification).toBe("decorative");
      expect(asset.permittedUse).toBe("UI concept illustration only");
      expect(asset.provenance).toContain("generated artwork");
    }
  });
});
