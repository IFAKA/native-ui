import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const site = resolve(root, "site");

test("documentation site contains the thesis and installation path", async () => {
  const html = await readFile(resolve(site, "index.html"), "utf8");

  assert.match(html, /Give agents a smaller UI vocabulary\./);
  assert.match(html, /@ifaka\/native-ui/);
  assert.match(html, /<details[ >]/);
  assert.match(html, /<form[ >]/);
  assert.match(html, /data-variant="primary"/);
  assert.match(html, /JavaScript disabled/i);
});

test("documentation examples expose the complete public vocabulary", async () => {
  const [manifest, html] = await Promise.all([
    readFile(resolve(root, "src/manifest.json"), "utf8").then(JSON.parse),
    readFile(resolve(site, "examples/index.html"), "utf8"),
  ]);
  const discovery = `${html}\n${manifest.recipes.join(" ")}`;
  const vocabulary = [...manifest.layouts, ...manifest.compositions, ...manifest.variants];

  for (const name of vocabulary) {
    const marker = name === "primary" || name === "danger" || name === "quiet"
      ? `data-variant="${name}"`
      : name;
    assert.match(discovery, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `${name} is missing from docs`);
  }
});

test("examples page visually demonstrates every public layout, composition, and variant", async () => {
  const [manifest, html] = await Promise.all([
    readFile(resolve(root, "src/manifest.json"), "utf8").then(JSON.parse),
    readFile(resolve(site, "examples/index.html"), "utf8"),
  ]);

  for (const name of manifest.layouts) {
    assert.match(html, new RegExp(`nui-site-layout-specimen[\\s\\S]*?<h2>${name.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\\\$&")}</h2>`), `${name} lacks a visible layout specimen`);
  }
  for (const name of manifest.compositions) {
    assert.match(html, new RegExp(`nui-site-composition-specimen[\\s\\S]*?<h2>${name.replaceAll("-", " ")}<\\/h2>[\\s\\S]*?href="\\/recipes\\/${name}\\/"`), `${name} lacks a visible composition specimen`);
  }
  for (const name of manifest.variants) assert.match(html, new RegExp(`button[^>]+data-variant="${name}"`), `${name} lacks a visible variant specimen`);
});

test("documentation includes every required guide and local link targets", async () => {
  const files = await readdir(resolve(site, "guides"));
  const required = ["architecture.html", "browser-support.html", "accessibility.html", "theming.html", "analyzer.html", "migration.html", "governance.html", "security.html", "contributing.html", "index.html"];

  assert.deepEqual(files.sort(), required.sort());

  const pages = await Promise.all([
    readFile(resolve(site, "index.html"), "utf8"),
    ...required.map((file) => readFile(resolve(site, "guides", file), "utf8")),
  ]);
  for (const page of pages) assert.match(page, /href="\/|href="\.\.?\//);
});
