<script setup lang="ts">
// Host cheat sheet for a phone: every round's question with its answers already revealed,
// styled like the game board but without teams, scores or game controls.
import type { Round } from './feud'

defineProps<{ rounds: Round[] }>()
const emit = defineEmits<{ back: [] }>()
</script>

<template>
  <div class="answers-page">
    <button type="button" class="back" @click="emit('back')">← Back</button>

    <section v-for="(round, i) in rounds" :key="i" class="round">
      <span class="round-label">Round {{ i + 1 }} of {{ rounds.length }}</span>
      <h2 class="question">{{ round.question }}</h2>
      <!-- Like the board: answers 1–4 down the left column, 5–8 down the right. -->
      <div class="board">
        <div v-for="slot in 8" :key="slot" class="tile" :class="{ empty: !round.answers[slot - 1] }">
          <template v-if="round.answers[slot - 1]">
            <!-- The tile number on the game board, so the host knows which one to flip. -->
            <span class="answer-num">{{ slot }}</span>
            <span class="answer-text">{{ round.answers[slot - 1].text }}</span>
            <span class="answer-points">{{ round.answers[slot - 1].points }}</span>
          </template>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.answers-page {
  --amber: #f59e0b;
  --gold: #fbbf24;
  --cream: #FDFBD4;
  --ink: #0C0C0C;
  align-self: start;
  display: grid;
  gap: 2.5rem;
  width: min(70rem, 100%);
  padding: 1rem 1rem 4rem;
  background: var(--ink);
  color: var(--cream);
  font-family: system-ui, sans-serif;
}

.back {
  justify-self: start;
  padding: 0.5rem 1rem;
  border: 1px solid rgba(253, 251, 212, 0.3);
  border-radius: 0.4rem;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}

.round {
  display: grid;
  gap: 0.75rem;
}

.round-label {
  font-size: 0.85rem;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  opacity: 0.7;
}

.question {
  margin: 0;
  font: 700 clamp(1.1rem, 2.6vw, 1.8rem) / 1.2 system-ui, sans-serif;
  text-align: center;
  text-transform: uppercase;
}

.board {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: repeat(4, 3.5rem);
  grid-auto-flow: column;
  gap: 0.6rem;
  padding: 0.75rem;
  border: 3px solid rgba(251, 191, 36, 0.6);
  border-radius: 1rem;
  background: rgba(0, 0, 0, 0.45);
}

.tile {
  display: flex;
  align-items: center;
  overflow: hidden;
  border-radius: 0.5rem;
  background: var(--cream);
  color: var(--ink);
  font: 800 1.15rem system-ui, sans-serif;
}

.tile.empty {
  border: 2px solid rgba(253, 251, 212, 0.06);
  background: rgba(253, 251, 212, 0.02);
}

.answer-text {
  flex: 1;
  padding: 0 0.7em;
  text-align: center;
  text-transform: uppercase;
  font-size: 0.9em;
}

.answer-num {
  flex: none;
  display: grid;
  place-items: center;
  width: 1.9em;
  height: 1.9em;
  margin-left: 0.5em;
  border-radius: 50%;
  background: var(--ink);
  color: var(--gold);
  font-size: 0.9em;
}

.answer-points {
  align-self: stretch;
  display: grid;
  place-items: center;
  min-width: 2.6em;
  background: var(--amber);
}

/* Phones: one column of just the real answers, like the game's phone layout. */
@media (max-width: 700px) {
  .board {
    grid-template-columns: 1fr;
    grid-template-rows: none;
    grid-auto-flow: row;
    grid-auto-rows: minmax(3rem, auto);
  }

  .tile.empty {
    display: none;
  }

  .tile {
    font-size: 1rem;
  }

  .answer-text {
    padding: 0.5em 0.7em;
  }
}
</style>
