<script setup lang="ts">
import ScrollingHeading from './ScrollingHeading.vue'
import PhotoCarousel from './PhotoCarousel.vue'

// Every image in src/assets/photography, in file-name order. Drop a photo in that folder to add it.
const files = import.meta.glob<string>('../assets/photography/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
})
const photos = Object.keys(files).sort().map(path => {
  const name = path.split('/').pop()!.replace(/.w+$/, '').replace(/[-_]+/g, ' ')
  return { src: files[path], alt: `Film photo: ${name}` }
})
</script>

<template>
  <!-- The heading sits above the photos; the nav link lands on it. -->
  <div id="photography">
  <ScrollingHeading :words="['FILM']" />
  <!-- Like Experience and Bean, the photos stick while this container scrolls past. -->
  <div class="photography-scroll">
  <section aria-label="Film photography">
    <!-- A drifting, draggable row of photos, at every screen size. -->
    <PhotoCarousel :photos="photos" />
  </section>
  </div>
  </div>
</template>

<style scoped>
section {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  place-items: center;
  /* Keeps the photos clear of the floating nav; the row runs edge to edge. */
  padding: 5rem 0;
  /* Sticks for a screen's height, like the other sections. */
  position: sticky;
  top: 0;
  height: 100vh;
  /* The global `main > section` rule no longer reaches this section now that it sits under
     its heading, so it keeps the page from widening sideways itself. */
  overflow-x: clip;
}

.photography-scroll {
  height: 150vh;
}
</style>
