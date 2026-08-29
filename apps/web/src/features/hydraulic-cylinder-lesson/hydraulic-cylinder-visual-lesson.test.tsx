import hydraulicCylinderLesson from "../../../../../content/lessons/hydraulics/hydraulic-cylinder-force.json";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { StructuredLesson } from "../lesson-engine/types";

import { getHydraulicCylinderExperienceContent } from "./content";
import { HydraulicCylinderVisualLesson } from "./hydraulic-cylinder-visual-lesson";

describe("hydraulic cylinder visual lesson", () => {
  const content = getHydraulicCylinderExperienceContent(
    hydraulicCylinderLesson as StructuredLesson
  );

  it("renders the visual experience with synchronized defaults", () => {
    const markup = renderToStaticMarkup(
      createElement(HydraulicCylinderVisualLesson, { content })
    );

    expect(
      markup.indexOf("Pressure acting over piston area produces force.")
    ).toBeLessThan(markup.indexOf("2. Play with it, then observe"));
    expect(content.hero.reviewStatus).toBe("Engineering review required");
    expect(markup).toContain('aria-label="Pressure slider"');
    expect(markup).toContain('aria-label="Pressure numeric input"');
    expect(markup).toContain('value="5"');
    expect(markup).toContain('aria-label="Piston diameter slider"');
    expect(markup).toContain('value="50"');
    expect(markup).toContain("9.82");
    expect(markup).toContain("Pressurised hydraulic state");
    expect(markup).toContain('aria-live="polite"');
    expect(markup).toMatch(
      /aria-label="Cutaway hydraulic cylinder view[^>]+role="group"/
    );
  });

  it("does not imply time dynamics or duplicate source records in the hero", () => {
    const markup = renderToStaticMarkup(
      createElement(HydraulicCylinderVisualLesson, { content })
    );

    expect(markup).not.toContain("Simulation playback controls");
    expect(markup).not.toContain("Frame 0");
    expect(markup).not.toContain("Simulation speed");
    expect(markup).not.toContain("Source ID:");
    expect(markup).toContain("Static pressure state");
  });

  it("keeps fault behavior deferred and formal assessment server-controlled", () => {
    const markup = renderToStaticMarkup(
      createElement(HydraulicCylinderVisualLesson, { content })
    );

    expect(markup).toContain(
      "Fault diagnosis is introduced in a later hydraulic system lesson"
    );
    expect(markup).not.toContain("Inject fault");
    expect(markup).toContain('href="/assessments/staging-pressure-check"');
    expect(markup).toContain("authenticated and server scored");
    expect(markup).toContain("does not award progress or competency");
  });

  it("uses the structured content for observations and the sourced application", () => {
    const markup = renderToStaticMarkup(
      createElement(HydraulicCylinderVisualLesson, { content })
    );

    for (const observation of content.observations) {
      expect(markup).toContain(observation.prompt);
    }
    expect(markup).toContain("Excavator boom cylinder");
    expect(content.application.sourceIds).toContain("SRC-CAT-BOOM-CYLINDER-6040431-2026");
  });
});
