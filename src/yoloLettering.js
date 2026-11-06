import * as THREE from 'three'

// Drawn letter-by-letter, not typeset: irregular marker strokes on a transparent surface.
export function addYoloLettering(parent,textures) {
  const paths={
    Y:[[[.04,.03],[.34,.48],[.70,-.02]],[[.34,.48],[.25,1.02]]],
    O:[[[.40,.01],[.16,.07],[.04,.38],[.10,.83],[.31,1],[.62,.88],[.73,.46],[.61,.10],[.40,.01]]],
    L:[[[.15,.01],[.06,.98],[.68,.90]]],
    U:[[[.10,0],[.04,.68],[.16,.94],[.39,1],[.60,.80],[.72,.02]]],
    N:[[[.04,1],[.13,.02],[.62,.97],[.73,-.01]]],
    I:[[[.16,.02],[.60,-.01]],[[.38,.02],[.28,.99]],[[.05,1],[.51,.97]]],
    V:[[[.05,.03],[.27,1],[.73,-.01]]],
    E:[[[.69,.02],[.14,.09],[.05,.99],[.65,.91]],[[.12,.51],[.53,.47]]],
    C:[[[.70,.12],[.47,0],[.20,.12],[.04,.52],[.12,.85],[.37,1],[.64,.87]]],
  }
  const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=520
  const c=canvas.getContext('2d');c.lineCap='round';c.lineJoin='round'
  let seed=902;const random=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646}
  function write(text,x,y,w,h,color,thickness) {
    for(const char of text){
      if(char===' '){x+=w*.6;continue}
      const dy=(random()-.5)*h*.1,lean=(random()-.5)*.12
      for(const path of paths[char])for(let pass=0;pass<5;pass++){
        c.strokeStyle=color;c.lineWidth=thickness*(pass===0?1:.38+random()*.28)
        const jitter=pass===0?0:thickness*.25
        c.beginPath()
        path.forEach(([px,py],i)=>{
          const xx=x+(px+lean*py)*w+(random()-.5)*jitter,yy=y+py*h+dy+(random()-.5)*jitter
          i?c.lineTo(xx,yy):c.moveTo(xx,yy)
        });c.stroke()
      }
      x+=w
    }
  }
  write('YOLO',90,65,270,280,'#ed286c',29)
  write('YOU ONLY LIVE ONCE',135,413,57,54,'#efa9ad',5)
  // Scuffed dry paint: the door grain remains visible between and inside strokes.
  c.globalCompositeOperation='destination-out'
  for(let i=0;i<17000;i++){c.fillStyle=`rgba(0,0,0,${.15+random()*.6})`;c.fillRect(random()*1200,random()*520,.6+random()*2.5,.4+random()*3)}
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4;textures.push(map)
  const material=new THREE.MeshStandardMaterial({map,transparent:true,alphaTest:.03,depthWrite:false,roughness:.95,emissiveMap:map,emissive:'#ffffff',emissiveIntensity:.10})
  const root=new THREE.Group();root.name='yolo-wall-lettering';root.position.set(1.4,1.28,.169);root.rotation.z=.025;root.userData.layoutRevision='brown-door-v1'
  const ink=new THREE.Mesh(new THREE.PlaneGeometry(1.8,.78),material);ink.receiveShadow=true;root.add(ink);parent.add(root)
  return root
}
