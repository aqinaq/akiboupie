import * as THREE from 'three'

// Circular enamel sign; the artwork itself is shaped geometry, with no photo background.
export function buildRoundSign(parent, grain) {
  const sign=new THREE.Group();sign.name='round-guitar-sign';sign.position.set(7.8,7.85,-.07);sign.rotation.z=.025;parent.add(sign)
  const mat=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.7,metalness:.22,bumpMap:grain,bumpScale:.002,...extra})
  const blue=mat('#1647a4'),rim=mat('#d1c5ab',{metalness:.65,roughness:.4}),back=mat('#55534d',{metalness:.7}),red=mat('#843832'),cream=mat('#e9dcc1'),ink=mat('#565342')
  function mesh(geo,material){const m=new THREE.Mesh(geo,material);m.castShadow=m.receiveShadow=true;sign.add(m);return m}
  const body=mesh(new THREE.CylinderGeometry(.7,.7,.038,96),back);body.rotation.x=Math.PI/2
  mesh(new THREE.CircleGeometry(.678,96),blue).position.z=.021
  mesh(new THREE.RingGeometry(.675,.699,96),rim).position.z=.024
  const lip=mesh(new THREE.TorusGeometry(.698,.009,8,96),back);lip.position.z=.012
  const scale=.00188
  const point=(x,y)=>new THREE.Vector2((x-360)*scale,(350-y)*scale)
  function polygon(coords,z,material){const shape=new THREE.Shape();coords.forEach(([x,y],i)=>{const p=point(x,y);i?shape.lineTo(p.x,p.y):shape.moveTo(p.x,p.y)});shape.closePath();const m=mesh(new THREE.ShapeGeometry(shape),material);m.position.z=z;return m}
  // Legs and arm pass behind the guitar-shaped directional arrow.
  polygon([[244,371],[283,427],[302,516],[176,532],[175,558],[326,562],[340,545],[324,428],[286,354]],.025,red)
  polygon([[328,367],[383,408],[425,432],[401,562],[430,567],[454,438],[455,409],[365,352]],.026,red)
  polygon([[341,371],[411,400],[472,397],[538,370],[551,326],[549,306],[536,309],[531,329],[516,335],[517,361],[458,378],[383,347]],.027,red)
  polygon([[255,137],[234,172],[228,236],[232,323],[258,340],[275,333],[268,319],[258,321],[258,304],[266,294],[268,311],[276,303],[270,279],[253,257],[263,193],[290,181],[333,204],[367,239],[407,254],[421,225],[360,192]],.027,red)
  const head=mesh(new THREE.CircleGeometry(48*scale,48),red);const hp=point(450,245);head.position.set(hp.x,hp.y,.028)
  // Arrow body doubles as the guitar, with its neck and four tuning keys.
  polygon([[73,316],[321,178],[342,173],[351,185],[330,280],[419,282],[440,294],[470,288],[638,289],[641,369],[329,364],[349,449],[346,465],[333,469]],.029,cream)
  // Bring the gripping hand back over the instrument.
  polygon([[232,233],[233,323],[258,339],[275,333],[268,319],[258,321],[258,303],[266,294],[268,311],[276,303],[270,279],[253,257]],.031,red)
  polygon([[518,366],[526,347],[527,333],[537,328],[540,310],[548,307],[554,314],[550,348],[543,371]],.031,red)
  function line(coords,z,width,material){const pts=coords.map(([x,y])=>{const p=point(x,y);return new THREE.Vector3(p.x,p.y,z)});return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),20,width,5,false),material)}
  for(let i=0;i<4;i++) {
    const y=288+i*16
    line([[171,y],[224,y+4]],.032,.0013,ink)
    const pin=mesh(new THREE.TorusGeometry(.006,.001,5,12),ink),p=point(171,y);pin.position.set(p.x,p.y,.032)
  }
  line([[182,276],[162,276],[162,347],[185,347]],.032,.0014,ink)
  for(const x of [572,610])for(const y of [278,379]){
    const peg=mesh(new THREE.CircleGeometry(.011,16),cream),p=point(x,y);peg.scale.x=1.35;peg.position.set(p.x,p.y,.031)
    line([[x,y],[x,y<300?294:365]],.03,.0035,cream)
  }
  // Small mounting rivets and a stand-off make the edge cast a real wall shadow.
  for(const y of [-.61,.61]){const rivet=mesh(new THREE.SphereGeometry(.008,10,8),rim);rivet.scale.z=.4;rivet.position.set(0,y,.027)}
  const mount=mesh(new THREE.BoxGeometry(.13,.5,.055),back);mount.position.z=-.035
  return sign
}
