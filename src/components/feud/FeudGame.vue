<script setup lang="ts">
// The host-run game. Each round opens on a full-page question, then the board, where the host
// clicks tiles to reveal answers, adds strikes, and awards the round's pot to a team.
// Keys: Enter/Space/→ question page to board, 1–8 reveal, X strike, Q back to the question page.
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { introMusic, preloadSounds, sounds, type Round } from './feud'

const props = defineProps<{ rounds: Round[] }>()
const emit = defineEmits<{ quit: [] }>()

const phase = ref<'setup' | 'question' | 'round' | 'final'>('setup')
const teams = reactive([{ name: 'Team 1', score: 0 }, { name: 'Team 2', score: 0 }])
const index = ref(0)
const round = computed(() => props.rounds[index.value])
const last = computed(() => index.value === props.rounds.length - 1)
const revealed = ref<boolean[]>([])
const strikes = ref(0)
const pot = ref(0)
const awardedTo = ref<number | null>(null)
const steal = computed(() => strikes.value === 3 && awardedTo.value === null)
// How many big ✕s are flashing on screen right now.
const flash = ref(0)
let flashTimer: ReturnType<typeof setTimeout> | undefined

// Puts the current round's board back to how it started.
function clearBoard() {
  revealed.value = round.value.answers.map(() => false)
  strikes.value = 0
  pot.value = 0
  awardedTo.value = null
  flash.value = 0
}

function startRound(i: number) {
  index.value = i
  clearBoard()
  phase.value = 'question'
}

// Undo for this round only: takes back any points it awarded and clears the board.
// Earlier rounds' scores are left alone.
function resetRound() {
  if (!confirm('Reset this round? Its answers are hidden again and any points it awarded are taken back.')) return
  if (awardedTo.value !== null) teams[awardedTo.value].score -= pot.value
  clearBoard()
}

// The intro music comes back at half volume: from 0:22 on each question page, and from the
// start on the final scores. It stops when those screens are left.
watch(phase, p => {
  if (p === 'question') introMusic.play(22, 0.5)
  else if (p === 'final') introMusic.play(0, 0.5)
  else introMusic.stop()
})

function begin() {
  stopMusic()
  teams.forEach(t => { t.score = 0 })
  startRound(0)
}

// Intro music starts as the intro opens. Browsers allow it because the host just clicked
// "Start game"; if one blocks it anyway, the music button stays on "Play" to start it by hand.
const music = ref<HTMLAudioElement>()
const musicPlaying = ref(false)

function playMusic() {
  music.value?.play().catch(() => { musicPlaying.value = false })
}

function stopMusic() {
  music.value?.pause()
  if (music.value) music.value.currentTime = 0
}

function toggleMusic() {
  if (musicPlaying.value) stopMusic()
  else playMusic()
}

// Points go into the pot until it's awarded; reveals after that are just for show.
function reveal(i: number) {
  const answer = round.value.answers[i]
  if (!answer || revealed.value[i]) return
  revealed.value[i] = true
  if (awardedTo.value === null) pot.value += answer.points
  sounds.reveal()
}

// The first answer still hidden (-1 once they're all showing), for the "Reveal" button,
// which flips answers one at a time in order, each with its own ding, just like clicking its tile.
const nextHidden = computed(() => revealed.value.findIndex(shown => !shown))

// Three strikes opens the steal; a strike after that (a failed steal) flashes a single ✕.
function strike() {
  flash.value = strikes.value < 3 ? ++strikes.value : 1
  sounds.strike()
  clearTimeout(flashTimer)
  flashTimer = setTimeout(() => { flash.value = 0 }, 1200)
}

function award(team: number) {
  if (awardedTo.value !== null) return
  teams[team].score += pot.value
  awardedTo.value = team
  sounds.award()
}

function next() {
  if (awardedTo.value === null && pot.value > 0 && !confirm('Nobody has been awarded this round’s points. Move on anyway?')) return
  if (last.value) {
    phase.value = 'final'
  } else {
    startRound(index.value + 1)
  }
}

function quit() {
  const playing = phase.value === 'question' || phase.value === 'round'
  if (!playing || confirm('Quit the game? The scores will be lost.')) emit('quit')
}

