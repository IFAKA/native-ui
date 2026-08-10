import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));

test("measurement covers the six semantic benchmark fixtures", async () => {
  const { measureProject } = await import("../scripts/measure.mjs");
  const result = await measureProject({ root });

  assert.deepEqual(result.fixtures.map(({ id }) => id), [
    "article",
    "settings-form",
    "dashboard-table",
    "authentication-flow",
    "application-shell",
    "interaction-laboratory",
  ]);
  assert.ok(result.summary.rawBytes > 0);
  assert.ok(result.summary.gzipBytes > 0);
  assert.ok(result.summary.brotliBytes > 0);
  assert.equal(typeof result.summary.authoredClassTokens, "number");
  assert.equal(typeof result.summary.customCssDeclarations, "number");
  assert.equal(typeof result.summary.customJsBytes, "number");
  assert.equal(typeof result.summary.accessibilityViolations, "number");
  assert.equal(typeof result.summary.testCorrectionsRequired, "number");
  assert.ok(result.summary.inferenceRecommendations.length >= 4);
  assert.ok(result.fixtures.every(({ inference }) => inference && typeof inference.confidence === "number"));
});

test("measurement output is deterministic and uses normalized line endings", async () => {
  const { measureProject, formatMarkdown, serializeReport } = await import("../scripts/measure.mjs");
  const first = await measureProject({ root });
  const second = await measureProject({ root });

  assert.equal(serializeReport(first), serializeReport(second));
  assert.doesNotMatch(serializeReport(first), /\r/);
  assert.match(formatMarkdown(first), /^# Native UI measurement report\n/);
});

test("benchmark fixtures include growth and failure cases", async () => {
  const fixtureFiles = [
    "article",
    "settings-form",
    "dashboard-table",
    "authentication-flow",
    "application-shell",
    "interaction-laboratory",
  ];

  for (const fixture of fixtureFiles) {
    const html = await readFile(new URL(`../benchmarks/pages/${fixture}/example.html`, import.meta.url), "utf8");
    for (const marker of ["data-case=\"long-label\"", "data-case=\"empty\"", "data-case=\"loading\"", "data-case=\"error\"", "data-case=\"dense\""]) {
      assert.match(html, new RegExp(marker), `${fixture} missing ${marker}`);
    }
  }
});
