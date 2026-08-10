import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("element specimen covers no-JavaScript semantic growth cases", async () => {
  const css = await readFile(new URL("../../src/elements.css", import.meta.url), "utf8");
  assert.match(css, /@media\s*\(forced-colors:\s*active\)/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /:where\(form/);
  assert.match(css, /:where\(table\)/);
  assert.match(css, /:where\(dialog\)/);
  assert.match(css, /:popover-open/);
  assert.match(css, /overflow-wrap:\s*anywhere/);
});

test("native form controls retain a mobile-safe text size and touch target", async () => {
  const css = await readFile(new URL("../../src/elements.css", import.meta.url), "utf8");
  assert.match(css, /:where\(button, input, select, textarea\)/);
  assert.match(css, /font-size:\s*max\(1rem/);
  assert.match(css, /min-block-size:\s*var\(--nui-control-size\)/);
});
