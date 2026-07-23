import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { describe, expect, it } from "vitest";

import { LessonList, ModuleCard, ProgressNotice } from "./components";
import { getCurriculum, getModule } from "./data";

describe("curriculum browsing components", () => {
  it("does not display fake completion data in signed-out progress messaging", () => {
    const markup = renderToStaticMarkup(createElement(ProgressNotice));

    expect(markup).toContain("Progress appears after sign in");
    expect(markup).not.toContain("100%");
  });

  it("shows module prerequisites and locked state from curriculum JSON", () => {
    const curriculum = getCurriculum();
    const robotics = getModule("robotics-foundations");

    expect(robotics).toBeDefined();

    const markup = renderToStaticMarkup(
      createElement(ModuleCard, {
        allModules: curriculum.modules,
        module: robotics!.module
      })
    );

    expect(markup).toContain("Prerequisites required");
    expect(markup).toContain("Control Systems Foundations");
    expect(markup).toContain("Programming For Engineers Foundations");
  });

  it("shows available lessons without lesson-page links", () => {
    const moduleRecord = getModule("fluid-mechanics-foundations");

    expect(moduleRecord).toBeDefined();

    const markup = renderToStaticMarkup(
      createElement(LessonList, { module: moduleRecord!.module })
    );

    expect(markup).toContain("Available lesson");
    expect(markup).toContain(
      "Next step: begin with this lesson when lesson pages are built."
    );
  });
});
