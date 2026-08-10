import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { MonitoringErrorBoundaryView } from "./error-boundary-view";

describe("monitoring error boundary view", () => {
  it("renders safe recovery copy without stack traces or private data", () => {
    const html = renderToStaticMarkup(
      <MonitoringErrorBoundaryView
        title="Assessment attempt needs attention"
        description="The assessment workflow caught an unexpected problem."
        reference="NEXT_DIGEST"
      />
    );

    expect(html).toContain("Assessment attempt needs attention");
    expect(html).toContain("NEXT_DIGEST");
    expect(html).not.toContain("password");
    expect(html).not.toContain("stack");
    expect(html).not.toContain("submitted answer");
  });
});
