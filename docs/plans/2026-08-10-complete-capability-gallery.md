# Complete Capability Gallery Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the `/examples/` route visibly demonstrate every public Native UI layout, composition, and action variant.

**Architecture:** Keep the homepage as the product introduction and make the examples route the visual catalog. Reuse the existing manifest vocabulary, native elements, composition classes, and recipe links; add only page-local `nui-site-*` presentation rules and a coverage test that compares visible catalog entries with the manifest.

**Tech Stack:** Static semantic HTML, framework-free CSS, Node test runner, deterministic static-site build.

---

### Task 1: Add a failing coverage contract

**Files:**
- Modify: `tests/docs.test.mjs`

1. Assert that every manifest layout appears in a visible layout specimen.
2. Assert that every manifest composition has a visible specimen heading and a canonical recipe link.
3. Assert that all three variants appear as visible controls.
4. Run `node --test tests/docs.test.mjs` and confirm the new assertions fail against the current text-list-only coverage.

### Task 2: Build the complete visual catalog

**Files:**
- Modify: `site/examples/index.html`

1. Add a dedicated layout gallery with five live specimens.
2. Add ten composition specimens using real semantic markup and the existing composition classes.
3. Add a variant matrix showing primary, danger, and quiet states on native buttons/links.
4. Link each composition specimen to its canonical `/recipes/<name>/` page.
5. Keep dialog, popover, disclosure, forms, tables, and progress examples native and usable without custom application state.

### Task 3: Style catalog-specific presentation

**Files:**
- Modify: `site/styles.css`

1. Add mobile-first catalog cards, specimen stages, labels, source links, and variant rows.
2. Preserve narrow widths, focus, forced colors, dark mode, reduced motion, and readable overflow behavior.
3. Keep all new selectors in the site-local `nui-site-*` namespace.

### Task 4: Verify generated output

**Files:**
- Generated: `public/examples/index.html`, `public/styles.css`

1. Run `npm test` to regenerate and validate the static site.
2. Run `npm run test:browser-contract` and inspect the catalog coverage assertions.
3. Review the diff to ensure no unrelated worktree files are included.
