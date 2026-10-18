import * as THREE from 'three'
import { gardenPlaces } from './MeadowGarden.js'

// Small, hand-built pieces of a lived-in fantasy countryside. Static parts are
// instanced by geometry/material, so added detail does not mean hundreds of draws.
export function buildMeadowDetails({ scene, wood, gold, random, mat, terrainHeight }) {
  const buckets = new Map(), dummy = new THREE.Object3D()
  const cube = new THREE.BoxGeometry(1, 1, 1), sphere = new THREE.SphereGeometry(1, 12, 8)
  const cylinder = new THREE.CylinderGeometry(1, 1, 1, 12), cone = new THREE.ConeGeometry(1, 1, 12)
  const rock = new THREE.DodecahedronGeometry(1, 1), ring = new THREE.TorusGeometry(1, .11, 6, 20)
  const stone = mat('#a3987f'), stoneDark = mat('#706c58'), plaster = mat('#dbc69c'), roof = mat('#774b37'), iron = mat('#393a30', { metalness: .6 }), moss = mat('#667044')
  const green = mat('#435d32', { side: THREE.DoubleSide }), lightGreen = mat('#7b8b47', { side: THREE.DoubleSide }), stem = mat('#4c6539')
  const animations = [], targets = [], obstacles = []
  function stamp(geometry, material, pos, scale = [1, 1, 1], rotation = [0, 0, 0]) {
    const key = geometry.uuid + material.uuid
    if (!buckets.has(key)) buckets.set(key, { geometry, material, matrices: [] })
    dummy.position.set(...pos); dummy.scale.set(...scale); dummy.rotation.set(...rotation); dummy.updateMatrix()
    buckets.get(key).matrices.push(dummy.matrix.clone())
  }
  function part(parent, geometry, material, pos, scale = [1, 1, 1], rotation = [0, 0, 0]) {
    const mesh = new THREE.Mesh(geometry, material); mesh.position.set(...pos); mesh.scale.set(...scale); mesh.rotation.set(...rotation)
    mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh
  }
  function target(id, pos, label) { const group = new THREE.Group(); group.position.set(...pos); group.userData.action = id; group.userData.label = label; scene.add(group); targets.push(group); return group }
  function petalGeometry(cup) {
    const geo = new THREE.PlaneGeometry(1, 1, 6, 10), p = geo.attributes.position
    for (let i = 0; i < p.count; i++) { const u = p.getX(i), v = p.getY(i) + .5; p.setXYZ(i, u * Math.pow(Math.sin(v * Math.PI), .65), Math.sin(v * Math.PI) * .12 + v * v * cup, v) }
    geo.computeVertexNormals(); return geo
  }
  const petal = petalGeometry(.1), cuppedPetal = petalGeometry(.75)
  const petalMats = ['#f1e5bf', '#ba493a', '#547ba2', '#9472a2', '#a47fb9', '#d2925c'].map(c => mat(c, { side: THREE.DoubleSide, roughness: .95 }))
  const pollen = mat('#c7a13b'), darkHeart = mat('#443e2c')
  const bellGeo = new THREE.LatheGeometry([new THREE.Vector2(.16, 0), new THREE.Vector2(.125, .06), new THREE.Vector2(.08, .17), new THREE.Vector2(.035, .23)], 12)
  const beds = [[-5, 3], [5, 3], [-7, 8], [8, 8], [-3, -5], [6, -4], [-12, 1], [14, 8], [0, 16], [10, 15], [-8, 17], [14, -8]]
  const flowerCount = window.innerWidth < 700 ? 260 : 360
  for (let i = 0; i < flowerCount; i++) {
    const kind = i % 6, bed = beds[Math.floor(i / 6) % beds.length], a = random() * Math.PI * 2, r = Math.sqrt(random()) * 4
    let x = bed[0] + Math.cos(a) * r, z = bed[1] + Math.sin(a) * r
    if (Math.hypot(x / 1.25, z) < 4.5) x += x > 0 ? 3 : -3
    if (z > 1 && z < 22 && Math.abs(x - (1.2 + Math.sin(z * .22) * 1.2)) < 1.1) x += 2
    if (gardenPlaces.some(([gx, gz]) => Math.hypot(x - gx, z - gz) < 1.6)) z += 3
    const height = .55 + random() * .9, size = .75 + random() * .5
    stamp(cylinder, stem, [x, height / 2, z], [.018, height, .018])
    for (let j = 0; j < 3; j++) stamp(petal, j % 2 ? green : lightGreen, [x, height * (.22 + j * .17), z], [.17, .3, .35], [.2, j * 2.4, .2])
    if (kind === 3) {
      for (let k = 0; k < 6; k++) for (let j = 0; j < 4; j++) {
        const angle = j * Math.PI / 2 + k * .6
        stamp(sphere, petalMats[3], [x + Math.cos(angle) * .055, height - k * .065, z + Math.sin(angle) * .055], [.05 * size, .07, .05 * size])
      }
    } else if (kind === 4) {
      for (let k = 0; k < 4; k++) {
        const angle = k * 2.4, dx = Math.cos(angle) * .15, dz = Math.sin(angle) * .15
        stamp(bellGeo, petalMats[4], [x + dx, height - k * .16, z + dz], [size, size, size], [.3 * Math.sin(angle), angle, .25])
      }
    } else {
      const n = kind === 0 ? 13 : kind === 1 ? 5 : kind === 2 ? 11 : 6
      for (let j = 0; j < n; j++) {
        const angle = j / n * Math.PI * 2
        stamp(kind === 1 || kind === 5 ? cuppedPetal : petal, petalMats[kind], [x, height, z], [(kind === 1 ? .63 : kind === 5 ? .36 : .16) * size, size * .6, (kind === 0 ? .38 : .34) * size], [0, angle, (random() - .5) * .15])
      }
      stamp(sphere, kind === 1 ? darkHeart : pollen, [x, height + .025, z], [.105 * size, .055, .105 * size])
      if (kind === 0 || kind === 1) for (let k = 0; k < 7; k++) stamp(sphere, pollen, [x + Math.cos(k) * .07, height + .075, z + Math.sin(k) * .07], [.012, .02, .012])
    }
  }
  // Fern fronds, broad dock leaves and seed heads make the undergrowth varied.
  for (let i = 0; i < 58; i++) {
    const a = random() * 6.28, radius = 5 + random() * 17, x = Math.cos(a) * radius, z = Math.sin(a) * radius
    if (gardenPlaces.some(([gx, gz]) => Math.hypot(x - gx, z - gz) < 1.7)) continue
    for (let frond = 0; frond < 5; frond++) {
      const direction = frond * 1.256 + a
      for (let j = 1; j < 7; j++) {
        const reach = j * .115, y = Math.sin(j / 7 * Math.PI * .8) * .65
        for (const side of [-1, 1]) stamp(petal, frond % 2 ? green : lightGreen, [x + Math.sin(direction) * reach, y, z + Math.cos(direction) * reach], [.12 * (1 - j / 9), .25, .25 * (1 - j / 9)], [.1, direction + side * 1.1, .1])
      }
    }
  }
  const wheat = mat('#b5a363'), reedBrown = mat('#694c31')
  for (let i = 0; i < 90; i++) {
    const x = 10 + random() * 9, z = -15 + random() * 9, h = .8 + random() * .7
    stamp(cylinder, stem, [x, h / 2, z], [.012, h, .012])
    for (let j = 0; j < 5; j++) stamp(sphere, wheat, [x + (j % 2 ? .04 : -.04), h - j * .05, z], [.035, .075, .035], [0, 0, j % 2 ? -.4 : .4])
  }
  // Plant on the slopes, not under them. Clearings interrupt the woods so
  // the hill shapes and the winding paths still read from the central meadow.
  const pineColors = ['#435d43', '#5c714a', '#748257'].map(c => mat(c))
  const hillShrubs = [mat('#6e7e49'), mat('#899254'), mat('#586c41')]
  const hillBark = mat('#65513a'), hillTrail = mat('#ac9670')
  const hillsideRoot = new THREE.Group(); hillsideRoot.name = 'hillside-landmarks'; scene.add(hillsideRoot)
  for (let i = 0; i < 480; i++) {
    const angle = random() * Math.PI * 2, r = 35 + random() * 46
    const x = Math.cos(angle) * r, z = Math.sin(angle) * r, y = terrainHeight(x, z)
    if (y < .75 || Math.sin(x * .16 + z * .09) + Math.cos(z * .19) < -.8) continue
    if (Math.abs(x + 26) < 8 && Math.abs(z + 57) < 9) continue
    const h = 2.8 + random() * 3.7, width = .8 + h * .16
    stamp(cylinder, hillBark, [x, y + h * .35, z], [.09, h * .7, .09])
    for (let tier = 0; tier < 3; tier++) stamp(cone, pineColors[i % 3], [x, y + h * (.4 + tier * .21), z], [width * (1 - tier * .23), h * .64, width * (1 - tier * .23)])
  }
  for (let i = 0; i < 620; i++) {
    const a = random() * Math.PI * 2, r = 33 + random() * 42, x = Math.cos(a) * r, z = Math.sin(a) * r, y = terrainHeight(x, z)
    if (y < .4) continue
    const size = .35 + random() * .8
    if (i % 4 === 0) stamp(rock, i % 8 ? stoneDark : stone, [x, y + size * .28, z], [size * 1.2, size * .65, size], [0, random() * 6, .1])
    else {
      stamp(rock, hillShrubs[i % 3], [x, y + size * .4, z], [size, size * .7, size * .85])
      stamp(sphere, hillShrubs[(i + 1) % 3], [x + size * .4, y + size * .22, z], [size * .65, size * .4, size * .55])
    }
  }
  // Ribbons follow the top of the ellipsoids rather than cutting through slopes.
  const trails = [
    [[-16, -25], [-17, -34], [-26, -43], [-26, -54]],
    [[-18, -35], [-36, -32], [-44, -40], [-50, -51]],
    [[18, -29], [26, -35], [32, -48], [43, -56]],
  ]
  for (const points of trails) {
    const curve = new THREE.CatmullRomCurve3(points.map(([x, z]) => new THREE.Vector3(x, 0, z)))
    const positions = [], indices = [], segments = 100
    for (let i = 0; i <= segments; i++) {
      const p = curve.getPoint(i / segments), t = curve.getTangent(i / segments), width = .6 + Math.sin(i * .11) * .1
      for (const sign of [-1, 1]) { const x = p.x + t.z * width * sign, z = p.z - t.x * width * sign; positions.push(x, terrainHeight(x, z) + .08, z) }
      if (i < segments) { const n = i * 2; indices.push(n, n + 2, n + 1, n + 1, n + 2, n + 3) }
    }
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3)); geo.setIndex(indices); geo.computeVertexNormals()
    const trail = new THREE.Mesh(geo, hillTrail); trail.receiveShadow = true; trail.name = 'hillside-path'; hillsideRoot.add(trail)
  }
  // Pitched-roof cottages and a distant keep, beyond the walking clearing.
  function cottage(id, x, z, s, rotation = 0) {
    const group = new THREE.Group()
    const base = Math.max(...[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([dx, dz]) => terrainHeight(x + dx * s, z + dz * s)))
    group.position.set(x, base, z); group.rotation.y = rotation; group.scale.setScalar(s)
    part(group, cube, stoneDark, [0, -.13, 0], [2.22, .3, 1.82])
    obstacles.push({ x, z, radius: s * 1.35 })
    part(group, cube, plaster, [0, .9, 0], [2.1, 1.8, 1.7])
    const roofShape = new THREE.Shape(); roofShape.moveTo(-1.25, 0); roofShape.lineTo(0, 1.25); roofShape.lineTo(1.25, 0); roofShape.closePath()
    const roofGeo = new THREE.ExtrudeGeometry(roofShape, { depth: 2.05, bevelEnabled: false }); roofGeo.translate(0, 1.75, -1.025)
    part(group, roofGeo, roof, [0, 0, 0])
    for (const side of [-1, 1]) {
      part(group, cube, wood, [side, .92, .88], [.12, 1.85, .12]); part(group, cube, wood, [side * .5, 1.5, .88], [.1, 1.3, .1], [0, 0, side * .65])
    }
    part(group, cube, wood, [0, .8, .89], [2.15, .12, .12]); part(group, cube, wood, [0, .37, .92], [.37, .74, .08])
    for (const x of [-.65, .65]) for (const y of [.47, 1.32]) {
      part(group, cube, iron, [x, y, .92], [.3, .37, .04]); part(group, cube, wood, [x, y, .95], [.035, .39, .04]); part(group, cube, wood, [x, y, .95], [.32, .035, .04])
      for (const side of [-1, 1]) part(group, cube, roof, [x + side * .23, y, .92], [.12, .4, .05], [0, side * .25, 0])
      part(group, cube, wood, [x, y - .22, .98], [.46, .05, .17])
    }
    // Two floors and visible side framing make the larger scale legible.
    for (const x of [-1.07, 1.07]) {
      part(group, cube, wood, [x, .85, 0], [.07, .1, 1.8])
      for (const z of [-.7, 0, .7]) part(group, cube, wood, [x, .9, z], [.07, 1.8, .08])
      for (const y of [.48, 1.32]) part(group, cube, iron, [x * 1.01, y, 0], [.035, .37, .3])
    }
    part(group, cube, stone, [.6, 2.7, -.3], [.3, 1.15, .38])
    // Keep the visible village instanced, with one cheap pickable volume per house.
    const doorway = target(id, [x, base, z], id)
    doorway.rotation.y = rotation; doorway.scale.setScalar(s)
    doorway.userData.anchor = new THREE.Vector3(0, .95, 1.05)
    doorway.userData.activate = () => {}
    const pick = new THREE.Mesh(cube, new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false, colorWrite: false }))
    pick.position.y = 1.45; pick.scale.set(2.5, 3.1, 2.1); doorway.add(pick)
    group.updateMatrixWorld(true)
    group.traverse(object => { if (object.isMesh) { const key = object.geometry.uuid + object.material.uuid; if (!buckets.has(key)) buckets.set(key, { geometry: object.geometry, material: object.material, matrices: [] }); buckets.get(key).matrices.push(object.matrixWorld.clone()) } })
  }
  cottage('planner', -15, -19, 4.6, .2); cottage('notes', -3, -32, 3.9, -.25)
  cottage('library', -29, -25, 4.1, .4); cottage('workshop', 23, -25, 3.8, -.5)
  const keepBase = terrainHeight(-26, -57)
  for (const x of [-31, -21]) {
    stamp(cylinder, stone, [x, keepBase + 7, -57], [2.6, 14, 2.6])
    stamp(cone, roof, [x, keepBase + 16.6, -57], [3.2, 5.8, 3.2])
    for (let j = 0; j < 8; j++) { const a = j / 8 * Math.PI * 2; stamp(cube, stone, [x + Math.cos(a) * 2.35, keepBase + 14, -57 + Math.sin(a) * 2.35], [.7, 1.1, .7]) }
    for (const y of [5, 9.5]) stamp(cube, iron, [x, keepBase + y, -54.38], [.45, 1.6, .05])
  }
  stamp(cube, stoneDark, [-26, keepBase + 4.5, -57], [9, 9, 2])
  // A four-sailed mill. Touching it starts/stops the sails.
  const mill = target('mill', [14, terrainHeight(14, -28), -28], 'Жел диірменін айналдыру'); mill.scale.setScalar(1.85)
  part(mill, new THREE.CylinderGeometry(.9, 1.35, 4, 12), plaster, [0, 2, 0])
  part(mill, cone, roof, [0, 4.7, 0], [1.5, 1.9, 1.5])
  part(mill, cube, wood, [0, .7, 1.2], [.65, 1.4, .1])
  const sails = new THREE.Group(); sails.position.set(0, 3.3, 1.15); mill.add(sails)
  for (let i = 0; i < 4; i++) {
    const blade = new THREE.Group(); blade.rotation.z = i * Math.PI / 2; sails.add(blade)
    part(blade, cube, wood, [0, 1.4, 0], [.1, 2.8, .1]); part(blade, cube, mat('#d3c49d'), [.3, 1.75, -.04], [.65, 1.8, .035])
    for (let j = 0; j < 6; j++) part(blade, cube, wood, [.3, .95 + j * .3, .01], [.7, .035, .05])
  }
  part(sails, sphere, wood, [0, 0, .1], [.19, .19, .15])
  mill.userData.anchor = new THREE.Vector3(0, 3.3, 1.2); mill.userData.running = true
  mill.userData.activate = () => { mill.userData.running = !mill.userData.running }
  animations.push((dt, t, paused) => { if (!paused && mill.userData.running) sails.rotation.z += dt * (.25 + (mill.userData.windBoost || 0) * .45) })
  // Weathered stone arch and broken drystone walls at the edge of the meadow.
  for (const x of [-12.2, -9.2]) for (let j = 0; j < 7; j++) stamp(cube, j % 3 ? stone : stoneDark, [x + (random() - .5) * .05, .3 + j * .56, -4], [.9, .51, .8], [0, (random() - .5) * .08, 0])
  for (let j = 0; j <= 8; j++) { const a = j / 8 * Math.PI; stamp(cube, stone, [-10.7 + Math.cos(a) * 1.5, 3.7 + Math.sin(a) * 1.5, -4], [.62, .7, .85], [0, 0, a - Math.PI / 2]) }
  for (let j = 0; j < 15; j++) { const x = -14 - j * .65; stamp(rock, j % 4 ? stone : moss, [x, .3 + random() * .25, -4.2], [.5, .5, .55]) }
  obstacles.push({ x: -10.7, z: -4, radius: 2.1 })
  // Old fence stakes, not a solid green horizon.
  for (let i = 0; i < 17; i++) {
    const x = 9 + i * 1.1, z = -13 + Math.sin(i * .25) * .9
    stamp(cube, wood, [x, .65, z], [.13, 1.3, .13], [0, 0, (random() - .5) * .16])
    if (i < 16 && i !== 7 && i !== 8) for (const y of [.45, .95]) stamp(cube, wood, [x + .55, y, z], [1.15, .09, .1], [0, 0, .03])
  }
  // A roofed well with a real winch and a bucket that lowers when touched.
  const well = target('well', [-7.5, 0, -9], 'Құдықтың шелегін түсіру'); well.userData.anchor = new THREE.Vector3(0, 1.7, 0)
  for (let row = 0; row < 3; row++) for (let j = 0; j < 12; j++) { const a = j / 12 * Math.PI * 2 + row * .15; part(well, cube, j % 3 ? stone : stoneDark, [Math.cos(a) * .9, .25 + row * .36, Math.sin(a) * .9], [.45, .33, .42], [0, -a, 0]) }
  part(well, cylinder, mat('#243d32'), [0, .2, 0], [.75, .02, .75])
  for (const x of [-1.1, 1.1]) part(well, cube, wood, [x, 1.6, 0], [.16, 3.2, .16])
  for (const side of [-1, 1]) part(well, cube, roof, [0, 3.25, side * .48], [2.9, .12, 1.2], [side * .45, 0, 0])
  const winch = part(well, cylinder, wood, [0, 2.1, 0], [.12, 2.6, .12], [0, 0, Math.PI / 2])
  const bucket = part(well, new THREE.CylinderGeometry(.24, .18, .34, 10, 1, true), wood, [0, 1.4, 0])
  part(bucket, ring, iron, [0, .15, 0], [.95, .95, .95], [Math.PI / 2, 0, 0]).scale.set(.24, .24, .24)
  const rope = part(well, cylinder, mat('#a38a59'), [0, 1.8, 0], [.018, .6, .018])
  well.userData.lowered = false; well.userData.activate = () => { well.userData.lowered = !well.userData.lowered }
  animations.push((dt, t, paused) => { const to = well.userData.lowered ? .45 : 1.4; const before = bucket.position.y; bucket.position.y = THREE.MathUtils.lerp(before, to, paused ? 1 : 1 - Math.exp(-dt * 3)); rope.position.y = (2.1 + bucket.position.y + .17) / 2; rope.scale.y = 2.1 - bucket.position.y - .17; winch.rotation.x += (bucket.position.y - before) * 3 })
  obstacles.push({ x: -7.5, z: -9, radius: 1.4 })
  // A shallow pond, stepping stones, reeds and ripples on touch.
  const pond = target('pond', [11, 0, -1.5], 'Суға толқын жіберу'); pond.userData.anchor = new THREE.Vector3(0, .1, 0)
  part(pond, new THREE.CircleGeometry(1, 48), mat('#548888', { roughness: .24, metalness: .24 }), [0, .045, 0], [3.3, 2, 1], [-Math.PI / 2, 0, 0])
  for (let j = 0; j < 25; j++) { const a = j / 25 * 6.28; stamp(rock, j % 4 ? stone : moss, [11 + Math.cos(a) * 3.35, .15, -1.5 + Math.sin(a) * 2.1], [.35 + random() * .2, .22, .35]) }
  const rippleMat = new THREE.MeshBasicMaterial({ color: '#dce2bb', transparent: true, opacity: 0, depthWrite: false })
  const ripples = [0, 1, 2].map(() => part(pond, new THREE.RingGeometry(.97, 1, 48), rippleMat.clone(), [0, .07, 0], [.1, .1, 1], [-Math.PI / 2, 0, 0]))
  pond.userData.ripple = 10; pond.userData.activate = () => { pond.userData.ripple = 0 }
  animations.push((dt, t, paused) => { pond.userData.ripple += dt; ripples.forEach((r, i) => { const age = pond.userData.ripple - i * .3; const visible = age > 0 && age < 2.2; r.visible = visible; if (visible) { const s = paused ? 1 + i * .4 : .2 + age; r.scale.set(s, s * .7, 1); r.material.opacity = (1 - age / 2.2) * .55 } }) })
  for (let j = 0; j < 32; j++) { const x = 12.4 + random() * 2, z = -3.5 + random() * 2, h = 1 + random() * .7; stamp(cylinder, stem, [x, h / 2, z], [.018, h, .018]); stamp(cylinder, reedBrown, [x, h, z], [.055, .28, .055]) }
  // A roadside cart with spoked wheels, a barrel and rolled canvas.
  const cart = new THREE.Group(); cart.position.set(-7, .7, 6); cart.rotation.y = -.5; scene.add(cart)
  part(cart, cube, wood, [0, 0, 0], [1.5, .12, 2.1])
  for (const x of [-.73, .73]) for (let j = 0; j < 3; j++) part(cart, cube, wood, [x, .18 + j * .2, 0], [.1, .15, 2.1])
  for (const x of [-.48, .48]) part(cart, cube, wood, [x, -.1, 1.9], [.09, .1, 2.8])
  for (const x of [-.9, .9]) for (const z of [-.65, .65]) {
    part(cart, ring, wood, [x, -.18, z], [.53, .53, .53], [0, Math.PI / 2, 0])
    for (let j = 0; j < 6; j++) part(cart, cube, wood, [x, -.18, z], [.04, 1.02, .04], [j * Math.PI / 6, 0, 0])
  }
  part(cart, new THREE.CylinderGeometry(.34, .34, .8, 12), wood, [0, .48, -.4]); for (const y of [.2, .76]) part(cart, ring, iron, [0, y, -.4], [.35, .35, .35], [Math.PI / 2, 0, 0])
  part(cart, cylinder, mat('#b6aa81'), [0, .3, .45], [.24, 1.2, .24], [0, 0, Math.PI / 2])
  obstacles.push({ x: -7, z: 6, radius: 1.3 })
  // A lantern hung from a crooked post. The glass and light both respond.
  const lantern = target('lantern', [4.5, 0, 3.6], 'Шамды жағу немесе өшіру'); lantern.userData.anchor = new THREE.Vector3(0, 2.2, 0)
  part(lantern, cylinder, wood, [0, 1.3, 0], [.075, 2.6, .075]); part(lantern, cube, wood, [-.3, 2.5, 0], [.7, .07, .07])
  const glassMat = mat('#ffb854', { emissive: '#ff9f32', emissiveIntensity: .65, roughness: .35 })
  part(lantern, cube, glassMat, [-.55, 2, 0], [.27, .42, .25]); part(lantern, cone, iron, [-.55, 2.31, 0], [.27, .24, .27]); part(lantern, cube, iron, [-.55, 1.76, 0], [.37, .06, .34])
  for (const x of [-.71, -.39]) for (const z of [-.15, .15]) part(lantern, cylinder, iron, [x, 2, z], [.017, .48, .017])
  part(lantern, ring, iron, [-.55, 2.48, 0], [.09, .09, .09])
  const lanternLight = new THREE.PointLight('#ffb557', 3, 5); lanternLight.position.set(-.55, 2, 0); lantern.add(lanternLight)
  lantern.userData.lit = true; lantern.userData.activate = () => { lantern.userData.lit = !lantern.userData.lit; glassMat.emissiveIntensity = lantern.userData.lit ? .8 : 0; glassMat.color.set(lantern.userData.lit ? '#ffb854' : '#6f705a'); lanternLight.intensity = lantern.userData.lit ? 3 : 0 }
  // A fairy ring of fly agaric: touching it releases little luminous spores.
  const mushrooms = target('mushrooms', [-4.5, 0, 3], 'Саңырауқұлақтардың жарқырауын ояту'); mushrooms.userData.anchor = new THREE.Vector3(0, .8, 0)
  const capMat = mat('#a54d38'), stalkMat = mat('#ddcc9c'), spotMat = mat('#e9dcc0')
  for (let i = 0; i < 8; i++) {
    const a = i / 8 * 6.28, x = Math.cos(a) * .65, z = Math.sin(a) * .65, h = .28 + random() * .34
    part(mushrooms, cylinder, stalkMat, [x, h / 2, z], [.055, h, .055], [0, 0, .1]); part(mushrooms, sphere, capMat, [x, h, z], [.25, .12, .25])
    for (let k = 0; k < 5; k++) part(mushrooms, sphere, spotMat, [x + Math.cos(k * 2) * .14, h + .09, z + Math.sin(k * 2) * .14], [.03, .013, .03])
  }
  const sporeGeometry = new THREE.BufferGeometry(), sporePositions = new Float32Array(28 * 3)
  for (let i = 0; i < 28; i++) { sporePositions[i * 3] = (random() - .5) * 1.8; sporePositions[i * 3 + 1] = random() * 1.8; sporePositions[i * 3 + 2] = (random() - .5) * 1.8 }
  sporeGeometry.setAttribute('position', new THREE.BufferAttribute(sporePositions, 3))
  const spores = new THREE.Points(sporeGeometry, new THREE.PointsMaterial({ color: '#ffe2a1', size: .085, transparent: true, opacity: 0, depthWrite: false })); mushrooms.add(spores)
  mushrooms.userData.burst = 5; mushrooms.userData.activate = () => { mushrooms.userData.burst = 0 }
  animations.push((dt, t, paused) => { mushrooms.userData.burst += dt; const age = mushrooms.userData.burst; spores.material.opacity = Math.max(0, 1 - age / 3); spores.position.y = paused ? .4 : age * .45; spores.rotation.y = paused ? 0 : age * .5 })
  // Commit the static scenery in batches, without per-flower draw calls.
  for (const { geometry, material, matrices } of buckets.values()) { const instances = new THREE.InstancedMesh(geometry, material, matrices.length); matrices.forEach((matrix, i) => instances.setMatrixAt(i, matrix)); instances.receiveShadow = true; instances.castShadow = geometry !== petal && geometry !== cuppedPetal; scene.add(instances) }
  rippleMat.dispose()
  return { targets, obstacles, update(dt, elapsed, paused) { animations.forEach(update => update(dt, elapsed, paused)) }, activate(id) { targets.find(t => t.userData.action === id)?.userData.activate() } }
}

