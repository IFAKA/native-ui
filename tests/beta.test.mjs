import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");

test("beta evidence is explicit about scope, methodology, and blockers", async () => {
  const [report, convergence, roadmap, changelog] = await Promise.all([
    readFile(resolve(root, "docs/beta-report.md"), "utf8"),
    readFile(resolve(root, "specs/001-native-ui-foundation/convergence.md"), "utf8"),
    readFile(resolve(root, "ROADMAP.md"), "utf8"),
    readFile(resolve(root, "CHANGELOG.md"), "utf8"),
  ]);

  for (const section of ["Scope", "Methodology", "Evidence", "Known limitations", "1.0 blockers"]) {
    assert.match(report, new RegExp(`^## ${section}$`, "m"), `beta report needs ${section}`);
  }
  for (const section of ["Contract review", "Feedback triage", "Unmet requirements", "Convergence decision"]) {
    assert.match(convergence, new RegExp(`^## ${section}$`, "m"), `convergence needs ${section}`);
  }
  assert.match(report, /npm `latest`|latest.*not/i);
  assert.match(report, /not run|not available|not published/i);
  assert.match(convergence, /no unmet requirement|blocked|not complete/i);
  assert.match(roadmap, /Public beta.*[✅✓]|Public beta.*complete/i);
  assert.match(changelog, /beta|convergence/i);
});
