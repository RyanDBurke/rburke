<script setup lang="ts">
import { vScrollScale } from '../scrollScale'
import BeanViewer from './BeanViewer.vue'
import ScrollingHeading from './ScrollingHeading.vue'
</script>

<template>
  <!-- The heading (Bean's picture) sits above the 3D Bean; the nav link lands on it. -->
  <div id="bean">
  <ScrollingHeading image="/images/bean.png" />
  <!-- Like Experience, the section sticks while its scroll container passes. -->
  <div class="bean-scroll">
    <section aria-label="Bean">
      <BeanViewer v-scroll-scale />
    </section>
  </div>
  </div>
</template>

<style scoped>
.bean-scroll {
  height: 150vh;
}

section {
  position: sticky;
  top: 0;
  height: 100vh;
  /* The top padding clears the floating nav. */
  padding: 5rem 1rem 2rem;
}

@media (max-width: 767px) {
  section {
    padding: 4.5rem 1rem 1rem;
  }
}
</style>