function toggleFullscreen() {
  if (document.fullscreenElement) void document.exitFullscreen()
  else void document.documentElement.requestFullscreen?.()
}

// Settings menu behind the gear in the bottom-right corner.
const settingsOpen = ref(false)
const fullscreen = ref(false)
const syncFullscreen = () => { fullscreen.value = !!document.fullscreenElement }

function fromSettings(action: () => void) {
  settingsOpen.value = false
  action()
}

const winner = computed(() => {
  const [a, b] = teams
  if (a.score === b.score) return 'It’s a tie!'
  return `${(a.score > b.score ? a : b).name} wins!`
})

function onKey(e: KeyboardEvent) {
  if (e.ctrlKey || e.metaKey || e.altKey) return
  const target = e.target as HTMLElement
  const key = e.key.toLowerCase()
  if (settingsOpen.value) {
    if (key === 'escape') settingsOpen.value = false
    return
  }
  if (target.closest('input, textarea')) return
  // Enter and Space already press a focused button; don't also act on them here.
  if ((key === 'enter' || key === ' ') && target.closest('button')) return
  if (phase.value === 'question' && ['enter', ' ', 'arrowright'].includes(key)) phase.value = 'round'
  else if (phase.value !== 'round') return
  else if (/^[1-8]$/.test(key)) reveal(Number(key) - 1)
  else if (key === 'x') strike()
  else if (key === 'q') phase.value = 'question'
  else return
  e.preventDefault()
}

onMounted(() => {
  window.addEventListener('keydown', onKey)
  document.addEventListener('fullscreenchange', syncFullscreen)
  syncFullscreen()
  preloadSounds()
  playMusic()
})
onUnmounted(() => {
  stopMusic()
  introMusic.stop()
  window.removeEventListener('keydown', onKey)
  document.removeEventListener('fullscreenchange', syncFullscreen)
  clearTimeout(flashTimer)
})
</script>

