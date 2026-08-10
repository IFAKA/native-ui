import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const layoutNames = ["nui-container", "nui-readable", "nui-stack", "nui-cluster", "nui-grid"];

test("adaptive layouts expose exactly the five approved general classes", async () => {
  const css = await readFile(new URL("../src/layouts.css", import.meta.url), "utf8");
  const names = [...css.matchAll(/:where\(\.([a-z0-9-]+)\)/g)].map((match) => match[1]);

  assert.deepEqual(names, layoutNames);
  assert.doesNotMatch(css, /@media\s*\([^)]*(?:width|height|orientation)/i);
});

test("adaptive layouts use intrinsic and logical CSS contracts", async () => {
  const css = await readFile(new URL("../src/layouts.css", import.meta.url), "utf8");

  assert.match(css, /inline-size:\s*min\(/);
  assert.match(css, /margin-inline:\s*auto/);
  assert.match(css, /max-inline-size:\s*var\(--nui-readable\)/);
  assert.match(css, /flex-direction:\s*column/);
  assert.match(css, /flex-wrap:\s*wrap/);
  assert.match(css, /grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(/);
  assert.match(css, /minmax\(min\(100%/);
  assert.match(css, /overflow-wrap:\s*anywhere/);
});

test("layout adaptation is CSS-only and preserves content order", async () => {
  const css = await readFile(new URL("../src/layouts.css", import.meta.url), "utf8");
  const behavior = await readFile(new URL("../src/behavior/index.js", import.meta.url), "utf8");

  assert.doesNotMatch(css, /display:\s*none/);
  assert.doesNotMatch(css, /order\s*:/);
  assert.doesNotMatch(behavior, /(?:ResizeObserver|addEventListener\s*\(\s*["']resize|innerWidth|clientWidth|getBoundingClientRect)/);
});
