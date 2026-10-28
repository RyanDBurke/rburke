<script setup lang="ts">
import ScrollCue from './ScrollCue.vue'

const roles = [
  { text: 'Software Engineer' },
  { text: 'Film Photographer' },
  { text: 'Oil Pastel Art Painter', note: '(sometimes)' },
  { text: 'Basketball Junkie' },
  { text: 'Twenty Handicap Golfer' },
  { text: 'Sushi Enjoyer' },
  { text: 'Baggy Jeans Wearer' },
  { text: 'Chai Consumer' },
  { text: 'Birkenstocks Owner' },
  { text: 'Frank Ocean Listener' },
  { text: 'Diddy Kong Main' },
]

// Each descriptor fades in after the previous one, a little fainter each time.
const start = 0.4
const step = 0.6
const duration = 1.2
const roleStyle = (i: number) => ({
  opacity: 0.9 - (i * 0.75) / (roles.length - 1),
  animationDelay: `${start + i * step}s`,
})
</script>

<template>
  <section id="intro">
    <div>
      <h1>Ryan Burke</h1>
      <ul class="roles">
        <li v-for="(role, i) in roles" :key="role.text" :style="roleStyle(i)">
          {{ role.text }}<template v-if="role.note"> <sup>{{ role.note }}</sup></template>
        </li>
      </ul>
    </div>
    <!-- Waits for the descriptors to finish fading in. -->
    <ScrollCue target="about" :delay="start + (roles.length - 1) * step + duration" />
  </section>
</template>

<style scoped>
section {
  display: grid;
  place-items: center;
  background: #7d2011;
  text-align: center;
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

.roles sup {
  font-size: 0.5em;
  line-height: 0;
}

/* Timing and fading are set per descriptor in the script. */
.roles li {
  animation: fade-in 1.2s ease backwards;
}

@keyframes fade-in {
  from { opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .roles li { animation: none; }
}
</style>
