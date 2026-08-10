# ADR 0001: Public API and Layering

- Status: accepted
- Date: 2026-08-10

## Context

Native UI must make ordinary semantic HTML attractive without replacing browser
semantics, requiring a framework, or growing an opaque component API. The public
surface must stay small enough to audit, document, and support.

## Decision

Native HTML owns meaning, source order, native state, and native actions. CSS
owns visual defaults and ordinary responsive adaptation. Five layout classes are
public: `nui-container`, `nui-readable`, `nui-stack`, `nui-cluster`, and
`nui-grid`. Three action variants are public: `primary`, `danger`, and `quiet`,
expressed with `data-variant`.

Optional JavaScript may enhance only explicit compound interactions and must
preserve a usable no-JavaScript path. It must not inject styling classes,
calculate ordinary layout, mirror native state, or own application data,
routing, analytics, or business rules. Every selector, attribute, event, export,
recipe, and analyzer rule is governed by the manifest and its tests.

The package exposes one stylesheet, one optional behavior module, and the
manifest. Runtime dependencies remain at zero, and the combined compressed CSS
and behavior budget is 12,288 bytes gzip.

## Alternatives considered

- Framework components: rejected because they replace native authoring and add
  framework coupling.
- Utility-class expansion: rejected because it increases authored surface and
  makes the public contract harder to explain.
- Runtime inference and generated DOM: rejected because it obscures ownership,
  weakens fallbacks, and makes behavior difficult to audit.

## Consequences

Authors get classless semantic defaults and a small vocabulary for composition.
Maintainers must keep the manifest, recipes, tests, and documentation in sync.
Some compound interactions remain explicit and may require progressive
enhancement instead of automatic inference.

## Validation

The governance contract test checks the public layout/variant budget, package
exports, zero runtime dependencies, this decision record, and the baseline
methodology.

## Revisit and rollback

Revisit this decision only when beta evidence demonstrates a repeated user need
that cannot be solved within the existing contract. Any change requires a new
numbered ADR, manifest updates, compatibility evidence, tests, and changelog
entry. Until then, revert implementation changes while preserving this ADR.
