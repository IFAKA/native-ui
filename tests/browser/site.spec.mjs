import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";

const axe = await readFile(new URL("../../node_modules/axe-core/axe.min.js", import.meta.url), "utf8");
const routes = ["/", "/lab/", "/examples/", "/recipes/", "/guides/", "/benchmarks/"];

test.describe("public site", () => {
  for (const route of routes) {
    test(`${route} is readable and accessible`, async ({ page }) => {
      await page.goto(route);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("a[href='#main']")).toHaveText("Skip to content");
      await page.addScriptTag({ content: axe });
      const result = await page.evaluate(() => window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] } }));
      expect(result.violations, route).toEqual([]);
      expect(await page.locator("body").evaluate((body) => body.scrollWidth <= body.clientWidth)).toBeTruthy();
    });
  }

  test("native interactions work without custom widgets", async ({ page }) => {
    await page.goto("/lab/");
    await page.locator("summary").first().click();
    await expect(page.locator("summary").first()).toBeVisible();
    await expect(page.locator("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator("dialog")).not.toBeVisible();
  });

  test("narrow viewport and reduced motion preserve the page", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/examples/");
    await expect(page.getByRole("heading", { name: "One vocabulary, many durable states." })).toBeVisible();
    expect(await page.locator("body").evaluate((body) => body.scrollWidth <= body.clientWidth)).toBeTruthy();
  });
});
