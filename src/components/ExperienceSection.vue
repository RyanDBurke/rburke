<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import ScrollCue from './ScrollCue.vue'

const jobs = [
  {
    title: 'Senior Software Engineer',
    company: 'DealerOn',
    dates: 'Feb 2021 – Present',
    tech: ['.NET', 'C#', 'Azure', 'SQL Server', 'RabbitMq', 'Redis', 'Claude'],
    description: 'Cool job where I architect and maintain scalable automotive software solutions for 4,000+ dealerships in North America.',
  },
  {
    title: 'IT Technician',
    company: 'University of Maryland, Division of IT',
    dates: 'Sept 2019 – Jan 2021',
    tech: ['Problem-solving', 'Documentation', 'Remote Tooling', 'Windows', 'Linux', 'MacOS'],
    description: "College gig where I'd install, diagnose, or repair hardware/software for students and staff",
  },
]

const section = ref<HTMLElement>()
const visible = ref(false)
let observer: IntersectionObserver | undefined

// Fade the content in the first time the section scrolls into view.
onMounted(() => {
  observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      visible.value = true
      observer?.disconnect()
    }
  }, { threshold: 0.3 })
  observer.observe(section.value!)
})

onUnmounted(() => observer?.disconnect())
</script>

<template>
  <section id="experience" ref="section" :class="{ visible }">
    <!-- Each job gets 4 fade steps, so the second job fades in after the first. -->
    <div class="jobs">
      <div v-for="(job, j) in jobs" :key="job.title" class="job">
        <hr v-if="j > 0" class="fade" :style="{ '--i': j * 4 }">
        <h3 class="fade" :style="{ '--i': j * 4 }">
          {{ job.title }} <span class="company">at {{ job.company }}</span>
        </h3>
        <p class="fade meta" :style="{ '--i': j * 4 + 1 }">{{ job.dates }}</p>
        <p class="fade description" :style="{ '--i': j * 4 + 2 }">{{ job.description }}</p>
        <p class="fade meta tech" :style="{ '--i': j * 4 + 3 }">{{ job.tech.join(' · ') }}</p>
      </div>
    </div>
    <ScrollCue target="photography" />
  </section>
</template>

<style scoped>
section {
  display: grid;
  place-items: center;
  background: #6D6CAB;
  /* Keeps content clear of the floating nav and the scroll cue. */
  padding: 5rem 1rem;
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
  .visible .fade { animation: none; }
}
</style>
