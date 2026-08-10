import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const root = new URL("../", import.meta.url);

test("research sources are pinned and provenance records are complete", async () => {
  const { sources, adapters } = await import("../research/index.mjs");

  assert.deepEqual(sources.map(({ project }) => project), ["Basecoat", "shadcn-html", "Starting Point UI"]);
  for (const source of sources) {
    assert.match(source.repository, /^https:\/\/github\.com\//);
    assert.match(source.revision, /^[0-9a-f]{40}$/);
    assert.ok(source.license);
    assert.ok(source.checked);
    assert.ok(source.files.length > 0);
  }
  assert.deepEqual(Object.keys(adapters).sort(), ["basecoat", "shadcnHtml", "startingPointUi"]);
});

test("adapters produce deterministic research candidates without production contracts", async () => {
  const { collectResearch, serializeResearch } = await import("../research/index.mjs");
  const first = await collectResearch({ root: new URL("../", import.meta.url) });
  const second = await collectResearch({ root: new URL("../", import.meta.url) });

  assert.equal(serializeResearch(first), serializeResearch(second));
  assert.ok(first.candidates.length >= 3);
  assert.ok(first.warnings.some((warning) => /manual manifest mapping/i.test(warning)));
  assert.ok(first.candidates.every(({ production }) => production === false));
  assert.ok(first.candidates.every(({ manifestMapping }) => manifestMapping === null));
  assert.ok(first.candidates.every(({ source }) => source.revision.length === 40));
});

test("research fixtures are isolated from shipped source and use stripped markup", async () => {
  const { collectResearch } = await import("../research/index.mjs");
  const report = await collectResearch({ root: new URL("../", import.meta.url) });
  const shipped = await readFile(new URL("../src/index.css", import.meta.url), "utf8");

  assert.ok(report.candidates.every(({ outputPath }) => outputPath.startsWith("research/")));
  assert.ok(report.candidates.every(({ markup }) => !/@tailwind|@apply|<script|import\s+/.test(markup)));
  assert.doesNotMatch(shipped, /Basecoat|shadcn-html|Starting Point UI/);
});
