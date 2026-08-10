import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";

const routeFiles = ["index.html", "lab/index.html", "examples/index.html", "recipes/index.html", "guides/index.html", "benchmarks/index.html", "changelog.html", "roadmap.html"];

async function copyTree(source, destination) {
  await mkdir(destination, { recursive: true });
  await cp(source, destination, { recursive: true, force: true });
}

async function validateLinks(output) {
  const files = [];
  async function collect(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) await collect(path);
      else if (entry.name.endsWith(".html") || entry.name.endsWith(".xml")) files.push(path);
    }
  }
  await collect(output);
  for (const file of files) {
    const source = await readFile(file, "utf8");
    for (const target of source.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const value = target[1];
      if (/^(?:https?:|mailto:|data:|#)/.test(value)) continue;
      const [pathname] = value.split("#");
      const candidate = pathname.startsWith("/") ? join(output, pathname.slice(1)) : resolve(file, "..", pathname);
      const candidates = pathname.endsWith("/") ? [join(candidate, "index.html")] : [candidate, join(candidate, "index.html")];
      let exists = false;
      for (const item of candidates) { try { await stat(item); exists = true; break; } catch {} }
      if (!exists) throw new Error(`Unresolved site link in ${relative(output, file)}: ${value}`);
    }
  }
}

export async function buildSite({ root = resolve(import.meta.dirname, ".."), output = join(root, "public") } = {}) {
  const sourceSite = join(root, "site");
  const outputRoot = resolve(output);
  await rm(outputRoot, { recursive: true, force: true });
  await mkdir(outputRoot, { recursive: true });
  await copyTree(sourceSite, outputRoot);
  const guideDescriptions = {
    architecture: "HTML owns meaning and native state. CSS owns hierarchy, rhythm, and intrinsic adaptation. Application code owns data, routing, and business rules.",
    accessibility: "Use native elements first, keep labels explicit, preserve focus, and verify keyboard operation, zoom, forced colors, narrow widths, and reduced motion.",
    "browser-support": "The target is current and previous stable Chromium, Firefox, and Safari plus corresponding mobile browsers. Unsupported enhancements never hide content or strand focus.",
    theming: "Override documented --nui-* tokens at your boundary. Keep semantic states and contrast contracts intact; do not fork markup for dark mode or mobile.",
    migration: "Start with semantic HTML and one stylesheet. Replace presentation-only wrappers with native elements, then add only the contract that names the actual relationship.",
    analyzer: "The deterministic analyzer finds missing labels, image alternatives, weak interactive names, responsive overflow, unreadable widths, and unnecessary classes.",
    governance: "The manifest is the public contract. New selectors, attributes, events, exports, dependencies, or browser requirements require specification, tests, documentation, and changelog evidence.",
    security: "Native UI has no runtime dependencies and does not own application data, routing, analytics, authentication, or business validation. Apply your application's server-side policy.",
    contributing: "Begin with the active spec, plan, and tasks. Write a failing contract test first, implement the smallest complete slice, run npm test, and record architectural decisions."
  };
  for (const [slug, description] of Object.entries(guideDescriptions)) {
    const path = join(outputRoot, "guides", `${slug}.html`);
    const title = slug.replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
    await writeFile(path, `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="${description}"><link rel="canonical" href="https://native-ui.example/guides/${slug}.html"><link rel="icon" href="/favicon.svg"><link rel="stylesheet" href="/assets/native-ui/native-ui.css"><link rel="stylesheet" href="/styles.css"><title>${title} · Native UI</title></head><body><a class="nui-site-skip" href="#main">Skip to content</a><header class="nui-site-header"><div class="nui-site-shell nui-site-header-inner"><nav class="nui-site-nav responsive-navigation" aria-label="Primary"><a class="nui-site-brand" href="/">Native UI</a><nav class="nui-site-nav-links nui-cluster" aria-label="Site"><a href="/lab/">Lab</a><a href="/examples/">Examples</a><a href="/recipes/">Recipes</a><a href="/guides/" aria-current="page">Guides</a><a href="/benchmarks/">Evidence</a></nav></nav></div></header><main id="main" class="nui-site-shell nui-site-main nui-readable nui-stack"><header class="nui-site-route-header"><p class="nui-site-eyebrow">Native UI guide</p><h1>${title}</h1></header><article class="card nui-stack"><p>${description}</p><p><a href="/guides/">Back to all guides</a> · <a href="/examples/">Try an example</a></p></article></main><footer class="nui-site-shell nui-site-footer"><small><a href="/">Home</a> · <a href="/changelog.html">Changelog</a></small></footer></body></html>`);
  }
  for (const file of ["lab/index.html", "examples/index.html"]) {
    const path = join(outputRoot, file);
    const html = await readFile(path, "utf8");
    await writeFile(path, html.replaceAll('<dialog id="lab-dialog">', '<dialog id="lab-dialog" open>').replaceAll('<dialog id="example-dialog">', '<dialog id="example-dialog" open>'));
  }
  for (const file of ["index.html", "lab/index.html", "examples/index.html", "recipes/index.html", "guides/index.html", "benchmarks/index.html", "changelog.html", "roadmap.html", ...Object.keys(guideDescriptions).map((slug) => `guides/${slug}.html`)]) {
    const path = join(outputRoot, file);
    const html = await readFile(path, "utf8");
    if (!html.includes('property="og:title"')) {
      const title = html.match(/<title>([^<]+)<\/title>/)?.[1] ?? "Native UI";
      const description = html.match(/<meta name="description" content="([^"]+)">/)?.[1] ?? "Native UI — semantic HTML with explicit visual contracts.";
      await writeFile(path, html.replace("</head>", `<meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:image" content="/assets/social-preview.svg"></head>`));
    }
  }
  const manifest = JSON.parse(await readFile(join(root, "src/manifest.json"), "utf8"));
  const recipeNames = [...new Set(manifest.recipes.filter((item) => item.endsWith("/metadata.json")).map((item) => item.split("/")[1]))];
  const recipeCards = recipeNames.map((name) => `<article class="card nui-stack"><h2>${name.replaceAll("-", " ")}</h2><p>Semantic HTML recipe for the <code>${name}</code> relationship.</p><p class="nui-cluster"><a data-variant="primary" href="/assets/recipes/${name}/example.html">Live example</a><a data-variant="quiet" href="/assets/recipes/${name}/snippet.html">HTML snippet</a></p></article>`).join("");
  const guideNames = ["architecture", "accessibility", "browser-support", "theming", "migration", "analyzer", "governance", "security", "contributing"];
  const guideCards = guideNames.map((name) => `<article class="card nui-stack"><h2>${name.replaceAll("-", " ")}</h2><p>Practical guidance for a durable HTML-first interface.</p><a href="/guides/${name}.html">Read guide</a></article>`).join("");
  for (const [file, replacement] of [["recipes/index.html", recipeCards], ["guides/index.html", guideCards]]) {
    const path = join(outputRoot, file);
    await writeFile(path, (await readFile(path, "utf8")).replace(file.startsWith("recipes") ? "__RECIPE_CARDS__" : "__GUIDE_CARDS__", replacement));
  }
  await mkdir(join(outputRoot, "assets/native-ui"), { recursive: true });
  for (const file of ["native-ui.css", "behavior.js", "manifest.json"]) {
    await cp(join(root, "dist", file), join(outputRoot, "assets/native-ui", file));
  }
  await copyTree(join(root, "recipes"), join(outputRoot, "assets/recipes"));
  const recipeDirs = await readdir(join(outputRoot, "assets/recipes"), { withFileTypes: true });
  for (const dir of recipeDirs.filter((entry) => entry.isDirectory())) {
    const example = join(outputRoot, "assets/recipes", dir.name, "example.html");
    try {
      const html = await readFile(example, "utf8");
      await writeFile(example, html.replaceAll("../../dist/native-ui.css", "/assets/native-ui/native-ui.css"));
    } catch {}
  }
  await copyTree(join(root, "benchmarks/reports"), join(outputRoot, "assets/benchmarks"));
  await validateLinks(outputRoot);
  return { output: outputRoot, routes: routeFiles };
}

if (process.argv[1] === new URL(import.meta.url).pathname) await buildSite();
