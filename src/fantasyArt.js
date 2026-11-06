import * as THREE from 'three'

// A shared, stepped light ramp gives the entire world painted anime shadows.
export function createFantasyMaterials() {
  const ramp = new THREE.DataTexture(new Uint8Array([76, 144, 211, 255]), 4, 1, THREE.RedFormat)
  ramp.minFilter = ramp.magFilter = THREE.NearestFilter
  ramp.needsUpdate = true
  return {
    ramp,
    mat(color, extra = {}) {
      const options = { ...extra }
      delete options.roughness
      delete options.metalness
      delete options.flatShading
      return new THREE.MeshToonMaterial({ color, gradientMap: ramp, ...options })
    },
  }
}

export function buildFantasyHorizon(scene, random, mat) {
  const sky = new THREE.Mesh(new THREE.SphereGeometry(115, 32, 20), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    uniforms: { zenith: { value: new THREE.Color('#0876d7') }, horizon: { value: new THREE.Color('#86d5f4') } },
    vertexShader: 'varying vec3 direction; void main(){direction=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: 'uniform vec3 zenith; uniform vec3 horizon; varying vec3 direction; void main(){float h=clamp(normalize(direction).y,0.,1.); gl_FragColor=vec4(mix(horizon,zenith,pow(h,.28)),1.);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}',
  }))
  sky.material.fog = false
  sky.name = 'painted-gradient-sky'; scene.add(sky)
  const clouds = new THREE.Group(); clouds.name = 'sculpted-cloud-banks'; scene.add(clouds)
  const cloudGeo = new THREE.SphereGeometry(1, 16, 10)
  const white = new THREE.MeshBasicMaterial({ color: '#f5fcff', fog: false })
  for (let i = 0; i < 16; i++) {
    const angle = i / 16 * Math.PI * 2, radius = 78 + random() * 12
    const bank = new THREE.Group(); bank.position.set(Math.sin(angle) * radius, 23 + random() * 15, Math.cos(angle) * radius)
    for (let j = 0; j < 5; j++) {
      const puff = new THREE.Mesh(cloudGeo, white)
      puff.position.set((j - 2) * 3.2, Math.sin(j * 1.6) * 1.2, 0)
      puff.scale.set(4 + random() * 2, 1.2 + random() * 1.8, 2.5); bank.add(puff)
    }
    clouds.add(bank)
  }
  const cliffMats = ['#608eac', '#77a7b2', '#94bec2'].map(c => mat(c, { flatShading: true }))
  const cliffGeo = new THREE.CylinderGeometry(.64, 1, 1, 7, 3)
  const turf = mat('#71b75b')
  for (let i = 0; i < 22; i++) {
    const angle = i / 22 * Math.PI * 2, radius = 79 + random() * 9
    const height = 13 + random() * 23, width = 5 + random() * 9
    const cliff = new THREE.Mesh(cliffGeo, cliffMats[i % 3])
    cliff.position.set(Math.sin(angle) * radius, height / 2 - 2, Math.cos(angle) * radius)
    cliff.scale.set(width, height, width * .72); cliff.rotation.y = random() * 6.28; scene.add(cliff)
    const top = new THREE.Mesh(new THREE.CylinderGeometry(.67, .7, .5, 7), turf)
    top.position.set(cliff.position.x, height - 1.8, cliff.position.z); top.scale.set(width, 1, width * .72); top.rotation.y = cliff.rotation.y; scene.add(top)
  }
  const stone = mat('#e2e6d8'), gold = mat('#f4d486')
  const crystal = mat('#62e7ef', { emissive: '#28b9dd', emissiveIntensity: .55 })
  const add = (geometry, material, x, y, z, sx = 1, sy = 1, sz = 1) => {
    const m = new THREE.Mesh(geometry, material); m.position.set(x, y, z); m.scale.set(sx, sy, sz)
    m.castShadow = true; m.receiveShadow = true; scene.add(m); return m
  }
  // Broken columns frame an elemental waystone, outside the existing walking route.
  const column = new THREE.CylinderGeometry(.4, .55, 1, 10)
  for (const [x, z, h] of [[-18, 2, 5.5], [-22, 0, 4], [19, 7, 5], [23, 9, 3.2]]) {
    add(column, stone, x, h / 2, z, 1, h, 1)
    add(new THREE.BoxGeometry(1.4, .25, 1.4), stone, x, .15, z)
    add(new THREE.BoxGeometry(1.25, .25, 1.25), gold, x, h, z)
  }
  const waystone = new THREE.Group(); waystone.position.set(-11, 0, 3); scene.add(waystone)
  const base = new THREE.Mesh(new THREE.CylinderGeometry(1, 1.3, .5, 8), stone); base.position.y = .25; waystone.add(base)
  const jewel = new THREE.Mesh(new THREE.OctahedronGeometry(.65), crystal); jewel.position.y = 2.5; jewel.scale.y = 2; waystone.add(jewel)
  const halo = new THREE.Mesh(new THREE.TorusGeometry(1.2, .035, 8, 64), gold); halo.position.y = 2.5; halo.rotation.x = .28; waystone.add(halo)
  const motesGeo = new THREE.BufferGeometry(), vertices = []
  for (let i = 0; i < 90; i++) vertices.push((random() - .5) * 45, .8 + random() * 5, (random() - .5) * 45)
  motesGeo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3))
  const motes = new THREE.Points(motesGeo, new THREE.PointsMaterial({ color: '#d4fff3', size: .055, transparent: true, opacity: .8, depthWrite: false })); scene.add(motes)
  return { update(time) { clouds.rotation.y = time * .0008; jewel.position.y = 2.5 + Math.sin(time * 1.5) * .18; jewel.rotation.y = time * .35; halo.rotation.z = time * .15; motes.rotation.y = time * .008 } }
}
