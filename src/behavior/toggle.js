function setPressed(button, pressed) {
  button.setAttribute('aria-pressed', String(pressed))
}

export function enhanceToggles(root = document) {
  root.addEventListener('click', (event) => {
    const button = event.target.closest?.('button[aria-pressed]')
    if (!button || button.disabled) return
    const group = button.closest('.toggle-group')
    if (group?.dataset.type === 'single') {
      group.querySelectorAll('button[aria-pressed]').forEach((candidate) => setPressed(candidate, candidate === button))
    } else {
      setPressed(button, button.getAttribute('aria-pressed') !== 'true')
    }
  })
}
