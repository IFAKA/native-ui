# ADR 0010: Semantic inference is recommendation-only

Native UI needs a useful answer to “which layout contract best fits this semantic HTML?” without turning the library into a runtime visual-guessing system.

The inference engine therefore runs in development tooling. It uses observable structure—native elements, relationships, repetition, and content density—to produce stable capability recommendations with confidence and evidence. It does not infer business meaning, rewrite source, inject classes, measure the viewport, or ship runtime inference JavaScript.

CSS intrinsic layout and container queries remain responsible for adaptation. Authors decide whether to apply a recommendation, and ordinary HTML remains usable if the analyzer is absent. Revisit this boundary only after documented beta evidence shows recommendations are useful and a concrete browser gap cannot be solved with semantic HTML, native state, or CSS.
