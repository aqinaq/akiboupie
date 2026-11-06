import * as THREE from 'three'

export function addChestDetails({ chest, lid, wood, gold, mat }) {
  const iron = mat('#b389a8', { metalness: .28, roughness: .72 }), ivory = mat('#f5deef'), wax = mat('#c873a9')
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
  // Faceted amethyst rosettes echo the village's elemental crystals.
  const amethyst = mat('#c18ee6', { metalness: .2, roughness: .28, emissive: '#aa67cc', emissiveIntensity: .18 })
  for (const x of [-.85, .85]) {
    part(chest, new THREE.OctahedronGeometry(.11), amethyst, [x, .95, .92], [1, 1.3, .45])
    part(chest, new THREE.TorusGeometry(.15, .012, 6, 24), gold, [x, .95, .91])
  }
  // Stowed parchment rolls tied with cord, inkpot, feather and scattered coins.
  for (let i = 0; i < 2; i++) {
    part(chest, cylinder, ivory, [-1.05, .5 + i * .07, -.52 + i * .04], [.07, .56, .07], [0, 0, Math.PI / 2])
    part(chest, new THREE.TorusGeometry(.071, .011, 6, 16), wax, [-1.03, .5 + i * .07, -.52 + i * .04], [1, 1, 1], [0, Math.PI / 2, 0])
  }
  part(chest, new THREE.CylinderGeometry(.065, .095, .12, 12), mat('#382444', { roughness: .3 }), [1.22, .49, .61])
  const featherShape = new THREE.Shape(); featherShape.moveTo(0, 0); featherShape.bezierCurveTo(-.13, .2, -.11, .45, .04, .58); featherShape.bezierCurveTo(.19, .43, .15, .18, 0, 0)
  part(chest, new THREE.ShapeGeometry(featherShape), mat('#e4bced', { side: THREE.DoubleSide }), [1.21, .54, .61], [.65, .65, .65], [-.35, .2, -.4])
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
  const glass = mat('#ae79cc', { roughness: .18, metalness: .25, transparent: true, opacity: .75, emissive: '#da8fdb', emissiveIntensity: .03 })
  part(potion, new THREE.LatheGeometry([new THREE.Vector2(.08, 0), new THREE.Vector2(.14, .04), new THREE.Vector2(.14, .23), new THREE.Vector2(.07, .3), new THREE.Vector2(.055, .4)], 20), glass, [0, 0, 0])
  part(potion, cylinder, wood, [0, .405, 0], [.056, .07, .056]); part(potion, new THREE.TorusGeometry(.063, .012, 6, 16), gold, [0, .33, 0], [1, 1, 1], [Math.PI / 2, 0, 0])
  part(potion, cube, ivory, [0, .18, .143], [.12, .14, .003]); part(potion, sphere, wax, [0, .18, .151], [.025, .025, .006])
  const bubbles = []
  for (let i = 0; i < 5; i++) bubbles.push(part(potion, sphere, mat('#f6c8ed', { emissive: '#e3a3f5', emissiveIntensity: .3, transparent: true, opacity: .55 }), [Math.sin(i) * .06, .08 + i * .025, Math.cos(i) * .06], [.018, .018, .018]))
  potion.userData.glowing = false; potion.userData.activate = () => { potion.userData.glowing = !potion.userData.glowing; glass.emissiveIntensity = potion.userData.glowing ? .65 : .03 }
  updates.push((dt, paused, time) => { if (potion.userData.glowing && !paused) bubbles.forEach((b, i) => { b.position.y = .04 + ((time * .08 + i * .04) % .24) }) })
  return { items, update(dt, paused, time) { updates.forEach(update => update(dt, paused, time)) }, activate(id) { items.find(i => i.userData.action === id)?.userData.activate() } }
}
