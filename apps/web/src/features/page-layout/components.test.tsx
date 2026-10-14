import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ImageBand, PageHeading, PageLink, WorkspaceEmptyState } from "./components";
import { PageLoading } from "./loading";

describe("shared page presentation", () => {
  it("renders a single labelled page heading and optional actions", () => {
    const html = renderToStaticMarkup(
      <PageHeading id="learning-title" title="Learning" description="Your next step">
        <PageLink href="/learn">Browse learning</PageLink>
      </PageHeading>
    );
    expect(html).toContain('<h1 id="learning-title">Learning</h1>');
    expect(html).toContain('href="/learn"');
    expect(html.match(/<h1/g)).toHaveLength(1);
  });

  it("uses approved presentation assets as decorative context, not review evidence", () => {
    const html = renderToStaticMarkup(
      <ImageBand
        image="future"
        title="Future Engineering"
        description="Explore your next step"
        headingLevel={1}
      />
    );
    expect(html).toContain('alt=""');
    expect(html).toContain("future-engineering-banner.webp");
    expect(html).toContain("<h1>Future Engineering</h1>");
    expect(html).not.toContain("Approved for student use");
    expect(html).not.toContain("THREE");
  });

  it("keeps preparation states honest and offers a real destination", () => {
    const html = renderToStaticMarkup(
      <WorkspaceEmptyState
        title="Project workspace is being prepared"
        kind="projects"
        action={<PageLink href="/dashboard">Your dashboard</PageLink>}
      >
        <p>Project submission is not available yet.</p>
      </WorkspaceEmptyState>
    );
    expect(html).toContain("not available yet");
    expect(html).toContain('href="/dashboard"');
    expect(html).not.toContain("100%");
  });

  it("announces loading without fabricated records", () => {
    const html = renderToStaticMarkup(
      <PageLoading title="Loading" description="Preparing your workspace" />
    );
    expect(html).toContain('aria-busy="true"');
    expect(html).toContain('aria-live="polite"');
    expect(html).not.toContain("Completed");
  });
});
