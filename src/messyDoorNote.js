import * as THREE from 'three'

export function addMessyDoorNote(hinge,textures) {
  const canvas=document.createElement('canvas');canvas.width=1400;canvas.height=260
  const ctx=canvas.getContext('2d');ctx.lineCap='round';ctx.lineJoin='round'
  const glyphs={
    i:[[[.27,.43],[.20,.95],[.35,.91]],[[.30,.15],[.31,.16]]],
    d:[[[.49,.50],[.30,.42],[.10,.57],[.08,.84],[.24,.97],[.45,.81],[.57,.02],[.48,.85],[.59,.96]]],
    k:[[[.19,.98],[.29,.03]],[[.66,.40],[.24,.70],[.55,.98]]],
    c:[[[.59,.48],[.36,.41],[.13,.57],[.10,.84],[.31,.97],[.59,.86]]],
    g:[[[.61,.46],[.35,.41],[.11,.61],[.14,.87],[.37,.92],[.59,.61],[.49,1.15],[.27,1.30],[.08,1.18]]],
    a:[[[.57,.49],[.32,.42],[.11,.62],[.12,.88],[.31,.96],[.52,.73],[.59,.45],[.51,.89],[.66,.96]]],
    f:[[[.67,.09],[.49,.02],[.33,.20],[.20,1.14]],[[.08,.54],[.64,.46]]],
    '.':[[[.24,.93],[.25,.95]]],
  }
  let seed=318;const random=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483647}
  let x=48
  for(const char of 'idk. idc. idgaf.') {
    if(char===' '){x+=43;continue}
    const advance=char==='.'?38:88,dy=(random()-.5)*15,slant=(random()-.5)*.15
    for(const path of glyphs[char])for(let pass=0;pass<3;pass++){
      ctx.strokeStyle=pass?'rgba(234,224,205,.7)':'#eae0cd';ctx.lineWidth=pass?5+random()*3:9
      ctx.beginPath();path.forEach(([px,py],i)=>{const xx=x+(px+slant*py)*88+(random()-.5)*2,yy=30+py*152+dy+(random()-.5)*2;i?ctx.lineTo(xx,yy):ctx.moveTo(xx,yy)});ctx.stroke()
    }
    x+=advance
  }
  ctx.globalCompositeOperation='destination-out'
  for(let i=0;i<9500;i++){ctx.fillStyle=`rgba(0,0,0,${random()*.65})`;ctx.fillRect(random()*1400,random()*260,.6+random()*2,.6+random()*2.5)}
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4;textures.push(map)
  const material=new THREE.MeshStandardMaterial({map,transparent:true,alphaTest:.03,depthWrite:false,roughness:1})
  const note=new THREE.Group();note.name='idk-idc-idgaf-door-note';note.position.set(1.36,2.69,.17);note.rotation.z=-.018
  const ink=new THREE.Mesh(new THREE.PlaneGeometry(1.90,.353),material);ink.receiveShadow=true;note.add(ink);hinge.add(note)
  return note
}
