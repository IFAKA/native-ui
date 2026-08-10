# Source strategy

The project is an original UA-first adaptation informed by MIT-licensed/open-source references.

- shadcn/ui: component inventory, behavior expectations, accessibility/composition reference. MIT.
- Basecoat: framework-agnostic HTML + vanilla-JS port patterns for shadcn-like components. MIT. We intentionally do not carry over its Tailwind styling/class API.
- shadcn/css: evidence/reference for converting shadcn styling away from Tailwind into CSS Modules. Its React/component styling architecture is not copied into core.

No shadcn visual theme or Tailwind utility output is required by this package. Native browser styling remains the visual baseline.
