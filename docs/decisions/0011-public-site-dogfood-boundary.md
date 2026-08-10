# ADR 0011: Public site dogfood boundary

## Status

Accepted for the public-site implementation.

## Decision

The website is a framework-free static consuming application. Native UI owns semantic element defaults, layout contracts, variants, and reusable compositions. The site owns product branding, marketing composition, route structure, content, metadata, and optional source-copy feedback under the `nui-site-*` namespace.

The implementation promotes no new Native UI capability. Existing native `details`, `dialog`, `popover`, form validation, progress, table, and navigation semantics express the site requirements without a reusable library gap.

## Consequences

`npm run build` creates package assets in `dist/` and a deterministic static artifact in `public/`. Site JavaScript is optional code-copy feedback only; all content and actions remain useful without it.

Rejected promotions include hero, proof-band, route-header, comparison-frame, and marketing navigation selectors. They are application concerns and must not enter the Native UI manifest.
