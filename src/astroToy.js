import * as THREE from 'three'

export function buildAstroToy(parent) {
  const toy=new THREE.Group();toy.name='astro-boy-toy';parent.add(toy)
  const material=color=>new THREE.MeshStandardMaterial({color,roughness:.36,metalness:.015})
  const skin=material('#e3ab73'),black=material('#171b1d'),red=material('#a8202c'),white=material('#f1eee3'),belt=material('#23554a')
  function mesh(g,m,p=toy){const o=new THREE.Mesh(g,m);o.castShadow=o.receiveShadow=true;p.add(o);return o}
  function oval(x,y,z,sx,sy,sz,m=skin){const o=mesh(new THREE.SphereGeometry(1,32,24),m);o.position.set(x,y,z);o.scale.set(sx,sy,sz);return o}
  function limb(a,b,r1,r2,m=skin){const from=new THREE.Vector3(...a),to=new THREE.Vector3(...b),d=to.clone().sub(from);const o=mesh(new THREE.CylinderGeometry(r2,r1,d.length(),24),m);o.position.copy(from).add(to).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());oval(...a,r1,r1,r1,m);oval(...b,r2,r2,r2,m);return o}
  function line(points,r=.009,m=black){return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),24,r,6,false),m)}
  // Wide stance and substantial molded red boots keep the figure visibly supported.
  for(const s of [-1,1]){
    limb([s*.12,1.04,0],[s*.235,.68,.015],.13,.135)
    limb([s*.235,.66,.015],[s*.30,.22,.065],.145,.16,red)
    oval(s*.24,.65,.015,.177,.072,.17,red)
    oval(s*.31,.115,.13,.218,.115,.28,red)
    oval(s*.31,.039,.13,.216,.027,.275,red)
  }
  oval(0,1.08,0,.235,.23,.15,black)
  oval(0,1.43,0,.23,.30,.16)
  const waistband=mesh(new THREE.CylinderGeometry(.232,.225,.085,40),belt);waistband.scale.z=.7;waistband.position.y=1.23
  for(const x of [-.14,-.08,.08,.14]){const stripe=mesh(new THREE.BoxGeometry(.021,.079,.012),white);stripe.position.set(x,1.23,.143)}
  limb([0,1.64,0],[0,1.78,0],.085,.09)
  // Black rounded hair shell and a softly rounded peach face.
  oval(0,2.02,-.045,.36,.39,.28,black)
  oval(0,1.98,.075,.326,.335,.255)
  for(const s of [-1,1])oval(s*.325,1.91,.035,.062,.095,.061)
  // Pointed cowlick and central widow's peak are shaped, solid hair pieces.
  function hairSpike(points,radii){
    const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)))
    const geo=new THREE.TubeGeometry(curve,32,1,20,false),p=geo.attributes.position
    for(let i=0;i<p.count;i++){
      const t=Math.floor(i/21)/32,center=curve.getPointAt(t),v=new THREE.Vector3().fromBufferAttribute(p,i)
      const radius=radii[0]*(1-t)+radii[1]*t
      v.sub(center).multiplyScalar(radius).add(center);p.setXYZ(i,v.x,v.y,v.z)
    }
    geo.computeVertexNormals();mesh(geo,black)
  }
  hairSpike([[-.23,2.25,-.04],[-.23,2.39,-.03],[-.24,2.58,-.02]],[.105,.002])
  hairSpike([[.28,2.05,-.11],[.37,2.075,-.13],[.41,2.13,-.14]],[.09,.002])
  const peak=new THREE.Shape();peak.moveTo(-.14,2.285);peak.quadraticCurveTo(0,2.36,.14,2.285);peak.lineTo(0,2.17);peak.closePath()
  const fringe=mesh(new THREE.ExtrudeGeometry(peak,{depth:.045,bevelEnabled:true,bevelThickness:.009,bevelSize:.009,bevelSegments:2,steps:1}),black);fringe.position.z=.215
  for(const s of [-1,1]){
    oval(s*.143,2.055,.287,.077,.126,.027,white)
    oval(s*.145,2.03,.310,.047,.092,.015,black)
    oval(s*.13,2.067,.324,.014,.021,.007,white)
    line([[s*.073,2.19,.266],[s*.14,2.235,.254],[s*.207,2.20,.245]],.009)
    for(let i=0;i<3;i++)line([[s*(.115+i*.032),2.166-i*.009,.287],[s*(.12+i*.042),2.195-i*.008,.277]],.005)
  }
  oval(0,1.91,.33,.036,.043,.039)
  // Crossed forward arms: left index up, right fingers pointing down.
  limb([-.21,1.59,0],[-.30,1.46,.15],.115,.105)
  limb([-.30,1.46,.15],[-.19,1.41,.33],.105,.11)
  oval(-.19,1.43,.35,.15,.13,.105)
  for(let i=0;i<3;i++)oval(-.29+i*.065,1.415,.425,.043,.073,.042)
  limb([-.115,1.45,.39],[-.105,1.72,.39],.038,.038)
  limb([.215,1.61,-.005],[.29,1.58,.12],.12,.105)
  limb([.29,1.58,.12],[.15,1.48,.35],.105,.115)
  oval(.14,1.43,.36,.13,.14,.1)
  limb([.075,1.40,.405],[.045,1.19,.43],.037,.035)
  limb([.17,1.40,.405],[.21,1.19,.43],.037,.035)
  for(const x of [.21,.265])oval(x,1.40,.415,.035,.07,.038)
  toy.scale.setScalar(.32);toy.rotation.y=-.22;toy.position.set(0,3.663,.10)
  return toy
}
