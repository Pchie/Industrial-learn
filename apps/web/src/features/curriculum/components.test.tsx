import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { describe, expect, it } from "vitest";

import {
  LessonList,
  ModuleCard,
  ProgressNotice,
  PublishedLessonSection
} from "./components";
import { getCurriculum, getInternalCurriculum, getModule } from "./data";
import { getPublicLessons } from "../lesson-engine/data";

describe("curriculum browsing components", () => {
  it("does not display fake completion data in signed-out progress messaging", () => {
    const markup = renderToStaticMarkup(createElement(ProgressNotice));

    expect(markup).toContain("Progress appears after sign in");
    expect(markup).not.toContain("100%");
  });

  it("shows module prerequisites and locked state from curriculum JSON", () => {
    const curriculum = getInternalCurriculum();
    const robotics = curriculum.modules.find(
      (module) => module.slug === "robotics-foundations"
    );

    expect(robotics).toBeDefined();

    const markup = renderToStaticMarkup(
      createElement(ModuleCard, {
        allModules: curriculum.modules,
        module: robotics!
      })
    );

    expect(markup).toContain("Prerequisites required");
    expect(markup).toContain("Control Systems Foundations");
    expect(markup).toContain("Programming For Engineers Foundations");
  });

  it("shows available lessons without lesson-page links", () => {
    const moduleRecord = getInternalCurriculum().modules.find(
      (module) => module.slug === "fluid-mechanics-foundations"
    );

    expect(moduleRecord).toBeDefined();

    const markup = renderToStaticMarkup(
      createElement(LessonList, { module: moduleRecord! })
    );

    expect(markup).toContain("Available lesson");
    expect(markup).toContain(
      "Next step: begin with this lesson when lesson pages are built."
    );
  });

  it("excludes review-gated modules from public curriculum lookup", () => {
    expect(getCurriculum().modules).toEqual([]);
    expect(getModule("fluid-mechanics-foundations")).toBeUndefined();
  });

  it("renders only registry-approved published lessons", () => {
    const markup = renderToStaticMarkup(
      createElement(PublishedLessonSection, {
        lessons: getPublicLessons(),
        searchable: true
      })
    );

    expect(markup).toContain("Basic Fluid Pressure");
    expect(markup).toContain("/lessons/basic-fluid-pressure");
    expect(markup).not.toContain("Hydraulic Cylinder Force");
    expect(markup).not.toContain("Bernoulli Flow Lab");
  });
});
