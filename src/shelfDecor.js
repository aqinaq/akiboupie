import * as THREE from 'three'
import { buildAstroToy } from './astroToy.js'
import { buildYogaToys } from './yogaToys.js'
import { buildKaijuToy } from './kaijuToy.js'
import { buildStackedCaps } from './capModels.js'

// Small collectible objects are modeled in world space, including cables and puzzle seams.
export function buildShelfDecor(parent, textures) {
  const root = new THREE.Group()
  root.name = 'right-display-shelf'
  root.position.set(9.3, 0, .42)
  parent.add(root)
  const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: .65, ...extra })
  const black = mat('#171919'), silver = mat('#afb3b3', { metalness: .8, roughness: .28 })
  const wood = mat('#665044'), edge = mat('#343938', { metalness: .55 })
  function mesh(g, m, p = root) { const o = new THREE.Mesh(g, m); o.castShadow = o.receiveShadow = true; p.add(o); return o }
  function box(p, w, h, d, x, y, z, m) { const o = mesh(new THREE.BoxGeometry(w,h,d),m,p); o.position.set(x,y,z); return o }
  function group(name,x,y,z) { const g=new THREE.Group();g.name=name;g.position.set(x,y,z);root.add(g);return g }
  function tube(p, points, radius, material) { return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(v=>new THREE.Vector3(...v))),48,radius,8,false),material,p) }
  function print(bg, lines, ink='#e4dbca') {
    const c=document.createElement('canvas');c.width=512;c.height=512;const ctx=c.getContext('2d')
    ctx.fillStyle=bg;ctx.fillRect(0,0,512,512);ctx.fillStyle=ink;ctx.textAlign='center';ctx.textBaseline='middle'
    lines.forEach((line,i)=>{ctx.font=`bold ${lines.length>2?86:62}px sans-serif`;ctx.fillText(line,256,512*(i+1)/(lines.length+1),470)})
    const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;textures.push(t);return mat('#ffffff',{map:t})
  }
  // Open-backed walnut shelving with slender metal supports.
  for(const x of [-1.12,1.12])for(const z of [-.28,.46])box(root,.055,4.65,.055,x,2.325,z,edge)
  for(const y of [.16,1.22,2.38,3.62]) {
    box(root,2.38,.085,.94,0,y,.08,wood)
    box(root,2.38,.035,.025,0,y+.025,.56,mat('#9b7f63'))
  }
  for(const x of [-1.12,1.12])box(root,.09,.05,.86,x,4.62,.08,edge)

  const cube=group('rubiks-cube',-.63,3.97,.08);cube.rotation.set(0,-.38,0);cube.scale.setScalar(.62)
  const palette=['#e9d8bd','#dfb735','#bc453d','#d17a36','#377a63','#4c7da6'].map(c=>mat(c,{roughness:.4}))
  for(let x=-1;x<=1;x++)for(let y=-1;y<=1;y++)for(let z=-1;z<=1;z++) {
    box(cube,.188,.188,.188,x*.202,y*.202,z*.202,black)
    for(let axis=0;axis<3;axis++)for(const sign of [-1,1])if([x,y,z][axis]===sign) {
      const tile=mesh(new THREE.PlaneGeometry(.162,.162),palette[axis*2+(sign>0?1:0)],cube)
      tile.position.set(x*.202,y*.202,z*.202);tile.position.setComponent(axis,sign*.299)
      if(axis===0)tile.rotation.y=sign*Math.PI/2
      if(axis===1)tile.rotation.x=-sign*Math.PI/2
      if(axis===2&&sign<0)tile.rotation.y=Math.PI
    }
  }
  // Recover the twelve pentagonal faces, then divide each into a center and five puzzle pieces.
  const mega=group('megaminx',.58,4.04,.08);mega.scale.setScalar(.62)
  mesh(new THREE.DodecahedronGeometry(.4),black,mega)
  const raw=new THREE.DodecahedronGeometry(.405),p=raw.attributes.position,faces=new Map()
  for(let i=0;i<p.count;i+=3) {
    const a=new THREE.Vector3().fromBufferAttribute(p,i),b=new THREE.Vector3().fromBufferAttribute(p,i+1),c=new THREE.Vector3().fromBufferAttribute(p,i+2)
    const n=b.clone().sub(a).cross(c.clone().sub(a)).normalize(),key=n.toArray().map(v=>Math.round(v*1000)).join(',')
    if(!faces.has(key))faces.set(key,{n,points:[]})
    const f=faces.get(key);for(const v of [a,b,c])if(!f.points.some(q=>q.distanceTo(v)<.001))f.points.push(v)
  }
  const colors=['#d8c9b8','#b77199','#c69539','#649e91','#ab5147','#5886a0','#8c78b0','#a6ae5c','#cd784a','#b1c6c9','#57755c','#c9b54b']
  let fi=0
  for(const f of faces.values()) {
    const center=f.points.reduce((a,b)=>a.add(b),new THREE.Vector3()).multiplyScalar(1/5),u=f.points[0].clone().sub(center).normalize(),v=f.n.clone().cross(u)
    f.points.sort((a,b)=>Math.atan2(a.clone().sub(center).dot(v),a.clone().sub(center).dot(u))-Math.atan2(b.clone().sub(center).dot(v),b.clone().sub(center).dot(u)))
    const inner=f.points.map(q=>q.clone().lerp(center,.55)),material=mat(colors[fi++%12])
    function polygon(points) {
      const mid=points.reduce((a,b)=>a.add(b),new THREE.Vector3()).multiplyScalar(1/points.length),vs=[]
      const inset=points.map(q=>q.clone().lerp(mid,.045))
      for(let j=0;j<inset.length;j++)vs.push(...mid.toArray(),...inset[j].toArray(),...inset[(j+1)%inset.length].toArray())
      const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vs,3));g.computeVertexNormals();mesh(g,material,mega)
    }
    polygon(inner)
    for(let j=0;j<5;j++)polygon([f.points[j],f.points[(j+1)%5],inner[(j+1)%5],inner[j]])
  }
  // Rest on a full pentagonal face, rather than balancing on a point.
  mega.quaternion.setFromUnitVectors(faces.values().next().value.n,new THREE.Vector3(0,-1,0))
  mega.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),.25))
  raw.dispose()

  const phones=group('silver-wired-headphones',-.48,2.43,.13)
  // Thin metal headband and small foam pads, following the supplied vintage headphones.
  const arc=[];for(let i=0;i<=32;i++){const a=Math.PI*i/32;arc.push([Math.cos(a)*.39,.35+Math.sin(a)*.54,0])}
  tube(phones,arc,.024,silver)
  tube(phones,arc.map(([x,y,z])=>[x,y-.018,z+.015]),.012,black)
  for(const s of [-1,1]) {
    box(phones,.035,.24,.045,s*.385,.31,0,silver)
    const cup=mesh(new THREE.CylinderGeometry(.17,.17,.075,32),silver,phones);cup.rotation.x=Math.PI/2;cup.position.set(s*.37,.20,.035)
    const cushion=mesh(new THREE.CylinderGeometry(.155,.155,.075,32),mat('#292827',{roughness:1}),phones);cushion.rotation.x=Math.PI/2;cushion.position.set(s*.37,.20,.10)
  }
  phones.scale.setScalar(.62);phones.rotation.set(-Math.PI/2,0,-.12);phones.position.z=.37
  const player=group('portable-music-player',.48,2.59,.18);player.rotation.set(-Math.PI/2,0,-.12)
  box(player,.33,.48,.065,0,0,0,silver);box(player,.315,.465,.02,0,0,.039,black)
  box(player,.268,.19,.008,0,.105,.052,mat('#71847e',{emissive:'#71847e',emissiveIntensity:.12}))
  const wheel=mesh(new THREE.RingGeometry(.036,.094,40),mat('#363b3a'),player);wheel.position.set(0,-.119,.055)
  const button=mesh(new THREE.CircleGeometry(.033,24),black,player);button.position.set(0,-.119,.056)

  function restOnShelf(object, surface) {
    object.position.y=0
    object.updateMatrix()
    const bounds=new THREE.Box3()
    object.traverse(child=>{
      if(!child.geometry)return
      child.updateWorldMatrix(true,false)
      const matrix=new THREE.Matrix4().copy(root.matrixWorld).invert().multiply(child.matrixWorld)
      const positions=child.geometry.attributes.position
      for(let i=0;i<positions.count;i++)bounds.expandByPoint(new THREE.Vector3().fromBufferAttribute(positions,i).applyMatrix4(matrix))
    })
    object.position.y=surface-bounds.min.y+.002
    object.userData.layoutRevision='resting-v2'
    object.updateMatrix()
  }
  restOnShelf(cube,3.6625);restOnShelf(mega,3.6625)
  restOnShelf(phones,2.4225);restOnShelf(player,2.4225)
  // The lead lies loosely on the board and rises only at its two connectors.
  const cableStart=new THREE.Vector3(-.37,.14,.10).applyMatrix4(phones.matrix)
  const cableEnd=new THREE.Vector3(0,.24,0).applyMatrix4(player.matrix)
  const cable=tube(root,[cableStart.toArray(),[-.74,2.438,.38],[-.56,2.438,.46],[-.1,2.438,.43],[.14,2.438,.25],[.20,2.438,-.12],[.4,2.438,-.16],cableEnd.toArray()],.007,black)
  cable.name='headphone-cable'

  const records=group('vinyl-record-stack',-.52,1.28,.10)
  const sleeveColors=['#bda88e','#6f8182','#b48068','#cbc3a4','#474f55','#a79c78','#8c6869']
  for(let i=0;i<9;i++) {
    const sleeve=box(records,.87,.025,.74,Math.sin(i*3)*.035,i*.032,0,mat(sleeveColors[i%7]));sleeve.rotation.y=Math.sin(i*7)*.14
    box(records,.76,.009,.005,0,i*.032+.007,.375,mat('#c9bda6'))
  }
  const vinyl=mesh(new THREE.RingGeometry(.023,.37,64),mat('#191c1d',{metalness:.2,roughness:.32,side:THREE.DoubleSide}),records);vinyl.rotation.x=-Math.PI/2;vinyl.position.set(.035,.279,.03)
  for(let r=.15;r<.36;r+=.018) {const g=mesh(new THREE.RingGeometry(r,r+.002,64),mat('#353b3b',{side:THREE.DoubleSide}),records);g.rotation.x=-Math.PI/2;g.position.copy(vinyl.position);g.position.y+=.001}
  const label=mesh(new THREE.RingGeometry(.023,.115,40),mat('#cfc6a6',{side:THREE.DoubleSide}),records);label.rotation.x=-Math.PI/2;label.position.copy(vinyl.position);label.position.y+=.002

  const tapes=group('cassette-stack',.58,1.30,.12)
  const labels=['NEW MORNING','BOB DYLAN','SELF PORTRAIT','BLONDE ON BLONDE','MIX 01']
  for(let i=0;i<5;i++) {
    const g=new THREE.Group();g.position.set(Math.sin(i*2)*.035,i*.105,0);g.rotation.y=Math.sin(i*4)*.08;tapes.add(g)
    box(g,.79,.096,.48,0,0,0,mat('#808b87',{metalness:.25,roughness:.25}))
    box(g,.75,.073,.45,0,0,.008,black)
    const spine=mesh(new THREE.PlaneGeometry(.71,.068),print(['#b7b39a','#bd8f91','#a6b7a4','#c0aa74','#9aa7b4'][i],[labels[i]],'#343732'),g);spine.position.set(0,0,.252)
    for(const x of [-.382,.382])box(g,.018,.09,.48,x,0,0,silver)
  }

  const cd=group('skool-luv-affair-cd',.55,.65,.03);cd.rotation.set(-.12,-.18,0)
  const disc=mesh(new THREE.RingGeometry(.058,.38,64),print('#264d41',['SKOOL','LUV','AFFAIR'],'#dca4b0'),cd)
  // RingGeometry's square UVs preserve the circular album lettering layout.
  const rim=mesh(new THREE.RingGeometry(.365,.385,64),silver,cd);rim.position.z=.002
  const hub=mesh(new THREE.RingGeometry(.058,.12,48),silver,cd);hub.position.z=.004
  disc.material.side=THREE.DoubleSide
  box(root,.3,.055,.28,.55,.235,.1,black)
  const bottom=group('record-sleeves',-.6,.21,.02)
  for(let i=0;i<6;i++) { const s=box(bottom,.052,.75,.62,-.20+i*.075,.38,0,mat(sleeveColors[i]));s.rotation.z=-.06 }
  box(root,2.38,.085,.94,0,4.62,.08,wood)
  buildAstroToy(root)
  buildYogaToys(root)
  const toy=buildKaijuToy(root);toy.position.set(.15,4.6645,.12)
  const caps=buildStackedCaps(root);caps.position.set(0,4.68,.08);caps.rotation.y=-.22
  const light=new THREE.PointLight('#f4dfc4',28,7,2);light.position.set(0,6.35,1.7);root.add(light)
  const fill=new THREE.PointLight('#d8dedb',9,5,2);fill.position.set(-.2,2.1,2);root.add(fill)
  return root
}
