import { mkdir, readFile, writeFile, access } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import path from "node:path";

const here = fileURLToPath(new URL("./", import.meta.url));
const defaultRoot = path.resolve(here, "..");

async function readJson(file) {
  return JSON.parse(await readFile(file, "utf8"));
}

function unique(values) {
  return [...new Set(values)].sort();
}

function extractSurface(css, behavior, pkg) {
  const classes = unique([...css.matchAll(/(?<![a-z0-9_-])\.([a-z][a-z0-9-]*)\b/gi)].map((match) => `.${match[1]}`));
  const tokens = unique([...css.matchAll(/--nui-[a-z0-9-]+\b/gi)].map((match) => match[0]));
  const attributes = unique([...css.matchAll(/data-[a-z][a-z0-9-]*/gi)].map((match) => match[0]));
  const variants = unique([...css.matchAll(/data-variant\s*\*?=\s*["']([^"']+)["']/gi)].flatMap((match) => match[1].split(/\s*\|\s*/)));
  const events = unique([
    ...behavior.matchAll(/new\s+CustomEvent\(["']([^"']+)/g),
    ...behavior.matchAll(/addEventListener\(["']([^"']+)/g),
  ].map((match) => match[1]));
  return {
    classes,
    tokens,
    attributes,
    variants,
    events,
    exports: Object.keys(pkg.exports ?? {}).sort(),
  };
}

function selectorSymbols(manifest) {
  const classes = new Set([...manifest.layouts, ...manifest.compositions].map((name) => `.${name}`));
  const attributes = new Set();
  for (const capability of manifest.capabilities) {
    for (const match of capability.selector.matchAll(/data-[a-z][a-z0-9-]*/gi)) attributes.add(match[0]);
    for (const match of capability.declaration.matchAll(/data-[a-z][a-z0-9-]*/gi)) attributes.add(match[0]);
    for (const match of capability.selector.matchAll(/\.([a-z][a-z0-9-]*)\b/gi)) classes.add(`.${match[1]}`);
  }
  return { classes, attributes };
}

function formatReport(surface) {
  const section = (name, values) => `${name}:\n${values.length ? values.map((value) => `- ${value}`).join("\n") : "- (none)"}`;
  return [
    "Native UI public surface",
    "=========================",
    section("Exports", surface.exports),
    section("Tokens", surface.tokens),
    section("Classes", surface.classes),
    section("Attributes", surface.attributes),
    section("Variants", surface.variants),
    section("Events", surface.events),
    "",
  ].join("\n");
}

async function fileExists(root, relativePath) {
  try {
    await access(path.resolve(root, relativePath));
    return true;
  } catch {
    return false;
  }
}

export async function auditPublicApi({ root = defaultRoot, manifest: suppliedManifest } = {}) {
  const sourceRoot = path.resolve(root);
  const manifest = suppliedManifest ?? await readJson(path.join(sourceRoot, "src/manifest.json"));
  const pkg = await readJson(path.join(sourceRoot, "package.json"));
  const css = await readFile(path.join(sourceRoot, "src/index.css"), "utf8")
    .then(async (entry) => {
      const files = [...entry.matchAll(/@import\s+"\.\/(.+?\.css)"/g)].map((match) => match[1]);
      return (await Promise.all(files.map((file) => readFile(path.join(sourceRoot, "src", file), "utf8")))).join("\n");
    });
  const behavior = await readFile(path.join(sourceRoot, "src/behavior/index.js"), "utf8");
  const surface = extractSurface(css, behavior, pkg);
  const errors = [];
  const declared = selectorSymbols(manifest);
  const capabilityIds = manifest.capabilities.map(({ id }) => id);

  for (const duplicate of capabilityIds.filter((id, index) => capabilityIds.indexOf(id) !== index)) {
    errors.push(`duplicate capability ID: ${duplicate}`);
  }
  for (const symbol of surface.classes) {
    if (!declared.classes.has(symbol)) errors.push(`undocumented public class: ${symbol}`);
    if (/\.(?:btn|button|input|select|textarea|dialog|modal|menu|tabs?)(?:-|$)/i.test(symbol)) {
      errors.push(`role-repeating public class: ${symbol}`);
    }
  }
  for (const token of surface.tokens) {
    if (!manifest.tokens.includes(token)) errors.push(`undocumented public token: ${token}`);
  }
  for (const attribute of surface.attributes) {
    if (!declared.attributes.has(attribute)) errors.push(`undocumented public attribute: ${attribute}`);
  }
  for (const variant of surface.variants) {
    if (!manifest.variants.includes(variant)) errors.push(`unapproved variant: ${variant}`);
  }
  if (!Array.isArray(manifest.exports) || manifest.exports.join("\n") !== surface.exports.join("\n")) {
    errors.push("manifest exports do not match package exports");
  }
  for (const recipe of manifest.recipes) {
    if (!(await fileExists(sourceRoot, recipe))) errors.push(`missing recipe reference: ${recipe}`);
  }
  for (const capability of manifest.capabilities) {
    if (capability.recipePath && !manifest.recipes.includes(capability.recipePath)) {
      errors.push(`capability ${capability.id} references an undeclared recipe: ${capability.recipePath}`);
    }
    for (const field of [
      "id", "category", "nativePrimitive", "selector", "declaration", "cssRequirement",
      "jsRequirement", "fallback", "responsiveBehavior", "keyboardFocusContract", "statesEvents",
      "authorOverrides", "analyzerRules", "compatibilityEvidence", "recipePath",
    ]) {
      if (!(field in capability)) errors.push(`capability ${capability.id ?? "(unknown)"} missing ${field}`);
    }
  }

  const report = formatReport(surface);
  await mkdir(path.join(sourceRoot, "dist"), { recursive: true });
  await writeFile(path.join(sourceRoot, "dist/public-surface.txt"), report);
  return { errors: unique(errors), surface, report };
}

export { extractSurface, formatReport };

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) {
  const result = await auditPublicApi();
  if (result.errors.length) {
    console.error(result.errors.join("\n"));
    process.exitCode = 1;
  } else {
    console.log(result.report);
  }
}
