import { cp, mkdir, readFile, readdir, rm, stat, writeFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { renderPage } from "./site-template.mjs";
import { escapeHtml, renderCard, renderGuidePage, renderRecipePage } from "./site-components.mjs";

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
  const authoredRoutes = [
    ["index.html", "home", "/"],
    ["lab/index.html", "lab", "/lab/"],
    ["examples/index.html", "examples", "/examples/"],
    ["recipes/index.html", "recipes", "/recipes/"],
    ["guides/index.html", "guides", "/guides/"],
    ["benchmarks/index.html", "benchmarks", "/benchmarks/"],
    ["changelog.html", "", "/changelog.html"],
    ["roadmap.html", "", "/roadmap.html"],
  ];
  for (const [file, active, canonicalPath] of authoredRoutes) {
    const path = join(outputRoot, file);
    const source = await readFile(path, "utf8");
    const body = source.match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? source;
    const title = source.match(/<title>([^<]+)<\/title>/i)?.[1] ?? "Native UI";
    const description = source.match(/<meta name="description" content="([^"]+)">/i)?.[1] ?? "Native UI — semantic HTML with explicit visual contracts.";
    const scripts = [...source.matchAll(/<script[\s\S]*?<\/script>/gi)].map(([script]) => script).join("\n");
    await writeFile(path, renderPage({ title, description, canonicalPath, body, active, scripts }));
  }
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
  for (const file of ["index.html", "lab/index.html", "examples/index.html", "recipes/index.html", "guides/index.html", "benchmarks/index.html", "changelog.html", "roadmap.html", ...Object.keys(guideDescriptions).map((slug) => `guides/${slug}.html`)]) {
    const path = join(outputRoot, file);
    const html = await readFile(path, "utf8");
    if (!html.includes('property="og:title"')) {
      const title = html.match(/<title>([^<]+)<\/title>/)?.[1] ?? "Native UI";
      const description = html.match(/<meta name="description" content="([^"]+)">/)?.[1] ?? "Native UI — semantic HTML with explicit visual contracts.";
      await writeFile(path, html.replace("</head>", `<meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:image" content="/assets/social-preview.svg"></head>`));
    }
  }
  for (const file of ["lab/index.html", "examples/index.html"]) {
    const path = join(outputRoot, file);
    const html = await readFile(path, "utf8");
    await writeFile(path, html.replaceAll('command="show-modal" commandfor="lab-dialog"', 'data-dialog-open="lab-dialog"').replaceAll('command="show-modal" commandfor="example-dialog"', 'data-dialog-open="example-dialog"'));
  }
  const manifest = JSON.parse(await readFile(join(root, "src/manifest.json"), "utf8"));
  const recipeNames = [...new Set(manifest.recipes.filter((item) => item.endsWith("/metadata.json")).map((item) => item.split("/")[1]))];
  const recipeCards = recipeNames.map((name) => renderCard({ title: name.replaceAll("-", " "), description: `Semantic HTML recipe for the ${name} relationship.`, href: `/recipes/${name}/`, label: "Open recipe", variant: "primary" })).join("");
  const guideNames = ["architecture", "accessibility", "browser-support", "theming", "migration", "analyzer", "governance", "security", "contributing"];
  const guideCards = guideNames.map((name) => renderCard({ title: name.replaceAll("-", " "), description: "Practical guidance for a durable HTML-first interface.", href: `/guides/${name}.html`, label: "Read guide" })).join("");
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
  for (const name of recipeNames) {
    const metadata = JSON.parse(await readFile(join(root, "recipes", name, "metadata.json"), "utf8"));
    const snippet = await readFile(join(root, "recipes", name, "snippet.html"), "utf8");
    const example = await readFile(join(root, "recipes", name, "example.html"), "utf8");
    const exampleBody = (example.match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? example).replace(/<h1>/g, "<h2>").replace(/<\/h1>/g, "</h2>");
    const title = metadata.name.replaceAll("-", " ");
    await mkdir(join(outputRoot, "recipes", name), { recursive: true });
    await writeFile(join(outputRoot, "recipes", name, "index.html"), `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="${escapeHtml(metadata.purpose)}"><link rel="canonical" href="https://native-ui.example/recipes/${name}/"><link rel="icon" href="/favicon.svg"><link rel="stylesheet" href="/assets/native-ui/native-ui.css"><link rel="stylesheet" href="/styles.css"><title>${title} recipe · Native UI</title></head><body><a class="nui-site-skip" href="#main">Skip to content</a><header class="nui-site-header"><div class="nui-site-shell nui-site-header-inner"><nav class="nui-site-nav responsive-navigation" aria-label="Primary"><a class="nui-site-brand" href="/">Native UI</a><nav class="nui-site-nav-links nui-cluster" aria-label="Site"><a href="/lab/">Lab</a><a href="/examples/">Examples</a><a href="/recipes/" aria-current="page">Recipes</a><a href="/guides/">Guides</a><a href="/benchmarks/">Evidence</a></nav></nav></div></header><main id="main" class="nui-site-shell nui-site-main nui-stack"><header class="nui-site-route-header nui-readable"><p class="nui-site-eyebrow">Canonical recipe</p><h1>${title}</h1><p class="nui-site-lede">${escapeHtml(metadata.purpose)}.</p></header><section class="nui-grid"><article class="nui-site-frame"><header><h2>Live example</h2><p class="nui-site-muted">The same semantic markup, rendered with Native UI.</p></header><section>${exampleBody}</section></article><article class="nui-site-frame"><header><h2>HTML snippet</h2><p class="nui-site-muted">Select and copy the source; it has no framework dependency.</p></header><pre class="nui-site-code"><code>${escapeHtml(snippet)}</code></pre></article></section><section class="card nui-stack"><h2>When to use</h2><p>Use this recipe when the named relationship is present and native flow alone does not communicate the intended grouping.</p><h2>When not to use</h2><p>${escapeHtml(metadata.whenNotToUse)}</p><h2>Native alternative</h2><p>${escapeHtml(metadata.nativeAlternative)}</p><p><a href="/recipes/">Back to all recipes</a></p></section></main><footer class="nui-site-shell nui-site-footer"><small><a href="/">Home</a> · <a href="https://github.com/IFAKA/native-ui/tree/main/recipes/${name}">Repository source</a></small></footer></body></html>`);
  }
  const generatedRoutes = [
    ...Object.keys(guideDescriptions).map((slug) => [`guides/${slug}.html`, "guides", `/guides/${slug}.html`]),
    ...recipeNames.map((name) => [`recipes/${name}/index.html`, "recipes", `/recipes/${name}/`]),
  ];
  for (const [file, active, canonicalPath] of generatedRoutes) {
    const path = join(outputRoot, file);
    const source = await readFile(path, "utf8");
    const body = source.match(/<main[^>]*>([\s\S]*?)<\/main>/i)?.[1] ?? source;
    const title = source.match(/<title>([^<]+)<\/title>/i)?.[1] ?? "Native UI";
    const description = source.match(/<meta name="description" content="([^"]+)">/i)?.[1] ?? "Native UI — semantic HTML with explicit visual contracts.";
    await writeFile(path, renderPage({ title, description, canonicalPath, body, active }));
  }
  for (const name of recipeNames) {
    const path = join(outputRoot, "recipes", name, "index.html");
    const html = await readFile(path, "utf8");
    const title = html.match(/<title>([^<]+)<\/title>/)?.[1] ?? "Native UI recipe";
    const description = html.match(/<meta name="description" content="([^"]+)">/)?.[1] ?? "Canonical Native UI recipe.";
    await writeFile(path, html.replace("</head>", `<meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:image" content="/assets/social-preview.svg"></head>`));
  }
  const sitemapPath = join(outputRoot, "sitemap.xml");
  const sitemap = await readFile(sitemapPath, "utf8");
  const recipeUrls = recipeNames.map((name) => `<url><loc>https://native-ui.example/recipes/${name}/</loc></url>`).join("");
  await writeFile(sitemapPath, sitemap.replace("</urlset>", `${recipeUrls}</urlset>`));
  await copyTree(join(root, "benchmarks/reports"), join(outputRoot, "assets/benchmarks"));
  await validateLinks(outputRoot);
  return { output: outputRoot, routes: routeFiles };
}

if (process.argv[1] === new URL(import.meta.url).pathname) await buildSite();
