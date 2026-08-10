import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";

const manifest = JSON.parse(await readFile(new URL("../dist/manifest.json", import.meta.url), "utf8"));
const css = await readFile(new URL("../dist/native-ui.css", import.meta.url));
const behavior = await readFile(new URL("../dist/behavior.js", import.meta.url));

assert.deepEqual(manifest.layouts, [
  "nui-container",
  "nui-readable",
  "nui-stack",
  "nui-cluster",
  "nui-grid",
]);
assert.deepEqual(manifest.variants, ["primary", "danger", "quiet"]);
assert.ok(gzipSync(css).byteLength + gzipSync(behavior).byteLength <= 12_288);
console.log("contract and size checks passed");
