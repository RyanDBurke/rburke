<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { vReveal } from '../reveal'
import ScrollingHeading from './ScrollingHeading.vue'

const paragraph = ref<HTMLParagraphElement>()
let frame: number | undefined

// The paragraph grows from small to full size as it scrolls up to the middle of the screen.
function updateScale() {
  frame = undefined
  const element = paragraph.value
  if (!element) return

  const bounds = element.getBoundingClientRect()
  const distance = Math.max(0, bounds.top + bounds.height / 2 - window.innerHeight / 2)
  const progress = Math.max(0, 1 - distance / (window.innerHeight * 0.65))
  element.style.transform = `scale(${0.2 + progress * 0.8})`
}

function scheduleScaleUpdate() {
  if (frame === undefined) frame = requestAnimationFrame(updateScale)
}

onMounted(() => {
  scheduleScaleUpdate()
  window.addEventListener('scroll', scheduleScaleUpdate, { passive: true })
  window.addEventListener('resize', scheduleScaleUpdate)
})

onUnmounted(() => {
  window.removeEventListener('scroll', scheduleScaleUpdate)
  window.removeEventListener('resize', scheduleScaleUpdate)
  if (frame !== undefined) cancelAnimationFrame(frame)
})
</script>

<template>
  <!-- The heading sits above the paragraph; the nav link lands on it. -->
  <div id="about">
  <ScrollingHeading :words="['ABOUT']" />
  <div class="about-scroll">
    <section aria-label="About">
      <div v-reveal>
        <p ref="paragraph">
          <!-- Keep explicit spaces where the source line breaks between sentences. -->
          <span class="lead">I'm Ryan</span> <a href="https://www.linkedin.com/in/ryanburke77/" target="_blank"
            rel="noopener noreferrer"><img class="inline-pic" src="/images/me.png" alt="Ryan on LinkedIn" width="773"
            height="977"></a><span class="muted">, a </span><span class="accent">senior software engineer</span><span class="muted"> living on the east coast.</span>{{ ' ' }}
          <br class="mobile-break"><br class="mobile-break"><span class="lead"><span class="blue">Professionally</span>,</span> <span class="muted">I architect thoughtfully-designed</span> <span class="accent">software systems</span><span class="muted">.</span>{{ ' ' }}
          <br class="mobile-break"><br class="mobile-break"><span class="lead">For fun,</span> <span class="muted">I play basketball, take film pics, mess around with
            <span class="blue">oil pastels</span>, golf, and chill out with my dog</span> <img class="inline-pic"
            src="/images/bean.png" alt="" width="758" height="720"> <span class="muted">and <span class="blue">wife</span></span> <img
            class="inline-pic" src="/images/wife.png" alt="" width="944" height="1120">
        </p>
      </div>
    </section>
  </div>
  </div>
</template>

<style scoped>
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
  overflow-x: clip;
  padding: 5rem 1rem;
}

p {
  margin: 0;
  width: 70vw;
  font-size: min(max(1.4rem, 3.15vw), 5.46dvh);
  line-height: 1.4;
  text-align: center;
  transform-origin: center;
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

@media (prefers-reduced-motion: reduce) {
  p { transform: none !important; }
}
</style>
