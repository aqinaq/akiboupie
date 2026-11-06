import { buildMeadowFlowers } from './meadowFlowers.js'
import * as THREE from 'three'
import { mergeVertices, mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { buildWindVillage } from './genshinVillage.js'

const clamp = THREE.MathUtils.clamp
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t) }
const hash = (x, z) => { const n = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return n - Math.floor(n) }
function noise(x, z) {
  const ix = Math.floor(x), iz = Math.floor(z), u = smooth(0, 1, x - ix), v = smooth(0, 1, z - iz)
  return THREE.MathUtils.lerp(THREE.MathUtils.lerp(hash(ix, iz), hash(ix + 1, iz), u), THREE.MathUtils.lerp(hash(ix, iz + 1), hash(ix + 1, iz + 1), u), v)
}
const riverX = z => 20 + Math.sin(z * .045) * 9
export function windriseHeight(x, z) {
  const radius = Math.hypot(x, z), flat = smooth(15, 30, radius)
  let h = (Math.sin(x * .065 + .6) * Math.cos(z * .045) * 2.1 + noise(x * .045, z * .045) * 3.5) * flat
  h += 7 * Math.exp(-((x - 56) ** 2 / 800 + (z + 90) ** 2 / 1500))
  h += 5 * Math.exp(-((x + 55) ** 2 / 900 + (z + 60) ** 2 / 1400))
  if (z < -8 && z > -130) h -= (h + 1.35) * (1 - smooth(4, 8, Math.abs(x - riverX(z)))) * smooth(-8, -18, z)
  return h
}
const pathDistance = (x, z) => Math.abs(x - (z > 0 ? Math.sin(z * .12) * 1.7 : Math.sin(z * .07) * 5))

