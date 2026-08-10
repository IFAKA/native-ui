function findTarget(root, value) {
  if (!value) return null
  const id = value.startsWith('#') ? value.slice(1) : value
  return root.getElementById?.(id) || root.querySelector?.(`#${CSS.escape(id)}`) || root.querySelector?.(value)
}

export function enhanceDialogs(root = document) {
  root.addEventListener('click', (event) => {
    const open = event.target.closest?.('[data-dialog-open], [data-dialog-trigger], [data-alert-dialog-trigger], [data-sheet-trigger]')
    if (open) {
      const dialog = findTarget(root,
        open.getAttribute('data-dialog-open') || open.getAttribute('data-dialog-trigger') ||
        open.getAttribute('data-alert-dialog-trigger') || open.getAttribute('data-sheet-trigger'))
      if (dialog instanceof HTMLDialogElement && !dialog.open) dialog.showModal()
      return
    }
    const close = event.target.closest?.('[data-dialog-close], [data-alert-dialog-close], [data-sheet-close]')
    if (close) close.closest('dialog')?.close(close.value || '')
  })
}
