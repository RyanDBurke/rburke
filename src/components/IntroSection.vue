<script setup lang="ts">
import ScrollCue from './ScrollCue.vue'
</script>

<template>
  <section id="intro">
    <div>
      <h1>Ryan Burke</h1>
      <ul class="roles">
        <li>Software Engineer</li>
        <li>Film Photographer</li>
        <li>Oil Pastel Art Maker <sup>(sometimes)</sup></li>
        <li>Basketball Junkie</li>
        <li>Twenty Handicap Golfer</li>
      </ul>
    </div>
    <!-- Waits for the descriptors to finish fading in. -->
    <ScrollCue target="about" :delay="4" />
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

/* Each descriptor fades in after the previous one, a little fainter each time. */
.roles li {
  animation: fade-in 1.2s ease backwards;
}

.roles li:nth-child(1) { opacity: 0.9; animation-delay: 0.4s; }
.roles li:nth-child(2) { opacity: 0.75; animation-delay: 1.0s; }
.roles li:nth-child(3) { opacity: 0.6; animation-delay: 1.6s; }
.roles li:nth-child(4) { opacity: 0.45; animation-delay: 2.2s; }
.roles li:nth-child(5) { opacity: 0.3; animation-delay: 2.8s; }

@keyframes fade-in {
  from { opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .roles li { animation: none; }
}
</style>
