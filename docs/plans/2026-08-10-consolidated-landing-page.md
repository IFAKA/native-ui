# Consolidated Landing Page Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the current Native UI homepage with a curated landing page that combines Pith's product proof, Barebones' modularity story, shadcn-html's AI-oriented component explanation, and Native UI Next's evidence-led positioning.

**Architecture:** Keep `src/` and the public Native UI manifest unchanged. Treat `site/index.html` and `site/styles.css` as the consuming application layer, preserve the shared build-time shell, and let `public/` remain generated output. Use semantic HTML, existing `nui-*` contracts, page-local `nui-site-*` composition, and native controls; retain only the existing optional site JavaScript if the new page needs no behavior beyond links and a native form.

**Tech Stack:** Static HTML, framework-free CSS, Node build scripts, Node test runner, Playwright browser contracts.

---

### Task 1: Freeze the landing-page contract with a failing test

**Files:**
- Modify: `tests/site-build.test.mjs`
- Test: `tests/site-build.test.mjs`

1. Add assertions that the generated homepage contains the new agent-first hero, proof metrics, semantic product surface, modular-layer explanation, and evidence call to action.
2. Run `node --test tests/site-build.test.mjs` and confirm the new assertions fail against the current homepage.

### Task 2: Implement the curated semantic homepage

**Files:**
- Modify: `site/index.html`

1. Replace the short homepage body with one semantic document: hero, proof metrics, live product surface, three-layer explanation, AI/component-skills explanation, and evidence CTA.
2. Keep links, headings, labels, form semantics, source-order meaning, and JavaScript-disabled usefulness intact.
3. Do not add a new public Native UI selector, attribute, export, dependency, or runtime behavior.

### Task 3: Add restrained page-local visual direction

**Files:**
- Modify: `site/styles.css`

1. Add the editorial browser-material treatment with an accent rule, responsive split layouts, readable code surfaces, and a compact metrics rail.
2. Use mobile-first intrinsic sizing and the same DOM at larger widths.
3. Preserve focus visibility, forced colors, dark mode, reduced motion, long-text wrapping, and 320px usability.

### Task 4: Verify and regenerate the static artifact

**Files:**
- Generated: `public/index.html`, `public/styles.css`

1. Run `npm test` so the build regenerates `public/` and all unit/check suites execute.
2. Run `npm run test:browser-contract` and inspect the homepage assertions, narrow layout, and reduced-motion path.
3. Review the generated diff to ensure only intended homepage/output files changed; do not stage unrelated pre-existing worktree files.

### Task 5: Commit and publish the scoped change

**Files:**
- Stage only the plan, homepage source/style, test, and generated homepage/style files.

1. Create one focused commit with an explicit file list and no amend/no-verify flags.
2. Push the current `main` branch to its configured remote without force-pushing.
