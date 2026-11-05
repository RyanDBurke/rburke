# rburke

Personal site at [rburke.dev](https://rburke.dev), built with Vue + TypeScript + Vite. Pages are pre-rendered to HTML with `vite-ssg` so crawlers and AI tools can read them.

- `npm run dev`: local dev server
- `npm run build`: build to `dist/`
- `npm run check:bean`: check Bean's model is connected, outward-facing, and matches the sprite's side silhouette

## Bean's 3D viewer

Run `npm install` and `npm run dev`, then open the local URL and scroll to the Bean section.
Bean is a voxel model built from `public/images/bean.png`. The sprite's 43×41 pixel grid is
embedded in `src/bean/sprite.ts`, and the body and legs are derived from it directly: each
sprite column's top and belly rows become a rounded cross-section, and the legs follow their
pixels. The black outline pixels split the sprite into parts (far legs, far ear, tail, chin).
The head is modeled separately and turned toward the viewer, as the sprite draws it, then
follows the camera as you orbit.

Drag to orbit. Zoom is off so the wheel and vertical swipes keep scrolling the page, since
Bean fills a whole section. The full professional summary isn't
shown on the page; it lives in `public/llms.txt` for AI crawlers.

- `src/bean/config.ts`: scale, body widths, leg placement, head and ear shape, palette,
  head tracking, animation and outline settings. Units are sprite pixels; Y is up, +X
  toward the nose and Z across the body.
- `src/bean/buildBean.ts`: builds the body, head, ears and tail as voxel sets.
- `src/bean/voxels.ts`: exposed voxel faces with baked ambient occlusion, plus the
  one-voxel outline hull.
- `src/bean/createBean.ts`: assembles the parts, outline material and idle animation
  (breathing, tail wag, head tracking).
- `src/bean/setupScene.ts`: transparent WebGL scene, lighting, shadows, camera,
  and OrbitControls.
- `src/components/BeanViewer.vue`: lazy-loading, responsive viewer.

Three.js loads when the viewer approaches the viewport. Rendering pauses offscreen
and in background tabs; pixel density is capped at 1.5. Reduced motion disables the
breathing and tail wag. The viewer needs WebGL and shows an error if
it is unavailable. No external model or
texture assets are downloaded. Angles the sprite doesn't show are inferred.

Pushes to `main` deploy to Cloudflare automatically.

Notes backend setup and API contracts: [NOTES-SETUP.md](NOTES-SETUP.md). The public board UI is not yet implemented.
