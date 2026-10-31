<script setup lang="ts">
import { ref } from 'vue'

const skills = [
  { area: 'Languages', tools: 'C#, SQL, TypeScript' },
  { area: 'Frontend', tools: 'Vue.js' },
  { area: 'Backend & infra', tools: 'Azure, .NET Aspire, Docker, Redis, FusionCache' },
  { area: 'Messaging', tools: 'RabbitMQ, MassTransit' },
  { area: 'Practices', tools: 'Service decomposition, database design and indexing, resilience patterns, CI/CD, code review, technical interviewing' },
]

const dialog = ref<HTMLDialogElement>()

function open() {
  dialog.value?.showModal()
  // Keeps the page behind the dialog from scrolling.
  document.body.style.overflow = 'hidden'
}

// Runs for the close button, Esc, and backdrop clicks alike.
function onClose() {
  document.body.style.overflow = ''
}

// A click on the backdrop lands on the dialog itself, not the panel inside it.
function onClick(e: MouseEvent) {
  if (e.target === dialog.value) dialog.value?.close()
}

defineExpose({ open })
</script>

<template>
  <dialog ref="dialog" aria-labelledby="details-title" @close="onClose" @click="onClick">
    <div class="panel">
      <button class="close" aria-label="Close" @click="dialog?.close()">×</button>
      <h2 id="details-title">Ryan: Professional Summary</h2>

      <h3>Summary</h3>
      <p>Senior Software Engineer at DealerOn with nearly six years in C#/.NET, SQL and TypeScript, promoted early twice (Junior → Mid → Senior). Domain lead for the company's mission-critical automotive Leads platform (4,000+ dealers, 500K+ requests/day), co-lead of a monolith decomposition into six team-owned services, and now a core engineer on the company's flagship greenfield release. Known for owning hard production problems end to end, raising team reliability, and growing other engineers.</p>

      <h3>Experience at DealerOn</h3>

      <h4>Senior Software Engineer · Oct 2025 – present</h4>
      <ul>
        <li>Core engineer on a greenfield platform leadership describes as the company's most important release since its founding.</li>
        <li>Contribute to decisions on load balancing, horizontal scaling, caching strategy, deployment pipelines, database architecture and internal security.</li>
        <li>Build with Docker, .NET Aspire, Redis, FusionCache, pub/sub messaging and shared internal libraries.</li>
      </ul>

      <h4>Software Engineer (Mid-level) · Nov 2022 – Oct 2025</h4>
      <ul>
        <li><strong>Co-led decomposition of the company's largest monolith into six team-owned services</strong> (2025 – present): owned service boundary definition, data migration strategy and CI/CD; served as the technical subject matter expert, scoped work for other engineers, and acted as primary code reviewer. Designed the rollout process to make each team's cutover seamless and easy for developers to follow. In progress: 3 of 6 teams split out to date.</li>
        <li><strong>Led a three-service split of the Leads monolith</strong> (2023), authoring ~60% of the commits. Migrated incrementally with the strangler fig pattern, with zero data loss. Split the database per service from day one, redesigning schemas and indexes. Introduced RabbitMQ for durable inter-service messaging, so in-flight leads survive downstream outages instead of being dropped. Fault isolation means one service failing no longer takes down the platform: uptime rose from ~98% to 99.7% and SEVs fell 30%, with better testability, faster ticket turnaround, and independent deploys enabling twice-weekly releases.</li>
        <li>Hardened services with retry policies, structured error handling, graceful degradation and expanded error reporting to catch incidents before customers did.</li>
        <li>Onboarded engineers from a 2025 acquisition onto the Leads domain.</li>
        <li>Represented the team in the cross-team Architecture forum; ran design reviews, roadmap sessions and company-wide tech talks.</li>
        <li>Interviewed candidates and mentored junior engineers through pairing, ticket selection and technical coaching.</li>
        <li>Aligned code and domain language with product and business stakeholders.</li>
      </ul>

      <h4>Junior Software Engineer · Feb 2021 – Nov 2022</h4>
      <ul>
        <li>Joined Informatics, owning automotive lead intake and dealer reporting for 4,000+ dealers and 500K+ lead requests/day (99% uptime and accuracy targets) on C#, SQL, TypeScript and Vue.js.</li>
        <li>Selected by director-level leadership after 9 months as the sole engineer moved to form the new dedicated Leads team; served as its domain expert across 3 codebases and 3 UIs, guiding 3 engineers.</li>
        <li>Reduced SEVs 40% (2022).</li>
        <li>Built a greenfield custom lead-destination feature that let dealers self-configure delivery, eliminating a recurring category of configuration tickets.</li>
        <li>Promoted to mid-level 3 months ahead of the standard cycle.</li>
      </ul>

      <h3>Technical Skills</h3>
      <table>
        <tbody>
          <tr v-for="s in skills" :key="s.area">
            <th scope="row">{{ s.area }}</th>
            <td>{{ s.tools }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </dialog>
</template>

<style scoped>
dialog {
  width: min(40rem, calc(100vw - 2rem));
  max-height: 85dvh;
  padding: 0;
  border: 1px solid rgba(253, 251, 212, 0.35);
  border-radius: 1rem;
  background: #6D6CAB;
  color: #FDFBD4;
  overflow-y: auto;
  overscroll-behavior: contain;
}

dialog::backdrop {
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
}

.panel {
  position: relative;
  padding: 2rem 2rem 2.5rem;
}

.close {
  position: sticky;
  top: 0;
  float: right;
  margin: -0.75rem -1rem 0 0;
  padding: 0 0.5rem;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  font-size: 2rem;
  line-height: 1;
  cursor: pointer;
}

h2 {
  margin: 0 0 1rem;
  font-size: 1.75rem;
}

h3 {
  margin: 1.75rem 0 0.5rem;
  font-size: 1.25rem;
  opacity: 0.7;
}

p,
li,
table {
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.6;
}

h4 {
  margin: 1.25rem 0 0.4rem;
  font-size: 1.05rem;
}

ul {
  margin: 0;
  padding-left: 1.25rem;
}

li + li {
  margin-top: 0.4rem;
}

table {
  border-collapse: collapse;
}

th,
td {
  padding: 0.35rem 0;
  vertical-align: top;
  text-align: left;
  border-top: 1px solid rgba(253, 251, 212, 0.2);
}

th {
  padding-right: 1rem;
  white-space: nowrap;
}

@media (max-width: 767px) {
  dialog {
    width: calc(100vw - 2rem);
    max-height: calc(100dvh - 2rem);
  }

  .panel {
    padding: 1.5rem 1.25rem 2rem;
  }
}
</style>
