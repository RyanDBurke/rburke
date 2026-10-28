<script setup lang="ts">
import { ref } from 'vue'
import ScrollCue from './ScrollCue.vue'
import { vReveal } from '../reveal'

const links = [
  { href: 'mailto:ryanburketv@gmail.com', icon: '/icons/email.png', label: 'Email Ryan' },
  { href: 'https://www.linkedin.com/in/ryanburke77/', icon: '/icons/linkedin.png', label: 'Ryan on LinkedIn' },
]

// Hover opens the folder on desktop; tapping toggles it on touch screens, which can't hover.
const open = ref(false)
</script>

<template>
  <section id="contact">
    <div
      v-reveal
      class="folder-scene"
      :class="{ open }"
      role="button"
      tabindex="0"
      aria-label="Open contact folder"
      :aria-pressed="open"
      @click="open = !open"
      @keydown.enter.self.prevent="open = !open"
      @keydown.space.self.prevent="open = !open"
    >
      <!-- Back of the folder, with its tab. -->
      <svg class="folder-base" viewBox="0 0 48 40" aria-hidden="true">
        <path
          d="M4 8C4 6 6 4 8 4H18L22 8H40C42 8 44 10 44 12V34C44 36 42 38 40 38H8C6 38 4 36 4 34Z"
          fill="#f59e0b"
        />
      </svg>

      <!-- Contact icons tucked inside, which fan out when the folder opens. -->
      <div class="files">
        <a
          v-for="(link, i) in links"
          :key="link.href"
          :class="`file file-${i + 1}`"
          :href="link.href"
          :aria-label="link.label"
          :tabindex="open ? 0 : -1"
          :target="link.href.startsWith('http') ? '_blank' : undefined"
          rel="noopener noreferrer"
          @click.stop
        >
          <img :src="link.icon" alt="" draggable="false">
        </a>
      </div>

      <!-- Front flap, which tips forward to open. -->
      <svg class="folder-front" viewBox="0 0 48 40" aria-hidden="true">
        <defs>
          <filter id="insetEdge">
            <feGaussianBlur in="SourceGraphic" stdDeviation="0.3" result="coloredBlur" />
            <feOffset in="coloredBlur" dx="0" dy="-0.8" result="offsetblur" />
            <feFlood flood-color="#000000" flood-opacity="0.2" result="offsetcolor" />
            <feComposite in="offsetcolor" in2="offsetblur" operator="in" result="offsetblur" />
            <feComposite in="offsetblur" in2="SourceGraphic" operator="in" result="offsetblur" />
          </filter>
        </defs>
        <path
          d="M4 18C4 16 6 14 8 14H40C42 14 44 16 44 18V34C44 36 42 38 40 38H8C6 38 4 36 4 34Z"
          fill="#fbbf24"
        />
        <!-- Pocket line across the flap. -->
        <rect x="12" y="17.6" width="24" height="0.8" rx="0.4" fill="#ffffff" filter="url(#insetEdge)" />
      </svg>
    </div>

    <ScrollCue target="intro" label="back to top ↑" />
  </section>
</template>

<style scoped>
section {
  display: grid;
  place-items: center;
  background: #7d2011;
}

/* Sizes are in em so the whole folder scales with this one font size. */
.folder-scene {
  position: relative;
  width: 15em;
  height: 10.5em;
  /* Room above for the icons to fan out into. */
  margin-top: 6em;
  font-size: clamp(14px, 1.6vw, 20px);
  perspective: 100em;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.folder-base,
.folder-front,
.files {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.folder-base {
  z-index: 1;
}

.files {
  z-index: 2;
}

.file {
  position: absolute;
  /* Centered, so the icons spread out evenly on both sides. */
  left: 50%;
  top: 1em;
  width: 6em;
  height: 6em;
  transform-origin: bottom center;
  filter: drop-shadow(0 0.5em 1em rgba(0, 0, 0, 0.25));
  transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
  /* Tucked away, they can't be clicked by accident; they become links once the folder opens. */
  pointer-events: none;
}

.file img {
  display: block;
  width: 100%;
  height: 100%;
}

/* Closed: icons tucked in the folder, slightly fanned. */
.file-1 {
  transform: translateX(calc(-50% - 1em)) translateY(-0.6em) rotate(-6deg) scale(0.95);
  z-index: 3;
}

.file-2 {
  transform: translateX(calc(-50% + 1em)) translateY(-0.4em) rotate(6deg) scale(0.95);
  z-index: 4;
  transition-delay: 0.04s;
}

/* Open: icons rise out and fan apart. Their bottoms stay over the folder so the hover isn't lost on the way up. */
.folder-scene.open .file {
  pointer-events: auto;
}

.folder-scene.open .file-1 {
  transform: translateX(calc(-50% - 3.6em)) translateY(-5em) rotate(-10deg) scale(1.05);
}

.folder-scene.open .file-2 {
  transform: translateX(calc(-50% + 3.6em)) translateY(-5em) rotate(10deg) scale(1.05);
}

/* The flap starts slightly open and tips further forward when the folder opens. */
.folder-front {
  z-index: 10;
  transform-origin: bottom;
  transform: rotateX(-20deg);
  transition: transform 0.5s cubic-bezier(0.22, 1, 0.36, 1);
}

.folder-scene.open .folder-front {
  transform: rotateX(-50deg) scaleY(0.82);
}

/* Only devices with a real hover open on hover, so a tap on a phone doesn't leave it stuck open. */
@media (hover: hover) {
  .folder-scene:hover .file {
    pointer-events: auto;
  }

  .folder-scene:hover .file-1 {
    transform: translateX(calc(-50% - 3.6em)) translateY(-5em) rotate(-10deg) scale(1.05);
  }

  .folder-scene:hover .file-2 {
    transform: translateX(calc(-50% + 3.6em)) translateY(-5em) rotate(10deg) scale(1.05);
  }

  .folder-scene:hover .folder-front {
    transform: rotateX(-50deg) scaleY(0.82);
  }

  .folder-scene .file:hover img {
    transform: scale(1.08);
  }

  .file img {
    transition: transform 0.2s ease;
  }
}

.folder-scene:focus-visible,
.file:focus-visible {
  outline: 2px solid rgba(253, 251, 212, 0.6);
  outline-offset: 0.5em;
  border-radius: 0.5em;
}

@media (prefers-reduced-motion: reduce) {
  .file,
  .file img,
  .folder-front {
    transition: none;
  }
}
</style>
