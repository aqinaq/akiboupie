import * as THREE from 'three'

// A fixed pool keeps repeated tree clicks to one draw call and bounded memory.
export function buildSakuraPetals({ scene, trees, random, height, mobile = false }) {
  const capacity = mobile ? 384 : 768
  const mesh = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 7, 4), new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: .9, side: THREE.DoubleSide }), capacity)
  mesh.name = 'interactive-sakura-petals'
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage)
  mesh.frustumCulled = false
  const dummy = new THREE.Object3D(), tint = new THREE.Color()
  const particles = Array.from({ length: capacity }, () => ({ life: 0, position: new THREE.Vector3(), phase: 0, age: 0, size: 0, still: false }))
  let cursor = 0
  dummy.scale.setScalar(0); dummy.updateMatrix()
  for (let i = 0; i < capacity; i++) { mesh.setMatrixAt(i, dummy.matrix); mesh.setColorAt(i, tint.set('#f7bad4')) }
  scene.add(mesh)
  const unitSphere = new THREE.Sphere(new THREE.Vector3(), 1)
  const inverse = new THREE.Matrix4(), transform = new THREE.Matrix4(), rotation = new THREE.Quaternion()
  const center = new THREE.Vector3(), scale = new THREE.Vector3(), localRay = new THREE.Ray(), hit = new THREE.Vector3(), onRay = new THREE.Vector3(), onTrunk = new THREE.Vector3()
  function pick(raycaster, maxDistance = Infinity) {
    let closest = null
    for (const tree of trees) {
      const { x, y, z, scale: s } = tree
      center.set(x, y + 10.3 * s, z); scale.set(9.5 * s, 3.7 * s, 9.5 * s)
      transform.compose(center, rotation, scale); inverse.copy(transform).invert()
      localRay.copy(raycaster.ray).applyMatrix4(inverse)
      let distance = Infinity
      if (localRay.intersectSphere(unitSphere, hit)) distance = hit.applyMatrix4(transform).distanceTo(raycaster.ray.origin)
      const trunkDistance = raycaster.ray.distanceSqToSegment(new THREE.Vector3(x, y, z), new THREE.Vector3(x, y + 8 * s, z), onRay, onTrunk)
      if (trunkDistance < (.9 * s) ** 2) distance = Math.min(distance, onRay.distanceTo(raycaster.ray.origin))
      if (distance >= maxDistance || distance >= (closest?.distance ?? Infinity)) continue
      // Hills hide trees just as they do in the rendered landscape.
      let hidden = false
      for (let d = .5; d < distance; d += 1) {
        raycaster.ray.at(d, hit)
        if (hit.y < height(hit.x, hit.z) - .1) { hidden = true; break }
      }
      if (!hidden) closest = { tree, distance }
    }
    return closest
  }
  function burst(tree, reducedMotion = false) {
    const amount = mobile ? 90 : 160
    for (let i = 0; i < amount; i++) {
      const id = cursor++ % capacity, p = particles[id], angle = random() * Math.PI * 2, radius = Math.sqrt(random()) * 7.5 * tree.scale
      p.position.set(tree.x + Math.cos(angle) * radius, tree.y + (8.5 + random() * 3) * tree.scale, tree.z + Math.sin(angle) * radius)
      p.life = p.duration = reducedMotion ? .7 : 9 + random() * 4
      p.still = reducedMotion; p.age = 0; p.phase = random() * Math.PI * 2
      p.speed = 1.1 + random() * .65; p.size = (.12 + random() * .08) * Math.max(.6, tree.scale)
      tint.setHSL(.91 + random() * .04, .5 + random() * .15, .78 + random() * .12); mesh.setColorAt(id, tint)
    }
    mesh.instanceColor.needsUpdate = true
    update(0)
  }
  function update(dt) {
    let changed = false
    for (let i = 0; i < capacity; i++) {
      const p = particles[i]
      if (p.life <= 0) continue
      changed = true; p.life = Math.max(0, p.life - dt); p.age += dt
      if (!p.still) {
        p.position.x += (.22 + Math.sin(p.age * 1.8 + p.phase) * .65) * dt
        p.position.z += Math.cos(p.age * 1.3 + p.phase) * .4 * dt
        p.position.y -= p.speed * dt
        if (p.position.y <= height(p.position.x, p.position.z) + .04) p.life = 0
      }
      dummy.position.copy(p.position)
      dummy.rotation.set(p.phase + (p.still ? 0 : p.age * 1.7), p.phase, p.still ? 0 : Math.sin(p.age + p.phase) * .7)
      const fade = p.still ? p.life / p.duration : Math.min(1, p.life)
      dummy.scale.set(p.size * fade, p.size * .09 * fade, p.size * .55 * fade)
      dummy.updateMatrix(); mesh.setMatrixAt(i, dummy.matrix)
    }
    if (changed) mesh.instanceMatrix.needsUpdate = true
  }
  return { pick, burst, update, capacity }
}
