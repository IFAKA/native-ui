import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const compositions = [
  "card", "badge", "alert", "toolbar", "empty-state", "field-actions",
  "table-overflow", "dialog-sections", "popover-surface", "responsive-navigation",
];

test("Task 7 exposes the curated composition vocabulary", async () => {
  const manifest = JSON.parse(await readFile(new URL("../src/manifest.json", import.meta.url), "utf8"));
  assert.deepEqual(manifest.compositions, compositions);
  assert.equal(manifest.recipes.length, compositions.length * 3);
  for (const name of compositions) {
    const recipe = `recipes/${name}`;
    for (const file of ["metadata.json", "snippet.html", "example.html"]) {
      await access(new URL(`../${recipe}/${file}`, import.meta.url));
    }
  }
});

test("every composition has a documented capability and recipe guidance", async () => {
  const manifest = JSON.parse(await readFile(new URL("../src/manifest.json", import.meta.url), "utf8"));
  for (const name of compositions) {
    const capability = manifest.capabilities.find(({ id }) => id === `composition-${name}`);
    assert.ok(capability, `${name} capability missing`);
    assert.equal(capability.recipePath, `recipes/${name}/metadata.json`);
    assert.ok(Array.isArray(capability.authorOverrides));
    const metadata = JSON.parse(await readFile(new URL(`../recipes/${name}/metadata.json`, import.meta.url), "utf8"));
    assert.equal(metadata.name, name);
    assert.ok(metadata.whenNotToUse);
    assert.ok(metadata.nativeAlternative);
  }
});

test("composition CSS is intrinsic, overrideable, and free of behavior injection", async () => {
  const css = await readFile(new URL("../src/compositions.css", import.meta.url), "utf8");
  const selectors = { "dialog-sections": "dialog", "popover-surface": "\\[popover\\]" };
  for (const name of compositions) assert.match(css, new RegExp(selectors[name] ?? `\\.${name}`));
  assert.match(css, /overflow[-\w]*\s*:/);
  assert.match(css, /min-inline-size\s*:\s*0/);
  assert.match(css, /@media\s*\(prefers-reduced-motion: reduce\)/);
  assert.doesNotMatch(css, /display\s*:\s*none/);
});
