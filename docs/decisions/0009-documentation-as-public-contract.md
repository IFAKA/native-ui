# 0009. Documentation examples are public contracts

Date: 2026-08-10

## Decision

The documentation site is static and dependency-light. Its landing page demonstrates the thesis with classless semantic HTML first, then the small layout/composition vocabulary, while focused guides explain architecture, browser support, accessibility, theming, analysis, migration, governance, security, and contribution.

The documentation test reads `src/manifest.json` and requires every public layout, composition, and action variant to appear in the canonical example. This makes examples executable evidence of the frozen API rather than manually maintained marketing copy.

## Consequences

- Native HTML remains usable without site JavaScript because the site has no runtime script.
- CSS is linked directly from the built distribution, so the site exercises the shipped stylesheet.
- Feedback and beta-release claims remain outside this slice; Task 12 release hardening is not part of this change.
