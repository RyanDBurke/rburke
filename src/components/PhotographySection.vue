<script setup lang="ts">
import { computed, ref } from 'vue'
import ScrollCue from './ScrollCue.vue'

// Every image in src/assets/photography, in file-name order. Drop a photo in that folder to add it.
const files = import.meta.glob<string>('../assets/photography/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
})
const photos = Object.keys(files).sort().map(path => {
  const name = path.split('/').pop()!.replace(/\.\w+$/, '').replace(/[-_]+/g, ' ')
  return { src: files[path], alt: `Film photo: ${name}` }
})

// order[0] is the photo on top of the deck.
const order = ref(photos.map((_, i) => i))
const dragX = ref(0)
const leaving = ref<number | null>(null)
const leaveDirection = ref(1)
let startX: number | null = null

const SWIPE_THRESHOLD = 60

function next(direction = 1) {
  if (leaving.value !== null) return
  leaveDirection.value = direction
  leaving.value = order.value[0]
  dragX.value = 0
  // Once the top card has flown off, tuck it under the rest of the deck.
  setTimeout(() => {
    order.value = [...order.value.slice(1), order.value[0]]
    leaving.value = null
  }, 350)
}

function onPointerDown(event: PointerEvent) {
  startX = event.clientX
}

function onPointerMove(event: PointerEvent) {
  if (startX !== null) dragX.value = event.clientX - startX
}

function onPointerUp() {
  if (startX === null) return
  const dx = dragX.value
  startX = null
  if (Math.abs(dx) < 5 || Math.abs(dx) > SWIPE_THRESHOLD) {
    next(dx < 0 ? -1 : 1)
  } else {
    dragX.value = 0
  }
}

// The browser took over the gesture (e.g. the user is scrolling the page), so don't flip.
function onPointerCancel() {
  startX = null
  dragX.value = 0
}

function cardStyle(photoIndex: number) {
  const position = order.value.indexOf(photoIndex)
  if (photoIndex === leaving.value) {
    return {
      zIndex: photos.length + 1,
      transform: `translateX(${leaveDirection.value * 120}%) rotate(${leaveDirection.value * 18}deg)`,
      opacity: 0,
    }
  }
  // The top few cards underneath sit a little lower, to the side, and tilted; the rest hide behind them.
  const fan = Math.min(position, 3)
  const tilt = fan === 0 ? 0 : (fan % 2 ? 1 : -1) * (2 + fan)
  const drag = position === 0 && startX !== null ? dragX.value : 0
  return {
    zIndex: photos.length - position,
    transform: `translate(${drag + fan * 6}px, ${fan * 6}px) rotate(${tilt + drag / 20}deg)`,
    // Hidden cards would only stack up their shadows.
    opacity: position > 3 ? 0 : 1,
    transition: drag ? 'none' : undefined,
  }
}

const topAlt = computed(() => photos[order.value[0]].alt)
</script>

<template>
  <section id="photography">
    <div
      class="deck"
      role="button"
      tabindex="0"
      :aria-label="`${topAlt}. Next photo`"
      @pointerdown="onPointerDown"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerCancel"
      @pointerleave="onPointerUp"
      @keydown.enter.prevent="next()"
      @keydown.space.prevent="next()"
    >
      <img
        v-for="(photo, i) in photos"
        :key="photo.src"
        class="card"
        :src="photo.src"
        :alt="photo.alt"
        :style="cardStyle(i)"
        loading="lazy"
        draggable="false"
      >
    </div>
    <ScrollCue target="contact" />
  </section>
</template>

<style scoped>
section {
  display: grid;
  place-items: center;
  background: #E8A156;
  /* Keeps the deck clear of the floating nav and the scroll cue. */
  padding: 5rem 1rem;
}

.deck {
  position: relative;
  /* Portrait 4:5 cards, as big as fits: nav-bar width, but never taller than the space available. */
  width: min(25vw, calc((100dvh - 12rem) * 0.8));
  aspect-ratio: 4 / 5;
  cursor: grab;
  /* Horizontal drags swipe the deck; vertical drags still scroll the page. */
  touch-action: pan-y;
  user-select: none;
}

.deck:active {
  cursor: grabbing;
}

.card {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  transition: transform 0.35s ease, opacity 0.35s ease;
}

@media (max-width: 767px) {
  .deck {
    width: min(80vw, calc((100dvh - 12rem) * 0.8));
  }
}

@media (prefers-reduced-motion: reduce) {
  .card { transition: none; }
}
</style>
