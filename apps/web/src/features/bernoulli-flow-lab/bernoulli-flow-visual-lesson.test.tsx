import bernoulliFlowLesson from "../../../../../content/lessons/fluid-mechanics/bernoulli-flow-lab.json";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { StructuredLesson } from "../lesson-engine/types";

import { BernoulliFlowVisualLesson } from "./bernoulli-flow-visual-lesson";
import { getBernoulliFlowExperienceContent } from "./content";

describe("Bernoulli flow visual lesson", () => {
  const content = getBernoulliFlowExperienceContent(
    bernoulliFlowLesson as StructuredLesson
  );

  it("renders the visual lab before observation and detailed theory", () => {
    const markup = renderToStaticMarkup(
      createElement(BernoulliFlowVisualLesson, { content })
    );

    expect(
      markup.indexOf("A smaller flow area changes velocity and ideal pressure.")
    ).toBeLessThan(markup.indexOf("2. Play, then observe"));
    expect(content.hero.reviewStatus).toBe("Engineering review required");
    expect(markup).toContain('data-testid="bernoulli-flow-visual-lesson"');
    expect(markup).toContain('aria-label="Flow rate slider"');
    expect(markup).toContain('aria-label="Flow rate numeric input"');
    expect(markup).toContain('aria-label="Section 2 diameter slider"');
    expect(markup).toContain('aria-label="Section 2 diameter numeric input"');
    expect(markup).toContain("Cutaway ideal pipe-flow view");
    expect(markup).toContain('aria-live="polite"');
  });

  it("uses structured observations, challenges, application, and honest limits", () => {
    const markup = renderToStaticMarkup(
      createElement(BernoulliFlowVisualLesson, { content })
    );

    for (const observation of content.observations) {
      expect(markup).toContain(observation.prompt);
    }
    expect(markup).toContain("Reach 6 m/s at section 2");
    expect(markup).toContain("Predict section 2 pressure");
    expect(markup).toContain("Venturi-style differential-pressure concept");
    expect(markup).toContain("Engineering review required");
    expect(markup).not.toContain("Approved for student use");
    expect(markup).not.toContain("Your pipe design is safe");
  });

  it("labels presentation motion and defers unsupported fault and assessment behavior", () => {
    const markup = renderToStaticMarkup(
      createElement(BernoulliFlowVisualLesson, { content })
    );

    expect(markup).toContain("Play flow cue");
    expect(markup).toContain("not a time solution");
    expect(markup).toContain(
      "Fault diagnosis is introduced in a later fluid-system lesson"
    );
    expect(markup).toContain("do not award progress or competency");
    expect(markup).not.toContain("Inject fault");
    expect(markup).not.toContain("Correct answer:");
  });
});
