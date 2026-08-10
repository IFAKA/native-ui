#!/usr/bin/env node
import { readFile } from "node:fs/promises";
import { analyzeHtml, analyzeFile, explainRule, formatJson, formatText, inferLayout } from "./analyzer/index.mjs";

const args = process.argv.slice(2), command = args.shift();
if (!command || !["analyze", "infer", "explain"].includes(command)) { console.error("Usage: native-ui analyze <file...> [--format=json] | native-ui infer <file...> [--format=json] | native-ui explain <rule-id>"); process.exit(2); }
if (command === "explain") { try { process.stdout.write(explainRule(args[0])); } catch (error) { console.error(error.message); process.exit(2); } }
else if (command === "infer") {
  const json = args.includes("--format=json"); const files = args.filter((a) => !a.startsWith("--"));
  try {
    const results = files.length ? await Promise.all(files.sort().map(async (file) => ({ file, ...inferLayout(await readFile(file, "utf8")) }))) : [{ file: "<stdin>", ...inferLayout(await new Promise((resolve, reject) => { let s = ""; process.stdin.setEncoding("utf8"); process.stdin.on("data", (c) => s += c); process.stdin.on("end", () => resolve(s)); process.stdin.on("error", reject); })) }];
    process.stdout.write(json ? `${JSON.stringify(results.length === 1 ? results[0] : results, null, 2)}\n` : results.map((r) => `${r.file}: ${r.recommendation ?? "no recommendation"} (${Math.round(r.confidence * 100)}%)\n${r.evidence.map((e) => `- ${e}`).join("\n")}`).join("\n"));
  } catch (error) { console.error(error.message); process.exit(2); }
}
else {
  const json = args.includes("--format=json"); const files = args.filter((a) => !a.startsWith("--"));
  try {
    const results = files.length ? await Promise.all(files.sort().map(analyzeFile)) : [analyzeHtml(await new Promise((resolve, reject) => { let s = ""; process.stdin.setEncoding("utf8"); process.stdin.on("data", (c) => s += c); process.stdin.on("end", () => resolve(s)); process.stdin.on("error", reject); }), {})];
    process.stdout.write(json ? `${JSON.stringify(results.length === 1 ? results[0] : results, null, 2)}\n` : results.map(formatText).join("\n"));
    if (results.some((r) => r.summary.errors)) process.exitCode = 1;
  } catch (error) { console.error(error.message); process.exit(2); }
}
