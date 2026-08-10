export function enhanceOtp(root) {
  const inputs = [...root.querySelectorAll('input[inputmode="numeric"]')]
  for (const [index, input] of inputs.entries()) {
    input.addEventListener('input', () => {
      input.value = input.value.replace(/\D/g, '').slice(-1)
      if (input.value) inputs[index + 1]?.focus()
    })
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Backspace' && !input.value) inputs[index - 1]?.focus()
    })
    input.addEventListener('paste', (event) => {
      const digits = event.clipboardData?.getData('text').replace(/\D/g, '') ?? ''
      if (!digits) return
      event.preventDefault()
      digits.slice(0, inputs.length - index).split('').forEach((digit, offset) => { inputs[index + offset].value = digit })
      inputs[Math.min(inputs.length - 1, index + digits.length)]?.focus()
    })
  }
}
