import type { Directive } from 'vue'

// Fades an element in the first time it scrolls into view. The hiding class is only
// added once JavaScript runs, so the pre-rendered page still shows everything.
export const vReveal: Directive<HTMLElement> = {
  mounted(el) {
    el.classList.add('reveal')
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.classList.add('revealed')
        observer.disconnect()
      }
    }, { threshold: 0.2 })
    observer.observe(el)
  },
}
