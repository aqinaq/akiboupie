import * as THREE from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

export function buildWindVillage({ scene, random, height, material, textures }) {
  const staticRoot=new THREE.Group(), obstacles=[],animations=[];scene.add(staticRoot)
  const roundCube=new RoundedBoxGeometry(1,1,1,2,.06),sphere=new THREE.SphereGeometry(1,20,12),cylinder=new THREE.CylinderGeometry(1,1,1,16)
  const stone=material('#bec6bb'),stoneShade=material('#8b9e99'),limestone=material('#e3dfc8'),wood=material('#6e5545'),woodLight=material('#a58a5b'),gold=material('#bba66d',{metalness:.3,roughness:.6}),plaster=material('#f1e8d1')
  const roof=material('#75618f'),roofLight=material('#a48abb'),glass=material('#ddbcdf',{emissive:'#ce8ee3',emissiveIntensity:.17}),dark=material('#273f47'),teal=material('#dc9af5',{emissive:'#bc66e5',emissiveIntensity:.6})
  const parent=staticRoot
  function part(p,geo,mat,pos,scale=[1,1,1],rot=[0,0,0]){const m=new THREE.Mesh(geo,mat);m.position.set(...pos);m.scale.set(...scale);m.rotation.set(...rot);m.castShadow=true;m.receiveShadow=true;p.add(m);return m}
  const box=(p,mat,size,pos,rot)=>part(p,roundCube,mat,pos,size,rot)
  function beam(p,a,b,width,mat=wood){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b);const m=part(p,cylinder,mat,start.clone().add(end).multiplyScalar(.5).toArray(),[width,start.distanceTo(end),width]);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),end.sub(start).normalize());return m}
  function curve(p,points,r,mat){return part(p,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(v=>new THREE.Vector3(...v))),16,r,8,false),mat,[0,0,0])}
  function decoration(id,x,z){const g=new THREE.Group();g.name=id;g.position.set(x,height(x,z),z);scene.add(g);return g}
  function gable(p,x,y,z,w,h,d,mat){const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(0,h);s.closePath();return part(p,new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:false}),mat,[x,y,z-d/2])}
  function roofPair(p,x,y,z,w,h,d){const slope=Math.atan2(h,w/2),length=Math.hypot(w/2,h)
    for(const sign of [-1,1]){
      box(p,roof,[length+.45,.16,d+.65],[x+sign*w/4,y+h/2,z],[0,0,-sign*slope])
      for(let row=0;row<9;row++){
        const t=(row+.5)/9
        box(p,row%3?roof:roofLight,[.15,.055,d+.68],[x+sign*(w/2*(1-t)+.05),y+h*t+.12,z],[0,0,-sign*slope])
      }
      beam(p,[x,y+h+.1,z+d/2+.35],[x+sign*(w/2+.24),y-.12,z+d/2+.35],.07,woodLight)
    }
    beam(p,[x,y+h+.15,z-d/2-.4],[x,y+h+.15,z+d/2+.4],.085,roofLight)
  }
  function window(p,x,y,z,w=.8,h=1.2){box(p,wood,[w+.18,h+.18,.12],[x,y,z]);box(p,glass,[w,h,.07],[x,y,z+.09]);for(const dx of [-w*.25,w*.25])box(p,woodLight,[.035,h,.04],[x+dx,y,z+.14]);box(p,woodLight,[w,.045,.04],[x,y,z+.14]);box(p,limestone,[w+.3,.1,.3],[x,y-h/2-.1,z+.09])}
  function house(id,x,z,s,rot=0,variant=0){const g=new THREE.Group();g.position.set(x,height(x,z),z);g.scale.setScalar(s);g.rotation.y=rot;parent.add(g)
    box(g,stone,[5.6,.45,4.7],[0,.18,0]);box(g,stone,[5.15,2.1,4.2],[0,1.3,0]);box(g,plaster,[5.4,2.1,4.4],[0,3.4,0])
    for(const y of [.6,1.2,1.8])for(let j=0;j<9;j++)box(g,j%3?stone:stoneShade,[.53,.02,.025],[-2.4+j*.6,y,2.115])
    for(const y of [2.4,4.45])box(g,wood,[5.52,.16,4.5],[0,y,0])
    for(const x of [-2.57,-1.25,0,1.25,2.57])box(g,wood,[.13,2.1,.14],[x,3.4,2.26])
    for(const sign of [-1,1]){beam(g,[sign*.15,2.5,2.27],[sign*1.17,4.35,2.27],.05);beam(g,[sign*1.35,2.5,2.27],[sign*2.47,4.35,2.27],.05)}
    gable(g,0,4.48,0,5.4,2.8,4.4,plaster);roofPair(g,0,4.48,0,5.9,3.05,4.6)
    box(g,wood,[.12,2.4,.12],[0,5.7,2.25]);box(g,wood,[4.4,.12,.12],[0,5,2.25])
    for(const sign of [-1,1])beam(g,[sign*2.35,4.65,2.25],[0,7.12,2.25],.07)
    for(const x of [-1.65,1.65]){window(g,x,3.45,2.31,.76,1.1);window(g,x,1.4,2.15,.7,1.1)}
    window(g,0,5.55,2.32,.66,1)
    // Recessed arched doorway, projecting porch, slate shingles and carved corbels.
    box(g,dark,[1.25,1.9,.12],[0,1.2,2.16]);box(g,wood,[1.08,1.7,.13],[0,1.15,2.23])
    for(const x of [-.45,-.22,0,.22,.45])box(g,woodLight,[.025,1.65,.02],[x,1.15,2.31])
    part(g,new THREE.TorusGeometry(.12,.025,8,20),gold,[.3,1.15,2.34])
    for(const x of [-.8,.8]){box(g,wood,[.15,2.65,.15],[x,1.5,3.3]);beam(g,[x,2.2,3.3],[x,2.8,2.6],.07)}
    roofPair(g,0,2.72,2.8,2.3,.75,1.7)
    for(let i=0;i<3;i++)box(g,stone,[2.5-i*.25,.16,1.4-i*.23],[0,.08+i*.14,3.6-i*.18])
    box(g,stone,[.65,2.7,.75],[1.65,6.7,-.8]);box(g,stoneShade,[.85,.16,.95],[1.65,8.04,-.8])
    // A side turret breaks the silhouette of the rectangular main house.
    if(variant%2===0){part(g,new THREE.CylinderGeometry(1.15,1.3,4.8,12),plaster,[-2.6,2.5,-.4]);part(g,new THREE.ConeGeometry(1.55,3,12),roof,[-2.6,6.4,-.4]);beam(g,[-2.6,7.9,-.4],[-2.6,8.5,-.4],.035,gold);part(g,sphere,gold,[-2.6,8,-.4],[.1,.1,.1])}
    for(const x of [-1.65,1.65]){box(g,wood,[1.12,.26,.42],[x,2.75,2.48]);for(let i=0;i<6;i++)part(g,sphere,material(i%2?'#e88bbb':'#b49ae2'),[x-.42+i*.17,2.94,2.47],[.13,.12,.13])}
    const pick=decoration(id,x,z,id,8*s,6*s);pick.rotation.y=rot;obstacles.push({x,z,radius:3.5*s})
  }
  const studioX = 0, studioZ = -11.5, journalZ = studioZ + 5
  house('studio',studioX,studioZ,1,0,0);house('notes',34,-40,.86,-.35,1);house('library',-36,-44,.9,.35,0);house('workshop',3,-61,.85,-.1,1)

  // The nearest cottage is a working destination, framed by a garden path.
  const studioY = height(studioX,studioZ)
  const studioTarget = new THREE.Mesh(new THREE.BoxGeometry(6,8,5), new THREE.MeshBasicMaterial({ visible:false }))
  studioTarget.position.set(studioX,studioY+4,studioZ);studioTarget.name='project-studio';studioTarget.userData.panel='work';scene.add(studioTarget)
  const studioAnchor = new THREE.Object3D();studioAnchor.position.set(studioX,height(studioX,journalZ)+1.37,journalZ);scene.add(studioAnchor)
  const desk = new THREE.Group();desk.position.set(studioX,height(studioX,journalZ),journalZ);parent.add(desk)
  box(desk,woodLight,[2.8,.16,1.1],[0,1.12,0])
  for(const x of [-1.15,1.15])for(const z of [-.36,.36])box(desk,wood,[.13,1.1,.13],[x,.55,z])
  // Open journal, with a visible spine and ink lines.
  box(desk,roof,[1.26,.08,.8],[0,1.26,0]);const journalPaper=material('#fff1c7',{emissive:'#ffcf70',emissiveIntensity:1.15});box(desk,journalPaper,[1.16,.06,.72],[0,1.33,0])
  box(desk,gold,[.025,.015,.72],[0,1.37,0])
  for(const x of [-.31,.31])for(let i=0;i<4;i++)box(desk,woodLight,[.38,.008,.018],[x,1.369,-.2+i*.12])
  // A separate pick surface stays aligned with the merged workbench.
  const journalTarget=new THREE.Mesh(new THREE.BoxGeometry(2.8,.55,1.1),studioTarget.material)
  journalTarget.position.set(studioX,height(studioX,journalZ)+1.3,journalZ);journalTarget.userData.panel='work';scene.add(journalTarget)
  // Stepping stones lead from the chest clearing to the journal.
  const route=new THREE.CatmullRomCurve3([new THREE.Vector3(0,0,5),new THREE.Vector3(.4,0,3),new THREE.Vector3(-.3,0,1),new THREE.Vector3(studioX,0,journalZ+1.4)])
  for(let i=0;i<20;i++){const point=route.getPoint(i/19);box(parent,i%3?limestone:stone,[.8,.07,.52],[point.x,height(point.x,point.z)+.06,point.z],[0,Math.sin(i*2)*.3,0])}
  for(const x of [studioX-2.3,studioX+2.3]){
    box(parent,stone,[.65,.3,.65],[x,height(x,journalZ)+.15,journalZ])
    box(parent,wood,[.09,1.8,.09],[x,height(x,journalZ)+.9,journalZ])
    part(parent,sphere,material('#ffe1a3',{emissive:'#ffd07e',emissiveIntensity:.45}),[x,height(x,journalZ)+1.8,journalZ],[.18,.25,.18])
  }
  const studio={targets:[studioTarget,journalTarget],anchor:studioAnchor}

  // A shallow stone arch bridges the river; the town belongs to a continuous landscape.
  const bridge = new THREE.Group(); bridge.position.set(11.5, 2.4, -38); parent.add(bridge)
  const arch = new THREE.Shape(); arch.moveTo(-7,0);arch.lineTo(-7,1.2);arch.quadraticCurveTo(0,2.1,7,1.2);arch.lineTo(7,0);arch.lineTo(5,0);arch.quadraticCurveTo(0,2,-5,0);arch.closePath()
  part(bridge,new THREE.ExtrudeGeometry(arch,{depth:3.5,bevelEnabled:true,bevelSize:.07,bevelThickness:.07,bevelSegments:2}),stone,[0,0,-1.75])
  for(const z of [-1.8,1.8])for(let i=0;i<12;i++){const x=-6.6+i*1.2,y=1.3+Math.sin((i+.5)/12*Math.PI)*.4;box(bridge,limestone,[1.12,.65,.3],[x,y,z])}

  // Distant Mondstadt-like walled skyline: towers, windmills and a tall twin-spired cathedral.
  const city=new THREE.Group();city.position.set(48,7,-113);city.rotation.y=-.15;parent.add(city)
  for(let i=0;i<13;i++){
    const x=(i-6)*3.8,y=2.6+random()*1.1
    box(city,limestone,[3.8,y,2],[x,y/2,5])
    for(let j=0;j<3;j++)box(city,stone,[.55,.7,2],[x-1.2+j*1.2,y+.25,5])
  }
  for(const x of [-24,-12,0,12,24]){part(city,new THREE.CylinderGeometry(1.6,1.85,7,12),limestone,[x,3.5,5]);part(city,new THREE.ConeGeometry(2,3.5,12),roof,[x,8.6,5]);box(city,dark,[.45,1.8,.1],[x,5.4,6.64])}
  for(let i=0;i<15;i++){const x=(random()-.5)*44,z=-3-random()*18,h=3+random()*3;box(city,plaster,[3,h,3],[x,h/2,z]);gable(city,x,h,z,3,2,3,plaster);roofPair(city,x,h,z,3.4,2.4,3.3)}
  box(city,limestone,[9,12,15],[0,6,-21]);gable(city,0,12,-21,9,6,15,limestone);roofPair(city,0,12,-21,10,6.4,16)
  for(const x of [-5.2,5.2]){box(city,limestone,[3.1,20,3.1],[x,10,-13]);part(city,new THREE.ConeGeometry(2.4,9,8),roof,[x,24.5,-13]);beam(city,[x,29,-13],[x,31,-13],.07,gold);for(const y of [8,12,16])box(city,dark,[.7,2.5,.05],[x,y,-11.4])}
  const rose=part(city,new THREE.TorusGeometry(1.6,.17,8,32),gold,[0,10,-13.4]);part(city,new THREE.CircleGeometry(1.5,32),glass,[0,10,-13.42]);rose.castShadow=false
  for(const x of [-19,18]){
    part(city,new THREE.CylinderGeometry(1.1,2,11,12),plaster,[x,5.5,-15]);part(city,new THREE.ConeGeometry(2,3,12),roof,[x,12,-15])
    for(let j=0;j<4;j++){const a=j*Math.PI/2+.2;beam(city,[x,10,-12.9],[x+Math.sin(a)*5,10+Math.cos(a)*5,-12.9],.08,wood);for(let k=1;k<6;k++)box(city,limestone,[.9,.45,.08],[x+Math.sin(a)*k*.8,10+Math.cos(a)*k*.8,-12.85],[0,0,-a])}
  }

  // A sculpted winged statue with a glowing Anemo orb, framed by ancient stone steps.
  const statueX = -6.75, statueZ = -5.5
  const statue=new THREE.Group();statue.position.set(statueX,height(statueX,statueZ),statueZ);parent.add(statue)
  // Face the initial viewpoint at (0, 8) on the ground plane.
  statue.rotation.y=Math.atan2(-statueX,8-statueZ)
  statue.updateWorldMatrix(true,false)
  for(let i=0;i<3;i++)part(statue,new THREE.CylinderGeometry(1.8-i*.28,1.9-i*.28,.22,8),stone,[0,.11+i*.22,0])
  part(statue,new THREE.CylinderGeometry(.7,1.1,1.5,8),stone,[0,1.4,0]);part(statue,new THREE.CylinderGeometry(.94,.82,.2,8),limestone,[0,2.16,0])
  const robeGeo=new THREE.LatheGeometry([new THREE.Vector2(.72,0),new THREE.Vector2(.53,.7),new THREE.Vector2(.32,1.55),new THREE.Vector2(.4,1.9),new THREE.Vector2(.22,2.15)],32)
  const rp=robeGeo.attributes.position
  for(let i=0;i<rp.count;i++){const a=Math.atan2(rp.getZ(i),rp.getX(i)),f=1+Math.cos(a*9)*.085;rp.setX(i,rp.getX(i)*f);rp.setZ(i,rp.getZ(i)*f)}robeGeo.computeVertexNormals();part(statue,robeGeo,limestone,[0,2.26,0])
  part(statue,sphere,stone,[0,4.64,0],[.31,.4,.3]);part(statue,sphere,limestone,[0,4.6,.13],[.21,.27,.2])
  // The hood and many individually swept feathers make a readable sculptural silhouette.
  part(statue,new THREE.SphereGeometry(.39,24,16,0,Math.PI*2,0,Math.PI*.63),limestone,[0,4.72,-.05],[1,1.25,1])
  for(const sign of [-1,1]){
    curve(statue,[[sign*.3,4.17,0],[sign*.58,3.9,.25],[sign*.37,3.78,.8],[sign*.16,3.92,.95]],.12,limestone)
    curve(statue,[[sign*.25,4.05,-.2],[sign*.8,4.9,-.35],[sign*1.65,5.35,-.4]],.15,stone)
    for(let j=0;j<9;j++){
      const x=sign*(.6+j*.13),y=4.65+j*.06
      const feather=new THREE.Shape();feather.moveTo(0,0);feather.bezierCurveTo(sign*.26,.25,sign*.52,.47,sign*.64,.65);feather.bezierCurveTo(sign*.6,-.15,sign*.24,-.65,0,-.85);feather.quadraticCurveTo(-sign*.1,-.25,0,0)
      part(statue,new THREE.ExtrudeGeometry(feather,{depth:.08,bevelEnabled:true,bevelSize:.035,bevelThickness:.035,bevelSegments:2}),j%2?limestone:stone,[x,y,-.36-j*.035])
    }
  }
  const orbMaterial=material('#e7b1ff',{emissive:'#d78aff',emissiveIntensity:2.4,roughness:.18})
  const orb=part(statue,sphere,orbMaterial,[0,4.03,1.03],[.21,.21,.21]);orb.castShadow=false
  // Pick volumes and the projection source survive static geometry merging.
  const aboutTarget=new THREE.Mesh(new THREE.BoxGeometry(4.5,5.6,2.7),studioTarget.material)
  aboutTarget.position.copy(statue.localToWorld(new THREE.Vector3(0,2.8,.3)));aboutTarget.rotation.copy(statue.rotation);aboutTarget.userData.panel='about';scene.add(aboutTarget)
  const aboutAnchor=new THREE.Object3D();aboutAnchor.position.copy(statue.localToWorld(new THREE.Vector3(0,4.03,1.03)));scene.add(aboutAnchor)
  const about={targets:[aboutTarget],anchor:aboutAnchor}
  obstacles.push({x:statueX,z:statueZ,radius:1.9})


  // Teleport waypoint: carved stone fins and a suspended, emissive spindle.
  const waypointX = 15, waypointZ = -25, waypointY = height(waypointX,waypointZ)
  const waypoint=new THREE.Group();waypoint.position.set(waypointX,waypointY,waypointZ);scene.add(waypoint)
  part(waypoint,new THREE.CylinderGeometry(.75,1,.22,8),stone,[0,.11,0])
  part(waypoint,new THREE.CylinderGeometry(.32,.6,1.25,6),stoneShade,[0,.8,0])
  for(let i=0;i<3;i++){const a=i*Math.PI*2/3;curve(waypoint,[[Math.cos(a)*.45,.3,Math.sin(a)*.45],[Math.cos(a)*.7,1.4,Math.sin(a)*.7],[Math.cos(a)*.38,2.4,Math.sin(a)*.38]],.12,limestone)}
  const spindle=part(waypoint,new THREE.OctahedronGeometry(.4),teal,[0,1.9,0],[.7,2,.7]);spindle.castShadow=false
  const halo=part(waypoint,new THREE.TorusGeometry(.65,.018,8,48),teal,[0,1.6,0],[1,1,1],[Math.PI/2,0,0]);halo.castShadow=false
  animations.push((dt,t)=>{spindle.position.y=1.9+Math.sin(t*1.5)*.1;spindle.rotation.y=t*.4;halo.rotation.z=t*.15})
  decoration('village',waypointX,waypointZ,'Village destinations',3,2)
  const glowCanvas=document.createElement('canvas');glowCanvas.width=glowCanvas.height=128;const ctx=glowCanvas.getContext('2d'),gradient=ctx.createRadialGradient(64,64,2,64,64,64);gradient.addColorStop(0,'#ffffffff');gradient.addColorStop(.18,'#ffffffcc');gradient.addColorStop(.45,'#ffffff45');gradient.addColorStop(1,'#ffffff00');ctx.fillStyle=gradient;ctx.fillRect(0,0,128,128)
  const glowMap=new THREE.CanvasTexture(glowCanvas);textures.push(glowMap)
  for(const [x,y,z,size] of [[waypointX,waypointY+1.9,waypointZ,2.5]]){const sprite=new THREE.Sprite(new THREE.SpriteMaterial({map:glowMap,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false}));sprite.position.set(x,y,z);sprite.scale.setScalar(size);scene.add(sprite)}

  // Layered light and orbiting glints mark the two interactive discoveries.
  function discoveryGlow(anchor, color, size, phase, surface) {
    const aura = new THREE.Sprite(new THREE.SpriteMaterial({map:glowMap,color,transparent:true,opacity:1,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}))
    aura.position.copy(anchor.position);aura.scale.setScalar(size);scene.add(aura)
    const core = new THREE.Sprite(new THREE.SpriteMaterial({map:glowMap,color:'#fff8ef',transparent:true,opacity:.9,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false}))
    core.position.copy(anchor.position);core.scale.setScalar(size*.42);scene.add(core)
    const glintMaterial=new THREE.MeshBasicMaterial({color,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,toneMapped:false})
    const glints=Array.from({length:8},()=>{
      const glint=new THREE.Mesh(new THREE.OctahedronGeometry(.045,0),glintMaterial.clone());glint.scale.set(.65,2,.65);scene.add(glint);return glint
    })
    animations.push((dt,time,paused)=>{
      const t=paused?phase:time*.85+phase, pulse=.5+.5*Math.sin(t*2)
      aura.scale.setScalar(size*(1+pulse*.22));aura.material.opacity=.92+pulse*.08
      core.material.opacity=.95+pulse*.05;surface.emissiveIntensity=3.5+pulse*2
      glints.forEach((glint,i)=>{
        const a=t+i*Math.PI/4,r=size*(.22+(i%3)*.04)
        glint.position.copy(anchor.position).add(new THREE.Vector3(Math.cos(a)*r,.16+Math.sin(a*1.3+i)*size*.25,Math.sin(a)*r*.6))
        glint.rotation.set(t+i,t*.7,Math.PI/4);glint.material.opacity=.4+.6*(.5+.5*Math.sin(t*2+i*1.7))
      })
    })
  }
  discoveryGlow(aboutAnchor,'#e3a3ff',2.8,0,orbMaterial)
  discoveryGlow(studioAnchor,'#ffe1a0',3,1.4,journalPaper)

  // A decorative windmill with slowly turning timber lattice sails.
  const mill=decoration('mill',-30,-25,'Turn the windmill',10,4)
  const windmill=new THREE.Group();windmill.position.copy(mill.position);parent.add(windmill)
  part(windmill,new THREE.CylinderGeometry(1.4,2,7,16),plaster,[0,3.5,0]);part(windmill,new THREE.ConeGeometry(2,3,16),roof,[0,8.4,0]);for(const y of [1,3,5])part(windmill,new THREE.TorusGeometry(1.8-y*.05,.06,6,32),wood,[0,y,0],[1,1,1],[Math.PI/2,0,0])
  const sails=new THREE.Group();sails.position.set(-30,mill.position.y+6,-22.85);scene.add(sails)
  for(let j=0;j<4;j++){const blade=new THREE.Group();blade.rotation.z=j*Math.PI/2;sails.add(blade);box(blade,wood,[.12,4.2,.1],[0,1.9,0]);for(const x of [-.35,.35])box(blade,wood,[.055,3.2,.07],[x,2.1,.02]);for(let k=0;k<8;k++)box(blade,limestone,[.8,.23,.045],[0,.75+k*.4,.04])}
  part(sails,sphere,gold,[0,0,.1],[.22,.22,.16]);animations.push((dt,t,paused)=>{if(!paused)sails.rotation.z+=dt*.12})
  const well=decoration('well',-12,4,'Draw water from the well',3,3),wg=new THREE.Group();wg.position.copy(well.position);parent.add(wg)
  for(let row=0;row<3;row++)for(let j=0;j<12;j++){const a=(j+row*.5)*Math.PI/6;box(wg,j%3?stone:stoneShade,[.48,.3,.36],[Math.cos(a)*.85,.18+row*.32,Math.sin(a)*.85],[0,-a,0])}
  part(wg,cylinder,dark,[0,.4,0],[.7,.03,.7]);for(const x of [-1.1,1.1])box(wg,wood,[.14,2.8,.14],[x,1.4,0]);roofPair(wg,0,2.7,0,3,.9,2.1);beam(wg,[-1.2,1.8,0],[1.2,1.8,0],.1);beam(wg,[0,1.8,0],[0,.7,0],.015,woodLight)
  decoration('pond',20,-17,'Rest by the river',1.5,7)
  for(const [id,x,z] of [['lantern',-3,5],['mushrooms',5,5]]){
    const t=decoration(id,x,z,id,1.3,1.2),g=new THREE.Group();g.position.copy(t.position);parent.add(g)
    for(let i=0;i<3;i++){const a=i*2.1;curve(g,[[Math.cos(a)*.3,0,Math.sin(a)*.3],[Math.cos(a)*.25,.6,Math.sin(a)*.25],[Math.cos(a)*.45,.95,Math.sin(a)*.45]],.025,wood);part(g,new THREE.SphereGeometry(.16,12,8),material(id==='lantern'?'#fff0a3':'#d4a2ef',{emissive:id==='lantern'?'#e9bb41':'#ad65cd',emissiveIntensity:.5}),[Math.cos(a)*.45,.94,Math.sin(a)*.45],[1,.65,1])}
  }
  // Merge static geometry by material; moving objects and pick volumes remain independent.
  staticRoot.updateMatrixWorld(true);const buckets=new Map(),originals=new Set()
  staticRoot.traverse(o=>{if(!o.isMesh)return;const key=o.material.uuid;if(!buckets.has(key))buckets.set(key,{mat:o.material,geos:[]});const geo=o.geometry.clone().applyMatrix4(o.matrixWorld);buckets.get(key).geos.push(geo.index?geo.toNonIndexed():geo);originals.add(o.geometry)})
  for(const {mat,geos} of buckets.values()){const merged=mergeGeometries(geos,false);if(merged){const m=new THREE.Mesh(merged,mat);m.castShadow=true;m.receiveShadow=true;scene.add(m)}geos.forEach(g=>g.dispose())}
  scene.remove(staticRoot);originals.forEach(g=>g.dispose())
  return {obstacles,studio,about,update(dt,time,paused){animations.forEach(fn=>fn(dt,time,paused))}}
}
