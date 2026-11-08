import type { Directive } from 'vue'

const cleanups = new WeakMap<HTMLElement, () => void>()

// Grows an element from small to full size as its section scrolls into place. Inside a sticky
// panel (the nearest <section>), it reaches full size exactly when the panel sticks, so the
// content is full size for the whole time it's pinned, whatever the panel's padding or the
// phone's toolbar does to where its center lands. Without a section, it's full size once its
// center reaches the middle of the screen.
// Put it on an element with no transform of its own, since it sets `transform`.
export const vScrollScale: Directive<HTMLElement> = {
  mounted(el) {
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const panel = el.closest('section')
    let frame: number | undefined

    function update() {
      frame = undefined
      if (motion.matches) {
        el.style.transform = ''
        return
      }
      // How far the panel still has to scroll before it sticks to the top of the screen.
      let distance: number
      if (panel) {
        distance = Math.max(0, panel.getBoundingClientRect().top)
      } else {
        const bounds = el.getBoundingClientRect()
        distance = Math.max(0, bounds.top + bounds.height / 2 - window.innerHeight / 2)
      }
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
