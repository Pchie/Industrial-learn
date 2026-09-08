import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function signIn(
  page: Page,
  email = "active.student@example.test",
  next = "/dashboard"
) {
  await page.goto(`/auth/sign-in?next=${encodeURIComponent(next)}`);
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill("IndustrialLearn1!");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`${next}$`));
  await expect(page.locator(".shell-profile")).toBeVisible();
}

test("reference geometry, honest content and decoded artwork at 1536", async ({
  page
}, info) => {
  await page.setViewportSize({ width: 1536, height: 1024 });
  await signIn(page);
  await page.getByLabel("Appearance").selectOption("light");
  await expect(page.locator("#continue-learning")).toHaveCSS("transform", "none");
  const sidebar = (await page.locator(".app-sidebar").boundingBox())!;
  const header = (await page.locator(".app-topbar").boundingBox())!;
  const hero = (await page.locator("#continue-learning").boundingBox())!;
  const rail = (await page
    .getByRole("complementary", { name: "Study snapshot" })
    .boundingBox())!;
  expect(sidebar.width).toBe(256);
  expect(header.x).toBe(256);
  expect(header.height).toBeLessThanOrEqual(80);
  expect(hero.x).toBe(296);
  expect(hero.width).toBe(880);
  expect(hero.y).toBeGreaterThanOrEqual(145);
  expect(hero.y).toBeLessThanOrEqual(170);
  expect(hero.height).toBeLessThanOrEqual(300);
  expect(rail.width).toBe(296);
  expect(rail.x - hero.x - hero.width).toBe(28);
  const banner = page.getByRole("region", { name: "Future Engineering Awaits" });
  expect((await banner.boundingBox())!.y).toBeLessThan(1024);
  await expect(page.locator("#current-learning > div ol > li")).toHaveCount(4);
  for (const link of await page.locator("#current-learning h3 a").all()) {
    expect(await link.getAttribute("href")).toMatch(
      /^\/lessons\/basic-fluid-pressure(?:#|$)/
    );
  }
  await expect(
    page.getByRole("link", { name: /AI Mentor|Achievements|Centrifugal Pump/ })
  ).toHaveCount(0);
  for (const image of await page.locator("main img").all()) {
    await image.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        image.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)
      )
      .toBe(true);
  }
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({ path: info.outputPath("service-data-light-1536.png") });
  await page.getByLabel("Appearance").selectOption("dark");
  await page.screenshot({ path: info.outputPath("service-data-dark-1536.png") });
});

test("sidebar collapses persistently and routes share one frame", async ({ page }) => {
  await page.setViewportSize({ width: 1536, height: 800 });
  await signIn(page);
  await page.getByRole("button", { name: "Collapse sidebar", exact: true }).click();
  await expect(page.locator(".app-sidebar")).toHaveAttribute("data-collapsed", "true");
  expect((await page.locator(".app-sidebar").boundingBox())!.width).toBe(80);
  const nav = page.getByRole("navigation", { name: "Primary navigation", exact: true });
  await nav.getByRole("link", { name: "My Learning", exact: true }).click();
  await expect(page).toHaveURL(/\/learn$/);
  await expect(
    nav.getByRole("link", { name: "My Learning", exact: true })
  ).toHaveAttribute("aria-current", "page");
  await page.reload();
  await expect(page.locator(".app-sidebar")).toHaveAttribute("data-collapsed", "true");
  await expect(page.locator(".app-sidebar")).toHaveCount(1);
  await expect(page.locator(".app-topbar")).toHaveCount(1);
  await page.getByRole("button", { name: "Expand sidebar" }).click();
  expect((await page.locator(".app-sidebar").boundingBox())!.width).toBe(256);
});

test("mobile drawer traps focus, exits with Escape and preserves direct links", async ({
  page
}) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await signIn(page);
  const menu = page.getByRole("button", { name: "Open navigation" });
  await menu.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Industrial Learn", exact: true });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Close navigation" })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
  await page.keyboard.press("Escape");
  await expect(menu).toBeFocused();
  await menu.click();
  await dialog.getByRole("link", { name: "Saved", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard#saved$/);
  await expect(dialog).not.toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Saved content", exact: true })
  ).toBeInViewport();
});

test("responsive frame and dashboard in both themes with larger text", async ({
  page
}, info) => {
  test.setTimeout(120000);
  await signIn(page);
  for (const width of [320, 375, 430, 768, 1024, 1280, 1536]) {
    await page.setViewportSize({ width, height: width === 1536 ? 650 : 900 });
    for (const theme of ["light", "dark"]) {
      await page.getByLabel("Appearance").selectOption(theme);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
      ).toBeLessThanOrEqual(1);
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
            .analyze()
        ).violations
      ).toEqual([]);
      await page.screenshot({
        path: info.outputPath(`dashboard-${width}-${theme}.png`),
        fullPage: true
      });
    }
  }
  await page.addStyleTag({ content: "html { font-size: 200% !important }" });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
  ).toBeLessThanOrEqual(1);
});

test("ordinary and privileged routes preserve the shared frame and access boundaries", async ({
  page
}, info) => {
  test.setTimeout(120000);
  await page.setViewportSize({ width: 1280, height: 900 });
  await signIn(page, "owner@example.test", "/workspace");
  for (const path of [
    "/",
    "/learn",
    "/learn/core-engineering",
    "/learn/future-engineering",
    "/lessons/basic-fluid-pressure",
    "/simulations",
    "/assessments",
    "/projects",
    "/account/access",
    "/author",
    "/review",
    "/owner"
  ]) {
    await page.goto(path);
    if (path === "/lessons/basic-fluid-pressure") {
      const title = page.getByRole("heading", { name: "Normal force over contact area" });
      expect((await title.boundingBox())!.height).toBeLessThan(60);
    }
    for (const theme of ["light", "dark"]) {
      await page.getByLabel("Appearance").selectOption(theme);
      await expect(page.locator(".app-topbar")).toHaveCount(1);
      await expect(page.locator(".app-sidebar")).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
      ).toBeLessThanOrEqual(1);
      await page.screenshot({
        path: info.outputPath(`${path.replaceAll("/", "-") || "home"}-${theme}.png`)
      });
    }
  }
  await page.goto("/review/basic-fluid-pressure");
  await expect(page.getByRole("radio", { name: "Approve", exact: true })).toHaveCount(0);
  await page.context().clearCookies();
  await page.goto("/auth/sign-in");
  await expect(page.locator(".shell-profile")).toHaveCount(0);
  await expect(
    page
      .getByRole("navigation", { name: "Primary navigation", exact: true })
      .getByRole("link", { name: /Owner|Reviewer|Saved|Dashboard/ })
  ).toHaveCount(0);
});
