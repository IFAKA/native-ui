# Architecture

## Thesis

Native UI extends semantic HTML with attractive presentation, resilient layout, and optional progressive behavior. It does not replace the browser's semantics or turn generic elements into opaque components.

## Layer ownership

| Concern | Owner |
| --- | --- |
| Meaning, source order, native state | HTML |
| Visual defaults, state styling, responsive adaptation | CSS |
| Ambiguous composition intent | Explicit class or `data-nui` |
| Compound keyboard/focus/state coordination | Optional JavaScript |
| Business rules, data, routing, analytics | Consuming application |
| Diagnostics and recommendations | Development-time analyzer |

## Invariants

1. One semantic DOM across viewports.
2. No runtime styling-class injection.
3. No JavaScript for ordinary responsive layout.
4. Explicit author configuration overrides inference.
5. Content and core actions remain usable when enhancement fails.
6. Generated upstream material is research, not public API.
7. Public surface and transfer size are enforced automatically.
