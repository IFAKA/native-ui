import { readFile } from "node:fs/promises";
export { inferLayout } from "./inference.mjs";

const rules = {
  "labels-required": { severity: "error", explanation: "Form controls need an associated label or accessible name.", recommendation: "Associate the control with a <label>, or provide a deliberate accessible name.", reference: "https://html.spec.whatwg.org/multipage/forms.html#the-label-element" },
  "image-alt": { severity: "error", explanation: "Images need alternative text unless they are explicitly decorative.", recommendation: "Add alt text, or use alt=\"\" for a decorative image.", reference: "https://html.spec.whatwg.org/multipage/embedded-content.html#alt" },
  "native-control": { severity: "warning", explanation: "A generic element is being used where a native control is available.", recommendation: "Use a native <button> or <a> so keyboard and fallback behavior remain available.", reference: "https://html.spec.whatwg.org/multipage/form-elements.html#the-button-element" },
  "interactive-name": { severity: "error", explanation: "Interactive controls need an accessible name.", recommendation: "Give the native control visible text or an accessible name.", reference: "https://www.w3.org/WAI/ARIA/apg/practices/names-and-descriptions/" },
  "aria-misuse": { severity: "warning", explanation: "ARIA may be replacing semantics already provided by HTML.", recommendation: "Prefer the native element and remove redundant or conflicting ARIA.", reference: "https://www.w3.org/TR/using-aria/" },
  "responsive-overflow": { severity: "warning", explanation: "Fixed-width or nowrap content can overflow narrow containers.", recommendation: "Allow intrinsic wrapping or use an explicitly owned overflow region.", reference: "https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-wrap" },
  "readable-width": { severity: "warning", explanation: "Long-form content has no readable measure contract.", recommendation: "Consider the documented .nui-readable contract for prose-heavy content.", reference: "https://www.w3.org/WAI/tutorials/page-structure/content/" },
  "touch-target": { severity: "warning", explanation: "A control may not provide a comfortable touch target.", recommendation: "Preserve the native control and ensure its CSS hit area is at least 44px.", reference: "https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html" },
  "ambiguous-composition": { severity: "warning", explanation: "A generic class suggests a composition without enough semantic context.", recommendation: "Use semantic HTML first, then select a documented Native UI composition explicitly.", reference: "./manifest.json" },
  "unnecessary-class": { severity: "warning", explanation: "A class appears to restate native semantics or behavior.", recommendation: "Remove the class if native HTML and the classless foundation already provide the contract.", reference: "./manifest.json" },
  "suspicious-javascript": { severity: "warning", explanation: "Inline JavaScript appears to control presentation or native state.", recommendation: "Prefer native controls, CSS selectors, and progressive enhancement for behavior gaps.", reference: "./docs/architecture.md" },
};

const controlTags = new Set(["input", "select", "textarea"]);
const interactiveTags = new Set(["button", "a", "summary"]);

function parse(html) {
  const nodes = [], stack = [];
  const re = /<!--[\s\S]*?-->|<![^>]*>|<\/?([a-z][\w:-]*)([^>]*)>/gi;
  for (const match of html.matchAll(re)) {
    const raw = match[0];
    if (raw.startsWith("<!--") || raw.startsWith("<!")) continue;
    const tag = match[1].toLowerCase();
    const closing = raw[1] === "/";
    if (closing) { const index = stack.map((n) => n.tag).lastIndexOf(tag); if (index >= 0) stack.splice(index); continue; }
    const attrs = Object.fromEntries([...match[2].matchAll(/([:\w-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g)].map((m) => [m[1].toLowerCase(), m[2] ?? m[3] ?? m[4] ?? ""]));
    const node = { tag, attrs, raw, index: match.index, parent: stack.at(-1) };
    nodes.push(node); if (!/^(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)$/i.test(tag) && !raw.endsWith("/")) stack.push(node);
  }
  return nodes;
}

function location(html, index) { const before = html.slice(0, index); return { line: before.split("\n").length, column: index - before.lastIndexOf("\n") }; }
function finding(ruleId, node, html, file, message = rules[ruleId].explanation) { const rule = rules[ruleId]; return { ruleId, severity: rule.severity, message, recommendation: rule.recommendation, reference: rule.reference, location: location(html, node.index), file }; }

export function analyzeHtml(html, { file = "<stdin>" } = {}) {
  if (typeof html !== "string") throw new TypeError("HTML input must be a string");
  const nodes = parse(html), ids = new Set(nodes.flatMap((n) => n.attrs.id ? [n.attrs.id] : []));
  const findings = [];
  for (const node of nodes) {
    const { tag, attrs } = node;
    if (controlTags.has(tag) && !attrs.hidden && !attrs.disabled && !attrs["aria-label"] && !attrs["aria-labelledby"] && !(attrs.id && html.match(new RegExp(`<label[^>]*for=["']${attrs.id}["']`, "i")))) findings.push(finding("labels-required", node, html, file));
    if (tag === "img" && attrs.alt === undefined) findings.push(finding("image-alt", node, html, file));
    if ((attrs.role === "button" || attrs.role === "link") && ((attrs.role === "button" && tag === "button") || (attrs.role === "link" && tag === "a"))) findings.push(finding("aria-misuse", node, html, file));
    if (attrs.class?.split(/\s+/).includes("btn") && tag !== "button" && tag !== "a") findings.push(finding("native-control", node, html, file));
    if ((interactiveTags.has(tag) || attrs.role === "button" || attrs.role === "link") && !attrs["aria-label"] && !attrs["aria-labelledby"] && !/>\s*[^<\s][\s\S]*<\//.test(node.raw)) findings.push(finding("interactive-name", node, html, file));
  }
  findings.sort((a, b) => a.location.line - b.location.line || a.location.column - b.location.column || a.ruleId.localeCompare(b.ruleId));
  return { version: 1, file, findings, summary: { errors: findings.filter((f) => f.severity === "error").length, warnings: findings.filter((f) => f.severity === "warning").length } };
}

export function formatJson(result) { return `${JSON.stringify(result, null, 2)}\n`; }
export function formatText(result) { return ["Native UI analysis", `${result.file}: ${result.summary.errors} error(s), ${result.summary.warnings} warning(s)`, ...result.findings.map((f) => `${f.file}:${f.location.line}:${f.location.column} ${f.severity} ${f.ruleId} — ${f.message}\n  Recommendation: ${f.recommendation}`), ""].join("\n"); }
export function explainRule(ruleId) { if (!rules[ruleId]) throw new Error(`Unknown analyzer rule: ${ruleId}`); return `${ruleId} [${rules[ruleId].severity}]\n${rules[ruleId].explanation}\nRecommendation: ${rules[ruleId].recommendation}\nReference: ${rules[ruleId].reference}\n`; }
export { rules };
export async function analyzeFile(file) { return analyzeHtml(await readFile(file, "utf8"), { file }); }
