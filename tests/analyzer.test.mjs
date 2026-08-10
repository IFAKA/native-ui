import test from "node:test";
import assert from "node:assert/strict";
import { analyzeHtml, formatJson, formatText, explainRule } from "../src/analyzer/index.mjs";

test("analyzer reports deterministic findings with locations and recommendations", () => {
  const html = `<form><input type="text"><img src="hero.jpg"><div class="btn">Save</div></form>`;
  const result = analyzeHtml(html, { file: "fixture.html" });
  assert.deepEqual(result.findings.map(({ ruleId }) => ruleId), [
    "labels-required", "image-alt", "native-control",
  ]);
  assert.deepEqual(result.findings[0].location, { line: 1, column: 7 });
  assert.equal(result.findings[0].severity, "error");
  assert.match(result.findings[0].recommendation, /label/i);
  assert.ok(formatJson(result).endsWith("\n"));
  assert.match(formatText(result), /fixture\.html:1:7/);
});

test("analyzer keeps safe native markup quiet and JSON byte deterministic", () => {
  const html = `<main><h1>Title</h1><label for="email">Email</label><input id="email" type="email"><img alt="A view" src="a.jpg"></main>`;
  const one = analyzeHtml(html, { file: "safe.html" });
  const two = analyzeHtml(html, { file: "safe.html" });
  assert.deepEqual(one.findings, []);
  assert.equal(formatJson(one), formatJson(two));
});

test("analyzer recognizes visible names in native links and buttons", () => {
  const result = analyzeHtml('<a href="/lab/">Open lab</a><button type="button">Save</button>');
  assert.deepEqual(result.findings, []);
});

test("analyzer accepts controls wrapped by their native label", () => {
  const result = analyzeHtml('<label>Email <input type="email"></label>');
  assert.deepEqual(result.findings, []);
});

test("rule explanations are stable and unknown rules are rejected", () => {
  assert.match(explainRule("labels-required"), /associated label/i);
  assert.throws(() => explainRule("missing-rule"), /Unknown analyzer rule/);
});
