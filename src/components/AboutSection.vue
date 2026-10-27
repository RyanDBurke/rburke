<script setup lang="ts">
import ScrollCue from './ScrollCue.vue'
</script>

<template>
  <section id="about">
    <div>
      <p>
        <!-- Spaces between tags stay on one line; Vue drops whitespace that contains a line break. -->
        <span class="lead">I'm Ryan</span> <a href="https://www.linkedin.com/in/ryanburke77/" target="_blank"
          rel="noopener noreferrer"><img class="inline-pic" src="/images/me.png" alt="Ryan on LinkedIn" width="773"
          height="977"></a><span class="muted">, a senior software engineer based on the east coast.</span><br><br>
        <span class="lead">Professionally,</span> <span class="muted">I architect thoughtfully-designed software
          systems.</span><br><br>
        <span class="lead">For fun,</span> <span class="muted">I play basketball, take film pics, mess around with
          oil pastels, golf (not well), and chill out with my dog</span> <img class="inline-pic"
          src="/images/bean.png" alt="" width="758" height="720"> <span class="muted">and wife</span> <img
          class="inline-pic" src="/images/wife.png" alt="" width="944" height="1120">
      </p>
    </div>
    <ScrollCue target="experience" />
  </section>
</template>

<style scoped>
section {
  display: grid;
  place-items: center;
  /* Keeps content clear of the floating nav and the scroll cue. */
  padding: 5rem 1rem 5rem;
}

p {
  margin: 0;
  /* Matches the nav bar width. */
  width: 25vw;
  /* Capped by screen height too, so the section never outgrows one screen. */
  font-size: min(max(1rem, 2.25vw), 3.9dvh);
  line-height: 1.4;
  text-align: left;
}

/* The opening words of each paragraph stand out from the rest. */
.lead {
  font-size: 1.15em;
}

.muted {
  font-size: 0.85em;
  opacity: 0.7;
}

/* Small pictures that sit in the line of text, about as tall as the letters. */
.inline-pic {
  display: inline-block;
  width: auto;
  height: 1.2em;
  vertical-align: -0.2em;
}

/* Sized to fill the screen on phones. */
@media (max-width: 767px) {
  p {
    width: 80vw;
    /* Capped by screen height too, so the section never outgrows one screen. */
    font-size: min(7.4vw, 3.5dvh);
  }
}
</style>