<template>
  <div class="game">
    <!-- Intro: the skyline behind, the ring in the middle, and the title over the ring. -->
    <section v-if="phase === 'setup'" class="intro">
      <audio
        ref="music"
        src="/audio/feud-intro.mp3"
        preload="auto"
        @play="musicPlaying = true"
        @pause="musicPlaying = false"
        @ended="musicPlaying = false"
      />
      <div class="logo">
        <img class="ring" src="/images/feud-ring.png" alt="">
        <h1 class="title">
          <span class="title-top">THANKSGIVING</span>
          <span class="title-bottom">FEUD</span>
        </h1>
      </div>
      <div class="intro-start">
        <button type="button" class="primary" @click="begin">START</button>
      </div>
    </section>

    <!-- Each round opens on its question, full page, before the board. -->
    <section v-else-if="phase === 'question'" class="question-page">
      <span class="round-label">Round {{ index + 1 }} of {{ rounds.length }}</span>
      <h2 class="question-big">{{ round.question }}</h2>
      <div class="row">
        <button type="button" class="primary" @click="phase = 'round'">Show the board</button>
      </div>
    </section>

    <template v-else-if="phase === 'round'">
      <header class="scoreboard">
        <div v-for="(team, t) in teams" :key="t" class="team" :class="[`team-${t}`, { won: awardedTo === t }]">
          <input v-model="team.name" class="team-name" maxlength="24" :aria-label="`Team ${t + 1} name`">
          <input v-model.number="team.score" class="team-score" type="number" :aria-label="`${team.name} score`">
        </div>
        <div class="pot">
          <span class="round-label">Round {{ index + 1 }} of {{ rounds.length }}</span>
          <span class="pot-value">{{ pot }}</span>
          <span class="strikes" :aria-label="`${strikes} strikes`">
            <span v-for="n in 3" :key="n" :class="{ on: n <= strikes }">✕</span>
          </span>
        </div>
      </header>

      <p class="question">{{ round.question }}</p>

      <div class="board">
        <button
          v-for="slot in 8"
          :key="`${index}-${slot}`"
          type="button"
          class="tile"
          :class="{ revealed: revealed[slot - 1], empty: !round.answers[slot - 1] }"
          :disabled="!round.answers[slot - 1]"
          :aria-label="round.answers[slot - 1] ? (revealed[slot - 1] ? `${round.answers[slot - 1].text}, ${round.answers[slot - 1].points}` : `Reveal answer ${slot}`) : undefined"
          @click="reveal(slot - 1)"
        >
          <span class="face front"><span v-if="round.answers[slot - 1]" class="num">{{ slot }}</span></span>
          <span v-if="round.answers[slot - 1]" class="face back">
            <span class="answer-text">{{ round.answers[slot - 1].text }}</span>
            <span class="answer-points">{{ round.answers[slot - 1].points }}</span>
          </span>
        </button>
      </div>

      <footer class="controls">
        <button type="button" @click="phase = 'question'">Show question <kbd>Q</kbd></button>
        <button type="button" class="strike" @click="strike">✕ Strike <kbd>X</kbd></button>
        <button v-for="(team, t) in teams" :key="t" type="button" :disabled="awardedTo !== null" @click="award(t)">
          Award {{ pot }} to {{ team.name }}
        </button>
        <button type="button" :disabled="nextHidden === -1" @click="reveal(nextHidden)">
          Reveal{{ nextHidden === -1 ? '' : ` ${nextHidden + 1}` }}
        </button>
        <button type="button" class="primary" @click="next">{{ last ? 'Final scores' : 'Next round' }}</button>
      </footer>

      <div v-if="steal" class="steal">STEAL!</div>
      <div v-if="flash" class="strike-flash" aria-hidden="true">
        <span v-for="n in flash" :key="n">✕</span>
      </div>
    </template>

    <section v-else class="center final">
      <h1>{{ winner }}</h1>
      <div class="final-scores">
        <div v-for="(team, t) in teams" :key="t" class="final-team">
          <span>{{ team.name }}</span>
          <strong>{{ team.score }}</strong>
        </div>
      </div>
      <div class="row">
        <button type="button" @click="emit('quit')">Back to menu</button>
        <button type="button" class="primary" @click="begin">Play again</button>
      </div>
    </section>

    <!-- Settings: a gear in the bottom-right on the intro, the question page and the board. -->
    <template v-if="phase !== 'final'">
      <div v-if="settingsOpen" class="settings-backdrop" @click="settingsOpen = false" />
      <div class="settings">
        <div v-if="settingsOpen && phase === 'setup'" id="feud-settings" class="settings-menu">
          <label class="team-field">
            Team 1
            <input v-model="teams[0].name" maxlength="24">
          </label>
          <label class="team-field">
            Team 2
            <input v-model="teams[1].name" maxlength="24">
          </label>
          <button type="button" :aria-pressed="musicPlaying" @click="toggleMusic">
            {{ musicPlaying ? '■ Stop music' : '♪ Play music' }}
          </button>
          <button type="button" @click="fromSettings(quit)">Back</button>
        </div>
        <div v-else-if="settingsOpen" id="feud-settings" class="settings-menu" role="menu">
          <button type="button" role="menuitem" @click="fromSettings(toggleFullscreen)">
            {{ fullscreen ? 'Exit fullscreen' : 'Fullscreen' }}
          </button>
          <button v-if="phase === 'round'" type="button" role="menuitem" @click="fromSettings(resetRound)">
            ↺ Reset round
          </button>
          <button type="button" role="menuitem" class="danger" @click="fromSettings(quit)">Quit</button>
        </div>
        <button
          type="button"
          class="gear"
          aria-label="Settings"
          aria-haspopup="menu"
          aria-controls="feud-settings"
          :aria-expanded="settingsOpen"
          @click="settingsOpen = !settingsOpen"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.game {
  --amber: #f59e0b;
  --gold: #fbbf24;
  --cream: #FDFBD4;
  --ink: #0C0C0C;
  --red: #ef4444;
  position: fixed;
  inset: 0;
  display: grid;
  grid-template-rows: auto auto 1fr auto;
  gap: 1.5vh;
  padding: 2vh 2vw;
  background:
    radial-gradient(ellipse at 50% 40%, rgba(245, 158, 11, 0.14), transparent 65%),
    var(--ink);
  color: var(--cream);
  font-family: system-ui, sans-serif;
  overflow: hidden;
}

