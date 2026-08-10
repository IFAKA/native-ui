function items(menu) {
  return [...menu.querySelectorAll('[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"]')]
    .filter((item) => !item.disabled && item.getAttribute('aria-disabled') !== 'true')
}

export function enhanceContextMenus(root = document) {
  root.addEventListener('contextmenu', (event) => {
    const trigger = event.target.closest?.('[data-context-menu]')
    if (!trigger) return
    const id = trigger.getAttribute('data-context-menu').replace(/^#/, '')
    const menu = root.getElementById?.(id) || root.querySelector?.(`#${CSS.escape(id)}`)
    if (!menu) return
    event.preventDefault()
    menu.style.position = 'fixed'
    menu.style.left = `${event.clientX}px`
    menu.style.top = `${event.clientY}px`
    menu.showPopover?.()
    items(menu)[0]?.focus?.()
  })
  root.addEventListener('keydown', (event) => {
    const menu = event.target.closest?.('[popover][role="menu"], [popover].context-menu')
    if (!menu) return
    const available = items(menu)
    const index = available.indexOf(event.target)
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      available[(index + (event.key === 'ArrowDown' ? 1 : -1) + available.length) % available.length]?.focus?.()
    } else if (event.key === 'Escape') {
      event.preventDefault()
      menu.hidePopover?.()
    }
  })
}
