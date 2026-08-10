import assert from "node:assert/strict";
import test from "node:test";
import { access, readFile } from "node:fs/promises";

test("behavior audit records the empty runtime inventory and native fallbacks", async () => {
  const audit = await readFile(new URL("../../../docs/behavior-audit.md", import.meta.url), "utf8");

  assert.match(audit, /# Behavior audit/);
  assert.match(audit, /No runtime behaviors are currently shipped/);
  assert.match(audit, /native-only/);
  assert.match(audit, /application-owned/);
  assert.match(audit, /JavaScript-disabled path/);
  assert.match(audit, /Initialization and lifecycle/);
});

test("behavior entry point remains an inert optional enhancement", async () => {
  const source = await readFile(new URL("../../../src/behavior/index.js", import.meta.url), "utf8");

  assert.match(source, /export function enhance/);
  assert.doesNotMatch(source, /addEventListener|dispatchEvent|CustomEvent|MutationObserver|setInterval|setTimeout/);
  assert.doesNotMatch(source, /classList|innerWidth|ResizeObserver|getBoundingClientRect/);
});

test("behavior audit is part of the checked repository artifacts", async () => {
  await access(new URL("../../../docs/behavior-audit.md", import.meta.url));
});
