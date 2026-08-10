import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);

async function readJson(path) {
  return JSON.parse(await readFile(new URL(path, root), "utf8"));
}

test("governance freezes the public API and runtime budget", async () => {
  const pkg = await readJson("package.json");
  const manifest = await readJson("src/manifest.json");
  const adr = await readFile(new URL("docs/decisions/0001-public-api-and-layering.md", root), "utf8");
  const baseline = await readJson("docs/baselines/2026-08-10.json");

  assert.deepEqual(manifest.layouts, [
    "nui-container",
    "nui-readable",
    "nui-stack",
    "nui-cluster",
    "nui-grid",
  ]);
  assert.deepEqual(manifest.variants, ["primary", "danger", "quiet"]);
  assert.deepEqual(Object.keys(pkg.exports).sort(), [".", "./behavior.js", "./manifest.json"]);
  assert.equal(pkg.dependencies, undefined);
  assert.match(adr, /public API|layering/i);
  assert.equal(baseline.schemaVersion, 1);
  assert.equal(baseline.methodology.runtimeDependencies, "package.json dependencies");
  assert.equal(baseline.methodology.cssAndBehaviorGzipBudgetBytes, 12288);
});

