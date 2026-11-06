import * as THREE from 'three'

export const flowerPalette = ['#eaa0c7', '#b59ad9', '#fff3ef', '#df8eb6', '#b2a4e0', '#edda98']

// Head-sized pick volumes keep interaction independent of the many instanced petals.
export function pickBloom(ray, blooms, maxDistance = Infinity) {
  const sphere = new THREE.Sphere(), point = new THREE.Vector3()
  let nearest = null, distance = maxDistance
  for (const bloom of blooms) {
    sphere.center.copy(bloom.center); sphere.radius = bloom.radius
    if (!ray.intersectSphere(sphere, point)) continue
    const d = ray.origin.distanceTo(point)
    if (d < distance) { distance = d; nearest = { bloom, distance: d } }
  }
  return nearest
}

export function buildMeadowFlowers({ scene, random, height, pathDistance, mobile }) {
  const count = mobile ? 1300 : 2300
  const petals = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8), new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: .82 }), count * 16)
  const centers = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 6), new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: .65 }), count)
  const stems = new THREE.InstancedMesh(new THREE.CylinderGeometry(1, 1, 1, 6), new THREE.MeshStandardMaterial({ color: '#508353', roughness: .85 }), count)
  const leaves = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), new THREE.MeshStandardMaterial({ color: '#79a969', roughness: .7 }), count * 3)
  const dummy = new THREE.Object3D(), color = new THREE.Color(), blooms = []
  let petalIndex = 0, centerIndex = 0, stemIndex = 0, leafIndex = 0
  function piece(batch, index, position, scale, rotation = [0, 0, 0], tint) {
    dummy.position.set(...position); dummy.scale.set(...scale); dummy.rotation.set(...rotation); dummy.updateMatrix()
    batch.setMatrixAt(index, dummy.matrix)
    if (tint) batch.setColorAt(index, color.set(tint))
  }
  for (let i = 0; i < count; i++) {
    let x, z
    if (i % 3 === 0) {
      z = random() * 48 - 30
      x = (z > 0 ? Math.sin(z * .12) * 1.7 : Math.sin(z * .07) * 5) + (random() > .5 ? 1 : -1) * (2.2 + random() * 4)
    } else if (i % 3 === 1) {
      const [cx, cz] = [[-13,-23],[-35,-14],[34,-22],[-8,7],[8,10]][i % 5]
      const angle = random() * Math.PI * 2, radius = 2.8 + random() * 7
      x = cx + Math.cos(angle) * radius; z = cz + Math.sin(angle) * radius
    } else { x = (random() - .5) * 68; z = (random() - .5) * 68 - 8 }
    const ground = height(x, z)
    if (ground < 0 || Math.hypot(x, z) < 4 || pathDistance(x, z) < 2) continue
    const species = i % 6, size = .46 + random() * .30, h = (.9 + random() * .35) * size
    const y = ground + h, turn = random() * Math.PI * 2
    const tint = flowerPalette[species]
    piece(stems, stemIndex++, [x, ground + h / 2, z], [.016 * size, h, .016 * size])
    for (let j = 0; j < 3; j++) {
      const a = turn + j * 2.5, reach = .14 * size
      piece(leaves, leafIndex++, [x + Math.cos(a) * reach, ground + h * (.25 + j * .19), z + Math.sin(a) * reach], [.19 * size, .024 * size, .045 * size], [0, -a, .45])
    }
    let centerY = y, radius = .30 * size
    if (species === 1) {
      // Slender lavender sprigs with small, closely spaced buds.
      for (let j = 0; j < 12; j++) {
        const a = j * 2.4, level = j / 12, reach = .045 * (1 - level * .5) * size
        piece(petals, petalIndex++, [x + Math.cos(a) * reach, y + level * .48 * size, z + Math.sin(a) * reach], [.06 * size * (1 - level * .3), .075 * size, .055 * size], [0, a, .12], tint)
      }
      centerY += .22 * size; radius = .3 * size
    } else if (species === 3) {
      // Short, open crocus cups replace the oversized upright tulips.
      for (let j = 0; j < 6; j++) {
        const a = turn + j * Math.PI / 3
        piece(petals, petalIndex++, [x + Math.cos(a) * .11 * size, y + .04 * size, z + Math.sin(a) * .11 * size], [.10 * size, .17 * size, .035 * size], [Math.sin(a) * .45, -a + Math.PI / 2, -Math.cos(a) * .45], j % 2 ? '#f2bed8' : tint)
      }
      centerY += .04 * size; radius = .27 * size
    } else {
      // Cosmos, ivory daisies, violet anemones and buttery yellow daisies.
      const n = species === 2 || species === 5 ? 11 : 5
      const reach = (n === 11 ? .15 : .13) * size
      for (let j = 0; j < n; j++) {
        const a = turn + j * Math.PI * 2 / n
        piece(petals, petalIndex++, [x + Math.cos(a) * reach, y + .025 * size, z + Math.sin(a) * reach], [(n === 11 ? .15 : .17) * size, .025 * size, (n === 11 ? .045 : .085) * size], [0, -a, -.22], tint)
      }
      piece(centers, centerIndex++, [x, y + .045 * size, z], [.075 * size, .04 * size, .075 * size], [0, 0, 0], species === 4 ? '#8d729d' : '#dbc179')
    }
    blooms.push({ center: new THREE.Vector3(x, centerY, z), radius, color: tint })
  }
  for (const [mesh, written, name] of [[petals,petalIndex,'sculpted-flower-petals'],[centers,centerIndex,'flower-pollen-centers'],[stems,stemIndex,'flower-stems'],[leaves,leafIndex,'flower-leaves']]) {
    mesh.count = written; mesh.name = name; mesh.receiveShadow = true; mesh.computeBoundingSphere(); scene.add(mesh)
  }

  // A fixed particle pool supports repeated taps without accumulating objects.
  const capacity = 384, positions = new Float32Array(capacity * 3), colors = new Float32Array(capacity * 3), alpha = new Float32Array(capacity)
  const particles = Array.from({ length: capacity }, () => ({ life: 0, duration: 1, velocity: new THREE.Vector3(), still: false }))
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3).setUsage(THREE.DynamicDrawUsage))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3).setUsage(THREE.DynamicDrawUsage))
  geometry.setAttribute('dustAlpha', new THREE.BufferAttribute(alpha, 1).setUsage(THREE.DynamicDrawUsage))
  const dust = new THREE.Points(geometry, new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, vertexColors: true,
    uniforms: { pixelRatio: { value: Math.min(globalThis.devicePixelRatio || 1, 1.5) } },
    vertexShader: 'attribute float dustAlpha; varying float opacity; varying vec3 dustColor; uniform float pixelRatio; void main(){ opacity=dustAlpha; dustColor=color; vec4 p=modelViewMatrix*vec4(position,1.); gl_Position=projectionMatrix*p; gl_PointSize=clamp(180.*pixelRatio/max(1.,-p.z),3.,42.); }',
    fragmentShader: 'varying float opacity; varying vec3 dustColor; void main(){ float r=length(gl_PointCoord-vec2(.5))*2.; if(r>1.)discard; gl_FragColor=vec4(dustColor,opacity*pow(1.-r,1.6)); #include <colorspace_fragment> }'.replace('; #include', ';\n#include').replace('<colorspace_fragment> }', '<colorspace_fragment>\n}')
  }))
  dust.frustumCulled = false; dust.name = 'flower-color-dust'; scene.add(dust)
  let cursor = 0
  function burst(bloom, reducedMotion = false) {
    color.set(bloom.color)
    for (let i = 0; i < 64; i++) {
      const id = cursor++ % capacity, p = particles[id], a = random() * Math.PI * 2, spread = (.25 + random() * .75) * bloom.radius
      positions[id*3] = bloom.center.x + Math.cos(a) * spread
      positions[id*3+1] = bloom.center.y + .12 + random() * bloom.radius
      positions[id*3+2] = bloom.center.z + Math.sin(a) * spread
      color.toArray(colors, id*3); alpha[id] = .85
      p.duration = reducedMotion ? .65 : 1.8 + random() * .6; p.life = p.duration; p.still = reducedMotion
      p.velocity.set(Math.cos(a)*(.25+random()*.55), .25+random()*.55, Math.sin(a)*(.25+random()*.55))
    }
    geometry.attributes.position.needsUpdate = geometry.attributes.color.needsUpdate = geometry.attributes.dustAlpha.needsUpdate = true
  }
  return {
    blooms, pick: raycaster => pickBloom(raycaster.ray, blooms), burst,
    update(dt) {
      let active = false
      for (let i = 0; i < capacity; i++) {
        const p = particles[i]; if (p.life <= 0) continue
        active = true; p.life = Math.max(0, p.life - dt); alpha[i] = .85 * (p.life / p.duration) ** 1.5
        if (!p.still) { positions[i*3] += p.velocity.x*dt; positions[i*3+1] += p.velocity.y*dt; positions[i*3+2] += p.velocity.z*dt; p.velocity.multiplyScalar(Math.exp(-dt*.6)) }
      }
      if (active) geometry.attributes.position.needsUpdate = geometry.attributes.dustAlpha.needsUpdate = true
    }
  }
}
