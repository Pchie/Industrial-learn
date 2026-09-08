import AxeBuilder from "@axe-core/playwright";
import { writeFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";

async function signIn(page: Page, email: string) {
  await page.goto("/auth/sign-in?next=%2Fdashboard");
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill("IndustrialLearn1!");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}

for (const width of [320, 375, 430, 768, 1024, 1440]) {
  for (const theme of ["light", "dark"] as const) {
    test(`study workspace at ${width}px in ${theme} for new and returning students`, async ({
      page
    }, testInfo) => {
      test.setTimeout(90000);
      await page.setViewportSize({ width, height: 900 });
      for (const state of ["new", "returning"] as const) {
        await page.context().clearCookies();
        await signIn(
          page,
          state === "new" ? "student@example.test" : "active.student@example.test"
        );
        await page.getByLabel("Appearance").selectOption(theme);
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
        const nextAction = page
          .getByRole("region", { name: "Continue learning", exact: true })
          .getByRole("link", {
            name: state === "new" ? "Start lesson" : "Return to lesson",
            exact: true
          });
        await expect(nextAction).toHaveAttribute("href", "/lessons/basic-fluid-pressure");
        await expect(
          page
            .getByRole("region", { name: "My learning", exact: true })
            .getByText(state === "new" ? "Available" : "Completed", { exact: true })
        ).toBeVisible();
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
        ).toBeLessThanOrEqual(1);
        const mobileMenu = page.getByRole("button", { name: "Open navigation" });
        if (width < 1100) {
          await mobileMenu.focus();
          await page.keyboard.press("Enter");
        }
        const nav = page.getByRole("navigation", {
          name: width < 1100 ? "Mobile navigation" : "Primary navigation",
          exact: true
        });
        await expect(
          nav.getByRole("link", { name: /Author|Reviewer|Owner/ })
        ).toHaveCount(0);
        for (const link of await nav.getByRole("link").all()) {
          expect((await link.boundingBox())!.height).toBeGreaterThanOrEqual(44);
        }
        if (width < 1100) {
          await page.keyboard.press("Escape");
        }
        const axe = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
          .analyze();
        expect(axe.violations).toEqual([]);
        await page.screenshot({
          path: testInfo.outputPath(`${state}-${theme}-${width}-full.png`),
          fullPage: true
        });
        await page.screenshot({
          path: testInfo.outputPath(`${state}-${theme}-${width}-viewport.png`)
        });
        await nextAction.focus();
        await expect(nextAction).toBeFocused();
        await page.keyboard.press("Enter");
        await expect(page).toHaveURL(/\/lessons\/basic-fluid-pressure$/);
        await expect(page.getByLabel("Appearance")).toHaveValue(theme);
        await page.goto("/dashboard");
        await expect(
          page
            .getByRole("region", { name: "My learning", exact: true })
            .getByText(state === "new" ? "Available" : "Completed", { exact: true })
        ).toBeVisible();
      }
    });
  }
}

test("incomplete data remains unavailable rather than zero and provides recovery", async ({
  page
}) => {
  await signIn(page, "incomplete.student@example.test");
  await expect(
    page.getByText("Some study data is unavailable", { exact: true })
  ).toBeVisible();
  await expect(
    page.getByText("Lesson progress is temporarily unavailable.")
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Recent assessment results" })
  ).toContainText("Assessment results are temporarily unavailable.");
  await expect(page.getByText("No recorded lesson completion yet.")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Reload dashboard" })).toBeVisible();
  await expect(page.getByRole("progressbar")).toHaveCount(0);
  const locationNotice = page.getByText(
    "Your saved lesson location could not be loaded.",
    { exact: false }
  );
  await locationNotice.scrollIntoViewIfNeeded();
  expect(
    await locationNotice.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      return element.contains(
        document.elementFromPoint(
          bounds.left + bounds.width / 2,
          bounds.top + bounds.height / 2
        )
      );
    })
  ).toBe(true);
});

test("theme, owner perspective and query strings cannot select another student's records", async ({
  page
}) => {
  await signIn(page, "student.b@example.test");
  await page.goto(
    "/dashboard?studentId=profile-local-active-student-example-test&perspective=student"
  );
  await page.getByLabel("Appearance").selectOption("dark");
  await expect(
    page.getByRole("heading", { name: /Second Industrial Student/, exact: true })
  ).toBeVisible();
  await expect(page.getByText("Active Industrial Student", { exact: true })).toHaveCount(
    0
  );
  await expect(page.getByRole("region", { name: "Saved content" })).toContainText(
    "No saved lessons yet."
  );
  await page.context().clearCookies();
  await signIn(page, "owner@example.test");
  await page.goto(
    "/dashboard?perspective=student&studentId=profile-local-active-student-example-test"
  );
  await expect(page.getByText("Active Industrial Student", { exact: true })).toHaveCount(
    0
  );
  await expect(page.getByRole("heading", { level: 1 })).not.toHaveText(
    "Second Industrial Student"
  );
  await expect(page.getByText(/You remain signed in as Platform Owner/)).toBeVisible();
});

test("an expired session redirects instead of retaining a private dashboard", async ({
  page
}) => {
  await signIn(page, "active.student@example.test");
  await page.context().clearCookies();
  await page.reload();
  await expect(page).toHaveURL(/\/auth\/sign-in/);
  await expect(page.getByText("Active Industrial Student", { exact: true })).toHaveCount(
    0
  );
});

test("dashboard uses lightweight assets and private responses under reduced motion", async ({
  page
}, testInfo) => {
  const rendererRequests: string[] = [];
  const inspections: Promise<void>[] = [];
  page.on("response", (response) => {
    if (
      !response.url().includes("/_next/static/chunks/") ||
      !response.url().endsWith(".js")
    )
      return;
    inspections.push(
      response
        .text()
        .then((body) => {
          if (body.includes("THREE.WebGLRenderer")) rendererRequests.push(response.url());
        })
        .catch(() => {
          /* Navigated-away prefetches may be cancelled. */
        })
    );
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await signIn(page, "active.student@example.test");
  const response = await page.reload();
  await expect(
    page.getByRole("heading", { name: "Continue learning", exact: true })
  ).toBeVisible();
  expect(response?.headers()["cache-control"]).not.toContain("public");
  expect(response?.headers()["cache-control"]).toContain("no-store");
  await expect(page.locator("canvas")).toHaveCount(0);
  const body = await response!.text();
  expect(body).not.toMatch(/"correctAnswer"|"scoring_summary"|"service_role"/);
  await Promise.all(inspections);
  expect(rendererRequests).toEqual([]);
  const metrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType(
      "navigation"
    )[0] as PerformanceNavigationTiming;
    const scripts = performance
      .getEntriesByType("resource")
      .filter(
        (entry) =>
          entry.name.includes("/_next/static/chunks/") && entry.name.endsWith(".js")
      ) as PerformanceResourceTiming[];
    return {
      domContentLoadedMs: navigation.domContentLoadedEventEnd,
      responseBytes: navigation.encodedBodySize,
      scriptRequests: scripts.length,
      encodedScriptBytes: scripts.reduce(
        (total, entry) => total + entry.encodedBodySize,
        0
      )
    };
  });
  await writeFile(
    testInfo.outputPath("dashboard-metrics.json"),
    JSON.stringify(
      {
        ...metrics,
        rendererRequests: rendererRequests.length,
        environment:
          "Local production-mode build; synthetic account; not field Core Web Vitals"
      },
      null,
      2
    )
  );
});
