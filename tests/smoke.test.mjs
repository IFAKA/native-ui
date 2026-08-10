import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("foundation declares the complete layout vocabulary", async () => {
  const css = await readFile(new URL("../src/layouts.css", import.meta.url), "utf8");
  for (const name of ["nui-container", "nui-readable", "nui-stack", "nui-cluster", "nui-grid"]) {
    assert.match(css, new RegExp(`\\.${name}\\b`));
  }
});

test("behavior foundation has no styling-class injection", async () => {
  const source = await readFile(new URL("../src/behavior/index.js", import.meta.url), "utf8");
  assert.doesNotMatch(source, /classList\.(?:add|remove|toggle)/);
});
