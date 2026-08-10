# Browser Support Policy

The exact version matrix must be verified and recorded before the first beta.

## Intended policy

- Current and previous stable Chromium, Firefox, and Safari.
- Corresponding current iOS Safari and Android Chrome releases.
- Broadly supported HTML provides the baseline task.
- Newer CSS is layered through natural fallback or `@supports`.
- Newer interaction APIs use feature detection and preserve a usable fallback.

For each relied-upon feature, record the WHATWG/CSSWG definition, MDN Browser Compatibility Data, checked date, target versions, partial-support caveats, accessibility behavior, and fallback.

No feature may hide content, strand focus, or block navigation/submission when unsupported.

## Evidence record template

Record each relied-upon browser feature using this structure before beta:

| Feature | Authority | MDN BCD checked | Targets | Caveat | Accessibility behavior | Fallback |
| --- | --- | --- | --- | --- | --- | --- |
| `<feature>` | WHATWG/CSSWG URL | `YYYY-MM-DD` | Chromium / Firefox / Safari | Partial support or none | Focus, semantics, and announcement impact | Native or CSS fallback |
