import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";

const root = resolve(import.meta.dirname, "..");
const routes = ["/", "/lab/", "/examples/", "/recipes/", "/guides/", "/benchmarks/", "/changelog.html", "/roadmap.html"];

test("site assembler creates every public route and stable Native UI assets", async () => {
  const output = await mkdtemp(join(tmpdir(), "native-ui-site-"));
  try {
    const { buildSite } = await import("../scripts/build-site.mjs");
    await buildSite({ root, output });
    for (const route of routes) {
      const file = route === "/" ? "index.html" : route.endsWith("/") ? join(route.slice(1), "index.html") : route.slice(1);
      await readFile(join(output, file), "utf8");
    }
    assert.ok(await readFile(join(output, "assets/native-ui/native-ui.css"), "utf8"));
    assert.ok(await readFile(join(output, "sitemap.xml"), "utf8"));
  } finally {
    await rm(output, { recursive: true, force: true });
  }
});

test("generated pages have one heading, metadata, skip link, and primary navigation", async () => {
  const output = await mkdtemp(join(tmpdir(), "native-ui-site-meta-"));
  try {
    const { buildSite } = await import("../scripts/build-site.mjs");
    await buildSite({ root, output });
    const htmlFiles = routes.map((route) => join(output, route === "/" ? "index.html" : route.endsWith("/") ? join(route.slice(1), "index.html") : route.slice(1)));
    for (const file of htmlFiles) {
      const html = await readFile(file, "utf8");
      assert.match(html, /<title>[^<]+<\/title>/, file);
      assert.match(html, /<meta name="description" content="[^"]+">/, file);
      assert.equal((html.match(/<h1\b/g) ?? []).length, 1, file);
      assert.match(html, /href="#main"[^>]*>Skip to content/, file);
      assert.match(html, /<nav[^>]+aria-label="Primary"/, file);
    }
  } finally {
    await rm(output, { recursive: true, force: true });
  }
});

test("vercel configuration is static and points at public", async () => {
  const config = JSON.parse(await readFile(resolve(root, "vercel.json"), "utf8"));
  assert.equal(config.framework, null);
  assert.equal(config.buildCommand, "npm run build");
  assert.equal(config.outputDirectory, "public");
});

test("recipe discovery links to readable recipe detail pages", async () => {
  const output = await mkdtemp(join(tmpdir(), "native-ui-recipe-"));
  try {
    const { buildSite } = await import("../scripts/build-site.mjs");
    await buildSite({ root, output });
    const index = await readFile(join(output, "recipes/index.html"), "utf8");
    assert.match(index, /href="\/recipes\/card\/"/);
    const detail = await readFile(join(output, "recipes/card/index.html"), "utf8");
    assert.match(detail, /When to use/);
    assert.match(detail, /<pre[^>]*><code>/);
    assert.doesNotMatch(detail, /href="\.\.\/\.\.\/dist\/native-ui\.css"/);
  } finally {
    await rm(output, { recursive: true, force: true });
  }
});

test("interactive examples start closed and site variants have distinct treatments", async () => {
  const output = await mkdtemp(join(tmpdir(), "native-ui-example-"));
  try {
    const { buildSite } = await import("../scripts/build-site.mjs");
    await buildSite({ root, output });
    const lab = await readFile(join(output, "lab/index.html"), "utf8");
    const css = await readFile(join(output, "styles.css"), "utf8");
    assert.doesNotMatch(lab, /<dialog[^>]+\sopen(?:=|\s|>)/);
    assert.doesNotMatch(css, /\[popover\]\s*\{\s*inset:\s*auto/);
    assert.match(css, /data-variant="primary"/);
    assert.match(css, /data-variant="quiet"/);
  } finally {
    await rm(output, { recursive: true, force: true });
  }
});

test("shared site template owns the shell instead of route pages", async () => {
  const { renderPage } = await import("../scripts/site-template.mjs");
  const html = renderPage({
    title: "Template test",
    description: "Template description",
    canonicalPath: "/template-test/",
    body: "<h1>Template test</h1><p>Body content.</p>",
    active: "examples",
  });
  assert.equal((html.match(/aria-label="Primary"/g) ?? []).length, 1);
  assert.match(html, /href="\/assets\/native-ui\/native-ui\.css"/);
  assert.match(html, /href="\/styles\.css"/);
  assert.match(html, /<footer[^>]*nui-site-footer/);
  assert.match(html, /aria-current="page"[^>]*>Examples/);
});
