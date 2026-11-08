<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { vScrollScale } from '../scrollScale'
import ScrollingHeading from './ScrollingHeading.vue'

// Each entry gets its own sticky panel, in this order. Descriptions are trusted, hand-written
// HTML so phrases can be colored with the .red and .blue classes.
const jobs = [
  {
    title: 'Senior Software Engineer',
    at: 'at DealerOn',
    description: `Full-stack engineer with <span class="blue">six years</span> of experience architecting
      <span class="red">scalable</span> distributed systems and <span class="blue">cloud-native</span> applications for the automotive industry.
      Proven track record of <span class="red">leading</span> architectural initiatives, improving system
      reliability, and mentoring engineers.`,
    tech: ['.NET', 'C#', 'TypeScript', 'VueJs', 'Azure', 'SQL', 'RabbitMQ', 'Redis', 'Claude', 'Aspire', 'Docker', 'Microservices', 'Distributed Systems', 'REST APIs', 'Resilience Patterns'],
  },
  {
    title: 'nCov-19 Genome Variant',
    at: 'on GitHub',
    link: 'https://github.com/RyanDBurke/coronavirus-genome-variant',
    description: `Seed-search tool used to compare read-variants to the <span class="blue">nCov-19</span> virus genome using
      the <span class="red">Burrows-Wheeler transform</span>, suffix arrays, the <span class="blue">FM-Index</span>, and core
      <span class="red">dynamic programming</span> principles.`,
    tech: ['C', 'Dynamic Programming', 'Burrows-Wheeler Transform', 'Suffix Arrays', 'FM-Index'],
  },
]

const sections = ref<HTMLElement[]>([])
const visible = ref(jobs.map(() => false))
let observer: IntersectionObserver | undefined

// Fade each panel's content in the first time it scrolls into view.
onMounted(() => {
  observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue
      visible.value[sections.value.indexOf(entry.target as HTMLElement)] = true
      observer?.unobserve(entry.target)
    }
  }, { threshold: 0.3 })
  sections.value.forEach(section => observer!.observe(section))
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<template>
  <div id="experience">
  <!-- The heading scrolls away normally; each entry's panel below then sticks on its own. -->
  <ScrollingHeading :words="['EXPERIENCE']" />
  <div v-for="(job, i) in jobs" :key="job.title" class="experience-scroll">
    <section ref="sections" :aria-label="job.title" :class="{ visible: visible[i] }">
      <!-- The title, summary, and tech line fade in in order. -->
      <div v-scroll-scale class="jobs">
        <h3 class="fade" style="--i: 0">
          {{ job.title }}
          <a v-if="job.link" class="company" :href="job.link" target="_blank" rel="noopener noreferrer">{{ job.at }}</a>
          <span v-else class="company">{{ job.at }}</span>
        </h3>
        <!-- eslint-disable-next-line vue/no-v-html -- static, hand-written markup above -->
        <p class="fade description" style="--i: 1" v-html="job.description"></p>
        <div class="fade meta tech tech-marquee" style="--i: 2">
          <span class="visually-hidden">{{ job.tech.join(', ') }}</span>
          <div class="tech-track" aria-hidden="true">
            <div v-for="row in 2" :key="row" class="tech-row">
              <span v-for="tool in job.tech" :key="tool" class="tech-item">
                {{ tool }} <span class="tech-star">*</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
  </div>
</template>

<style scoped>
.experience-scroll {
  height: 150vh;
}

section {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr);
  place-items: center;
  position: sticky;
  top: 0;
  height: 100vh;
  height: 100svh; /* the visible screen with the phone toolbar showing, like the intro */
  overflow-x: clip;
  padding: 5rem 1rem;
}

.jobs {
  min-width: 0;
  width: 70vw; /* matches the About section's paragraph width */
  text-align: center;
}

h3 {
  margin: 0 0 0.5rem;
  /* Keep titles readable on shorter screens. */
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
  width: 100%;
  margin: 1.25rem auto 0;
  /* Same size as the About section's paragraphs. */
  font-size: min(max(1.4rem, 3.15vw), 5.46dvh);
  line-height: 1.4;
}

/* Same red and blue as the About section. :deep reaches the spans inside each v-html description. */
.description :deep(.red) {
  color: #E31717;
}

.description :deep(.blue) {
  color: #1754E3;
}

/* Keep each highlighted phrase (like "six years") on one line. */
.description :deep(.red),
.description :deep(.blue) {
  white-space: nowrap;
}

a.company {
  color: inherit;
  text-underline-offset: 0.15em;
}

.tech {
  margin-top: 0.75rem;
}

.tech-marquee {
  position: relative;
  width: 100%;
  overflow: hidden;
  font-size: clamp(1rem, 1.5vw, 1.3rem);
  line-height: 2.5rem;
  white-space: nowrap;
}

.tech-track {
  display: flex;
  width: max-content;
  animation: tech-scroll-right 30s linear infinite;
}

.tech-row {
  display: flex;
  flex: 0 0 auto;
  gap: 1.5rem;
  padding-right: 1.5rem;
}

.tech-item {
  display: inline-flex;
  align-items: center;
  gap: 1.5rem;
}

.tech-star {
  color: #E31717;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 1em;
  font-family: 'Oi', cursive;
  line-height: 1;
  transform: translateY(0.18em);
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

@keyframes tech-scroll-right {
  from { transform: translateX(-50%); }
  to { transform: translateX(0); }
}

@media (max-width: 767px) {
  section {padding:4.5rem 1rem 1rem}
  .jobs {width:100%}
  h3 {
    font-size: min(7vw, 3.5dvh);
  }

  .meta {
    font-size: min(4vw, 2.5dvh);
  }

  .description {
    font-size: min(7.5vw, 3.2dvh);
    width: 100%;
  }

  .tech-marquee {
    line-height: min(2.5rem, 5dvh);
  }

}

/* Tighter spacing on short phones. */
@media (max-width: 767px) and (max-height: 760px) {
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

.visible .tech-marquee {
  opacity: 1;
}

@keyframes fade-in {
  from { opacity: 0; transform: translateY(0.5rem); }
}

@media (prefers-reduced-motion: reduce) {
  .visible .fade { animation: none; }
  .tech-track { animation: none; transform: translateX(-50%); }
}
</style>
