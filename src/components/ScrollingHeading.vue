<script setup lang="ts">
// A big section heading that scrolls sideways forever, like "EXPERIENCE * EXPERIENCE *".
// The words repeat in order, each followed by a red star. Pass `image` to repeat a picture instead.
const props = defineProps<{ words?: string[]; image?: string }>()
const words = props.words ?? ['']
const items = Array.from({ length: 10 }, (_, i) => words[i % words.length])
</script>

<template>
  <div class="ticker" aria-hidden="true">
    <div class="track">
      <div v-for="row in 2" :key="row" class="row">
        <span v-for="(word, i) in items" :key="i" class="item">
          <img v-if="image" class="picture" :src="image" alt="">
          <template v-else>{{ word }}</template> <span class="star">*</span>
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* The top padding clears the floating nav. */
.ticker {
  padding: 5rem 0 1rem;
  width: 100%;
  overflow: hidden;
  color: #FDFBD4;
  font-size: clamp(2rem, 4vw, 3.5rem);
  font-weight: 700;
  line-height: 1.2;
  white-space: nowrap;
  pointer-events: none;
}

.track {
  display: flex;
  width: max-content;
  animation: ticker-scroll-right 60s linear infinite;
}

.row {
  display: flex;
  flex: 0 0 auto;
  gap: 1.5rem;
  padding-right: 1.5rem;
}

.item {
  display: inline-flex;
  align-items: center;
  gap: 1.5rem;
}

/* A picture stands in for a word, about as tall as the letters. */
.picture {
  height: 1.2em;
  width: auto;
  image-rendering: pixelated;
}

.star {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 1em;
  color: #E31717;
  font-family: 'Oi', cursive;
  font-weight: 400;
  line-height: 1;
  transform: translateY(0.18em);
}

@keyframes ticker-scroll-right {
  from { transform: translateX(-50%); }
  to { transform: translateX(0); }
}

/* Phones: twice the 2rem the desktop size bottoms out at. */
@media (max-width: 767px) {
  .ticker { font-size: 4rem; }
}

@media (prefers-reduced-motion: reduce) {
  .track { animation: none; transform: translateX(-50%); }
}
</style>
