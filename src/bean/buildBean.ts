import { SPRITE } from './sprite'
import { Voxels } from './voxels'
import { beanConfig, type BeanConfig } from './config'

// Coordinates: x = sprite column (dog faces +x), y = 40 - sprite row (paws touch y = 1),
// z = across the body (+z is the side the sprite shows).
const ROWS = SPRITE.length, COLS = SPRITE[0].length
const at = (c: number, r: number) => SPRITE[r]?.[c] ?? '.'
const colored = (c: number, r: number) => !'.#'.includes(at(c, r))
const toY = (r: number) => ROWS - 1 - r

// Black outline pixels separate the sprite's parts, so connected colored regions identify them.
function regions() {
  const label = SPRITE.map(row => [...row].map(() => -1))
  let next = 0
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    if (!colored(c, r) || label[r][c] >= 0) continue
    const stack = [[c, r]]; label[r][c] = next
    while (stack.length) {
      const [x, y] = stack.pop()!
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nx = x + dx, ny = y + dy
        if (colored(nx, ny) && label[ny][nx] < 0) { label[ny][nx] = next; stack.push([nx, ny]) }
      }
    }
    next++
  }
  return (c: number, r: number) => label[r]?.[c] ?? -1
}

function lerpStops(stops: [number, number][], x: number) {
  if (x <= stops[0][0]) return stops[0][1]
  for (let i = 1; i < stops.length; i++) {
    const [x1, y1] = stops[i], [x0, y0] = stops[i - 1]
    if (x <= x1) return y0 + (y1 - y0) * (x - x0) / (x1 - x0)
  }
  return stops[stops.length - 1][1]
}

export function buildBody(config: BeanConfig = beanConfig) {
  const region = regions()
  const farHind = region(10, 28), farFront = region(31, 30), main = region(10, 20)
  const jaw: Record<number, number> = { 13: 28, 14: 29, 15: 29, 16: 30, 17: 31, 18: 32 }
  const isHead = (c: number, r: number) => r <= 12 || (r <= 18 && c >= jaw[r])
  const isNearLeg = (c: number, r: number) => r >= 28 && (c <= 7 || (c >= 23 && c <= 28))
  const body = new Voxels()

  // Torso: each sprite column spans exactly that column's top and belly rows (so the side
  // silhouette matches the sprite), with a superellipse cross-section that's wide through the
  // chest and narrower at the waist and rump. The cross-section is smoothed across neighboring
  // columns so the flanks read as one surface rather than per-pixel lumps.
  const spans = new Map<number, [number, number]>()
  for (let c = 0; c < COLS; c++) {
    const rows: number[] = []
    for (let r = 13; r < ROWS; r++)
      if (region(c, r) === main && !isHead(c, r) && !isNearLeg(c, r)) rows.push(r)
    if (rows.length) spans.set(c, [Math.min(...rows), Math.max(...rows)])
  }
  const smoothed = (c: number) => {
    let mid = 0, half = 0, n = 0
    for (let i = c - 2; i <= c + 2; i++) {
      const s = spans.get(i)
      if (s) { mid += (s[0] + s[1]) / 2; half += (s[1] - s[0]) / 2 + 0.5; n++ }
    }
    return { mid: mid / n, half: half / n }
  }
  for (const [c, [top, bottom]] of spans) {
    const { mid, half } = smoothed(c)
    const width = lerpStops(config.bodyWidth, c), n = config.bodyRoundness
    let last = at(c, top)
    for (let r = top; r <= bottom; r++) {
      if (colored(c, r)) last = at(c, r) // interior outline pixels take the color above them
      const span = Math.max(1, width * Math.pow(Math.max(0, 1 - Math.min(1, Math.abs((r - mid) / (half + 0.5))) ** n), 1 / n))
      for (let z = -Math.round(span); z <= Math.round(span); z++) body.set(c, toY(r), z, last)
    }
  }

  // Legs follow their sprite pixels. The sprite draws far legs higher (a 2D depth cue), so they
  // are stretched down to the ground; in 3D the depth comes from their z position instead.
  const leg = (cells: [number, number][], [z0, z1]: number[], inward: number) => {
    const bottom = Math.max(...cells.map(([, r]) => r)), stretch = ROWS - 2 - bottom
    const split = bottom - 6
    for (const [c, r] of cells) {
      const targets = r < split ? [r] : r === split ? Array.from({ length: stretch + 1 }, (_, i) => r + i) : [r + stretch]
      const thigh = r < bottom - 8 ? inward : 0
      for (const t of targets) for (let z = z0 - (z0 > 0 ? thigh : 0); z <= z1 + (z1 < 0 ? thigh : 0); z++)
        body.set(c, toY(t), z, at(c, r))
    }
  }
  const cellsWhere = (test: (c: number, r: number) => boolean) => {
    const out: [number, number][] = []
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (colored(c, r) && test(c, r)) out.push([c, r])
    return out
  }
  const { nearZ, farZ, thighZ } = config.legs
  leg(cellsWhere((c, r) => region(c, r) === main && isNearLeg(c, r) && c <= 7), nearZ, thighZ)
  leg(cellsWhere((c, r) => region(c, r) === main && isNearLeg(c, r) && c > 7), nearZ, thighZ)
  leg(cellsWhere((c, r) => region(c, r) === farHind), farZ, thighZ)
  leg(cellsWhere((c, r) => region(c, r) === farFront), farZ, thighZ)
  // Far legs need to reach the body they hang from.
  for (const [c, r] of cellsWhere((c, r) => region(c, r) === farHind || region(c, r) === farFront))
    if (r <= 29) for (let y = toY(r); y <= toY(r) + 2; y++) for (let z = farZ[0]; z <= farZ[1]; z++)
      if (!body.has(c, y, z)) body.set(c, y, z, 'd')
  return body
}

