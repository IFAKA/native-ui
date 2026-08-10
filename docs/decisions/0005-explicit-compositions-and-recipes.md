# Explicit compositions and canonical recipes

## Status

Accepted — 2026-08-10

## Decision

Task 7 publishes ten small visual compositions. Classes are reserved for visual groupings that HTML cannot name (`card`, `badge`, `toolbar`, `empty-state`, `field-actions`, `table-overflow`, and `responsive-navigation`). Native selectors own compositions whose meaning is already carried by the element or attribute: alerts may use `role="alert"`, dialog sections use `dialog > header/footer`, and popover surfaces use `[popover]`.

Each composition has one canonical recipe directory containing `metadata.json`, `snippet.html`, and `example.html`. Metadata records the intended use, when not to use the recipe, and the preferred native alternative. Recipes preserve one DOM, source order, native interaction, intrinsic sizing, content growth, and author token overrides.

## Consequences

The manifest, public API audit, CSS, tests, and recipe artifacts move together. No composition adds runtime JavaScript, a size matrix, or a viewport-specific markup branch. Tables own their horizontal overflow in an explicitly named wrapper; navigation and action groups wrap naturally.
