import * as THREE from 'three'

export const roomThemes = {
  planner: { background:'#271c1a', wood:'#654132', timber:'#302a29', metal:'#b78049', stone:'#62615b', dark:'#313936', wax:'#d6b77f', ink:'#ffe2ac', plaque:'#382721', sky:'#e9b280', ground:'#493128', light:'#ffd1a0', intensity:3.4, ambient:1.8, exposure:1.1 },
  notes: { background:'#201529', wood:'#51374e', timber:'#2c2337', metal:'#b4a46d', stone:'#61716b', dark:'#293b3e', wax:'#d8b9e2', ink:'#e9e0ff', plaque:'#30223e', sky:'#c4b0f2', ground:'#293c40', light:'#c5f5dd', intensity:2.8, ambient:2, exposure:1.12 },
  library: { background:'#10182b', wood:'#273a53', timber:'#18283c', metal:'#b7a36c', stone:'#4c6e86', dark:'#182b43', wax:'#a9d1ed', ink:'#e0eaff', plaque:'#14253e', sky:'#a8caff', ground:'#1a2740', light:'#a9cfff', intensity:2.4, ambient:1.6, exposure:1.05 },
  workshop: { background:'#30201e', wood:'#6b3d29', timber:'#34221b', metal:'#c6a067', stone:'#716657', dark:'#492b31', wax:'#f0d4a0', ink:'#ffe6b3', plaque:'#48292c', sky:'#f2d5ad', ground:'#4d3025', light:'#ffdda2', intensity:3.1, ambient:2, exposure:1.18 },
}

