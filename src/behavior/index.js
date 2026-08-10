/**
 * Progressive enhancement entry point.
 * The initial foundation intentionally has no automatic behavior modules.
 */
export function enhance(root = document) {
  if (!root?.querySelectorAll) return;
}
