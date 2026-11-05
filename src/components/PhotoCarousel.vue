<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

// A row of photos that drifts left to right on its own. Dragging takes over; letting go
// hands it back to the drift. The row is drawn twice so it can loop without a seam.
defineProps<{ photos: { src: string; alt: string }[] }>()

const SPEED = 40 // pixels per second
const carousel = ref<HTMLElement>()
const group = ref<HTMLElement[]>([])
const offset = ref(0) // how far the row has moved right, within one copy's width
const dragging = ref(false)
let loopWidth = 0, lastX = 0, lastTime = 0, frame = 0, visible = false
let resize: ResizeObserver | undefined, seen: IntersectionObserver | undefined
const reducedMotion = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : undefined

// Keeps the offset within one copy, so the second copy always fills in behind the first.
function move(by: number) {
  if (!loopWidth) return
  offset.value = (((offset.value + by) % loopWidth) + loopWidth) % loopWidth
}

function tick(now: number) {
  const seconds = Math.min((now - lastTime) / 1000, 0.05)
  lastTime = now
  if (!dragging.value && !reducedMotion?.matches) move(SPEED * seconds)
  frame = requestAnimationFrame(tick)
}

// Only animate while the carousel is on screen.
function updateLoop() {
  cancelAnimationFrame(frame)
  if (visible) {
    lastTime = performance.now()
    frame = requestAnimationFrame(tick)
  }
}

function onPointerDown(event: PointerEvent) {
  dragging.value = true
  lastX = event.clientX
  carousel.value?.setPointerCapture(event.pointerId)
}

function onPointerMove(event: PointerEvent) {
  if (!dragging.value) return
  move(event.clientX - lastX)
  lastX = event.clientX
}

function onPointerUp() {
  dragging.value = false
}

onMounted(() => {
  resize = new ResizeObserver(() => { loopWidth = group.value[0]?.offsetWidth ?? 0; move(0) })
  if (group.value[0]) resize.observe(group.value[0])
  seen = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; updateLoop() })
  seen.observe(carousel.value!)
})

onUnmounted(() => {
  cancelAnimationFrame(frame)
  resize?.disconnect()
  seen?.disconnect()
})
</script>

<template>
  <div
    ref="carousel"
    class="carousel"
    :class="{ dragging }"
    role="region"
    aria-label="Film photos. Drag to browse."
    tabindex="0"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
    @keydown.left.prevent="move(-200)"
    @keydown.right.prevent="move(200)"
  >
    <!-- The row starts one copy to the left and moves right, so the second copy trails behind it. -->
    <div class="track" :style="{ transform: `translateX(${offset - loopWidth}px)` }">
      <div
        v-for="copy in 2"
        :key="copy"
        ref="group"
        class="group"
        :aria-hidden="copy === 2 ? 'true' : undefined"
      >
        <img
          v-for="photo in photos"
          :key="photo.src"
          class="photo"
          :src="photo.src"
          :alt="copy === 1 ? photo.alt : ''"
          loading="lazy"
          draggable="false"
        >
      </div>
    </div>
  </div>
</template>

<style scoped>
.carousel {
  width: 100%;
  overflow: hidden;
  cursor: grab;
  /* Sideways drags move the photos; vertical drags still scroll the page. */
  touch-action: pan-y;
  user-select: none;
}

.carousel.dragging {
  cursor: grabbing;
}

.carousel:focus-visible {
  outline: 2px solid #FDFBD4;
  outline-offset: 4px;
}

.track {
  display: flex;
  width: max-content;
}

.group {
  display: flex;
  gap: 2rem;
  /* The trailing gap keeps the spacing even where one copy meets the next. */
  padding-right: 2rem;
}

.photo {
  /* Portrait 4:5, as tall as the section allows. A fixed size means the loop width is known
     before the lazy-loaded images arrive. */
  height: min(calc(100vh - 12rem), 40rem);
  aspect-ratio: 4 / 5;
  object-fit: cover;
  border-radius: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  pointer-events: none;
}

/* Phones: each photo nearly fills the screen width, with a sliver of the next one showing. */
@media (max-width: 767px) {
  .group {
    gap: 1rem;
    padding-right: 1rem;
  }

  .photo {
    height: min(calc(100svh - 12rem), 85vw * 1.25);
    border-radius: 28px;
  }
}
</style>
