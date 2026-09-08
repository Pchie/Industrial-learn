import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function openDashboard(page: Page) {
  await page.goto("/auth/sign-in?next=%2Fdashboard");
  await page.getByLabel("Email address").fill("active.student@example.test");
  await page.getByLabel("Password").fill("IndustrialLearn1!");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

test("finite stagger and image reveal leave readable, stable content", async ({
  page
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await openDashboard(page);
  const hero = page.locator("#continue-learning");
  await expect(hero).toHaveCSS("animation-duration", "0.28s");
  await expect(hero).toHaveCSS("animation-delay", "0.045s");
  await expect(hero).toHaveCSS("animation-iteration-count", "1");
  await expect(hero.locator("figure > img")).toHaveCSS("animation-duration", "0.36s");
  const snapshot = page.getByRole("complementary", { name: "Study snapshot" });
  await expect(snapshot.locator("section").nth(1)).toHaveCSS("animation-delay", "0.135s");
  await expect
    .poll(() =>
      page.evaluate(
        () => document.getAnimations().filter((a) => a.playState === "running").length
      )
    )
    .toBe(0);
  await expect(hero).toHaveCSS("opacity", "1");
  await expect(hero).toHaveCSS("transform", "none");
  const art = page.getByRole("img", { name: /Concept close-up/ });
  await art.scrollIntoViewIfNeeded();
  await expect(art).toHaveAttribute("loading", "lazy");
  await expect
    .poll(() =>
      art.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)
    )
    .toBe(true);
  await expect(page.locator("canvas")).toHaveCount(0);
});

test("CTA press feedback preserves size and stays within its target", async ({
  page
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await openDashboard(page);
  const action = page
    .locator("#continue-learning")
    .getByRole("link", { name: "Return to lesson", exact: true });
  await expect(page.locator("#continue-learning")).toHaveCSS("transform", "none");
  await action.hover();
  const before = (await action.boundingBox())!;
  await page.mouse.move(before.x + before.width / 2, before.y + before.height / 2);
  await page.mouse.down();
  await expect(action).toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 1)");
  const during = (await action.boundingBox())!;
  expect(during.width).toBeCloseTo(before.width, 1);
  expect(during.height).toBeCloseTo(before.height, 1);
  expect(Math.abs(during.y - before.y)).toBeLessThanOrEqual(1.1);
  await page.mouse.move(1, 1);
  await page.mouse.up();
  await expect(action).toHaveCSS("transform", "none");
  await expect(page).toHaveURL(/\/dashboard$/);
});

test("rendered desktop links and disclosures work in a no-script component fixture", async ({
  page,
  browser
}) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await openDashboard(page);
  await expect(
    page.getByRole("heading", { name: /Active Industrial Student/, exact: true })
  ).toBeVisible();
  await page.getByLabel("Appearance").selectOption("light");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          document
            .getAnimations()
            .filter((animation) => animation.playState === "running").length
      )
    )
    .toBe(0);
  // Test the rendered controls, independently of Next's script-dependent streaming boot.
  const markup = await page.content();
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 1536, height: 1024 }
  });
  await context.route("**/dashboard", (route) =>
    route.fulfill({ contentType: "text/html", body: markup })
  );
  const fixture = await context.newPage();
  await fixture.goto(page.url());
  await fixture
    .getByRole("navigation", { name: "Primary navigation" })
    .getByRole("link", { name: "Saved", exact: true })
    .focus();
  await fixture.keyboard.press("Enter");
  await expect(fixture).toHaveURL(/#saved$/);
  await fixture.getByText("Prerequisite knowledge", { exact: true }).focus();
  await fixture.keyboard.press("Enter");
  await expect(
    fixture.getByText("These knowledge requirements are not verified competency awards.")
  ).toBeVisible();
  await context.close();
});

