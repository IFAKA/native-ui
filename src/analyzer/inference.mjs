const tags = (html, tag) => [...html.matchAll(new RegExp(`<${tag}\\b`, "gi"))].length;
const textLength = (html) => html.replace(/<[^>]*>/g, " ").replace(/\\s+/g, " ").trim().length;

function recommendation(name, confidence, evidence, rationale) {
  return { recommendation: name, confidence: Number(confidence.toFixed(2)), evidence, rationale };
}

/**
 * Recommend existing Native UI contracts from structural HTML evidence.
 * This is intentionally conservative: it does not infer business meaning or mutate source.
 */
export function inferLayout(html) {
  if (typeof html !== "string") throw new TypeError("HTML input must be a string");
  const candidates = [];
  const articleCount = tags(html, "article");
  const formCount = tags(html, "form");
  const tableCount = tags(html, "table");
  const buttonCount = tags(html, "button") + tags(html, "a");
  const headings = tags(html, "h1") + tags(html, "h2") + tags(html, "h3");

  if (formCount) candidates.push(recommendation("field-actions", 0.92, ["A native form groups associated fields and actions."], "Use the existing form composition so fields and actions wrap intrinsically."));
  if (tableCount) candidates.push(recommendation("table-overflow", 0.94, ["A table may exceed a narrow inline viewport."], "Give the table an owned overflow region while preserving table semantics."));
  if (articleCount >= 3) candidates.push(recommendation("nui-grid", 0.91, ["Repeated article elements indicate a collection of similar content."], "Use the intrinsic grid contract; let available inline space determine columns."));
  if (articleCount === 1 && textLength(html) >= 500 && headings) candidates.push(recommendation("nui-readable", 0.9, ["An article contains a heading and substantial prose."], "Constrain prose to the documented readable measure."));
  if (buttonCount >= 2 && !formCount && !tableCount) candidates.push(recommendation("toolbar", 0.72, ["Multiple native actions appear together."], "Consider the wrapping toolbar composition when the actions form one group."));

  return { version: 1, recommendation: candidates[0]?.recommendation ?? null, confidence: candidates[0]?.confidence ?? 0, evidence: candidates[0]?.evidence ?? [], recommendations: candidates };
}
