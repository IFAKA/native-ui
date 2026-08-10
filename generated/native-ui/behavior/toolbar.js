export function enhanceToolbars(root = document) {
  for (const toolbar of root.querySelectorAll?.('[role="toolbar"]') || []) {
    const controls = () => [...toolbar.querySelectorAll('button, a, [tabindex]')].filter((control) => !control.disabled)
    toolbar.addEventListener('keydown', (event) => {
      const available = controls()
      const index = available.indexOf(event.target)
      if (index < 0 || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return
      event.preventDefault()
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? available.length - 1 :
        (index + (event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1) + available.length) % available.length
      available[next]?.focus?.()
    })
  }
}
