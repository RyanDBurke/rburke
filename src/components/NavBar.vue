<script setup lang="ts">
import { ref } from 'vue'

const sections = [
  { id: 'about', label: 'about', act: 'ACT I' },
  { id: 'experience', label: 'experience', act: 'ACT II' },
  { id: 'photography', label: 'photography', act: 'ACT III' },
  { id: 'contact', label: 'contact', act: 'ACT IV' },
]

const open = ref(false)
</script>

<template>
  <nav :class="{ open }">
    <a class="logo" href="#intro" @click="open = false">RB</a>
    <button
      class="menu-button"
      :class="{ open }"
      :aria-expanded="open"
      aria-controls="nav-menu"
      :aria-label="open ? 'Close menu' : 'Open menu'"
      @click="open = !open"
    >
      <span></span>
      <span></span>
      <span></span>
    </button>
  </nav>

  <!-- Kept outside <nav>: its transform would trap a fixed-position child inside it. -->
  <div id="nav-menu" class="menu" :class="{ open }">
    <ul>
      <li v-for="section in sections" :key="section.id">
        <a :href="`#${section.id}`" @click="open = false">
          <span class="act">{{ section.act }}</span>
          <span class="label">{{ section.label }}</span>
        </a>
      </li>
    </ul>
  </div>
</template>

<style scoped>
nav {
  position: fixed;
  top: 1rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  width: 80%;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 0.5rem 1rem;
  background: #180501;
  transition: background 0.5s ease;
}

nav.open {
  background: #292828;
}

@media (min-width: 768px) {
  nav { width: 25%; }
}

a {
  color: inherit;
  text-decoration: none;
}

.logo {
  grid-column: 2;
  font-size: 1.25rem;
  font-weight: 700;
}

.menu-button {
  grid-column: 3;
  justify-self: end;
  display: grid;
  gap: 4px;
  padding: 0.5rem;
  color: inherit;
  background: none;
  border: 0;
  cursor: pointer;
}

.menu-button span {
  display: block;
  width: 20px;
  height: 2px;
  background: currentColor;
  transition: transform 0.3s ease, opacity 0.3s ease;
}

/* Hamburger turns into an X while the menu is open. */
.menu-button.open span:nth-child(1) { transform: translateY(6px) rotate(45deg); }
.menu-button.open span:nth-child(2) { opacity: 0; }
.menu-button.open span:nth-child(3) { transform: translateY(-6px) rotate(-45deg); }

/* Full-screen menu that slides down from the top. */
.menu {
  position: fixed;
  inset: 0;
  z-index: 9;
  display: flex;
  align-items: center;
  padding: 0 10vw;
  background: #000;
  transform: translateY(-100%);
  visibility: hidden;
  transition: transform 0.5s ease, visibility 0s 0.5s;
}

.menu.open {
  transform: translateY(0);
  visibility: visible;
  transition: transform 0.5s ease;
}

.menu ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.menu a {
  display: flex;
  align-items: baseline;
  gap: 1rem;
  font-size: clamp(2.5rem, 8vw, 5rem);
  line-height: 1.2;
}

.act {
  font-size: 1rem;
  opacity: 0.5;
}

.label {
  opacity: 0.6;
  transition: opacity 0.2s ease;
}

.menu a:hover .label,
.menu a:focus-visible .label {
  opacity: 1;
}

@media (prefers-reduced-motion: reduce) {
  nav, .menu, .menu.open, .menu-button span { transition: none; }
}
</style>
