<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { vReveal } from '../reveal'
import { vScrollScale } from '../scrollScale'
import ScrollingHeading from './ScrollingHeading.vue'
import Watermark from './Watermark.vue'

// Bean's speech bubble pops up for a moment: once on its own when the About panel first
// sticks, then again each time someone clicks or taps Bean.
const BUBBLE_MS = 3000
const panel = ref<HTMLElement>()
const bubbleShown = ref(false)
let hideTimer: ReturnType<typeof setTimeout> | undefined
let frame: number | undefined

function popBubble() {
  bubbleShown.value = true
  clearTimeout(hideTimer)
  hideTimer = setTimeout(() => { bubbleShown.value = false }, BUBBLE_MS)
}

// The panel has stuck once its top reaches the top of the screen.
function checkStuck() {
  frame = undefined
  const top = panel.value?.getBoundingClientRect().top
  if (top === undefined || top > 0) return
  window.removeEventListener('scroll', scheduleCheck)
  popBubble()
}

function scheduleCheck() {
  if (frame === undefined) frame = requestAnimationFrame(checkStuck)
}

onMounted(() => {
  window.addEventListener('scroll', scheduleCheck, { passive: true })
  scheduleCheck()
})

onUnmounted(() => {
  window.removeEventListener('scroll', scheduleCheck)
  if (frame !== undefined) cancelAnimationFrame(frame)
  clearTimeout(hideTimer)
})
</script>

<template>
  <!-- The heading sits above the paragraph; the nav link lands on it. -->
  <div id="about">
  <ScrollingHeading class="after-intro" :words="['ABOUT']" />
  <Watermark word="ABOUT">
  <div class="about-scroll">
    <section ref="panel" aria-label="About">
      <div v-reveal>
        <!-- The paragraph grows to full size as it scrolls up to the middle of the screen.
             Bean's pixel speech bubble pops up when the panel first sticks, and on a click. -->
        <p v-scroll-scale>
          <!-- Keep explicit spaces where the source line breaks between sentences. -->
          <span class="lead">I'm Ryan</span> <a href="https://www.linkedin.com/in/ryanburke77/" target="_blank"
            rel="noopener noreferrer"><img class="inline-pic" src="/images/me.png" alt="Ryan on LinkedIn" width="773"
            height="977"></a><span class="muted">, a </span><span class="accent">senior software engineer</span><span class="muted"> living on the east coast.</span>{{ ' ' }}
          <br class="mobile-break"><br class="mobile-break"><span class="lead"><span class="blue">Professionally</span>,</span> <span class="muted">I architect thoughtfully-designed</span> <span class="accent">software systems</span><span class="muted">.</span>{{ ' ' }}
          <br class="mobile-break"><br class="mobile-break"><span class="lead">For fun,</span> <span class="muted">I play basketball, take film pics, mess around with
            <span class="blue">oil pastels</span>, golf, and chill out with my dog</span> <span
            class="bean-tip" :class="{ show: bubbleShown }" tabindex="0" role="button" aria-label="Bean, my dog"
            @click="popBubble" @keydown.enter.prevent="popBubble" @keydown.space.prevent="popBubble"><img class="inline-pic"
            src="/images/bean.png" alt="" width="758" height="720"><span class="bubble" aria-hidden="true"><span
            class="bubble-box">this is bean</span><span class="bubble-tail"></span></span></span> <span class="muted">and <span class="blue">wife</span></span> <img
            class="inline-pic" src="/images/wife.png" alt="" width="944" height="1120">
        </p>
      </div>
    </section>
  </div>
  </Watermark>
  </div>
</template>

<style scoped>
/* About follows the intro, which has no watermark, so its ticker keeps the full gap
   that clears the floating nav. */
.ticker.after-intro {
  padding-top: 5rem;
}

.about-scroll {
  height: 150vh;
}

/* Like the other sections: the paragraph is centered in a full-screen panel that sticks
   while its taller container scrolls past. */
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

p {
  margin: 0;
  width: 70vw;
  font-size: min(max(1.4rem, 3.15vw), 5.46dvh);
  line-height: 1.4;
  text-align: center;
}

/* The opening words of each paragraph stand out from the rest. */
.lead {
  font-size: 1.15em;
}

.muted {
  font-size: 0.85em;
}

.accent {
  color: #E31717;
  font-weight: 700;
  opacity: 1;
}

.blue {
  color: #1754E3;
}

/* Small pictures that sit in the line of text, about as tall as the letters. */
.inline-pic {
  display: inline-block;
  width: auto;
  height: 1.2em;
  vertical-align: -0.2em;
}

.mobile-break {
  display: none;
}

/* Bean's picture, with an 8-bit speech bubble that pops up above the text for a moment
   (see popBubble). */
.bean-tip {
  position: relative;
  display: inline-block;
  outline: none;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.bean-tip:focus-visible .inline-pic {
  outline: 2px solid #FDFBD4;
  outline-offset: 3px;
}

.bubble {
  --px: 0.28em; /* one "pixel" of the bubble, in the bubble's own font size */
  position: absolute;
  bottom: calc(100% + 0.3em);
  left: 50%;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: 'Press Start 2P', ui-monospace, monospace;
  font-size: 0.3em;
  font-weight: 400;
  line-height: 1;
  white-space: nowrap;
  color: #0C0C0C;
  pointer-events: none;
  opacity: 0;
  transform: translate(-50%, 0.6em);
  /* Moves in two hard steps, like an old game sprite. */
  transition: opacity 0.16s steps(2), transform 0.16s steps(2);
  /* A hard, unblurred outline around the box and tail, so it reads over the text behind it. */
  filter:
    drop-shadow(var(--px) 0 0 #0C0C0C) drop-shadow(calc(-1 * var(--px)) 0 0 #0C0C0C)
    drop-shadow(0 var(--px) 0 #0C0C0C) drop-shadow(0 calc(-1 * var(--px)) 0 #0C0C0C);
}

.bean-tip.show .bubble {
  opacity: 1;
  transform: translate(-50%, 0);
}

/* A cream box with stepped, pixel-notched corners. */
.bubble-box {
  padding: 1.1em 1.3em;
  background: #FDFBD4;
  clip-path: polygon(
    var(--px) 0, calc(100% - var(--px)) 0, calc(100% - var(--px)) var(--px), 100% var(--px),
    100% calc(100% - var(--px)), calc(100% - var(--px)) calc(100% - var(--px)),
    calc(100% - var(--px)) 100%, var(--px) 100%, var(--px) calc(100% - var(--px)),
    0 calc(100% - var(--px)), 0 var(--px), var(--px) var(--px)
  );
}

/* The tail: a little staircase pointing down at Bean. */
.bubble-tail {
  width: calc(var(--px) * 4);
  height: calc(var(--px) * 3);
  margin-top: -1px; /* no seam between box and tail */
  background: #FDFBD4;
  clip-path: polygon(0 0, 100% 0, 100% 34%, 75% 34%, 75% 67%, 50% 67%, 50% 100%, 25% 100%, 25% 67%, 0 67%);
}

@media (prefers-reduced-motion: reduce) {
  .bubble { transition: none; }
}

/* Sized to fill the screen on phones. */
@media (max-width: 767px) {
  section > div,
  p {
    width: 100%;
  }

  p {
    font-size: min(7.5vw, 3.2dvh);
    text-align: center;
  }

  .mobile-break {
    display: revert;
  }

}
</style>
