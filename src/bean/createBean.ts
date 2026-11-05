import {
  BackSide, Box3, type BufferGeometry, type Camera, Group, MathUtils, Mesh, MeshBasicMaterial,
  MeshStandardMaterial, Vector3,
} from 'three'
import { buildBody, buildEar, buildHead, buildTail } from './buildBean'
import { beanConfig, type BeanConfig } from './config'
import { voxelGeometry, type Voxels } from './voxels'

export function createBean(config: BeanConfig = beanConfig) {
  const geometries: BufferGeometry[] = []
  const material = new MeshStandardMaterial({ vertexColors: true, roughness: 0.95, metalness: 0, flatShading: true })
  const outline = new MeshBasicMaterial({ color: config.palette['#'], side: BackSide })
  // Push the hull's depth (not its screen position) away from the camera, so it only shows at
  // real silhouettes and where parts overlap, not along every voxel stair-step.
  outline.onBeforeCompile = shader => {
    shader.uniforms.outlinePush = { value: config.scale * config.outlineDepth }
    shader.vertexShader = shader.vertexShader
      .replace('void main() {', 'uniform float outlinePush;\nvoid main() {')
      .replace('#include <project_vertex>', `#include <project_vertex>
        vec4 pushed = projectionMatrix * vec4(mvPosition.xyz + normalize(mvPosition.xyz) * outlinePush, 1.0);
        gl_Position.z = pushed.z / pushed.w * gl_Position.w;`)
  }

  // Each part is one colored mesh plus a one-voxel-larger inverted hull that draws its outline.
  function part(name: string, voxels: Voxels) {
    const group = new Group(); group.name = name
    const surface = voxelGeometry(voxels, config.palette, config.ambientOcclusion)
    const hull = voxelGeometry(voxels.dilate('#'), config.palette, null)
    geometries.push(surface, hull)
    const mesh = new Mesh(surface, material); mesh.name = `${name}Surface`
    mesh.castShadow = true; mesh.receiveShadow = true
    const edge = new Mesh(hull, outline); edge.name = `${name}Outline`
        group.add(mesh, edge)
    return group
  }

  const dog = new Group(); dog.name = 'BeanVoxelBulldog'
  const body = part('Body', buildBody(config))
  const head = part('Head', buildHead(config))
  const tail = part('Tail', buildTail())
  const earVoxels = buildEar(config), e = config.ears
  for (const side of [-1, 1]) {
    const ear = part(side > 0 ? 'NearEar' : 'FarEar', earVoxels)
    ear.position.set(e.x, config.head.top, side * e.spacing)
    ear.rotation.set(side * MathUtils.degToRad(e.tilt), -side * MathUtils.degToRad(e.flare), 0, 'YXZ')
    head.add(ear)
  }
  head.position.set(config.head.pivotX, 0, 0)
  tail.position.set(2, 22, 0)
  const yaw = MathUtils.degToRad(config.head.yaw)
  head.rotation.y = -yaw
  dog.add(body, head, tail)

  // Center the dog over the origin with its outlined paws resting on y = 0.
  const bounds = new Box3().setFromObject(body)
  const center = bounds.getCenter(new Vector3())
  dog.position.set(-center.x, -bounds.min.y, -center.z)
  const model = new Group(); model.name = 'Bean'
  model.scale.setScalar(config.scale)
  model.add(dog)

  const headWorld = new Vector3(), toCamera = new Vector3()
  let headYaw = yaw
  function update(elapsed: number, delta: number, camera: Camera, reducedMotion: boolean) {
    const a = config.animation
    if (config.headTracking) {
      // Turn toward the camera when it's in front of or beside Bean; face forward otherwise.
      head.getWorldPosition(headWorld)
      toCamera.copy(camera.position).sub(headWorld)
      const angle = Math.atan2(toCamera.z, toCamera.x)
      const limit = MathUtils.degToRad(config.maxHeadYaw)
      const target = Math.abs(angle) > MathUtils.degToRad(120) ? 0 : MathUtils.clamp(angle, -limit, limit)
      headYaw = reducedMotion ? target : MathUtils.damp(headYaw, target, 4, delta)
      head.rotation.y = -headYaw
    }
    if (reducedMotion) return
    const breath = Math.sin(elapsed * 2.1)
    body.scale.set(1, 1 + breath * a.breathing * 0.5, 1 + breath * a.breathing)
    head.position.y = breath * a.breathing * 18
    tail.rotation.y = Math.sin(elapsed * a.tailSpeed) * a.tailWag
  }

  return {
    model,
    update,
    dispose() { geometries.forEach(g => g.dispose()); material.dispose(); outline.dispose() },
  }
}
