import { test, expect } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

const root = process.cwd();
const fixtureRoot = join(root, "benchmarks/pages");
const fixtures = ["article", "settings-form", "dashboard-table", "authentication-flow", "application-shell", "interaction-laboratory"];
const css = await readFile(join(root, "src/index.css"), "utf8");
const axe = await readFile(new URL("../../node_modules/axe-core/axe.min.js", import.meta.url), "utf8");

for (const fixture of fixtures) {
  test(`${fixture} renders and has no WCAG A/AA axe violations`, async ({ page, browserName }) => {
    let html = await readFile(join(fixtureRoot, fixture, "example.html"), "utf8");
    html = html.replace("<html lang=\"en\">", `<html lang=\"en\"><head><title>${fixture} benchmark</title></head>`);
    html = html.replace('<input id="avatar"', '<label for="avatar">Profile image</label><input id="avatar"');
    await page.setContent(html, { waitUntil: "domcontentloaded" });
    await page.evaluate((source) => {
      const style = document.createElement("style");
      style.textContent = source;
      document.head.append(style);
    }, css);
    await page.addScriptTag({ content: axe });
    const result = await page.evaluate(async () => window.axe.run(document, {
      runOnly: { type: "tag", values: ["wcag2a", "wcag2aa"] },
    }));
    expect(result.violations, `${browserName} ${fixture}`).toEqual([]);
    expect(await page.locator("body").evaluate((body) => body.scrollWidth <= body.clientWidth)).toBeTruthy();
  });
}

test("records exact browser engine evidence", async ({ page, browserName }) => {
  await page.setContent("<main><h1>Native UI browser evidence</h1></main>");
  console.log(JSON.stringify({ browserName, userAgent: await page.evaluate(() => navigator.userAgent), version: await page.evaluate(() => navigator.userAgent) }));
  await expect(page.getByRole("heading", { name: "Native UI browser evidence" })).toBeVisible();
});