button {
  padding: 0.6em 1em;
  border: 1px solid rgba(253, 251, 212, 0.3);
  border-radius: 0.4rem;
  background: rgba(253, 251, 212, 0.04);
  color: inherit;
  font: inherit;
  cursor: pointer;
}

button:disabled {
  opacity: 0.4;
  cursor: default;
}

button.primary {
  border-color: var(--amber);
  background: var(--amber);
  color: var(--ink);
  font-weight: 700;
}

kbd {
  margin-left: 0.3em;
  padding: 0 0.35em;
  border: 1px solid currentColor;
  border-radius: 0.25em;
  font-size: 0.75em;
  opacity: 0.6;
}

/* Setup and final screens. */
.center {
  grid-row: 1 / -1;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 1.5rem;
  text-align: center;
}

h1 {
  margin: 0;
  font: 700 clamp(2.5rem, 8vw, 6rem) / 1 'Playfair Display Variable', Georgia, serif;
  color: var(--gold);
}

.center p {
  margin: 0;
  font-size: 1.2rem;
  opacity: 0.8;
}

/* Intro screen. */
.intro {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-rows: 1fr auto;
  background: #0b1020 url('/images/feud-skyline.jpg') center / cover no-repeat;
}

.logo {
  display: grid;
  place-items: center;
  min-height: 0;
}

/* The ring and the title share one grid cell, so the title sits on top of the ring. */
.ring,
.title {
  grid-area: 1 / 1;
}

.ring {
  height: min(68vh, 72vw);
  width: auto;
}

