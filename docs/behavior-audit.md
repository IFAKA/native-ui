# Behavior audit

Task 8 audit date: 2026-08-10.

## Result

No runtime behaviors are currently shipped. `src/behavior/index.js` exports the
optional `enhance(root)` entry point, but it intentionally performs no work.
The manifest's `behaviors` list is empty, so the executable public contract has
no selectors, attributes, events, or behavior modules to initialize.

This is the minimum safe implementation: the current package provides semantic
HTML, native controls, CSS presentation, intrinsic layout, and native states;
it has no compound interaction gap that Native UI can own yet.

## Candidate inventory and classification

| Candidate | Classification | Producer → contract → consumer | Initialization / insertion | Teardown | Failure path |
| --- | --- | --- | --- | --- | --- |
| Headings, links, buttons, forms, validation, tables, media | native-only | Browser HTML → native element/state → browser and assistive technology | Browser parsing; dynamic native DOM works without package code | Browser lifecycle | Content and native action remain usable if CSS or JavaScript fails |
| `details` disclosure | native-only | `<details>/<summary>` → `open` state → browser disclosure rendering | Browser parsing or DOM insertion | Browser lifecycle | Content remains in document flow and can be opened natively |
| `dialog` | native-only | `<dialog>` plus `showModal()`/`show()` → `open` and modal state → browser focus and Escape behavior | Author/application invokes the native method | Browser lifecycle; application owns references | Dialog content remains ordinary content; unsupported invocation is application-owned |
| `popover` | native-only | `[popover]` plus declarative/native invoker → popover state → browser dismissal and focus behavior | Browser parsing or DOM insertion | Browser lifecycle | The element remains content; authors provide an application fallback where required |
| Responsive layout and visual state | native-only | semantic elements, attributes, pseudo-classes, media/container queries → CSS → rendered presentation | CSS cascade and layout | CSS lifecycle | Normal document flow remains usable without CSS |
| Tabs, menu, combobox, command, toast, carousel, sortable, resizable | application-owned / compound enhancement candidate | Application data and explicit composition → application contract → application consumers | Not implemented; no producer or consumer exists in this package | Not applicable | No package module can strand content; application owns any required fallback |

No candidate crosses the package boundary as a shipped behavior. In
particular, there is no producer for a custom event, no consumer for a runtime
state, and no public behavior export beyond the optional entry point itself.

## Rejected JavaScript

The runtime does not calculate viewport or container layout, inject styling
classes, mirror native state, poll, or implement business logic. CSS owns
responsive adaptation and visual states; native HTML owns semantics, keyboard
operation, focus, disclosure, validation, dismissal, and submission.

No `MutationObserver`, timer, resize listener, layout measurement, event
dispatcher, or custom event is justified by the current contract.

The semantic inference engine is development-time only. `native-ui infer`
returns explainable recommendations and confidence from source structure; it
does not inject classes, mutate HTML, measure the viewport, or participate in
browser behavior.

## Initialization and lifecycle

`enhance(root)` is an idempotent no-op for any root with `querySelectorAll` and
returns without throwing for an absent or non-DOM root. There is no global
listener, retained state, dynamic-DOM registry, teardown hook, or cleanup
requirement. Repeated initialization and insertion/removal therefore cannot
duplicate behavior or leak resources.

## JavaScript-disabled path

The package has no required JavaScript path. Content remains present, links
navigate, controls submit or activate, forms expose native validation, and
native elements retain their browser behavior when the optional behavior export
is not loaded. The CSS and recipe contracts do not require a second DOM or
script-generated state.

## Retention decision

Retain only the inert `enhance` export for package/API stability and future
progressive enhancements. Do not add dialog coordination, tabs, menus,
comboboxes, commands, toasts, carousels, sortable lists, or resizable panels
until a concrete interaction gap, producer/consumer map, browser evidence,
failing behavior contract, and no-JavaScript fallback are specified.
