export function enhanceResizable(root) {
  const handle = root.querySelector('[role="separator"]')
  const first = root.querySelector('[data-resizable-first]')
  if (!handle || !first) return
  handle.addEventListener('pointerdown', (event) => {
    handle.setPointerCapture(event.pointerId)
    const rect = root.getBoundingClientRect()
    const move = (e) => {
      const ratio = Math.min(.9, Math.max(.1, (e.clientX - rect.left) / rect.width))
      first.style.flexBasis = `${ratio * 100}%`
      handle.setAttribute('aria-valuenow', String(Math.round(ratio * 100)))
    }
    handle.addEventListener('pointermove', move)
    handle.addEventListener('pointerup', () => handle.removeEventListener('pointermove', move), { once: true })
  })
}
