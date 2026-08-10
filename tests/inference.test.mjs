import test from "node:test";
import assert from "node:assert/strict";
import { inferLayout } from "../src/analyzer/inference.mjs";

test("infers a readable article from semantic prose", () => {
  const result = inferLayout(`<main><article><h1>Notes</h1><p>${"A long paragraph of readable content. ".repeat(18)}</p></article></main>`);
  assert.equal(result.recommendation, "nui-readable");
  assert.ok(result.confidence >= 0.8);
  assert.ok(result.evidence.some((item) => /article/i.test(item)));
});

test("infers repeated content as an intrinsic grid", () => {
  const result = inferLayout(`<main><section>${[1, 2, 3].map((n) => `<article><h2>Item ${n}</h2><p>Summary</p></article>`).join("")}</section></main>`);
  assert.equal(result.recommendation, "nui-grid");
  assert.ok(result.evidence.some((item) => /repeated/i.test(item)));
});

test("infers native contracts without inventing business meaning", () => {
  const result = inferLayout(`<main><form><label for="q">Search</label><input id="q"><button>Go</button></form><table><caption>Results</caption><tr><th scope="col">Name</th></tr></table></main>`);
  assert.deepEqual(result.recommendations.map(({ recommendation }) => recommendation), ["field-actions", "table-overflow"]);
  assert.ok(result.recommendations.every(({ rationale }) => rationale.length > 0));
});

test("returns stable, non-mutating output for ambiguous markup", () => {
  const html = "<div><span>One</span><span>Two</span></div>";
  const result = inferLayout(html);
  assert.equal(result.version, 1);
  assert.equal(result.recommendation, null);
  assert.deepEqual(result.recommendations, []);
  assert.equal(html, "<div><span>One</span><span>Two</span></div>");
});
