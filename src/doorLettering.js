import * as THREE from 'three'
import { DecalGeometry } from 'three/addons/geometries/DecalGeometry.js'

// Hand-painted letter strokes, on transparent canvas: no photograph or paper rectangle.
const strokes = {
  N:[[[.08,.95],[.1,.08],[.65,.93],[.7,.04]]],
  O:[[[.4,.04],[.15,.12],[.06,.42],[.12,.84],[.35,.96],[.64,.84],[.72,.48],[.63,.16],[.4,.04]]],
  S:[[[.67,.13],[.44,.04],[.16,.18],[.12,.4],[.56,.58],[.65,.75],[.47,.95],[.08,.9]]],
  L:[[[.18,.04],[.07,.94],[.67,.91]]],
  E:[[[.69,.06],[.16,.12],[.09,.94],[.66,.9]],[[.13,.53],[.56,.49]]],
  X:[[[.1,.06],[.62,.94]],[[.69,.04],[.07,.95]]],
  I:[[[.36,.06],[.25,.94]]],
  T:[[[.04,.13],[.74,.04]],[[.4,.1],[.28,.96]]],
  A:[[[.02,.96],[.43,.05],[.69,.94]],[[.16,.64],[.57,.61]]],
  V:[[[.06,.06],[.27,.94],[.73,.02]]],
  ',':[[[.34,.84],[.24,1.1]]],
}
export function addDoorLettering(door, textures) {
  const canvas=document.createElement('canvas');canvas.width=1280;canvas.height=800
  const ctx=canvas.getContext('2d')
  let seed=517;const random=()=>{seed=seed*16807%2147483647;return (seed-1)/2147483646}
  function wordLine(text,y,height,advance) {
    let x=(canvas.width-text.length*advance)/2
    for(const char of text) {
      if(char===' '){x+=advance;continue}
      ctx.save();ctx.translate(x,y+(random()-.5)*12);ctx.rotate((random()-.5)*.065)
      ctx.lineCap='round';ctx.lineJoin='round'
      for(const points of strokes[char]||[]) {
        // Repeated imperfect bristles soften the edges without making uniform font outlines.
        for(let pass=0;pass<9;pass++) {
          ctx.strokeStyle=pass===0?'#191916':'rgba(22,22,19,.65)'
          ctx.lineWidth=pass===0?height*.105:height*(.07+random()*.035)
          ctx.beginPath()
          points.forEach(([px,py],i)=>{const xx=px*advance+(random()-.5)*5,yy=py*height+(random()-.5)*4;i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy)})
          ctx.stroke()
        }
      }
      ctx.restore();x+=advance
    }
  }
  wordLine('NO SOLO',50,174,143)
  wordLine('EXISTAS,',302,176,140)
  wordLine('VIVE',553,182,160)
  // Tiny transparent breaks let the ivory grain show through the dry black paint.
  ctx.globalCompositeOperation='destination-out'
  for(let i=0;i<11000;i++){ctx.fillStyle=`rgba(0,0,0,${.15+random()*.55})`;ctx.fillRect(random()*1280,random()*800,.5+random()*2.1,.5+random()*3.5)}
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;textures.push(texture)
  const material=new THREE.MeshStandardMaterial({map:texture,transparent:true,alphaTest:.06,depthWrite:false,roughness:1,polygonOffset:true,polygonOffsetFactor:-4})
  door.group.updateWorldMatrix(true,true)
  const origin=door.group.localToWorld(new THREE.Vector3(0,4.05,.22))
  const rotation=new THREE.Euler().setFromQuaternion(door.group.getWorldQuaternion(new THREE.Quaternion()))
  for(const {node:hinge} of door.hinges) {
    const surfaces=[];hinge.traverse(o=>{if(o.isMesh)surfaces.push(o)})
    const ink=new THREE.Group();ink.name='painted-no-solo-existas-vive';hinge.add(ink)
    const inverse=new THREE.Matrix4().copy(hinge.matrixWorld).invert()
    for(const surface of surfaces) {
      const geo=new DecalGeometry(surface,origin,rotation,new THREE.Vector3(2.62,1.52,.28))
      if(!geo.attributes.position.count){geo.dispose();continue}
      geo.applyMatrix4(inverse)
      const decal=new THREE.Mesh(geo,material);decal.receiveShadow=true;decal.renderOrder=2;ink.add(decal)
    }
  }
}
