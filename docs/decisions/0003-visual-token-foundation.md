# ADR 0003: Bounded Visual Token Foundation

- Status: accepted
- Date: 2026-08-10

## Context

The classless element layer needs coherent values for type, rhythm, surfaces,
controls, and feedback without turning Native UI into a theme framework. The
values must remain author-overridable and usable across light mode, dark mode,
high contrast, forced colors, and reduced motion.

## Decision

Expose 34 `--nui-*` tokens in twelve documented groups: typography, spacing,
readable width, control sizing, radius, border, surfaces, foregrounds, accent,
danger, shadow, and motion. Semantic authored colors use OKLCH and `light-dark`
where a system color is not the appropriate source. System colors own generic
canvas, text, link, accent, and forced-colors values. Preference media queries
override tokens rather than adding state classes or runtime behavior.

## Alternatives considered

- A larger scale with aliases: rejected because aliases increase surface without
  giving authors a distinct value to override.
- JavaScript theme or preference detection: rejected because CSS owns these
  preferences natively and the no-JavaScript path must remain complete.
- Product-specific colors: rejected because branding belongs in the consuming
  application layer.

## Consequences

Later element and composition rules can share a restrained visual vocabulary.
Authors can override individual values without changing selectors. The token
list is a governed public contract and must be updated with tests and manifest
changes when it grows.

## Validation

`tests/tokens.test.mjs` checks groups, bounded size, non-alias declarations, and
preference contracts. `tests/browser/tokens.spec.mjs` checks the browser-facing
CSS contract. The full `npm test` gate passes.

## Revisit and rollback

Revisit only when benchmark or beta evidence shows a repeated need not served by
the existing groups. Remove or rename tokens only with a migration note and a
new ADR.
