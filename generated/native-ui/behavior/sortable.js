function move(item, offset) {
  const list = item.parentElement
  const sibling = offset < 0 ? item.previousElementSibling : item.nextElementSibling
  if (!sibling) return
  list.insertBefore(item, offset < 0 ? sibling : sibling.nextElementSibling)
  item.focus()
}

export function enhanceSortable(root = document) {
  root.addEventListener('keydown', (event) => {
    const item = event.target.closest?.('[data-sortable] [role="option"], .sortable [role="option"]')
    if (!item || item.getAttribute('aria-disabled') === 'true') return
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault()
      move(item, event.key === 'ArrowUp' ? -1 : 1)
    }
  })
  let dragged
  root.addEventListener('dragstart', (event) => {
    dragged = event.target.closest?.('[data-sortable] [draggable="true"], .sortable [draggable="true"]')
  })
  root.addEventListener('dragover', (event) => {
    if (dragged) event.preventDefault()
  })
  root.addEventListener('drop', (event) => {
    const target = event.target.closest?.('[data-sortable] [draggable="true"], .sortable [draggable="true"]')
    if (!dragged || !target || dragged === target) return
    event.preventDefault()
    target.parentElement.insertBefore(dragged, target)
    dragged = null
  })
}
