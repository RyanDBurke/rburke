<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

// `red` and `blue` pick out words to show in the site's red or blue.
const roles: { text: string; red?: string; blue?: string }[] = [
  { text: 'Software Engineer' },
  { text: 'Film Photographer', blue: 'Film' },
  { text: 'Oil Pastel Art Painter', red: 'Art Painter' },
  { text: 'Basketball Junkie', blue: 'Basketball' },
  { text: 'Twenty Handicap Golfer', red: 'Golfer' },
  { text: 'Frank Ocean Listener', red: 'Listener', blue: 'Ocean' },
  { text: 'Diddy Kong Main', red: 'Kong' },
]

// Splits a descriptor into pieces, tagging the red and blue words with their color.
function pieces(role: (typeof roles)[number]) {
  const colors: Record<string, string> = {}
  if (role.red) colors[role.red] = 'red'
  if (role.blue) colors[role.blue] = 'blue'
  const words = Object.keys(colors)
  if (!words.length) return [{ text: role.text, color: '' }]
  return role.text
    .split(new RegExp(`(${words.join('|')})`))
    .filter(Boolean)
    .map(text => ({ text, color: colors[text] ?? '' }))
}

// How far (in svh) the page scrolls per descriptor while the intro stays pinned.
const scrollPerRole = 12

// Each descriptor is a little fainter than the one above it.
const roleOpacity = (i: number) => 0.9 - (i * 0.75) / (roles.length - 1)

// The first descriptor shows on load; scrolling through the pinned intro reveals the rest,
// and scrolling back up hides them again.
const section = ref<HTMLElement>()
const shown = ref(1)

function update() {
  const el = section.value!
  const scrolled = -el.getBoundingClientRect().top
  const perRole = (el.offsetHeight - window.innerHeight) / roles.length
  shown.value = Math.min(roles.length, Math.max(1, 1 + Math.floor(scrolled / perRole)))
}

onMounted(() => {
  update()
  window.addEventListener('scroll', update, { passive: true })
  window.addEventListener('resize', update)
})

onUnmounted(() => {
  window.removeEventListener('scroll', update)
  window.removeEventListener('resize', update)
})
</script>

<template>
  <section id="intro" ref="section" :style="{ height: `calc(100svh + ${roles.length * scrollPerRole}svh)` }">
    <!-- Stays on screen while the section scrolls past underneath it. -->
    <div class="stage">
      <div>
        <h1>Ryan Burke</h1>
        <ul class="roles">
          <li
            v-for="(role, i) in roles"
            :key="role.text"
            :class="{ shown: i < shown }"
            :style="{ '--opacity': roleOpacity(i) }"
          >
            <span v-for="(piece, j) in pieces(role)" :key="j" :class="piece.color">{{ piece.text }}</span>
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
section {
  padding: 0;
  text-align: center;
}

.stage {
  position: sticky;
  top: 0;
  height: 100svh;
  display: grid;
  place-items: center;
  padding: 1rem;
}

h1 {
  margin: 0;
  font-size: clamp(2.5rem, 10vw, 7rem);
  letter-spacing: -0.03em;
}

.roles {
  margin: 0.75rem 0 0;
  padding: 0;
  list-style: none;
  font-size: clamp(1.125rem, 3vw, 1.75rem);
  line-height: 1.4;
  text-align: left;
}

@media (max-width: 767px) {
  h1 { font-size: 14vw; }
  .roles { font-size: 1.375rem; }
}

.roles li {
  opacity: 0;
  transition: opacity 1.2s ease;
}

.roles li.shown {
  opacity: var(--opacity);
}

/* Same red and blue as the rest of the site. */
.red {
  color: #E31717;
}

.blue {
  color: #1754E3;
}

/* The first descriptor fades in as soon as the page loads. */
.roles li:first-child {
  animation: fade-in 1.2s ease 0.4s backwards;
}

@keyframes fade-in {
  from { opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .roles li { transition: none; }
  .roles li:first-child { animation: none; }
}
</style>
