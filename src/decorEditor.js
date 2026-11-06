import * as THREE from 'three'

const STORAGE_KEY = 'akbope:lobby-layout:v3'
const floorNames = new Set(['right-display-shelf', 'stacked-floor-books', 'half-rolled-blond-poster', 'stacked-longshot-caps'])
const editableNames = [
  'kazakhstan-swag-poster',
  'turquoise-lace-poster', 'kazakh-ornament-poster',
  'demon-days-poster', 'yellow-manga-poster', 'red-manga-poster',
  'yolo-wall-lettering',
  'new-york-metal-plate',
  'astro-boy-toy',
  'green-tree-pose-toy', 'green-headstand-toy',
  'blue-flame-kaiju-toy',
  'chalk-wall-quote',
  'round-guitar-sign',
  'shinjuku-poster',
  'spain-swag-poster',
  'rio-poster',
  'green-skater-poster',
  'orda-poster',
  'peace-kitten-poster',
  'lock-in-cat-poster',

  'igor-poster', 'band-poster', 'lana-poster', 'wall-skateboard',
  'nihao-cats-poster', 'leather-portrait-poster', 'blue-night-poster',
  'stairs-scene-poster', 'pink-group-poster', 'los-angeles-poster', 'new-york-poster',
  ...floorNames, 'rubiks-cube', 'megaminx', 'silver-wired-headphones',
  'portable-music-player', 'vinyl-record-stack', 'cassette-stack',
  'skool-luv-affair-cd', 'record-sleeves',
]

// Store local positions so moving a shelf also moves its arranged contents.
export function createDecorLayout(root, storage, extraObjects = []) {
  const objects = [...editableNames.map(name => root.getObjectByName(name)).filter(Boolean), ...extraObjects]
  const defaults = new Map(objects.map(o => [o.name, o.position.toArray()]))
  try {
    const saved = JSON.parse(storage?.getItem(STORAGE_KEY) || '{}')
    for (const o of objects) {
      if (o.userData.layoutRevision && saved?._revisions?.[o.name] !== o.userData.layoutRevision) continue
      const p = saved?.[o.name]
      if (Array.isArray(p) && p.length === 3 && p.every(v => Number.isFinite(v) && Math.abs(v) < 40)) o.position.fromArray(p)
    }
  } catch { /* Unavailable storage or an old malformed layout must not break the scene. */ }
  const save = () => {
    try { storage?.setItem(STORAGE_KEY, JSON.stringify({...Object.fromEntries(objects.map(o => [o.name, o.position.toArray()])), _revisions:Object.fromEntries(objects.filter(o=>o.userData.layoutRevision).map(o=>[o.name,o.userData.layoutRevision]))})) } catch { /* Session editing still works with browser storage disabled. */ }
  }
  return { objects, save, reset() { for (const o of objects) o.position.fromArray(defaults.get(o.name)); save() } }
}

