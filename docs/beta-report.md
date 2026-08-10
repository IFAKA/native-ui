# Native UI public beta report

Status: local evidence package complete; external beta launch pending.

## Scope

This report records the repository-side beta readiness and convergence evidence for
Task 13. It does not claim that users were recruited, documentation was published,
or a package was distributed; the public beta is not published.

## Methodology

Evidence uses the declared fixtures and normalized measurement command:
`npm run measure`. Comparisons are limited to the checked-in Barebones, Pith,
Basecoat, and raw-HTML research fixtures; generated research artifacts remain
non-production. The same deterministic reports are used for repeated runs.

## Evidence

The current benchmark report records 3,211 gzip bytes for CSS plus behavior,
18 authored class tokens, and zero static accessibility violations across the six
fixtures. It also records zero test corrections required. The detailed source of
truth is [`benchmarks/reports/measurement.md`](../benchmarks/reports/measurement.md).

The repository-side contract checks pass for the manifest, recipes, documentation,
analyzer, research provenance, release hardening, and browser-test sources.

## Known limitations

- No external beta was published from this workspace, and npm `latest` was not changed.
- No representative user sessions were run, so completion time, qualitative visual
  confidence, and recurring authoring corrections are not user-study measurements.
- Real-browser validation is now recorded in `docs/browser-support.md`: 21/21
  Playwright tests passed across Chromium 151.0.7922.34, Firefox 153.0, and
  WebKit 26.5, with axe-core 4.11.0 reporting zero WCAG 2A/2AA violations.
- This is local evidence from the checked-in benchmark fixtures, not a claim
  that every supported OS/channel combination has been certified.

## 1.0 blockers

External beta distribution, representative user feedback, and a completed
cross-artifact review remain required before a 1.0 decision. These are release
coordination activities, not grounds for changing the public API spec locally.
