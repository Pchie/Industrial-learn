import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

async function login(page: Page, email: string) {
  await page.goto("/auth/sign-in?next=%2Finternal%2Freference-dashboard");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password", { exact: true }).fill("IndustrialLearn1!");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
}
test("reference preview requires authorisation and stays separate from student data", async ({
  page
}) => {
  await page.goto("/internal/reference-dashboard");
  await expect(page).toHaveURL(/\/auth\/sign-in/);
  await login(page, "student@example.test");
  await expect(page).toHaveURL(/access_denied/);
  await expect(
    page.getByText("Centrifugal Pump Fundamentals", { exact: true })
  ).toHaveCount(0);
  await page.context().clearCookies();
  await login(page, "owner@example.test");
  await expect(page).toHaveURL(/\/internal\/reference-dashboard$/);
  await expect(
    page.getByText("Design preview · Fictional data", { exact: true })
  ).toBeVisible();
  const action = page.getByRole("button", { name: "Continue Lesson", exact: true });
  await action.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog", { name: "Design preview action" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(action).toBeFocused();
  await page.keyboard.press("Control+k");
  await expect(
    page.getByRole("searchbox", { name: "Search published lessons" })
  ).toBeFocused();
  await page.goto("/dashboard");
  await expect(
    page.getByText("Design preview · Fictional data", { exact: true })
  ).toHaveCount(0);
  await expect(
    page.getByText("Centrifugal Pump Fundamentals", { exact: true })
  ).toHaveCount(0);
});
test("reference composition has decoded visuals, keyboard actions and responsive contrast", async ({
  page
}, info) => {
  test.setTimeout(120000);
  await login(page, "owner@example.test");
  await expect(page).toHaveURL(/\/internal\/reference-dashboard$/);
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [1536, 1024, 768, 375, 320]) {
    await page.setViewportSize({ width, height: 1024 });
    for (const theme of ["light", "dark"]) {
      await page.getByLabel("Appearance").selectOption(theme);
      for (const image of await page.locator("main img").all()) {
        await image.scrollIntoViewIfNeeded();
        await expect
          .poll(() =>
            image.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)
          )
          .toBe(true);
      }
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
      await page.evaluate(() => scrollTo(0, 0));
      if (width < 1100) {
        const notice = (await page.locator("#reference-demo-notice").boundingBox())!;
        const welcome = (await page.getByRole("heading", { level: 1 }).boundingBox())!;
        expect(notice.y + notice.height).toBeLessThanOrEqual(welcome.y);
      }
      await page.screenshot({
        path: info.outputPath(`reference-${width}-${theme}.png`),
        fullPage: width < 1000
      });
      if (width === 1536) {
        const hero = (await page.locator("#continue-learning").boundingBox())!;
        expect(hero.x).toBe(296);
        expect(hero.y).toBeGreaterThanOrEqual(145);
        expect(hero.y).toBeLessThanOrEqual(160);
        expect(hero.width).toBe(880);
        expect(hero.height).toBe(290);
        expect(
          (await page
            .getByRole("region", { name: "Future Engineering Awaits" })
            .boundingBox())!.y
        ).toBeLessThan(930);
      }
    }
  }
});

test("preview disclosure never covers a short or collapsed sidebar", async ({
  page
}, info) => {
  await page.setViewportSize({ width: 1536, height: 650 });
  await login(page, "owner@example.test");
  await expect(page).toHaveURL(/\/internal\/reference-dashboard$/);
  const notice = page.locator("#reference-demo-notice");
  // The URL changes before the streamed preview applies its sidebar spacing.
  await expect(notice).toBeVisible();
  const scrollArea = (await page.locator(".sidebar-scroll").boundingBox())!;
  const disclosure = (await notice.boundingBox())!;
  await page.screenshot({ path: info.outputPath("short-sidebar.png") });
  expect(scrollArea.y + scrollArea.height).toBeLessThanOrEqual(disclosure.y);
  await page.locator(".sidebar-collapse").click();
  await expect(page.locator(".app-sidebar")).toHaveAttribute("data-collapsed", "true");
  const collapsedNotice = (await notice.boundingBox())!;
  const welcome = (await page.getByRole("heading", { level: 1 }).boundingBox())!;
  expect(collapsedNotice.y + collapsedNotice.height).toBeLessThanOrEqual(welcome.y);
  expect(collapsedNotice.x).toBeGreaterThanOrEqual(80);
  await page.screenshot({ path: info.outputPath("collapsed-sidebar.png") });
});
