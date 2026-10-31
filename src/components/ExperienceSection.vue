<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import ScrollCue from './ScrollCue.vue'
import ExperienceDetails from './ExperienceDetails.vue'

const jobs = [
  {
    title: 'Senior Software Engineer',
    company: 'DealerOn',
    tech: ['.NET', 'C#', 'TypeScript', 'VueJs', 'Azure', 'SQL', 'RabbitMQ', 'Redis', 'Claude'],
    description: 'Cool job where I architect and maintain scalable automotive software solutions for 4,000+ dealerships in North America.',
    // Shows Bean under the tech line; clicking him opens the long write-up.
    details: true,
  },
  {
    title: 'IT Technician',
    company: 'University of Maryland, Division of IT',
    tech: ['Problem-solving', 'Documentation', 'Remote Tooling', 'Windows', 'Linux', 'MacOS'],
    description: "College gig where I'd install, diagnose, or repair hardware/software for students and staff",
  },
]

const section = ref<HTMLElement>()
const detailsDialog = ref<InstanceType<typeof ExperienceDetails>>()
const visible = ref(false)
let observer: IntersectionObserver | undefined

// What Bean's speech bubble says, in order, and how long each line stays up. It loops back to the start.
// Bean does a jump and a flip on lines marked flip.
const beanLines = [
  { text: 'woof! click me!', ms: 2200, flip: true },
  { text: 'whoa I wonder if Ryan has a long AI-friendly write up detailing his time at DealerOn', ms: 4500 },
]
// -1 until the section scrolls into view, so the bubble starts talking only once it's seen.
const beanStep = ref(-1)
const beanLine = computed(() => beanLines[beanStep.value])
let beanTimer: ReturnType<typeof setTimeout> | undefined

function nextBeanLine() {
  beanStep.value = (beanStep.value + 1) % beanLines.length
  beanTimer = setTimeout(nextBeanLine, beanLines[beanStep.value].ms)
}

// Fade the content in the first time the section scrolls into view.
onMounted(() => {
  observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      visible.value = true
      observer?.disconnect()
      // Waits for the jobs to finish fading in.
      beanTimer = setTimeout(nextBeanLine, 1200)
    }
  }, { threshold: 0.3 })
  observer.observe(section.value!)
})

onUnmounted(() => {
  observer?.disconnect()
  clearTimeout(beanTimer)
})
</script>

<template>
  <section id="experience" ref="section" :class="{ visible }">
    <!-- Each job gets 3 fade steps, so the second job fades in after the first. -->
    <div class="jobs">
      <div v-for="(job, j) in jobs" :key="job.title" class="job">
        <hr v-if="j > 0" class="fade" :style="{ '--i': j * 3 }">
        <h3 class="fade" :style="{ '--i': j * 3 }">
          {{ job.title }} <span class="company">at {{ job.company }}</span>
        </h3>
        <p class="fade description" :style="{ '--i': j * 3 + 1 }">{{ job.description }}</p>
        <p class="fade meta tech" :style="{ '--i': j * 3 + 2 }">{{ job.tech.join(' · ') }}</p>
        <div v-if="job.details" class="fade bean-wrap" :style="{ '--i': j * 3 + 2 }">
          <button class="bean" aria-label="Read Ryan's long write-up about DealerOn" @click="detailsDialog?.open()">
            <img
              src="/images/bean.png"
              alt=""
              width="758"
              height="720"
              :class="{ flip: beanLine?.flip }"
            >
          </button>
          <!-- Keyed so each new line pops in again. -->
          <p v-if="beanLine" :key="beanStep" class="bubble" aria-hidden="true">{{ beanLine.text }}</p>
        </div>
      </div>
    </div>
    <ScrollCue target="photography" />
    <ExperienceDetails ref="detailsDialog" />
  </section>
</template>

<style scoped>
section {
  display: grid;
  place-items: center;
  background: #6D6CAB;
  /* Just clears the floating nav and the scroll cue, leaving Bean's bubble as much room as possible. */
  padding: 4.5rem 1rem 3.5rem;
}

.jobs {
  /* Matches the nav bar width. */
  width: 25vw;
}

hr {
  margin: min(2.25rem, 3.5dvh) 0;
  border: 0;
  border-top: 1px solid rgba(253, 251, 212, 0.35);
}

h3 {
  margin: 0 0 0.5rem;
  /* Capped by screen height too, so the section never outgrows one screen. */
  font-size: min(max(1.25rem, 2.4vw), 3.6dvh);
  line-height: 1.2;
}

.company {
  white-space: nowrap;
  font-size: 0.6em;
  opacity: 0.6;
}

.meta {
  margin: 0 0 0.25rem;
  font-size: min(max(0.8rem, 1.1vw), 1.8dvh);
  opacity: 0.7;
}

.description {
  margin: 1.25rem 0 0;
  font-size: min(max(1rem, 1.65vw), 2.55dvh);
  line-height: 1.5;
}

.tech {
  margin-top: 0.75rem;
}

