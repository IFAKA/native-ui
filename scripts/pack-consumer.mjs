import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const run = promisify(execFile);
const root = new URL("../", import.meta.url);
const temp = await mkdtemp(join(tmpdir(), "native-ui-consumer-"));

try {
  const { stdout } = await run("npm", ["pack", "--pack-destination", temp], { cwd: root });
  const archive = join(temp, stdout.trim().split("\n").at(-1));
  await run("npm", ["init", "--yes"], { cwd: temp });
  await run("npm", ["install", archive, "--ignore-scripts", "--no-audit", "--no-fund"], { cwd: temp });
  await run("node", ["-e", "import('@ifaka/native-ui/manifest.json', { with: { type: 'json' } }).then(() => import('@ifaka/native-ui/behavior.js')).then(() => import('node:fs/promises')).then(({ access }) => access('node_modules/@ifaka/native-ui/dist/native-ui.css'))"], { cwd: temp });
  console.log("packed consumer check passed");
} finally {
  await rm(temp, { recursive: true, force: true });
}
