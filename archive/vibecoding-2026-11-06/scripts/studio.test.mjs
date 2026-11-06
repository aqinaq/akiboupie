import test from 'node:test'
import assert from 'node:assert/strict'
import * as THREE from 'three'
import { buildWindVillage } from '../src/genshinVillage.js'
import { windriseHeight } from '../src/genshinWorld.js'

test('studio cottage and journal remain pickable after static geometry is merged', () => {
  const previousDocument = globalThis.document
  const context = { fillRect() {}, strokeRect() {}, fillText() {}, createRadialGradient: () => ({ addColorStop() {} }) }
  globalThis.document = { createElement: () => ({ width:0, height:0, getContext: () => context }) }
  const scene = new THREE.Scene(), textures = []
  try {
    const village = buildWindVillage({ scene, random: () => .5, height: windriseHeight,
      material: (color, extra) => new THREE.MeshStandardMaterial({ color, ...extra }), textures })
    scene.updateMatrixWorld(true)
    const { targets, anchor } = village.studio
    assert.equal(targets.length, 2)
    assert.equal(targets.every(target => target.parent === scene && target.userData.panel === 'work'), true)
    const ray = new THREE.Raycaster(new THREE.Vector3(0, windriseHeight(0,-6.5)+1.3, 0), new THREE.Vector3(0,0,-1))
    const hits = ray.intersectObjects(targets)
    assert.equal(hits[0].object, targets[1], 'front journal is selected before the cottage')
    assert.equal(anchor.position.x, 0)
    assert.ok(village.obstacles.some(o => o.x === 0 && o.z === -11.5))
    assert.ok(!village.obstacles.some(o => o.x === 23 && o.z === -23), 'original far cottage was moved')
    const about = village.about
    assert.equal(about.targets[0].parent, scene, 'statue remains selectable after merging')
    assert.equal(about.targets[0].userData.panel, 'about')
    assert.deepEqual(about.anchor.position.toArray(), [-8, windriseHeight(-8,-8)+4.03, -6.97])
    assert.ok(about.anchor.position.x < anchor.position.x, 'statue frames the studio on the left')
    const view = new THREE.Vector3(0,3.2,8)
    const statueRay = new THREE.Raycaster(view, about.anchor.position.clone().sub(view).normalize())
    assert.equal(statueRay.intersectObjects(about.targets)[0]?.object, about.targets[0])
    const camera = new THREE.PerspectiveCamera(56, 16/9, .1, 260)
    camera.position.copy(view); camera.lookAt(0,3.45,-2); camera.updateMatrixWorld()
    for (const destination of [anchor.position, about.anchor.position, new THREE.Vector3(8.5,1.4,-8)]) {
      const screen = destination.clone().project(camera)
      assert.ok(Math.abs(screen.x)<.9 && Math.abs(screen.y)<.9, 'all destinations fit the initial desktop view')
    }
    village.update(.1, 1, true)
  } finally {
    globalThis.document = previousDocument
    const geometries = new Set(), materials = new Set()
    scene.traverse(o => { if(o.geometry) geometries.add(o.geometry); if(o.material) materials.add(o.material) })
    geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose())
  }
})
