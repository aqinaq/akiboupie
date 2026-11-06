import * as THREE from 'three'
import { applyLobbyLayout } from './lobbyLayout.js'
import { buildNewYorkPlate } from './newYorkPlate.js'
import { addWallLettering } from './wallLettering.js'
import { buildRoundSign } from './roundSign.js'
import { buildShelfDecor } from './shelfDecor.js'
import { decorAssets } from './lobbyDecorAssets.js'

// Physical props, with flat printed images on thin paper rather than framed screens.
export function buildLobbyDecor(scene, { textures, onTextureReady, isDisposed = () => false }) {
  const root = new THREE.Group(); root.name = 'lobby-decor'; scene.add(root)
  const standard = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: .85, ...extra })
  const mesh = (geometry, material, parent=root) => {const o=new THREE.Mesh(geometry,material);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
  const box = (parent,w,h,d,x,y,z,material) => {const o=mesh(new THREE.BoxGeometry(w,h,d),material,parent);o.position.set(x,y,z);return o}
  let seed=1984;const random=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646}
  const canvasMap = (width,height,paint) => {const c=document.createElement('canvas');c.width=width;c.height=height;paint(c.getContext('2d'),width,height);const map=new THREE.CanvasTexture(c);textures.push(map);return map}
  const paper = canvasMap(256,256,(c,w,h)=>{c.fillStyle='#c8c4bd';c.fillRect(0,0,w,h);for(let i=0;i<20000;i++){c.fillStyle=random()>.5?'#eee9dd55':'#5c564b22';c.fillRect(random()*w,random()*h,.5+random(),.5+random())}})
  paper.wrapS=paper.wrapT=THREE.RepeatWrapping
  const paperMaterial = () => standard('#eee9dc',{bumpMap:paper,bumpScale:.008,roughness:.97,side:THREE.DoubleSide})
  const loadPrint = (path,material,onLoaded) => {
    if(!path)return
    new THREE.TextureLoader().load(path,map=>{if(isDisposed()){map.dispose();return}map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4;textures.push(map);material.map=map;material.color.set('#ffffff');material.needsUpdate=true;onLoaded?.();onTextureReady?.()},undefined,()=>{})
  }
  function wallPoster(name,path,x,y,w,h,rotation,waitForImage=false){
    const sheet=new THREE.Group();sheet.name=name;sheet.position.set(x,y,-.105);sheet.rotation.z=rotation;root.add(sheet)
    sheet.visible=!waitForImage
    const material=paperMaterial();loadPrint(path,material,()=>{sheet.visible=true})
    const geo=new THREE.PlaneGeometry(w,h,18,24),pos=geo.attributes.position
    for(let i=0;i<pos.count;i++){const px=pos.getX(i),py=pos.getY(i);const edge=Math.pow(Math.abs(px)/(w/2),10);pos.setZ(i,.008+edge*.018*(.6+.4*Math.sin(py*4))+Math.pow(Math.max(0,-py/(h/2)),8)*.04)}
    geo.computeVertexNormals();mesh(geo,material,sheet)
    const tape=standard('#d7c9a6',{transparent:true,opacity:.65,depthWrite:false,side:THREE.DoubleSide})
    for(const sx of [-1,1]){const t=mesh(new THREE.PlaneGeometry(.19,.085),tape,sheet);t.position.set(sx*w*.36,h/2-.015,.035);t.rotation.z=sx*.14}
  }
  wallPoster('igor-poster',decorAssets.igor,-2.55,4.05,1.72,1.72,-.025)
  wallPoster('band-poster',decorAssets.band,-3.0,6.2,1.72,2.135,.018)
  wallPoster('lana-poster',decorAssets.lana,-.9,7.2,1.85,1.158,-.025)

  // New paper prints fit into the remaining wall space around the existing arrangement.
  wallPoster('nihao-cats-poster',decorAssets['nihao-cats'],-9.3,5.6,1.42,1.42*1026/735,-.035)
  wallPoster('leather-portrait-poster',decorAssets['leather-portrait'],-9.3,3.1,1.52,1.52*981/736,.022)
  wallPoster('blue-night-poster',decorAssets['blue-night'],1.4,7.25,1.9,1.9*414/735,.018)
  wallPoster('stairs-scene-poster',decorAssets['stairs-scene'],3.05,1.65,1.9,1.9*513/735,-.025)
  wallPoster('pink-group-poster',decorAssets['pink-group'],3.65,6.95,1.55,1.55,-.025)
  wallPoster('los-angeles-poster',decorAssets['los-angeles'],6.05,7.25,1.7,1.7,.02)
  wallPoster('new-york-poster',decorAssets['new-york'],9.3,6.55,1.35,1.35*1110/735,-.018)

  wallPoster('shinjuku-poster',decorAssets['shinjuku'],-11,5.7,1.15,1.626562,-0.018)
  wallPoster('spain-swag-poster',decorAssets['spain-swag'],-9.3,7.5,1.25,1.250000,0.025)
  wallPoster('rio-poster',decorAssets['rio'],-2.75,2.35,1.65,1.178203,0.018)
  wallPoster('green-skater-poster',decorAssets['green-skater'],3.8,3.15,0.9,1.019830,-0.025)
  wallPoster('orda-poster',decorAssets['orda'],3.75,4.8,0.9,0.900000,0.02)
  wallPoster('peace-kitten-poster',decorAssets['peace-kitten'],-11,3.6,1.0,1.777174,0.025)
  wallPoster('lock-in-cat-poster',decorAssets['lock-in-cat'],-9.3,1.35,0.95,0.950000,-0.02)

  wallPoster('kazakhstan-swag-poster',decorAssets['kazakhstan-swag'],3.1,8.45,1.65,1.1,-.015,true)
  wallPoster('turquoise-lace-poster',decorAssets['turquoise-lace'],-6.7,8.45,1.7,1.7*490/735,-.012,true)
  wallPoster('kazakh-ornament-poster',decorAssets['kazakh-ornament'],-4.7,8.45,1.7,1.7*486/736,.014,true)

  // Only show these new prints once their original image files are available.
  wallPoster('demon-days-poster',decorAssets['demon-days'],-11,7.65,1.05,1.4,-.02,true)
  wallPoster('yellow-manga-poster',decorAssets['yellow-manga'],.2,8.35,1.75,1.75*285/679,.025,true)
  wallPoster('red-manga-poster',decorAssets['red-manga'],11,6.5,1.05,1.05*1474/1000,-.018,true)

  // Upright skateboard, wheels facing the visitor; no tilt to the hanging deck.
  const skate=new THREE.Group();skate.name='wall-skateboard';skate.position.set(2.65,4.25,.10);root.add(skate)
  const deckPrint=canvasMap(384,1408,(c,w,h)=>{
    c.fillStyle='#171918';c.fillRect(0,0,w,h)
    c.strokeStyle='#e2dcc8';c.lineWidth=12;c.strokeRect(13,19,w-26,h-38)
    const letters='BAKER';c.textAlign='center';c.textBaseline='middle';c.font='900 290px Georgia'
    for(let i=0;i<5;i++){const y=145+i*270;c.fillStyle='#e7e4da';c.fillRect(30,y-115,w-60,230);c.fillStyle='#141716';c.fillText(letters[i],w/2,y+10)}
    for(let i=0;i<850;i++){const x=random()*w,y=random()*h;c.strokeStyle=i%3?'#d9d2b338':'#11171380';c.lineWidth=.4+random()*2;c.beginPath();c.moveTo(x,y);c.lineTo(x+(random()-.5)*45,y+random()*90);c.stroke()}
    c.strokeStyle='#7197ad';c.lineWidth=8;c.beginPath();c.moveTo(90,1240);c.lineTo(270,1280);c.lineTo(125,1340);c.lineTo(180,1220);c.stroke()
  });deckPrint.colorSpace=THREE.SRGBColorSpace
  const maple=standard('#a18c63'),deckMat=standard('#ffffff',{map:deckPrint,roughness:.59,bumpMap:paper,bumpScale:.014})
  const shape=new THREE.Shape();shape.moveTo(-.4,-1.15);shape.bezierCurveTo(-.4,-1.72,.4,-1.72,.4,-1.15);shape.lineTo(.4,1.15);shape.bezierCurveTo(.4,1.72,-.4,1.72,-.4,1.15);shape.closePath()
  const deckGeo=new THREE.ExtrudeGeometry(shape,{depth:.055,steps:1,bevelEnabled:true,bevelSize:.018,bevelThickness:.012,bevelSegments:3,curveSegments:24})
  const positions=deckGeo.attributes.position
  for(let i=0;i<positions.count;i++){const y=positions.getY(i);positions.setZ(i,positions.getZ(i)+Math.pow(Math.max(0,(Math.abs(y)-1.05)/.55),2)*.12)}
  deckGeo.computeVertexNormals();mesh(deckGeo,maple,skate)
  const faceGeo=new THREE.ShapeGeometry(shape,32),uv=faceGeo.attributes.uv,p=faceGeo.attributes.position
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i);p.setZ(i,.075+Math.pow(Math.max(0,(Math.abs(y)-1.05)/.55),2)*.12);uv.setXY(i,(x+.42)/.84,(y+1.6)/3.2)}
  faceGeo.computeVertexNormals();mesh(faceGeo,deckMat,skate)
  const metal=standard('#a3a7a5',{metalness:.86,roughness:.3}),rubber=standard('#aaa06b',{roughness:.9}),black=standard('#252722')
  for(const y of [-1.02,1.02]){
    box(skate,.27,.34,.065,0,y,.13,metal)
    const kingpin=mesh(new THREE.CylinderGeometry(.055,.07,.21,12),metal,skate);kingpin.rotation.x=Math.PI/2;kingpin.position.set(0,y,.25)
    const truck=box(skate,.62,.105,.12,0,y,.31,metal);truck.rotation.z=.04
    for(const sx of [-1,1]){
      const wheel=mesh(new THREE.CylinderGeometry(.145,.145,.16,24),rubber,skate);wheel.rotation.z=Math.PI/2;wheel.position.set(sx*.39,y,.31)
      const axle=mesh(new THREE.CylinderGeometry(.055,.055,.175,12),metal,skate);axle.rotation.z=Math.PI/2;axle.position.copy(wheel.position)
      for(const yy of [-.12,.12]){const bolt=mesh(new THREE.SphereGeometry(.022,8,6),black,skate);bolt.position.set(sx*.095,y+yy,.175)}
    }
  }
  for(const y of [-1.35,1.35])box(skate,.2,.055,.16,0,y,-.055,metal)

  // Most of the print stays exposed; a low curl keeps the title and portrait visible from eye level.
  const rolled=new THREE.Group();rolled.name='half-rolled-blond-poster';rolled.position.set(-2.4,.03,1.25);rolled.rotation.y=-.16;root.add(rolled)
  const width=2.15,length=2.15,columns=24,rows=100,verts=[],uvs=[],indices=[]
  for(let j=0;j<=rows;j++){
    const t=j/rows,flat=length*.72,arc=Math.max(0,t*length-flat),r=.10,angle=arc/r
    const z=t<=.72?t*length:flat+Math.sin(angle)*r
    const y=t<=.72?.008*Math.sin(t*14):r*(1-Math.cos(angle))
    for(let i=0;i<=columns;i++){const u=i/columns;verts.push((u-.5)*width,y+.006*Math.sin(u*6+t*8),z);uvs.push(u,1-t);if(i<columns&&j<rows){const a=j*(columns+1)+i,b=a+columns+1;indices.push(a,b,a+1,a+1,b,b+1)}}
  }
  const rolledGeo=new THREE.BufferGeometry();rolledGeo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));rolledGeo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));rolledGeo.setIndex(indices);rolledGeo.computeVertexNormals()
  const blondMaterial=paperMaterial();blondMaterial.side=THREE.FrontSide;loadPrint(decorAssets.blond,blondMaterial);mesh(rolledGeo,blondMaterial,rolled)
  const paperBack=paperMaterial();paperBack.side=THREE.BackSide;mesh(rolledGeo,paperBack,rolled)

  const books=new THREE.Group();books.name='stacked-floor-books';books.position.set(4.4,0,1.05);root.add(books)
  const pages=standard('#c8bfa8',{bumpMap:paper,bumpScale:.015}),edgeInk=standard('#9a927e')
  const colors=['#373e41','#a26e59','#d3c4a2','#556657','#674757']
  let height=.025
  for(let i=0;i<5;i++){
    const book=new THREE.Group();book.name=`book-${i+1}`;book.position.y=height;book.rotation.y=[-.10,.11,-.06,.18,-.13][i];books.add(book)
    const w=1.48-i*.09,d=1.12-i*.045,h=[.2,.15,.23,.17,.12][i],cover=standard(colors[i],{bumpMap:paper,bumpScale:.012})
    box(book,w-.045,h,d-.055,0,h/2,0,pages)
    for(const y of [0,h])box(book,w+.025,.025,d+.025,0,y,0,cover)
    box(book,.055,h,d+.02,-w/2,h/2,0,cover)
    for(let n=1;n<9;n++)box(book,w-.07,.002,.003,0,h*n/9,d/2-.025,edgeInk)
    for(const z of [-d*.32,d*.32])box(book,.008,h*.8,.045,-w/2-.03,h/2,z,standard('#b3a17a',{metalness:.25}))
    height+=h+.045
  }
  // A modest fill keeps the added paper and skateboard legible in the dim hall.
  const fill=new THREE.PointLight('#e4d9c7',24,15,2);fill.position.set(-5.5,6.5,3.5);root.add(fill)
  const floorFill=new THREE.PointLight('#e5d9c4',18,8,2);floorFill.position.set(-2.4,2.8,3);root.add(floorFill)
  buildNewYorkPlate(root, textures, paper)
  addWallLettering(root, textures)
  buildRoundSign(root, paper)
  buildShelfDecor(root, textures)
  const caps=root.getObjectByName('stacked-longshot-caps')
  books.add(caps)
  caps.position.set(0,height-.045+.0125+.002,-.10)
  caps.rotation.y=-.13
  caps.userData.layoutRevision='on-books-v4'
  applyLobbyLayout(root)
  return root
}
