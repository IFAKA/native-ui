# ADR 0002: Deterministic benchmark measurement

## Context

Native UI needs reproducible evidence for claims about authored CSS, JavaScript, markup, and accessibility corrections. Browser audits and upstream projects are not stable inputs for a unit-test baseline.

## Decision

Task 3 uses six committed semantic HTML fixtures and a research-only Basecoat comparison fixture. `scripts/measure.mjs` normalizes line endings, counts source-level metrics, uses Node's built-in gzip and Brotli implementations, and emits JSON and Markdown reports under `benchmarks/reports/`.

The accessibility metric is a conservative static preflight for missing image alternatives, empty button names, and table captions. It is not a replacement for the browser accessibility suite planned for Task 10. A correction count records the same blocking findings so later benchmark runs can show whether fixture corrections were required.

## Consequences

- Measurement is offline, dependency-free, and byte-deterministic.
- Fixture content growth is represented in the source rather than hidden in generated data.
- CSS and behavior byte metrics are source-bundle metrics until the build pipeline gains package-level measurement.
- Browser-level accessibility and rendered layout evidence remain future-task responsibilities.

## Revisit conditions

Revise this contract if the package build changes its artifact boundaries or if browser-based benchmark execution becomes a stable, pinned test input.
