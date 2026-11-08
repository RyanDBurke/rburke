import type { Directive } from 'vue'

const cleanups = new WeakMap<HTMLElement, () => void>()

// Grows an element from small to full size as it scrolls up to the middle of the screen.
// Put it on an element with no transform of its own, since it sets `transform`.
export const vScrollScale: Directive<HTMLElement> = {
  mounted(el) {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let frame: number | undefined

    function update() {
      frame = undefined
      if (motion.matches) {
        el.style.transform = ''
        return
      }
      const bounds = el.getBoundingClientRect()
      const distance = Math.max(0, bounds.top + bounds.height / 2 - window.innerHeight / 2)
      const progress = Math.max(0, 1 - distance / (window.innerHeight * 0.65))
      el.style.transform = `scale(${0.2 + progress * 0.8})`
    }

    function schedule() {
      if (frame === undefined) frame = requestAnimationFrame(update)
    }

    el.style.transformOrigin = 'center'
    schedule()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    cleanups.set(el, () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frame !== undefined) cancelAnimationFrame(frame)
    })
  },
  unmounted(el) {
    cleanups.get(el)?.()
    cleanups.delete(el)
  },
}
