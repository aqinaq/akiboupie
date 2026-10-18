// Exercise the real Three.js scene without a GPU: camera fitting, item visibility,
// ray picking, fixed object positions, and returning to the walking view.
import { readFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import assert from 'node:assert/strict'
import * as THREE from 'three'
let nextFrame, resize, rendered, hotspots, worldAction, gardenState
let width = 1440, height = 900
const pointerHandlers = {}
const noop = () => {}
const gardenSave = new Map(); globalThis.localStorage = { getItem: key => gardenSave.get(key) || null, setItem: (key, value) => gardenSave.set(key, value) }
const ctx = new Proxy({}, { get: (_, key) => key === 'canvas' ? {} : noop, set: () => true })
globalThis.document = { hidden: false, createElement: () => ({ getContext: () => ctx }), addEventListener: noop, removeEventListener: noop }
globalThis.window = { innerWidth: width, devicePixelRatio: 1, addEventListener: noop, removeEventListener: noop, cancelAnimationFrame: noop, ResizeObserver: class { constructor(fn) { resize = fn } observe() {} disconnect() {} } }
globalThis.matchMedia = () => ({ matches: false })
globalThis.requestAnimationFrame = fn => { nextFrame = fn; return 1 }
globalThis.sceneTestRenderer = class {
  shadowMap = {}
  domElement = { style: {}, setAttribute: noop, addEventListener: (name, fn) => { pointerHandlers[name] = fn }, removeEventListener: noop, remove: noop, focus: noop, setPointerCapture: noop, getBoundingClientRect: () => ({left:0,top:0,width,height}) }
  setPixelRatio() {} setSize() {} dispose() {}
  render(scene, camera) { rendered = { scene, camera } }
}
let source = await readFile('src/meadowScene.js', 'utf8')
source = source.replace("from 'three'", `from '${pathToFileURL(process.cwd() + '/node_modules/three/build/three.module.js')}'`)
source = source.replace("from './meadowDetails.js'", `from '${pathToFileURL(process.cwd() + '/src/meadowDetails.js')}'`)
source = source.replace("from './MeadowGarden.js'", `from '${pathToFileURL(process.cwd() + '/src/MeadowGarden.js')}'`)
source = source.replace('new THREE.WebGLRenderer(', 'new globalThis.sceneTestRenderer(')
const { createMeadow } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'))
const api = createMeadow({ appendChild: noop, getBoundingClientRect: () => ({ width, height }) }, { onReady: noop, onError: () => assert.fail('scene creation failed'), onChest: noop, onItem: noop, onHotspots: items => { hotspots = items }, onWorldAction: id => { worldAction = id }, onGardenState: value => { gardenState = value } })
let time = 1
const step = (count = 180) => { for (let i = 0; i < count; i++) { time += 34; nextFrame(time) } }
step(1)
const initialPosition = rendered.camera.position.clone(), initialRotation = rendered.camera.quaternion.clone()
assert.equal(initialPosition.x, 0, 'arrival is centered in front of the chest')
const arrivalDirection = rendered.camera.getWorldDirection(new THREE.Vector3())
assert.ok(Math.abs(arrivalDirection.x) < .0001, 'arrival faces straight ahead')
assert.ok(initialPosition.y > 5, 'eye level is above the chest')
pointerHandlers.pointerdown({ pointerType: 'touch', pointerId: 1, clientX: 200, clientY: 500 })
pointerHandlers.pointerdown({ pointerType: 'touch', pointerId: 2, clientX: 260, clientY: 500 })
pointerHandlers.pointermove({ pointerType: 'touch', pointerId: 1, clientX: 200, clientY: 370 })
step(12)
assert.ok(rendered.camera.position.z < initialPosition.z - 1, 'two-finger drag walks without a visible pad')
pointerHandlers.pointerup({ pointerType: 'touch', pointerId: 1 })
pointerHandlers.pointerup({ pointerType: 'touch', pointerId: 2 })
const stopped = rendered.camera.position.clone(); step(12)
assert.ok(rendered.camera.position.distanceTo(stopped) < .001, 'releasing both fingers stops walking')
api.reset(); step(1)

api.move('ArrowUp', true); step(30); api.move('ArrowUp', false)
assert.ok(rendered.camera.position.z < initialPosition.z - 3, 'walking moves forward')
assert.equal(rendered.camera.position.y, initialPosition.y, 'walking does not lower the viewpoint')
api.setOpen(true); step(); api.setOpen(false); step()
assert.equal(rendered.camera.position.y, initialPosition.y, 'closing the chest restores eye height')
api.reset(); step(1)
assert.ok(rendered.camera.position.distanceTo(initialPosition) < .001, 'home restores centered arrival')
assert.ok(rendered.camera.quaternion.angleTo(initialRotation) < .001, 'home restores arrival angle')
function checkInterior(label) {
  const items = []
  rendered.scene.traverse(object => { if (object.userData.panel) items.push(object) })
  assert.equal(items.length, 3)
  for (const item of items) {
    assert.ok(item.position.y < .7, `${label}: ${item.userData.panel} must rest in the chest`)
    assert.equal(item.rotation.x, -Math.PI / 2)
    const center = item.getWorldPosition(new THREE.Vector3()).project(rendered.camera)
    assert.ok(Math.abs(center.x) < .9 && Math.abs(center.y) < .9, `${label}: object fits in viewport`)
    const ray = new THREE.Raycaster()
    ray.setFromCamera(new THREE.Vector2(center.x, center.y), rendered.camera)
    const hit = ray.intersectObject(item.parent, true)[0]
    let target = hit?.object
    while (target && !target.userData.panel) target = target.parent
    assert.equal(target?.userData.panel, item.userData.panel, `${label}: ${item.userData.panel} must not be hidden behind the rim or lid`)
  }
  assert.ok(hotspots.every(item => item.visible))
}
const hills = []; rendered.scene.traverse(o => { if (o.name === 'terrain-hill') hills.push(o) })
const trunks = rendered.scene.getObjectByName('terrain-tree-trunks'), trunkMatrix = new THREE.Matrix4()
for (let i = 0; i < trunks.count; i++) {
  trunks.getMatrixAt(i, trunkMatrix)
  const p = new THREE.Vector3(), q = new THREE.Quaternion(), scale = new THREE.Vector3(); trunkMatrix.decompose(p, q, scale)
  const surface = hills.reduce((height, hill) => {
    const d = ((p.x - hill.position.x) / hill.scale.x) ** 2 + ((p.z - hill.position.z) / hill.scale.z) ** 2
    return d < 1 ? Math.max(height, hill.position.y + hill.scale.y * Math.sqrt(1 - d)) : height
  }, 0)
  assert.ok(Math.abs(p.y - scale.y / 2 - surface) < .001, 'tree trunk rests on hill surface, not inside it')
}
api.setOpen(true); step(); checkInterior('desktop')
width = 390; height = 844; resize(); step(); checkInterior('mobile')
api.setOpen(false); step()
assert.ok(rendered.camera.position.distanceTo(initialPosition) < .001)
assert.ok(rendered.camera.quaternion.angleTo(initialRotation) < .001)
assert.ok(hotspots.every(item => !item.visible))
api.setPaused(true); api.setOpen(true); step(1); checkInterior('reduced motion')
const actionObjects = new Map()
rendered.scene.traverse(object => { if (object.userData.action) actionObjects.set(object.userData.action, object) })
assert.equal(actionObjects.size, 18, 'nine useful village places and three chest keepsakes')
for (const id of ['planner', 'notes', 'library', 'workshop', 'mill', 'well', 'pond', 'lantern', 'mushrooms']) {
  const object = actionObjects.get(id)
  assert.ok(object, `${id} has a world target`)
  api.interact(id); if (!['mill', 'well', 'pond', 'mushrooms'].includes(id)) assert.equal(worldAction, id, `${id} opens the matching room`)
  if (['planner', 'notes', 'library', 'workshop'].includes(id)) {
    const center = object.localToWorld(new THREE.Vector3(0, 1, 0))
    const ray = new THREE.Raycaster(initialPosition, center.clone().sub(initialPosition).normalize())
    assert.ok(ray.intersectObject(object, true).length > 0, `${id} can be clicked on the building itself`)
  }
}
for (const [id, key] of [['lantern', 'lit'], ['well', 'lowered'], ['potion', 'glowing']]) {
  const object = actionObjects.get(id), before = object.userData[key]
  api.interact(id); step(2)
  assert.equal(object.userData[key], !before, `${id} responds to activation`)
  api.interact(id); step(2)
  assert.equal(object.userData[key], before, `${id} toggles back`)
}
api.interact('compass'); step(1)
assert.equal(actionObjects.get('compass').userData.spin, Math.PI * 4)
api.interact('mushrooms'); step(1)
assert.ok(actionObjects.get('mushrooms').userData.burst < 1)
api.interact('pond'); step(1)
assert.ok(actionObjects.get('pond').userData.ripple < 1)
for (const id of ['compass', 'key', 'potion']) {
  const object = actionObjects.get(id), center = object.getWorldPosition(new THREE.Vector3()).project(rendered.camera)
  const ray = new THREE.Raycaster(); ray.setFromCamera(new THREE.Vector2(center.x, center.y), rendered.camera)
  const hits = ray.intersectObject(object.parent, true)
  let hit = hits[0]?.object
  while (hit && !hit.userData.action) hit = hit.parent
  assert.equal(hit?.userData.action, id, `${id} is not occluded by another chest item`)
}
api.setOpen(false); step(1)
api.interact('garden-bed-1'); step(60)
assert.equal(gardenState.beds[1], 1, 'clicking soil plants a seed')
api.interact('well'); step(1)
assert.equal(gardenState.water, 3, 'well fills three watering charges')
api.interact('garden-bed-1'); step(100)
assert.equal(gardenState.beds[1], 2, 'watering grows a flower')
assert.equal(gardenState.water, 2, 'watering consumes one charge')
api.interact('mill'); step(30)
assert.equal(actionObjects.get('garden-seed-1').visible, true, 'wind releases a winged seed')
api.interact('garden-seed-1'); step(1)
assert.equal(gardenState.collected, 1, 'catching a seed earns a point')
assert.equal(gardenState.beds[1], 0, 'harvest allows planting again')
api.interact('garden-seed-1'); step(1)
assert.equal(gardenState.collected, 1, 'hidden seeds cannot be harvested twice')
api.dispose()
console.log('PASS: desktop/mobile interior visibility and picking, stationary items, camera return, reduced motion, nine useful village rooms and three keepsakes, hillside tree grounding, full planting/watering/wind/harvesting loop, and cleanup.')
