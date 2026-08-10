# native-ui

An experimental, browser-native interface foundation built from semantic HTML, small capability CSS, and progressive JavaScript.

```text
semantic HTML → browser defaults → tiny CSS → progressive behavior → local recipes
```

`native-ui` explores how much of a general-purpose UI library can disappear when the browser remains responsible for controls, semantics, state, accessibility, and responsive behavior.

> [!WARNING]
> This repository is an early `0.1.0` prototype. It is not published to npm and its public API is not stable yet.

## Direction

The intended result is a universal, framework-independent alternative to large CSS frameworks and component systems, with two hard constraints:

- the production CSS and optional behavior runtime should fit comfortably inside a conservative TCP initial-window budget;
- humans and AI agents should need the smallest possible public interface to produce correct UI.

The approved roadmap targets no more than two runtime imports, five layout classes, three action variants, one canonical recipe per capability, and a combined CSS + JavaScript budget of 12 KiB gzip.

Read the [universal agent-first plan](docs/plans/2026-08-10-universal-agent-first-native-ui-plan.md) for the intended `1.0.0` architecture and release criteria.

## Principles

1. Use native semantic HTML first.
2. Prefer native attributes and state over JavaScript state.
3. Use CSS only for missing layout or interface capability.
4. Use JavaScript only for behavior HTML cannot express.
5. Preserve one DOM and data model across screen sizes.
6. Keep branding and application logic outside the library.
7. Keep generated components internal until they are manually curated.
8. Treat every public selector, attribute, event, and byte as a cost.

The full invariants and layer boundaries are documented in [ARCHITECTURE.md](ARCHITECTURE.md).

## Current prototype

The repository currently contains:

- `core.css` for browser hardening without a reset or visual theme;
- intrinsic stack, cluster, grid, container, and readable-width layouts;
- small CSS contracts for missing capabilities;
- dependency-free ES modules for dialogs, menus, tabs, comboboxes, tooltips, toasts, carousels, and related interactions;
- semantic HTML recipes;
- a converter that reduces upstream shadcn HTML components to native-first candidates;
- architecture, behavior, conversion, and generated-output audits.

The [component matrix](COMPONENT_MATRIX.md) describes how current capabilities map to native HTML, composition, CSS, or progressive behavior.

## Explore locally

Requirements: a current Node.js release and npm.

```bash
git clone https://github.com/IFAKA/native-ui.git
cd native-ui
npm test
npm run test:converter
npm run audit:generated
```

The prototype can also be installed directly from GitHub for evaluation:

```bash
npm install github:IFAKA/native-ui
```

Current CSS exports:

```css
@import "native-ui-v0/core.css";
@import "native-ui-v0/layout.css";
@import "native-ui-v0/components.css";
```

Current progressive behavior export:

```js
import { enhanceDialogs, enhanceTabs } from "native-ui-v0/behavior";

enhanceDialogs(document);
enhanceTabs(document);
```

These prototype paths are expected to change before `1.0.0`.

## Source conversion

The project uses [`codylindley/shadcn-html`](https://github.com/codylindley/shadcn-html) as an upstream capability source under its MIT license. Conversion preserves useful semantics, structure, and behavior while removing the upstream visual system.

```bash
npm run sync:shadcn
npm run convert:shadcn
npm run audit:generated
```

Generated output is review material, not automatically trusted library API. See [PORTING.md](PORTING.md) and [SOURCES.md](SOURCES.md) for the conversion policy and provenance.

## Project status

The conversion pipeline and initial native contracts are in place. The next phase is to reduce the prototype to the agent-first public surface described in the roadmap, add real-browser accessibility testing, enforce transfer-size and API budgets, and prepare a stable package.

Issues and focused experiments are welcome while the API is still forming.
