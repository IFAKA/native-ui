import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const resolveProjectPath = (value, fallback) => path.resolve(projectRoot, value || fallback);
const source = resolveProjectPath(process.argv[2], "vendor/shadcn-html");
const out = resolveProjectPath(process.argv[3], "generated");
const contractsFile = resolveProjectPath(process.argv[4], "component-contracts.json");

// function cleanSelector(selector) {
//   return selector
//     .replace(/\[data-variant=(['"])[^'"]+\1\]/g, '')
//     .replace(/\[data-size=(['"])[^'"]+\1\]/g, '')
//     .replace(/\s+/g, ' ')
//     .trim()
// }

function cleanSelector(selector) {
  return [
    ...new Set(
      splitSelectorList(selector)
        .map((s) => rewriteSemanticSelector(s)
          .replace(/\[data-variant(?:=(['"])[^'"]*\1)?\]/g, "")
          .replace(/\[data-size(?:=(['"])[^'"]*\1)?\]/g, "")
          .replace(/\s+/g, " ")
          .trim())
        .filter(Boolean),
    ),
  ].join(", ");
}

function splitSelectorList(value) {
  const items = [];
  let start = 0;
  let paren = 0;
  let bracket = 0;
  let quote = null;
  let comment = false;
  for (let i = 0; i < value.length; i++) {
    const c = value[i];
    const n = value[i + 1];
    if (comment) {
      if (c === "*" && n === "/") {
        comment = false;
        i++;
      }
      continue;
    }
    if (!quote && c === "/" && n === "*") {
      comment = true;
      i++;
      continue;
    }
    if (quote) {
      if (c === "\\") i++;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === "'" || c === '"') {
      quote = c;
      continue;
    }
    if (c === "(") paren++;
    else if (c === ")") paren = Math.max(0, paren - 1);
    else if (c === "[") bracket++;
    else if (c === "]") bracket = Math.max(0, bracket - 1);
    else if (c === "," && paren === 0 && bracket === 0) {
      items.push(value.slice(start, i));
      start = i + 1;
    }
  }
  items.push(value.slice(start));
  return items;
}

function rewriteSemanticSelector(selector) {
  const semantic = new Map([
    ["btn", "button"], ["button", "button"], ["input", "input"],
    ["textarea", "textarea"], ["select", "select"],
    ["checkbox", 'input[type="checkbox"]'],
    ["radio", 'input[type="radio"]'],
    ["switch", 'input[type="checkbox"][role="switch"]'],
    ["label", "label"],
  ]);

  function rewriteCompound(compound) {
    const semanticClasses = [];
    const withoutSemantic = compound.replace(/\.([a-zA-Z_][\w-]*)/g, (all, name) => {
      if (!semantic.has(name)) return all;
      semanticClasses.push(name);
      return "";
    });
    if (!semanticClasses.length) return compound;
    const hasNativeTag = /^(?:[a-zA-Z][\w-]*)/.test(withoutSemantic);
    return hasNativeTag
      ? withoutSemantic
      : `${semantic.get(semanticClasses[0])}${withoutSemantic}`;
  }

  let out = "";
  let start = 0;
  let bracket = 0;
  let quote = null;
  for (let i = 0; i <= selector.length; i++) {
    const c = selector[i];
    if (quote) {
      if (c === "\\") i++;
      else if (c === quote) quote = null;
      continue;
    }
    if (c === "'" || c === '"') { quote = c; continue; }
    if (c === "[") bracket++;
    else if (c === "]") bracket = Math.max(0, bracket - 1);
    if (i === selector.length || (bracket === 0 && /[>+~\s,]/.test(c))) {
      out += rewriteCompound(selector.slice(start, i));
      if (i < selector.length) out += c;
      start = i + 1;
    } else if (c === "(") {
      let depth = 1;
      let j = i + 1;
      for (; j < selector.length && depth; j++) {
        if (selector[j] === "(") depth++;
        else if (selector[j] === ")") depth--;
      }
      out += rewriteCompound(selector.slice(start, i + 1));
      out += rewriteSemanticSelector(selector.slice(i + 1, j - 1));
      if (j <= selector.length) out += ")";
      i = j - 1;
      start = i + 1;
    }
  }
  return out;
}

function isThemeOrUtilitySelector(selector) {
  if (/(^|[\s>+~,(])(:root|\.dark|\.light)(?=$|[\s.#:[>+~,)])/.test(selector))
    return true;
  if (/(\[data-(?:theme|mode)=|\.theme[-_]|\.dark\b|\.light\b)/.test(selector))
    return true;

  const normalized = selector.replaceAll("\\", "");
  const utilityClass = /(?:^|[.:])(?:[!@#])?(?:bg|text|border|rounded|shadow|font|leading|tracking|opacity|transition|duration|ease|animate|ring|fill|stroke|space|divide|decoration|from|via|to|prose|sr-only|not-sr-only|aspect|columns|size)-[\w-[\]/%.:]+/;
  if (utilityClass.test(normalized)) return true;

  const classAttribute = /\[\s*class(?:~|\*|\^|\$|\|)?=[^\]]*\b(?:bg|text|border|rounded|shadow|font|leading|tracking|opacity|transition|duration|ease|animate|ring|fill|stroke|space|divide|decoration|from|via|to|prose|sr-only|not-sr-only|aspect|columns|size)-/;
  return classAttribute.test(normalized);
}

function resolveFallbackValue(value) {
  function resolveSegment(segment) {
    let result = "";
    for (let i = 0; i < segment.length;) {
      if (segment[i] === '"' || segment[i] === "'") {
        const quote = segment[i];
        let end = i + 1;
        for (; end < segment.length; end++) {
          if (segment[end] === "\\") end++;
          else if (segment[end] === quote) { end++; break; }
        }
        result += segment.slice(i, end);
        i = end;
        continue;
      }
      const start = segment.indexOf("var(", i);
      if (start < 0) return result + segment.slice(i);

      result += segment.slice(i, start);
      let depth = 1;
      let end = start + 4;
      while (end < segment.length && depth > 0) {
        if (segment[end] === "(") depth++;
        else if (segment[end] === ")") depth--;
        end++;
      }
      if (depth !== 0) return null;

      const inner = segment.slice(start + 4, end - 1);
      let split = -1;
      depth = 0;
      for (let j = 0; j < inner.length; j++) {
        if (inner[j] === "(") depth++;
        else if (inner[j] === ")") depth--;
        else if (inner[j] === "," && depth === 0) {
          split = j;
          break;
        }
      }
      const variable = (split < 0 ? inner : inner.slice(0, split)).trim();
      if (!/^--[\w-]+$/.test(variable) || split < 0) return null;
      const fallback = resolveSegment(inner.slice(split + 1).trim());
      if (fallback === null) return null;
      result += fallback;
      i = end;
    }
    return result;
  }

  return resolveSegment(value);
}

const nativeColorNames = new Set([
  "canvas", "canvastext", "buttonface", "buttontext", "field", "fieldtext",
  "highlight", "highlighttext", "graytext", "linktext", "visitedtext",
  "mark", "marktext", "accentcolor", "accentcolortext", "currentcolor",
  "inherit", "initial", "unset", "revert", "revert-layer", "transparent",
]);
const cssColorNames = new Set([
  "aliceblue", "antiquewhite", "aqua", "aquamarine", "azure", "beige", "bisque", "black", "blanchedalmond", "blue", "blueviolet", "brown", "burlywood", "cadetblue", "chartreuse", "chocolate", "coral", "cornflowerblue", "cornsilk", "crimson", "cyan", "darkblue", "darkcyan", "darkgoldenrod", "darkgray", "darkgreen", "darkgrey", "darkkhaki", "darkmagenta", "darkolivegreen", "darkorange", "darkorchid", "darkred", "darksalmon", "darkseagreen", "darkslateblue", "darkslategray", "darkslategrey", "darkturquoise", "darkviolet", "deeppink", "deepskyblue", "dimgray", "dimgrey", "dodgerblue", "firebrick", "floralwhite", "forestgreen", "fuchsia", "gainsboro", "ghostwhite", "gold", "goldenrod", "gray", "green", "greenyellow", "grey", "honeydew", "hotpink", "indianred", "indigo", "ivory", "khaki", "lavender", "lavenderblush", "lawngreen", "lemonchiffon", "lightblue", "lightcoral", "lightcyan", "lightgoldenrodyellow", "lightgray", "lightgreen", "lightgrey", "lightpink", "lightsalmon", "lightseagreen", "lightskyblue", "lightslategray", "lightslategrey", "lightsteelblue", "lightyellow", "lime", "limegreen", "linen", "magenta", "maroon", "mediumaquamarine", "mediumblue", "mediumorchid", "mediumpurple", "mediumseagreen", "mediumslateblue", "mediumspringgreen", "mediumturquoise", "mediumvioletred", "midnightblue", "mintcream", "mistyrose", "moccasin", "navajowhite", "navy", "oldlace", "olive", "olivedrab", "orange", "orangered", "orchid", "palegoldenrod", "palegreen", "paleturquoise", "palevioletred", "papayawhip", "peachpuff", "peru", "pink", "plum", "powderblue", "purple", "rebeccapurple", "red", "rosybrown", "royalblue", "saddlebrown", "salmon", "sandybrown", "seagreen", "seashell", "sienna", "silver", "skyblue", "slateblue", "slategray", "slategrey", "snow", "springgreen", "steelblue", "tan", "teal", "thistle", "tomato", "turquoise", "violet", "wheat", "white", "whitesmoke", "yellow", "yellowgreen",
]);

function hasUnsafeColorValue(value) {
  const withoutStrings = value.replace(/(['"])(?:\\.|(?!\1)[^\\])*\1/g, "");
  if (/(?:#[0-9a-f]{3,8}\b|(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color)\()/i.test(withoutStrings)) return true;
  for (const word of withoutStrings.toLowerCase().match(/[a-z][a-z-]*/g) || []) {
    if (cssColorNames.has(word) && !nativeColorNames.has(word)) return true;
  }
  return false;
}

function parseDeclarations(body, cssPolicy = "native-visual-denylist") {
  const kept = [];
  const dropped = [];
  for (const rawDeclaration of splitTopLevel(body)) {
    const raw = rawDeclaration.replace(/;\s*$/, "");
    const idx = raw.indexOf(":");
    if (idx < 0) continue;
    const prop = raw.slice(0, idx).trim();
    const value = raw.slice(idx + 1).trim();
    if (!prop || !value) {
      if (prop) dropped.push(prop);
      continue;
    }
    const resolved = /var\(\s*--[\w-]+/.test(value)
      ? resolveFallbackValue(value)
      : value;
    if (prop.startsWith("--") || (cssPolicy === "native-visual-denylist" && hasUnsafeColorValue(resolved || ""))) {
      dropped.push(prop);
      continue;
    }
    if (resolved !== null) kept.push(`  ${prop}: ${resolved};`);
    else dropped.push(prop);
  }
  return { kept, dropped };
}

function splitTopLevel(block) {
  const items = [];
  let start = 0;
  let depth = 0;
  let quote = null;
  let comment = false;
  for (let i = 0; i < block.length; i++) {
    const c = block[i];
    const n = block[i + 1];
    if (comment) {
      if (c === "*" && n === "/") {
        comment = false;
        i++;
      }
      continue;
    }
    if (!quote && c === "/" && n === "*") {
      comment = true;
      i++;
      continue;
    }
    if (quote) {
      if (c === "\\") {
        i++;
        continue;
      }
      if (c === quote) quote = null;
      continue;
    }
    if (c === '"' || c === "'") {
      quote = c;
      continue;
    }
    if (c === "(" || c === "[") depth++;
    else if (c === ")" || c === "]") depth = Math.max(0, depth - 1);
    else if (c === ";" && depth === 0) {
      items.push(block.slice(start, i + 1));
      start = i + 1;
    }
  }
  if (start < block.length) items.push(block.slice(start));
  return items;
}

function parseBlocks(css, start = 0, endChar = null) {
  const nodes = [];
  let i = start;
  let textStart = i;
  let quote = null;
  let comment = false;
  let paren = 0;
  let bracket = 0;
  while (i < css.length) {
    const c = css[i];
    const n = css[i + 1];
    if (comment) {
      if (c === "*" && n === "/") {
        comment = false;
        i += 2;
        continue;
      }
      i++;
      continue;
    }
    if (!quote && c === "/" && n === "*") {
      comment = true;
      i += 2;
      continue;
    }
    if (quote) {
      if (c === "\\") {
        i += 2;
        continue;
      }
      if (c === quote) quote = null;
      i++;
      continue;
    }
    if (c === '"' || c === "'") {
      quote = c;
      i++;
      continue;
    }
    if (c === "(") paren++;
    else if (c === ")") paren = Math.max(0, paren - 1);
    else if (c === "[") bracket++;
    else if (c === "]") bracket = Math.max(0, bracket - 1);
    if (paren || bracket) {
      i++;
      continue;
    }
    if (endChar && c === endChar) {
      const tail = css.slice(textStart, i).trim();
      if (tail) nodes.push({ type: "text", text: tail });
      return { nodes, next: i + 1 };
    }
    if (c === "{") {
      const rawPrelude = css.slice(textStart, i);
      const semi = rawPrelude.lastIndexOf(";");
      if (semi >= 0) {
        const declarations = rawPrelude.slice(0, semi + 1).trim();
        if (declarations) nodes.push({ type: "text", text: declarations });
      }
      const prelude = rawPrelude.slice(semi + 1).trim();
      const child = parseBlocks(css, i + 1, "}");
      nodes.push({ type: "block", prelude, children: child.nodes });
      i = child.next;
      textStart = i;
      continue;
    }
    i++;
  }
  const tail = css.slice(textStart).trim();
  if (tail) nodes.push({ type: "text", text: tail });
  return { nodes, next: i };
}

function declarationText(nodes) {
  return nodes
    .filter((n) => n.type === "text")
    .map((n) => n.text)
    .join("\n");
}

function combineSelectors(parent, child) {
  const children = splitSelectorList(child)
    .map((s) => s.trim())
    .filter(Boolean);
  if (!parent) return children;
  const parents = splitSelectorList(parent)
    .map((s) => s.trim())
    .filter(Boolean);
  const out = [];
  for (const p of parents)
    for (const c of children)
      out.push(c.includes("&") ? c.replaceAll("&", p) : `${p} ${c}`);
  return out;
}

function emitCapabilityRules(
  nodes,
  report,
  parentSelector = "",
  wrappers = [],
  contract = null,
) {
  const emitted = [];
  for (const node of nodes) {
    if (node.type !== "block") continue;
    const prelude = node.prelude.trim();
    if (!prelude) continue;
    if (prelude.startsWith("@layer")) {
      emitted.push(
        ...emitCapabilityRules(node.children, report, parentSelector, wrappers, contract),
      );
      continue;
    }
    if (/^@(media|container|supports|starting-style)\b/.test(prelude)) {
      const inner = emitCapabilityRules(node.children, report, parentSelector, [
        ...wrappers,
        prelude,
      ], contract);
      emitted.push(...inner);
      continue;
    }
    if (/^@(?:-webkit-)?keyframes\b/.test(prelude)) {
      const frames = [];
      for (const frame of node.children) {
        if (frame.type !== "block") continue;
        const { kept, dropped } = parseDeclarations(declarationText(frame.children), contract?.cssPolicy);
        report.droppedDeclarations.push(...dropped);
        if (kept.length) frames.push(`${frame.prelude} {\n${kept.join("\n")}\n}`);
      }
      if (frames.length) {
        emitted.push(`${prelude} {\n${frames.map((frame) => frame.split("\n").map((line) => `  ${line}`).join("\n")).join("\n")}\n}`);
      }
      continue;
    }
    if (prelude.startsWith("@")) {
      report.warnings.push(
        `Dropped unsupported at-rule: ${prelude.split(/\s+/)[0]}`,
      );
      continue;
    }

    if (isThemeOrUtilitySelector(prelude)) {
      report.droppedRules++;
      continue;
    }

    const selectors = combineSelectors(parentSelector, cleanSelector(prelude));
    const decls = declarationText(node.children);
    const { kept, dropped } = parseDeclarations(decls, contract?.cssPolicy);
    report.droppedDeclarations.push(...dropped);
    for (const selector of selectors) {
      if (!selector) continue;
      if (kept.length) {
        let rule = `${selector} {\n${kept.join("\n")}\n}`;
        for (let i = wrappers.length - 1; i >= 0; i--)
          rule = `${wrappers[i]} {\n${rule
            .split("\n")
            .map((l) => `  ${l}`)
            .join("\n")}\n}`;
        emitted.push(rule);
        report.keptRules++;
      } else if (kept.length || dropped.length) report.droppedRules++;
    }
    emitted.push(
      ...emitCapabilityRules(
        node.children.filter((n) => n.type === "block"),
        report,
        selectors.join(", "),
        wrappers,
        contract,
      ),
    );
  }
  return emitted;
}

function transformCss(css, name, contract) {
  const report = {
    component: name,
    keptRules: 0,
    droppedRules: 0,
    droppedDeclarations: [],
    warnings: [],
  };
  const parsed = parseBlocks(css.replace(/\/\*[\s\S]*?\*\//g, "")).nodes;
  const outRules = emitCapabilityRules(parsed, report, "", [], contract);
  const existingCss = outRules.join("\n\n");
  const minimumRules = (contract.minimumRules || []).map((rule) => {
    const declarations = Object.entries(rule.declarations || {})
      .map(([property, value]) => [property.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`), value])
      .filter(([property]) => !new RegExp(`${escapeRegExp(rule.selector)}\\s*\\{[\\s\\S]*?\\b${escapeRegExp(property)}\\s*:`).test(existingCss))
      .map(([property, value]) => `  ${property}: ${value};`)
      .join("\n");
    return declarations ? `${rule.selector} {\n${declarations}\n}` : "";
  }).filter(Boolean);
  if (minimumRules.length) outRules.push(...minimumRules);
  const header = `/* Generated from shadcn-html ${name}. Minimum structural/native styling only. */\n`;
  return {
    css: header + outRules.join("\n\n") + (outRules.length ? "\n" : ""),
    report,
  };
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function componentCatalogMarkdown(contracts, names) {
  const byName = new Map(contracts.map((contract) => [contract.name, contract]));
  const rows = names.map((name) => {
    const contract = byName.get(name);
    const assets = contract.assets?.join(", ") || "—";
    return `| [${name}](./${name}/index.html) | ${contract.category} | \`${contract.primitive}\` | ${contract.minimumStyles} | ${contract.behavior} | ${assets} |`;
  });
  return `# Component minimum-style contracts

Generated by scripts/convert-shadcn-html.mjs. Each row is the minimum capability contract for a usable native-looking preview; it is not a visual theme.

| Component | Capability layer | Native primitive | Minimum style | Required behavior | Assets |
| --- | --- | --- | --- | --- | --- |
${rows.join("\n")}
`;
}

function sanitizeHtml(html) {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<script\b[^>]*\/?>(?=\s|$)/gi, '')
    .replace(/\sstyle=(['"])[^'"]*\1/g, '');
}

function extractHtmlExamples(markdown) {
  return [...markdown.matchAll(/```html\s*\n([\s\S]*?)```/gi)]
    .map((match) => sanitizeHtml(match[1].trim()))
    .filter(Boolean)
    .map((html) => `${html}\n`);
}

function normalizeExampleReferences(html, component, exampleIndex) {
  const ids = new Map();
  for (const [, , id] of html.matchAll(/\bid=(['"])([^'"]+)\1/gi))
    ids.set(id, `${component}-example-${exampleIndex + 1}-${id}`);

  return html.replace(
    /\b(id|data-dialog-trigger|data-alert-dialog-trigger|data-sheet-trigger|data-context-menu|data-dropdown-trigger|data-tooltip-trigger|data-command-trigger|popovertarget|aria-controls|aria-labelledby|aria-describedby|for|href)=(['"])([^'"]*)\2/gi,
    (all, attribute, quote, value) => {
      if (attribute.toLowerCase() === "href" && !value.startsWith("#")) return all;
      const key = value.startsWith("#") ? value.slice(1) : value;
      const replacement = ids.get(key);
      if (!replacement) return all;
      return `${attribute}=${quote}${value.startsWith("#") ? `#${replacement}` : replacement}${quote}`;
    },
  );
}

function sanitizeImageSources(html) {
  return html.replace(
    /(<img\b[^>]*\bsrc=)(['"])([^'"]*)\2/gi,
    (all, prefix, quote, src) => {
      if (!src || src === "..." || src === "photo.jpg" || /example\.com/i.test(src))
        return `${prefix}${quote}../assets/placeholder.svg${quote}`;
      return all;
    },
  );
}

const inlineIcons = {
  "alert-triangle": '<path d="M12 3 2.5 20h19L12 3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  heart: '<path d="M20.8 8.6c0 5.4-8.8 10.4-8.8 10.4S3.2 14 3.2 8.6A4.6 4.6 0 0 1 12 6.1a4.6 4.6 0 0 1 8.8 2.5Z"/>',
  phone: '<path d="M6.6 3.5 9 3l2 4.5-2.2 1.6a15 15 0 0 0 6.1 6.1l1.6-2.2 4.5 2-.5 2.4a2 2 0 0 1-2.2 1.5C10.5 18 6 13.5 5.1 5.7a2 2 0 0 1 1.5-2.2Z"/>',
  save: '<path d="M5 3h12l2 2v16H5V3Z"/><path d="M8 3v6h8V3"/><path d="M8 21v-7h8v7"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
  settings: '<path d="M12 2v3M12 19v3M4.9 4.9 7 7M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1 7 17M17 7l2.1-2.1"/><circle cx="12" cy="12" r="4"/>',
  star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9L12 3Z"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
};

function convertInlineIcons(html) {
  return html.replace(/<i\b([^>]*\bdata-lucide=(['"])([^'"]+)\2[^>]*)><\/i>/gi, (all, attrs, quote, name) => {
    const cleanAttrs = attrs.replace(/\s*data-lucide=(['"])[^'"]+\1/i, '').trim();
    const body = inlineIcons[name] || '<circle cx="12" cy="12" r="8"/>';
    const labelled = /\baria-label\s*=|\brole\s*=\s*(["'])img\1/i.test(cleanAttrs);
    const defaults = [
      'viewBox="0 0 24 24"',
      /\bfill\s*=/.test(cleanAttrs) ? '' : 'fill="none"',
      /\bstroke\s*=/.test(cleanAttrs) ? '' : 'stroke="currentColor"',
      'stroke-linecap="round"',
      'stroke-linejoin="round"',
      labelled ? '' : 'aria-hidden="true"',
    ].filter(Boolean).join(' ');
    return `<svg ${cleanAttrs} ${defaults}>${body}</svg>`;
  });
}

function replaceEmptySvgPlaceholders(html) {
  return html.replace(/(<svg\b[^>]*>)\s*(?:\.\.\.|<!--[^>]*-->)\s*(<\/svg>)/gi, '$1<circle cx="12" cy="12" r="8"/>$2');
}

function addDeclarativePopoverTargets(html, component) {
  if (!['combobox', 'dropdown', 'tooltip', 'navigation-menu'].includes(component)) return html;
  return html.replace(/<button\b([^>]*?)(?:\sdata-(?:combobox|dropdown|tooltip)-trigger=(['"])([^'"]+)\2|\saria-controls=(['"])([^'"]+)\4)([^>]*)>/gi, (all, before, triggerQuote, triggerValue, controlsQuote, controlsValue, after) => {
    const target = controlsValue || triggerValue;
    const targetExists = target && (html.includes(`id="${target}"`) || html.includes(`id='${target}'`));
    if (!target || !targetExists || /\bpopovertarget\s*=/.test(all)) return all;
    return `<button${before}${triggerQuote ? ` data-${component}-trigger=${triggerQuote}${triggerValue}${triggerQuote}` : ''}${controlsQuote ? ` aria-controls=${controlsQuote}${controlsValue}${controlsQuote}` : ''}${after} popovertarget="${target.replace(/^#/, '')}">`;
  });
}

function ensureTooltipTargets(html) {
  if (!html.includes('data-tooltip-trigger=')) return html
  const missing = new Set()
  for (const [, , value] of html.matchAll(/data-tooltip-trigger=(['"])([^'"]+)\1/gi)) {
    const id = value.replace(/^#/, '')
    if (!new RegExp(`\\bid=(['"])${escapeRegExp(id)}\\1`, 'i').test(html)) missing.add(id)
  }
  const wired = html.replace(/<button\b([^>]*data-tooltip-trigger=(['"])([^'"]+)\2[^>]*)>/gi, (all, attrs, quote, value) => {
    const id = value.replace(/^#/, '')
    const target = `popovertarget="${id}" aria-describedby="${id}"`
    return /\bpopovertarget=/.test(all) ? all : `<button${attrs} ${target}>`
  })
  return missing.size ? `${wired}\n${[...missing].map((id) => `<div class="tooltip" id="${id}" popover="hint" role="tooltip">Tooltip</div>`).join('\n')}` : wired
}

function normalizeNativeMarkup(html, component) {
  if (component === 'context-menu') {
    return html.replace(/(<(?:div|section|ul)\b[^>]*class=")([^"]+)("[^>]*>)/gi, (all, prefix, classes, suffix) => {
      if (!/(^|\s)context-menu(\s|$)/.test(classes) || /\brole=/.test(suffix)) return all
      return `${prefix}${classes}${suffix.slice(0, -1)} role="menu">`
    })
  }
  if (component === 'sortable' && /^\s*<li\b[^>]*class="[^"]*sortable-item/.test(html))
    return `<ul class="sortable" role="listbox" aria-label="Sortable items">${html}</ul>`
  if (component === 'tree-view')
    return html.replace(/\saria-expanded="(?:true|false)"/gi, '')
  if (component === 'toast')
    return html.replace(/(<(?:div|section)\b[^>]*class="[^"]*toast-container[^"]*"[^>]*)(>)/i, '$1 data-toast-region$2')
      .replace(/\bhref="#"/gi, 'href="../index.html"')
  if (component === 'navigation-menu') return html.replace(/\bhref="#"/gi, 'href="../index.html"')
  return html
}

const nativeBehaviorModules = new Map([
  ["alert-dialog", { module: "dialog.js", exportName: "enhanceDialogs", selector: null }],
  ["calendar", { module: "calendar.js", exportName: "enhanceCalendar", selector: ".calendar" }],
  ["carousel", { module: "carousel.js", exportName: "enhanceCarousel", selector: ".carousel" }],
  ["combobox", { module: "combobox.js", exportName: "enhanceCombobox", selector: ".combobox" }],
  ["command", { module: "command.js", exportName: "enhanceCommand", selector: null }],
  ["context-menu", { module: "context-menu.js", exportName: "enhanceContextMenus", selector: null }],
  ["dropdown", { module: "dropdown.js", exportName: "enhanceDropdown", selector: null }],
  ["dialog", { module: "dialog.js", exportName: "enhanceDialogs", selector: null }],
  ["sheet", { module: "dialog.js", exportName: "enhanceDialogs", selector: null }],
  ["sortable", { module: "sortable.js", exportName: "enhanceSortable", selector: null }],
  ["tabs", { module: "tabs.js", exportName: "enhanceTabs", selector: null }],
  ["toast", { module: "toast.js", exportName: "enhanceToasts", selector: null }],
  ["toggle", { module: "toggle.js", exportName: "enhanceToggles", selector: null }],
  ["toggle-group", { module: "toggle.js", exportName: "enhanceToggles", selector: null }],
  ["toolbar", { module: "toolbar.js", exportName: "enhanceToolbars", selector: null }],
  ["tooltip", { module: "tooltip.js", exportName: "enhanceTooltips", selector: null }],
]);

function nativeBehaviorScript(name) {
  const behavior = nativeBehaviorModules.get(name);
  if (!behavior) return null;
  const call = behavior.selector
    ? `document.querySelectorAll(${JSON.stringify(behavior.selector)}).forEach((root) => ${behavior.exportName}(root));`
    : `${behavior.exportName}(document);`;
  return `import { ${behavior.exportName} } from "../native-ui/behavior/${behavior.module}";\n\n${call}\n`;
}

async function exists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function findFirstCss(dir) {
  if (!(await exists(dir))) return null;
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const candidate = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const nested = await findFirstCss(candidate);
      if (nested) return nested;
    } else if (entry.name.endsWith('.css')) {
      return candidate;
    }
  }
  return null;
}

function componentDocument(name, html, hasCss, hasJs) {
  const css = hasCss ? `  <link rel="stylesheet" href="./${name}.css">\n` : '';
  const js = hasJs ? `  <script type="module" src="./${name}.js"></script>\n` : '';
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${name}</title>
  <link rel="stylesheet" href="../native-ui/core.css">
  <link rel="stylesheet" href="../native-ui/layout.css">
  <link rel="stylesheet" href="../native-ui/components.css">
${css}</head>
<body>
  <main class="container readable stack">
  <nav><a href="../index.html">All components</a></nav>
  <header class="stack"><h1>${name}</h1></header>
${html}
  </main>
${js}</body>
</html>
`;
}

function galleryDocument(names) {
  const links = names.map((name) => `<li><a href="${name}/index.html">${name}</a></li>`).join('\n');
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Generated components</title>
  <link rel="stylesheet" href="./native-ui/core.css">
  <link rel="stylesheet" href="./native-ui/layout.css">
  <link rel="stylesheet" href="./native-ui/components.css">
</head>
<body>
  <main class="container readable stack">
  <h1>Generated components</h1>
  <ul>
${links}
  </ul>
  </main>
</body>
</html>
`;
}
async function copyFramework(out) {
  const frameworkDir = path.join(out, "native-ui");
  await fs.mkdir(frameworkDir, { recursive: true });
  for (const file of ["core.css", "layout.css", "components.css"]) {
    await fs.copyFile(path.join(projectRoot, "src", file), path.join(frameworkDir, file));
  }
  await fs.mkdir(path.join(out, "assets"), { recursive: true });
  await fs.copyFile(path.join(projectRoot, "src/assets/placeholder.svg"), path.join(out, "assets/placeholder.svg"));
  const behaviorDir = path.join(frameworkDir, "behavior");
  await fs.mkdir(behaviorDir, { recursive: true });
  for (const moduleName of new Set([...nativeBehaviorModules.values()].map(({ module }) => module))) {
    await fs.copyFile(path.join(projectRoot, "src/behavior", moduleName), path.join(behaviorDir, moduleName));
  }
}

async function main() {
  const componentsRoot = path.join(source, "dist/components");
  if (!(await exists(componentsRoot)))
    throw new Error(`Expected ${componentsRoot}`);
  const contracts = JSON.parse(await fs.readFile(contractsFile, "utf8"));
  const contractNames = contracts.map((contract) => contract.name);
  if (new Set(contractNames).size !== contractNames.length)
    throw new Error("component-contracts.json contains duplicate names");
  await fs.rm(out, { recursive: true, force: true });
  await fs.mkdir(out, { recursive: true });

  const names = (await fs.readdir(componentsRoot, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
  const missingContracts = names.filter((name) => !contractNames.includes(name));
  const staleContracts = contractNames.filter((name) => !names.includes(name));
  if (missingContracts.length || staleContracts.length) {
    throw new Error(`component contract mismatch: missing=${missingContracts.join(",") || "none"}; stale=${staleContracts.join(",") || "none"}`);
  }
  const reports = [];
  for (const name of names) {
    const srcDir = path.join(componentsRoot, name);
    const dstDir = path.join(out, name);
    const contract = contracts.find((entry) => entry.name === name);
    await fs.mkdir(dstDir, { recursive: true });
    const files = await fs.readdir(srcDir);
    const cssFile = files.find((f) => f.endsWith(".css"));
    const skillFile = files.find((f) => f === "component-skill.md");
    const nativeJs = nativeBehaviorScript(name);
    const componentReport = {
      component: name,
      css: null,
      js: Boolean(nativeJs),
      recipe: false,
      warnings: [],
      contract: {
        category: contract.category,
        primitive: contract.primitive,
        minimumStyles: contract.minimumStyles,
        behavior: contract.behavior,
        assets: contract.assets || [],
        cssPolicy: contract.cssPolicy,
      },
    };

    if (cssFile) {
      const original = await fs.readFile(path.join(srcDir, cssFile), "utf8");
      const transformed = transformCss(original, name, contract);
      await fs.writeFile(path.join(dstDir, `${name}.css`), transformed.css);
      componentReport.css = transformed.report;
    }
    if (nativeJs) {
      await fs.writeFile(path.join(dstDir, `${name}.js`), nativeJs);
    }
    if (skillFile) {
      const skill = await fs.readFile(path.join(srcDir, skillFile), "utf8");
      const examples = extractHtmlExamples(skill)
        .map((html, index) => normalizeNativeMarkup(replaceEmptySvgPlaceholders(convertInlineIcons(addDeclarativePopoverTargets(ensureTooltipTargets(sanitizeImageSources(normalizeExampleReferences(html, name, index))), name))), name));
      if (examples.length) {
        await fs.writeFile(
          path.join(dstDir, "component.html"),
          examples.join("\n"),
        );
        await fs.writeFile(
          path.join(dstDir, "index.html"),
          componentDocument(name, examples.map((html, index) => `<section><h2>Example ${index + 1}</h2>${html}</section>`).join("\n"), Boolean(cssFile), Boolean(nativeJs)),
        );
        componentReport.recipe = true;
      }
    }
    reports.push(componentReport);
  }

  await fs.writeFile(
    path.join(out, "conversion-report.json"),
    JSON.stringify(
      {
        source: reportSource(process.argv[2]),
        count: names.length,
        components: reports,
      },
      null,
      2,
    ) + "\n",
  );
  const catalog = componentCatalogMarkdown(contracts, names);
  await fs.writeFile(path.join(out, "COMPONENT_MINIMUM_STYLES.md"), catalog);
  if (path.basename(out) === "generated") {
    await fs.writeFile(path.join(projectRoot, "COMPONENT_MINIMUM_STYLES.md"), catalog);
  }
  await copyFramework(out);
  await fs.writeFile(path.join(out, "index.html"), galleryDocument(names));
  console.log(`converted ${names.length} components -> ${out}`);
}

function reportSource(argument) {
  if (!argument) return "vendor/shadcn-html";
  if (!path.isAbsolute(argument)) return argument.split(path.sep).join("/");
  const absolute = path.resolve(projectRoot, argument);
  const relative = path.relative(projectRoot, absolute);
  return relative && !relative.startsWith(".." + path.sep) && relative !== ".."
    ? relative.split(path.sep).join("/")
    : "external-source";
}

main().catch((err) => {
  console.error(err.stack || err);
  process.exit(1);
});
