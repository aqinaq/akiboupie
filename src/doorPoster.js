import * as THREE from 'three'

export function addDoorPoster(hinge, { textures, onTextureReady, isDisposed = () => false }) {
  const poster = new THREE.Group()
  poster.name = 'longshot-door-poster'
  poster.position.set(1.4, 4.4, .245)
  poster.rotation.z = -.025
  hinge.add(poster)
  const width = 1.78, height = width * 1016 / 1112
  const geometry = new THREE.PlaneGeometry(width, height, 64, 64)
  const p = geometry.attributes.position
  // A tight diagonal fold turns a larger free corner back toward the viewer.
  const crease = (width / 2 + height / 2) / Math.SQRT2 - .52
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i)
    const distance = Math.max(0, (x-y) / Math.SQRT2 - crease)
    const radius = .075, angle = Math.min(distance / radius, 2.65)
    const flap = Math.max(0, distance - radius * angle)
    const bend = radius * Math.sin(angle) + flap * Math.cos(angle) - distance
    const lift = radius * (1-Math.cos(angle)) + flap * Math.sin(angle)
    p.setXYZ(i, x+bend/Math.SQRT2, y-bend/Math.SQRT2, .003+lift)
  }
  geometry.computeVertexNormals()
  const front = new THREE.MeshStandardMaterial({ color:'#ffffff', roughness:.94, side:THREE.FrontSide })
  const back = new THREE.MeshStandardMaterial({ color:'#e6ddc4', roughness:1, side:THREE.BackSide })
  for (const material of [front,back]) {
    const sheet = new THREE.Mesh(geometry,material)
    sheet.castShadow = sheet.receiveShadow = true
    poster.add(sheet)
  }
  new THREE.TextureLoader().load('/decor/longshot.jpeg', map => {
    if (isDisposed()) { map.dispose(); return }
    map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 4
    textures.push(map); front.map = map; front.needsUpdate = true
    onTextureReady?.()
  })
  const tapeMaterial = new THREE.MeshStandardMaterial({ color:'#cabd9b', transparent:true, opacity:.72, roughness:1, side:THREE.DoubleSide })
  // Three taped corners; the curled corner is deliberately left unattached.
  for (const [x,y,angle] of [[-.72,height/2-.025,-.22],[.72,height/2-.025,.18],[-.72,-height/2+.025,.16]]) {
    const tape = new THREE.Mesh(new THREE.PlaneGeometry(.22,.085),tapeMaterial)
    tape.name='paper-tape';tape.position.set(x,y,.012);tape.rotation.z=angle;poster.add(tape)
  }
  return poster
}
