export function enhanceCombobox(root) {
  const input = root.querySelector('input[role="combobox"]')
  const list = root.querySelector('[role="listbox"]')
  if (!input || !list) return
  const options = () => [...list.querySelectorAll('[role="option"]')]
  const trigger = root.querySelector('[aria-haspopup="listbox"], .combobox-trigger')
  const popover = root.querySelector('[popover]')
  let activeIndex = -1

  function visibleOptions() {
    return options().filter((option) => !option.hidden)
  }

  function setActive(option) {
    const visible = visibleOptions()
    activeIndex = Math.max(0, visible.indexOf(option))
    for (const candidate of options()) candidate.classList.toggle('is-active', candidate === option)
    input.setAttribute('aria-activedescendant', option?.id || '')
    option?.scrollIntoView?.({ block: 'nearest' })
  }

  function filter() {
    const query = input.value.trim().toLocaleLowerCase()
    for (const option of options()) option.hidden = !option.textContent.toLocaleLowerCase().includes(query)
    const empty = list.querySelector('.combobox-empty')
    if (empty) empty.hidden = visibleOptions().length !== 0
    setActive(visibleOptions()[0])
  }

  function open() {
    trigger?.setAttribute('aria-expanded', 'true')
    if (popover && !popover.matches(':popover-open')) popover.showPopover?.()
    input.focus()
    filter()
  }

  function close() {
    trigger?.setAttribute('aria-expanded', 'false')
    popover?.hidePopover?.()
  }

  function select(option) {
    if (!option) return
    input.value = option.dataset.value ?? option.textContent.trim()
    for (const candidate of options()) candidate.setAttribute('aria-selected', String(candidate === option))
    const value = root.querySelector('.combobox-value')
    if (value) value.textContent = option.textContent.trim()
    input.dispatchEvent(new Event('change', { bubbles: true }))
    close()
  }

  trigger?.addEventListener('click', () => open())
  input.addEventListener('input', filter)
  input.addEventListener('focus', open)
  input.addEventListener('keydown', (event) => {
    const visible = visibleOptions()
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (!visible.length) return
      activeIndex = (activeIndex + (event.key === 'ArrowDown' ? 1 : -1) + visible.length) % visible.length
      setActive(visible[activeIndex])
    } else if (event.key === 'Enter') {
      event.preventDefault()
      select(visible[activeIndex])
    } else if (event.key === 'Escape') {
      event.preventDefault()
      close()
    }
  })

  list.addEventListener('click', (event) => {
    const option = event.target.closest('[role="option"]')
    if (!option) return
    select(option)
  })

  filter()
}
