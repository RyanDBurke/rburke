<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const props = withDefaults(defineProps<{
  target: string
  label?: string
  marquee?: boolean
}>(), {
  label: 'scroll down ↓',
  marquee: true,
})

const el = ref<HTMLElement>()
const visible = ref(false)
let observer: IntersectionObserver | undefined

// Restart the fade-in each time the cue scrolls into view.
onMounted(() => {
  observer = new IntersectionObserver(([entry]) => {
    visible.value = entry.isIntersecting
  })
  observer.observe(el.value!)
})

onUnmounted(() => observer?.disconnect())
</script>

<template>
  <a
    ref="el"
    class="scroll-cue"
    :class="{ visible, marquee: props.marquee }"
    :href="`#${props.target}`"
    :aria-label="props.label"
  >
    <span v-if="props.marquee" class="star-track" aria-hidden="true">
      <span v-for="row in 2" :key="row" class="star-row">
        <span v-for="star in 18" :key="star">*</span>
      </span>
    </span>
    <span v-else>{{ props.label }}</span>
  </a>
</template>

<style scoped>
.scroll-cue {
  position: absolute;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  color: inherit;
  text-decoration: none;
  font-size: 1rem;
  white-space: nowrap;
  opacity: 0;
}

.scroll-cue.visible:not(.marquee) {
  animation: pulse 2s ease-in-out infinite backwards;
}

.scroll-cue.marquee {
  left: 0;
  width: 100%;
  overflow: hidden;
  transform: none;
  color: #E31717;
  font-family: 'Oi', cursive;
  font-size: clamp(1rem, 2vw, 1.75rem);
  line-height: 2.5rem;
}

.scroll-cue.marquee.visible {
  opacity: 1;
}

.star-track {
  display: flex;
  width: 200%;
  animation: move-right 12s linear infinite;
}

.star-row {
  display: flex;
  flex: 0 0 50%;
  justify-content: space-around;
}

@keyframes move-right {
  from { transform: translateX(-50%); }
  to { transform: translateX(0); }
}

@keyframes pulse {
  0%, 100% { opacity: 0; }
  50% { opacity: 0.8; }
}

@media (prefers-reduced-motion: reduce) {
  .scroll-cue.visible:not(.marquee) { animation: none; opacity: 0.6; }
  .star-track { animation: none; transform: translateX(-50%); }
}
</style>
