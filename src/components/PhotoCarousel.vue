<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { vScrollScale } from '../scrollScale'

// A row of photos that drifts right to left on its own. Dragging takes over; letting go
// hands it back to the drift. The row is drawn three times, so it loops without a seam and,
// even while the photos are shrunk (see the scaler below), there are photos on both sides.
// It starts with the first photo centered.
// Tapping a photo flips it over to show its title and caption; tapping again flips it back.
type Back = { title: string; camera: string; film: string; article?: string }
defineProps<{ photos: { src: string; alt: string; back: Back; landscape?: boolean }[] }>()

const SPEED = 40 // pixels per second
const DRAG_THRESHOLD = 6 // pixels a press must move before it counts as a drag, not a tap
const carousel = ref<HTMLElement>()
const scaler = ref<HTMLElement>()
const group = ref<HTMLElement[]>([])
const offset = ref(0) // where the row sits, within one copy's width
const dragging = ref(false)
const flipped = ref<number>() // index of the photo showing its caption, if any
let pressed = false, startX = 0
let loopWidth = 0, lastX = 0, lastTime = 0, frame = 0, visible = false
let resize: ResizeObserver | undefined, seen: IntersectionObserver | undefined
const reducedMotion = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)') : undefined

// Keeps the offset within one copy's width; the copies on either side fill in around it.
function move(by: number) {
  if (!loopWidth) return
  offset.value = (((offset.value + by) % loopWidth) + loopWidth) % loopWidth
}

function tick(now: number) {
  const seconds = Math.min((now - lastTime) / 1000, 0.05)
  lastTime = now
  // Negative: the row slides left, so photos enter from the right in list order.
  if (!dragging.value && !reducedMotion?.matches) move(-SPEED * seconds)
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

// A press only becomes a drag once it moves a few pixels. Until then the pointer isn't
// captured, so a tap lands on the photo as an ordinary click. Once it is captured, the
// click goes to the carousel instead, so a drag never flips a photo.
function onPointerDown(event: PointerEvent) {
  pressed = true
  startX = lastX = event.clientX
}

function onPointerMove(event: PointerEvent) {
  if (!pressed) return
  if (!dragging.value) {
    if (Math.abs(event.clientX - startX) < DRAG_THRESHOLD) return
    dragging.value = true
    carousel.value?.setPointerCapture(event.pointerId)
  }
  // While the row is shrunk, divide by its scale so the photos stay under the finger.
  const el = scaler.value
  const scale = el && el.offsetWidth ? el.getBoundingClientRect().width / el.offsetWidth : 1
  move((event.clientX - lastX) / (scale || 1))
  lastX = event.clientX
}

function onPointerUp() {
  pressed = false
  dragging.value = false
}

function toggle(index: number) {
  flipped.value = flipped.value === index ? undefined : index
}

onMounted(() => {
  resize = new ResizeObserver(() => {
    const firstMeasure = !loopWidth
    loopWidth = group.value[0]?.offsetWidth ?? 0
    // The first time the row has a size, put the first photo in the middle of the carousel.
    // A copy starts at a multiple of loopWidth from the offset, so this lines one up there.
    const firstPhoto = group.value[0]?.firstElementChild as HTMLElement | null
    if (firstMeasure && loopWidth && firstPhoto && carousel.value) {
      offset.value = carousel.value.offsetWidth / 2 - firstPhoto.offsetWidth / 2
    }
    move(0)
  })
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
    <!-- The row is shifted two copies to the left; the offset wraps within one copy's width, so
         there's always at least one full copy on each side of what's on screen. -->
    <!-- The photos grow from small to full size as the carousel scrolls to the middle of the
         screen. Only this inner row scales, so the carousel's window always spans the full width
         and shows more photos while they're small. -->
    <div ref="scaler" v-scroll-scale class="scaler">
    <div class="track" :style="{ transform: `translateX(${offset - 2 * loopWidth}px)` }">
      <div
        v-for="copy in 3"
        :key="copy"
        ref="group"
        class="group"
        :aria-hidden="copy !== 1 ? 'true' : undefined"
      >
        <!-- Every copy of a photo flips together, so the loop stays seamless. Only the first
             copy is announced to screen readers and reachable with Tab. -->
        <button
          v-for="(photo, i) in photos"
          :key="photo.src"
          type="button"
          class="photo"
          :class="{ landscape: photo.landscape, flipped: flipped === i }"
          :tabindex="copy !== 1 ? -1 : undefined"
          :aria-pressed="flipped === i"
          @click="toggle(i)"
        >
          <span class="card">
            <span class="face front">
              <img :src="photo.src" :alt="copy === 1 ? photo.alt : ''" loading="lazy" draggable="false">
            </span>
            <!-- The back shows the same photo, blurred and darkened, behind the title and caption. -->
            <span class="face back">
              <img :src="photo.src" alt="" loading="lazy" draggable="false">
              <span class="caption">
                <span class="caption-title">{{ photo.back.title }}</span>
                <template v-if="photo.back.camera">
                  Shot on {{ photo.back.article ? photo.back.article + ' ' : '' }}<span class="camera">{{ photo.back.camera }}</span>
                  with <span class="film">{{ photo.back.film }}</span>
                </template>
              </span>
            </span>
          </span>
        </button>
      </div>
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
  flex: none;
  /* Undo the browser's button styling. */
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  cursor: inherit;
  --radius: 40px;
  border-radius: var(--radius);
  perspective: 1600px;
  -webkit-tap-highlight-color: transparent;
}

.photo:focus-visible {
  outline: 2px solid #FDFBD4;
  outline-offset: 4px;
}

/* Flips around its vertical axis; each face hides when it's turned away. */
.card {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

.photo.flipped .card {
  transform: rotateY(180deg);
}

.face {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: var(--radius);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.face img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  pointer-events: none;
}

.back {
  display: grid;
  place-items: center;
  transform: rotateY(180deg);
  /* Lets the caption size itself from the photo: cqw is 1% of its width, cqmin 1% of its
     shorter side (so the wider landscape photos don't get oversized text). */
  container-type: size;
}

.back img {
  position: absolute;
  inset: 0;
  filter: blur(18px) brightness(0.35);
  transform: scale(1.15); /* hides the blur's soft edges */
}

/* 70% of the photo's width, with text that scales with the photo. */
.caption {
  position: relative;
  width: 70cqw;
  font-size: 4cqmin;
  line-height: 1.4;
  text-align: center;
  color: #FDFBD4;
}

/* The title sits above the caption, larger and in gold. */
.caption-title {
  display: block;
  margin-bottom: 0.4em;
  font-size: 10cqmin; /* set on its own, so resizing the caption leaves it alone */
  font-weight: 700;
  line-height: 1.15;
  color: #EFBF04;
  text-wrap: balance;
}

/* The few landscape exceptions: same height, so 5:4 instead of 4:5. */
.photo.landscape {
  aspect-ratio: 5 / 4;
}

/* Phones: each photo nearly fills the screen width, with a sliver of the next one showing. */
@media (max-width: 767px) {
  .group {
    gap: 1rem;
    padding-right: 1rem;
  }

  .photo {
    height: min(calc(100svh - 12rem), 85vw * 1.25);
    --radius: 28px;
  }

  /* Every photo is a 4:5 portrait on phones, landscapes included (cropped from the center). */
  .photo.landscape {
    aspect-ratio: 4 / 5;
  }
}

/* No spin: the caption just swaps in. */
@media (prefers-reduced-motion: reduce) {
  .card { transition: none; }
}
</style>
