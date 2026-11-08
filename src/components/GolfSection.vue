<script setup lang="ts">
import ScrollingHeading from './ScrollingHeading.vue'
import { vScrollScale } from '../scrollScale'

// A round's hole-by-hole card: par and Ryan's score for holes 1-18.
type Card = { pars: number[]; scores: number[] }
type Round = { score: number; date: string; course: string; card?: Card }

// Laytonsville Golf Course, par 71 (36 out, 35 in), from its published scorecard.
const laytonsvillePars = [4, 4, 3, 5, 3, 5, 4, 4, 4, 4, 4, 3, 4, 4, 4, 3, 4, 5]

// Each personal best, best score first. The first one is the current best; the rest are
// struck through. Add a new round to the top of the list when the record falls. A round
// with a `card` shows its scorecard under it.
const rounds: Round[] = [
  {
    score: 93, date: 'July 15, 2026', course: 'Laytonsville',
    card: { pars: laytonsvillePars, scores: [5, 4, 5, 7, 3, 6, 4, 6, 5, 6, 6, 5, 4, 5, 6, 5, 4, 7] },
  },
  { score: 96, date: 'April 19, 2026', course: 'Laytonsville' },
  { score: 100, date: 'March 8, 2026', course: 'Needwood' },
  { score: 108, date: 'January 12, 2026', course: 'Northwest Park' },
  { score: 111, date: 'October 26, 2025', course: 'Fairway Hills' },
  { score: 119, date: 'August 29, 2025', course: 'Needwood' },
]

const sum = (list: number[]) => list.reduce((a, b) => a + b, 0)

// A card split into its two nines, as on a paper scorecard. The back nine also carries the total.
function nines(card: Card) {
  return [
    { label: 'Out', start: 0, total: false },
    { label: 'In', start: 9, total: true },
  ].map(({ label, start, total }) => ({
    label,
    holes: Array.from({ length: 9 }, (_, i) => ({
      number: start + i + 1,
      par: card.pars[start + i],
      score: card.scores[start + i],
    })),
    par: sum(card.pars.slice(start, start + 9)),
    score: sum(card.scores.slice(start, start + 9)),
    total: total ? { par: sum(card.pars), score: sum(card.scores) } : undefined,
  }))
}

// Scorecard markings: a circle under par, a box for a bogey, a double box for worse.
function mark(score: number, par: number) {
  const diff = score - par
  if (diff < 0) return 'under'
  if (diff === 1) return 'bogey'
  if (diff >= 2) return 'double'
  return ''
}
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
            <!-- Only the current best gets Ryan's picture and the golf icon. -->
            shot my <img v-if="i === 0" class="inline-pic" src="/images/me.png" alt="" width="773" height="977"> personal best <span class="score">{{ round.score }}</span>
            on {{ round.date }} at <img v-if="i === 0" class="inline-pic" src="/images/golf-icon.png" alt="" width="256" height="248"> <span class="course">{{ round.course }}</span>
          </component>
          <!-- The round's scorecard, front nine and back nine. -->
          <div v-if="round.card" class="scorecard">
            <table v-for="nine in nines(round.card)" :key="nine.label">
              <caption class="visually-hidden">{{ round.course }}, {{ round.date }}: {{ nine.label === 'Out' ? 'front' : 'back' }} nine</caption>
              <tbody>
                <tr class="hole-row">
                  <th scope="row">Hole</th>
                  <th v-for="hole in nine.holes" :key="hole.number" scope="col">{{ hole.number }}</th>
                  <th scope="col" class="sum">{{ nine.label }}</th>
                  <th v-if="nine.total" scope="col" class="sum">Tot</th>
                </tr>
                <tr class="par-row">
                  <th scope="row">Par</th>
                  <td v-for="hole in nine.holes" :key="hole.number">{{ hole.par }}</td>
                  <td class="sum">{{ nine.par }}</td>
                  <td v-if="nine.total" class="sum">{{ nine.total.par }}</td>
                </tr>
                <tr class="score-row">
                  <th scope="row">Score</th>
                  <td v-for="hole in nine.holes" :key="hole.number">
                    <span :class="['mark', mark(hole.score, hole.par)]">{{ hole.score }}</span>
                  </td>
                  <td class="sum">{{ nine.score }}</td>
                  <td v-if="nine.total" class="sum">{{ nine.total.score }}</td>
                </tr>
              </tbody>
            </table>
          </div>
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

/* Ryan's picture and the golf-hole icon, sitting in the line of text like the About section's. */
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

/* The scorecard under the current best: two nines, side by side where there's room. */
.scorecard {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.8em 1.2em;
  margin-top: 0.7em;
  font-size: 0.45em; /* relative to the best line's large text */
  font-weight: 400;
}

.scorecard table {
  border-collapse: collapse;
  font-variant-numeric: tabular-nums;
}

.scorecard th,
.scorecard td {
  min-width: 2em;
  padding: 0.35em 0.25em;
  border: 1px solid rgba(253, 251, 212, 0.22);
  text-align: center;
  line-height: 1.2;
}

/* Row labels down the left side. */
.scorecard th[scope="row"] {
  padding-inline: 0.6em;
  text-align: left;
  font-weight: 400;
  opacity: 0.7;
}

.hole-row th {
  font-weight: 400;
  opacity: 0.7;
}

.par-row td {
  opacity: 0.8;
}

.score-row td {
  font-weight: 700;
}

/* Out, In and Tot columns. */
.scorecard .sum {
  font-weight: 700;
  background: rgba(253, 251, 212, 0.06);
}

.score-row .sum {
  color: #E31717;
}

/* Scorecard markings around each hole's score. */
.mark {
  display: inline-grid;
  place-items: center;
  min-width: 1.5em;
  height: 1.5em;
}

.mark.under {
  border: 1px solid currentColor;
  border-radius: 50%;
}

.mark.bogey {
  border: 1px solid currentColor;
}

.mark.double {
  border: 1px solid currentColor;
  outline: 1px solid currentColor;
  outline-offset: 2px;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
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
