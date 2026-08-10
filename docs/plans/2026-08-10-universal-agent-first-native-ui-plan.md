# Universal Agent-First Native UI Plan

## Summary

Build `native-ui` as a universal alternative to Bootstrap, Tailwind, and shadcn: applicable to any website or application, framework-independent, browser-native, and optimized for the smallest possible API surface.

The complete default CSS and progressive JavaScript must fit within one conservative TCP initial-window budget:

- Hard artifact budget: **12 KiB combined gzip**.
- Reserved transport allowance: approximately 2 KiB for headers and protocol overhead.
- Report gzip and Brotli sizes separately.
- Recipes, documentation, and development metadata are excluded because they are not sent to users.

This budget enables, but cannot guarantee, one-window delivery because network and server behavior vary.

## Minimal public API

Publish one package with two runtime entry points:

```json
{
  ".": "./dist/core.css",
  "./behavior.js": "./dist/behavior.js"
}
```

Typical use:

```css
@import "native-ui";
```

```js
import "native-ui/behavior.js"; /* only when interactive recipes need it */
```

Enforce these limits:

- Two runtime imports.
- Five layout classes:
  - `nui-container`
  - `nui-readable`
  - `nui-stack`
  - `nui-cluster`
  - `nui-grid`
- Three optional action variants:
  - `data-variant="primary"`
  - `data-variant="danger"`
  - `data-variant="quiet"`
- One canonical recipe per capability.
- One behavior runtime.
- No aliases, utility-class generation, arbitrary values, role-repeating classes, or component variants that duplicate native HTML.

Internal source may remain split into maintainable layers, but only the compiled `core.css` is public.

## Native-first component model

Use this fixed decision order:

1. Semantic native element.
2. Native attribute, state, or relationship.
3. CSS parent/sibling context.
4. One of the five layout classes.
5. Canonical recipe.
6. Light-DOM `nui-*` behavior only if HTML cannot express the interaction.

Examples:

- Use `<button>`, never `.nui-button`.
- Use `<details><summary>`, not a JavaScript accordion.
- Use `<dialog>`, then enhance only missing orchestration.
- Use native validation, `required`, `disabled`, `readonly`, and `aria-live`.
- Use `<nav>`, `<table>`, `<progress>`, `<output>`, and real links before ARIA roles.
- Do not use Shadow DOM or generate required semantic content.
- Do not ship branding, application data models, API clients, analytics, routing, or business logic.

## Universal capability inventory

Curate one domain-neutral recipe for each broadly reusable need:

- Foundations: typography, links, media, code, lists, focus, disabled, invalid, readonly, selection, reduced motion, and forced colors.
- Forms: labeled fields, fieldsets, validation summaries, search, file input, select, range, progress, and grouped actions.
- Layout: readable content, stacks, clusters, responsive grids, containers, application shells, and overflow handling.
- Navigation: primary navigation, breadcrumbs, pagination, tabs, disclosure navigation, and menus.
- Data: tables, statistics, timelines, cards, badges, lists, loading, empty, error, and status states.
- Overlays: dialog, confirmation dialog, drawer, popover, tooltip, command palette, and context menu.
- Feedback: alert, toast, spinner, skeleton, live status, and progress.
- Interaction: combobox, dropdown, carousel, sortable list, toggle group, OTP input, and resizable regions.

Static capabilities are recipes, not components. Only interactions that cannot remain declarative enter `behavior.js`.

Generated shadcn conversions remain internal candidate material. They must be manually reduced before becoming public recipes.

## Agent-optimized interface

### Single manifest

Add one machine-readable `manifest.json` containing:

- Runtime imports.
- Five layout classes.
- Three variants.
- Canonical recipe names.
- Required native primitives.
- Whether JavaScript is needed.
- Supported states and events.

This manifest is the source for audits and generated documentation.

### Recipe structure

Each capability has exactly:

```text
recipes/<name>/
  metadata.json
  snippet.html
  example.html
```

Agents read:

1. `manifest.json`.
2. The selected recipe's `metadata.json`.
3. Its `snippet.html`.

They should not need the complete README, showcase, or unrelated component documentation.

### Agent skill

Ship a concise `native-ui` skill that:

- Teaches the six-step decision order.
- Directs discovery through `manifest.json`.
- Forbids undocumented selectors and variants.
- Requires semantic HTML, labels, keyboard use, visible focus, 44px targets, and growth states.
- Instructs agents to load only the selected recipe.
- Avoids duplicating the component catalog in prose.

Keep the skill short and progressively disclose recipe information. Provide generic `AGENTS.md` rules without coupling to Codex, Claude, or a specific framework.

Do not create an inference engine, registry service, natural-language CLI, or framework-specific generator.

## Size and SNR enforcement

### Transfer budgets

CI must build minified production artifacts and enforce:

```text
core.css gzip + behavior.js gzip <= 12,288 bytes
```

Also report:

- Raw, gzip, and Brotli size per artifact.
- Combined size.
- Change from the latest release.
- Contribution by internal module.

A size increase requires removing equivalent weight elsewhere or an explicit major-version architecture decision.

### Public-surface audit

CI reports and limits:

- Runtime exports: 2.
- Layout classes: 5.
- Action variants: 3.
- Duplicate capabilities: 0.
- Role-repeating selectors: 0.
- Undocumented selectors, attributes, elements, and events: 0.
- External runtime dependencies: 0.

No new public symbol may appear without updating the manifest, tests, recipe, and changelog.

## Validation

- Test Chromium, Firefox, and WebKit with Playwright.
- Verify keyboard use, focus restoration, native form submission, dynamic insertion, repeated initialization, reduced motion, forced colors, 200% zoom, and narrow layouts.
- Verify semantic content and native actions without JavaScript.
- Test long labels, dense content, empty values, missing media, errors, and translated text growth.
- Run automated accessibility checks and structural screenshot tests.
- Validate the packed npm artifact rather than repository source.
- Test direct CSS import, optional JS import, tree-shaking, CSP compatibility, and repeated behavior loading.

### Agent SNR evaluations

Give clean agents representative tasks such as:

- Registration form.
- Responsive navigation.
- Accessible dialog.
- Dashboard table.
- Command palette.
- Content cards and feedback states.

Release only when agents consistently:

- Select an existing recipe.
- Inspect no more than the manifest and relevant recipe.
- Use no undocumented API.
- Avoid unnecessary CSS and JavaScript.
- Produce semantic, keyboard-usable markup.
- Require fewer corrections than equivalent Bootstrap, Tailwind, or shadcn tasks.

## Release criteria

Release `1.0.0` only when:

- The combined default transfer remains within 12 KiB gzip.
- All public contracts are represented in the manifest.
- Every capability has one canonical implementation.
- Public API, size, accessibility, package, and browser checks pass.
- Agent evaluations demonstrate the intended low-context workflow.
- No ecommerce, framework, brand, or application coupling exists.

## Assumptions

- Modern evergreen browsers only.
- Browser-native visual differences are intentional.
- Applications may add branding in their own CSS layer.
- `native-ui` remains useful for any domain, not specifically ecommerce.
- Recipes and agent metadata do not enter the runtime payload.
- Migration tooling for existing frameworks or projects remains outside the core package.
