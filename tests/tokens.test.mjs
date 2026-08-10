import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";

const css = await readFile(new URL("../src/tokens.css", import.meta.url), "utf8");

const tokenGroups = {
  typography: ["--nui-font-sans", "--nui-font-mono", "--nui-text-sm", "--nui-text-base", "--nui-leading-body", "--nui-leading-heading"],
  spacing: ["--nui-space-1", "--nui-space-2", "--nui-space-3", "--nui-space-4", "--nui-space-6", "--nui-space-8"],
  "readable width": ["--nui-readable"],
  "control sizing": ["--nui-control-size", "--nui-control-padding"],
  radius: ["--nui-radius-sm", "--nui-radius", "--nui-radius-lg"],
  border: ["--nui-border-width", "--nui-border-color"],
  surfaces: ["--nui-surface", "--nui-surface-raised", "--nui-surface-sunken"],
  foregrounds: ["--nui-foreground", "--nui-foreground-muted", "--nui-foreground-link"],
  accent: ["--nui-accent", "--nui-accent-contrast"],
  danger: ["--nui-danger", "--nui-danger-contrast"],
  shadow: ["--nui-shadow-sm", "--nui-shadow"],
  motion: ["--nui-ease-out", "--nui-duration-fast", "--nui-duration-normal"],
};

test("visual tokens expose every documented group", () => {
  for (const [group, tokens] of Object.entries(tokenGroups)) {
    for (const token of tokens) assert.match(css, new RegExp(`${token}:`), `${group} is missing ${token}`);
  }
});

test("visual tokens are bounded and each declaration is an author value", () => {
  const declarations = [...css.matchAll(/(--nui-[\w-]+)\s*:/g)].map(([, token]) => token);
  const uniqueDeclarations = [...new Set(declarations)];
  assert.ok(uniqueDeclarations.length <= 36, `expected a bounded token surface, got ${uniqueDeclarations.length}`);

  for (const token of uniqueDeclarations) {
    const declaration = css.match(new RegExp(`${token}:\\s*([^;]+)`))?.[1]?.trim();
    assert.ok(declaration && !declaration.startsWith("var(--nui-"), `${token} must not be an alias`);
  }
});

test("visual tokens declare native contrast, color, and motion contracts", () => {
  assert.match(css, /color-scheme:\s*light\s+dark/);
  assert.match(css, /light-dark\(/);
  assert.match(css, /oklch\(/);
  assert.match(css, /@media\s*\(prefers-contrast:\s*more\)/);
  assert.match(css, /@media\s*\(forced-colors:\s*active\)/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
});
