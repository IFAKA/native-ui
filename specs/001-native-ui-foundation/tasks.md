# Foundation Tasks

- [x] T001 Approve constitution, browser policy, public API budget, and benchmark methodology.
- [x] T002 Record baseline artifacts and metrics from Barebones, Pith, native-ui, native-html, Basecoat, and Starting Point UI. (Unavailable upstream fixtures are explicitly recorded; checked-in research/raw-HTML fixtures provide the complete reproducible fallback comparison set.)
- [x] T003 Finalize manifest schema and public API audit. (Implemented in `src/manifest.schema.json`, `src/manifest.json`, `scripts/audit-public-api.mjs`, and `tests/manifest.test.mjs`.)
- [x] T004 Build attractive token and classless element foundation.
- [x] T005 Build five adaptive layout primitives.
- [x] T006 Curate canonical static compositions and recipes. (Implemented in `src/compositions.css`, `recipes/`, `tests/compositions.test.mjs`, and the manifest.)
- [x] T007 Audit and implement minimum progressive behavior. (Completed as an intentional native-only audit; `src/behavior/index.js` remains inert and `docs/behavior-audit.md` records why no runtime modules are shipped.)
- [x] T008 Build deterministic analyzer and rule registry. (Implemented in `src/analyzer/`, `src/cli.mjs`, and `tests/analyzer.test.mjs`.)
- [x] T009 Build pinned upstream research adapters and provenance records.
- [x] T010 Build benchmark pages and cross-browser/accessibility suite. (Playwright 1.62.1 runs Chromium 151.0.7922.34, Firefox 153.0, and WebKit 26.5; 21/21 fixture/browser tests pass and axe-core 4.11.0 reports zero WCAG 2A/2AA violations.)
- [ ] T011 Complete documentation, community feedback cycle, and beta release. (Partial: documentation exists; community feedback and beta release are not complete.)
- [x] T012 Configure protected release workflow, trusted publishing, provenance, and 1.0 gates.
- [ ] T013 Run a public beta and convergence cycle. (Partial: local evidence and convergence records exist; external beta, user sessions, and cross-browser reports remain pending.)
- [ ] T014 Release 1.0 safely. (Not started: package remains private `0.1.0-alpha.0`; trusted-public release and rollback verification are pending.)

## Reconciliation note

This tracker was stale relative to the repository implementation. The statuses above
were reconciled against the active plan, source tree, manifest, tests, research
fixtures, documentation, and beta/convergence records on 2026-08-10. “Complete”
means the repository contains the planned implementation and passing local contract
evidence; it does not claim external beta or cross-browser validation.

Each task remains blocked until its predecessor's acceptance gate passes. Detailed subtasks and verification commands are in the implementation plan.
