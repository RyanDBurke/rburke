<script setup lang="ts">
import ScrollingHeading from './ScrollingHeading.vue'
import PhotoCarousel from './PhotoCarousel.vue'

// Every image in src/assets/photography. Drop a photo in that folder to add it; list it in
// `backs` below to give it a title and a place in the order.
const files = import.meta.glob<string>('../assets/photography/*.{jpg,jpeg,png,webp}', {
  eager: true,
  import: 'default',
})
// Every photo is shown as a 4:5 portrait, except these, which are shown as 5:4 landscapes.
const landscape = new Set(['la-romana', 'west-village-2'])

// The carousel's photos, IN DISPLAY ORDER, with the back of each one (shown when it's tapped):
// a title, then "Shot on <camera> with <film>". `article` is the optional "a" before the camera.
// Keyed by file name (without the extension). A photo in the folder but missing here goes at
// the end of the row and shows just its file name.
type Back = { title: string; camera: string; film: string; article?: string }
const backs: Record<string, Back> = {
  'la-romana': { title: 'La Romana', article: 'a', camera: 'Nikon L35AF', film: 'Portra 400' },
  'west-village-2': { title: 'West Village', camera: 'Fuji X100VI', film: 'Portra 400 Emulation' },
  'collin-thao': { title: 'Brooklyn Bridge', camera: 'Fuji GA645zi', film: 'Portra 400' },
  'vine': { title: 'West Village', camera: 'Fuji GA645zi', film: 'Portra 400' },
  'fountain': { title: 'Central Park', camera: 'Fuji GA645zi', film: 'Portra 400' },
  'dami': { title: 'Dami', camera: 'Bronica-SQA', film: 'Portra 800' },
  'film-sheet': { title: 'I Love You, I\'m Sorry', camera: 'Bronica-SQA', film: 'Portra 800' },
  'iloveyouimsorry': { title: 'I Love You, I\'m Sorry', camera: 'Bronica-SQA', film: 'Portra 800' },
  'joel-sittin-2': { title: 'I Love You, I\'m Sorry', camera: 'Bronica-SQA', film: 'Portra 800' },
  'abuelita': { title: 'Abuelita', article: 'a', camera: 'Nikon L35AF', film: 'Portra 400' },
  'arizona-title-card': { title: 'Arizona', article: 'a', camera: 'Fuji GA645zi', film: 'Kodak Gold 200' },
  'brandon-4x5': { title: 'Desert Biking', camera: 'Nikon L35AF', film: 'Kodak Gold 200' },
  'brookside': { title: 'Brookside', camera: 'Olympus OM-2N', film: 'Kodak Gold 200' },
  'france-feet': { title: 'Louvre', camera: 'Olympus XA', film: 'Kodak Ultramax 400' },
  'sevilla': { title: 'Sevilla', camera: 'Fuji GA645zi', film: 'Fuji Pro 400H' },
  'madrid': { title: 'Madrid', camera: 'Olympus XA', film: 'Kodak Gold 200' },
  'giustis': { title: 'The Giustis', camera: 'Bronica-SQA', film: 'Portra 800' },
  'paddleboard': { title: 'Coastal', camera: 'Nikon L35AF', film: 'Portra 400' },
  'solo sitting': { title: 'Rio', camera: 'Bronica SQ-A', film: 'Kodak 400 TMax' },
}

// Position in the list above; photos not listed sort after it, by file name.
const order = Object.keys(backs)
const fileName = (path: string) => path.split('/').pop()!.replace(/\.\w+$/, '')
const rank = (path: string) => {
  const i = order.indexOf(fileName(path))
  return i === -1 ? order.length : i
}

const photos = Object.keys(files).sort().sort((a, b) => rank(a) - rank(b)).map(path => {
  const file = fileName(path)
  const name = file.replace(/[-_]+/g, ' ')
  return {
    src: files[path],
    alt: `Film photo: ${name}`,
    landscape: landscape.has(file),
    back: backs[file] ?? { title: name, camera: '', film: '' },
  }
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
    <!-- The carousel grows its own photos on scroll, so its window stays full width. -->
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
