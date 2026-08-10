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
