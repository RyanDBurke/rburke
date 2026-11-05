<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import type { setupBeanScene } from '../bean/setupScene'

const host=ref<HTMLElement>()
const error=ref(''), ready=ref(false)
let viewer:ReturnType<typeof setupBeanScene>|undefined, observer:IntersectionObserver|undefined, disposed=false
onMounted(()=>{
  observer=new IntersectionObserver(async([entry])=>{
    if(!entry.isIntersecting)return
    observer?.disconnect()
    try{
      const {setupBeanScene}=await import('../bean/setupScene')
      if(disposed || !host.value)return
      viewer=setupBeanScene(host.value)
      ready.value=true
    }catch{error.value='The 3D viewer needs WebGL. Try a browser with hardware acceleration enabled.'}
  },{rootMargin:'300px'})
  observer.observe(host.value!)
})
onUnmounted(()=>{disposed=true;observer?.disconnect();viewer?.dispose()})
</script>

<template>
  <figure class="bean-viewer">
    <div ref="host" class="canvas-host"></div>
    <p v-if="!ready && !error" class="status">Loading 3D Bean…</p>
    <p v-if="error" class="status" role="status">{{ error }}</p>
  </figure>
</template>

<style scoped>
/* Fills its container; the parent decides how tall Bean is. */
.bean-viewer {position:relative;width:100%;height:100%;margin:0;color:inherit}
.canvas-host {width:100%;height:100%;touch-action:pan-y} /* vertical swipes scroll the page; sideways drags rotate */
.canvas-host :deep(canvas) {display:block;width:100%;height:100%;outline-offset:-3px}
.status {position:absolute;inset:auto 0 0;margin:0;font-family:system-ui,sans-serif;font-size:0.7rem}
</style>
