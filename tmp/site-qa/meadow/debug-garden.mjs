// Exercise the real Three.js scene without a GPU: camera fitting, item visibility,
// ray picking, fixed object positions, and returning to the walking view.
import { readFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'
import assert from 'node:assert/strict'
import * as THREE from 'three'
let nextFrame, resize, rendered, hotspots, worldAction, gardenState
let width = 1600, height = 864
const noop = () => {}
const ctx = new Proxy({}, { get: (_, key) => key === 'canvas' ? {} : noop, set: () => true })
globalThis.document = { hidden: false, createElement: () => ({ getContext: () => ctx }), addEventListener: noop, removeEventListener: noop }
globalThis.window = { innerWidth: width, devicePixelRatio: 1, addEventListener: noop, removeEventListener: noop, cancelAnimationFrame: noop, ResizeObserver: class { constructor(fn) { resize = fn } observe() {} disconnect() {} } }
globalThis.matchMedia = () => ({ matches: false })
globalThis.requestAnimationFrame = fn => { nextFrame = fn; return 1 }
globalThis.sceneTestRenderer = class {
  shadowMap = {}
  domElement = { setAttribute: noop, addEventListener: noop, removeEventListener: noop, remove: noop }
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

const targets=[]; rendered.scene.traverse(o=>{if(o.userData.action)targets.push(o)})
for(const id of ['garden-bed-1','well']) {const o=targets.find(o=>o.userData.action===id); const p=o.localToWorld(new THREE.Vector3(0,.6,0)).project(rendered.camera); console.log(id, (p.x+1)*width/2,(1-p.y)*height/2)}
const ray = new THREE.Raycaster(); ray.setFromCamera(new THREE.Vector2(802/width*2-1,1-750/height*2),rendered.camera)
const hits=ray.intersectObjects(targets.filter(t=>t.visible),true); console.log(hits.slice(0,3).map(h=>{let o=h.object;while(o&&!o.userData.action)o=o.parent;return [o?.userData.action,h.distance]}));api.dispose()
