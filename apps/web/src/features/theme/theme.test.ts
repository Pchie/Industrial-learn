import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { designTokens } from "@industrial-learn/design-system";
import { parseTheme, themeInitialiser } from "./theme";

describe("appearance preference", () => {
  it.each(["light", "dark", "system"] as const)("accepts %s", (theme) =>
    expect(parseTheme(theme)).toBe(theme)
  );
  it.each([null, undefined, "", "<script>", "LIGHT"])(
    "defaults invalid values to system",
    (value) => expect(parseTheme(value)).toBe("system")
  );
  it("does not include account or secret data in the pre-hydration script", () => {
    expect(themeInitialiser).not.toMatch(/fetch|cookie|supabase|token|password/i);
  });
});

describe("semantic palette contrast", () => {
  const css = readFileSync(
    new URL("../../../../../packages/design-system/src/styles.css", import.meta.url),
    "utf8"
  );
  const values = new Map(
    Array.from(
      css.matchAll(/(--il-(?:light|dark|brand)-[\w-]+):\s*([^;]+);/g),
      (match) => [match[1]!, match[2]!.trim()]
    )
  );
  function colour(name: string): number[] {
    const value = values.get(name);
    if (!value) throw new Error(`Missing palette value: ${name}`);
    const alias = value.match(/^var\((--[\w-]+)\)$/);
    if (alias) return colour(alias[1]!);
    if (!/^#[0-9a-f]{6}$/i.test(value)) throw new Error(`Unexpected colour: ${name}`);
    return [1, 3, 5].map((index) => parseInt(value.slice(index, index + 2), 16) / 255);
  }
  function luminance(rgb: number[]) {
    const linear = rgb.map((c) =>
      c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
    );
    return linear[0]! * 0.2126 + linear[1]! * 0.7152 + linear[2]! * 0.0722;
  }
  function contrast(a: string, b: string) {
    const x = luminance(colour(a)),
      y = luminance(colour(b));
    return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
  }
  for (const theme of ["light", "dark"]) {
    it(`${theme} text, action and state colours meet text contrast`, () => {
      for (const background of ["page", "surface", "muted", "elevated"]) {
        for (const text of [
          "text-primary",
          "text-secondary",
          "text-muted",
          "action-primary",
          "action-secondary",
          "state-normal",
          "state-info",
          "state-warning",
          "state-fault"
        ]) {
          expect(
            contrast(
              `--il-${theme}-color-${text}`,
              `--il-${theme}-color-bg-${background}`
            ),
            `${theme}: ${text} on ${background}`
          ).toBeGreaterThanOrEqual(4.5);
        }
      }
      expect(
        contrast(
          `--il-${theme}-color-brand-on-accent`,
          `--il-${theme}-color-action-primary`
        )
      ).toBeGreaterThanOrEqual(4.5);
      expect(
        contrast(`--il-${theme}-color-focus`, `--il-${theme}-color-bg-surface`)
      ).toBeGreaterThanOrEqual(3);
    });
    it(`${theme} interactive and feature pairs remain accessible`, () => {
      for (const [foreground, background, minimum] of [
        ["nav-active-text", "nav-active-bg", 4.5],
        ["text-secondary", "hover", 4.5],
        ["brand-on-accent", "action-primary-hover", 4.5],
        ["feature-text", "feature-bg", 4.5],
        ["feature-secondary", "feature-bg", 4.5],
        ["feature-action-text", "feature-action-bg", 4.5],
        ["focus", "nav-active-bg", 3],
        ["border-strong", "bg-surface", 3],
        ["border-strong", "bg-muted", 3]
      ] as const) {
        expect(
          contrast(
            `--il-${theme}-color-${foreground}`,
            `--il-${theme}-color-${background}`
          ),
          `${theme}: ${foreground} on ${background}`
        ).toBeGreaterThanOrEqual(minimum);
      }
      for (const diagramToken of [
        "text-secondary",
        "state-warning",
        "domain-hydraulic"
      ]) {
        expect(
          contrast(`--il-dark-color-${diagramToken}`, `--il-${theme}-color-feature-bg`),
          `diagram ${diagramToken} on ${theme} feature`
        ).toBeGreaterThanOrEqual(3);
      }
    });
  }
  it("defines all exported semantic tokens without duplicating hex values in TypeScript", () => {
    const references = JSON.stringify(designTokens).matchAll(/var\((--[\w-]+)\)/g);
    for (const match of references) expect(css).toContain(`${match[1]}:`);
    expect(JSON.stringify(designTokens)).not.toMatch(/#[0-9a-f]{6}/i);
    expect(css).not.toContain("--il-color-orange-");
  });
  it("keeps application focus styles on the shared ring token", () => {
    const appCss = readFileSync(
      new URL("../../app/globals.css", import.meta.url),
      "utf8"
    );
    expect(appCss).not.toContain("--il-color-focus-ring");
    expect(appCss).toMatch(
      /\.simulation-mode-button:focus-visible\s*\{[^}]*outline: var\(--il-focus-ring\)/
    );
  });
});