export function addChestDetails({ chest, lid, wood, gold, mat }) {
  const iron = mat('#3e382d', { metalness: .65, roughness: .63 }), ivory = mat('#d6c196'), wax = mat('#8b4031')
  const cube = new THREE.BoxGeometry(1, 1, 1), sphere = new THREE.SphereGeometry(1, 12, 8), cylinder = new THREE.CylinderGeometry(1, 1, 1, 16)
  const items = [], updates = []
  const part = (parent, geometry, material, pos, scale = [1, 1, 1], rotation = [0, 0, 0]) => { const m = new THREE.Mesh(geometry, material); m.position.set(...pos); m.scale.set(...scale); m.rotation.set(...rotation); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m }
  const tube = (parent, points, material, radius = .012) => part(parent, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p))), 24, radius, 6, false), material, [0, 0, 0])
  // Hand-forged edge plates, rosettes, rings and lid hinges.
  for (const x of [-1.49, 1.49]) {
    for (let j = 0; j < 7; j++) part(chest, sphere, gold, [x, .42 + j * .17, .912], [.023, .023, .014])
    for (let j = 0; j < 7; j++) part(lid, sphere, gold, [x, .19, .02 + j * .26], [.026, .014, .026])
  }
  for (const x of [-1.6, 1.6]) {
    part(chest, cube, iron, [x, 1.03, 0], [.04, .18, .38])
    part(chest, new THREE.TorusGeometry(.19, .027, 8, 24), iron, [x * 1.02, .86, 0], [1, 1, 1], [0, Math.PI / 2, 0])
    for (const z of [-.66, .66]) { part(chest, cube, iron, [x, .49, z], [.035, .23, .25]); part(chest, sphere, gold, [x * 1.015, .51, z], [.018, .034, .034]) }
  }
  for (const x of [-1, 1]) {
    part(chest, cube, iron, [x, 1.43, -.89], [.23, .25, .04]); part(lid, cylinder, iron, [x, -.02, -.01], [.065, .32, .065], [0, 0, Math.PI / 2])
    part(lid, cube, iron, [x, -.12, .18], [.2, .03, .38])
  }
  for (const x of [-1.28, 1.28]) for (const z of [.2, 1.45]) {
    part(lid, new THREE.TorusGeometry(.11, .013, 6, 20), gold, [x, .184, z], [1, 1, 1], [Math.PI / 2, 0, 0])
    part(lid, sphere, gold, [x, .19, z], [.035, .015, .035])
  }
  // Engraved corner curls, rather than a flat rectangular outline alone.
  for (const side of [-1, 1]) tube(chest, [[side * 1.36, 1.33, .899], [side * 1.15, 1.33, .899], [side * 1.12, 1.19, .899], [side * 1.24, 1.17, .899], [side * 1.24, 1.25, .899]], gold)
  // Stowed parchment rolls tied with cord, inkpot, feather and scattered coins.
  for (let i = 0; i < 2; i++) {
    part(chest, cylinder, ivory, [-1.05, .5 + i * .07, -.52 + i * .04], [.07, .56, .07], [0, 0, Math.PI / 2])
    part(chest, new THREE.TorusGeometry(.071, .011, 6, 16), wax, [-1.03, .5 + i * .07, -.52 + i * .04], [1, 1, 1], [0, Math.PI / 2, 0])
  }
  part(chest, new THREE.CylinderGeometry(.065, .095, .12, 12), mat('#282d26', { roughness: .3 }), [1.22, .49, .61])
  const featherShape = new THREE.Shape(); featherShape.moveTo(0, 0); featherShape.bezierCurveTo(-.13, .2, -.11, .45, .04, .58); featherShape.bezierCurveTo(.19, .43, .15, .18, 0, 0)
  part(chest, new THREE.ShapeGeometry(featherShape), mat('#dfd3b0', { side: THREE.DoubleSide }), [1.21, .54, .61], [.65, .65, .65], [-.35, .2, -.4])
  for (let i = 0; i < 9; i++) part(chest, cylinder, gold, [.68 + Math.sin(i * 2) * .19, .43 + Math.floor(i / 3) * .014, .57 + Math.cos(i * 2) * .1], [.065, .012, .065])
  function item(id, pos, label) { const group = new THREE.Group(); group.userData.action = id; group.userData.label = label; group.position.set(...pos); chest.add(group); items.push(group); return group }
  const compass = item('compass', [-.35, .46, -.53], 'Компасты айналдыру')
  part(compass, cylinder, gold, [0, 0, 0], [.185, .045, .185])
  part(compass, cylinder, ivory, [0, .025, 0], [.16, .009, .16])
  part(compass, new THREE.TorusGeometry(.17, .016, 8, 32), gold, [0, .03, 0], [1, 1, 1], [Math.PI / 2, 0, 0])
  for (let i = 0; i < 16; i++) { const a = i / 16 * 6.28; part(compass, cube, iron, [Math.sin(a) * .135, .035, Math.cos(a) * .135], [.005, .005, i % 4 ? .015 : .03], [0, a, 0]) }
  const needle = new THREE.Group(); compass.add(needle)
  const arrow = new THREE.Shape(); arrow.moveTo(0, .13); arrow.lineTo(.025, -.03); arrow.lineTo(-.025, -.03); arrow.closePath()
  part(needle, new THREE.ShapeGeometry(arrow), wax, [0, .044, 0], [1, 1, 1], [-Math.PI / 2, 0, 0])
  part(needle, new THREE.ShapeGeometry(arrow), iron, [0, .044, 0], [1, 1, 1], [-Math.PI / 2, 0, Math.PI])
  part(compass, sphere, gold, [0, .051, 0], [.02, .012, .02])
  compass.userData.spin = 0; compass.userData.activate = () => { compass.userData.spin += Math.PI * 4 }
  updates.push((dt, paused) => { needle.rotation.y = THREE.MathUtils.lerp(needle.rotation.y, compass.userData.spin, paused ? 1 : 1 - Math.exp(-dt * 3)) })
  const key = item('key', [.25, .46, -.54], 'Ескі кілтті қозғау')
  part(key, new THREE.TorusGeometry(.073, .018, 8, 20), gold, [-.12, 0, 0], [1, 1, 1], [-Math.PI / 2, 0, 0])
  part(key, cube, gold, [.035, 0, 0], [.23, .025, .025]); for (const x of [.1, .15]) part(key, cube, gold, [x, 0, .036], [.026, .025, .075])
  key.rotation.y = -.35; key.userData.wiggle = 4; key.userData.activate = () => { key.userData.wiggle = 0 }
  updates.push((dt, paused) => { key.userData.wiggle += dt; const t = key.userData.wiggle; key.rotation.y = -.35 + (paused ? 0 : Math.sin(t * 16) * Math.max(0, 1 - t) * .25) })
  const potion = item('potion', [1.02, .42, -.5], 'Құтыны жарқырату')
  const glass = mat('#537b69', { roughness: .18, metalness: .25, transparent: true, opacity: .75, emissive: '#83af71', emissiveIntensity: .03 })
  part(potion, new THREE.LatheGeometry([new THREE.Vector2(.08, 0), new THREE.Vector2(.14, .04), new THREE.Vector2(.14, .23), new THREE.Vector2(.07, .3), new THREE.Vector2(.055, .4)], 20), glass, [0, 0, 0])
  part(potion, cylinder, wood, [0, .405, 0], [.056, .07, .056]); part(potion, new THREE.TorusGeometry(.063, .012, 6, 16), gold, [0, .33, 0], [1, 1, 1], [Math.PI / 2, 0, 0])
  part(potion, cube, ivory, [0, .18, .143], [.12, .14, .003]); part(potion, sphere, wax, [0, .18, .151], [.025, .025, .006])
  const bubbles = []
  for (let i = 0; i < 5; i++) bubbles.push(part(potion, sphere, mat('#d2dba3', { emissive: '#b6d695', emissiveIntensity: .3, transparent: true, opacity: .55 }), [Math.sin(i) * .06, .08 + i * .025, Math.cos(i) * .06], [.018, .018, .018]))
  potion.userData.glowing = false; potion.userData.activate = () => { potion.userData.glowing = !potion.userData.glowing; glass.emissiveIntensity = potion.userData.glowing ? .65 : .03 }
  updates.push((dt, paused, time) => { if (potion.userData.glowing && !paused) bubbles.forEach((b, i) => { b.position.y = .04 + ((time * .08 + i * .04) % .24) }) })
  return { items, update(dt, paused, time) { updates.forEach(update => update(dt, paused, time)) }, activate(id) { items.find(i => i.userData.action === id)?.userData.activate() } }
}
