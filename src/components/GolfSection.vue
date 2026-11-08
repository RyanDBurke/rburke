<script setup lang="ts">
import ScrollingHeading from './ScrollingHeading.vue'
import { vScrollScale } from '../scrollScale'

// Each personal best, best score first. The first one is the current best; the rest are
// struck through. Add a new round to the top of the list when the record falls.
const rounds = [
  { score: 93, date: 'July 15, 2026', course: 'Laytonsville' },
  { score: 96, date: 'April 19, 2026', course: 'Laytonsville' },
  { score: 100, date: 'March 8, 2026', course: 'Needwood' },
  { score: 108, date: 'January 12, 2026', course: 'Northwest Park' },
  { score: 111, date: 'October 26, 2025', course: 'Fairway Hills' },
  { score: 119, date: 'August 29, 2025', course: 'Needwood' },
]
</script>

<template>
  <!-- The heading sits above the rounds; the nav link lands on it. -->
  <div id="golf">
  <ScrollingHeading :words="['GOLF']" />
  <!-- Like the other sections, the list sticks while this container scrolls past. -->
  <div class="golf-scroll">
    <section aria-label="Golf">
      <ol v-scroll-scale class="rounds">
        <li v-for="(round, i) in rounds" :key="round.date" :class="{ best: i === 0 }">
          <!-- <s> marks a record that no longer stands. -->
          <component :is="i === 0 ? 'span' : 's'">
            <!-- Only the current best gets Ryan's picture. -->
            shot my <img v-if="i === 0" class="inline-pic" src="/images/me.png" alt="" width="773" height="977"> personal best <span class="score">{{ round.score }}</span>
            on {{ round.date }} at <span class="course">{{ round.course }}</span>
          </component>
        </li>
      </ol>
    </section>
  </div>
  </div>
</template>

<style scoped>
.golf-scroll {
  height: 150vh;
}

/* Like the other sections: centered in a full-screen panel that sticks while its taller
   container scrolls past. */
section {
  display: grid;
  place-items: center;
  position: sticky;
  top: 0;
  height: 100vh;
  height: 100svh; /* the visible screen with the phone toolbar showing, like the intro */
  overflow-x: clip;
  padding: 5rem 1rem;
}

.rounds {
  display: grid;
  gap: 0.6em;
  width: 70vw; /* matches the About section's paragraph width */
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: min(max(1.1rem, 2.2vw), 4dvh);
  line-height: 1.3;
  text-align: center;
}

/* Ryan's picture, sitting in the line of text like the About section's. */
.inline-pic {
  display: inline-block;
  width: auto;
  height: 1.2em;
  vertical-align: -0.2em;
}

/* Past records: struck through and faded, so the current best stands out. */
.rounds s {
  opacity: 0.6;
  text-decoration-thickness: 0.08em;
  /* A see-through strike line, so the old scores stay easy to read. */
  text-decoration-color: rgba(253, 251, 212, 0.4);
}

/* The current best: bigger, with the score in the site's red. */
.best {
  margin-bottom: 0.4em;
  font-size: 1.35em;
  font-weight: 700;
}

.best .score {
  color: #E31717;
}

.best .course {
  color: #1754E3;
}

@media (max-width: 767px) {
  section {
    padding: 4.5rem 1rem 1rem;
  }

  .rounds {
    width: 100%;
    font-size: min(5vw, 2.6dvh);
  }
}
</style>
