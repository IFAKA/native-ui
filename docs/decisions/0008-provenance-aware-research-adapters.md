# Decision 0008: Keep upstream research behind deterministic adapters

## Decision

Upstream UI projects are represented by pinned provenance records and committed, reduced fixtures under `research/`. Adapters emit candidate markup, review warnings, and source provenance only. Candidates are always marked non-production and have no manifest mapping until a maintainer performs manual review.

Network synchronization is explicit and outside the test path. Tests consume only the committed fixtures and compare serialized output byte-for-byte.

## Consequences

- Research can inform capability and recipe decisions without becoming a runtime dependency.
- Tailwind directives, scripts, and upstream global assumptions are removed at the adapter boundary.
- Promotion requires an intentional manifest, specification, test, documentation, and changelog change.
