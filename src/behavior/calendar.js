function monthHeading(calendar) {
  return calendar.querySelector('[aria-live="polite"], .calendar-heading')
}

function renderGrid(calendar, current) {
  const grid = calendar.querySelector('.calendar-grid')
  if (!grid) return
  const year = current.getFullYear()
  const month = current.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const total = new Date(year, month + 1, 0).getDate()
  const previousTotal = new Date(year, month, 0).getDate()
  const rows = Math.ceil((firstDay + total) / 7)
  let day = 1
  let nextDay = 1
  let body = '<thead><tr>'
  for (const label of ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']) body += `<th class="calendar-day-label" scope="col">${label}</th>`
  body += '</tr></thead><tbody>'
  for (let row = 0; row < rows; row++) {
    body += '<tr>'
    for (let column = 0; column < 7; column++) {
      const cell = row * 7 + column
      if (cell < firstDay) {
        const value = previousTotal - firstDay + cell + 1
        body += `<td class="calendar-day" data-outside=""><button tabindex="-1" data-day="${value}" data-outside="prev">${value}</button></td>`
      } else if (day > total) {
        body += `<td class="calendar-day" data-outside=""><button tabindex="-1" data-day="${nextDay}" data-outside="next">${nextDay}</button></td>`
        nextDay++
      } else {
        body += `<td class="calendar-day"><button data-day="${day}">${day}</button></td>`
        day++
      }
    }
    body += '</tr>'
  }
  grid.innerHTML = `${body}</tbody>`
}

export function enhanceCalendar(calendar) {
  const heading = monthHeading(calendar)
  if (!heading) return
  let current = new Date(Date.parse(`1 ${heading.textContent.trim()}`))
  if (Number.isNaN(current.getTime())) current = new Date()
  calendar.addEventListener('click', (event) => {
    const button = event.target.closest?.('[data-action="prev-month"], [data-action="next-month"]')
    if (!button) return
    current.setDate(1)
    current.setMonth(button.getAttribute('data-action') === 'prev-month' ? current.getMonth() - 1 : current.getMonth() + 1)
    heading.textContent = current.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
    renderGrid(calendar, current)
  })
}
