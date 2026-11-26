// Shared bits for the Thanksgiving Feud party game: types, the password-gated API, and sounds.

export interface Answer { text: string, points: number }
export interface Round { question: string, answers: Answer[] }

const errors: Record<number, string> = {
  400: 'Every round needs a question and 1–8 answers, each with text and 0–100 points.',
  401: 'Wrong password.',
  429: 'Too many tries. Wait a minute and try again.',
  503: 'The game isn’t set up on the server yet.',
}

// POST loads the rounds (and doubles as the password check); PUT saves them.
export async function feudRequest(method: 'POST' | 'PUT', body: { password: string, rounds?: Round[] }): Promise<Round[]> {
  let response: Response
  try {
    response = await fetch('/api/feud', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
  } catch {
    throw new Error('Couldn’t reach the server. Check the connection and try again.')
  }
  if (!response.ok) throw new Error(errors[response.status] ?? 'Something went wrong. Try again.')
  return (await response.json()).rounds
}

// The ding and buzzer are audio files; each play uses a fresh copy, so quick reveals can overlap.
const clips: Record<string, HTMLAudioElement> = {}

function clip(src: string) {
  clips[src] ??= Object.assign(new Audio(src), { preload: 'auto' })
  return clips[src]
}

// `start` skips into the clip, in seconds.
function playClip(src: string, start = 0) {
  const copy = clip(src).cloneNode() as HTMLAudioElement
  copy.currentTime = start
  void copy.play().catch(() => {})
}

const DING = '/audio/feud-ding.mp3'
const BUZZER = '/audio/feud-buzzer.mp3'

const INTRO = '/audio/feud-intro.mp3'

// Loads the clips ahead of time so the first ding isn't late.
export function preloadSounds() {
  clip(DING)
  clip(BUZZER)
  clip(INTRO)
}

// The intro music, replayed during the game: question pages and the final scores.
export const introMusic = {
  play(start: number, volume: number) {
    const music = clip(INTRO)
    music.volume = volume
    music.currentTime = start
    void music.play().catch(() => {})
  },
  stop() {
    clips[INTRO]?.pause()
  },
}

// The award fanfare is synthesized.
let audio: AudioContext | undefined

function tone(freq: number, start: number, length: number, type: OscillatorType = 'sine', volume = 0.2) {
  audio ??= new AudioContext()
  if (audio.state === 'suspended') void audio.resume()
  const at = audio.currentTime + start
  const osc = audio.createOscillator()
  const gain = audio.createGain()
  osc.type = type
  osc.frequency.value = freq
  gain.gain.setValueAtTime(volume, at)
  gain.gain.exponentialRampToValueAtTime(0.001, at + length)
  osc.connect(gain).connect(audio.destination)
  osc.start(at)
  osc.stop(at + length)
}

export const sounds = {
  reveal() { playClip(DING, 1.07) }, // the ding file has a lead-in; start at 0:01.07
  strike() { playClip(BUZZER, 1.08) }, // the buzzer file has a lead-in too; start at 0:01.08
  award() { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.45, 'triangle')) },
}
