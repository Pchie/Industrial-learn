import { expect, test } from "@playwright/test";

test("keeps the review-required hydraulic flagship out of public lesson delivery", async ({
  page
}) => {
  await page.goto("/lessons/hydraulic-cylinder-force");

  await expect(
    page.getByRole("heading", {
      name: "This part of Industrial Learn is not available yet"
    })
  ).toBeVisible();
  await expect(page.getByTestId("hydraulic-cylinder-visual-lesson")).toHaveCount(0);
  await expect(page.getByText("Hydraulic Cylinder Force", { exact: true })).toHaveCount(
    0
  );
  expect(await page.content()).not.toContain("SIM-HYD-CYL-FORCE-001");
});
