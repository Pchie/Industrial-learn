import fluidPressureLesson from "../../../../../content/lessons/fluid-pressure/basic-fluid-pressure.json";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { StructuredLesson } from "../lesson-engine/types";

import { BasicFluidPressureVisualLesson } from "./basic-fluid-pressure-visual-lesson";
import { getBasicPressureExperienceContent } from "./content";

describe("Basic Fluid Pressure visual lesson", () => {
  const content = getBasicPressureExperienceContent(
    fluidPressureLesson as StructuredLesson
  );

  it("renders the interactive visual before observation and detailed theory", () => {
    const markup = renderToStaticMarkup(
      createElement(BasicFluidPressureVisualLesson, { content })
    );

    expect(markup).toContain('data-testid="basic-fluid-pressure-visual-lesson"');
    expect(markup.indexOf("Normal force over contact area")).toBeLessThan(
      markup.indexOf("2. Observe")
    );
    expect(markup).toContain('aria-label="Normal force slider"');
    expect(markup).toContain('aria-label="Normal force numeric input"');
    expect(markup).toContain('aria-label="Contact area slider"');
    expect(markup).toContain('aria-label="Contact area numeric input"');
    expect(markup).toContain("100.0");
    expect(markup).toContain('aria-live="polite"');
  });

  it("uses structured observations, challenge, application, and honest limits", () => {
    const markup = renderToStaticMarkup(
      createElement(BasicFluidPressureVisualLesson, { content })
    );

    for (const observation of content.observations) {
      expect(markup).toContain(observation.prompt);
    }
    expect(markup).toContain("Create 200 kPa of pressure");
    expect(markup).toContain("Hydraulic press concept");
    expect(markup).toContain("not physical dimensions or a time response");
    expect(markup).toContain("not an equipment rating");
    expect(markup).not.toContain("seal leak");
    expect(markup).not.toContain("Inject fault");
  });

  it("keeps pressure calculation metadata outside the UI component", () => {
    const markup = renderToStaticMarkup(
      createElement(BasicFluidPressureVisualLesson, { content })
    );

    expect(markup).toContain("EQ-FLUID-PRESSURE-001");
    expect(markup).toContain("p = F / A");
    expect(content.hero.reviewStatus).toBe("Engineering review required");
  });
});
