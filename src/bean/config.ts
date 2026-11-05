// Tunable parameters for the sprite-derived Bean model. Units are sprite pixels (1 voxel = 1 pixel)
// unless noted; `scale` converts to scene units.
export const beanConfig = {
  scale: 0.085,
  palette: {
    g: '#7a7a78', // coat
    d: '#5b5b5a', // coat shade
    t: '#d4a473', // tan
    T: '#bd9063', // tan shade
    e: '#b9b9b5', // eye glint
    '#': '#0b0b0b', // outline / nose / eyes
  } as Record<string, string>,
  // Torso half-width along the body, as [sprite column, half-width] stops.
  bodyWidth: [[2, 4.5], [4, 6], [8, 6.5], [14, 6], [20, 6.5], [24, 7.5], [29, 7.5], [33, 6]] as [number, number][],
  bodyRoundness: 2.6, // superellipse exponent of the torso cross-section (2 = oval, higher = boxier)
  legs: { nearZ: [3, 5], farZ: [-5, -3], thighZ: 1 }, // thighs widen inward by `thighZ`
  head: {
    pivotX: 34.5, // sprite column of the head's turning axis
    halfLength: 5, halfWidth: 7, top: 34, bottom: 23,
    muzzleLength: 2,
    yaw: 45, // degrees the head turns toward the viewer, as drawn in the sprite
  },
  ears: {
    widths: [6, 6, 5, 5, 5, 4, 3], // bottom (sunk into the skull) to tip
    spacing: 4.5, // distance of each ear from the head's center line
    x: -2, // ear position front-to-back on the skull
    flare: 8, // degrees each ear's opening turns outward
    tilt: 12, // degrees each ear leans outward
  },
  outlineDepth: 4, // voxels the outline hull sits behind the surface, hiding stair-step creases
  headTracking: true, // Bean turns to look at the camera
  maxHeadYaw: 45,
  animation: { breathing: 0.012, tailWag: 0.35, tailSpeed: 7 },
  ambientOcclusion: [0.68, 0.8, 0.91, 1],
}
export type BeanConfig = typeof beanConfig
