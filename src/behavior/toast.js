export function createToast(message, { timeout = 4000, root = document.body } = {}) {
  let region = root.matches?.('[data-toast-region], .toast-container')
    ? root
    : root.querySelector?.('[data-toast-region], .toast-container')
  if (!region) {
    region = document.createElement('section')
    region.dataset.toastRegion = ''
    region.setAttribute('aria-live', 'polite')
    region.setAttribute('aria-label', 'Notifications')
    root.append(region)
  }

  const toast = document.createElement('article')
  toast.dataset.toast = ''
  const text = document.createElement('span')
  text.textContent = message
  const close = document.createElement('button')
  close.type = 'button'
  close.textContent = 'Close'
  close.addEventListener('click', () => toast.remove(), { once: true })
  toast.append(text, close)
  region.append(toast)
  if (timeout > 0) setTimeout(() => toast.remove(), timeout)
  return toast
}

export function enhanceToasts(root = document) {
  for (const toast of root.querySelectorAll?.('[data-toast], .toast') || []) {
    toast.querySelector('[data-toast-close], .toast-close')?.addEventListener('click', () => {
      toast.hidePopover?.()
      toast.remove?.()
    }, { once: true })
    toast.showPopover?.()
  }
}
