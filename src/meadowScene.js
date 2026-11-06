import { t } from './i18n.js'
import * as THREE from 'three'
import { buildWindrise } from './genshinWorld.js'
import { addChestDetails } from './meadowDetails.js'

// Everything in the meadow is built locally; no model or texture downloads.
export function createMeadow(host, { onReady, onError, onChest, onItem, onHotspots }) {
  let renderer
  try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' }) }
  catch { onError(); return { dispose() {}, setOpen() {}, setPaused() {}, setBlocked() {}, move() {}, reset() {} } }
  const scene = new THREE.Scene()
  scene.background = new THREE.Color('#67bdf0')
  scene.fog = new THREE.Fog('#c5b4d4', 75, 215)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 700 ? 1.25 : 1.5))
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.NeutralToneMapping
  renderer.toneMappingExposure = 1.05
  host.appendChild(renderer.domElement)
  renderer.domElement.setAttribute('aria-label', t("3D fantasy meadow with a treasure chest, elemental waystone and village. Бағыттауыш пернелермен жүріңіз, айналаға қарау үшін сүйреңіз, сандықты ашу үшін Enter басыңыз."))
  renderer.domElement.setAttribute('role', 'img')
  renderer.domElement.tabIndex = 0
  const camera = new THREE.PerspectiveCamera(56, 1, .1, 260)
  // Keep the viewpoint near human eye level so the yurts read as buildings.
  const eyeHeight = 2.7, startPitch = .045
  const start = new THREE.Vector3(0, eyeHeight, 14)
  camera.position.copy(start)
  let yaw = 0, pitch = startPitch
  camera.lookAt(start.x - Math.sin(yaw) * 10, start.y + Math.tan(pitch) * 10, start.z - Math.cos(yaw) * 10)
  let inspectionBlend = 0
  const returnPosition = start.clone(), returnRotation = camera.quaternion.clone()
  const inspectionPosition = new THREE.Vector3(), inspectionRotation = new THREE.Quaternion()
  const inspectionTarget = new THREE.Vector3(0, 1.2, -.2)
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
  const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: .88, ...extra })
  const chestScale = 1
  // Pigment, grain and tiny surface imperfections are baked once, locally.
  const textures = []
  const texture = (width, height, paint) => {
    const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height
    paint(canvas.getContext('2d'), width, height)
    const map = new THREE.CanvasTexture(canvas); map.colorSpace = THREE.SRGBColorSpace
    map.anisotropy = 4; textures.push(map); return map
  }
  const paintBlossom = (c, x, y, radius, color = '#edb8dc') => {
    c.save(); c.translate(x, y); c.fillStyle = color
    for (let i = 0; i < 5; i++) {
      c.rotate(Math.PI * 2 / 5); c.beginPath(); c.ellipse(0, -radius * .48, radius * .3, radius * .52, 0, 0, Math.PI * 2); c.fill()
    }
    c.fillStyle = '#ffe6bb'; c.beginPath(); c.arc(0, 0, radius * .17, 0, Math.PI * 2); c.fill(); c.restore()
  }
  const grain = texture(1024, 512, (c, w, h) => {
    c.fillStyle = '#72577f'; c.fillRect(0, 0, w, h)
    for (let y = 0; y < h; y++) {
      c.strokeStyle = `rgba(${y % 3 ? '39,22,57' : '222,173,230'},${.06 + random() * .2})`; c.lineWidth = .5 + random() * 2
      c.beginPath()
      for (let x = 0; x <= w; x += 8) {
        const bend = Math.sin(x * .007 + y * .032) * 4 + Math.sin(x * .023 + y * .05) * 1.6
        if (x === 0) c.moveTo(x, y + bend); else c.lineTo(x, y + bend)
      }
      c.stroke()
    }
    for (let i = 0; i < 4; i++) { c.fillStyle = '#301c435c'; c.fillRect(0, i * 128, w, 2); c.fillStyle = '#ebbae535'; c.fillRect(0, i * 128 + 2, w, 1) }
    for (const [x, y] of [[230, 200], [760, 410]]) for (let r = 2; r < 22; r += 3) {
      c.strokeStyle = '#32204236'; c.lineWidth = 1; c.beginPath(); c.ellipse(x, y, r * 3, r * .48, .03, 0, Math.PI * 2); c.stroke()
    }
  })
  const leather = texture(512, 512, (c, w, h) => {
    c.fillStyle = '#715094'; c.fillRect(0, 0, w, h)
    for (let i = 0; i < 25000; i++) { c.fillStyle = i % 2 ? '#28123c24' : '#e9b8ec20'; c.fillRect(random() * w, random() * h, 1 + random() * 2, 1) }
    c.strokeStyle = '#efbddb70'; c.lineWidth = 8; c.strokeRect(8, 8, w - 16, h - 16)
  })
  const parchment = texture(512, 768, (c, w, h) => {
    c.fillStyle = '#f2deed'; c.fillRect(0, 0, w, h)
    for (let i = 0; i < 14000; i++) { c.fillStyle = i % 3 ? '#7c4e820e' : '#fff3fc32'; c.fillRect(random() * w, random() * h, random() * 5, 1) }
    for (let i = 0; i < 18; i++) { c.strokeStyle = `rgba(116,68,130,${.025 + i * .001})`; c.lineWidth = 2; c.strokeRect(i, i, w - i * 2, h - i * 2) }
    for (const y of [h / 3, h * 2 / 3]) { c.fillStyle = '#85558b24'; c.fillRect(0, y, w, 2); c.fillStyle = '#fff2fc60'; c.fillRect(0, y + 2, w, 3) }
  })
  const wood = mat('#e3c5ed', { map: grain, bumpMap: grain, bumpScale: .026, roughness: .72 })
  const timber = mat('#dfc1e9', { map: grain, bumpMap: grain, bumpScale: .035, roughness: .68 })
  const gold = mat('#efbfae', { metalness: .55, roughness: .68, bumpMap: leather, bumpScale: .008 })
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
  scene.add(new THREE.HemisphereLight('#d3eeff', '#8ca978', 1.5))
  const sun = new THREE.DirectionalLight('#fff8e8', 2.3)
  sun.position.set(-28, 48, 25); sun.castShadow = true
  const shadowSize = window.innerWidth < 700 ? 1024 : 2048
  sun.shadow.mapSize.set(shadowSize, shadowSize)
  Object.assign(sun.shadow.camera, { left: -48, right: 48, top: 48, bottom: -48, far: 140 })
  sun.shadow.normalBias = .035; scene.add(sun)
  const wind = { value: 0 }
  const countryside = buildWindrise({ scene, random, wind, textures, onTextureReady: () => { renderDirty = true } })
  const terrainHeight = countryside.terrainHeight
  // Small butterflies bring the garden to life without adding interface text.
  const butterflies = []
  const wingShape = new THREE.Shape()
  wingShape.moveTo(0, 0); wingShape.bezierCurveTo(.42, .5, .65, .15, .12, -.02)
  wingShape.bezierCurveTo(.48, -.12, .3, -.42, 0, 0)
  const wingGeo = new THREE.ShapeGeometry(wingShape)
  for (let i = 0; i < 5; i++) {
    const butterfly = new THREE.Group()
    const wingMaterial = mat(['#ffe38a', '#c198ef', '#f7a2b6'][i % 3], { side: THREE.DoubleSide })
    const wings = [-1, 1].map(sign => {
      const wing = mesh(wingGeo, wingMaterial, butterfly)
      wing.scale.x = sign; wing.rotation.x = -Math.PI / 2; wing.castShadow = false
      return wing
    })
    butterfly.position.set((random() - .5) * 18, 1.5 + random() * 1.3, (random() - .5) * 17)
    butterfly.userData.origin = butterfly.position.clone(); butterfly.userData.wings = wings
    butterfly.scale.setScalar((.25 + random() * .2)); scene.add(butterfly); butterflies.push(butterfly)
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
  ctx.fillStyle = '#5b3d70'; ctx.fillRect(0, 0, 1024, 384)
  for (let j=0;j<5;j++) {
    ctx.fillStyle = j%2 ? '#795588' : '#704c80'; ctx.fillRect(j*205,0,201,384)
    ctx.strokeStyle='#54345f';ctx.lineWidth=3
    for(let k=0;k<8;k++){ctx.beginPath();ctx.moveTo(j*205+20+k*22,0);ctx.bezierCurveTo(j*205+35+k*22,130,j*205+k*22,270,j*205+20+k*22,384);ctx.stroke()}
  }
  ctx.strokeStyle='#efc9b7';ctx.lineWidth=14;ctx.strokeRect(8,8,1008,368)
  for(const x of [40,984]){ctx.fillStyle='#e9b9aa';ctx.beginPath();ctx.moveTo(x,20);ctx.lineTo(x+(x<100?70:-70),20);ctx.lineTo(x,110);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(x,364);ctx.lineTo(x+(x<100?70:-70),364);ctx.lineTo(x,274);ctx.closePath();ctx.fill()}
  for (const side of [-1, 1]) {
    ctx.strokeStyle = '#efc9b7'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(512 + side * 75, 290); ctx.bezierCurveTo(512 + side * 180, 110, 512 + side * 270, 290, 512 + side * 350, 120); ctx.stroke()
    for (let i = 0; i < 3; i++) paintBlossom(ctx, 512 + side * (140 + i * 90), 210 - i * 25, 23)
  }
  const ornamentTexture = new THREE.CanvasTexture(ornamentCanvas); ornamentTexture.colorSpace = THREE.SRGBColorSpace
  mesh(new THREE.PlaneGeometry(2.91, .97), mat('#ffffff', { map: ornamentTexture, roughness: .9 }), chest, [0, .91, .877])
  for (const x of [-1.35, 1.35]) for (const y of [.48, 1.34]) mesh(new THREE.SphereGeometry(.035, 8, 6), gold, chest, [x, y, .895])
  box(chest, gold, [.23, .32, .07], [0, 1.23, .91])
  mesh(new THREE.TorusGeometry(.09, .022, 8, 16), gold, chest, [0, 1.12, .96])
  const lid = new THREE.Group(); lid.position.set(0, 1.55, -.83); chest.add(lid)
  // Explicit barrel shell gives the lid its rounded, metal-bound adventure-chest silhouette.
  const shell = new THREE.BufferGeometry(), sp=[], si=[]
  for(let x=0;x<2;x++) for(let j=0;j<=24;j++){const a=j/24*Math.PI;sp.push(x?1.65:-1.65,Math.sin(a)*.63+.04,.83-Math.cos(a)*.9)}
  for(let j=0;j<24;j++)si.push(j,j+25,j+1,j+1,j+25,j+26)
  shell.setAttribute('position',new THREE.Float32BufferAttribute(sp,3));shell.setIndex(si);shell.computeVertexNormals()
  mesh(shell,mat('#78578d',{side:THREE.DoubleSide}),lid)
  for(const x of [-1.65,1.65]){
    const end=new THREE.Shape();end.moveTo(-.9,.04);for(let j=0;j<=24;j++){const a=j/24*Math.PI;end.lineTo(-Math.cos(a)*.9,Math.sin(a)*.63+.04)}end.closePath()
    const cap=mesh(new THREE.ShapeGeometry(end),timber,lid,[x,0,.83]);cap.rotation.y=Math.PI/2
  }
  for(const x of [-1.53,0,1.53]){
    const points=[];for(let j=0;j<=32;j++){const a=j/32*Math.PI;points.push(new THREE.Vector3(x,Math.sin(a)*.65+.065,.83-Math.cos(a)*.92))}
    mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),32,.045,6,false),gold,lid)
  }
  for(const z of [-.07,1.73])box(lid,gold,[3.35,.1,.08],[0,.04,z])
  bevel(lid,wood,[3.1,.06,1.65],[0,-.035,.83],.025)
  const liningMap = texture(512, 512, (c, w, h) => {
    c.fillStyle = '#53355e'; c.fillRect(0, 0, w, h); c.strokeStyle = '#edb8dc90'; c.lineWidth = 2
    for (let y = 26; y < h; y += 64) for (let x = 26; x < w; x += 64) { paintBlossom(c, x + (y % 128 > 64 ? 16 : 0), y, 12, '#c890ba'); c.strokeStyle='#bda0d65c'; c.beginPath(); c.arc(x,y,23,0,Math.PI*2); c.stroke() }
    for (let y = 0; y < h; y += 3) { c.fillStyle = '#eed5f014'; c.fillRect(0, y, w, 1) }
  })
  const inside = box(chest, mat('#f1d4ef', { map: liningMap, roughness: 1, bumpMap: liningMap, bumpScale: .007 }), [2.92, .03, 1.43], [0, .39, 0]); inside.castShadow = false
  const treasureLight = new THREE.PointLight('#f5c3ed', 0, 6); treasureLight.position.set(0, 1.8 * chestScale, 0); scene.add(treasureLight)
  const treasures = []
  const paperMat = mat('#fff4ff', { map: parchment, bumpMap: parchment, bumpScale: .009, side: THREE.DoubleSide })
  const inkSheet = texture(512, 768, (c, w, h) => {
    c.drawImage(parchment.image, 0, 0, w, h)
    c.fillStyle = '#55385f'; c.font = 'italic 37px Arial'; c.fillText(t("Dear traveller,"), 55, 105)
    c.font = 'italic 19px Arial'
    const lines = [t("A little of my story,"), t("some things I have made,"), t("and the worlds I hope"), t("to bring to life."), '', t("With curiosity,")]
    lines.forEach((line, i) => c.fillText(line, 55, 175 + i * 49))
    c.font = 'italic 46px Arial'; c.fillText('Akbope', 190, 548)
    paintBlossom(c, 405, 82, 25, '#ca95ba')
    c.strokeStyle = '#96709c'; c.lineWidth = 3; c.beginPath(); c.moveTo(75, 665); c.bezierCurveTo(65, 605, 140, 595, 115, 550); c.stroke()
    for (let i = 0; i < 5; i++) { c.beginPath(); c.ellipse(83 + i * 7, 640 - i * 15, 17, 5, i % 2 ? -.6 : .6, 0, 6.28); c.stroke() }
  })
  const wax = mat('#a5538d', { roughness: .46 })
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
      // A physical emitter rests inside the chest; the projection is anchored to it.
      const housing = mat('#29465a', { metalness: .65, roughness: .3 })
      const glow = mat('#9cfff1', { emissive: '#49ddcc', emissiveIntensity: 1.8, roughness: .2 })
      const base = mesh(new THREE.CylinderGeometry(.34, .4, .12, 32), housing, item, [0, 0, .04])
      base.rotation.x = Math.PI / 2
      mesh(new THREE.TorusGeometry(.3, .025, 12, 40), gold, item, [0, 0, .12])
      mesh(new THREE.TorusGeometry(.23, .012, 8, 40), glow, item, [0, 0, .14])
      const crystal = mesh(new THREE.OctahedronGeometry(.19), glow, item, [0, 0, .25])
      crystal.scale.set(1, 1, 1.6)
    } else {
      bevel(item, paperMat, [.81, .57, .022], [0, 0, 0], .018)
      const flap = new THREE.Shape(); flap.moveTo(-.395, .275); flap.lineTo(.395, .275); flap.lineTo(.02, -.1); flap.quadraticCurveTo(0, -.12, -.02, -.1); flap.closePath()
      mesh(new THREE.ShapeGeometry(flap), paperMat, item, [0, 0, .024])
      const seamMat = mat('#b591b5')
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
      mesh(new THREE.ShapeGeometry(emblem), mat('#f4c5dd'), item, [0, -.055, .064])
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
    const distance = Math.max(5.5, 4.2 / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect * .84))
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
    if (event.key === 'Enter' && !event.repeat && !/^(BUTTON|A)$/.test(event.target.tagName)) { event.preventDefault(); onChest() }
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
      renderer.domElement.style.cursor = raycaster.intersectObjects([chest], true).length || (!opened && countryside.flowerField.pick(raycaster)) ? 'pointer' : 'grab'
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
    const hits = raycaster.intersectObjects([chest], true)
    const flowerHit = !opened && countryside.flowerField.pick(raycaster)
    if (flowerHit && (!hits.length || flowerHit.distance < hits[0].distance)) {
      countryside.flowerField.burst(flowerHit.bloom, paused)
      if (import.meta.env.DEV) renderer.domElement.dataset.lastFlowerColor = flowerHit.bloom.color
      renderDirty = true; return
    }
    if (hits.length) {
      let object = hits[0].object
      while (object && !object.userData.panel && !object.userData.action && object !== chest) object = object.parent
      if (object?.userData.action) { object.userData.activate(); renderDirty = true }
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
    if (!blocked) { countryside.update(dt, elapsed, paused)
      chestDetails.update(dt, paused, elapsed) }
    if (!blocked && !opened && inspectionBlend === 0) {
      let forward = Number(keys.has('ArrowUp') || keys.has('w')) - Number(keys.has('ArrowDown') || keys.has('s')) + touchForward
      let right = Number(keys.has('ArrowRight') || keys.has('d')) - Number(keys.has('ArrowLeft') || keys.has('a')) + touchRight
      const length = Math.hypot(forward, right)
      if (length) {
        forward /= Math.max(1, length); right /= Math.max(1, length)
        const dx = (-Math.sin(yaw) * forward + Math.cos(yaw) * right) * dt * 4
        const dz = (-Math.cos(yaw) * forward - Math.sin(yaw) * right) * dt * 4
        const nx = camera.position.x + dx, nz = camera.position.z + dz
        if (!countryside.obstacles.some(o => Math.hypot(nx - o.x, nz - o.z) < o.radius + .5) && Math.hypot(nx, nz) < 60 && !(Math.abs(nx) < 2.15 * chestScale && Math.abs(nz) < 1.65 * chestScale)) { camera.position.x = nx; camera.position.z = nz }
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
    if (import.meta.env.DEV) { renderer.domElement.dataset.drawCalls = String(renderer.info.render.calls); renderer.domElement.dataset.triangles = String(renderer.info.render.triangles) }
  }
  frame = requestAnimationFrame(animate); onReady()
  return {
    setOpen(value) {
      if (value === opened) return
      if (value && inspectionBlend === 0) { returnPosition.copy(camera.position); returnRotation.copy(camera.quaternion) }
      opened = value; renderDirty = true; keys.clear(); dragging = null
    }, setPaused(value) { paused = value; renderDirty = true }, setBlocked(value) { blocked = value; renderDirty = true; keys.clear() },
    interact(id) { chestDetails.activate(id); renderDirty = true },
    move(key, active) { if (active) keys.add(key); else keys.delete(key) },
    reset() { if (opened) { onChest(); return } inspectionBlend = 0; camera.position.copy(start); yaw = 0; pitch = startPitch; keys.clear(); dragging = null; renderDirty = true },
    dispose() {
      disposed = true; window.cancelAnimationFrame(frame); observer.disconnect()
      window.removeEventListener('keydown', keydown); window.removeEventListener('keyup', keyup); window.removeEventListener('blur', clearKeys); document.removeEventListener('visibilitychange', clearKeys)
      renderer.domElement.removeEventListener('pointerdown', pointerdown); renderer.domElement.removeEventListener('pointermove', pointermove); renderer.domElement.removeEventListener('pointerup', pointerup); renderer.domElement.removeEventListener('pointercancel', cancelDrag)
      const geometries = new Set(), materials = new Set()
      scene.traverse(object => { if (object.geometry) geometries.add(object.geometry); if (object.material) materials.add(object.material) })
      geometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); ornamentTexture.dispose(); countryside.dispose(); textures.forEach(t => t.dispose()); renderer.dispose(); renderer.domElement.remove()
    },
  }
}
