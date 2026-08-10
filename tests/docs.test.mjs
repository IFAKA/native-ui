import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const site = resolve(root, "site");

test("documentation site contains the thesis and installation path", async () => {
  const html = await readFile(resolve(site, "index.html"), "utf8");

  assert.match(html, /Write HTML\. Get an interface people want to use\./);
  assert.match(html, /@ifaka\/native-ui/);
  assert.match(html, /<details[ >]/);
  assert.match(html, /<form[ >]/);
  assert.match(html, /data-variant="primary"/);
  assert.match(html, /JavaScript disabled/i);
});

test("documentation examples expose the complete public vocabulary", async () => {
  const [manifest, html] = await Promise.all([
    readFile(resolve(root, "src/manifest.json"), "utf8").then(JSON.parse),
    readFile(resolve(site, "index.html"), "utf8"),
  ]);
  const vocabulary = [...manifest.layouts, ...manifest.compositions, ...manifest.variants];

  for (const name of vocabulary) {
    const marker = name === "primary" || name === "danger" || name === "quiet"
      ? `data-variant="${name}"`
      : name;
    assert.match(html, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `${name} is missing from docs`);
  }
});

test("documentation includes every required guide and local link targets", async () => {
  const files = await readdir(resolve(site, "guides"));
  const required = ["architecture.html", "browser-support.html", "accessibility.html", "theming.html", "analyzer.html", "migration.html", "governance.html", "security.html", "contributing.html"];

  assert.deepEqual(files.sort(), required.sort());

  const pages = await Promise.all([
    readFile(resolve(site, "index.html"), "utf8"),
    ...required.map((file) => readFile(resolve(site, "guides", file), "utf8")),
  ]);
  for (const page of pages) assert.match(page, /href="\/native-ui\/|href="\.\.?\//);
});
