function findTarget(root, value) {
  const id = (value || '').replace(/^#/, '')
  return id ? root.getElementById?.(id) || root.querySelector?.(`[id="${id.replaceAll('"', '\\"')}"]`) : null
}

export function enhanceTooltips(root = document) {
  for (const trigger of root.querySelectorAll?.('[data-tooltip-trigger], [popovertarget]') || []) {
    const value = trigger.getAttribute('data-tooltip-trigger') || trigger.getAttribute('popovertarget')
    const tooltip = findTarget(root, value)
    if (!tooltip || tooltip.getAttribute('role') !== 'tooltip') continue
    trigger.setAttribute('aria-describedby', tooltip.id)
    let visible = false
    const show = () => {
      if (visible) return
      visible = true
      tooltip.showPopover?.()
    }
    const hide = () => tooltip.hidePopover?.()
    trigger.addEventListener('pointerenter', show)
    trigger.addEventListener('focus', show)
    const dismiss = () => { visible = false; hide() }
    trigger.addEventListener('pointerleave', dismiss)
    trigger.addEventListener('blur', dismiss)
    trigger.addEventListener('keydown', (event) => { if (event.key === 'Escape') { event.preventDefault(); dismiss() } })
  }
}
