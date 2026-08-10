import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);

async function readJson(path) {
  return JSON.parse(await readFile(new URL(path, root), "utf8"));
}

test("manifest describes the complete executable public contract", async () => {
  const manifest = await readJson("src/manifest.json");

  assert.deepEqual(manifest.exports, [".", "./behavior.js", "./manifest.json"]);
  assert.deepEqual(manifest.tokens, [
    "--nui-font-sans",
    "--nui-font-mono",
    "--nui-text-sm",
    "--nui-text-base",
    "--nui-leading-body",
    "--nui-leading-heading",
    "--nui-readable",
    "--nui-space-1",
    "--nui-space-2",
    "--nui-space-3",
    "--nui-space-4",
    "--nui-space-6",
    "--nui-space-8",
    "--nui-control-size",
    "--nui-control-padding",
    "--nui-radius-sm",
    "--nui-radius",
    "--nui-radius-lg",
    "--nui-border-width",
    "--nui-border-color",
    "--nui-surface",
    "--nui-surface-raised",
    "--nui-surface-sunken",
    "--nui-foreground",
    "--nui-foreground-muted",
    "--nui-foreground-link",
    "--nui-accent",
    "--nui-accent-contrast",
    "--nui-danger",
    "--nui-danger-contrast",
    "--nui-shadow-sm",
    "--nui-shadow",
    "--nui-ease-out",
    "--nui-duration-fast",
    "--nui-duration-normal",
  ]);
  assert.deepEqual(manifest.compositions, ["card", "badge", "alert", "toolbar", "empty-state", "field-actions", "table-overflow", "dialog-sections", "popover-surface", "responsive-navigation"]);
  assert.deepEqual(manifest.analyzerRules, ["labels-required", "image-alt", "native-control", "interactive-name", "aria-misuse", "responsive-overflow", "readable-width", "touch-target", "ambiguous-composition", "unnecessary-class", "suspicious-javascript"]);
  assert.equal(manifest.recipes.length, 30);
  assert.deepEqual(manifest.behaviors, []);
  assert.deepEqual(manifest.inference, {
    version: 1,
    mode: "recommendation-only",
    output: "explainable",
    sourceMutation: false,
    runtime: false,
    capabilities: ["nui-readable", "nui-grid", "field-actions", "toolbar", "table-overflow"],
  });
  assert.equal(manifest.capabilities.length, 16);

  const required = [
    "id",
    "category",
    "nativePrimitive",
    "selector",
    "declaration",
    "cssRequirement",
    "jsRequirement",
    "fallback",
    "responsiveBehavior",
    "keyboardFocusContract",
    "statesEvents",
    "authorOverrides",
    "analyzerRules",
    "compatibilityEvidence",
    "recipePath",
  ];

  for (const capability of manifest.capabilities) {
    for (const field of required) assert.ok(field in capability, `${capability.id} missing ${field}`);
  }
});

test("manifest schema declares every public contract section", async () => {
  const schema = await readJson("src/manifest.schema.json");
  for (const property of [
    "exports",
    "tokens",
    "layouts",
    "variants",
    "compositions",
    "behaviors",
    "inference",
    "analyzerRules",
    "recipes",
    "capabilities",
  ]) {
    assert.ok(property in schema.properties, `schema missing ${property}`);
  }
});

test("CLI exposes deterministic inference in text and JSON formats", async () => {
  const { execFile } = await import("node:child_process");
  const { promisify } = await import("node:util");
  const run = promisify(execFile);
  const fixture = "benchmarks/pages/settings-form/example.html";
  const text = await run(process.execPath, ["src/cli.mjs", "infer", fixture], { cwd: fileURLToPath(root) });
  assert.match(text.stdout, /field-actions/);
  const json = await run(process.execPath, ["src/cli.mjs", "infer", fixture, "--format=json"], { cwd: fileURLToPath(root) });
  assert.equal(JSON.parse(json.stdout).recommendation, "field-actions");
});

test("public API audit produces a deterministic human-readable report", async () => {
  const { auditPublicApi } = await import("../scripts/audit-public-api.mjs");
  const result = await auditPublicApi({ root: fileURLToPath(root) });

  assert.deepEqual(result.errors, []);
  assert.match(result.report, /Native UI public surface/);
  assert.match(result.report, /--nui-accent/);
  assert.match(result.report, /\.nui-grid/);
  assert.match(result.report, /\.card/);
  assert.match(result.report, /data-variant/);
  assert.deepEqual(result.report, (await import("../scripts/audit-public-api.mjs")).formatReport(result.surface));
  await access(new URL("../dist/public-surface.txt", import.meta.url));
});

test("public API audit rejects undocumented symbols and invalid references", async () => {
  const { auditPublicApi } = await import("../scripts/audit-public-api.mjs");
  const manifest = await readJson("src/manifest.json");
  const result = await auditPublicApi({
    root: fileURLToPath(root),
    manifest: {
      ...manifest,
      layouts: manifest.layouts.slice(0, -1),
      compositions: [],
      capabilities: manifest.capabilities.map((item) => ({ ...item, id: ["layout-grid", "composition-card"].includes(item.id) ? "duplicate" : item.id })),
    },
  });

  assert.match(result.errors.join("\n"), /undocumented.*nui-grid|undocumented.*card|duplicate capability ID/i);
});
