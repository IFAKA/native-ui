# Native UI Maintainer Instructions

Native UI makes semantic HTML attractive, adaptive, and practical without replacing the browser's semantics or behavior.

## Decision order

1. Native semantic element.
2. Native attribute, state, or relationship.
3. CSS selector, intrinsic layout, or container query.
4. Approved layout or composition contract.
5. Minimal progressive JavaScript only when the platform cannot satisfy the interaction.

## Required boundaries

- Preserve usable content and native actions without JavaScript.
- Never use JavaScript to mirror native state into styling classes, calculate ordinary responsive layouts, or maintain separate mobile/desktop DOM.
- Use classes for reusable layout/composition and attributes for state or behavior intent.
- Keep business logic, routing, remote data, analytics, and product branding outside the library.
- Respect keyboard operation, visible focus, forced colors, reduced motion, zoom, narrow widths, long text, and localization growth.
- Do not add a public selector, attribute, event, export, dependency, or browser requirement without updating the manifest, spec, tests, documentation, and changelog.

## Working method

- Work from the active `spec.md`, `plan.md`, and `tasks.md`.
- Write a failing contract or behavior test first.
- Implement the smallest complete slice.
- Run `npm test` after each slice.
- Record architectural decisions in `docs/decisions/`.
- Treat generated upstream conversions as research material, never trusted production output.

Use `$native-first-ui` for structure and responsive contracts and `$you-dont-need-javascript-for-that` before adding or retaining interaction JavaScript.
