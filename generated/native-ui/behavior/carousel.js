export function enhanceCarousel(root) {
  const track = root.querySelector('[data-carousel-track], .carousel-viewport')
  if (!track) return
  const step = () => track.clientWidth
  root.querySelector('[data-carousel-prev], .carousel-prev')?.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }))
  root.querySelector('[data-carousel-next], .carousel-next')?.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }))
}
