import AxeBuilder from "@axe-core/playwright";
import { writeFile } from "node:fs/promises";
import { expect, test, type Page } from "@playwright/test";

async function signIn(page: Page, path: string, email = "reviewer@example.test") {
  await page.goto(`/auth/sign-in?next=${encodeURIComponent(path)}`);
  await page.getByLabel("Email address").fill(email);
  await page.getByLabel("Password").fill("IndustrialLearn1!");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(path);
}
const cylinder = "/internal/simulations/hydraulic-cylinder-force";
const bernoulli = "/internal/simulations/bernoulli-flow-lab";

test("default routes avoid the 3D engine and pressure input stays responsive", async ({
  page
}, testInfo) => {
  const loadedRendererUrls: string[] = [];
  page.on("response", async (response) => {
    if (
      !response.url().includes("/_next/static/chunks/") ||
      !response.url().endsWith(".js")
    )
      return;
    try {
      if ((await response.text()).includes("THREE.WebGLRenderer"))
        loadedRendererUrls.push(response.url());
    } catch {
      /* Navigations can cancel unused prefetched assets. */
    }
  });
  for (const route of ["/", "/learn", "/simulations", "/lessons/basic-fluid-pressure"]) {
    await page.goto(route);
    await expect(page.locator("main")).toBeVisible();
  }
  await signIn(page, cylinder);
  const slider = page.getByLabel("Pressure slider", { exact: true });
  await slider.focus();
  const started = Date.now();
  for (let i = 0; i < 10; i++) await page.keyboard.press("ArrowRight");
  await expect(page.getByLabel("Pressure numeric input", { exact: true })).toHaveValue(
    "10"
  );
  const durationMs = Date.now() - started;
  expect(loadedRendererUrls).toEqual([]);
  const data = JSON.stringify(
    {
      interactions: 10,
      durationMs,
      averageAutomationRoundTripMs: durationMs / 10,
      defaultRouteRendererRequests: loadedRendererUrls.length
    },
    null,
    2
  );
  await writeFile(testInfo.outputPath("interaction-metrics.json"), data);
  await testInfo.attach("interaction-metrics", {
    body: data,
    contentType: "application/json"
  });
});

test("appearance persists, follows System, and works with blocked storage", async ({
  page
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  await page.getByLabel("Appearance").selectOption("dark");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const dark = await page
    .locator("html")
    .evaluate((element) => getComputedStyle(element).backgroundColor);
  expect(dark).toBe("rgb(11, 20, 36)");
  await page.goto("/learn");
  await expect(page.getByLabel("Appearance")).toHaveValue("dark");
  await page.reload();
  await expect(page.getByLabel("Appearance")).toHaveValue("dark");
  await page.getByLabel("Appearance").selectOption("system");
  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("html")).toHaveCSS("background-color", dark);
  await page.emulateMedia({ colorScheme: "light" });
  await expect(page.locator("html")).toHaveCSS("background-color", "rgb(245, 248, 255)");
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("Storage blocked for test");
      }
    });
  });
  await page.reload();
  await page.getByLabel("Appearance").selectOption("dark");
  await expect(page.locator("html")).toHaveCSS("background-color", dark);
});

test("hydraulic modes retain inputs and challenge state through browser history", async ({
  page
}) => {
  await signIn(page, cylinder);
  const pressure = page.getByLabel("Pressure numeric input", { exact: true });
  await pressure.fill("10");
  await expect(page.getByLabel("Pressure slider", { exact: true })).toHaveValue("10");
  await page.getByRole("button", { name: "Start load challenge", exact: true }).click();
  const modes = page.getByRole("navigation", { name: "Simulation view" });
  await modes.getByRole("link", { name: "Anatomy", exact: true }).focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(`${cylinder}/anatomy`);
  await expect(pressure).toHaveValue("10");
  await page.getByRole("button", { name: "Seals", exact: true }).click();
  await expect(page.getByRole("button", { name: "Seals", exact: true })).toHaveAttribute(
    "aria-pressed",
    "true"
  );
  await modes.getByRole("link", { name: "Exploded view", exact: true }).click();
  await expect(page.getByLabel("Assembly separation")).toBeVisible();
  await page.goBack();
  await expect(modes.getByRole("link", { name: "Anatomy", exact: true })).toHaveAttribute(
    "aria-current",
    "page"
  );
  await expect(pressure).toHaveValue("10");
  await expect(
    page.getByRole("button", { name: "Check current result", exact: true })
  ).toBeVisible();
  await page.reload();
  await expect(modes.getByRole("link", { name: "Anatomy", exact: true })).toHaveAttribute(
    "aria-current",
    "page"
  );
  await expect(
    page.getByRole("status").filter({ hasText: "Protected inspection preview" })
  ).toBeVisible();
});

