# Deterministic authoring analyzer

The analyzer is development-time tooling, not browser runtime code. It uses a
small dependency-free HTML tokenizer, stable rule IDs governed by the manifest,
source locations, and conservative recommendations. It never infers business
meaning or rewrites source. JSON findings are sorted by source location and
rule ID so fixture output remains byte deterministic.
