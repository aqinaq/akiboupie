import * as THREE from 'three'

export function buildKaijuToy(parent) {
  const toy=new THREE.Group();toy.name='blue-flame-kaiju-toy';parent.add(toy)
  const material=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.27,metalness:.03,...extra})
  const ivory=material('#e3e9df'),blue=material('#073b9d'),cyan=material('#75c5db'),red=material('#cb1532'),spine=material('#bfcbd0')
  function mesh(g,m,p=toy){const o=new THREE.Mesh(g,m);o.castShadow=o.receiveShadow=true;p.add(o);return o}
  function oval(x,y,z,sx,sy,sz,m=ivory,p=toy){const o=mesh(new THREE.SphereGeometry(1,32,24),m,p);o.position.set(x,y,z);o.scale.set(sx,sy,sz);return o}
  function tube(points,r,m,p=toy){return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(v=>new THREE.Vector3(...v))),40,r,7,false),m,p)}
  // Rounded vinyl proportions: a large feline head, belly, short legs and broad feet.
  const belly=oval(0,.77,0,.34,.52,.29)
  oval(0,1.13,-.015,.29,.3,.25)
  const head=oval(0,1.43,.045,.43,.39,.35)
  for(const side of [-1,1]) {
    const thigh=oval(side*.255,.43,.015,.225,.31,.235)
    oval(side*.23,.215,.055,.16,.20,.18)
    oval(side*.24,.095,.13,.195,.095,.25)
    for(let n=0;n<3;n++)oval(side*.24+(n-1)*.095,.068,.325,.055,.062,.075)
    // Forward-reaching bent paws with softly molded fingers.
    const arm=oval(side*.35,.99,.075,.14,.23,.145);arm.rotation.z=side*.45
    oval(side*.46,.96,.22,.16,.13,.19)
    for(let n=0;n<3;n++)oval(side*.46+(n-1)*.065,.89,.34,.05,.075,.065)
    tattoo(thigh,[[0,-.1,.72],[.38,.42,.35],[-.4,.4,.35]])
    tattoo(arm,[[0,.12,.65]])
    // Pointed, thick cat ears with recessed red interiors.
    const ear=new THREE.Shape();ear.moveTo(-.13,0);ear.quadraticCurveTo(-.15,.18,-.06,.4);ear.quadraticCurveTo(.02,.46,.1,.1);ear.lineTo(.13,0);ear.closePath()
    const outer=mesh(new THREE.ExtrudeGeometry(ear,{depth:.09,bevelEnabled:true,bevelThickness:.025,bevelSize:.02,bevelSegments:3,steps:1,curveSegments:16}),ivory)
    outer.position.set(side*.27,1.64,.04);outer.rotation.z=-side*.34
    const inner=new THREE.Shape();inner.moveTo(-.085,.075);inner.quadraticCurveTo(-.085,.22,-.045,.34);inner.quadraticCurveTo(.005,.34,.063,.08);inner.closePath()
    const inset=mesh(new THREE.ShapeGeometry(inner,16),red,outer);inset.position.z=.119
    oval(side*.195,1.48,.337,.105,.135,.029,cyan)
    const pupil=oval(side*.199,1.49,.36,.043,.091,.019,blue);pupil.rotation.z=-side*.15
    oval(side*.18,1.523,.378,.014,.024,.008,ivory)
  }
  // Small smiling mouth, two muzzle pads, red nose and tiny molded fangs.
  oval(0,1.225,.316,.15,.103,.052,red)
  oval(-.09,1.315,.356,.139,.084,.09);oval(.09,1.315,.356,.139,.084,.09)
  oval(0,1.35,.435,.052,.03,.023,red)
  for(const side of [-1,1]){const fang=mesh(new THREE.ConeGeometry(.024,.065,12),ivory);fang.rotation.z=Math.PI;fang.position.set(side*.085,1.24,.366)}
  // A tapering swept tail curls out from the back; the tip fades into cobalt blue.
  const path=new THREE.CatmullRomCurve3([new THREE.Vector3(0,.42,-.18),new THREE.Vector3(-.12,.3,-.43),new THREE.Vector3(-.48,.23,-.56),new THREE.Vector3(-.72,.33,-.49),new THREE.Vector3(-.83,.55,-.38)])
  const tailGeo=new THREE.TubeGeometry(path,64,1,16,false),pos=tailGeo.attributes.position,colors=[]
  for(let i=0;i<pos.count;i++){
    const t=Math.floor(i/17)/64,center=path.getPointAt(t),p=new THREE.Vector3().fromBufferAttribute(pos,i)
    p.sub(center).multiplyScalar(.13*Math.pow(1-t,.6)+.005).add(center);pos.setXYZ(i,p.x,p.y,p.z)
    const color=new THREE.Color('#e3e9df').lerp(new THREE.Color('#46b6df'),THREE.MathUtils.smoothstep(t,.5,.83)).lerp(new THREE.Color('#073b9d'),THREE.MathUtils.smoothstep(t,.8,1));colors.push(color.r,color.g,color.b)
  }
  tailGeo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));tailGeo.computeVertexNormals();mesh(tailGeo,material('#ffffff',{vertexColors:true}))
  // Small dorsal plates follow the back, continuing behind the crown of the head.
  for(let i=0;i<9;i++){
    const y=.47+i*.14,z=y>1.15?-.19:-.29
    const plate=mesh(new THREE.ConeGeometry(.10,.19,4),spine);plate.position.set(0,y,z);plate.rotation.x=-Math.PI/2;plate.rotation.z=Math.PI/4
  }
  // Raised cobalt flame/tribal swirls follow the curved surfaces without floating above them.
  function tattoo(surface,patches) {
    for(const [cx,cy,size] of patches){
      function project(points){return points.map(([x,y])=>{const px=cx+x*size,py=cy+y*size;return [px,py,Math.sqrt(Math.max(.015,1-px*px-py*py))+.012]})}
      const spiral=[]
      for(let i=0;i<=22;i++){const t=i/22,a=t*Math.PI*2.0,r=.30*(1-t)+.035;spiral.push([Math.cos(a)*r,Math.sin(a)*r])}
      tube(project(spiral),.038*size,blue,surface)
      for(const angle of [-.4,1.7,3.7]){
        const points=[[.12,0],[.29,.06],[.38,.24],[.31,.39],[.35,.55]].map(([x,y])=>[x*Math.cos(angle)-y*Math.sin(angle),x*Math.sin(angle)+y*Math.cos(angle)])
        tube(project(points),.038*size,blue,surface)
      }
    }
  }
  tattoo(belly,[[-.4,.4,.47],[.37,.48,.45],[0,-.05,.65],[-.46,-.43,.42],[.42,-.47,.46]])
  tattoo(head,[[-.57,.18,.44],[.06,.65,.34],[.58,.56,.30]])
  toy.scale.setScalar(.57);toy.rotation.y=-.35
  return toy
}
