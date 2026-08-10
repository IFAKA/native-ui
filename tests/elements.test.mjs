import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const css = await readFile(new URL("../src/elements.css", import.meta.url), "utf8");

const contracts = {
  typography: ["h1", "h2", "h3", "p", "blockquote", "hr"],
  links: ["a\\[href\\]", ":visited", ":hover"],
  lists: ["ul", "ol", "dl", "dt", "dd"],
  code: ["pre", "code", "kbd", "samp"],
  media: ["figure", "figcaption", "audio", "video"],
  forms: ["form", "label", "fieldset", "legend", "input", "select", "textarea"],
  states: [":disabled", ":read-only", ":checked", ":user-valid", ":user-invalid"],
  data: ["table", "caption", "th", "td", "progress", "meter", "output"],
  disclosure: ["details", "summary", "dialog", "popover"],
};

test("classless semantic elements declare every Task 5 contract", () => {
  for (const [group, selectors] of Object.entries(contracts)) {
    for (const selector of selectors) {
      assert.match(css, new RegExp(selector), `${group} is missing ${selector}`);
    }
  }
});

test("classless elements preserve native accessibility and resilience contracts", () => {
  assert.match(css, /:where\([^)]*\)\s*\{/);
  assert.match(css, /focus-visible/);
  assert.match(css, /min-block-size:\s*var\(--nui-control-size\)/);
  assert.match(css, /font-size:\s*max\(1rem/);
  assert.match(css, /forced-colors:\s*active/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /overflow-wrap:\s*anywhere/);
  assert.doesNotMatch(css, /!important/);
});

test("form styling uses relationships and native states instead of component classes", () => {
  assert.match(css, /:where\(label\)/);
  assert.match(css, /:has\(/);
  assert.match(css, /:user-invalid/);
  assert.match(css, /:user-valid/);
  assert.doesNotMatch(css, /\.(?:input|button|field|form)\b/);
});
