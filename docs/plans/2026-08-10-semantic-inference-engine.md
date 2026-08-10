# Semantic Inference Engine Implementation Plan

> **For Codex:** Execute this plan task-by-task with test-first slices and keep the Native UI public contract manifest-backed.

**Goal:** Extend Native UI from deterministic diagnostics into an explainable, classless semantic inference engine that recommends the most suitable layout contract from ordinary HTML.

**Architecture:** The first release is development-time and recommendation-only. It analyzes element relationships, repetition, native semantics, content density, and layout signals without reading business meaning or mutating source. CSS and intrinsic layout remain responsible for viewport adaptation; runtime enhancement is deferred until a concrete interaction gap is proven.

**Tech Stack:** Dependency-free Node.js ESM, existing HTML tokenizer/analyzer, JSON manifest contracts, Node test runner.

---

### Task 1: Define inference result and confidence contracts — complete

**Files:**
- Modify: `src/manifest.schema.json`
- Modify: `src/manifest.json`
- Test: `tests/manifest.test.mjs`

Add a manifest-governed inference contract containing pattern ID, candidate capability, confidence, evidence, and author override behavior. Reject automatic application when confidence is below the documented threshold.

### Task 2: Add failing structural inference fixtures — complete

**Files:**
- Create: `tests/fixtures/inference/`
- Create: `tests/inference.test.mjs`

Add fixtures for a page shell, readable article, repeated article/card collection, form with field relationships, toolbar, and table overflow. Include negative cases where structure is ambiguous.

### Task 3: Implement structural pattern detection — complete

**Files:**
- Create: `src/analyzer/inference.mjs`
- Modify: `src/analyzer/index.mjs`
- Modify: `tests/inference.test.mjs`

Detect only structural evidence: native element types, sibling repetition, heading/content relationships, form labels, table semantics, and explicit author attributes. Never infer business meaning from text and never rewrite HTML.

### Task 4: Expose explainable inference output — complete

**Files:**
- Modify: `src/cli.mjs`
- Modify: `src/analyzer/index.mjs`
- Modify: `tests/analyzer.test.mjs`
- Modify: `site/guides/analyzer.html`

Add stable text and JSON output for recommendations, confidence, evidence, and the matching Native UI capability. Preserve existing analyzer output and exit-code behavior.

### Task 5: Add benchmark coverage and safety boundaries — complete

**Files:**
- Modify: `scripts/measure.mjs`
- Modify: `tests/measure.test.mjs`
- Modify: `docs/behavior-audit.md`
- Create: `docs/decisions/0010-semantic-inference-boundary.md`

Measure inference determinism and latency separately from browser runtime size. Document that inference is recommendation-only, does not inject classes, does not own layout measurement, and preserves the no-JavaScript path.

### Task 6: Evaluate before runtime enhancement — pending external evidence

Run the benchmark fixtures and manual review. Do not add runtime inference until representative users demonstrate that recommendations are useful and a concrete browser capability gap cannot be solved with semantic HTML and CSS.
