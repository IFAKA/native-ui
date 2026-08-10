import { renderPage } from "./site-template.mjs";

export function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

export function renderCard({ title, description, href, label, variant = "quiet" }) {
  return `<article class="card nui-stack"><h2>${escapeHtml(title)}</h2><p>${escapeHtml(description)}</p><a data-variant="${escapeHtml(variant)}" href="${escapeHtml(href)}">${escapeHtml(label)}</a></article>`;
}

export function renderGuidePage({ title, description, body }) {
  return renderPage({
    title: `${title} · Native UI`,
    description,
    canonicalPath: `/guides/${title.toLowerCase().replaceAll(" ", "-")}.html`,
    active: "guides",
    body: `<header class="nui-site-route-header"><p class="nui-site-eyebrow">Native UI guide</p><h1>${escapeHtml(title)}</h1></header><article class="card nui-stack"><p>${escapeHtml(description)}</p><p>${body}</p><p><a href="/guides/">Back to all guides</a> · <a href="/examples/">Try an example</a></p></article>`,
  });
}

export function renderRecipePage({ name, title, purpose, exampleBody, snippet, whenNotToUse, nativeAlternative }) {
  return renderPage({
    title: `${title} recipe · Native UI`,
    description: purpose,
    canonicalPath: `/recipes/${name}/`,
    active: "recipes",
    body: `<header class="nui-site-route-header nui-readable"><p class="nui-site-eyebrow">Canonical recipe</p><h1>${escapeHtml(title)}</h1><p class="nui-site-lede">${escapeHtml(purpose)}.</p></header><section class="nui-grid"><article class="nui-site-frame"><header><h2>Live example</h2><p class="nui-site-muted">The same semantic markup, rendered with Native UI.</p></header><section>${exampleBody}</section></article><article class="nui-site-frame"><header><h2>HTML snippet</h2><p class="nui-site-muted">Select and copy the source; it has no framework dependency.</p></header><pre class="nui-site-code"><code>${escapeHtml(snippet)}</code></pre></article></section><section class="card nui-stack"><h2>When to use</h2><p>Use this recipe when the named relationship is present and native flow alone does not communicate the intended grouping.</p><h2>When not to use</h2><p>${escapeHtml(whenNotToUse)}</p><h2>Native alternative</h2><p>${escapeHtml(nativeAlternative)}</p><p><a href="/recipes/">Back to all recipes</a></p></section>`,
  });
}
