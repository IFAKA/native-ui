import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("browser token specimen has light/dark and user-preference contracts", async () => {
  const css = await readFile(new URL("../../src/tokens.css", import.meta.url), "utf8");
  assert.match(css, /:root\s*\{/);
  assert.match(css, /color-scheme:\s*light\s+dark/);
  assert.match(css, /@media\s*\(forced-colors:\s*active\)/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
});
