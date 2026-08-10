import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function read(path) {
  return readFile(new URL(path, root), "utf8");
}

test("CI has bounded least-privilege quality and security jobs", async () => {
  const workflow = await read(".github/workflows/ci.yml");
  for (const job of ["unit", "contract", "package", "analyzer", "browser", "accessibility", "docs", "dependency-review"]) {
    assert.match(workflow, new RegExp(`^  ${job}:`, "m"), `${job} job is missing`);
  }
  assert.match(workflow, /timeout-minutes:/);
  assert.match(workflow, /permissions:\s*\n\s+contents: read/);
  assert.match(workflow, /actions\/upload-artifact@[0-9a-f]{40}/);
});

test("security automation and community metadata are configured", async () => {
  const [codeql, dependabot, security] = await Promise.all([
    read(".github/workflows/codeql.yml"),
    read(".github/dependabot.yml"),
    read("SECURITY.md"),
  ]);
  assert.doesNotMatch(codeql, /@v\d/);
  assert.match(codeql, /github\/codeql-action\/(?:init|analyze)@[0-9a-f]{40}/);
  assert.match(dependabot, /github-actions/);
  assert.match(security, /provenance|trusted publishing/i);
  for (const file of ["CODE_OF_CONDUCT.md", "CONTRIBUTING.md", "GOVERNANCE.md", "SUPPORT.md", "LICENSE"]) {
    await read(file);
  }
  const issues = await readdir(new URL(".github/ISSUE_TEMPLATE/", root));
  assert.ok(issues.includes("config.yml"));
});

test("release workflow publishes with OIDC and provenance after packed-artifact verification", async () => {
  const workflow = await read(".github/workflows/release.yml");
  assert.match(workflow, /id-token:\s*write/);
  assert.match(workflow, /npm publish/);
  assert.match(workflow, /provenance/);
  assert.match(workflow, /npm pack/);
  assert.match(workflow, /--tag next/);
});
