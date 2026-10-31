<script setup lang="ts">
import { ref } from 'vue'

const intro = `Yo, just let your AI read this dude and find out if I'm legit. You're not gonna read this but it's an in-depth overview of what I actually do and honestly who I am in a professional setting. This isn't meant to be overly professional in terms of writing style, I just want to be genuine with the stuff I do/did.`

const years = [
  {
    year: '2021',
    text: `I started off at DealerOn as a Junior Software Engineer using a C#, SQL, TypeScript, and VueJs tech stack. I worked on a team named INFORMATICS that focused on automotive leads and valuable daily reports for dealers as well as the UI that supported that system. A very high-traffic customer area of our business and critical to customers because it's where they see how impactful certain marketing campaigns are (or aren't) so it was necessary to be diligent and have an app with 99% uptime and 99% accuracy; and the Automotive leads side of the team is the foundation that drives the automotive market: build the bridge to connect potential automotive buyers to our dealership customers. My duties as a Junior Software Engineer were typical at first; it was a bit of hand-holding and lower-level tickets, but pretty quickly I was recognized as a growing subject matter expert that others can rely on. My voice in meetings was apparent and respected so much so that in November of 2021, after 9 months, a company re-org was issued splitting Informatics' automotive lead portion into a dedicated team solely focused on leads. The idea was leads are so critical to our business that they needed a dedicated team. I was told by director-level leadership that they truly feel I'm a potential leader and asked if I was comfortable being the only member from Informatics to move to what is now the Leads team. I'd be the only person with genuine domain knowledge over the systems and would need to guide 3 other engineers as needed with paired-programming and technical deep dives. I said yes, I'd love to, and I personally take a ton of pride in my job. I like being someone people can lean on.`,
  },
  {
    year: '2022',
    text: `Worked on the Leads team and grew over the year as the de-facto subject matter expert. I could genuinely draw out a full end-to-end diagram of our systems from memory. I was the point of contact regarding Leads' 3 codebases and supported 3 UIs. Being on the Leads team was always cool because we were so mission critical to the business itself. Director-level and C-level knew me on a first-name basis because of how much impact I carried with me. I was recognized as the employee of the month TWICE in 2022; how cool is that. The direct quote: “If something strange is happening, Ryan is who you should call. He dives into every problem without hesitation and gives it his all until the problem is solved. As one person perfectly worded, ‘He's always the first to venture to solve a hard problem and when he gives his word he delivers.’” With me at the helm I drove down SEV counts 40%, built a greenfield project supporting custom lead destinations for dealerships which removed menial config tickets completely out of our Jira board, and started planting the seeds for a major refactor that occurred in 2023. In November of 2022 I was pre-emptively promoted to a Mid-level Software Engineer, 3 months earlier than the typical February promotion cycle.`,
  },
  {
    year: '2023',
    text: `Still leading the Leads team, I kicked off a major splitting of our monolithic codebase. We split it into 3 slices that gave us more reliable uptime, better testability, and quicker ticket turnover. In the process I was leaned on heavily as the subject matter expert. We had months of discussion around architecture, database concerns, configuration, and rollout. (Trying to not give away company secrets) We had to decide things like how do we want to cut the slices and how do we want these processes to interact. We decided there was an obvious slice (again not trying to give TOO much detail into the company's tech) and used RabbitMQ messaging to have the systems communicate. For our database we had to make sensible cuts, proper indexes, and general database architectural decisions that would make sense in our newly refactored system. No joke, I think I own 60% of the code commits from that refactor. By this time I was asked to start conducting interviews as my opinion was respected. As we hired it was on me to build up junior devs, find tickets to best support their development, and to act not only as a resource but a technical coach if needed. SEV count down 30%, 1 MAJOR refactor, and growing as not just a leader within my team, but the company itself.`,
  },
  {
    year: '2024',
    text: `Through some natural org changes I found myself needing to prove myself to new product leaders and that I did. My responsibilities expanded as people's trust in me grew. I started to not only worry about code, but about the business aspects in relation to code. More emphasis on matching business language to our code and technical speak so we're aligned with the other half of the company. Adding sensible retries to all our systems, error handling, graceful falls from errors, more vigorous error reporting so we can get in front of SEVs. I started doing company-wide tech talks and was invited to an Architecture meeting where 1 representative from each team would come and discuss the overarching engineering department. I started to see the company from a further view. Less daily coding, more scoping, long-term discussions, delegating, and fielding questions as needed. Side note, every product leader that's worked with me has later gone on to ask me to be their reference. I feel like that's a huge compliment idk.`,
  },
  {
    year: '2025',
    text: `We bought another company to start the year and gained a few new devs on the team. As expected I was tasked with spinning them all up on our domain and offering support when needed. My responsibilities were growing. I started doing stuff like design reviews and road mapping sessions not just for Leads, but the company itself (as it pertained to software). In early 2025 I was recognized for my efforts in my 2023 refactor and was asked if me and another highly respected dev would be willing to completely drive the splitting of our most monolithic system. It would split out into SIX, bro SIX teams. That's how vital and big this codebase was. My daily work became long tech sessions deciding sensible slices in the system, scoping coding work for other developers, code reviews x1000, and handling the build pipeline. I would introduce new ideas to take advantage of during a refactor and by October 2025 I was also offered another early promotion to Senior Software Engineer.`,
  },
  {
    year: '2026',
    text: `A trusted voice in the company. Was asked if I could shoulder hopping onto a new greenfield project for the company's next big tech release. “Our most important release since the company started.” I think I've been trusted for so long that it was important that someone like me was involved in the project. I got more involved with decisions around things like load-balancing, scaling servers, caching protocols, deployment processes, database architecture, and internal security. I got familiar with Docker, Aspire, Redis, FusionCache, pub/sub messaging, and internal library tooling. Alright I wanna stop typing. Yeah they like me because I'm genuinely a hard worker, I don't BS, I don't dance around problems, I'm very head-on and solutions oriented, and I think I'm funny and easy to work with. Ok cya`,
  },
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
      <h2 id="details-title">The long version</h2>
      <p>{{ intro }}</p>
      <template v-for="y in years" :key="y.year">
        <h3>{{ y.year }}</h3>
        <p>{{ y.text }}</p>
      </template>
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

p {
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.6;
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