.intro .title {
  display: grid;
  justify-items: center;
  margin: 0;
  font-family: 'Arial Black', 'Arial Bold', Gadget, sans-serif;
  font-weight: 900;
  line-height: 0.95;
  letter-spacing: 0.01em;
  /* White glow around the letters (drop-shadow follows the outlined shapes). */
  filter: drop-shadow(0 0 0.5vh #fff) drop-shadow(0 0 2vh rgba(255, 255, 255, 0.65));
}

.title span {
  background: linear-gradient(180deg, #fff9b0 0%, #ffe14a 35%, #ffc400 65%, #f59e0b 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  /* Black outline; painting the stroke first keeps it outside the yellow. */
  -webkit-text-stroke: 0.05em #000;
  paint-order: stroke fill;
}

/* Both lines the same size, sized so THANKSGIVING (the wider word) fits the screen. */
.title-top,
.title-bottom {
  font-size: min(10.5vw, 15vh);
}

.intro-start {
  display: grid;
  justify-items: center;
  padding: 0 1rem 4vh;
}

.intro-start button {
  padding: 0.55em 2.2em;
  border-radius: 0.6rem;
  font: 900 clamp(1.3rem, 3.5vh, 2rem) 'Arial Black', 'Arial Bold', Gadget, sans-serif;
  letter-spacing: 0.12em;
  box-shadow: 0 0.5rem 2rem rgba(0, 0, 0, 0.5);
}

.row {
  display: flex;
  gap: 0.75rem;
  font-size: 1.1rem;
}

/* Final scores: the intro's skyline, dimmed under a dark layer so the scores stand out. */
.final {
  position: absolute;
  inset: 0;
  /* Without this, the grid row (from .center) would size it to the padded grid, not the screen. */
  grid-row: auto;
  padding: 2vh 2vw;
  background:
    linear-gradient(rgba(5, 8, 20, 0.7), rgba(5, 8, 20, 0.82)),
    #0b1020 url('/images/feud-skyline.jpg') center / cover no-repeat;
}

.final-scores {
  display: flex;
  gap: clamp(1rem, 6vw, 5rem);
}

.final-team {
  display: grid;
  gap: 0.5rem;
  font-size: clamp(1.2rem, 3vw, 2rem);
}

.final-team strong {
  font-size: clamp(3rem, 12vw, 9rem);
  line-height: 1;
  color: var(--gold);
}

/* Scoreboard: team, pot, team. */
.scoreboard {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 2vw;
}

.team {
  display: grid;
  justify-items: center;
  padding: 1vh 1vw;
  border: 2px solid rgba(253, 251, 212, 0.15);
  border-radius: 0.8rem;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.team-0 { grid-column: 1; grid-row: 1; }
.team-1 { grid-column: 3; grid-row: 1; }

.team.won {
  border-color: var(--gold);
  box-shadow: 0 0 2rem rgba(251, 191, 36, 0.35);
}

.team input {
  width: 100%;
  border: 0;
  background: none;
  color: inherit;
  text-align: center;
}

.team-name {
  font: 700 clamp(1rem, 2.6vh, 1.6rem) system-ui, sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.team-score {
  font: 800 clamp(2rem, 7vh, 5rem) / 1 system-ui, sans-serif;
  -moz-appearance: textfield;
  appearance: textfield;
}

.team-score::-webkit-inner-spin-button,
.team-score::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.pot {
  grid-column: 2;
  grid-row: 1;
  display: grid;
  justify-items: center;
  gap: 0.5vh;
}

.round-label {
  font-size: clamp(0.8rem, 1.8vh, 1.1rem);
  text-transform: uppercase;
  letter-spacing: 0.15em;
  opacity: 0.7;
}

.pot-value {
  min-width: 2.2em;
  padding: 0.1em 0.4em;
  border: 3px solid var(--gold);
  border-radius: 0.6rem;
  background: #000;
  font: 800 clamp(2.5rem, 9vh, 6rem) / 1.1 system-ui, sans-serif;
  text-align: center;
}

.strikes {
  display: flex;
  gap: 0.4em;
  font: 900 clamp(1.2rem, 3vh, 2rem) system-ui, sans-serif;
}

.strikes span {
  color: rgba(253, 251, 212, 0.15);
}

.strikes span.on {
  color: var(--red);
}

.question {
  margin: 0;
  min-height: 2.4em;
  display: grid;
  place-items: center;
  font: 700 clamp(1.1rem, 3.4vh, 2.4rem) / 1.2 system-ui, sans-serif;
  text-align: center;
  text-transform: uppercase;
}

/* Full-page question, over the intro's skyline, darkened so the text stands out. */
.question-page {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-rows: auto 1fr auto;
  justify-items: center;
  gap: 2vh;
  padding: 5vh 6vw 4vh;
  background:
    linear-gradient(rgba(5, 8, 20, 0.78), rgba(5, 8, 20, 0.88)),
    #0b1020 url('/images/feud-skyline.jpg') center / cover no-repeat;
  text-align: center;
}

.question-page .round-label {
  font-size: clamp(1rem, 3vh, 1.6rem);
  color: var(--gold);
  opacity: 1;
}

.question-big {
  align-self: center;
  max-width: 22ch;
  margin: 0;
  font: 900 clamp(2rem, min(7vw, 10vh), 6.5rem) / 1.15 'Arial Black', 'Arial Bold', Gadget, sans-serif;
  text-transform: uppercase;
  text-wrap: balance;
  overflow-wrap: break-word;
  animation: rise 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

@keyframes rise {
  from { opacity: 0; transform: translateY(2vh); }
}

/* Board: answers 1–4 down the left column, 5–8 down the right. */
.board {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: repeat(4, 1fr);
  grid-auto-flow: column;
  gap: 1.2vh 1.2vw;
  min-height: 0;
  padding: 1.5vh;
  border: 3px solid rgba(251, 191, 36, 0.6);
  border-radius: 1rem;
  background: rgba(0, 0, 0, 0.45);
}

.tile {
  position: relative;
  padding: 0;
  border: 0;
  background: none;
  perspective: 60rem;
  font: 800 clamp(1rem, 3.6vh, 2.6rem) system-ui, sans-serif;
}

.tile:disabled {
  opacity: 1;
}

.face {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  border-radius: 0.5rem;
  backface-visibility: hidden;
  transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

.front {
  justify-content: center;
  border: 2px solid rgba(245, 158, 11, 0.45);
  background: linear-gradient(180deg, #24201a, #121110);
}

.tile.empty .front {
  border-color: rgba(253, 251, 212, 0.06);
  background: rgba(253, 251, 212, 0.02);
}

.num {
  display: grid;
  place-items: center;
  width: 1.8em;
  height: 1.8em;
  border-radius: 50%;
  background: var(--amber);
  color: var(--ink);
}

.back {
  transform: rotateX(180deg);
  overflow: hidden;
  background: var(--cream);
  color: var(--ink);
}

.tile.revealed .front { transform: rotateX(-180deg); }
.tile.revealed .back { transform: rotateX(0); }

.answer-text {
  flex: 1;
  padding: 0 0.6em;
  overflow: hidden;
  text-overflow: ellipsis;
  text-transform: uppercase;
  white-space: nowrap;
  font-size: 0.85em;
}

.answer-points {
  align-self: stretch;
  display: grid;
  place-items: center;
  min-width: 2.4em;
  background: var(--amber);
}

.tile:not(:disabled):not(.revealed):hover .front {
  border-color: var(--gold);
}

.tile:focus-visible {
  outline: 3px solid var(--gold);
  outline-offset: 3px;
  border-radius: 0.5rem;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  /* Leaves room for the settings gear in the corner. */
  padding-right: 3.5rem;
  font-size: clamp(0.8rem, 1.7vh, 1rem);
}

.settings {
  position: absolute;
  right: 2vw;
  bottom: 2vh;
  z-index: 3;
  display: grid;
  justify-items: end;
  gap: 0.5rem;
}

.settings-backdrop {
  position: absolute;
  inset: 0;
  z-index: 2;
}

.gear {
  display: grid;
  place-items: center;
  width: 2.75rem;
  height: 2.75rem;
  padding: 0;
  border-radius: 50%;
  background: rgba(12, 12, 12, 0.7);
}

.gear svg {
  width: 1.4rem;
  height: 1.4rem;
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: transform 0.3s ease;
}

.gear[aria-expanded='true'] svg {
  transform: rotate(60deg);
}

.settings-menu {
  display: grid;
  min-width: 11rem;
  padding: 0.35rem;
  border: 1px solid rgba(253, 251, 212, 0.25);
  border-radius: 0.6rem;
  background: #161513;
  box-shadow: 0 0.75rem 2rem rgba(0, 0, 0, 0.5);
}

.team-field {
  display: grid;
  gap: 0.25rem;
  padding: 0.4rem 0.6rem;
  font-size: 0.8rem;
  opacity: 0.9;
}

.team-field input {
  width: 14rem;
  max-width: 100%;
  padding: 0.45rem 0.6rem;
  border: 1px solid rgba(253, 251, 212, 0.3);
  border-radius: 0.35rem;
  background: #0c0c0c;
  color: inherit;
  font: inherit;
  font-size: 1rem;
}

.settings-menu button {
  border: 0;
  background: none;
  text-align: left;
}

.settings-menu button:hover,
.settings-menu button:focus-visible {
  background: rgba(253, 251, 212, 0.08);
}

.settings-menu .danger {
  color: #fca5a5;
}

.controls .strike {
  border-color: var(--red);
  color: #fca5a5;
}

.steal {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-6deg);
  padding: 0.2em 0.8em;
  border: 4px solid var(--gold);
  border-radius: 1rem;
  background: rgba(12, 12, 12, 0.85);
  color: var(--gold);
  font: 900 clamp(2rem, 9vh, 6rem) system-ui, sans-serif;
  letter-spacing: 0.1em;
  pointer-events: none;
  animation: pop 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.strike-flash {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3vw;
  background: rgba(0, 0, 0, 0.55);
  color: var(--red);
  font: 900 clamp(8rem, 40vh, 26rem) / 1 system-ui, sans-serif;
  text-shadow: 0 0 3rem rgba(239, 68, 68, 0.6);
  pointer-events: none;
  animation: pop 0.25s ease-out;
}

@keyframes pop {
  from { opacity: 0; scale: 1.4; }
}

@media (max-width: 700px) {
  /* Phones: one column of just the real answers. */
  .board {
    grid-template-columns: 1fr;
    grid-template-rows: none;
    grid-auto-flow: row;
    grid-auto-rows: minmax(2.75rem, 1fr);
    overflow-y: auto;
  }

  .tile {
    font-size: 1.1rem;
  }

  .tile.empty {
    display: none;
  }

  .team-name {
    font-size: 0.8rem;
    letter-spacing: 0.02em;
  }

  .controls {
    font-size: 0.85rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .face { transition: none; }
  .steal, .strike-flash, .question-big { animation: none; }
}
</style>
