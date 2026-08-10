function targetFor(root, value) {
  const id = (value || '').replace(/^#/, '')
  if (!id) return null
  return root.getElementById?.(id) || root.querySelector?.(`[id="${id.replaceAll('"', '\\"')}"]`) || null
}

function enhancePalette(palette) {
  const input = palette.querySelector('input[type="search"], input[role="combobox"], .command-input')
  const commands = [...palette.querySelectorAll('[data-command-item], .command-item')]
  if (!input) return
  const list = palette.querySelector('.command-list, [role="listbox"]')
  let activeIndex = -1
  input.setAttribute('role', 'combobox')
  input.setAttribute('aria-expanded', 'true')
  if (list) {
    list.setAttribute('role', 'listbox')
    if (!list.id) list.id = `${palette.id || 'command'}-list`
    input.setAttribute('aria-controls', list.id)
  }
  commands.forEach((item, index) => {
    item.setAttribute('role', 'option')
    if (!item.id) item.id = `${palette.id || 'command'}-item-${index + 1}`
  })
  const visibleCommands = () => commands.filter((item) => !item.hidden)
  const setActive = (item) => {
    const visible = visibleCommands()
    activeIndex = item ? visible.indexOf(item) : -1
    commands.forEach((candidate) => {
      const active = candidate === item
      candidate.classList.toggle('is-active', active)
      candidate.setAttribute('aria-selected', String(active))
    })
    input.setAttribute('aria-activedescendant', item?.id || '')
    item?.scrollIntoView?.({ block: 'nearest' })
  }
  const filter = () => {
    const query = input.value.trim().toLocaleLowerCase()
    let visible = 0
    for (const item of commands) {
      item.hidden = !item.textContent.toLocaleLowerCase().includes(query)
      if (!item.hidden) visible++
    }
    const empty = palette.querySelector('.command-empty')
    if (empty) empty.hidden = visible !== 0
    setActive(visibleCommands()[0])
  }
  input.addEventListener('input', filter)
  palette.addEventListener('keydown', (event) => {
    const visible = visibleCommands()
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      if (!visible.length) return
      if (event.key === 'Home') activeIndex = 0
      else if (event.key === 'End') activeIndex = visible.length - 1
      else activeIndex = (activeIndex + (event.key === 'ArrowDown' ? 1 : -1) + visible.length) % visible.length
      setActive(visible[activeIndex])
    } else if (event.key === 'Enter') {
      event.preventDefault()
      visible[activeIndex]?.click?.()
      palette.closest('dialog')?.close()
    } else if (event.key === 'Escape') palette.closest('dialog')?.close()
  })
  palette.addEventListener('click', (event) => {
    if (event.target.closest('.command-item') && palette.closest('dialog')) palette.closest('dialog').close()
  })
}

export function enhanceCommand(root = document) {
  for (const palette of root.querySelectorAll?.('.command') || []) enhancePalette(palette)
  root.addEventListener?.('click', (event) => {
    const trigger = event.target.closest?.('[data-command-trigger], [data-command-open]')
    if (!trigger) return
      const target = targetFor(root, trigger.getAttribute('data-command-trigger') || trigger.getAttribute('data-command-open'))
    if (target && typeof target.showModal === 'function' && !target.open) {
      target.showModal()
      target.querySelector('input')?.focus()
    }
  })
  root.addEventListener?.('keydown', (event) => {
    if (!(event.metaKey || event.ctrlKey) || event.key.toLowerCase() !== 'k') return
    const trigger = root.querySelector?.('[data-command-trigger], [data-command-open]')
    if (!trigger) return
    event.preventDefault()
    const target = targetFor(root, trigger.getAttribute('data-command-trigger') || trigger.getAttribute('data-command-open'))
    if (target && typeof target.showModal === 'function' && !target.open) {
      target.showModal()
      target.querySelector('input')?.focus()
    }
  })
}
