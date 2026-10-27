<script setup lang="ts">
import ScrollCue from './ScrollCue.vue'
</script>

<template>
  <section id="contact">
    <h2>contact</h2>
    <ScrollCue target="intro" label="back to top ↑" />
  </section>
</template>

<style scoped>
section {
  display: grid;
  place-items: center;
  background: #7d2011;
}

h2 {
  margin: 0;
  font-size: clamp(2rem, 8vw, 5rem);
}
</style>
