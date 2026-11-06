import * as THREE from 'three'

export function buildNewYorkPlate(parent,textures,grain) {
  const root=new THREE.Group();root.name='new-york-metal-plate';root.position.set(-2.8,8.05,-.09);root.rotation.z=.018;parent.add(root)
  const mat=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.38,metalness:.45,bumpMap:grain,bumpScale:.0015,...extra})
  const gold=mat('#efb20b'),navy=mat('#142954'),black=mat('#141414'),red=mat('#df1521'),edge=mat('#b8b4a3',{metalness:.8,roughness:.3})
  function mesh(g,m,z=0){const o=new THREE.Mesh(g,m);o.position.z=z;o.castShadow=o.receiveShadow=true;root.add(o);return o}
  function rounded(w,h,r,x=0,y=0){const s=new THREE.Shape();s.moveTo(x-w/2+r,y-h/2);s.lineTo(x+w/2-r,y-h/2);s.quadraticCurveTo(x+w/2,y-h/2,x+w/2,y-h/2+r);s.lineTo(x+w/2,y+h/2-r);s.quadraticCurveTo(x+w/2,y+h/2,x+w/2-r,y+h/2);s.lineTo(x-w/2+r,y+h/2);s.quadraticCurveTo(x-w/2,y+h/2,x-w/2,y+h/2-r);s.lineTo(x-w/2,y-h/2+r);s.quadraticCurveTo(x-w/2,y-h/2,x-w/2+r,y-h/2);return s}
  const slots=[];for(const x of [-.55,.55])for(const y of [-.385,.385])slots.push(rounded(.16,.045,.022,x,y))
  const plate=rounded(1.9,.95,.085);plate.holes.push(...slots)
  mesh(new THREE.ExtrudeGeometry(plate,{depth:.022,bevelEnabled:true,bevelSize:.006,bevelThickness:.004,bevelSegments:3,steps:1}),gold)
  const trim=rounded(1.9,.95,.085);trim.holes.push(rounded(1.875,.925,.075));mesh(new THREE.ShapeGeometry(trim),edge,.027)
  const rim=rounded(1.864,.914,.07);rim.holes.push(rounded(1.845,.895,.06));mesh(new THREE.ShapeGeometry(rim),navy,.029)
  const header=new THREE.Shape();header.moveTo(-.925,.232);header.quadraticCurveTo(0,.36,.925,.232);header.lineTo(.925,.385);header.quadraticCurveTo(.925,.45,.86,.45);header.lineTo(-.86,.45);header.quadraticCurveTo(-.925,.45,-.925,.385);header.closePath();header.holes.push(slots[1],slots[3]);mesh(new THREE.ShapeGeometry(header,32),navy,.028)
  const bottom=rounded(1.82,.025,.01,0,-.443);mesh(new THREE.ShapeGeometry(bottom),navy,.028)
  function print(text,color,width,height,x,y,size,font='Georgia') {
    const c=document.createElement('canvas');c.width=1024;c.height=160;const ctx=c.getContext('2d');ctx.fillStyle=color;ctx.font=`bold ${size}px ${font}`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,512,82,1000)
    const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;textures.push(t)
    const m=mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshStandardMaterial({map:t,transparent:true,alphaTest:.05,roughness:.45,metalness:.25}),.039);m.position.x=x;m.position.y=y
  }
  print('NEW YORK','#f8c327',.91,.125,0,.355,130)
  print('EMPIRE STATE','#142954',.89,.1,0,-.34,126)
  print('NOT FOR OFFICIAL USE','#292514',.22,.025,-.73,-.335,74,'Arial')
  print('®','#171713',.055,.055,.80,-.18,145,'Arial')
  // Actual beveled I / NY and heart relief reproduce the stamped face of the souvenir plate.
  function polygon(points){const s=new THREE.Shape();points.forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();return s}
  function raised(shape,material){return mesh(new THREE.ExtrudeGeometry(shape,{depth:.008,bevelEnabled:true,bevelSize:.007,bevelThickness:.004,bevelSegments:3,steps:1,curveSegments:32}),material,.03)}
  const I=polygon([[-.80,.19],[-.61,.19],[-.61,.15],[-.66,.13],[-.66,-.15],[-.61,-.17],[-.61,-.21],[-.80,-.21],[-.80,-.17],[-.75,-.15],[-.75,.13],[-.80,.15]])
  raised(I,black)
  const heart=new THREE.Shape();heart.moveTo(-.31,-.235);heart.bezierCurveTo(-.64,-.04,-.57,.32,-.31,.17);heart.bezierCurveTo(-.08,.35,.02,-.03,-.31,-.235);raised(heart,red)
  raised(polygon([[.02,-.21],[.19,-.21],[.19,-.17],[.14,-.15],[.14,.10],[.36,-.21],[.46,-.21],[.46,.13],[.51,.15],[.51,.19],[.34,.19],[.34,.15],[.39,.13],[.39,-.09],[.19,.19],[.02,.19],[.02,.15],[.07,.13],[.07,-.15],[.02,-.17]]),black)
  raised(polygon([[.49,.19],[.68,.19],[.68,.15],[.64,.14],[.72,.015],[.80,.14],[.76,.15],[.76,.19],[.9,.19],[.9,.15],[.86,.13],[.76,-.025],[.76,-.15],[.81,-.17],[.81,-.21],[.59,-.21],[.59,-.17],[.65,-.15],[.65,-.025],[.54,.13],[.49,.15]]),black)
  return root
}
