# Browser Support Policy

Status: policy defined; local execution evidence recorded on 2026-08-10.

The exact version matrix must be verified and recorded before the first beta.

## Intended policy

- Current and previous stable Chromium, Firefox, and Safari.
- Corresponding current iOS Safari and Android Chrome releases.
- Broadly supported HTML provides the baseline task.
- Newer CSS is layered through natural fallback or `@supports`.
- Newer interaction APIs use feature detection and preserve a usable fallback.

For each relied-upon feature, record the WHATWG/CSSWG definition, MDN Browser Compatibility Data, checked date, target versions, partial-support caveats, accessibility behavior, and fallback.

No feature may hide content, strand focus, or block navigation/submission when unsupported.

## Current evidence boundary

The repository now runs `npm run test:browser`, which launches all three
Playwright engines against all six benchmark fixtures and injects axe-core
4.11.0. The run on 2026-08-10 passed 21/21 tests with zero WCAG 2A/2AA axe
violations.

## Execution evidence

| Engine | Exact user-agent evidence | Runner | Result |
| --- | --- | --- | --- |
| Chromium | Chrome/151.0.7922.34 | Playwright 1.62.1 | 7/7 passed |
| Firefox | Firefox/153.0 | Playwright 1.62.1 | 7/7 passed |
| WebKit | Safari/26.5 | Playwright 1.62.1 | 7/7 passed |

These are local execution versions, not a change to the support policy. The
machine's browser binaries should be refreshed before release certification.

## Evidence record template

Record each relied-upon browser feature using this structure before beta:

| Feature | Authority | MDN BCD checked | Targets | Caveat | Accessibility behavior | Fallback |
| --- | --- | --- | --- | --- | --- | --- |
| `<feature>` | WHATWG/CSSWG URL | `YYYY-MM-DD` | Chromium / Firefox / Safari | Partial support or none | Focus, semantics, and announcement impact | Native or CSS fallback |
