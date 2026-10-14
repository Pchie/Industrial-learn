import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const routes = [
  { path: "/" },
  { path: "/learn" },
  { path: "/learn/pilot" },
  { path: "/learn/core-engineering" },
  { path: "/learn/future-engineering" },
  { path: "/programmes/mechanical-foundations" },
  { path: "/programmes/mechanical-foundations/year/1" },
  { path: "/lessons/basic-fluid-pressure" },
  { path: "/simulations" },
  { path: "/auth/sign-in" },
  { path: "/auth/sign-up" },
  { path: "/auth/forgot-password" },
  { path: "/auth/verify" },
  { path: "/auth/error" },
  { path: "/auth/sign-out" },
  { path: "/page-not-present" },
  { path: "/my-learning", user: "student" },
  { path: "/projects", user: "student" },
  { path: "/assessments", user: "student" },
  { path: "/assessments/basic-fluid-pressure-check", user: "student" },
  { path: "/simulations/history", user: "student" },
  { path: "/workspace", user: "owner" },
  { path: "/account/access", user: "owner" },
  { path: "/owner", user: "owner" },
  { path: "/admin", user: "owner" },
  { path: "/admin/users", user: "owner" },
  { path: "/author", user: "author" },
  { path: "/review", user: "reviewer" },
  { path: "/review/basic-fluid-pressure", user: "reviewer" },
  { path: "/lecturer", user: "lecturer" }
];

async function signIn(page: Page, user: string, path: string) {
  await page.goto(`/auth/sign-in?next=${encodeURIComponent(path)}`);
  await page.getByLabel("Email address").fill(`${user}@example.test`);
  await page.getByLabel("Password", { exact: true }).fill("IndustrialLearn1!");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(path);
  await expect(page.locator(".shell-profile")).toBeVisible();
}

for (const route of routes) {
  test(`website design: ${route.path}`, async ({ page }, info) => {
    test.setTimeout(90000);
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    if (route.user) await signIn(page, route.user, route.path);
    else await page.goto(route.path);
    await expect(page.locator("main h1").first()).toBeVisible();
    await expect(page.locator(".app-topbar")).toHaveCount(1);
    await expect(page.locator("main")).toHaveCount(1);
    await expect(page.locator("html")).toHaveAttribute("data-scroll-behavior", "smooth");

    for (const [width, theme] of [
      [1536, "light"],
      [390, "dark"]
    ] as const) {
      await page.setViewportSize({ width, height: 1024 });
      await page.getByLabel("Appearance").selectOption(theme);
      await page.evaluate(() => document.fonts.ready);
      // Axe cannot determine contrast over artwork; preserve the banner's white copy.
      for (const copy of await page
        .locator("main [data-artwork] h1, main [data-artwork] h2, main [data-artwork] p")
        .all()) {
        await expect(copy).toHaveCSS("color", "rgb(255, 255, 255)");
      }
      for (const eyebrow of await page
        .locator("main [data-artwork] p:first-child")
        .all()) {
        await expect(eyebrow).toHaveCSS("font-size", "11px");
      }
      for (const links of await page.locator(".auth-links").all()) {
        await expect(links).toHaveCSS("align-items", "center");
      }
      for (const image of await page.locator("main img:visible").all()) {
        await image.scrollIntoViewIfNeeded();
        await expect
          .poll(() =>
            image.evaluate(
              (element: HTMLImageElement) => element.complete && element.naturalWidth > 0
            )
          )
          .toBe(true);
      }
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
      ).toBeLessThanOrEqual(1);
      // Check hidden overflow too: clipping the page is not a responsive fix.
      const clipped = await page.locator("main").evaluate((main) =>
        Array.from(
          main.querySelectorAll("input:not([type=hidden]), select, button, h1, h2, h3")
        )
          .filter((element) => {
            const rect = element.getBoundingClientRect();
            return (
              rect.width > 0 &&
              rect.height > 0 &&
              (rect.right > innerWidth + 1 || rect.left < -1)
            );
          })
          .map(
            (element) =>
              element.tagName +
              ": " +
              (element.getAttribute("aria-label") ?? element.textContent ?? "").slice(
                0,
                80
              )
          )
      );
      expect(clipped).toEqual([]);
      const scan = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(scan.violations).toEqual([]);
      await page.evaluate(() => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        scrollTo({ top: 0, behavior: "instant" });
      });
      await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
      await page.screenshot({
        path: info.outputPath(`${width}-${theme}.png`),
        fullPage: true
      });
    }
    expect(errors).toEqual([]);
  });
}

test("management and learning shortcuts reach real destinations", async ({ page }) => {
  await signIn(page, "owner", "/owner");
  await expect(
    page.getByRole("link", { name: "System status", exact: true })
  ).toHaveAttribute("href", "/api/health/ready");
  await page.goto("/simulations");
  const studentActivity = page.getByRole("complementary", {
    name: "Student simulation activity"
  });
  await expect(
    studentActivity.getByRole("link", { name: "My workspace" })
  ).toHaveAttribute("href", "/workspace");
  await expect(studentActivity.getByRole("link", { name: "Sign in" })).toHaveCount(0);
  await page.goto("/account/access");
  for (const link of await page.locator(".workspace-link-list a").all()) {
    expect(await link.getAttribute("href")).toMatch(
      /^\/(dashboard|author|review|lecturer|owner|admin)$/
    );
  }
  await page.goto("/admin/users");
  const sections = page.getByRole("navigation", { name: "Management sections" });
  for (const link of await sections.getByRole("link").all()) {
    const href = (await link.getAttribute("href"))!;
    await expect(page.locator(href)).toHaveCount(1);
  }
});

test("lesson experience stays visual-first and does not load decorative headers", async ({
  page
}) => {
  await page.goto("/lessons/basic-fluid-pressure");
  await expect(page.locator("main [data-artwork]")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Normal force over contact area" })
  ).toBeVisible();
});

test("mobile discipline selection stays in sync with desktop controls", async ({
  page
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/simulations");
  await page
    .getByRole("combobox", { name: "Discipline", exact: true })
    .selectOption("Thermodynamics");
  await expect(
    page.getByRole("combobox", { name: "Discipline", exact: true })
  ).toHaveValue("Thermodynamics");
  await expect(page.getByText("Reviewed simulations are being prepared.")).toBeVisible();
  await page.setViewportSize({ width: 1536, height: 1024 });
  await expect(
    page
      .getByRole("navigation", { name: "Simulation disciplines" })
      .getByRole("button", { name: /Thermodynamics/ })
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByLabel("Simulation catalogue")).toHaveCount(0);
});
