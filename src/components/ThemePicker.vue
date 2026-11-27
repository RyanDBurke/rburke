<script setup lang="ts">
// Circles pinned to the top-right corner (desktop only) that switch the site's color theme.
// The colors themselves live in style.css under :root[data-theme="..."].
import { onMounted, ref } from 'vue'

const themes = [
  { id: 'warm', label: 'Warm theme', colors: ['#E0603A', '#E9A93E'], background: '#1A110C' },
  { id: 'original', label: 'Original theme', colors: ['#E31717', '#1754E3'], background: '#0C0C0C' },
]

const current = ref('warm')

function apply(id: string) {
  const theme = themes.find(t => t.id === id) ?? themes[0]
  current.value = theme.id
  document.documentElement.dataset.theme = theme.id
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.background)
}

function choose(id: string) {
  apply(id)
  try { localStorage.setItem('theme', id) } catch { /* storage blocked; the choice lasts this visit */ }
}

// index.html already set the saved theme before the page painted; this syncs the circles to it.
onMounted(() => apply(document.documentElement.dataset.theme ?? 'warm'))
</script>

<template>
  <div class="theme-picker" role="group" aria-label="Color theme">
    <button
      v-for="theme in themes"
      :key="theme.id"
      type="button"
      :class="{ active: current === theme.id }"
      :style="{ '--a': theme.colors[0], '--b': theme.colors[1] }"
      :aria-label="theme.label"
      :aria-pressed="current === theme.id"
      :title="theme.label"
      @click="choose(theme.id)"
    />
  </div>
</template>

<style scoped>
.theme-picker {
  display: none;
}

@media (min-width: 768px) {
  .theme-picker {
    position: fixed;
    top: 1.5rem;
    right: 1.5rem;
    z-index: 11;
    display: flex;
    gap: 0.6rem;
  }
}

button {
  width: 1.4rem;
  height: 1.4rem;
  padding: 0;
  border: 0;
  border-radius: 50%;
  /* Each circle shows its theme's two accent colors, split diagonally. */
  background: linear-gradient(135deg, var(--a) 50%, var(--b) 50%);
  box-shadow: 0 0 0 2px var(--page-background), 0 0 0 3px rgb(var(--cream-rgb) / 0.25);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

button:hover {
  transform: scale(1.12);
}

button.active {
  box-shadow: 0 0 0 2px var(--page-background), 0 0 0 4px var(--cream);
}

button:focus-visible {
  outline: 2px solid var(--cream);
  outline-offset: 4px;
}

@media (prefers-reduced-motion: reduce) {
  button { transition: none; }
}
</style>
