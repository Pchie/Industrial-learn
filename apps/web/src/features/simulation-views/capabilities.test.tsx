import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import {
  getSupportedViews,
  isStudentViewReleased,
  isSupportedView,
  viewHref
} from "./capabilities";
import { AnatomyOverlay, ExplodedAssemblyView } from "./hydraulic-inspection";
import { simulationRegistry } from "../simulations/catalog";

describe("inspection capabilities", () => {
  it("declares only model-appropriate modes", () => {
    expect(getSupportedViews("basic-fluid-pressure")).toEqual(["standard"]);
    expect(getSupportedViews("hydraulic-cylinder-force")).toEqual([
      "standard",
      "anatomy",
      "explodedview",
      "360view"
    ]);
    expect(getSupportedViews("bernoulli-flow-lab")).toEqual(["standard", "aerialview"]);
    expect(getSupportedViews("unknown")).toEqual([]);
    expect(getSupportedViews("__proto__")).toEqual([]);
    expect(isSupportedView("bernoulli-flow-lab", "360view")).toBe(false);
  });
  it("is linked to catalogue entries without changing publication", () => {
    const cylinder = simulationRegistry.find(
      (entry) => entry.slug === "hydraulic-cylinder-force"
    )!;
    expect(cylinder.viewModes).toEqual(getSupportedViews(cylinder.slug));
    for (const mode of cylinder.viewModes.filter((mode) => mode !== "standard"))
      expect(isStudentViewReleased(mode)).toBe(false);
  });
  it("builds canonical, connected view URLs", () => {
    expect(viewHref("/simulations/hydraulic-cylinder-force", "standard")).toBe(
      "/simulations/hydraulic-cylinder-force"
    );
    expect(viewHref("/simulations/hydraulic-cylinder-force", "anatomy")).toBe(
      "/simulations/hydraulic-cylinder-force/anatomy"
    );
  });
  it.each([AnatomyOverlay, ExplodedAssemblyView])(
    "keeps force data derived and assembly claims bounded",
    (component) => {
      const html = renderToStaticMarkup(
        createElement(component, { pressureMPa: 5, forceKN: 9.82, diameterRatio: 0.3 })
      );
      expect(html).toContain("9.82");
      expect(html).toContain("Engineering review required");
      expect(html).toContain("SRC-PARKER-140H8-CYLINDER-2024");
      for (const part of ["Barrel", "Piston", "Rod", "Seals", "End caps", "Chambers"])
        expect(html).toContain(part);
      expect(html).not.toContain("safe to operate");
    }
  );
});