test("Bernoulli aerial view shares live pressure measurements without new physics", async ({
  page
}) => {
  await signIn(page, `${bernoulli}/aerialview`);
  await expect(
    page.getByRole("img", { name: /Plan view of the same horizontal pipe/ })
  ).toBeVisible();
  await page.getByRole("button", { name: "Measure P1", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Measure P1", exact: true })
  ).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("Elevation: z1 = z2 = 0 m (shared datum)")).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "Simulation view" }).getByRole("link")
  ).toHaveCount(2);
});

test("unpublished and unsupported view URLs fail closed", async ({ page }) => {
  for (const path of [
    "/simulations/hydraulic-cylinder-force/anatomy",
    "/simulations/hydraulic-cylinder-force/360view",
    "/simulations/bernoulli-flow-lab/aerialview"
  ]) {
    const response = await page.goto(path);
    // Next's inherited loading boundary may start a 200 stream before notFound().
    // Assert final denial and absence of content, not only the transport status.
    expect([200, 404]).toContain(response?.status());
    await expect(
      page.getByRole("heading", {
        name: "This part of Industrial Learn is not available yet"
      })
    ).toBeVisible();
    await expect(
      page.locator('meta[name="robots"][content*="noindex"]').first()
    ).toBeAttached();
    await expect(page.getByTestId("hydraulic-cylinder-visual-lesson")).toHaveCount(0);
    await expect(page.getByTestId("bernoulli-flow-visual-lesson")).toHaveCount(0);
  }
  await signIn(page, cylinder);
  for (const path of [`${cylinder}/aerialview`, `${bernoulli}/360view`]) {
    await page.goto(path);
    await expect(
      page.getByRole("heading", {
        name: "This part of Industrial Learn is not available yet"
      })
    ).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Simulation view" })).toHaveCount(
      0
    );
  }
});

test("student cannot enter inspection previews", async ({ page }) => {
  await signIn(page, "/workspace", "active.student@example.test");
  await page.goto(`${cylinder}/anatomy`);
  await expect(page.getByTestId("hydraulic-cylinder-visual-lesson")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Seals", exact: true })).toHaveCount(0);
});

test("reduced motion disables automatic demonstration but keeps a manual step", async ({
  page
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await signIn(page, `${cylinder}/anatomy`);
  await expect(
    page.getByRole("button", { name: "Demonstrate extension", exact: true })
  ).toBeDisabled();
  await page.getByRole("button", { name: "Step", exact: true }).click();
  await expect(page.getByLabel("Illustrative piston position")).toHaveValue("35");
  await page.getByLabel("Pressure numeric input", { exact: true }).fill("0");
  await expect(page.getByRole("button", { name: "Step", exact: true })).toBeDisabled();
});

for (const width of [320, 375, 430, 1440]) {
  test(`responsive light/dark inspection and keyboard controls at ${width}px`, async ({
    page
  }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 });
    await signIn(page, `${cylinder}/anatomy`);
    for (const theme of ["light", "dark"]) {
      await page.getByLabel("Appearance").selectOption(theme);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
      ).toBeLessThanOrEqual(1);
      const anatomy = page
        .getByRole("navigation", { name: "Simulation view" })
        .getByRole("link", { name: "Anatomy", exact: true });
      await anatomy.focus();
      await expect(anatomy).toBeFocused();
      const fields = page
        .getByRole("complementary", { name: "Simulation controls and context" })
        .locator("input");
      const boxes = await fields.evaluateAll((elements) =>
        elements.map((element) => {
          const r = element.getBoundingClientRect();
          return {
            left: r.left,
            right: r.right,
            top: r.top,
            bottom: r.bottom,
            width: r.width
          };
        })
      );
      for (const box of boxes) {
        expect(box.left).toBeGreaterThanOrEqual(0);
        expect(box.right).toBeLessThanOrEqual(width);
        expect(box.width).toBeGreaterThan(100);
      }
      for (let i = 1; i < boxes.length; i++)
        expect(boxes[i]!.top).toBeGreaterThanOrEqual(boxes[i - 1]!.bottom);
      if (width < 821) {
        const inputBox = await page
          .getByLabel("Pressure slider", { exact: true })
          .boundingBox();
        const measurementBox = await page
          .getByRole("heading", { name: "Measurements", exact: true })
          .boundingBox();
        expect(inputBox!.y).toBeLessThan(measurementBox!.y);
      }
      const scan = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      expect(scan.violations).toEqual([]);
      await page.screenshot({
        path: testInfo.outputPath(`hydraulic-${width}-${theme}.png`),
        fullPage: true
      });
    }
  });
}

