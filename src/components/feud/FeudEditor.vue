<script setup lang="ts">
// Barebones editor for the rounds. Edits a copy and saves the whole set at once.
import { computed, ref } from 'vue'
import { feudRequest, type Round } from './feud'

const props = defineProps<{ password: string, rounds: Round[] }>()
const emit = defineEmits<{ saved: [rounds: Round[]], back: [] }>()

const copy = (rounds: Round[]): Round[] => JSON.parse(JSON.stringify(rounds))
const draft = ref(copy(props.rounds))
const saved = ref(JSON.stringify(props.rounds))
const dirty = computed(() => JSON.stringify(draft.value) !== saved.value)
const saveError = ref('')
const justSaved = ref(false)
const busy = ref(false)
// A save error stays until the next save; otherwise "Saved." only shows until the next edit.
const status = computed(() => saveError.value || (dirty.value ? 'Unsaved changes' : justSaved.value ? 'Saved.' : ''))
// The server accepts at most 50 rounds.
const MAX_ROUNDS = 50

// Each round's answers share 100 points, like a survey of 100 people.
const TOTAL_POINTS = 100

function pointsLeft(round: Round) {
  return TOTAL_POINTS - round.answers.reduce((sum, a) => sum + (Number(a.points) || 0), 0)
}

function addRound() {
  draft.value.push({ question: '', answers: [{ text: '', points: 0 }] })
}

function move(i: number, by: number) {
  const [round] = draft.value.splice(i, 1)
  draft.value.splice(i + by, 0, round)
}

async function save() {
  busy.value = true
  saveError.value = ''
  justSaved.value = false
  try {
    const rounds = await feudRequest('PUT', { password: props.password, rounds: draft.value })
    // The server sorts answers by points, so show its version.
    draft.value = copy(rounds)
    saved.value = JSON.stringify(rounds)
    emit('saved', rounds)
    justSaved.value = true
  } catch (e) {
    saveError.value = (e as Error).message
  } finally {
    busy.value = false
  }
}

function back() {
  if (!dirty.value || confirm('Leave without saving your changes?')) emit('back')
}
</script>

<template>
  <div class="editor">
    <header>
      <button type="button" @click="back">← Back</button>
      <h2>Edit questions</h2>
      <span class="status" role="status">{{ status }}</span>
      <button type="button" class="primary" :disabled="busy || !dirty" @click="save">{{ busy ? 'Saving…' : 'Save' }}</button>
    </header>

    <p class="hint">Up to 8 answers per round, 0–100 points each. Answers are sorted by points when you save.</p>

    <fieldset v-for="(round, i) in draft" :key="i">
      <legend>
        Round {{ i + 1 }}
        <button type="button" :disabled="i === 0" aria-label="Move up" @click="move(i, -1)">↑</button>
        <button type="button" :disabled="i === draft.length - 1" aria-label="Move down" @click="move(i, 1)">↓</button>
        <button type="button" class="danger" @click="draft.splice(i, 1)">Delete round</button>
      </legend>

      <textarea v-model="round.question" rows="2" maxlength="300" placeholder="Question" aria-label="Question" />

      <div v-for="(answer, j) in round.answers" :key="j" class="answer">
        <input v-model="answer.text" maxlength="80" placeholder="Answer" aria-label="Answer">
        <input v-model.number="answer.points" type="number" min="0" max="100" step="1" aria-label="Points">
        <button type="button" aria-label="Remove answer" @click="round.answers.splice(j, 1)">✕</button>
      </div>
      <div class="round-footer">
        <button v-if="round.answers.length < 8" type="button" @click="round.answers.push({ text: '', points: 0 })">+ Answer</button>
        <span class="points-left" :class="{ over: pointsLeft(round) < 0 }">
          {{ pointsLeft(round) < 0 ? `${-pointsLeft(round)} points over ${TOTAL_POINTS}` : `${pointsLeft(round)} of ${TOTAL_POINTS} points left` }}
        </span>
      </div>
    </fieldset>

    <button type="button" class="add-round" :disabled="draft.length >= MAX_ROUNDS" @click="addRound">+ Round</button>
  </div>
</template>

<style scoped>
.editor {
  align-self: start;
  width: min(44rem, 100%);
  padding: 1rem 1rem 4rem;
}

header {
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 0;
  background: #0C0C0C;
}

h2 {
  margin: 0;
  flex: 1;
  font-size: 1.25rem;
}

.status {
  font-size: 0.9rem;
  opacity: 0.8;
}

.hint {
  margin: 0 0 1rem;
  font-size: 0.9rem;
  opacity: 0.7;
}

fieldset {
  display: grid;
  gap: 0.5rem;
  margin: 0 0 1rem;
  padding: 0.75rem;
  border: 1px solid rgba(253, 251, 212, 0.25);
  border-radius: 0.4rem;
}

legend {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0 0.4rem;
  font-weight: 700;
}

.answer {
  display: grid;
  grid-template-columns: 1fr 5rem auto;
  gap: 0.4rem;
}

textarea,
input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid rgba(253, 251, 212, 0.3);
  border-radius: 0.3rem;
  background: #1a1a1a;
  color: inherit;
  font: inherit;
}

button {
  padding: 0.4rem 0.8rem;
  border: 1px solid rgba(253, 251, 212, 0.3);
  border-radius: 0.3rem;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}

button:disabled {
  opacity: 0.4;
  cursor: default;
}

button.primary {
  border-color: #f59e0b;
  background: #f59e0b;
  color: #0C0C0C;
  font-weight: 700;
}

button.danger {
  margin-left: auto;
  border-color: rgba(248, 113, 113, 0.5);
  color: #f87171;
  font-weight: 400;
}

.add-round {
  justify-self: start;
}

.round-footer {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.points-left {
  margin-left: auto;
  font-size: 0.9rem;
  opacity: 0.8;
}

.points-left.over {
  color: #f87171;
  opacity: 1;
}
</style>
