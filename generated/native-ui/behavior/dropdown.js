function menuItems(menu) {
  return [...menu.querySelectorAll('[role="menuitem"], [role="menuitemcheckbox"], [role="menuitemradio"]')]
    .filter((item) => !item.disabled && item.getAttribute('aria-disabled') !== 'true')
}

function targetFor(root, value) {
  const id = (value || '').replace(/^#/, '')
  return id ? root.getElementById?.(id) || root.querySelector?.(`[id="${id.replaceAll('"', '\\"')}"]`) : null
}

export function enhanceDropdown(root = document) {
  const menus = [...root.querySelectorAll?.('[popover][role="menu"]') || []]
  const focusMenuItem = (menu, index) => {
    const items = menuItems(menu)
    if (!items.length) return
    const next = items[(index + items.length) % items.length]
    items.forEach((item) => { item.tabIndex = item === next ? 0 : -1; item.classList.toggle('is-active', item === next) })
    next.focus?.()
  }

  root.addEventListener?.('toggle', (event) => {
    const menu = event.target
    if (menu?.matches?.('[popover][role="menu"]') && event.newState === 'open') focusMenuItem(menu, 0)
  }, true)
  root.addEventListener?.('keydown', (event) => {
    const menu = event.target.closest?.('[popover][role="menu"]')
    if (!menu) return
    const items = menuItems(menu)
    const index = items.indexOf(event.target)
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      focusMenuItem(menu, event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : index + (event.key === 'ArrowDown' ? 1 : -1))
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      event.target.click?.()
      menu.hidePopover?.()
    } else if (event.key === 'Escape') {
      event.preventDefault()
      menu.hidePopover?.()
      const trigger = root.querySelector?.(`[popovertarget="${menu.id}"]`)
      trigger?.focus?.()
    }
  })
}
