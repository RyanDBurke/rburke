import {
  AmbientLight, Box3, DirectionalLight, Mesh, PerspectiveCamera, PlaneGeometry,
  Scene, ShadowMaterial, SRGBColorSpace, PCFSoftShadowMap, Vector3, WebGLRenderer,
} from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { createBean } from './createBean'

export function setupBeanScene(host: HTMLElement) {
  const scene=new Scene()
  const renderer=new WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'})
  renderer.setClearColor(0x000000,0)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.5))
  renderer.outputColorSpace=SRGBColorSpace
  renderer.shadowMap.enabled=true
  renderer.shadowMap.type=PCFSoftShadowMap
  renderer.domElement.setAttribute('aria-label','Interactive 3D voxel model of Bean, a gray and tan French bulldog')
  renderer.domElement.setAttribute('role','img')
  renderer.domElement.tabIndex=0
  host.appendChild(renderer.domElement)
  const camera=new PerspectiveCamera(34,1,0.1,100)
  const controls=new OrbitControls(camera,renderer.domElement)
  controls.enableDamping=true
  controls.enablePan=false
  controls.minDistance=6
  controls.maxDistance=25
  // Bean fills a whole section, so the wheel and pinch must keep scrolling the page.
  controls.enableZoom=false
  const {model,dispose:disposeModel,update}=createBean()
  scene.add(model)
  const box=new Box3().setFromObject(model)
  const size=box.getSize(new Vector3())
  const target=box.getCenter(new Vector3())
  controls.target.copy(target)
  scene.add(new AmbientLight(0xffffff,1.7))
  const key=new DirectionalLight(0xffffff,2.2)
  key.position.set(3,10,8); key.castShadow=true
  key.shadow.mapSize.set(1024,1024)
  Object.assign(key.shadow.camera,{left:-6,right:6,top:7,bottom:-7,near:0.1,far:30})
  key.shadow.normalBias=0.025; key.shadow.radius=3
  scene.add(key)
  const fill=new DirectionalLight(0xffffff,0.7); fill.position.set(-6,4,-5); scene.add(fill)
  const groundGeometry=new PlaneGeometry(20,20)
  const groundMaterial=new ShadowMaterial({opacity:0.16})
  const ground=new Mesh(groundGeometry,groundMaterial)
  ground.rotation.x=-Math.PI/2; ground.position.y=-0.02; ground.receiveShadow=true; scene.add(ground)

  let disposed=false, visible=false, frame=0, last=0, elapsed=0
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)')
  // The camera starts on Bean's side, matching the sprite. Fit the box's on-screen width and
  // height from there, then back off by its depth toward the camera.
  const dir=new Vector3(0,0.08,1).normalize()
  function reset() {
    const across=new Vector3(0,1,0).cross(dir); if(across.lengthSq()<1e-6)across.set(1,0,0); across.normalize()
    const up=dir.clone().cross(across).normalize()
    const extent=(v:Vector3)=>Math.abs(v.x)*size.x+Math.abs(v.y)*size.y+Math.abs(v.z)*size.z
    const tan=Math.tan(camera.fov*Math.PI/360)
    const vertical=extent(up)/2/tan
    const horizontal=extent(across)/2/(tan*camera.aspect)
    const distance=Math.max(vertical,horizontal)*1.2+extent(dir)/2
    camera.position.copy(target).add(dir.clone().multiplyScalar(distance))
    controls.target.copy(target); controls.update()
  }
  const resize=new ResizeObserver(()=>{
    const {width,height}=host.getBoundingClientRect()
    if(!width || !height)return
    camera.aspect=width/height; camera.updateProjectionMatrix()
    renderer.setSize(width,height,false); reset()
  })
  resize.observe(host)
  function render(now:number) {
    if(disposed || !visible)return
    const delta=Math.min((now-last)/1000,0.05); last=now; elapsed+=delta
    update(elapsed,delta,camera,motion.matches)
    controls.update(delta); renderer.render(scene,camera)
    frame=requestAnimationFrame(render)
  }
  const visibility=new IntersectionObserver(([entry])=>{
    visible=entry.isIntersecting && !document.hidden
    cancelAnimationFrame(frame)
    if(visible){last=performance.now();frame=requestAnimationFrame(render)}
  })
  visibility.observe(host)
  function onVisibility(){
    cancelAnimationFrame(frame)
    if(document.hidden){visible=false;cancelAnimationFrame(frame)}
    else {visible=host.getBoundingClientRect().bottom>0 && host.getBoundingClientRect().top<innerHeight
      if(visible){last=performance.now();frame=requestAnimationFrame(render)}}
  }
  document.addEventListener('visibilitychange',onVisibility)
  reset()
  return {
    dispose(){
      disposed=true;cancelAnimationFrame(frame);resize.disconnect();visibility.disconnect()
      document.removeEventListener('visibilitychange',onVisibility)
      controls.dispose();disposeModel();groundGeometry.dispose();groundMaterial.dispose()
      renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();scene.clear()
    },
  }
}
