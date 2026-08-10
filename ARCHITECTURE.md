# Architecture

## Thesis

The browser UA stylesheet is the design system. This project extends HTML's capability vocabulary without replacing its visual vocabulary.

`semantic HTML -> UA styling -> tiny capability CSS -> progressive behavior -> local recipes`

## Invariants

1. The browser UA stylesheet is the design system.
2. Do not restyle native controls without a capability reason.
3. One semantic DOM across screen sizes.
4. Intrinsic responsiveness first.
5. Container queries second.
6. Viewport breakpoints last.
7. Native HTML before CSS.
8. CSS before JavaScript.
9. JavaScript only for missing interaction semantics.
10. Recipes are owned by the consuming app.
11. Capability parity matters; shadcn visual parity does not.

## Layers

- `core.css`: hardening only. No reset/theme/typography/control skins.
- `layout.css`: stack, cluster, grid, container, readable composition primitives.
- `components.css`: CSS-only missing capabilities and layout needed by behavioral recipes.
- `behavior/*`: small ES modules for missing interaction semantics.
- `recipes/*`: copyable semantic HTML compositions.

## Source-port pipeline

For each upstream shadcn/Basecoat capability:

1. Identify the user-visible capability and keyboard contract.
2. Delete React/Tailwind/framework-specific structure.
3. Replace abstractions with native HTML where possible.
4. Replace JS-owned state with native state (`open`, `checked`, `required`, `popover`, `dialog`) where possible.
5. Keep only JS that the platform cannot express.
6. Add the minimum CSS needed for layout/capability, not branding.
7. Test keyboard, no-JS fallback, narrow width, forced colors, reduced motion.

## Forbidden patterns

- `.button`, `.input`, `.card` abstractions that duplicate native element roles.
- desktop/mobile duplicate markup.
- global resets.
- design tokens for brand/theme in core.
- Tailwind-style atomic utility explosion.
- recreating a native control with `div`/`span` when HTML already supplies it.
