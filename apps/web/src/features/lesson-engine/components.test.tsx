import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { LessonRenderer } from "./components";
import { getLessonBySlug, getSourceRecordsById } from "./data";

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
    expect(markup).toContain("Source required");
    expect(markup).toContain("Show calculation steps");
    expect(markup).toContain("p = F / A");
    expect(markup).toContain("Source ID:");
    expect(markup).toContain("SRC-FLUID-PRESSURE-PLACEHOLDER-001");
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
    expect(markup).toContain("SRC-SMART-PUMP-PLACEHOLDER-001");
  });
});
