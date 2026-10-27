<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const props = withDefaults(defineProps<{
  target: string
  label?: string
  delay?: number
}>(), {
  label: 'scroll down ↓',
  delay: 1,
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
    :class="{ visible }"
    :href="`#${props.target}`"
    :style="{ animationDelay: `${props.delay}s` }"
  >{{ props.label }}</a>
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

.scroll-cue.visible {
  animation: pulse 2s ease-in-out infinite backwards;
}

@keyframes pulse {
  0%, 100% { opacity: 0; }
  50% { opacity: 0.8; }
}

@media (prefers-reduced-motion: reduce) {
  .scroll-cue.visible { animation: none; opacity: 0.6; }
}
</style>
