import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

test("layout browser contract covers narrow, wide, and resilient content cases", async () => {
  const css = await readFile(new URL("../../src/layouts.css", import.meta.url), "utf8");

  assert.match(css, /min\(100%\s*-\s*2rem/);
  assert.match(css, /minmax\(min\(100%,\s*16rem\),\s*1fr\)/);
  assert.match(css, /overflow-wrap:\s*anywhere/);
  assert.doesNotMatch(css, /white-space:\s*nowrap/);
  assert.doesNotMatch(css, /overflow:\s*hidden/);
});
