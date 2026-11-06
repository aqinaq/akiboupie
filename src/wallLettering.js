import * as THREE from 'three'

export function addWallLettering(parent, textures) {
  const canvas=document.createElement('canvas');canvas.width=800;canvas.height=1120
  const c=canvas.getContext('2d')
  c.fillStyle='#edece2';c.textAlign='center';c.textBaseline='middle'
  const lines=[['live fast',120,116],['die young',340,116],['be wild',560,122],['and',740,104],['have fun',945,116]]
  for(const [text,y,size] of lines) {
    c.font=`${size}px "Snell Roundhand", "Segoe Script", "Brush Script MT", cursive`
    c.fillText(text,400,y,750)
  }
  // Transparent pinholes and fine dry scratches break up the chalk, not the wall behind it.
  let seed=247;const random=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646}
  c.globalCompositeOperation='destination-out'
  for(let i=0;i<28000;i++){
    c.fillStyle=`rgba(0,0,0,${.2+random()*.65})`
    c.fillRect(random()*800,random()*1120,.4+random()*2,.4+random()*3)
  }
  const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4;textures.push(map)
  const material=new THREE.MeshStandardMaterial({map,transparent:true,alphaTest:.03,depthWrite:false,roughness:1,emissive:'#c7c5b8',emissiveMap:map,emissiveIntensity:.14})
  const lettering=new THREE.Group();lettering.name='chalk-wall-quote';lettering.position.set(-11,1.5,-.153);lettering.rotation.z=-.025
  const ink=new THREE.Mesh(new THREE.PlaneGeometry(1.35,1.89),material);ink.receiveShadow=true;lettering.add(ink);parent.add(lettering)
  return lettering
}