export function createDecorEditor({ root, extraObjects = [], scene, camera, canvas, invalidate, onObjectClick }) {
  let storage
  try { storage = window.localStorage } catch { /* Private browsing can disable storage. */ }
  const layout = createDecorLayout(root, storage, extraObjects)
  const objectSet = new Set(layout.objects)
  const ray = new THREE.Raycaster(), pointer = new THREE.Vector2(), point = new THREE.Vector3()
  const outline = new THREE.BoxHelper(undefined, '#d5c6ac')
  outline.material.depthTest = false
  outline.material.transparent = true
  outline.material.opacity = .65
  outline.visible = false
  outline.renderOrder = 20
  scene.add(outline)
  let enabled = true, selected = null, drag = null
  const refresh = () => { outline.visible = enabled && !!drag?.moved; if (selected) outline.setFromObject(selected); invalidate() }
  function cast(e) {
    const r = canvas.getBoundingClientRect()
    pointer.set((e.clientX-r.left)/r.width*2-1, -(e.clientY-r.top)/r.height*2+1)
    scene.updateMatrixWorld(true); camera.updateMatrixWorld(true)
    ray.setFromCamera(pointer, camera)
  }
  function pick(e) {
    cast(e)
    for (const intersection of ray.intersectObjects([root, ...extraObjects], true)) {
      let hit=intersection.object, visible=true, candidate=null
      while(hit){if(!hit.visible)visible=false;if(!candidate&&objectSet.has(hit))candidate=hit;hit=hit.parent}
      if(visible&&candidate)return candidate
    }
    return null
  }
  function stop(e) { e.preventDefault(); e.stopImmediatePropagation() }
  function finish(cancel = false) {
    if (!drag) return
    if (cancel) selected.position.copy(drag.localStart)
    const id = drag.id
    drag = null
    if (canvas.hasPointerCapture?.(id)) canvas.releasePointerCapture(id)
    layout.save(); refresh()
  }
  function down(e) {
    if (!enabled || e.button > 0) return
    finish(); selected = pick(e); refresh()
    if (!selected) return
    stop(e); canvas.focus()
    const world = selected.getWorldPosition(new THREE.Vector3())
    const normal = floorNames.has(selected.name) ? new THREE.Vector3(0,1,0) : new THREE.Vector3(0,0,1)
    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(normal, world)
    if (!ray.ray.intersectPlane(plane, point)) return
    drag = { id:e.pointerId, plane, start:point.clone(), world, localStart:selected.position.clone(), screenX:e.clientX, screenY:e.clientY, moved:false }
    canvas.setPointerCapture(e.pointerId); canvas.style.cursor='grabbing'
  }
  function place(world) {
    world.x = THREE.MathUtils.clamp(world.x, -12.5, 12.5)
    world.z = THREE.MathUtils.clamp(world.z, -.10, 8)
    world.y = THREE.MathUtils.clamp(world.y, 0, 8)
    selected.position.copy(selected.parent.worldToLocal(world))
    selected.updateWorldMatrix(true,true)
    const bounds = new THREE.Box3().setFromObject(selected)
    if (bounds.min.y < .005) selected.position.y += .005-bounds.min.y
    refresh()
  }
  function move(e) {
    if (!enabled) return
    if (!drag) { if(pick(e)){stop(e);canvas.style.cursor='grab'} return }
    stop(e)
    if (e.pointerId !== drag.id) return
    if (!drag.moved && Math.hypot(e.clientX-drag.screenX,e.clientY-drag.screenY)<5) return
    drag.moved=true
    cast(e)
    if (ray.ray.intersectPlane(drag.plane, point)) place(drag.world.clone().add(point.clone().sub(drag.start)))
  }
  function up(e) {
    if (!enabled || !drag || e.pointerId!==drag.id) return
    stop(e);const clicked=!drag.moved;finish();canvas.style.cursor='grab'
    if(clicked)onObjectClick?.(selected)
  }
  function cancel() { finish(true) }
  function nudge(x,y,z) {
    if (!enabled || !selected) return
    finish(); place(selected.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(x,y,z))); layout.save()
  }
  function key(e) {
    if (!enabled || e.target !== canvas) return
    if (e.key === 'Escape') { stop(e); finish(true); selected=null; refresh(); return }
    const step=e.altKey?.02:.1
    const offsets = { ArrowLeft:[-step,0,0], ArrowRight:[step,0,0], ArrowUp:e.shiftKey?[0,0,-step]:[0,step,0], ArrowDown:e.shiftKey?[0,0,step]:[0,-step,0] }
    if (offsets[e.key]) { stop(e); nudge(...offsets[e.key]) }
  }
  for (const [name,fn] of [['pointerdown',down],['pointermove',move],['pointerup',up],['pointercancel',cancel],['lostpointercapture',cancel],['keydown',key]]) canvas.addEventListener(name,fn,true)
  window.addEventListener('blur',cancel)
  return {
    setEnabled(value) { finish(); enabled=value; if(!enabled)selected=null;canvas.style.cursor=value?'grab':'default';refresh() },
    nudgeDepth(amount) { nudge(0,0,amount) },
    reset() { finish();layout.reset();refresh() },
    dispose() {
      finish()
      for (const [name,fn] of [['pointerdown',down],['pointermove',move],['pointerup',up],['pointercancel',cancel],['lostpointercapture',cancel],['keydown',key]]) canvas.removeEventListener(name,fn,true)
      window.removeEventListener('blur',cancel);outline.removeFromParent();outline.geometry.dispose();outline.material.dispose()
    },
  }
}
