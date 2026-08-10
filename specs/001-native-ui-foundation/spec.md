# Native UI Foundation Specification

## Problem

Plain browser HTML is semantically capable but often visually unappealing, while popular component systems require large class surfaces, framework abstractions, and JavaScript for behavior the browser already provides.

## Outcome

A developer can add one stylesheet, write ordinary semantic HTML, and receive an attractive, accessible, responsive baseline. They add a small layout/composition vocabulary only when HTML cannot express presentation and load optional behavior only for compound interactions.

The responsive baseline is mobile-first: narrow layouts are the default contract, and larger viewports enhance the same semantic DOM without requiring alternate markup or viewport JavaScript.

## Primary users

- Developers building static sites, server-rendered applications, and framework applications.
- AI coding agents that benefit from a small, explicit public API.
- Design-system maintainers who want a native, framework-independent source of truth.

## Required user stories

### US1 — Attractive semantic page

Given a page containing headings, text, links, media, lists, a form, and a table, importing Native UI produces coherent hierarchy, rhythm, controls, states, dark mode, and narrow-layout behavior without component classes.

### US2 — Adaptive composition

Given cards, actions, navigation, or data with varying content lengths, the same DOM adapts through intrinsic CSS and container queries without viewport JavaScript.

### US3 — Progressive compound interaction

Given an explicitly declared tabs/menu/combobox pattern, optional behavior supplies the required keyboard, focus, state, lifecycle, and fallback contract without owning application data.

### US4 — Explainable analysis

Given an HTML file, the CLI reports semantic opportunities, accessibility defects, ambiguous composition, responsive risks, unnecessary code, and recommended Native UI contracts in stable text and JSON formats.

### US5 — Author control

Authors can override tokens and CSS, explicitly select a composition/behavior, disable enhancement, and integrate through documented native/custom events without the engine overwriting their DOM or state.

## Non-goals

- React/Vue/Svelte components in 1.0.
- Arbitrary React/Tailwind compilation.
- Runtime AI or visual guessing.
- Business validation, routing, remote data, analytics, or application state.
- Exact shadcn visual parity.
- Supporting obsolete browsers through a large polyfill layer.

## Measurable acceptance

- One CSS import and one optional JavaScript import.
- Five layout classes and three action variants.
- Zero browser runtime dependencies.
- CSS plus optional behavior at or below 12 KiB gzip.
- Ordinary benchmark forms use no component classes.
- Basecoat-equivalent benchmark pages use at least 60% fewer authored class tokens.
- Every public symbol is represented in the manifest and tested.
- Required no-JavaScript, keyboard, zoom, forced-colors, reduced-motion, and browser checks pass.
