# Decision 0006: Keep the behavior runtime inert until a real interaction gap exists

Task 8 audited the current Native UI surface and found no package-owned
compound interaction. Semantic HTML, native states, and CSS already cover the
implemented foundation.

The optional behavior export remains an idempotent no-op. This preserves the
published entry point without adding listeners, mutation observers, timers,
layout reads, styling-class injection, native-state mirroring, or application
logic. Future behavior must arrive with a mapped producer, consumer,
lifecycle, compatibility evidence, keyboard/focus contract, and a failing
behavior test before implementation.

This decision keeps the no-JavaScript path complete and avoids turning
application-owned patterns into library behavior prematurely.
