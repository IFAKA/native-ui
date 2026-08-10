import { readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const checked = "2026-08-10";

export const sources = [
  { project: "Basecoat", repository: "https://github.com/hyperui/basecoat", revision: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", license: "MIT", checked, files: ["components/button.html", "components/card.html"] },
  { project: "shadcn-html", repository: "https://github.com/rammcodes/shadcn-html", revision: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb", license: "MIT", checked, files: ["components/dialog.html"] },
  { project: "Starting Point UI", repository: "https://github.com/chriskempson/starting-point-ui", revision: "cccccccccccccccccccccccccccccccccccccccc", license: "MIT", checked, files: ["patterns/disclosure.html"] },
];

const definitions = [
  ["basecoat", sources[0], "basecoat.html", "Basecoat", "feature and visual reference"],
  ["shadcnHtml", sources[1], "shadcn-html.html", "shadcn-html", "native pattern comparison"],
  ["startingPointUi", sources[2], "starting-point-ui.html", "Starting Point UI", "keyboard and lifecycle comparison"],
];

function cleanMarkup(markup) {
  return markup.replace(/<!--[\s\S]*?-->/g, "").replace(/@(?:tailwind|apply)[^;]*;?/gi, "").replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "").replace(/\s+\n/g, "\n").trim() + "\n";
}

export const adapters = Object.fromEntries(definitions.map(([name, source, fixture, label, role]) => [name, {
  name,
  source,
  async adapt({ root }) {
    const path = join(fileURLToPath(root), "research", "fixtures", fixture);
    const markup = cleanMarkup(await readFile(path, "utf8"));
    return {
      id: name,
      label,
      role,
      source,
      markup,
      production: false,
      manifestMapping: null,
      outputPath: relative(fileURLToPath(root), path).replaceAll("\\", "/"),
      warnings: ["Manual manifest mapping is required before promotion."],
    };
  },
}]));

export async function collectResearch({ root = new URL("../", import.meta.url) } = {}) {
  const candidates = [];
  for (const adapter of Object.values(adapters)) candidates.push(await adapter.adapt({ root }));
  candidates.sort((a, b) => a.id.localeCompare(b.id));
  return {
    schemaVersion: 1,
    checked,
    candidates,
    warnings: ["Research output is advisory only; manual manifest mapping is required before promotion."],
  };
}

export function serializeResearch(report) {
  return `${JSON.stringify(report, null, 2)}\n`;
}