export function buildHouseRoom({ scene, place, mesh, mat, box, sphere, cylinder, crystal, wood, timber, brass, stone, dark, wax, geometries }) {
  const theme=roomThemes[place], room=new THREE.Group();room.name=`room-${place}`;scene.add(room)
  const flames=[], motions=[]
  const wall=mat(place==='planner'?'#655b50':place==='notes'?'#49314d':place==='library'?'#18283f':'#8a6550')
  const floorA=mat(place==='notes'?'#37344b':place==='library'?'#23374f':'#615448')
  const floorB=mat(place==='notes'?'#49625e':place==='library'?'#1a2a40':'#494943')
  const ring=(parent,x,y,z,radius,material=brass,flat=false)=>{const torus=new THREE.TorusGeometry(radius,.025,6,64);geometries.push(torus);const m=mesh(parent,torus,material,x,y,z);if(flat)m.rotation.x=-Math.PI/2;return m}
  const rod=(parent,a,b,radius,material)=>{const from=new THREE.Vector3(...a),to=new THREE.Vector3(...b),delta=to.clone().sub(from);const m=mesh(parent,cylinder,material,...from.clone().add(to).multiplyScalar(.5).toArray(),radius,delta.length(),radius);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return m}
  const emissive=(color,strength=1)=>mat(color,{emissive:color,emissiveIntensity:strength,roughness:.35})
  scene.add(new THREE.HemisphereLight(theme.sky,theme.ground,theme.ambient))
  const key=new THREE.DirectionalLight(theme.light,theme.intensity);key.position.set(-5,14,8);key.castShadow=true
  key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-14,right:14,top:14,bottom:-14});key.shadow.bias=-.0005;scene.add(key)
  mesh(room,box,timber,0,-1.6,0,34,.5,30)
  if(place==='workshop') {
    for(let i=0;i<18;i++)mesh(room,box,i%2?wood:timber,-16+i*1.9,-1.3,0,1.85,.1,28)
    const rug=mat('#6f2c38');mesh(room,box,rug,0,-1.2,1,20,.05,17)
    for(const x of [-9.6,9.6])mesh(room,box,brass,x,-1.16,1,.09,.02,16.3)
    for(const z of [-6.9,8.9])mesh(room,box,brass,0,-1.16,z,19.2,.02,.09)
    for(let i=0;i<32;i++)mesh(room,box,wax,-9.3+i*.6,-1.2,9.6,.04,.03,.7)
  } else {
    for(let x=-8;x<=8;x++)for(let z=-6;z<=6;z++)mesh(room,box,(x+z)%2?floorA:floorB,x*2,-1.3,z*2,1.96,.12,1.96)
  }
  mesh(room,box,wall,0,3.3,-7,34,11,.6)
  if(place==='planner') {
    // Masonry, a hot forge and hanging tools give the runes a smith's workshop.
    const blocks=[mat('#72695b'),mat('#5a5750'),mat('#817565')]
    for(let row=0;row<7;row++)for(let col=0;col<16;col++)mesh(room,box,blocks[(row+col)%3],-17+col*2.25+(row%2)*1.1,-.7+row*1.35,-6.6,2.18,1.27,.35)
    mesh(room,box,timber,-8,1.6,-5.9,4.4,5.3,.5)
    mesh(room,box,mat('#1e1716'),-8,1.3,-5.55,3.35,3.8,.2)
    for(const x of [-10.1,-5.9])mesh(room,box,stone,x,1.5,-5.4,.6,4.7,1)
    mesh(room,box,stone,-8,3.8,-5.4,4.7,.6,1)
    mesh(room,box,stone,-8,-.5,-5,5,.5,2.3)
    const fire=emissive('#ff7635',2.5)
    for(let i=0;i<7;i++){const f=mesh(room,sphere,fire,-9.3+i*.43,.2+(i%3)*.12,-5.1,.24,.65+(i%2)*.3,.25);flames.push(f)}
    const heat=new THREE.PointLight('#ff853b',55,15);heat.position.set(-8,1.2,-4);scene.add(heat)
    for(let i=0;i<6;i++)mesh(room,crystal,emissive('#e89249',1),-9.3+i*.5,-.05,-4.7,.16,.14,.12)
    mesh(room,box,wood,8,2.7,-5.8,5,4,.3)
    const iron=mat('#343c3d',{metalness:.7,roughness:.45})
    for(let i=0;i<4;i++){const x=6.4+i*1.05;rod(room,[x,1.5,-5.45],[x,3.6,-5.45],.075,wood);mesh(room,box,iron,x,3.5,-5.4,.75,.35,.4);mesh(room,sphere,brass,x,4.25,-5.4,.07,.07,.07)}
    mesh(room,cylinder,timber,8,-.25,-4,1.2,1.8,1.2)
    mesh(room,box,iron,8,.8,-4,2.8,.45,1.3);mesh(room,box,iron,8,.45,-4,1.1,.7,1)
    const horn=mesh(room,crystal,iron,9.5,.78,-4,.9,.22,.5);horn.rotation.z=Math.PI/2
  } else if(place==='notes') {
    // Jewel-toned glass, medicinal herbs, potion shelves and a bubbling cauldron.
    for(const x of [-12,-4.8,4.8,12])mesh(room,box,timber,x,3.3,-6.5,.25,10,.35)
    const glass=emissive('#806eab',.5)
    mesh(room,cylinder,glass,-8,3.4,-6.35,2.1,.12,2.1).rotation.x=Math.PI/2
    ring(room,-8,3.4,-6.2,2.15);ring(room,-8,3.4,-6.15,1.65)
    for(let i=0;i<8;i++){const a=i*Math.PI/4;rod(room,[-8,3.4,-6.05],[-8+Math.cos(a)*2.1,3.4+Math.sin(a)*2.1,-6.05],.025,brass)}
    const liquidColors=['#a6dbbb','#b889df','#dfb765','#6db0c7']
    for(let row=0;row<3;row++) {
      mesh(room,box,wood,8,.4+row*1.75,-5.9,5.3,.2,1.3)
      for(let i=0;i<6;i++){const x=5.9+i*.83,y=.9+row*1.75;const bottle=emissive(liquidColors[(i+row)%4],.25);mesh(room,sphere,bottle,x,y,-5.9,.28,.43,.28);mesh(room,cylinder,brass,x,y+.44,-5.9,.12,.2,.12);mesh(room,box,wax,x,y,-5.61,.17,.2,.02)}
    }
    const cauldron=mat('#273837',{metalness:.65,roughness:.4})
    mesh(room,sphere,cauldron,-8,-.05,-3.5,1.2,.95,1.2)
    const brew=emissive('#8be2b4',1.4);mesh(room,cylinder,brew,-8,.6,-3.5,.94,.035,.94);ring(room,-8,.65,-3.5,1.02,brass,true)
    for(const x of [-8.8,-7.2])rod(room,[x,-1.2,-3.5],[x,-.4,-3.5],.12,timber)
    for(let i=0;i<7;i++){const bubble=mesh(room,sphere,brew,-8+Math.sin(i*2)*.65,.8+(i%3)*.45,-3.5+Math.cos(i*2)*.5,.09,.09,.09);motions.push({object:bubble,type:'bubble',seed:i,base: bubble.position.clone()})}
    const leaves=mat('#63896a')
    for(const x of [-11,11]){rod(room,[x,6,-6],[x,4.7,-6],.025,brass);for(let i=0;i<8;i++){const leaf=mesh(room,sphere,leaves,x+(i%2?.2:-.2),4.65-i*.12,-6,.24,.09,.06);leaf.rotation.z=i%2?.6:-.6}}
    const glow=new THREE.PointLight('#8fe8be',25,12);glow.position.set(-8,1,-3.5);scene.add(glow)
  } else if(place==='library') {
    // A deep-blue observatory with constellations and a moving brass orrery.
    const starlight=emissive('#c6e5ff',1.6)
    for(let i=0;i<95;i++){const x=Math.sin(i*127.1)*15,y=.2+(Math.sin(i*63.7)+1)*4.5;if(Math.abs(x)<5&&y<6)continue;mesh(room,sphere,starlight,x,y,-6.58,.025+(i%3)*.015,.025+(i%3)*.015,.015)}
    for(const x of [-12,-5.4,5.4,12])mesh(room,box,stone,x,3.2,-6.4,.18,10,.3)
    const moon=emissive('#c7dbef',.8);mesh(room,sphere,moon,-8,4.1,-6.2,1.4,1.4,.08)
    mesh(room,sphere,mat('#18283f'),-7.5,4.5,-6.02,1.25,1.25,.08)
    const constellation=[[-10.1,1.7],[-8.8,2.2],[-7.5,1.3],[-6.1,2.4]]
    constellation.forEach(([x,y],i)=>{mesh(room,crystal,starlight,x,y,-6.1,.09,.09,.04);if(i)rod(room,[...constellation[i-1],-6.1],[x,y,-6.1],.015,brass)})
    const orrery=new THREE.Group();orrery.name='room-orrery';orrery.position.set(8,2.4,-5.1);room.add(orrery)
    for(let i=0;i<3;i++){const orbit=ring(orrery,0,0,0,1.55+i*.35);orbit.rotation.x=.6+i*.65;orbit.rotation.y=i*.5}
    mesh(orrery,sphere,emissive('#e2c58b',.4),0,0,0,.45,.45,.45)
    for(let i=0;i<4;i++)mesh(orrery,sphere,mat(['#91bacd','#c6aa7a','#8c86b7','#82ad9f'][i]),Math.cos(i*1.7)*1.9,Math.sin(i*1.7)*1.5,.3,.19,.19,.19)
    motions.push({object:orrery,type:'orbit'})
    mesh(room,cylinder,brass,8,-.3,-5.1,.13,2,.13);mesh(room,cylinder,stone,8,-1.15,-5.1,1.3,.2,1.3)
    for(const radius of [7,9,11])ring(room,0,-1.2,0,radius,brass,true)
  } else {
    // Warm leather, red velvet and floor-to-ceiling shelves for the book tower.
    for(const x of [-12,-5,5,12])mesh(room,box,timber,x,3.2,-6.5,.35,10,.5)
    for(const y of [-.5,1,6.5])mesh(room,box,timber,0,y,-6.45,32,.25,.5)
    const colors=['#6d3437','#456e62','#ae8551','#40536e','#796080'].map(c=>mat(c))
    for(const side of [-1,1])for(let row=0;row<4;row++){
      const center=side*8;mesh(room,box,wood,center,-.3+row*1.65,-5.9,5.4,.2,1.2)
      for(let i=0;i<11;i++){const x=center-2.3+i*.46,y=.27+row*1.65,h=.85+(i%3)*.15;const b=mesh(room,box,colors[(i+row)%5],x,y,-5.9,.35,h,.7);b.rotation.z=(i%4-1)*.035;for(const by of [-.25,.22])mesh(room,box,brass,x,y+by,-5.53,.33,.035,.02)}
    }
    const velvet=mat('#742f42')
    for(const side of [-1,1])for(let i=0;i<5;i++)mesh(room,cylinder,i%2?velvet:mat('#5b2635'),side*(5.65+i*.28),3.3,-5.5,.21,7,.21)
    mesh(room,box,wood,-9,-.65,-2.7,2,.35,1.5);mesh(room,box,velvet,-9,-.35,-2.7,1.9,.3,1.45)
    for(const x of [-9.7,-8.3])mesh(room,box,timber,x,-.95,-2.7,.12,.6,1.2)
    const windowGlow=new THREE.PointLight('#ffc17f',20,14);windowGlow.position.set(-7,4,-3);scene.add(windowGlow)
  }
  // Each game also has a distinct playing surface, not just a recolored backdrop.
  if(place==='notes'||place==='library') {
    mesh(room,cylinder,timber,0,-.3,0,7,.8,6)
    mesh(room,cylinder,dark,0,.14,0,6.85,.12,5.85)
    const edge=ring(room,0,.23,0,6.8,brass,true);edge.scale.y=5.8/6.8
    if(place==='library')for(const r of [4.5,5.2])ring(room,0,.22,0,r,brass,true)
  } else {
    mesh(room,box,place==='planner'?stone:timber,0,-.3,0,12.6,.8,11.2)
    if(place==='planner')for(let x=0;x<5;x++)for(let z=0;z<4;z++)mesh(room,box,(x+z)%2?floorA:stone,(x-2)*2.42,.15,(z-1.5)*2.6,2.38,.12,2.55)
    else {for(let i=0;i<9;i++)mesh(room,box,wood,-5.56+i*1.39,.13,0,1.35,.15,10.7);mesh(room,box,dark,0,.22,0,9,.025,8)}
    for(const x of [-6.1,6.1])mesh(room,box,brass,x,.25,0,.08,.08,10.9)
    for(const z of [-5.4,5.4])mesh(room,box,brass,0,.25,z,12.3,.08,.08)
    if(place==='planner')for(const x of [-5.8,5.8])for(const z of [-5,5])mesh(room,sphere,brass,x,.3,z,.12,.06,.12)
  }
  for(const x of [-5.1,5.1]) {
    mesh(room,cylinder,brass,x,.35,-4,.45,.25,.45)
    if(place==='library') {const lamp=mesh(room,crystal,emissive('#90bfe4',1.2),x,1,-4,.27,.65,.27);motions.push({object:lamp,type:'spin'})}
    else if(place==='notes') {mesh(room,cylinder,brass,x,.6,-4,.14,.5,.14);mesh(room,sphere,emissive('#c9a4e2',1),x,1.1,-4,.33,.4,.33);ring(room,x,1.1,-4,.4)}
    else {mesh(room,cylinder,wax,x,.9,-4,.2,1.1,.2);const flame=mesh(room,sphere,emissive('#ffd58b',2),x,1.62,-4,.12,.24,.12);flames.push(flame)}
    const light=new THREE.PointLight(place==='library'?'#91bdff':place==='notes'?'#c2a0e4':'#ffbe65',10,10);light.position.set(x,2,-4);scene.add(light)
  }
  flames.forEach(object=>{object.userData.restScale=object.scale.y})
  return { update(time,paused) {if(paused)return;flames.forEach((f,i)=>{f.scale.y=f.userData.restScale*(1+Math.sin(time*7+i)*.1)});motions.forEach(m=>{if(m.type==='bubble'){m.object.position.y=m.base.y+(time*.28+m.seed*.2)%1.6;m.object.scale.setScalar(.07+Math.sin(time+m.seed)*.025)}else if(m.type==='orbit')m.object.rotation.y=time*.16;else m.object.rotation.y=time*.4})} }
}
