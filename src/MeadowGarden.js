import * as THREE from 'three'

const SAVE_KEY = 'akbope-living-garden-v1'
// A small garden beside the pond keeps the chest and its approach clear.
export const gardenPlaces = [[7.8, 3.5], [10.7, 3.6], [13.6, 2.8]]
export function restoreGarden(raw) {
  return { beds: [0, 1, 2].map(i => [0, 1, 2].includes(raw?.beds?.[i]) ? raw.beds[i] : 0), water: Number.isInteger(raw?.water) && raw.water >= 0 && raw.water <= 3 ? raw.water : 0, collected: Number.isInteger(raw?.collected) && raw.collected >= 0 ? Math.min(raw.collected, 9999) : 0 }
}
export function buildLivingGarden({ scene, wood, gold, onChange }) {
  let state
  try { state = restoreGarden(JSON.parse(localStorage.getItem(SAVE_KEY))) } catch { state = restoreGarden() }
  const targets = [], beds = [], seeds = [], droplets = [], bursts = []
  const cube = new THREE.BoxGeometry(1, 1, 1), ball = new THREE.SphereGeometry(1, 14, 10), cylinder = new THREE.CylinderGeometry(1, 1, 1, 16)
  const leafGeo = new THREE.SphereGeometry(1, 12, 8), ring = new THREE.TorusGeometry(1, .065, 8, 36)
  const material = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: .7, ...extra })
  const soil = material('#503b2b'), leafMat = material('#456c38'), rim = material('#b29462'), canMat = material('#738b83', { metalness: .65, roughness: .35 })
  const glow = material('#ffe7a0', { emissive: '#ffc75b', emissiveIntensity: 1.5, roughness: .35 })
  const waterMat = material('#a6e4df', { transparent: true, opacity: .8, metalness: .2, roughness: .1 })
  const colors = ['#e4b3c2', '#f6e5ba', '#b69bd0']
  function mesh(parent, geometry, mat, pos, scale) {
    const object = new THREE.Mesh(geometry, mat); object.position.set(...pos); object.scale.set(...scale); object.castShadow = true; object.receiveShadow = true; parent.add(object); return object
  }
  function target(id, pos) { const group = new THREE.Group(); group.position.set(...pos); group.userData.action = id; group.userData.inWorld = true; scene.add(group); targets.push(group); return group }
  let hint = null, hintAge = 0, gust = 0, pourAge = 10, pourIndex = 0, clock = 0
  const publish = feedback => {
    hint = feedback; hintAge = 0
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)) } catch { /* The game remains playable without storage. */ }
    onChange?.({ ...state, beds: [...state.beds], feedback })
  }
  const burst = (position, color = '#ffe6a3') => {
    const group = new THREE.Group(); group.position.copy(position); scene.add(group)
    const mat = material(color, { emissive: color, emissiveIntensity: .65 })
    for (let i = 0; i < 14; i++) {
      const p = mesh(group, ball, mat, [0, 0, 0], [.045, .045, .045]); const a = i * 2.399
      p.userData.velocity = new THREE.Vector3(Math.cos(a) * (1 + i % 3 * .25), 1.3 + i % 4 * .25, Math.sin(a))
    }
    bursts.push({ group, age: 0, mat })
  }
  gardenPlaces.forEach(([x, z], index) => {
    const bed = target(`garden-bed-${index}`, [x, 0, z])
    mesh(bed, new THREE.CylinderGeometry(1.04, .85, .47, 12), wood, [0, .28, 0], [1, 1, 1])
    const dirt = mesh(bed, cylinder, soil, [0, .53, 0], [.95, .035, .95])
    for (const y of [.1, .46]) { const band = mesh(bed, ring, gold, [0, y, 0], [1, 1, 1]); band.rotation.x = Math.PI / 2 }
    for (let j = 0; j < 7; j++) { const a = j * 2.4; mesh(bed, ball, rim, [Math.cos(a) * .65, .58, Math.sin(a) * .65], [.075, .03, .06]) }
    const seed = mesh(bed, ball, gold, [0, .66, 0], [.18, .09, .12]); seed.rotation.z = -.3
    const plant = new THREE.Group(); plant.position.y = .55; bed.add(plant)
    const stalk = mesh(plant, new THREE.CylinderGeometry(.045, .065, 1.8, 10), leafMat, [0, .9, 0], [1, 1, 1])
    for (let j = 0; j < 4; j++) {
      const side = j % 2 ? -1 : 1
      const leaf = mesh(plant, leafGeo, leafMat, [side * .22, .35 + j * .29, 0], [.38, .07, .14]); leaf.rotation.z = side * .4
    }
    const flower = new THREE.Group(); flower.position.y = 1.8; plant.add(flower)
    const petalMat = material(colors[index], { side: THREE.DoubleSide, roughness: .8 })
    const petals = []
    const count = index === 0 ? 8 : index === 1 ? 13 : 6
    for (let j = 0; j < count; j++) {
      const pivot = new THREE.Group(); pivot.rotation.y = j / count * Math.PI * 2; flower.add(pivot)
      const petal = mesh(pivot, leafGeo, petalMat, [0, .09, .31], [index === 1 ? .12 : .22, .08, .43]); petals.push({ pivot, petal })
    }
    mesh(flower, ball, material(index === 2 ? '#e8b36a' : '#d7aa48'), [0, .08, 0], [.22, .12, .22])
    const halo = mesh(bed, new THREE.RingGeometry(.97, 1.015, 48), new THREE.MeshBasicMaterial({ color: '#ffe3a1', transparent: true, opacity: .4, side: THREE.DoubleSide, depthWrite: false }), [0, .57, 0], [1, 1, 1]); halo.rotation.x = -Math.PI / 2
    const record = { group: bed, plant, flower, petals, seed, dirt, halo, stalk, growth: state.beds[index] === 2 ? 1 : state.beds[index] === 1 ? .24 : 0, hydrated: 0 }
    beds.push(record)
    bed.userData.activate = () => {
      if (state.beds[index] === 0) { state.beds[index] = 1; burst(new THREE.Vector3(x, .7, z), '#a8c67b'); publish('planted') }
      else if (state.beds[index] === 1) {
        if (!state.water) { publish('water'); return }
        state.water--; state.beds[index] = 2; pourIndex = index; pourAge = 0; record.hydrated = 1; publish('growing')
      } else { releaseSeeds(index); publish('catch') }
    }
    const flying = target(`garden-seed-${index}`, [x, 3.5, z]); flying.visible = false
    mesh(flying, ball, glow, [0, 0, 0], [.17, .22, .17])
    const wings = []
    for (const side of [-1, 1]) { const wing = mesh(flying, leafGeo, material('#f6edc9', { transparent: true, opacity: .85, side: THREE.DoubleSide }), [side * .31, .1, 0], [.34, .035, .13]); wing.rotation.z = side * .4; wings.push(wing) }
    const aura = mesh(flying, ball, new THREE.MeshBasicMaterial({ color: '#ffe5a1', transparent: true, opacity: .09, depthWrite: false }), [0, 0, 0], [.4, .4, .4])
    flying.userData.activate = () => {
      if (!flying.visible) return
      flying.visible = false; state.collected++; state.beds[index] = 0
      burst(flying.position); publish('collected')
    }
    seeds.push({ group: flying, origin: new THREE.Vector3(x, 3.3, z), wings, aura })
  })
  function releaseSeeds(index) {
    const selected = index === undefined ? [0, 1, 2] : [index]
    selected.forEach(i => { if (state.beds[i] === 2) { seeds[i].group.visible = true; burst(beds[i].group.position.clone().add(new THREE.Vector3(0, 2.5, 0))) } })
  }
  // An actual metal watering can tips over the chosen planter.
  const can = new THREE.Group(); scene.add(can); can.visible = false
  mesh(can, cylinder, canMat, [0, 0, 0], [.3, .6, .3])
  const handle = mesh(can, ring, canMat, [-.35, .03, 0], [.36, .42, .36]); handle.rotation.y = 0
  const spout = mesh(can, cylinder, canMat, [.4, -.02, 0], [.055, .7, .055]); spout.rotation.z = -.9
  mesh(can, ball, canMat, [.67, .2, 0], [.13, .06, .13])
  for (let i = 0; i < 22; i++) { const drop = mesh(scene, ball, waterMat, [0, 0, 0], [.035, .09, .035]); drop.visible = false; droplets.push(drop) }
  const wellRing = mesh(scene, new THREE.RingGeometry(1.35, 1.43, 48), new THREE.MeshBasicMaterial({ color: '#b5e7dc', transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }), [-7.5, .08, -9], [1, 1, 1]); wellRing.rotation.x = -Math.PI / 2
  publish(null)
  return {
    targets,
    handle(id) {
      if (id.startsWith('garden-')) return true
      if (id === 'well' || id === 'pond') { state.water = 3; burst(new THREE.Vector3(id === 'well' ? -7.5 : 11, 1.6, id === 'well' ? -9 : -1.5), '#b5e7dc'); publish('filled'); return true }
      if (id === 'mill') { gust = 7; releaseSeeds(); publish(state.beds.some(s => s === 2) ? 'catch' : 'wind'); return true }
      if (id === 'mushrooms') { state.water = Math.min(3, state.water + 1); burst(new THREE.Vector3(-4.5, 1.3, 3), '#c2a9e6'); publish('filled'); return true }
      return false
    },
    get wind() { return gust },
    update(dt, paused) {
      clock += dt; hintAge += dt; gust = Math.max(0, gust - dt); pourAge += dt
      wellRing.material.opacity = hint === 'water' && hintAge < 5 ? .3 + Math.sin(clock * 6) * .2 : 0
      beds.forEach((bed, i) => {
        const goal = state.beds[i] === 2 ? 1 : state.beds[i] === 1 ? .24 : 0
        bed.growth = paused ? goal : THREE.MathUtils.damp(bed.growth, goal, 1.7, dt)
        bed.plant.visible = bed.growth > .01; bed.plant.scale.setScalar(Math.max(.001, bed.growth))
        bed.plant.rotation.z = paused ? 0 : Math.sin(clock * (gust ? 4 : 1.5) + i) * (gust ? .13 : .025)
        bed.seed.visible = state.beds[i] === 0
        const opening = THREE.MathUtils.smoothstep(bed.growth, .35, .95)
        bed.petals.forEach(({ petal }) => { petal.rotation.x = -(1 - opening) * 1.25; petal.position.y = .09 + (1 - opening) * .25 })
        bed.halo.material.opacity = state.beds[i] === 2 ? .12 : .26 + (paused ? 0 : Math.sin(clock * 2 + i) * .1)
        bed.hydrated = Math.max(0, bed.hydrated - dt * .08); bed.dirt.material = soil
      })
      seeds.forEach((seed, i) => {
        if (!seed.group.visible) return
        seed.group.position.copy(seed.origin)
        if (!paused) { seed.group.position.x += Math.sin(clock * .65 + i * 2) * .55; seed.group.position.y += Math.sin(clock * 1.4 + i) * .28; seed.group.rotation.y = clock * .5; seed.wings.forEach((wing, j) => { wing.rotation.z = Math.sin(clock * 8) * .4 * (j ? 1 : -1) }) }
      })
      const pouring = pourAge < 1.8; can.visible = pouring
      if (pouring) { const [x, z] = gardenPlaces[pourIndex]; can.position.set(x - .8, 2.4, z); can.rotation.z = paused ? -.4 : -.65 * Math.sin(Math.PI * Math.min(pourAge / 1.8, 1)); droplets.forEach((drop, i) => { drop.visible = true; const progress = ((paused ? 0 : pourAge * 1.5) + i / droplets.length) % 1; drop.position.set(x + Math.sin(i * 3) * .2, 2 - progress * 1.45, z + Math.cos(i * 3) * .2) }) }
      else droplets.forEach(drop => { drop.visible = false })
      for (let i = bursts.length - 1; i >= 0; i--) { const b = bursts[i]; b.age += dt; b.group.children.forEach(p => { p.position.copy(p.userData.velocity).multiplyScalar(paused ? .4 : b.age); if (!paused) p.position.y -= b.age * b.age * .9; p.scale.setScalar(Math.max(0, .05 * (1 - b.age / 1.3))) }); if (b.age > 1.3) { scene.remove(b.group); b.mat.dispose(); bursts.splice(i, 1) } }
    },
  }
}
