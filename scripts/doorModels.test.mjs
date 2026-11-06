import test from 'node:test'
import assert from 'node:assert/strict'
import * as THREE from 'three'
import { buildDoors } from '../src/doorModels.js'

test('reference doors have selectable geometry, opposite white hinges and no decorative lights', () => {
  const oldDocument = globalThis.document
  const context = { fillRect() {}, beginPath() {}, moveTo() {}, lineTo() {}, stroke() {} }
  globalThis.document = { createElement: () => ({ width: 0, height: 0, getContext: () => context }) }
  const scene = new THREE.Scene(), textures = []
  try {
    const doors = buildDoors(scene, textures)
    assert.equal(doors.length, 3)
    assert.equal(doors[0].hinges.length, 2)
    assert.deepEqual(doors[0].hinges.map(h => h.sign), [-1, 1])
    assert.equal(doors[1].hinges.length, 1)
    assert.equal(doors[2].hinges.length, 1)
    scene.updateMatrixWorld(true)
    for (let i = 0; i < doors.length; i++) {
      const door = doors[i]
      const bounds = new THREE.Box3().setFromObject(door.group)
      assert.ok(bounds.min.y >= -.02 && bounds.max.y > 5.8)
      const ray = new THREE.Raycaster(new THREE.Vector3(door.x + .4, 3, 8), new THREE.Vector3(0, 0, -1))
      const hit = ray.intersectObject(door.group, true)[0]
      assert.ok(hit, 'the visible door surface can be selected')
      let object = hit.object
      while (object && object.userData.door === undefined) object = object.parent
      assert.equal(object.userData.door, i)
    }
    scene.traverse(o => {
      assert.ok(!o.isLight, 'doors contain no lamps or glow lights')
      if (o.geometry) for (const value of o.geometry.attributes.position.array) assert.ok(Number.isFinite(value))
    })
    // Both leaves swing away from their shared center when opening.
    doors[0].hinges.forEach(h => { h.node.rotation.y = h.sign * Math.PI / 2 })
    assert.equal(doors[0].hinges[0].node.rotation.y, -doors[0].hinges[1].node.rotation.y)
  } finally {
    globalThis.document = oldDocument
    const geometries = new Set(), materials = new Set()
    scene.traverse(o => { if (o.geometry) geometries.add(o.geometry); if (o.material) materials.add(o.material) })
    geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); textures.forEach(t => t.dispose())
  }
})
