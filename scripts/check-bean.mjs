// Sanity checks for the sprite-derived Bean model in src/bean.
import assert from 'node:assert/strict'
import { createServer } from 'vite'

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
try {
  const { buildBody, buildHead, buildEar, buildTail } = await server.ssrLoadModule('/src/bean/buildBean.ts')
  const { createBean } = await server.ssrLoadModule('/src/bean/createBean.ts')
  const { SPRITE } = await server.ssrLoadModule('/src/bean/sprite.ts')

  // Every part must be one connected piece (no floating voxels).
  const parts = { body: buildBody(), head: buildHead(), ear: buildEar(), tail: buildTail() }
  for (const [name, voxels] of Object.entries(parts)) {
    const cells = [...voxels.cells.values()], seen = new Set(), queue = [cells[0]]
    const key = (x, y, z) => `${x},${y},${z}`
    while (queue.length) {
      const v = queue.pop(), k = key(v.x, v.y, v.z)
      if (seen.has(k)) continue
      seen.add(k)
      for (const [dx, dy, dz] of [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]]) {
        const next = voxels.cells.get(key(v.x + dx, v.y + dy, v.z + dz))
        if (next) queue.push(next)
      }
    }
    assert.equal(seen.size, voxels.size, `${name} has disconnected voxels`)
  }

  // Side-view fidelity: the body's projected silhouette vs the sprite's body and leg pixels.
  const rows = SPRITE.length, sprite = new Set(), projected = new Set()
  const jaw = { 13: 28, 14: 29, 15: 29, 16: 30, 17: 31, 18: 32 }
  for (let r = 13; r < rows; r++) for (let c = 0; c < SPRITE[r].length; c++)
    if (!'.#'.includes(SPRITE[r][c]) && !(r <= 18 && c >= jaw[r]) && !(c <= 3 && r <= 17)) sprite.add(`${c},${rows - 1 - r}`)
  for (const v of parts.body.cells.values()) projected.add(`${v.x},${v.y}`)
  const overlap = [...projected].filter(k => sprite.has(k)).length
  const iou = overlap / (sprite.size + projected.size - overlap)
  assert(iou > 0.9, `Side silhouette drifted from the sprite (IoU ${iou.toFixed(3)})`)

  // Geometry: finite, outward-facing triangles.
  const { model, dispose } = createBean()
  let triangles = 0, meshes = 0
  model.traverse(o => {
    if (!o.isMesh) return
    meshes++
    const pos = o.geometry.getAttribute('position'), nor = o.geometry.getAttribute('normal')
    assert([...pos.array].every(Number.isFinite), `${o.name} has non-finite coordinates`)
    for (let i = 0; i < pos.count; i += 3) {
      const a = [pos.getX(i), pos.getY(i), pos.getZ(i)]
      const u = [pos.getX(i + 1) - a[0], pos.getY(i + 1) - a[1], pos.getZ(i + 1) - a[2]]
      const v = [pos.getX(i + 2) - a[0], pos.getY(i + 2) - a[1], pos.getZ(i + 2) - a[2]]
      const dot = (u[1] * v[2] - u[2] * v[1]) * nor.getX(i) + (u[2] * v[0] - u[0] * v[2]) * nor.getY(i) + (u[0] * v[1] - u[1] * v[0]) * nor.getZ(i)
      assert(dot > 0, `${o.name} has an inward-facing triangle`)
    }
    triangles += pos.count / 3
  })
  const voxels = Object.values(parts).reduce((n, p) => n + p.size, 0) + parts.ear.size
  console.log(`Bean: ${voxels} voxels, side-view IoU vs sprite ${iou.toFixed(3)}, ${triangles} triangles, ${meshes} draw calls`)
  dispose()
} finally { await server.close() }
