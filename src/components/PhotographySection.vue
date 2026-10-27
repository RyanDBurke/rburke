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
// The tap hint shows until the first flip.
const flipped = ref(false)

const SWIPE_THRESHOLD = 60

function next(direction = 1) {
  if (leaving.value !== null) return
  leaveDirection.value = direction
  leaving.value = order.value[0]
  flipped.value = true
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
      <Transition name="hint">
        <!-- A pointing-hand link cursor, with lines that burst from the fingertip each time it taps. -->
        <svg
          v-if="!flipped"
          class="tap-hint"
          viewBox="0 0 64 64"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <g class="burst" fill="none" stroke="#fff" stroke-width="2.5">
            <path d="M25.5 7.5V3.5M21.3 9.3l-2.8-2.8M29.7 9.3l2.8-2.8M19.5 13.5h-4M31.5 13.5h4" />
          </g>
          <g class="hand" fill="#fff" stroke="#1a1a1a" stroke-width="2">
            <path
              d="M22 17a3.5 3.5 0 0 1 7 0V31a3.5 3.5 0 0 1 7 0V33a3.5 3.5 0 0 1 7 0V35a3.2 3.2 0 0 1 6.4 0V45c0 5-3 8-5 10V59H28V56c-2-2-5-5-8-10l-4-6a3 3 0 0 1 5-3.4l1 1.4Z"
            />
            <path d="M29 31v6M36 33v5M43 35v4" fill="none" stroke-width="1.5" />
          </g>
        </svg>
      </Transition>
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

/* A cursor in the middle of the top photo, tapping, to show the deck can be flipped. */
.tap-hint {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  /* Above every card, including one flying off. */
  z-index: 1000;
  width: clamp(3rem, 20%, 5rem);
  overflow: visible;
  /* Muted, so it hints without competing with the photo. */
  opacity: 0.75;
  /* The black outline keeps the white hand readable on light photos; the shadow lifts it and the burst off dark ones. */
  filter: drop-shadow(0 1px 3px rgba(0, 0, 0, 0.5));
  pointer-events: none;
}

.hand {
  transform-box: view-box;
  transform-origin: 25.5px 13.5px;
  animation: tap 1.6s ease-in-out infinite;
}

/* The lines flash out from the fingertip as the hand presses down. */
.burst {
  transform-box: view-box;
  transform-origin: 25.5px 13.5px;
  animation: burst 1.6s ease-out infinite;
}

@keyframes tap {
  0%, 60%, 100% { transform: translateY(0) scale(1); }
  30% { transform: translateY(2px) scale(0.92); }
}

@keyframes burst {
  0%, 25% { opacity: 0; transform: scale(0.6); }
  35% { opacity: 1; transform: scale(1); }
  65%, 100% { opacity: 0; transform: scale(1.25); }
}

.hint-leave-active {
  transition: opacity 0.3s ease;
}

.hint-leave-to {
  opacity: 0;
}

@media (max-width: 767px) {
  .deck {
    width: min(80vw, calc((100dvh - 12rem) * 0.8));
  }
}

@media (prefers-reduced-motion: reduce) {
  .card { transition: none; }
  .hand, .burst { animation: none; }
}
</style>
