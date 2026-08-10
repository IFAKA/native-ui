# ADR 0004: Intrinsic Adaptive Layout Primitives

- Status: accepted
- Date: 2026-08-10

## Context

Native UI needs a small layout vocabulary for compositions that ordinary
semantic HTML cannot express by itself. The layouts must remain useful without
JavaScript, preserve one DOM and source order, and adapt to narrow widths,
nested containers, long content, and localization growth.

## Decision

Keep exactly five general layout classes: `nui-container`, `nui-readable`,
`nui-stack`, `nui-cluster`, and `nui-grid`. Use logical properties, intrinsic
sizing, wrapping, `min()`, and `minmax()` rather than viewport breakpoints or
runtime measurement. Flexible children may shrink to their available inline
size and pathological text may break safely.

## Alternatives considered

- Viewport JavaScript and resize observers: rejected because ordinary layout is
  a CSS responsibility and runtime measurement adds failure and lifecycle cost.
- Separate mobile and desktop markup: rejected because it duplicates content and
  risks divergent source order and accessibility behavior.
- A larger utility vocabulary: rejected because it expands the public API and
  moves product composition into the library.

## Consequences

The same markup adapts continuously across available space, including nested
contexts. Authors get five predictable contracts, while product-specific
composition remains outside the library. Local adaptation can be added later
only when intrinsic layout cannot express it.

## Validation

`tests/layouts.test.mjs` checks the exact vocabulary, intrinsic declarations,
content resilience, and absence of layout runtime behavior. The browser-facing
contract covers narrow and wide sizing assumptions. The full `npm test` gate
passes.

## Revisit and rollback

Revisit only when a documented composition cannot be expressed with these
intrinsic contracts or benchmark evidence demonstrates a real limitation.
Expand the public API only with synchronized manifest, specification, tests,
documentation, and changelog updates.