test("study selection follows keyboard navigation, quick links and history", async ({
  page
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await openDashboard(page);
  const nav = page.getByRole("navigation", { name: "Primary navigation" });
  const learning = nav.getByRole("link", { name: "Saved", exact: true });
  await learning.focus();
  await page.keyboard.press("Enter");
  await expect(learning).toHaveAttribute("aria-current", "location");
  await expect(page).toHaveURL(/#saved$/);
  await page
    .getByRole("navigation", { name: "Learning quick actions" })
    .getByRole("link", { name: /Your progress/ })
    .click();
  await expect(nav.getByRole("link", { name: "Progress", exact: true })).toHaveAttribute(
    "aria-current",
    "location"
  );
  await expect(nav.locator("[aria-current]")).toHaveCount(1);
  await page.goBack();
  await expect(learning).toHaveAttribute("aria-current", "location");
  await page.goBack();
  await expect(nav.getByRole("link", { name: "Dashboard", exact: true })).toHaveAttribute(
    "aria-current",
    "page"
  );
});

test("native disclosures expand, collapse and survive rapid toggling", async ({
  page
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await openDashboard(page);
  const summary = page.getByText("Prerequisite knowledge", { exact: true });
  const details = summary.locator("..");
  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(details).toHaveAttribute("open", "");
  await expect(details.getByRole("list")).toBeVisible();
  const expanded = (await details.boundingBox())!.height;
  await page.keyboard.press("Enter");
  await expect(details).not.toHaveAttribute("open");
  await expect
    .poll(async () => (await details.boundingBox())!.height)
    .toBeLessThan(expanded);
  await page.keyboard.press("Enter");
  await page.keyboard.press("Enter");
  await page.keyboard.press("Enter");
  await expect(details).toHaveAttribute("open", "");
  await expect
    .poll(() =>
      details.evaluate((el) => getComputedStyle(el, "::details-content").opacity)
    )
    .toBe("1");
  await expect(summary).toBeFocused();
  await expect(summary).toHaveCSS("outline-style", "solid");
});

test("theme palettes switch atomically with brief icon motion and persistent contrast", async ({
  page
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await openDashboard(page);
  await expect(page.locator("#continue-learning")).toHaveCSS(
    "transition-duration",
    "0.18s"
  );
  for (const theme of ["dark", "light", "dark"]) {
    await page.getByLabel("Appearance").selectOption(theme);
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    await expect(page.locator(".theme-toggle > svg")).toHaveCSS(
      "animation-duration",
      "0.18s"
    );
    const colours = await page
      .getByRole("heading", { level: 1 })
      .evaluate(async (heading) => {
        const samples: string[] = [];
        for (let frame = 0; frame < 6; frame += 1) {
          samples.push(getComputedStyle(heading).color);
          await new Promise(requestAnimationFrame);
        }
        return samples;
      });
    expect(new Set(colours)).toEqual(
      new Set([theme === "dark" ? "rgb(245, 248, 255)" : "rgb(16, 27, 74)"])
    );
    await expect
      .poll(() =>
        page.evaluate(
          () => document.getAnimations().filter((a) => a.playState === "running").length
        )
      )
      .toBe(0);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze()
      ).violations
    ).toEqual([]);
  }
  await page.reload();
  await expect(page.getByLabel("Appearance")).toHaveValue("dark");
});

test("reduced motion removes travel, stagger and expanding transitions", async ({
  page
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 375, height: 900 });
  await openDashboard(page);
  for (const element of [
    page.locator("#continue-learning"),
    page.locator("#continue-learning figure > img"),
    page.locator(".theme-toggle > svg"),
    page.getByRole("img", { name: /Concept close-up/ })
  ]) {
    await expect(element).toHaveCSS("animation-name", "none");
    await expect(element).toHaveCSS("opacity", "1");
  }
  const menu = page.getByRole("button", { name: "Open navigation" });
  await menu.focus();
  await page.keyboard.press("Enter");
  await expect(
    page.getByRole("navigation", { name: "Mobile navigation", exact: true })
  ).toBeVisible();
  await expect(page.locator(".shell-drawer")).toHaveCSS("animation-name", "none");
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
  ).toBeLessThanOrEqual(1);
});

test("shared tabs retain keyboard focus and animate only the selected indicator", async ({
  page
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/internal/design-system");
  const tabs = page.getByRole("tab");
  await tabs.first().focus();
  await page.keyboard.press("ArrowRight");
  await expect(tabs.nth(1)).toBeFocused();
  await expect(tabs.nth(1)).toHaveAttribute("aria-selected", "true");
  await expect
    .poll(() => tabs.nth(1).evaluate((el) => getComputedStyle(el, "::after").transform))
    .toBe("matrix(1, 0, 0, 1, 0, 0)");
  await expect
    .poll(() => tabs.first().evaluate((el) => getComputedStyle(el, "::after").transform))
    .toBe("matrix(0, 0, 0, 1, 0, 0)");
  await expect(page.getByRole("tabpanel")).toHaveCount(1);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.keyboard.press("ArrowLeft");
  await expect(tabs.first()).toBeFocused();
  expect(
    await tabs
      .first()
      .evaluate((el) => parseFloat(getComputedStyle(el, "::after").transitionDuration))
  ).toBeLessThanOrEqual(0.00001);
});
