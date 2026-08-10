# Automated shadcn-html port

Upstream: `codylindley/shadcn-html` (MIT).

## One-command sync

```bash
npm run sync:shadcn
```

The command:

1. reads the upstream Git tree;
2. downloads `dist/components/**` and the upstream license;
3. converts every component folder;
4. writes output to `generated/<name>/`;
5. emits `generated/conversion-report.json` for manual-review warnings.

Set `SHADCN_HTML_REF` to pin a tag/commit and `GITHUB_TOKEN` if GitHub's anonymous API rate limit is insufficient.

## Conversion policy

The converter preserves the source component capability CSS rather than copying the upstream visual theme:

- keeps layout, spacing, borders, typography, effects, animation, transitions and interaction/state selectors;
- drops authored non-native color values, shadcn theme variables, unresolved custom properties, and theme/utility selectors;
- removes only native-control presentation classes when the native element already provides that role;
- preserves `data-variant` and `data-size` attributes for source behavior and auditing;
- keeps structural CSS such as grid/flex, positioning, sizing, overflow, spacing, container behavior and scroll behavior;
- keeps vanilla JS behavior as an auditable starting point;
- extracts semantic HTML recipes from `component-skill.md`;
- flags nested/conditional CSS for human review rather than silently guessing.

This is intentionally restrained. A generated component can retain useful native-friendly visual defaults, but it must not silently become another visual design system.

## Runtime limitation of this build

The build environment used to create this archive could access GitHub through the research connector but its local Node/container DNS could not resolve `api.github.com`, so the full upstream sync could not be executed here. The converter itself is tested against an upstream Dialog fixture taken from the repository and passes the UA-first audit.
