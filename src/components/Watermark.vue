<script setup lang="ts">
// A faint, repeated word tilted 45 degrees behind a section's content, like "EXPERIENCE".
// It starts below the section's ticker and ends where the section ends.
const props = defineProps<{ word: string }>()

// Words run along diagonal lines about 141px apart. A square tile of side S holds `lines`
// of those lines and `perLine` words along each one, so S = 200 * lines and each word gets
// a slot of S * sqrt(2) / perLine. These pairs keep every word's slot close to its natural,
// squeezed length (about 52px per letter at 120px), so short and long words look alike.
const n = props.word.length
const [lines, perLine] = n <= 5 ? [1, 1] : n <= 8 ? [3, 2] : [2, 1]
const size = 200 * lines
const slot = (size * Math.SQRT2) / perLine
const wordLength = Math.round(slot - 45) // leaves a small gap before the next word

// Word centers inside the tile, wrapped into it. The 3x3 copies below let words cross tile
// edges so the lines run on seamlessly.
const wrap = (v: number) => ((v % size) + size) % size
const words: string[] = []
for (let line = 0; line < lines; line++) {
  for (let i = 0; i < perLine; i++) {
    const step = (size * i) / perLine
    const lift = (size * line) / (2 * lines)
    const x = wrap(size / 2 + lift + step)
    const y = wrap(size / 2 + lift - step)
    words.push(`<text transform="translate(${x} ${y}) rotate(-45)" textLength="${wordLength}" lengthAdjust="spacingAndGlyphs">${props.word}</text>`)
  }
}
const copies: string[] = []
for (const dy of [-size, 0, size]) {
  for (const dx of [-size, 0, size]) copies.push(`<use href="#w" x="${dx}" y="${dy}"/>`)
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><defs><g id="w" font-family="Georgia, serif" font-weight="700" font-size="120" fill="#FDFBD4" fill-opacity="0.035" text-anchor="middle" dominant-baseline="central">${words.join('')}</g></defs>${copies.join('')}</svg>`
const backgroundImage = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
</script>

<template>
  <div class="watermark" :style="{ backgroundImage }">
    <slot />
  </div>
</template>

<style scoped>
.watermark {
  background-repeat: repeat;
}
</style>
