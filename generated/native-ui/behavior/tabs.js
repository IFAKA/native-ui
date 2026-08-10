export function enhanceTabs(root) {
  const tabs = [...root.querySelectorAll('[role="tab"]')]
  const panels = [...root.querySelectorAll('[role="tabpanel"]')]

  function select(tab) {
    for (const item of tabs) {
      const selected = item === tab
      item.setAttribute('aria-selected', String(selected))
      item.tabIndex = selected ? 0 : -1
      const panel = panels.find(p => p.id === item.getAttribute('aria-controls'))
      if (panel) panel.hidden = !selected
    }
  }

  root.addEventListener('click', e => {
    const tab = e.target.closest('[role="tab"]')
    if (tab && root.contains(tab)) select(tab)
  })

  root.addEventListener('keydown', e => {
    const current = e.target.closest('[role="tab"]')
    if (!current) return
    const i = tabs.indexOf(current)
    if (e.key === 'ArrowRight') tabs[(i + 1) % tabs.length].focus()
    else if (e.key === 'ArrowLeft') tabs[(i - 1 + tabs.length) % tabs.length].focus()
    else return
    e.preventDefault()
  })

  select(tabs.find(t => t.getAttribute('aria-selected') === 'true') || tabs[0])
}
