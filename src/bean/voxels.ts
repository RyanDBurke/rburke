import { BufferGeometry, Color, Float32BufferAttribute } from 'three'

// A sparse voxel set. Voxel (x,y,z) occupies the unit cube centered on that point.
export class Voxels {
  readonly cells = new Map<string, { x: number; y: number; z: number; color: string }>()
  static key = (x: number, y: number, z: number) => `${x},${y},${z}`
  set(x: number, y: number, z: number, color: string) { this.cells.set(Voxels.key(x, y, z), { x, y, z, color }) }
  has(x: number, y: number, z: number) { return this.cells.has(Voxels.key(x, y, z)) }
  delete(x: number, y: number, z: number) { this.cells.delete(Voxels.key(x, y, z)) }
  get size() { return this.cells.size }

  // Every voxel within one step (including diagonals). Rendered back-face-only, this becomes a
  // one-pixel black outline around the silhouette from any viewing angle, like the sprite's.
  dilate(color: string) {
    const out = new Voxels()
    for (const { x, y, z } of this.cells.values())
      for (let i = -1; i <= 1; i++) for (let j = -1; j <= 1; j++) for (let k = -1; k <= 1; k++)
        out.set(x + i, y + j, z + k, color)
    return out
  }
}

const FACES = [
  { n: [1, 0, 0], u: [0, 1, 0], v: [0, 0, 1] },
  { n: [-1, 0, 0], u: [0, 0, 1], v: [0, 1, 0] },
  { n: [0, 1, 0], u: [0, 0, 1], v: [1, 0, 0] },
  { n: [0, -1, 0], u: [1, 0, 0], v: [0, 0, 1] },
  { n: [0, 0, 1], u: [1, 0, 0], v: [0, 1, 0] },
  { n: [0, 0, -1], u: [0, 1, 0], v: [1, 0, 0] },
]
const CORNERS = [[-1, -1], [1, -1], [1, 1], [-1, 1]] // counter-clockwise when viewed from outside

// Emits only exposed faces, with per-vertex ambient occlusion baked into the vertex colors.
export function voxelGeometry(voxels: Voxels, palette: Record<string, string>, ao: number[] | null) {
  const positions: number[] = [], normals: number[] = [], colors: number[] = []
  const color = new Color(), cache = new Map<string, Color>()
  const solid = (x: number, y: number, z: number) => (voxels.has(x, y, z) ? 1 : 0)
  for (const { x, y, z, color: name } of voxels.cells.values()) {
    if (!cache.has(name)) cache.set(name, new Color(palette[name] ?? name))
    const base = cache.get(name)!
    for (const { n, u, v } of FACES) {
      if (solid(x + n[0], y + n[1], z + n[2])) continue
      const ox = x + n[0], oy = y + n[1], oz = z + n[2]
      const corners = CORNERS.map(([a, b]) => {
        const p = [x + (n[0] + a * u[0] + b * v[0]) / 2, y + (n[1] + a * u[1] + b * v[1]) / 2, z + (n[2] + a * u[2] + b * v[2]) / 2]
        let level = 3
        if (ao) {
          const s1 = solid(ox + a * u[0], oy + a * u[1], oz + a * u[2])
          const s2 = solid(ox + b * v[0], oy + b * v[1], oz + b * v[2])
          const c = solid(ox + a * u[0] + b * v[0], oy + a * u[1] + b * v[1], oz + a * u[2] + b * v[2])
          level = s1 && s2 ? 0 : 3 - s1 - s2 - c
        }
        return { p, level }
      })
      // Flip the quad's diagonal so occlusion gradients don't show a crease.
      const order = corners[0].level + corners[2].level < corners[1].level + corners[3].level
        ? [1, 2, 3, 1, 3, 0] : [0, 1, 2, 0, 2, 3]
      for (const i of order) {
        const { p, level } = corners[i]
        color.copy(base).multiplyScalar(ao ? ao[level] : 1)
        positions.push(p[0], p[1], p[2]); normals.push(n[0], n[1], n[2]); colors.push(color.r, color.g, color.b)
      }
    }
  }
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3))
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3))
  geometry.computeBoundingSphere()
  return geometry
}
