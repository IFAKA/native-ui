# Native UI — semantic HTML CSS framework

**Write HTML. Get an interface people want to use.**

Native UI is a lightweight, framework-independent CSS UI system for building attractive, accessible, responsive interfaces with semantic HTML. It provides classless HTML styling, intrinsic responsive layouts, accessible form and table defaults, dark mode, and optional progressive enhancement without runtime dependencies.

```html
<link rel="stylesheet" href="native-ui.css">

<form>
  <label>
    Email
    <input type="email" required autocomplete="email">
  </label>
  <button type="submit">Save</button>
</form>
```

## Why

The browser already provides semantics, controls, validation, disclosure, dialogs, popovers, tables, progress, media, focus, and keyboard behavior. Native UI keeps those strengths and supplies the presentation HTML cannot express: visual hierarchy, rhythm, responsive layout, coherent states, and restrained polish.

```text
semantic HTML
→ classless visual foundation
→ adaptive CSS
→ optional progressive behavior
→ author control
```

## Project status

This repository is a clean pre-1.0 foundation. The public API is intentionally frozen only after the specification, browser policy, accessibility contracts, benchmark pages, and size budgets pass their review gates.

- Product: **Native UI**
- Planned npm package: **`@ifaka/native-ui`**
- Runtime dependencies: **zero**
- Target budget: **CSS + optional JavaScript ≤ 12 KiB gzip**
- Canonical plan: [`docs/plans/2026-08-10-native-ui-1.0-implementation-plan.md`](docs/plans/2026-08-10-native-ui-1.0-implementation-plan.md)
- Foundation spec: [`specs/001-native-ui-foundation/spec.md`](specs/001-native-ui-foundation/spec.md)
- Documentation site: [`site/index.html`](site/index.html)

## Intended API

Native elements are classless by default. Classes describe layout or compositions that HTML cannot express; attributes describe explicit variants or enhancement intent.

```html
<main class="nui-container">
  <section class="nui-grid">
    <article class="card">...</article>
    <article class="card">...</article>
  </section>

  <button data-variant="danger">Delete</button>
</main>
```

Interactive patterns use native APIs first. Ambiguous compound widgets opt in explicitly:

```html
<div data-nui="tabs">...</div>
```

## Development

Requires Node.js 22.14 or newer.

```sh
npm install
npm test
npm run pack:check
```

## Public site

Build the package and deterministic Vercel artifact with `npm run build`; the
static output is `public/`. Preview it with `python3 -m http.server 4173
--directory public`, then open `http://127.0.0.1:4173`. Vercel uses the
repository root, `npm run build`, and `public` as its output directory.

Read [`CONTRIBUTING.md`](CONTRIBUTING.md) before proposing changes. New public selectors, attributes, events, exports, dependencies, or behavior require a specification and tests.

## Principles

1. Semantic HTML before abstractions.
2. CSS for presentation and responsive adaptation.
3. JavaScript only for missing interaction semantics or connected state.
4. One DOM and data model across viewports.
5. Attractive defaults with explicit author override.
6. Accessibility, failure behavior, and compatibility are release requirements.
7. Every public token is a permanent cost.

## License

[MIT](LICENSE)
