<script setup lang="ts">
// Temporary: a full-width button at the bottom of the site that opens the password-gated
// Thanksgiving Feud party game. Remove this component (and /api/feud) to take it down.
import { defineAsyncComponent, ref, watch } from 'vue'
import { feudRequest, type Round } from './feud/feud'

// Loaded only once someone logs in, so the rest of the site doesn't carry the game's code.
const FeudGame = defineAsyncComponent(() => import('./feud/FeudGame.vue'))
const FeudEditor = defineAsyncComponent(() => import('./feud/FeudEditor.vue'))
const FeudAnswers = defineAsyncComponent(() => import('./feud/FeudAnswers.vue'))

const view = ref<'closed' | 'login' | 'menu' | 'play' | 'edit' | 'answers'>('closed')
const password = ref('')
const rounds = ref<Round[]>([])
const error = ref('')
const busy = ref(false)
const showPassword = ref(false)
const passwordInput = ref<HTMLInputElement>()

// Focus goes back to the field, so Enter still submits after toggling.
function togglePassword() {
  showPassword.value = !showPassword.value
  passwordInput.value?.focus()
}

async function login() {
  busy.value = true
  error.value = ''
  try {
    const loaded = await feudRequest('POST', { password: password.value })
    // If the host cancelled while this was loading, stay closed.
    if (view.value !== 'login') return
    rounds.value = loaded
    view.value = 'menu'
  } catch (e) {
    error.value = (e as Error).message
  } finally {
    busy.value = false
  }
}

// Closing forgets the password, so the next person has to enter it again.
function close() {
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
  view.value = 'closed'
  password.value = ''
  showPassword.value = false
  rounds.value = []
  error.value = ''
}

watch(view, v => { document.body.style.overflow = v === 'closed' ? '' : 'hidden' })
</script>

<template>
  <button class="feud-launch" type="button" @click="view = 'login'">PLAY THANKSGIVING FEUD</button>

  <div v-if="view !== 'closed'" class="feud-overlay" role="dialog" aria-modal="true" aria-label="Thanksgiving Feud">
    <FeudGame v-if="view === 'play'" :rounds="rounds" @quit="view = 'menu'" />
    <FeudAnswers v-else-if="view === 'answers'" :rounds="rounds" @back="view = 'menu'" />
    <FeudEditor
      v-else-if="view === 'edit'"
      :password="password"
      :rounds="rounds"
      @saved="r => rounds = r"
      @back="view = 'menu'"
    />

    <form v-else-if="view === 'login'" class="feud-panel" @submit.prevent="login">
      <h2>Thanksgiving Feud</h2>
      <label>
        Host password
        <span class="password-field">
          <input ref="passwordInput" v-model="password" :type="showPassword ? 'text' : 'password'" autocomplete="current-password" required autofocus>
          <button
            type="button"
            class="toggle-password"
            :aria-pressed="showPassword"
            :aria-label="showPassword ? 'Hide password' : 'Show password'"
            @click="togglePassword"
          >{{ showPassword ? 'Hide' : 'Show' }}</button>
        </span>
      </label>
      <p v-if="error" class="feud-error" role="alert">{{ error }}</p>
      <div class="feud-actions">
        <button type="button" @click="close">Cancel</button>
        <button type="submit" class="primary" :disabled="busy">{{ busy ? 'Checking…' : 'Enter' }}</button>
      </div>
    </form>

    <div v-else class="feud-panel">
      <h2>Thanksgiving Feud</h2>
      <p>{{ rounds.length }} round{{ rounds.length === 1 ? '' : 's' }} ready.</p>
      <div class="feud-actions column">
        <button type="button" class="primary" :disabled="!rounds.length" @click="view = 'play'">Start game</button>
        <button type="button" @click="view = 'edit'">Edit questions</button>
        <button type="button" :disabled="!rounds.length" @click="view = 'answers'">Answers</button>
        <button type="button" @click="close">Close</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.feud-launch {
  display: block;
  width: 100%;
  padding: 1.5rem 1rem;
  border: 0;
  border-top: 1px solid rgba(253, 251, 212, 0.2);
  background: #f59e0b;
  color: #0C0C0C;
  font: 800 clamp(1.1rem, 3vw, 1.8rem) / 1 system-ui, sans-serif;
  letter-spacing: 0.12em;
  cursor: pointer;
  transition: background 0.2s ease;
}

.feud-launch:hover,
.feud-launch:focus-visible {
  background: #fbbf24;
}

.feud-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  overflow-y: auto;
  background: #0C0C0C;
  color: #FDFBD4;
  font-family: system-ui, sans-serif;
}

.feud-panel {
  width: min(24rem, calc(100% - 2rem));
  display: grid;
  gap: 1rem;
  text-align: center;
}

.feud-panel h2 {
  margin: 0;
  font: 700 2rem 'Playfair Display Variable', Georgia, serif;
  color: #fbbf24;
}

.feud-panel label {
  display: grid;
  gap: 0.4rem;
  text-align: left;
}

.feud-panel input {
  padding: 0.7rem;
  border: 1px solid rgba(253, 251, 212, 0.3);
  border-radius: 0.4rem;
  background: #1a1a1a;
  color: inherit;
  font-size: 1rem;
}

.password-field {
  display: flex;
  gap: 0.4rem;
}

.password-field input {
  flex: 1;
  min-width: 0;
}

.feud-panel .password-field .toggle-password {
  padding: 0 0.9rem;
  font-size: 0.9rem;
}

.feud-error {
  margin: 0;
  color: #f87171;
}

.feud-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.feud-actions.column {
  flex-direction: column;
}

.feud-panel button {
  padding: 0.7rem 1.2rem;
  border: 1px solid rgba(253, 251, 212, 0.3);
  border-radius: 0.4rem;
  background: transparent;
  color: inherit;
  font-size: 1rem;
  cursor: pointer;
}

.feud-panel button.primary {
  border-color: #f59e0b;
  background: #f59e0b;
  color: #0C0C0C;
  font-weight: 700;
}

.feud-panel button:disabled {
  opacity: 0.5;
  cursor: default;
}
</style>