export function buildWindrise({ scene, random, wind, textures, onTextureReady }) {
  const mobile = window.innerWidth < 700
  const material = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 1, metalness: 0, ...extra })
  const loader = new THREE.TextureLoader()
  const load = url => {
    const map = loader.load(url, onTextureReady); map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 4; textures.push(map); return map
  }
  const skyMap = load('/world/mondstadt-sky.png')
  const sky = new THREE.Mesh(new THREE.SphereGeometry(230, 64, 32), new THREE.MeshBasicMaterial({ map: skyMap, side: THREE.BackSide, depthWrite: false, fog: false, toneMapped: false }))
  sky.name = 'painted-mondstadt-sky'; sky.rotation.y = .65; scene.add(sky)
  const leafMap = load('/world/oak-foliage.png')

  // One continuous, walkable heightfield: smooth hills, a cut river bed, and a dusty trail.
  const groundGeo = new THREE.PlaneGeometry(400, 400, 360, 360); groundGeo.rotateX(-Math.PI / 2)
  const gp = groundGeo.attributes.position, groundColors = [], groundColor = new THREE.Color()
  const grassDark = new THREE.Color('#4c883f'), grassLight = new THREE.Color('#8bb64c'), dirt = new THREE.Color('#c8b780')
  for (let i = 0; i < gp.count; i++) {
    const x = gp.getX(i), z = gp.getZ(i), h = windriseHeight(x, z)
    gp.setY(i, h)
    groundColor.copy(grassDark).lerp(grassLight, noise(x * .12, z * .12) * .65 + .18)
    const path = (1 - smooth(.7, 2.2, pathDistance(x, z) + (noise(x * 1.2, z * 1.2) - .5) * .5)) * (1 - smooth(35, 55, Math.abs(z)))
    groundColor.lerp(dirt, Math.max(path, (1 - smooth(2.1, 3.2, Math.hypot(x, z))) * .75))
    if (h < -.2) groundColor.lerp(dirt, .8)
    groundColors.push(groundColor.r, groundColor.g, groundColor.b)
  }
  groundGeo.setAttribute('color', new THREE.Float32BufferAttribute(groundColors, 3)); groundGeo.computeVertexNormals()
  const ground = new THREE.Mesh(groundGeo, material('#ffffff', { vertexColors: true })); ground.receiveShadow = true; ground.name = 'continuous-windrise-terrain'; scene.add(ground)

  // Slender curved blades, with upright normals and root-to-tip colour, instead of flat triangles.
  const blades = new THREE.BufferGeometry(), bp = [], bn = [], buv = [], bi = []
  for (let side = 0; side < 2; side++) for (let j = 0; j <= 4; j++) {
    const t = j / 4, w = .034 * (1 - t) ** .7
    bp.push((side ? w : -w) + t * t * .085, t * .48, t * t * .04); bn.push(0, 1, 0); buv.push(side, t)
  }
  for (let j = 0; j < 4; j++) bi.push(j, j + 5, j + 1, j + 1, j + 5, j + 6)
  blades.setAttribute('position', new THREE.Float32BufferAttribute(bp, 3)); blades.setAttribute('normal', new THREE.Float32BufferAttribute(bn, 3)); blades.setAttribute('uv', new THREE.Float32BufferAttribute(buv, 2)); blades.setIndex(bi)
  const grassMat = new THREE.MeshBasicMaterial({ color: '#ffffff', side: THREE.DoubleSide, toneMapped: false })
  grassMat.onBeforeCompile = shader => {
    shader.uniforms.windTime = wind
    shader.vertexShader = 'uniform float windTime; varying float bladeHeight; varying vec2 grassRoot;\n' + shader.vertexShader
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      bladeHeight = uv.y;
      vec3 root = instanceMatrix[3].xyz; grassRoot = root.xz;
      float gust = sin(windTime * 1.25 + root.x * .22 + root.z * .17);
      transformed.x += (gust * .09 + sin(windTime * 2.1 + root.x) * .04) * uv.y * uv.y;
      transformed.z += cos(windTime + root.z * .3) * .07 * uv.y;`)
    shader.fragmentShader = 'varying float bladeHeight; varying vec2 grassRoot;\n' + shader.fragmentShader
    shader.fragmentShader = shader.fragmentShader.replace('#include <color_fragment>', '#include <color_fragment>\nfloat shade = 1. - .3 * exp(-dot((grassRoot - vec2(-13.,-23.)) / vec2(13.,9.), (grassRoot - vec2(-13.,-23.)) / vec2(13.,9.))); diffuseColor.rgb *= mix(vec3(.69,.82,.62), vec3(1.18,1.15,.85), bladeHeight) * shade;')
  }
  const count = mobile ? 38000 : 100000, grass = new THREE.InstancedMesh(blades, grassMat, count), dummy = new THREE.Object3D(), color = new THREE.Color()
  let written = 0
  for (let i = 0; i < count * 1.5 && written < count; i++) {
    const near = i < count * .85, x = (random() - .5) * (near ? 105 : 230), z = (random() - .5) * (near ? 105 : 200) - (near ? 10 : 50)
    const y = windriseHeight(x, z)
    if (y < -.15 || Math.hypot(x, z) < 2.7 || (Math.abs(z) < 50 && pathDistance(x, z) < 1.25 + random() * .65)) continue
    const size = .5 + random() * .75
    dummy.position.set(x, y -.015, z); dummy.rotation.set(0, random() * Math.PI * 2, 0); dummy.scale.set(size, size * (.75 + noise(x * .1, z * .1) * .6), size); dummy.updateMatrix()
    grass.setMatrixAt(written, dummy.matrix)
    color.setHSL(.205 + random() * .035, .54 + random() * .15, .25 + random() * .12)
    grass.setColorAt(written++, color)
  }
  grass.count = written; grass.receiveShadow = true; grass.name = 'wind-swept-fine-grass'; scene.add(grass)

  // Bark is authored as broad painted grooves, never high-frequency photographic noise.
  const barkCanvas = document.createElement('canvas'); barkCanvas.width = barkCanvas.height = 512
  const bc = barkCanvas.getContext('2d'); bc.fillStyle = '#71644d'; bc.fillRect(0, 0, 512, 512)
  for (let i = 0; i < 70; i++) {
    const x = random() * 512; bc.strokeStyle = i % 3 ? '#544c3b' : '#958264'; bc.lineWidth = 1 + random() * 6
    bc.beginPath(); bc.moveTo(x, 0); bc.bezierCurveTo(x + 35, 170, x - 25, 340, x + 10, 512); bc.stroke()
  }
  const barkMap = new THREE.CanvasTexture(barkCanvas); barkMap.colorSpace = THREE.SRGBColorSpace; barkMap.wrapS = barkMap.wrapT = THREE.RepeatWrapping; textures.push(barkMap)
  const bark = material('#e2d8b7', { map: barkMap, emissive: '#6f6a4f', emissiveIntensity: .23 }), branchParts = []
  const leafTransforms = [], leafColors = []
  function branch(parent, points, radiusStart, radiusEnd) {
    const curve = new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)))
    const geo = new THREE.TubeGeometry(curve, 12, 1, 9, false), p = geo.attributes.position
    for (let j = 0; j <= 12; j++) {
      const center = curve.getPointAt(j / 12), radius = THREE.MathUtils.lerp(radiusStart, radiusEnd, j / 12)
      for (let k = 0; k <= 9; k++) {
        const idx = j * 10 + k, v = new THREE.Vector3().fromBufferAttribute(p, idx).sub(center)
        v.multiplyScalar(radius * (1 + Math.sin(k / 9 * Math.PI * 6 + j * .3) * .1)).add(center); p.setXYZ(idx, v.x, v.y, v.z)
      }
    }
    geo.computeVertexNormals(); const m = new THREE.Mesh(geo, bark); m.castShadow = true; m.receiveShadow = true; parent.add(m); branchParts.push(m)
  }
  function tree(x, z, scale = 1, hero = false) {
    const group = new THREE.Group(); group.position.set(x, windriseHeight(x, z), z); group.scale.setScalar(scale); scene.add(group)
    branch(group, [[0, -.2, 0], [.3, 2, .1], [-.1, 4.5, 0], [.5, 7.8, -.3]], hero ? 1.3 : .7, .28)
    for (let i = 0; i < 7; i++) {
      const a = i / 7 * Math.PI * 2, dx = Math.cos(a), dz = Math.sin(a)
      branch(group, [[0, .5, 0], [dx * 1.5, .25, dz * 1.5], [dx * 3.7, .05, dz * 3.7]], hero ? .7 : .3, .04)
      branch(group, [[0, 3.5 + i * .2, 0], [dx * 2, 6.5, dz * 2], [dx * 5, 8 + (i % 2), dz * 5], [dx * 7.5, 8.5, dz * 7.5]], .55, .08)
      for (let j = 0; j < 3; j++) {
        const a2 = a + (j - 1) * .48, reach = 5.5 + random() * 2.5
        branch(group, [[dx * 3, 7.3, dz * 3], [Math.cos(a2) * reach, 9.8, Math.sin(a2) * reach], [Math.cos(a2) * (reach + 1), 10.4, Math.sin(a2) * (reach + 1)]], .2, .025)
      }
    }
    group.updateMatrixWorld(true)
    const clusters = hero ? 145 : 55
    for (let i = 0; i < clusters; i++) {
      const a = random() * Math.PI * 2, radius = Math.sqrt(random()) * 8.5
      const cy = 9.3 + (1 - radius / 10) * 3.1 + (random() - .5) * 1.8
      dummy.position.set(Math.cos(a) * radius, cy, Math.sin(a) * radius)
      dummy.rotation.set((random() - .5) * .65, random() * Math.PI, (random() - .5) * .6)
      const size = 3.5 + random() * 2.5; dummy.scale.set(size, size * .8, size); dummy.updateMatrix()
      leafTransforms.push(group.matrixWorld.clone().multiply(dummy.matrix))
      leafColors.push(new THREE.Color().setHSL(.86 + random() * .10, .42 + random() * .16, .67 + random() * .17))
    }
  }
  tree(-13, -23, 1.35, true)
  for (const [x,z,s] of [[-35,-14,.62],[-39,-34,.65],[-27,-47,.58],[34,-22,.55],[42,-39,.67],[-50,-65,.8],[3,-61,.62],[54,-65,.7],[-41,17,.55],[39,22,.55]]) tree(x,z,s)
  for (let i = 0; i < 26; i++) { const a = random() * Math.PI * 2, r = 65 + random() * 70; const x = Math.sin(a) * r, z = Math.cos(a) * r - 35; if(windriseHeight(x,z) > 0) tree(x,z,.25 + random() * .22) }
  // All trunks and branches share one draw call, including the large hero oak.
  scene.updateMatrixWorld(true)
  const branchGeos = branchParts.map(m => { const geo = m.geometry.clone().applyMatrix4(m.matrixWorld); return geo.index ? geo.toNonIndexed() : geo })
  const mergedBranches = mergeGeometries(branchGeos, false)
  if (mergedBranches) { const trunks = new THREE.Mesh(mergedBranches, bark); trunks.castShadow = true; trunks.receiveShadow = true; scene.add(trunks) }
  branchParts.forEach(m => { m.parent.remove(m); m.geometry.dispose() }); branchGeos.forEach(g => g.dispose())
  const leafGeo = new THREE.PlaneGeometry(1, 1, 2, 2)
  const leafMat = new THREE.MeshBasicMaterial({ map: leafMap, alphaTest: .38, side: THREE.DoubleSide, color: '#ffffff', toneMapped: false })
  leafMat.onBeforeCompile = shader => {
    shader.uniforms.windTime = wind
    shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `#include <map_fragment>
      float leafLight = dot(sampledDiffuseColor.rgb, vec3(.299,.587,.114));
      diffuseColor.rgb = diffuseColor.rgb / max(sampledDiffuseColor.rgb, vec3(.001)) * (.55 + leafLight * .9);`)
    shader.vertexShader = 'uniform float windTime;\n' + shader.vertexShader
    shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\ntransformed.x += sin(windTime * .7 + instanceMatrix[3].x * .3) * .025 * (position.y + .5);')
    shader.vertexShader = shader.vertexShader.replace('#include <project_vertex>', `vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(0.,0.,0.,1.); mvPosition.xy += transformed.xy * vec2(length(instanceMatrix[0].xyz), length(instanceMatrix[1].xyz)); gl_Position = projectionMatrix * mvPosition;`)
  }
  const leaves = new THREE.InstancedMesh(leafGeo, leafMat, leafTransforms.length)
  leafTransforms.forEach((matrix, i) => { leaves.setMatrixAt(i, matrix); leaves.setColorAt(i, leafColors[i]) }); leaves.castShadow = true; scene.add(leaves)
  // Shrubs use the same painted leaf language at a smaller, grounded scale.
  const shrubs = new THREE.InstancedMesh(leafGeo, leafMat, 600); let shrubCount = 0
  for (let i = 0; i < 200; i++) {
    const x = (random() - .5) * 145, z = (random() - .5) * 130 - 20, y = windriseHeight(x,z)
    if (y < 0 || Math.hypot(x,z) < 5 || pathDistance(x,z) < 2) continue
    for (let j=0;j<3;j++) { dummy.position.set(x,y+.5,z); dummy.rotation.set(0,j*Math.PI/3,0); dummy.scale.set(1.8,1.3,1.8);dummy.updateMatrix();shrubs.setMatrixAt(shrubCount++,dummy.matrix) }
  }
  shrubs.count=shrubCount; scene.add(shrubs)

  // Broad, asymmetric limestone shelves with layered fractures and grass on their upper faces.
  const rockMap = load('/world/painted-limestone.png'); rockMap.wrapS = rockMap.wrapT = THREE.RepeatWrapping
  function paintedRock(color) {
    const mat = material(color)
    mat.onBeforeCompile = shader => {
      shader.uniforms.paintedRock = { value: rockMap }
      shader.vertexShader = 'varying vec3 rockWorld; varying vec3 rockLocal; varying vec3 rockNormal;\n' + shader.vertexShader
      shader.vertexShader = shader.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
vec4 rockVertex = vec4(position,1.);
#ifdef USE_INSTANCING
rockVertex = instanceMatrix * rockVertex;
#endif
rockWorld=(modelMatrix*rockVertex).xyz; rockLocal=position; rockNormal=normalize(normal);`)
      shader.fragmentShader = 'uniform sampler2D paintedRock; varying vec3 rockWorld; varying vec3 rockLocal; varying vec3 rockNormal;\n' + shader.fragmentShader
      shader.fragmentShader = shader.fragmentShader.replace('#include <map_fragment>', `
        vec3 weights = pow(abs(rockNormal), vec3(4.)); weights /= max(dot(weights, vec3(1.)), .001);
        vec3 painted = texture2D(paintedRock, rockWorld.zy * .085).rgb * weights.x + texture2D(paintedRock, rockWorld.xz * .085).rgb * weights.y + texture2D(paintedRock, rockWorld.xy * .085).rgb * weights.z;
        float moss = smoothstep(.54,.76,rockLocal.y) * smoothstep(.35,.8,rockNormal.y);
        diffuseColor.rgb *= mix(painted, vec3(.19,.34,.085),moss*.9);
      `)
    }
    return mat
  }
  const rockMaterials = [paintedRock('#e7eff0'), paintedRock('#f3f1df'), paintedRock('#dbe6ed')]
  function cragGeometry(seed = 0) {
    const geo = mergeVertices(new THREE.IcosahedronGeometry(1, 3)), p = geo.attributes.position, colors = []
    for(let i=0;i<p.count;i++) {
      const x=p.getX(i), y=p.getY(i), z=p.getZ(i), n=noise(x*2+seed,z*2+seed)
      p.setXYZ(i,x*(.84+n*.28+Math.sin(z*18+y*3)*.035),Math.max(-.6,y)*(.8+n*.3),z*(.88+noise(z*3+seed,x*3)*.23+Math.sin(x*19)*.04))
      const c=new THREE.Color('#c7cfb9').lerp(new THREE.Color('#708b8a'),clamp(.7-y*.7+n*.15,0,1));colors.push(c.r,c.g,c.b)
    }
    geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.computeVertexNormals();return geo
  }
  const rockGeos = [0,4,9].map(cragGeometry), rockMat = paintedRock('#f1f4e5')
  const rockBatches = [[], [], []]
  for(let i=0;i<180;i++) {
    const x=(random()-.5)*170,z=(random()-.5)*170-25
    if(Math.hypot(x,z)<5 || pathDistance(x,z)<2)continue
    const size=.35+random()**3*3.2
    dummy.position.set(x,windriseHeight(x,z)+size*.2,z);dummy.scale.set(size*1.7,size*.75,size);dummy.rotation.set(0,random()*6.28,0);dummy.updateMatrix();rockBatches[i%3].push(dummy.matrix.clone())
  }
  rockBatches.forEach((matrices,i)=>{const rocks=new THREE.InstancedMesh(rockGeos[i],rockMat,matrices.length);matrices.forEach((m,j)=>rocks.setMatrixAt(j,m));rocks.castShadow=true;rocks.receiveShadow=true;scene.add(rocks)})
  // Long escarpments, rather than repeated pillars: the silhouettes step and overlap.
  for(const [cx,cz,width,height,depth] of [[-78,-105,45,30,25],[-112,-60,34,24,30],[76,-72,30,26,26],[104,-110,43,37,30],[0,-160,55,22,25]]) {
    for(let j=0;j<7;j++) {
      const x=cx+(j-3)*width*.23,z=cz+Math.sin(j*1.8)*5,h=height*(.7+noise(j,cx)*.4)
      const cliff=new THREE.Mesh(rockGeos[j%3],rockMaterials[j%3]);cliff.position.set(x,h*.44,z);cliff.scale.set(width*.3,h*.85,depth);cliff.rotation.y=j*.45;scene.add(cliff)
      
    }
  }

  // Water follows the valley. A transparent Fresnel surface and moving foam stay in 3D.
  const waterGeo=new THREE.PlaneGeometry(1,1,1,160);waterGeo.rotateX(-Math.PI/2)
  const wp=waterGeo.attributes.position
  for(let i=0;i<wp.count;i++) { const z=-8-(wp.getZ(i)+.5)*125, side=wp.getX(i)*2;wp.setXYZ(i,riverX(z)+side*(4.3+Math.sin(z*.1)*.55),-.32,z) }
  waterGeo.computeVertexNormals()
  const waterMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,
    uniforms:{time:wind},
    vertexShader:'varying vec3 worldPosition; void main(){vec4 world=modelMatrix*vec4(position,1.);worldPosition=world.xyz;gl_Position=projectionMatrix*viewMatrix*world;}',
    fragmentShader:`uniform float time;varying vec3 worldPosition;void main(){
      vec3 view=normalize(cameraPosition-worldPosition);float fresnel=pow(1.-abs(view.y),3.);
      float a=sin(worldPosition.x*3.+worldPosition.z*.6+time*.65);float b=sin(worldPosition.z*2.2-worldPosition.x*.5+time*.4);
      float ripple=smoothstep(.985,1.,a*b)*.26;
      vec3 col=mix(vec3(.055,.50,.57),vec3(.39,.74,.84),fresnel)+ripple;
      gl_FragColor=vec4(col,.88);\n#include <colorspace_fragment>\n}`})
  const river=new THREE.Mesh(waterGeo,waterMat);river.name='flowing-turquoise-river';scene.add(river)

  const flowerField = buildMeadowFlowers({ scene, random, height: windriseHeight, pathDistance, mobile })
  // Windborne blossom petals share one draw call and follow the scene's motion preference.
  const petalCount = mobile ? 70 : 160
  const petals = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 6, 4), material('#f9b6de', { side: THREE.DoubleSide }), petalCount)
  const petalSeeds = Array.from({ length: petalCount }, () => ({ x: (random()-.5)*55, z: (random()-.5)*55-12, y: random()*16, phase: random()*Math.PI*2 }))
  function updatePetals(time) {
    petalSeeds.forEach((p,i) => {
      const y = ((p.y-time*.38)%16+16)%16
      dummy.position.set(p.x+Math.sin(time*.3+p.phase)*2, windriseHeight(p.x,p.z)+y+.3, p.z+Math.cos(time*.22+p.phase))
      dummy.rotation.set(time*.5+p.phase, p.phase, time*.35+p.phase)
      dummy.scale.set(.075,.012,.045);dummy.updateMatrix();petals.setMatrixAt(i,dummy.matrix)
    })
    petals.instanceMatrix.needsUpdate = true
  }
  updatePetals(0);petals.name='drifting-sakura-petals';scene.add(petals)
  const village = buildWindVillage({scene,random,height:windriseHeight,material,textures})
  village.obstacles.push({x:-13,z:-23,radius:2.8})
  return { ...village, flowerField, terrainHeight: windriseHeight, update(dt,time,paused){village.update(dt,time,paused);flowerField.update(dt);if(!paused)updatePetals(time)}, dispose(){skyMap.dispose();leafMap.dispose();barkMap.dispose()} }
}
