<script setup lang="ts">
import { ref } from 'vue'

const skills = [
  { area: 'Languages', tools: 'C#, SQL, TypeScript' },
  { area: 'Frameworks', tools: '.NET, .NET Aspire, Vue.js' },
  { area: 'Cloud & infrastructure', tools: 'Microsoft Azure, Docker, Redis, FusionCache' },
  { area: 'Messaging', tools: 'RabbitMQ, MassTransit' },
  { area: 'Architecture & practices', tools: 'Microservices, distributed systems, REST APIs, SQL Server, database design, CI/CD, resilience patterns' },
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
      <p>Senior Software Engineer with nearly six years of experience designing scalable distributed systems and cloud-native applications. At DealerOn, I help build a greenfield website editor and rendering platform, co-led the split of the company's largest monolith into six independently owned services, and led the migration of its mission-critical Leads platform to three deployable services. I focus on reliable architecture, clear service contracts, and mentoring engineers.</p>

      <h3>Experience at DealerOn</h3>

      <h4>Senior Software Engineer · Oct 2025 – present</h4>
      <ul>
        <li>Develop a greenfield drag-and-drop page editor and rendering platform that lets automotive dealerships build, customize, and publish websites, working across frontend, backend, and cross-service integrations.</li>
        <li>Design versioned API and data contracts for an extensible widget architecture, allowing other teams to integrate independently developed components through shared NuGet packages while preserving backward compatibility.</li>
        <li>Improve frontend performance and reliability with non-blocking CSS, client-side caching, Grafana dashboards, and automated alerts.</li>
      </ul>

      <h4>Software Engineer · Feb 2021 – Oct 2025</h4>
      <ul>
        <li><strong>Co-led the decomposition of the company's largest monolith into six independently owned services</strong>, defining service boundaries, data migration strategies, and CI/CD workflows while coordinating work across engineering teams.</li>
        <li><strong>Led the Leads platform migration to three independently deployable microservices</strong> using incremental migration, isolated databases, and durable RabbitMQ messaging.</li>
        <li>Improved platform uptime to 99.7% and reduced severity incidents by 30% through service isolation, fault-tolerant messaging, retry policies, and graceful degradation.</li>
        <li>Served as a technical subject matter expert for architecture decisions, design reviews, technical roadmaps, and code reviews, while mentoring fellow engineers.</li>
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
