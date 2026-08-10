const navigation = [
  ["lab", "/lab/", "Lab"],
  ["examples", "/examples/", "Examples"],
  ["recipes", "/recipes/", "Recipes"],
  ["guides", "/guides/", "Guides"],
  ["benchmarks", "/benchmarks/", "Evidence"],
];

function escapeAttribute(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

export function renderPage({ title, description, canonicalPath, body, active = "", scripts = "" }) {
  const links = navigation.map(([key, href, label]) => `<a href="${href}"${active === key ? ' aria-current="page"' : ""}>${label}</a>`).join("");
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escapeAttribute(description)}">
  <link rel="canonical" href="https://native-ui.example${canonicalPath}">
  <meta property="og:title" content="${escapeAttribute(title)}"><meta property="og:description" content="${escapeAttribute(description)}"><meta property="og:image" content="/assets/social-preview.svg"><meta property="og:type" content="website">
  <link rel="icon" href="/favicon.svg"><link rel="stylesheet" href="/assets/native-ui/native-ui.css"><link rel="stylesheet" href="/styles.css">
  <title>${escapeAttribute(title)}</title>
</head>
<body>
  <a class="nui-site-skip" href="#main">Skip to content</a>
  <header class="nui-site-header" data-nui-site-shell><div class="nui-site-shell nui-site-header-inner"><nav class="nui-site-nav responsive-navigation" aria-label="Primary"><a class="nui-site-brand" href="/"${active === "home" ? ' aria-current="page"' : ""}>Native UI</a><nav class="nui-site-nav-links nui-cluster" aria-label="Site">${links}<a data-variant="primary" href="https://github.com/IFAKA/native-ui">GitHub</a></nav></nav></div></header>
  <main id="main" class="nui-site-shell nui-site-main nui-stack">${body}</main>
  <footer class="nui-site-shell nui-site-footer"><small>Native UI · <a href="/changelog.html">Changelog</a> · <a href="/roadmap.html">Roadmap</a> · <a href="https://github.com/IFAKA/native-ui">GitHub</a></small></footer>
${scripts ? `${scripts}\n` : ""}
</body>
</html>`;
}
