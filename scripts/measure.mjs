import { brotliCompressSync, gzipSync } from "node:zlib";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { inferLayout } from "../src/analyzer/inference.mjs";

const FIXTURE_IDS = [
  "article",
  "settings-form",
  "dashboard-table",
  "authentication-flow",
  "application-shell",
  "interaction-laboratory",
];

const normalize = (value) => value.replace(/\r\n?/g, "\n");

function countMatches(source, pattern) {
  return [...source.matchAll(pattern)].length;
}

function countClassTokens(html) {
  return [...html.matchAll(/\bclass\s*=\s*["']([^"']*)["']/gi)]
    .flatMap(([, value]) => value.trim().split(/\s+/).filter(Boolean)).length;
}

function countAccessibilityIssues(html) {
  let issues = 0;
  issues += countMatches(html, /<img\b(?![^>]*\balt\s*=)[^>]*>/gi);
  issues += countMatches(html, /<button\b(?![^>]*(?:aria-label|>\s*[^<\s]))[^>]*>\s*<\/button>/gi);
  for (const [, table] of html.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/gi)) {
    if (!/<caption\b/i.test(table)) issues += 1;
  }
  return issues;
}

async function readFixture(root, id) {
  const path = join(root, "benchmarks", "pages", id, "example.html");
  const html = normalize(await readFile(path, "utf8"));
  return {
    id,
    path: relative(root, path).replaceAll("\\", "/"),
    rawBytes: Buffer.byteLength(html),
    domNodes: countMatches(html, /<([a-z][a-z0-9-]*)(?:\s[^>]*)?>/gi),
    authoredClassTokens: countClassTokens(html),
    dataAttributes: countMatches(html, /\sdata-[a-z0-9-]+\s*=/gi),
    accessibilityViolations: countAccessibilityIssues(html),
    testCorrectionsRequired: countAccessibilityIssues(html),
    inference: inferLayout(html),
  };
}

async function measureArtifact(root, path) {
  const content = Buffer.from(normalize(await readFile(join(root, path), "utf8")));
  return {
    path,
    rawBytes: content.byteLength,
    gzipBytes: gzipSync(content).byteLength,
    brotliBytes: brotliCompressSync(content).byteLength,
  };
}

export async function measureProject({ root = fileURLToPath(new URL("../", import.meta.url)) } = {}) {
  const fixtures = [];
  for (const id of FIXTURE_IDS) fixtures.push(await readFixture(root, id));

  const cssFiles = ["tokens.css", "elements.css", "layouts.css", "compositions.css"];
  const css = normalize((await Promise.all(cssFiles.map((file) => readFile(join(root, "src", file), "utf8")))).join("\n"));
  const behavior = normalize(await readFile(join(root, "src", "behavior", "index.js"), "utf8"));
  const artifacts = [
    { path: "src/*.css", content: css },
    { path: "src/behavior/index.js", content: behavior },
  ].map(({ path, content }) => {
    const buffer = Buffer.from(content);
    return {
      path,
      rawBytes: buffer.byteLength,
      gzipBytes: gzipSync(buffer).byteLength,
      brotliBytes: brotliCompressSync(buffer).byteLength,
      content,
    };
  });
  const raw = Buffer.from(artifacts.map(({ content }) => content).join("\n"));
  const summary = {
    rawBytes: raw.byteLength,
    gzipBytes: gzipSync(raw).byteLength,
    brotliBytes: brotliCompressSync(raw).byteLength,
    cssBytes: Buffer.byteLength(css),
    behaviorBytes: Buffer.byteLength(behavior),
    cssAndBehaviorGzipBytes: gzipSync(raw).byteLength,
    authoredClassTokens: fixtures.reduce((sum, fixture) => sum + fixture.authoredClassTokens, 0),
    dataAttributes: fixtures.reduce((sum, fixture) => sum + fixture.dataAttributes, 0),
    customCssDeclarations: countMatches(css, /^\s*(?:--nui-[\w-]+|[a-z-]+)\s*:/gim),
    customJsBytes: Buffer.byteLength(behavior),
    accessibilityViolations: fixtures.reduce((sum, fixture) => sum + fixture.accessibilityViolations, 0),
    testCorrectionsRequired: fixtures.reduce((sum, fixture) => sum + fixture.testCorrectionsRequired, 0),
    inferenceRecommendations: fixtures.filter((fixture) => fixture.inference.recommendation).map((fixture) => ({ id: fixture.id, recommendation: fixture.inference.recommendation, confidence: fixture.inference.confidence })),
  };

  return { schemaVersion: 1, fixtures, artifacts, summary };
}

export function serializeReport(report) {
  const artifacts = report.artifacts.map(({ path, rawBytes, gzipBytes, brotliBytes }) => ({ path, rawBytes, gzipBytes, brotliBytes }));
  return `${JSON.stringify({ ...report, artifacts }, null, 2)}\n`;
}

export function formatMarkdown(report) {
  const { summary } = report;
  const rows = report.fixtures.map((fixture) =>
    `| ${fixture.id} | ${fixture.rawBytes} | ${fixture.domNodes} | ${fixture.authoredClassTokens} | ${fixture.dataAttributes} | ${fixture.accessibilityViolations} |`,
  );
  return normalize(`# Native UI measurement report

Generated from normalized UTF-8 source and benchmark fixtures.

## Summary

| Metric | Value |
| --- | ---: |
| Raw CSS + behavior bytes | ${summary.rawBytes} |
| CSS bytes | ${summary.cssBytes} |
| Behavior bytes | ${summary.behaviorBytes} |
| Gzip CSS + behavior bytes | ${summary.gzipBytes} |
| Brotli CSS + behavior bytes | ${summary.brotliBytes} |
| Authored class tokens | ${summary.authoredClassTokens} |
| Data attributes | ${summary.dataAttributes} |
| Custom CSS declarations | ${summary.customCssDeclarations} |
| Custom JavaScript bytes | ${summary.customJsBytes} |
| Static accessibility violations | ${summary.accessibilityViolations} |
| Test corrections required | ${summary.testCorrectionsRequired} |

## Inference

Recommendation-only structural analysis; no source mutation or runtime layout behavior.

| Fixture | Recommendation | Confidence |
| --- | --- | ---: |
${summary.inferenceRecommendations.map(({ id, recommendation, confidence }) => `| ${id} | ${recommendation} | ${confidence} |`).join("\n") || "| — | none | — |"}

## Fixtures

| Fixture | HTML bytes | DOM nodes | Class tokens | Data attributes | Accessibility violations |
| --- | ---: | ---: | ---: | ---: | ---: |
${rows.join("\n")}
`);
}

export async function writeReports({ root = fileURLToPath(new URL("../", import.meta.url)) } = {}) {
  const report = await measureProject({ root });
  const output = join(root, "benchmarks", "reports");
  await mkdir(output, { recursive: true });
  await writeFile(join(output, "measurement.json"), serializeReport(report));
  await writeFile(join(output, "measurement.md"), formatMarkdown(report));
  return report;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  await writeReports();
}