/* Bean, Ryan's dog, under the tech line. The bubble is positioned above him, so it never changes the layout. */
.bean-wrap {
  position: relative;
  width: fit-content;
  /* A little extra room, since the long line's bubble is taller than Bean. */
  margin-top: 1.5rem;
}

.bean {
  display: block;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
}

.bean img {
  display: block;
  width: 4rem;
  height: auto;
  /* Keeps the pixel art crisp when scaled down. */
  image-rendering: pixelated;
  /* A yellow glow around his outline so he reads as clickable. */
  filter: drop-shadow(0 0 3px rgba(255, 214, 64, 0.9)) drop-shadow(0 0 8px rgba(255, 214, 64, 0.5));
  transition: filter 0.2s ease;
}

.bean:hover img,
.bean:focus-visible img {
  filter: drop-shadow(0 0 4px rgb(255, 214, 64)) drop-shadow(0 0 14px rgba(255, 214, 64, 0.8));
}

/* A jump and a backflip on every "woof!". */
.bean img.flip {
  animation: bean-flip 0.7s ease-in-out;
}

@keyframes bean-flip {
  0% { transform: translateY(0) rotate(0); }
  50% { transform: translateY(-1.5rem) rotate(-180deg); }
  100% { transform: translateY(0) rotate(-360deg); }
}

/* An 8-bit speech bubble to Bean's right, its tail pointing left at him.
   The four offset shadows draw the outline with notched corners, like pixel art. */
.bubble {
  --px: 4px;
  position: absolute;
  left: calc(100% + 1.5rem);
  top: 50%;
  /* Separate from transform, so the pop animation doesn't undo the centering. */
  translate: 0 -50%;
  width: max-content;
  max-width: 20rem;
  margin: 0;
  pointer-events: none;
  padding: 0.75rem;
  background: #fff;
  color: #1a1a1a;
  font-family: 'Press Start 2P', monospace;
  font-size: 0.55rem;
  line-height: 1.7;
  text-align: left;
  box-shadow:
    0 calc(-1 * var(--px)) #1a1a1a,
    0 var(--px) #1a1a1a,
    calc(-1 * var(--px)) 0 #1a1a1a,
    var(--px) 0 #1a1a1a,
    calc(2 * var(--px)) calc(2 * var(--px)) rgba(0, 0, 0, 0.25);
  transform-origin: 0 50%;
}

/* The tail: a stair-stepped pixel triangle, one square per shadow. It starts on the left outline column,
   whitening a gap in it, then steps left and narrows. */
.bubble::after {
  content: '';
  position: absolute;
  left: calc(-1 * var(--px));
  top: calc(50% - 2 * var(--px));
  width: var(--px);
  height: var(--px);
  box-shadow:
    0 var(--px) #fff, 0 calc(2 * var(--px)) #fff,
    calc(-1 * var(--px)) 0 #1a1a1a, calc(-1 * var(--px)) var(--px) #fff, calc(-1 * var(--px)) calc(2 * var(--px)) #fff, calc(-1 * var(--px)) calc(3 * var(--px)) #1a1a1a,
    calc(-2 * var(--px)) var(--px) #1a1a1a, calc(-2 * var(--px)) calc(2 * var(--px)) #fff, calc(-2 * var(--px)) calc(3 * var(--px)) #1a1a1a,
    calc(-3 * var(--px)) calc(2 * var(--px)) #1a1a1a, calc(-3 * var(--px)) calc(3 * var(--px)) #1a1a1a,
    calc(-4 * var(--px)) calc(3 * var(--px)) #1a1a1a;
}

/* Each line pops up in choppy steps. */
.bubble {
  animation: bubble-pop 0.3s steps(3, jump-end);
}

@keyframes bubble-pop {
  from { transform: scale(0); }
}

@media (max-width: 767px) {
  .jobs {
    width: 80vw;
  }

  h3 {
    font-size: 7vw;
  }

  .meta {
    font-size: 4vw;
  }

  .description {
    font-size: 5vw;
  }

  /* Narrow enough to leave the same gutter on the right as the column has on the left;
     the text wraps to more rows instead. */
  .bubble {
    max-width: calc(80vw - 5.5rem);
  }
}

/* Tighter spacing on short phones so both jobs fit on one screen. */
@media (max-width: 767px) and (max-height: 760px) {
  section {
    padding-block: 4.5rem 4rem;
  }

  hr {
    margin: 1rem 0;
  }

  .description {
    margin-top: 0.75rem;
  }
}

/* Each item fades in after the one above it once the section is in view. */
.fade {
  opacity: 0;
}

.visible .fade {
  opacity: 1;
  animation: fade-in 0.6s ease backwards;
  animation-delay: calc(var(--i) * 0.15s);
}

.visible .meta {
  opacity: 0.7;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(0.5rem); }
}

@media (prefers-reduced-motion: reduce) {
  .visible .fade, .bubble, .bean img.flip { animation: none; }
}
</style>
