import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { LessonRenderer } from "./components";
import { getInternalLessonBySlug, getSourceRecordsById } from "./data";
import type { StructuredLesson } from "./types";
import {
  getInternalVisualExperienceOverrides,
  REGISTERED_VISUAL_EXPERIENCE_IDS
} from "./visual-experience-registry";

function getLessonBySlug(slug: string) {
  return getInternalLessonBySlug({
    slug,
    audience: "administrator",
    access: { administratorAuthorized: true }
  });
}

describe("lesson engine renderer", () => {
  it("renders the pilot lesson from structured content blocks", () => {
    const lesson = getLessonBySlug("basic-fluid-pressure");

    expect(lesson).toBeDefined();

    const markup = renderToStaticMarkup(
      createElement(LessonRenderer, {
        lesson: lesson!,
        sources: getSourceRecordsById(lesson!.sourceIds)
      })
    );

    expect(markup).toContain("Basic Fluid Pressure");
    expect(markup).toContain("Engineering review required");
    expect(markup).toContain("Show calculation steps");
    expect(markup).toContain("p = F / A");
    expect(markup).toContain("Source ID:");
    expect(markup).toContain("SRC-OPENSTAX-COLLEGE-PHYSICS-2012");
  });

  it("keeps accessibility-critical lesson affordances in the rendered markup", () => {
    const lesson = getLessonBySlug("basic-fluid-pressure");
    const markup = renderToStaticMarkup(
      createElement(LessonRenderer, {
        lesson: lesson!,
        sources: getSourceRecordsById(lesson!.sourceIds)
      })
    );

    expect(markup).toContain('aria-label="Lesson sections"');
    expect(markup).toContain('role="img"');
    expect(markup).toContain("A downward force arrow spreads over a rectangular area");
    expect(markup).toContain("<fieldset");
    expect(markup).toContain('type="radio"');
  });

  it("does not save or fake progress for signed-out students", () => {
    const lesson = getLessonBySlug("basic-fluid-pressure");
    const markup = renderToStaticMarkup(
      createElement(LessonRenderer, {
        lesson: lesson!,
        sources: getSourceRecordsById(lesson!.sourceIds)
      })
    );

    expect(markup).toContain("Progress is not saved in signed-out mode");
    expect(markup).not.toContain("100%");
  });

  it("renders the first Smart Pump Systems lesson through the reusable engine", () => {
    const lesson = getLessonBySlug("pump-system-units-and-measurements");

    expect(lesson).toBeDefined();

    const markup = renderToStaticMarkup(
      createElement(LessonRenderer, {
        lesson: lesson!,
        sources: getSourceRecordsById(lesson!.sourceIds)
      })
    );

    expect(markup).toContain("Pump System Units And Measurements");
    expect(markup).toContain("quantity, value, unit, and context");
    expect(markup).toContain("SRC-NIST-SP330-2019");
    expect(markup).toContain("SRC-DOE-PUMP-SOURCEBOOK-2006");
    expect(markup).not.toContain("SRC-SMART-PUMP-PLACEHOLDER-001");
  });

  it("renders the draft thermodynamics foundation lesson without equations", () => {
    const lesson = getLessonBySlug("systems-surroundings-boundaries");

    expect(lesson).toBeDefined();

    const markup = renderToStaticMarkup(
      createElement(LessonRenderer, {
        lesson: lesson!,
        sources: getSourceRecordsById(lesson!.sourceIds)
      })
    );

    expect(markup).toContain("Thermodynamic Systems, Surroundings And Boundaries");
    expect(markup).toContain("SRC-PURDUE-ME200-THERMO-DEFINITIONS-2021");
    expect(markup).toContain("No equation is required for this classification lesson");
    expect(markup).not.toContain("steam table");
  });

  it("renders an optional visual-v2 stage sequence without changing legacy lessons", () => {
    const legacyLesson = getLessonBySlug("basic-fluid-pressure");
    expect(legacyLesson).toBeDefined();

    const lesson: StructuredLesson = {
      ...legacyLesson!,
      schemaVersion: "2.0.0",
      experienceModel: "visual-v2",
      experienceSequence: [
        {
          stage: "heroExperience",
          title: "See the supplied simulation state",
          blocks: [
            {
              id: "BLOCK-VISUAL-TEST-001",
              type: "heroSimulation",
              title: "Visual simulation reference",
              description: "The lesson renderer delegates visual state to the feature.",
              simulationId: "SIM-TEST-001",
              mode: "demonstration",
              sourceIds: ["SRC-OPENSTAX-COLLEGE-PHYSICS-2012"],
              reviewStatus: "Source required",
              accessibility: {
                label: "Visual simulation reference",
                textAlternative: "A supplied simulation state appears here.",
                keyboardInstructions: "Use the labelled controls.",
                reducedMotionFallback: "Use stepped state changes."
              }
            }
          ]
        }
      ]
    };

    const markup = renderToStaticMarkup(
      createElement(LessonRenderer, {
        lesson,
        sources: getSourceRecordsById(lesson.sourceIds)
      })
    );

    expect(markup).toContain("Visual-first structured lesson");
    expect(markup).toContain("See the supplied simulation state");
    expect(markup).toContain("SIM-TEST-001");
    expect(markup).not.toContain('id="theory"');
  });

  it("supports a registered visual-stage experience without hard-coding a lesson layout", () => {
    const lesson = getLessonBySlug("hydraulic-cylinder-force");
    expect(lesson).toBeDefined();

    const markup = renderToStaticMarkup(
      createElement(LessonRenderer, {
        lesson: lesson!,
        sources: getSourceRecordsById(lesson!.sourceIds),
        visualStageOverrides: {
          heroExperience: createElement(
            "div",
            { "data-testid": "registered-experience" },
            "Registered hydraulic experience"
          )
        }
      })
    );

    expect(markup).toContain("Registered hydraulic experience");
    expect(markup).not.toContain("Interactive cap-end hydraulic cylinder force model");
    expect(markup).not.toContain(
      "<h2>See, interact, observe, explain, calculate, challenge and apply</h2>"
    );
    expect(markup).toContain("Check your understanding");
    expect(markup).toContain("Visual lesson progression");
    expect(markup).toContain("Outcomes, prerequisites and lesson details");
    expect(markup).toContain("Source records");
    expect(markup.indexOf("Registered hydraulic experience")).toBeLessThan(
      markup.indexOf('aria-label="Lesson metadata"')
    );
    expect(markup.indexOf("Registered hydraulic experience")).toBeLessThan(
      markup.indexOf("Progress is not saved in signed-out mode")
    );
  });

  it("resolves visual experiences by simulation ID rather than lesson slug", () => {
    const lesson = getLessonBySlug("hydraulic-cylinder-force");
    expect(lesson).toBeDefined();
    expect(REGISTERED_VISUAL_EXPERIENCE_IDS).toContain("SIM-HYD-CYL-FORCE-001");
    expect(REGISTERED_VISUAL_EXPERIENCE_IDS).toContain("SIM-FLUID-BERNOULLI-FLOW-001");
    expect(getInternalVisualExperienceOverrides(lesson!)?.heroExperience).toBeDefined();
    expect(
      getInternalVisualExperienceOverrides({
        ...lesson!,
        slug: "renamed-route-safe-lesson",
        simulationIds: ["SIM-NOT-REGISTERED-001"]
      })
    ).toBeUndefined();
  });
});
