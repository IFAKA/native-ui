import { mkdir, readFile, writeFile } from "node:fs/promises";
import { auditPublicApi } from "./audit-public-api.mjs";
import { buildSite } from "./build-site.mjs";

const cssFiles = ["tokens.css", "elements.css", "layouts.css", "compositions.css"];
const css = ["@layer nui.tokens, nui.elements, nui.layouts, nui.compositions, nui.enhancements;", ""];

for (const file of cssFiles) {
  css.push(await readFile(new URL(`../src/${file}`, import.meta.url), "utf8"));
}

await mkdir(new URL("../dist/analyzer/", import.meta.url), { recursive: true });
await writeFile(new URL("../dist/native-ui.css", import.meta.url), css.join("\n"));
await writeFile(
  new URL("../dist/behavior.js", import.meta.url),
  await readFile(new URL("../src/behavior/index.js", import.meta.url), "utf8"),
);
await writeFile(
  new URL("../dist/manifest.json", import.meta.url),
  await readFile(new URL("../src/manifest.json", import.meta.url), "utf8"),
);
await writeFile(new URL("../dist/cli.mjs", import.meta.url), await readFile(new URL("../src/cli.mjs", import.meta.url), "utf8"));
await writeFile(new URL("../dist/analyzer/index.mjs", import.meta.url), await readFile(new URL("../src/analyzer/index.mjs", import.meta.url), "utf8"));
await writeFile(new URL("../dist/analyzer/inference.mjs", import.meta.url), await readFile(new URL("../src/analyzer/inference.mjs", import.meta.url), "utf8"));

const audit = await auditPublicApi();
if (audit.errors.length) throw new Error(audit.errors.join("\n"));

if (!process.argv.includes("--package-only")) await buildSite();
