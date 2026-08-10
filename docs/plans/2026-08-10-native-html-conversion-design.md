# Native HTML Conversion Design

## Goal

Make shadcn-html conversion permissive enough to produce components that look like a restrained native HTML design system without importing the full shadcn visual theme.

## Policy

- Preserve semantic HTML, accessibility attributes, and native control behavior.
- Keep structural CSS and interaction/state selectors.
- Preserve structural CSS and modern behavior properties such as transforms, transitions, animations, opacity, and state selectors.
- Keep the browser's native visual baseline by dropping authored colors, backgrounds, borders, radii, shadows, fonts, outlines, and accent styling.
- Resolve custom properties only when they provide an explicit fallback; otherwise drop the declaration.
- Continue dropping shadcn-specific tokens, theme variables, utility-framework selectors, inline styles, and presentation-only recipe attributes.
- Keep JavaScript behavior unchanged unless local asset paths or native-ui integration require adaptation.

## Verification

Update converter tests to prove the allowed visual baseline is retained while shadcn tokens and unsafe visual-system dependencies remain excluded. Run the converter test and the architecture test.
