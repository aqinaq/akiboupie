import test from 'node:test'
import assert from 'node:assert/strict'
import * as THREE from 'three'
import { buildSakuraPetals } from '../src/sakuraPetals.js'

function setup(trees = [{ x: 0, y: 0, z: 0, scale: 1 }], height = () => 0) {
  const scene = new THREE.Scene()
  let seed = 42
  const field = buildSakuraPetals({ scene, trees, height, mobile: true, random: () => { seed = seed * 16807 % 2147483647; return (seed - 1) / 2147483646 } })
  return { scene, field, tree: trees[0], mesh: scene.getObjectByName('interactive-sakura-petals') }
}

test('sakura picking selects a canopy or trunk, respects distance and hills, and misses open sky', () => {
  const { field, tree } = setup()
  const canopy = new THREE.Raycaster(new THREE.Vector3(0, 10, 20), new THREE.Vector3(0, 0, -1))
  assert.equal(field.pick(canopy).tree, tree)
  assert.equal(field.pick(canopy, 5), null)
  const trunk = new THREE.Raycaster(new THREE.Vector3(0, 2, 20), new THREE.Vector3(0, 0, -1))
  assert.equal(field.pick(trunk).tree, tree)
  const sky = new THREE.Raycaster(new THREE.Vector3(0, 25, 20), new THREE.Vector3(0, 0, -1))
  assert.equal(field.pick(sky), null)
  const hidden = setup([tree], (x, z) => z > 12 && z < 17 ? 15 : 0)
  assert.equal(hidden.field.pick(canopy), null)
})

test('petals fall from the selected canopy, repeated clicks stay bounded and expired petals disappear', () => {
  const { scene, field, tree, mesh } = setup([{ x: 12, y: 3, z: -10, scale: 1 }])
  const matrix = new THREE.Matrix4(), initial = new THREE.Vector3(), later = new THREE.Vector3()
  field.burst(tree)
  mesh.getMatrixAt(0, matrix); initial.setFromMatrixPosition(matrix)
  assert.ok(initial.distanceTo(new THREE.Vector3(tree.x, tree.y + 10, tree.z)) < 9)
  field.update(.5); mesh.getMatrixAt(0, matrix); later.setFromMatrixPosition(matrix)
  assert.ok(later.y < initial.y)
  for (let i = 0; i < 30; i++) field.burst(tree)
  assert.equal(mesh.instanceMatrix.count, field.capacity)
  assert.equal(scene.children.length, 1)
  for (let i = 0; i < 300; i++) field.update(.05)
  for (let i = 0; i < field.capacity; i++) {
    mesh.getMatrixAt(i, matrix)
    assert.equal(new THREE.Vector3().setFromMatrixScale(matrix).length(), 0)
  }
})

test('reduced motion holds petals in place and fades them out', () => {
  const { field, tree, mesh } = setup()
  const matrix = new THREE.Matrix4(), position = new THREE.Vector3(), after = new THREE.Vector3(), scale = new THREE.Vector3()
  field.burst(tree, true)
  mesh.getMatrixAt(0, matrix); position.setFromMatrixPosition(matrix); scale.setFromMatrixScale(matrix)
  field.update(.2); mesh.getMatrixAt(0, matrix); after.setFromMatrixPosition(matrix)
  assert.deepEqual(after, position)
  assert.ok(new THREE.Vector3().setFromMatrixScale(matrix).length() < scale.length())
  field.update(1); mesh.getMatrixAt(0, matrix)
  assert.equal(new THREE.Vector3().setFromMatrixScale(matrix).length(), 0)
})
