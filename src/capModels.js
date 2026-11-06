import * as THREE from 'three'
import { TessellateModifier } from 'three/addons/modifiers/TessellateModifier.js'

// Raised blackletter embroidery: narrow stems, split serifs and pointed terminals.
const glyphs = {
  L: [[[.12,0],[.04,.1],[.13,.19],[.13,.85],[.03,.92],[.18,1],[.32,.9],[.25,.82],[.25,.2],[.46,.25],[.55,.14],[.42,.04],[.3,.1],[.22,0]]],
  N: [[[.03,.08],[.12,.19],[.12,.83],[.02,.92],[.17,1],[.27,.88],[.27,.12],[.17,0]],[[.25,.85],[.37,.94],[.53,.16],[.43,.04]],[[.48,.08],[.58,.19],[.58,.82],[.48,.91],[.62,1],[.75,.88],[.68,.8],[.68,.12],[.57,0]]],
  G: [[[.58,.81],[.4,.94],[.24,.84],[.24,.19],[.4,.13],[.48,.22],[.48,.44],[.35,.48],[.45,.59],[.64,.52],[.64,.14],[.4,0],[.08,.13],[.08,.87],[.36,1],[.65,.93]]],
  H: [[[.04,.1],[.13,.2],[.13,.84],[.03,.93],[.19,1],[.29,.88],[.26,.17],[.16,0]],[[.47,.1],[.56,.2],[.56,.84],[.46,.93],[.62,1],[.72,.88],[.69,.17],[.59,0]],[[.22,.49],[.28,.6],[.61,.53],[.61,.43]]],
  O: [[[.06,.14],[.06,.85],[.34,1],[.62,.86],[.62,.14],[.34,0]],[[.24,.22],[.34,.15],[.44,.22],[.44,.78],[.34,.85],[.24,.78]]],
  T: [[[.02,.84],[.14,1],[.25,.92],[.43,.97],[.55,.9],[.66,1],[.7,.8],[.5,.75],[.45,.84],[.45,.17],[.55,.1],[.35,0],[.22,.12],[.3,.22],[.3,.84],[.19,.78]]],
}

