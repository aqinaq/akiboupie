import * as THREE from 'three'
import { buildMeadowDetails, addChestDetails } from './meadowDetails.js'
import { buildLivingGarden, gardenPlaces } from './MeadowGarden.js'

// Everything in the meadow is built locally; no model or texture downloads.
export function createMeadow(host, { onReady, onError, onChest, onItem, onHotspots, onWorldAction, onGardenState }) {
  let renderer
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' }) }
  catch { onError(); return { dispose() {}, setOpen() {}, setPaused() {}, setBlocked() {}, move() {}, reset() {} } }
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#c7d7cf')
  scene.fog = new THREE.Fog('#d1d5b8', 43, 105)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.05
  host.appendChild(renderer.domElement)
  renderer.domElement.setAttribute('aria-label', 'A 3D flower meadow with an ornamental Kazakh chest. Use arrow keys to walk, drag to look, two-finger drag to walk on touchscreens, and Enter to open or close the chest.')
  renderer.domElement.setAttribute('role', 'img')
  renderer.domElement.tabIndex = 0
  const camera = new THREE.PerspectiveCamera(48, 1, .1, 120)
  // Use the same eye height on arrival and while walking; face the chest head-on.
  const eyeHeight = 5.8, startPitch = -.16
  const start = new THREE.Vector3(0, eyeHeight, 16)
  camera.position.copy(start)
  let yaw = 0, pitch = startPitch
  camera.lookAt(start.x - Math.sin(yaw) * 10, start.y + Math.tan(pitch) * 10, start.z - Math.cos(yaw) * 10)
  let inspectionBlend = 0
  const returnPosition = start.clone(), returnRotation = camera.quaternion.clone()
  const inspectionPosition = new THREE.Vector3(), inspectionRotation = new THREE.Quaternion()
  const inspectionTarget = new THREE.Vector3(0, 1.8, -.3)
  const inspectionDirection = new THREE.Vector3(.08, .91, .41).normalize()
  const inspectionMatrix = new THREE.Matrix4(), projectedItem = new THREE.Vector3()
  let viewportWidth = 1, viewportHeight = 1
  const touchPoints = new Map()
  let touchOrigin = null, touchWalking = false, touchForward = 0, touchRight = 0
  const keys = new Set(), pointer = new THREE.Vector2(), raycaster = new THREE.Raycaster()
  let opened = false, blocked = false, paused = matchMedia('(prefers-reduced-motion: reduce)').matches, disposed = false
  let renderDirty = true
  let previous = 0, elapsed = 0, frame = 0, dragging = null, didDrag = false
  let seed = 73621
  const random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646 }
  const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: .84, ...extra })
  const objectScale = 1.35
  const chestScale = 1.5
  const grassColors = ['#637744', '#869455', '#a1aa69', '#4d653c', '#b0ae77']
  // Pigment, grain and tiny surface imperfections are baked once, locally.
  const textures = []
  const texture = (width, height, paint) => {
    const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height
    paint(canvas.getContext('2d'), width, height)
    const map = new THREE.CanvasTexture(canvas); map.colorSpace = THREE.SRGBColorSpace
    map.anisotropy = 4; textures.push(map); return map
  }
  const grain = texture(1024, 512, (c, w, h) => {
    c.fillStyle = '#754725'; c.fillRect(0, 0, w, h)
    for (let y = 0; y < h; y++) {
      c.strokeStyle = `rgba(${y % 3 ? '34,15,8' : '222,166,91'},${.06 + random() * .2})`; c.lineWidth = .5 + random() * 2
      c.beginPath()
      for (let x = 0; x <= w; x += 8) {
        const bend = Math.sin(x * .007 + y * .032) * 4 + Math.sin(x * .023 + y * .05) * 1.6
        if (x === 0) c.moveTo(x, y + bend); else c.lineTo(x, y + bend)
      }
      c.stroke()
    }
    for (let i = 0; i < 4; i++) { c.fillStyle = '#28180e5c'; c.fillRect(0, i * 128, w, 2); c.fillStyle = '#e8b87c35'; c.fillRect(0, i * 128 + 2, w, 1) }
    for (const [x, y] of [[230, 200], [760, 410]]) for (let r = 2; r < 22; r += 3) {
      c.strokeStyle = '#29170e36'; c.lineWidth = 1; c.beginPath(); c.ellipse(x, y, r * 3, r * .48, .03, 0, Math.PI * 2); c.stroke()
    }
  })
  const leather = texture(512, 512, (c, w, h) => {
    c.fillStyle = '#503022'; c.fillRect(0, 0, w, h)
    for (let i = 0; i < 25000; i++) { c.fillStyle = i % 2 ? '#190d0b24' : '#dca26a20'; c.fillRect(random() * w, random() * h, 1 + random() * 2, 1) }
    c.strokeStyle = '#ba8b514b'; c.lineWidth = 8; c.strokeRect(8, 8, w - 16, h - 16)
  })
  const parchment = texture(512, 768, (c, w, h) => {
    c.fillStyle = '#e6cfa0'; c.fillRect(0, 0, w, h)
    for (let i = 0; i < 14000; i++) { c.fillStyle = i % 3 ? '#7251230e' : '#fff8d532'; c.fillRect(random() * w, random() * h, random() * 5, 1) }
    for (let i = 0; i < 18; i++) { c.strokeStyle = `rgba(102,66,24,${.025 + i * .001})`; c.lineWidth = 2; c.strokeRect(i, i, w - i * 2, h - i * 2) }
    for (const y of [h / 3, h * 2 / 3]) { c.fillStyle = '#68491b24'; c.fillRect(0, y, w, 2); c.fillStyle = '#fff4cf60'; c.fillRect(0, y + 2, w, 3) }
  })
  const wood = mat('#b9a08a', { map: grain, bumpMap: grain, bumpScale: .026, roughness: .72 })
  const timber = mat('#ffffff', { map: grain, bumpMap: grain, bumpScale: .035, roughness: .68 })
  const gold = mat('#a98243', { metalness: .68, roughness: .49, bumpMap: leather, bumpScale: .008 })
  const mesh = (geometry, material, parent = scene, pos = [0, 0, 0], scale = [1, 1, 1]) => {
    const object = new THREE.Mesh(geometry, material)
    object.position.set(...pos); object.scale.set(...scale)
    object.castShadow = true; object.receiveShadow = true; parent.add(object)
    return object
  }
  const box = (parent, material, size, pos) => mesh(new THREE.BoxGeometry(...size), material, parent, pos)
  const bevel = (parent, material, [w, h, d], pos, radius = .02) => {
    const shape = new THREE.Shape()
    shape.moveTo(-w / 2 + radius, -h / 2); shape.lineTo(w / 2 - radius, -h / 2)
    shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + radius); shape.lineTo(w / 2, h / 2 - radius)
    shape.quadraticCurveTo(w / 2, h / 2, w / 2 - radius, h / 2); shape.lineTo(-w / 2 + radius, h / 2)
    shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - radius); shape.lineTo(-w / 2, -h / 2 + radius)
    shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + radius, -h / 2)
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: true, bevelSize: radius / 3, bevelThickness: radius / 3, bevelSegments: 3, steps: 1, curveSegments: 4 })
    geometry.translate(0, 0, -d / 2)
    // ExtrudeGeometry's world-space UVs otherwise sample only a sliver of the leather.
    const uv = geometry.attributes.uv, p = geometry.attributes.position
    for (let i = 0; i < uv.count; i++) uv.setXY(i, p.getX(i) / w + .5, p.getY(i) / h + .5)
    return mesh(geometry, material, parent, pos)
  }
  scene.add(new THREE.HemisphereLight('#fff0d3', '#536044', 1.65))
  const sun = new THREE.DirectionalLight('#ffe0a4', 2.65)
  sun.position.set(-10, 18, 12); sun.castShadow = true
  const shadowSize = window.innerWidth < 700 ? 1024 : 2048
  sun.shadow.mapSize.set(shadowSize, shadowSize)
  Object.assign(sun.shadow.camera, { left: -22, right: 22, top: 22, bottom: -22, far: 65 })
  sun.shadow.normalBias = .035; scene.add(sun)
  const groundMap = texture(512, 512, (c, w, h) => {
    c.fillStyle = '#86915d'; c.fillRect(0, 0, w, h)
    for (let i = 0; i < 18000; i++) { c.fillStyle = i % 2 ? '#d2bb7330' : '#3e583422'; c.fillRect(random() * w, random() * h, 2 + random() * 10, 2 + random() * 5) }
  })
  groundMap.wrapS = groundMap.wrapT = THREE.RepeatWrapping; groundMap.repeat.set(7, 7)
  const ground = mesh(new THREE.CircleGeometry(95, 96), mat('#ddd6ae', { map: groundMap }))
  ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; ground.castShadow = false
  const patch = mesh(new THREE.CircleGeometry(4.2, 48), mat('#9c9068', { map: groundMap }), scene, [0, .012, 0], [1.25, 1, 1])
  patch.rotation.x = -Math.PI / 2; patch.castShadow = false
  // Soft rolling hills and a distant, layered tree line.
  const hillGeo = new THREE.SphereGeometry(1, 48, 24), hills = []
  for (let i = 0; i < 12; i++) {
    const angle = i / 12 * Math.PI * 2
    const hill = mesh(hillGeo, mat(i % 2 ? '#b8c092' : '#c3c69d', { map: groundMap }), scene, [Math.cos(angle) * 57, -1.7, Math.sin(angle) * 57], [20 + random() * 8, 6 + random() * 6, 19])
    hill.castShadow = false; hill.name = 'terrain-hill'; hills.push(hill)
  }
  // Sample the actual ellipsoid surface; trees used to be planted at y=0
  // and disappear inside the hills, leaving their crowns looking like rocks.
  const terrainHeight = (x, z) => hills.reduce((height, hill) => {
    const d = ((x - hill.position.x) / hill.scale.x) ** 2 + ((z - hill.position.z) / hill.scale.z) ** 2
    return d < 1 ? Math.max(height, hill.position.y + hill.scale.y * Math.sqrt(1 - d)) : height
  }, 0)
  const trunkGeo = new THREE.CylinderGeometry(.11, .2, 1, 6)
  const crownGeo = new THREE.IcosahedronGeometry(1, 1)
  const bark = mat('#696244'), leafMats = ['#526b48', '#6d8455', '#7d9360', '#3e6048'].map(c => mat(c))
  const treeTransform = new THREE.Object3D()
  const trunks = new THREE.InstancedMesh(trunkGeo, bark, 115); trunks.name = 'terrain-tree-trunks'
  const crowns = leafMats.map(material => new THREE.InstancedMesh(crownGeo, material, 87))
  const crownCounts = [0, 0, 0, 0]
  for (let i = 0; i < 115; i++) {
    const angle = i / 115 * Math.PI * 2, radius = 40 + random() * 22
    const x = Math.sin(angle) * radius, z = Math.cos(angle) * radius, height = (2.8 + random() * 3.2) * objectScale
    const groundY = terrainHeight(x, z)
    treeTransform.position.set(x, groundY + height * .38, z)
    treeTransform.scale.set(objectScale, height * .76, objectScale); treeTransform.updateMatrix(); trunks.setMatrixAt(i, treeTransform.matrix)
    for (let j = 0; j < 3; j++) {
      treeTransform.position.set(x + (random() - .5) * 1.6, groundY + height * (.68 + j * .13), z + (random() - .5) * 1.6)
      treeTransform.scale.set(height * .3, height * .36, height * .28); treeTransform.updateMatrix()
      crowns[i % 4].setMatrixAt(crownCounts[i % 4]++, treeTransform.matrix)
    }
  }
  scene.add(trunks)
  crowns.forEach((crown, i) => { crown.count = crownCounts[i]; scene.add(crown) })
  // Instancing keeps thousands of blades and petals inexpensive to draw.
  const blade = new THREE.BufferGeometry()
  blade.setAttribute('position', new THREE.Float32BufferAttribute([-.045, 0, 0, .045, 0, 0, .025, .32, .018, .025, .32, .018, .045, 0, 0, .07, .58, .04], 3))
  blade.computeVertexNormals()
  const grassMaterial = mat('#ffffff', { side: THREE.DoubleSide })
  const wind = { value: 0 }
  grassMaterial.onBeforeCompile = shader => {
    shader.uniforms.meadowTime = wind
    shader.vertexShader = 'uniform float meadowTime;\n' + shader.vertexShader
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed.x += sin(meadowTime * 1.5 + instanceMatrix[3].x * .6 + instanceMatrix[3].z * .35) * position.y * .14;')
  }
  const grassCount = window.innerWidth < 700 ? 16000 : 28000
  const grasses = new THREE.InstancedMesh(blade, grassMaterial, grassCount)
  const dummy = new THREE.Object3D(), color = new THREE.Color()
  for (let i = 0; i < grassCount; i++) {
    let x = (random() - .5) * 80, z = (random() - .5) * 80
    // Clear a little space around the chest and along the footpath.
    const pathX = 1.2 + Math.sin(z * .22) * 1.2
    if (gardenPlaces.some(([gx, gz]) => Math.hypot(x - gx, z - gz) < 1.4) || Math.hypot(x / 1.25, z) < 4.1 || (z > 1 && z < 22 && Math.abs(x - pathX) < .8)) { x += x >= 0 ? 4.8 : -4.8 }
    dummy.position.set(x, terrainHeight(x, z) + .014, z); dummy.rotation.set(0, random() * Math.PI * 2, (random() - .5) * .3)
    const size = (.3 + random() * .7) * objectScale; dummy.scale.set(size, size, size); dummy.updateMatrix()
    grasses.setMatrixAt(i, dummy.matrix); grasses.setColorAt(i, color.set(grassColors[Math.floor(random() * grassColors.length)]))
  }
  grasses.receiveShadow = true; scene.add(grasses)
  const countryside = buildMeadowDetails({ scene, wood, gold, random, mat, terrainHeight })
  const garden = buildLivingGarden({ scene, wood, gold, onChange: onGardenState })
  countryside.targets.push(...garden.targets)
  countryside.obstacles.push(...gardenPlaces.map(([x, z]) => ({ x, z, radius: 1.05 })))
  const activateWorld = object => {
    object.userData.activate()
    const played = garden.handle(object.userData.action)
    if (object.userData.action === 'mill') object.userData.running = true
    if (!played) onWorldAction?.(object.userData.action)
    renderDirty = true
  }
  // Small butterflies bring the garden to life without adding interface text.
  const butterflies = []
  const wingShape = new THREE.Shape()
  wingShape.moveTo(0, 0); wingShape.bezierCurveTo(.42, .5, .65, .15, .12, -.02)
  wingShape.bezierCurveTo(.48, -.12, .3, -.42, 0, 0)
  const wingGeo = new THREE.ShapeGeometry(wingShape)
  for (let i = 0; i < 9; i++) {
    const butterfly = new THREE.Group()
    const wingMaterial = mat(['#ffe38a', '#c198ef', '#f7a2b6'][i % 3], { side: THREE.DoubleSide })
    const wings = [-1, 1].map(sign => {
      const wing = mesh(wingGeo, wingMaterial, butterfly)
      wing.scale.x = sign; wing.rotation.x = -Math.PI / 2; wing.castShadow = false
      return wing
    })
    butterfly.position.set((random() - .5) * 18, 1.5 + random() * 1.3, (random() - .5) * 17)
    butterfly.userData.origin = butterfly.position.clone(); butterfly.userData.wings = wings
    butterfly.scale.setScalar((.55 + random() * .35) * 1.5); scene.add(butterfly); butterflies.push(butterfly)
  }
  // A winding path of irregular, pale stones.
  const stoneGeo = new THREE.DodecahedronGeometry(1, 0), stoneMat = mat('#c4bfa0')
  for (let i = 0; i < 22; i++) {
    const z = 3 + i * .7
    const stone = mesh(stoneGeo, stoneMat, scene, [1.2 + Math.sin(z * .22) * 1.2 + (random() - .5) * .5, .025, z], [.28 + random() * .16, .065, .24 + random() * .13])
    stone.scale.multiplyScalar(objectScale); stone.rotation.y = random() * 6; stone.castShadow = false
  }
  // Ornamental сандық: a real hollow chest with a hinged lid.
  const chest = new THREE.Group(); scene.add(chest); chest.rotation.y = .12; chest.scale.setScalar(chestScale)
  box(chest, wood, [3.2, .16, 1.65], [0, .28, 0])
  box(chest, timber, [3.2, 1.22, .14], [0, .91, .8])
  box(chest, timber, [3.2, 1.22, .14], [0, .91, -.8])
  for (const x of [-1.54, 1.54]) box(chest, timber, [.14, 1.22, 1.6], [x, .91, 0])
  for (const x of [-1.35, 1.35]) for (const z of [-.61, .61]) box(chest, wood, [.22, .3, .22], [x, .15, z])
  // Four narrow rim pieces leave a real opening into the chest.
  for (const y of [.38, 1.46]) {
    for (const z of [-.86, .86]) box(chest, gold, [3.26, .075, .065], [0, y, z])
    for (const x of [-1.6, 1.6]) box(chest, gold, [.065, .075, 1.79], [x, y, 0])
  }
  for (const x of [-1.49, 1.49]) box(chest, gold, [.09, 1.14, 1.8], [x, .92, 0])
  const ornamentCanvas = document.createElement('canvas'); ornamentCanvas.width = 1024; ornamentCanvas.height = 384
  const ctx = ornamentCanvas.getContext('2d')
  ctx.drawImage(grain.image, 0, 0, 1024, 384)
  for (let i = 0; i < 1500; i++) { ctx.fillStyle = `rgba(222,192,128,${random() * .07})`; ctx.fillRect(random() * 1024, random() * 384, random() * 90, 1) }
  ctx.strokeStyle = '#c6a96e'; ctx.lineWidth = 4; ctx.strokeRect(20, 20, 984, 344); ctx.strokeRect(32, 32, 960, 320)
  // Symmetrical ram-horn-inspired ornament, drawn into the timber panel.
  for (const center of [256, 768]) {
    ctx.save(); ctx.translate(center, 192)
    ctx.beginPath(); ctx.moveTo(0, -128); ctx.lineTo(150, 0); ctx.lineTo(0, 128); ctx.lineTo(-150, 0); ctx.closePath(); ctx.stroke()
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) {
      ctx.save(); ctx.scale(sx, sy); ctx.lineWidth = 9; ctx.lineCap = 'round'
      ctx.beginPath(); ctx.moveTo(0, 5); ctx.bezierCurveTo(20, 15, 90, 100, 101, 41); ctx.bezierCurveTo(110, 0, 52, -3, 59, 32); ctx.bezierCurveTo(63, 47, 81, 42, 78, 28); ctx.stroke(); ctx.restore()
    }
    ctx.restore()
  }
  const ornamentTexture = new THREE.CanvasTexture(ornamentCanvas); ornamentTexture.colorSpace = THREE.SRGBColorSpace
  mesh(new THREE.PlaneGeometry(2.91, .97), mat('#ddd0ba', { map: ornamentTexture, bumpMap: grain, bumpScale: .018, roughness: .72 }), chest, [0, .91, .877])
  for (const x of [-1.35, 1.35]) for (const y of [.48, 1.34]) mesh(new THREE.SphereGeometry(.035, 8, 6), gold, chest, [x, y, .895])
  box(chest, gold, [.23, .32, .07], [0, 1.23, .91])
  mesh(new THREE.TorusGeometry(.09, .022, 8, 16), gold, chest, [0, 1.12, .96])
  const lid = new THREE.Group(); lid.position.set(0, 1.55, -.83); chest.add(lid)
  box(lid, timber, [3.3, .22, 1.81], [0, .06, .83])
  box(lid, wood, [2.99, .06, 1.53], [0, -.075, .83])
  for (const x of [-1.49, 0, 1.49]) box(lid, gold, [.08, .24, 1.84], [x, .06, .83])
  for (const z of [-.05, 1.7]) box(lid, gold, [3.32, .08, .065], [0, .15, z])
  const liningMap = texture(512, 512, (c, w, h) => {
    c.fillStyle = '#683c32'; c.fillRect(0, 0, w, h); c.strokeStyle = '#c6a06478'; c.lineWidth = 2
    for (let y = 20; y < h; y += 48) for (let x = 20; x < w; x += 48) { c.beginPath(); c.moveTo(x, y - 13); c.lineTo(x + 10, y); c.lineTo(x, y + 13); c.lineTo(x - 10, y); c.closePath(); c.stroke() }
    for (let y = 0; y < h; y += 3) { c.fillStyle = '#debda414'; c.fillRect(0, y, w, 1) }
  })
  const inside = box(chest, mat('#e0c6ac', { map: liningMap, roughness: 1, bumpMap: liningMap, bumpScale: .007 }), [2.92, .03, 1.43], [0, .39, 0]); inside.castShadow = false
  const treasureLight = new THREE.PointLight('#ffe2a2', 0, 6); treasureLight.position.set(0, 1.8 * chestScale, 0); scene.add(treasureLight)
  const treasures = []
  const paperMat = mat('#fff5de', { map: parchment, bumpMap: parchment, bumpScale: .009, side: THREE.DoubleSide })
  const bookMat = mat('#ffffff', { map: leather, bumpMap: leather, bumpScale: .014, roughness: .83 })
  const inkSheet = texture(512, 768, (c, w, h) => {
    c.drawImage(parchment.image, 0, 0, w, h)
    c.fillStyle = '#57412b'; c.font = 'italic 37px Georgia'; c.fillText('Dear traveller,', 55, 105)
    c.font = 'italic 19px Georgia'
    const lines = ['A little of my story,', 'some things I have made,', 'and the worlds I hope', 'to bring to life.', '', 'With curiosity,']
    lines.forEach((line, i) => c.fillText(line, 55, 175 + i * 49))
    c.font = 'italic 46px Georgia'; c.fillText('Akbope', 190, 548)
    c.strokeStyle = '#6e7953'; c.lineWidth = 3; c.beginPath(); c.moveTo(75, 665); c.bezierCurveTo(65, 605, 140, 595, 115, 550); c.stroke()
    for (let i = 0; i < 5; i++) { c.beginPath(); c.ellipse(83 + i * 7, 640 - i * 15, 17, 5, i % 2 ? -.6 : .6, 0, 6.28); c.stroke() }
  })
  const bookCover = texture(512, 640, (c, w, h) => {
    c.drawImage(leather.image, 0, 0, w, h)
    c.strokeStyle = '#b99151'; c.lineWidth = 3; c.strokeRect(42, 35, w - 70, h - 70); c.lineWidth = 1; c.strokeRect(51, 44, w - 88, h - 88)
    c.textAlign = 'center'; c.fillStyle = '#d4b77c'; c.font = '25px Georgia'; c.fillText('COLLECTED', 269, 180); c.font = '39px Georgia'; c.fillText('WORKS', 269, 229)
    c.font = 'italic 24px Georgia'; c.fillText('Akbope', 269, 510)
    c.beginPath(); c.moveTo(269, 275); c.lineTo(324, 345); c.lineTo(269, 415); c.lineTo(214, 345); c.closePath(); c.stroke()
    c.beginPath(); c.arc(269, 345, 25, 0, Math.PI * 2); c.stroke()
    for (const y of [74, h - 74]) for (const x of [80, w - 54]) { c.beginPath(); c.moveTo(x - 10, y); c.lineTo(x + 10, y); c.moveTo(x, y - 10); c.lineTo(x, y + 10); c.stroke() }
  })
  const coverMat = mat('#fff4dc', { map: bookCover, bumpMap: bookCover, bumpScale: .006, roughness: .78 })
  const wax = mat('#702b24', { roughness: .46 })
  const curvedPaper = (parent, material, width, height, z = 0) => {
    const geometry = new THREE.PlaneGeometry(width, height, 24, 32), positions = geometry.attributes.position
    for (let j = 0; j < positions.count; j++) {
      const x = positions.getX(j), y = positions.getY(j)
      const curl = Math.pow(Math.abs(x) / (width / 2), 8) * .045 + Math.pow(Math.abs(y) / (height / 2), 10) * .028
      positions.setZ(j, z + curl + Math.sin(y / height * Math.PI * 6) * .007)
    }
    geometry.computeVertexNormals(); return mesh(geometry, material, parent)
  }
  for (let i = 0; i < 3; i++) {
    const item = new THREE.Group(); item.userData.panel = ['about', 'work', 'contact'][i]; chest.add(item)
    if (i === 0) {
      curvedPaper(item, paperMat, .74, 1.04, -.006)
      curvedPaper(item, mat('#ffffff', { map: inkSheet, bumpMap: parchment, bumpScale: .008, side: THREE.DoubleSide }), .73, 1.03, 0)
    } else if (i === 1) {
      bevel(item, paperMat, [.71, .93, .15], [0, 0, 0], .018)
      // Separate, slightly irregular signatures catch the light along the fore-edge.
      const pageEdge = mat('#c5aa7d', { roughness: 1 })
      for (let j = 0; j < 13; j++) {
        box(item, pageEdge, [.702 + random() * .012, .91, .002], [.004, 0, -.065 + j * .011])
      }
      bevel(item, bookMat, [.8, 1.01, .035], [0, 0, -.098], .025)
      bevel(item, bookMat, [.8, 1.01, .035], [0, 0, .098], .025)
      mesh(new THREE.PlaneGeometry(.79, 1), coverMat, item, [0, 0, .13])
      const spine = mesh(new THREE.CylinderGeometry(.105, .105, .97, 16), bookMat, item, [-.36, 0, 0]); spine.scale.x = .65
      for (const y of [-.35, -.2, .2, .35]) bevel(item, gold, [.075, .025, .21], [-.36, y, 0], .008)
      const ribbon = box(item, mat('#7b3530'), [.055, .25, .008], [.22, -.49, -.03]); ribbon.rotation.z = -.1
      for (const x of [-.32, .32]) for (const y of [-.43, .43]) {
        mesh(new THREE.SphereGeometry(.021, 12, 8), gold, item, [x, y, .14], [1, 1, .36])
      }
    } else {
      bevel(item, paperMat, [.81, .57, .022], [0, 0, 0], .018)
      const flap = new THREE.Shape(); flap.moveTo(-.395, .275); flap.lineTo(.395, .275); flap.lineTo(.02, -.1); flap.quadraticCurveTo(0, -.12, -.02, -.1); flap.closePath()
      mesh(new THREE.ShapeGeometry(flap), paperMat, item, [0, 0, .024])
      const seamMat = mat('#9f8259')
      for (const sign of [-1, 1]) {
        const seam = new THREE.CatmullRomCurve3([new THREE.Vector3(sign * .39, .27, .027), new THREE.Vector3(sign * .2, .08, .035), new THREE.Vector3(0, -.105, .029)])
        mesh(new THREE.TubeGeometry(seam, 16, .002, 4, false), seamMat, item)
      }
      const sealGeometry = new THREE.CylinderGeometry(.087, .094, .025, 32)
      const vertices = sealGeometry.attributes.position
      for (let j = 0; j < vertices.count; j++) { const angle = Math.atan2(vertices.getZ(j), vertices.getX(j)); const ripple = 1 + Math.sin(angle * 7) * .06; vertices.setX(j, vertices.getX(j) * ripple); vertices.setZ(j, vertices.getZ(j) * ripple) }
      sealGeometry.computeVertexNormals()
      const seal = mesh(sealGeometry, wax, item, [0, -.055, .048]); seal.rotation.x = Math.PI / 2
      mesh(new THREE.TorusGeometry(.06, .005, 8, 32), wax, item, [0, -.055, .064])
      const emblem = new THREE.Shape(); emblem.moveTo(0, .035); emblem.lineTo(.025, 0); emblem.lineTo(0, -.035); emblem.lineTo(-.025, 0); emblem.closePath()
      mesh(new THREE.ShapeGeometry(emblem), mat('#a35c43'), item, [0, -.055, .064])
    }
    item.position.set((i - 1) * .96, i === 1 ? .53 : .46, i === 2 ? .29 : .2)
    item.scale.setScalar(.88)
    item.rotation.set(-Math.PI / 2, 0, (i - 1) * .12)
    item.visible = false; treasures.push(item)
  }
  const chestDetails = addChestDetails({ chest, lid, wood, gold, mat })
  // A few drifting seeds, instead of heavy postprocessing.
  const motesGeo = new THREE.BufferGeometry(), motePositions = []
  for (let i = 0; i < 65; i++) motePositions.push((random() - .5) * 25, random() * 5 + .4, (random() - .5) * 25)
  motesGeo.setAttribute('position', new THREE.Float32BufferAttribute(motePositions, 3))
  const motes = new THREE.Points(motesGeo, new THREE.PointsMaterial({ color: '#fff7c9', size: .065, transparent: true, opacity: .7 })); scene.add(motes)
  const resize = () => {
    const { width, height } = host.getBoundingClientRect()
    viewportWidth = width; viewportHeight = height; renderDirty = true
    renderer.setSize(width, height); camera.aspect = width / height; camera.updateProjectionMatrix()
    // Fit the entire open chest on narrow screens as well as desktops.
    const distance = Math.max(8, 5.8 / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect * .84))
    inspectionPosition.copy(inspectionDirection).multiplyScalar(distance).add(inspectionTarget)
    inspectionMatrix.lookAt(inspectionPosition, inspectionTarget, camera.up)
    inspectionRotation.setFromRotationMatrix(inspectionMatrix)
  }
  const observer = new window.ResizeObserver(resize); observer.observe(host); resize()
  const clearKeys = () => { keys.clear(); touchPoints.clear(); touchWalking = false; touchForward = 0; touchRight = 0; dragging = null }
  const keydown = event => {
    if (blocked || /INPUT|TEXTAREA|SELECT/.test(event.target.tagName) || event.target.isContentEditable) return
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(event.key)) { event.preventDefault(); keys.add(event.key) }
    if (event.key === 'Escape' && opened) { event.preventDefault(); onChest() }
    if (event.key === 'Enter' && !event.repeat && !/BUTTON|A/.test(event.target.tagName)) { event.preventDefault(); onChest() }
  }
  const keyup = event => keys.delete(event.key)
  const pointerdown = event => {
    if (blocked) return
    renderer.domElement.focus({ preventScroll: true }); renderer.domElement.setPointerCapture(event.pointerId)
    if (event.pointerType === 'touch') touchPoints.set(event.pointerId, { x: event.clientX, y: event.clientY })
    if (touchPoints.size > 1) {
      const points = [...touchPoints.values()]
      touchOrigin = { x: (points[0].x + points[1].x) / 2, y: (points[0].y + points[1].y) / 2 }
      touchWalking = true; didDrag = true; dragging = null; return
    }
    dragging = { x: event.clientX, y: event.clientY, yaw, pitch }; didDrag = false
  }
  const pointermove = event => {
    // Two-finger dragging walks without placing controls over the world.
    if (touchPoints.has(event.pointerId)) touchPoints.set(event.pointerId, { x: event.clientX, y: event.clientY })
    if (touchWalking) {
      if (touchPoints.size > 1 && !blocked && !opened) {
        const points = [...touchPoints.values()]
        touchForward = THREE.MathUtils.clamp((touchOrigin.y - (points[0].y + points[1].y) / 2) / 65, -1, 1)
        touchRight = THREE.MathUtils.clamp(((points[0].x + points[1].x) / 2 - touchOrigin.x) / 65, -1, 1)
      }
      return
    }
    if (!dragging && !blocked) {
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1)
      raycaster.setFromCamera(pointer, camera)
      renderer.domElement.style.cursor = raycaster.intersectObjects(opened ? [chest] : [chest, ...countryside.targets.filter(t => t.visible)], true).length ? 'pointer' : 'grab'
      return
    }
    if (!dragging || blocked || opened || inspectionBlend > .001) return
    const dx = event.clientX - dragging.x, dy = event.clientY - dragging.y
    if (Math.abs(dx) + Math.abs(dy) > 6) didDrag = true
    yaw = dragging.yaw - dx * .004; pitch = THREE.MathUtils.clamp(dragging.pitch - dy * .003, -.65, .25)
  }
  const pointerup = event => {
    touchPoints.delete(event.pointerId)
    if (touchWalking) { touchForward = 0; touchRight = 0; dragging = null; didDrag = true; if (!touchPoints.size) touchWalking = false; return }
    dragging = null
    if (didDrag || blocked) return
    const rect = renderer.domElement.getBoundingClientRect()
    pointer.set((event.clientX - rect.left) / rect.width * 2 - 1, -(event.clientY - rect.top) / rect.height * 2 + 1)
    raycaster.setFromCamera(pointer, camera)
    const hits = raycaster.intersectObjects(opened ? [chest] : [chest, ...countryside.targets.filter(t => t.visible)], true)
    if (hits.length) {
      let object = hits[0].object
      while (object && !object.userData.panel && !object.userData.action && object !== chest) object = object.parent
      if (object?.userData.action) { if (countryside.targets.includes(object)) activateWorld(object); else object.userData.activate(); renderDirty = true }
      else if (object?.userData.panel && opened) onItem(object.userData.panel)
      else if (object === chest) onChest()
    } else if (opened) onChest()
  }
  window.addEventListener('keydown', keydown); window.addEventListener('keyup', keyup); window.addEventListener('blur', clearKeys)
  document.addEventListener('visibilitychange', clearKeys)
  renderer.domElement.addEventListener('pointerdown', pointerdown); renderer.domElement.addEventListener('pointermove', pointermove); renderer.domElement.addEventListener('pointerup', pointerup)
  const cancelDrag = () => { clearKeys(); didDrag = true }
  renderer.domElement.addEventListener('pointercancel', cancelDrag)
  function animate(now) {
    if (disposed) return
    frame = requestAnimationFrame(animate)
    if (previous && now - previous < 1000 / 30) return
    const dt = Math.min((now - (previous || now)) / 1000, .05); previous = now
    if (document.hidden) return
    // Reading a still artifact should not keep redrawing shadows at 30 fps.
    if (blocked && !renderDirty && inspectionBlend === (opened ? 1 : 0) && Math.abs(lid.rotation.x - (opened ? -1.85 : 0)) < .001) return
    if (!paused && !blocked) {
      elapsed += dt; wind.value = elapsed; motes.rotation.y = elapsed * .015
      butterflies.forEach((butterfly, i) => {
        const origin = butterfly.userData.origin
        butterfly.position.set(origin.x + Math.sin(elapsed * .35 + i) * 1.7, origin.y + Math.sin(elapsed * 1.5 + i) * .24, origin.z + Math.cos(elapsed * .3 + i) * 1.2)
        butterfly.rotation.y = elapsed * .3 + i
        butterfly.userData.wings.forEach((wing, j) => { wing.rotation.y = Math.sin(elapsed * 11 + i) * .65 * (j ? -1 : 1) })
      })
    }
    if (!blocked) { garden.update(dt, paused); countryside.targets.find(t => t.userData.action === 'mill').userData.windBoost = garden.wind; countryside.update(dt, elapsed, paused); chestDetails.update(dt, paused, elapsed) }
    if (!blocked && !opened && inspectionBlend === 0) {
      let forward = Number(keys.has('ArrowUp') || keys.has('w')) - Number(keys.has('ArrowDown') || keys.has('s')) + touchForward
      let right = Number(keys.has('ArrowRight') || keys.has('d')) - Number(keys.has('ArrowLeft') || keys.has('a')) + touchRight
      const length = Math.hypot(forward, right)
      if (length) {
        forward /= Math.max(1, length); right /= Math.max(1, length)
        const dx = (-Math.sin(yaw) * forward + Math.cos(yaw) * right) * dt * 4
        const dz = (-Math.cos(yaw) * forward - Math.sin(yaw) * right) * dt * 4
        const nx = camera.position.x + dx, nz = camera.position.z + dz
        if (!countryside.obstacles.some(o => Math.hypot(nx - o.x, nz - o.z) < o.radius + .5) && Math.hypot(nx, nz) < 24 && !(Math.abs(nx) < 2.15 * chestScale && Math.abs(nz) < 1.65 * chestScale)) { camera.position.x = nx; camera.position.z = nz }
        camera.position.y = terrainHeight(camera.position.x, camera.position.z) + eyeHeight
      }
    }
    if (opened || inspectionBlend > 0) {
      const targetBlend = opened ? 1 : 0
      inspectionBlend = THREE.MathUtils.lerp(inspectionBlend, targetBlend, paused ? 1 : 1 - Math.exp(-dt * 4))
      if (Math.abs(inspectionBlend - targetBlend) < .001) inspectionBlend = targetBlend
      camera.position.lerpVectors(returnPosition, inspectionPosition, inspectionBlend)
      camera.quaternion.slerpQuaternions(returnRotation, inspectionRotation, inspectionBlend)
    } else {
      camera.lookAt(camera.position.x - Math.sin(yaw) * 10, camera.position.y + Math.tan(pitch) * 10, camera.position.z - Math.cos(yaw) * 10)
    }
    lid.rotation.x = THREE.MathUtils.lerp(lid.rotation.x, opened ? -1.85 : 0, paused ? 1 : 1 - Math.exp(-dt * 5))
    treasureLight.intensity = opened ? 2.2 : 0
    treasures.concat(chestDetails.items).forEach(item => { item.visible = lid.rotation.x < -.2 })
    // Keyboard/touch hit areas follow the actual objects resting on the lining.
    scene.updateMatrixWorld(true); camera.updateMatrixWorld(true)
    onHotspots?.([...treasures, ...chestDetails.items].map(item => {
      item.getWorldPosition(projectedItem).project(camera)
      return { pressed: item.userData.glowing, panel: item.userData.panel || item.userData.action, x: (projectedItem.x + 1) * viewportWidth / 2, y: (1 - projectedItem.y) * viewportHeight / 2, visible: opened && inspectionBlend > .96 && lid.rotation.x < -1.5 }
    }))
    renderer.render(scene, camera); renderDirty = false
  }
  frame = requestAnimationFrame(animate); onReady()
  return {
    setOpen(value) {
      if (value === opened) return
      if (value && inspectionBlend === 0) { returnPosition.copy(camera.position); returnRotation.copy(camera.quaternion) }
      opened = value; renderDirty = true; keys.clear(); dragging = null
    }, setPaused(value) { paused = value; renderDirty = true }, setBlocked(value) { blocked = value; renderDirty = true; keys.clear() },
    interact(id) { const object = countryside.targets.find(t => t.userData.action === id); if (object) activateWorld(object); else chestDetails.activate(id); renderDirty = true },
    move(key, active) { if (active) keys.add(key); else keys.delete(key) },
    reset() { if (opened) { onChest(); return } inspectionBlend = 0; camera.position.copy(start); yaw = 0; pitch = startPitch; keys.clear(); dragging = null; renderDirty = true },
    dispose() {
      disposed = true; window.cancelAnimationFrame(frame); observer.disconnect()
      window.removeEventListener('keydown', keydown); window.removeEventListener('keyup', keyup); window.removeEventListener('blur', clearKeys); document.removeEventListener('visibilitychange', clearKeys)
      renderer.domElement.removeEventListener('pointerdown', pointerdown); renderer.domElement.removeEventListener('pointermove', pointermove); renderer.domElement.removeEventListener('pointerup', pointerup); renderer.domElement.removeEventListener('pointercancel', cancelDrag)
      const geometries = new Set(), materials = new Set()
      scene.traverse(object => { if (object.geometry) geometries.add(object.geometry); if (object.material) materials.add(object.material) })
      geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); ornamentTexture.dispose(); textures.forEach(t => t.dispose()); renderer.dispose(); renderer.domElement.remove()
    },
  }
}
