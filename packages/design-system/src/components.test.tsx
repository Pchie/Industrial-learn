import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  Alert,
  Badge,
  Button,
  EngineeringReviewBadge,
  IconButton,
  Input,
  ProgressIndicator,
  RadioGroup,
  SourceReference,
  Tabs
} from "./components";
import { designTokens, VISUAL_STATE_SEMANTICS, visualStateSemantics } from "./tokens";

describe("design system components", () => {
  it("renders accessible labelled form controls", () => {
    const inputMarkup = renderToStaticMarkup(
      <Input helperText="Use the reviewed value only." label="Measurement name" />
    );
    const radioMarkup = renderToStaticMarkup(
      <RadioGroup
        legend="Operating state"
        name="state"
        options={[
          { label: "Normal operation", value: "normal" },
          { label: "Fault state", value: "fault" }
        ]}
      />
    );

    expect(inputMarkup).toContain("Measurement name");
    expect(inputMarkup).toContain("aria-describedby");
    expect(radioMarkup).toContain("<fieldset");
    expect(radioMarkup).toContain("<legend>Operating state</legend>");
  });

  it("requires icon buttons to expose a text label", () => {
    const markup = renderToStaticMarkup(<IconButton icon="?" label="Show help" />);

    expect(markup).toContain('aria-label="Show help"');
    expect(markup).toContain('title="Show help"');
  });

  it("renders state meaning as text as well as visual tone", () => {
    const markup = renderToStaticMarkup(
      <>
        <Alert title="Fault state" tone="fault">
          Pump flow is outside the expected training range.
        </Alert>
        <Badge tone="warning">Source required</Badge>
        <EngineeringReviewBadge status="Engineering review required" />
      </>
    );

    expect(markup).toContain("Fault state");
    expect(markup).toContain("Source required");
    expect(markup).toContain("Engineering review required");
  });

  it("renders tabs and progress with accessibility semantics", () => {
    const markup = renderToStaticMarkup(
      <>
        <Tabs
          activeId="tokens"
          tabs={[
            { id: "tokens", label: "Tokens", panel: "Token examples" },
            { id: "components", label: "Components", panel: "Component examples" }
          ]}
        />
        <ProgressIndicator label="Module progress" value={40} />
      </>
    );

    expect(markup).toContain('role="tablist"');
    expect(markup).toContain('aria-selected="true"');
    expect(markup).toContain("<progress");
    expect(markup).toContain("Module progress");
  });

  it("keeps source references explicit", () => {
    const markup = renderToStaticMarkup(<SourceReference sourceId="SRC-EXAMPLE-001" />);

    expect(markup).toContain("Source ID:");
    expect(markup).toContain("SRC-EXAMPLE-001");
  });

  it("defines engineering domain state tokens", () => {
    expect(designTokens.states).toMatchObject({
      brandAccent: "var(--il-color-brand-accent)",
      normalOperation: "var(--il-color-state-normal)",
      hydraulicFlow: "var(--il-color-domain-hydraulic)",
      electricalState: "var(--il-color-domain-electrical)",
      automationSignal: "var(--il-color-domain-automation)",
      temperatureIndication: "var(--il-color-domain-temperature)"
    });
  });

  it("defines every visual state with a text label and non-colour cue", () => {
    expect(VISUAL_STATE_SEMANTICS).toEqual([
      "normal",
      "active",
      "selected",
      "warning",
      "fault",
      "disabled",
      "measurement",
      "target"
    ]);

    for (const state of VISUAL_STATE_SEMANTICS) {
      expect(visualStateSemantics[state].label).toEqual(expect.any(String));
      expect(visualStateSemantics[state].nonColorCue).toEqual(expect.any(String));
      expect(designTokens.states[visualStateSemantics[state].token]).toEqual(
        expect.any(String)
      );
    }
  });

  it("renders regular buttons with button semantics", () => {
    const markup = renderToStaticMarkup(<Button>Continue</Button>);

    expect(markup).toContain("<button");
    expect(markup).toContain('type="button"');
    expect(markup).toContain("Continue");
  });
});