export function buildStackedCaps(parent) {
  const root = new THREE.Group();root.name='stacked-longshot-caps';parent.add(root)
  root.scale.setScalar(.65)
  const material=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.91,...extra})
  const mesh=(geo,mat,group)=>{const o=new THREE.Mesh(geo,mat);o.castShadow=o.receiveShadow=true;group.add(o);return o}
  function curve(points,r,mat,group){return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),48,r,6,false),mat,group)}
  function shape(points){const s=new THREE.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();return s}
  function cap(name,color,thread,y,rotation) {
    const cap=new THREE.Group();cap.name=name;cap.position.set(0,y,-y*.09);cap.rotation.y=rotation;root.add(cap)
    const cloth=material(color),seam=material(color).clone();seam.color.multiplyScalar(.7)
    // An open six-panel crown, with a slight squared front rather than a solid sphere.
    const crown=new THREE.SphereGeometry(1,64,32,0,Math.PI*2,0,Math.PI/2),p=crown.attributes.position
    for(let i=0;i<p.count;i++)p.setXYZ(i,p.getX(i)*.62,Math.pow(Math.max(0,p.getY(i)),.72)*.72,p.getZ(i)*.56)
    crown.computeVertexNormals();cloth.side=THREE.DoubleSide;mesh(crown,cloth,cap)
    for(let panel=0;panel<6;panel++) {
      const a=panel*Math.PI/3,pts=[]
      for(let j=0;j<=32;j++){const t=j*Math.PI/64;pts.push(new THREE.Vector3(.624*Math.sin(t)*Math.sin(a),.724*Math.pow(Math.cos(t),.72),.564*Math.sin(t)*Math.cos(a)))}
      curve(pts,.005,seam,cap)
    }
    const button=mesh(new THREE.SphereGeometry(.058,20,12),cloth,cap);button.scale.y=.4;button.position.y=.729
    const band=mesh(new THREE.CylinderGeometry(.615,.615,.045,64,1,true),seam,cap);band.scale.z=.56/.615;band.position.y=.017
    // Flat broad visor, with a restrained bend and real thickness at the rim.
    const vertices=[],uvs=[],indices=[],cols=48,rows=12
    function brimPoint(u,v) {const a=(u-.5)*2.5;const x=Math.sin(a)*(.61+v*.065),z=Math.cos(a)*.53+v*.38;return new THREE.Vector3(x,-.012-.035*(x/.72)**2-.016*v,z)}
    for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){vertices.push(...brimPoint(i/cols,j/rows).toArray());uvs.push(i/cols,j/rows);if(i<cols&&j<rows){const a=j*(cols+1)+i,b=a+cols+1;indices.push(a,b,a+1,a+1,b,b+1)}}
    const visor=new THREE.BufferGeometry();visor.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));visor.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));visor.setIndex(indices);visor.computeVertexNormals();mesh(visor,cloth,cap)
    const under=mesh(visor,material('#4b4d42',{side:THREE.BackSide}),cap);under.position.y=-.018
    const edge=[];for(let i=0;i<=48;i++)edge.push(brimPoint(i/48,1));curve(edge,.012,cloth,cap)
    for(const v of [.72,.81,.9]){const pts=[];for(let i=0;i<=48;i++)pts.push(brimPoint(i/48,v).add(new THREE.Vector3(0,.003,0)));curve(pts,.0015,seam,cap)}
    // Gold oval sizing sticker on the visor.
    const sticker=mesh(new THREE.CircleGeometry(.105,40),material('#b49845',{metalness:.55,roughness:.4,side:THREE.DoubleSide}),cap);sticker.rotation.x=-Math.PI/2;sticker.scale.y=.68;sticker.position.set(.05,-.019,.72)
    const ring=mesh(new THREE.RingGeometry(.085,.098,40),material('#302b19',{side:THREE.DoubleSide}),cap);ring.rotation.copy(sticker.rotation);ring.scale.copy(sticker.scale);ring.position.copy(sticker.position);ring.position.y+=.002
    for(let i=0;i<3;i++){const mark=mesh(new THREE.BoxGeometry(.092-i*.018,.002,.008),material('#39331e'),cap);mark.position.set(.05,-.015,.70+i*.017)}
    const embroidery=material(thread,{roughness:.7}),outline=material(name==='blue-longshot-cap'?'#e7dfb9':'#732331')
    // Project the shallow relief onto the curved fabric; all letters stay raised off the crown.
    function embroider(s,x,y,scale,mat,depth=.006) {
      const relief=new THREE.ExtrudeGeometry(s,{depth:depth*.4,bevelEnabled:true,bevelSize:.001,bevelThickness:.0007,bevelSegments:1,steps:1})
      // Subdivide before wrapping: long flat triangles otherwise sink into the fabric.
      const geo=new TessellateModifier(.075,6).modify(relief)
      relief.dispose()
      const pos=geo.attributes.position
      for(let i=0;i<pos.count;i++){
        const px=pos.getX(i)*scale+x,py=pos.getY(i)*scale+y
        const radius=Math.sqrt(Math.max(.01,1-Math.pow(py/.72,2/.72)))
        const z=.56*Math.sqrt(Math.max(.01,radius*radius-(px/.62)**2))
        pos.setXYZ(i,px,py,z+.008+pos.getZ(i))
      }
      geo.computeVertexNormals();return mesh(geo,mat,cap)
    }
    function letter(char,x,y) {
      const parts=glyphs[char],s=shape(parts[0])
      if(char==='O')s.holes.push(shape(parts[1]))
      embroider(s,x,y,.19,embroidery)
      if(char!=='O')for(const poly of parts.slice(1))embroider(shape(poly),x,y,.19,embroidery)
    }
    for(const [c,x] of [['L',-.48],['N',-.37],['G',-.23],['H',.15],['O',.28],['T',.40]])letter(c,x,.22)
    // Interlocking S and compass motif between LNG and HOT, as in both references.
    const emblem=[[-.08,.02],[-.13,.12],[-.09,.2],[.005,.15],[.045,.18],[.04,.25],[-.055,.29],[-.11,.37],[-.1,.49],[-.025,.55],[.085,.52],[.12,.43],[.08,.36],[.035,.44],[-.015,.45],[-.04,.41],[-.02,.36],[.07,.32],[.115,.25],[.11,.12],[.035,.025]]
    embroider(shape(emblem),0,.14,.77,outline,.009)
    const center=emblem.map(([x,y])=>[x*.83,(y-.28)*.89+.28]);embroider(shape(center),0,.14,.77,embroidery,.014)
    const compass=shape([[0,.49],[.018,.32],[.13,.29],[.022,.27],[0,.08],[-.018,.27],[-.13,.29],[-.02,.32]])
    embroider(compass,0,.14,.77,material(name==='blue-longshot-cap'?'#172d51':'#9c2636'),.022)
    // Embroidered ventilation eyelets.
    for(const x of [-.29,.29]){const eye=mesh(new THREE.TorusGeometry(.018,.005,6,16),seam,cap);eye.position.set(x,.56,.34);eye.rotation.x=-.4}
    return cap
  }
  const lower=cap('red-longshot-cap','#a62431','#ece4d5',0,.035)
  // The soft lower crown compresses inside the upper cap; visors remain outside each other.
  lower.scale.y=.56
  cap('blue-longshot-cap','#134aa5','#c8a35c',.34,-.015)
  // Set the lowest visor edge directly on the supporting surface.
  root.updateWorldMatrix(true,true)
  let minimum=Infinity
  root.traverse(o=>{
    if(!o.geometry)return
    const p=o.geometry.attributes.position
    const transform=new THREE.Matrix4().copy(root.matrixWorld).invert().multiply(o.matrixWorld)
    for(let i=0;i<p.count;i++)minimum=Math.min(minimum,new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(transform).y)
  })
  for(const child of root.children)child.position.y-=minimum
  root.userData.layoutRevision='compact-caps-v3'
  return root
}