test("3D is explicitly loaded, nonblank, rotatable and disposable", async ({
  page
}, testInfo) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await signIn(page, `${cylinder}/360view`);
  await expect(page.locator("canvas")).toHaveCount(0);
  const beforeScripts = await page.evaluate(() =>
    performance
      .getEntriesByType("resource")
      .filter((entry) => entry.name.includes(".js"))
      .map((entry) => entry.name)
  );
  await page.getByRole("button", { name: "Load 3D inspection", exact: true }).click();
  const canvas = page.locator("canvas");
  await expect(canvas).toBeVisible();
  const renderedColourCount = () => {
    (
      document.querySelector('button[aria-label="Rotate right"]') as HTMLButtonElement
    ).click();
    const canvas = document.querySelector("canvas")!;
    const gl = canvas.getContext("webgl2")!;
    const pixels = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4);
    gl.readPixels(
      0,
      0,
      gl.drawingBufferWidth,
      gl.drawingBufferHeight,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      pixels
    );
    const colours = new Set<string>();
    for (let i = 0; i < pixels.length; i += 64)
      colours.add(`${pixels[i]},${pixels[i + 1]},${pixels[i + 2]}`);
    return colours.size;
  };
  const pixels = await page.evaluate(renderedColourCount);
  expect(pixels).toBeGreaterThan(20);
  const first = await canvas.screenshot({
    path: testInfo.outputPath("cylinder-3d-desktop.png")
  });
  await page.getByRole("button", { name: "Rotate right", exact: true }).click();
  expect((await canvas.screenshot()).equals(first)).toBe(false);
  await page.getByRole("button", { name: "Zoom in", exact: true }).click();
  const mobilePixels: Record<number, number> = {};
  for (const width of [320, 375, 430]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(canvas).toBeVisible();
    const box = await canvas.boundingBox();
    expect(box!.width).toBeLessThanOrEqual(width);
    expect(box!.width).toBeGreaterThan(200);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
    ).toBeLessThanOrEqual(1);
    mobilePixels[width] = await page.evaluate(renderedColourCount);
    expect(mobilePixels[width]).toBeGreaterThan(20);
    await canvas.screenshot({ path: testInfo.outputPath(`cylinder-3d-${width}.png`) });
  }
  const addedScripts = await page.evaluate(
    (before) =>
      performance
        .getEntriesByType("resource")
        .filter((entry) => entry.name.includes(".js") && !before.includes(entry.name))
        .map((entry) => ({
          name: entry.name,
          bytes: (entry as PerformanceResourceTiming).decodedBodySize
        })),
    beforeScripts
  );
  expect(addedScripts.length).toBeGreaterThan(0);
  const metrics = JSON.stringify({ pixels, mobilePixels, addedScripts }, null, 2);
  await writeFile(testInfo.outputPath("3d-metrics.json"), metrics);
  await testInfo.attach("3d-progressive-loading", {
    body: metrics,
    contentType: "application/json"
  });
  await page
    .getByRole("navigation", { name: "Simulation view" })
    .getByRole("link", { name: "Standard", exact: true })
    .click();
  await expect(canvas).toHaveCount(0);
});

test("WebGL failure retains a useful accessible cutaway", async ({ page }) => {
  await signIn(page, `${cylinder}/360view`);
  await page.evaluate(() => {
    const descriptor = Object.getOwnPropertyDescriptor(
      HTMLCanvasElement.prototype,
      "getContext"
    );
    const getContext = descriptor?.value as HTMLCanvasElement["getContext"];
    HTMLCanvasElement.prototype.getContext = function (
      ...args: Parameters<typeof getContext>
    ) {
      if (String(args[0]).startsWith("webgl")) return null;
      return getContext.apply(this, args);
    } as typeof getContext;
  });
  await page.getByRole("button", { name: "Load 3D inspection", exact: true }).click();
  await expect(page.getByText("WebGL unavailable", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Piston", exact: true })).toBeVisible();
});

for (const width of [320, 375, 430]) {
  for (const lesson of [
    {
      name: "Bernoulli",
      path: `${bernoulli}/aerialview`,
      image: /Plan view of the same horizontal pipe/
    },
    {
      name: "Basic Pressure",
      path: "/lessons/basic-fluid-pressure",
      image: /Force over area pressure visual/
    }
  ]) {
    test(`${lesson.name} retains readable layouts at ${width}px`, async ({
      page
    }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      await signIn(page, lesson.path);
      const image = page.getByRole("img", { name: lesson.image }).first();
      await expect(image).toBeVisible();
      for (const theme of ["light", "dark"]) {
        await page.getByLabel("Appearance").selectOption(theme);
        const result = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
          .analyze();
        expect(result.violations).toEqual([]);
        expect(
          await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)
        ).toBeLessThanOrEqual(1);
        await page.screenshot({
          path: testInfo.outputPath(`${lesson.name}-${theme}.png`),
          fullPage: true
        });
      }
    });
  }
}