// The head is modeled in its own frame (x forward from the turning axis, z across) because the
// sprite draws it turned toward the viewer. Feature placement is read from the sprite's face.
export function buildHead(config: BeanConfig = beanConfig) {
  const h = config.head, head = new Voxels()
  const L = h.halfLength, W = h.halfWidth
  const front = L - 1 // x of the face plane
  // Skull: broad and flat-topped, with bevelled edges; the jaw tucks under the front half.
  for (let x = -L; x <= front; x++) for (let y = h.bottom; y <= h.top; y++) for (let z = -W; z <= W; z++) {
    const az = Math.abs(z), edges = (x === -L ? 1 : 0) + (y === h.top ? 1 : 0) + (az === W ? 1 : 0)
      + (y === h.bottom ? 1 : 0) + (x === front && az === W ? 1 : 0)
    if (edges >= 2) continue
    if (y <= h.bottom + 1 && (x < -1 || az > W - 2)) continue
    let color = 'g'
    if (y <= h.bottom + 3 && x >= 0 && az >= W - 2) color = 't' // tan cheeks
    if (y <= h.bottom + 1) color = 'd'
    if (x === -L || y === h.top) color = az > W - 3 || x === -L ? 'd' : 'g'
    head.set(x, y, z, color)
  }
  // Face: tan brow spots and slightly bulging eyes with a glint, as in the sprite.
  for (const s of [-1, 1]) {
    for (const y of [h.top - 3, h.top - 2]) for (const az of [3, 4]) head.set(front, y, s * az, y === h.top - 2 && az === 3 ? 'T' : 't')
    for (const y of [h.top - 6, h.top - 5]) for (const az of [4, 5]) {
      head.set(front + 1, y, s * az, y === h.top - 5 && az === 4 ? 'e' : '#')
    }
  }
  // Short, wide brachycephalic muzzle with a protruding black nose and tan points.
  const m0 = front + 1, m1 = front + h.muzzleLength
  for (let x = m0; x <= m1; x++) for (let y = h.bottom - 1; y <= h.bottom + 5; y++) for (let z = -4; z <= 4; z++) {
    const az = Math.abs(z)
    if (az === 4 && (y === h.bottom + 5 || y === h.bottom - 1)) continue
    if (x === m1 && (az === 4 || y === h.bottom - 1)) continue
    if (head.has(x, y, z)) continue
    let color = az >= 3 ? 'T' : 'g'
    if (y === h.bottom + 5) color = 't'
    if (y <= h.bottom) color = 't' // chin
    if (x === m1 && y === h.bottom + 2 && az === 0) color = '#' // philtrum
    if (x === m1 && y === h.bottom + 1 && az >= 1 && az <= 2) color = '#' // mouth
    head.set(x, y, z, color)
  }
  // Nose: a small black button that stands proud of the muzzle.
  for (let y = h.bottom + 3; y <= h.bottom + 4; y++) for (let z = -1; z <= 1; z++)
    head.set(m1 + 1, y, z, '#')
  return head
}

// A bat ear in its own frame (opening faces +x), so it can be angled outward on the head.
// Tall and tapering, with a gray rim and a recessed tan inner cup, as in the sprite.
export function buildEar(config: BeanConfig = beanConfig) {
  const ear = new Voxels(), widths = config.ears.widths
  widths.forEach((w, y) => {
    const z0 = -Math.floor((w - 1) / 2), z1 = Math.ceil((w - 1) / 2)
    for (let z = z0; z <= z1; z++) {
      const rim = z === z0 || z === z1 || y === widths.length - 1
      ear.set(-1, y, z, 'd')
      ear.set(0, y, z, rim || y === 0 ? 'g' : 't')
      if (rim) ear.set(1, y, z, 'g')
    }
  })
  return ear
}

// A short screw tail, from the sprite's two-pixel nub above the rump.
export function buildTail() {
  const tail = new Voxels()
  for (const [x, y] of [[0, 0], [1, 0], [0, 1], [-1, 1], [-1, 2], [0, 2], [0, 3]])
    for (const z of [-1, 0, 1]) tail.set(x, y, z, y === 0 ? 'd' : 'g')
  return tail
}
