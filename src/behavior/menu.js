function items(menu) {
  return [...menu.querySelectorAll('[role="menuitem"]:not([disabled]), [role="menuitemcheckbox"]:not([disabled]), [role="menuitemradio"]:not([disabled])')]
}

export function enhanceMenus(root = document) {
  root.addEventListener('keydown', (event) => {
    const menu = event.target.closest('[role="menu"]')
    if (!menu) return
    const list = items(menu)
    const index = list.indexOf(document.activeElement)
    let next
    if (event.key === 'ArrowDown') next = list[(index + 1 + list.length) % list.length]
    else if (event.key === 'ArrowUp') next = list[(index - 1 + list.length) % list.length]
    else if (event.key === 'Home') next = list[0]
    else if (event.key === 'End') next = list.at(-1)
    else if (event.key === 'Escape') {
      menu.hidePopover?.()
      return
    } else return
    event.preventDefault()
    next?.focus()
  })

  root.addEventListener('toggle', (event) => {
    const menu = event.target
    if (menu.matches?.('[popover][role="menu"]') && event.newState === 'open') items(menu)[0]?.focus()
  }, true)
}
