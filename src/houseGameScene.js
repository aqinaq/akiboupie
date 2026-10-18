import * as THREE from 'three'
import { buildHouseRoom, roomThemes } from './houseRooms.js'
import { buildHouseArtifacts } from './houseArtifacts.js'
import { slideRunes, canSlide, toggleCrystals, towerOverlap } from './houseGameRules.js'

export function createHouseGame(host, { place, info, onExit, onStatus, onInspect = () => {} }) {
  const theme = roomThemes[place]
  const scene = new THREE.Scene(); scene.background = new THREE.Color(theme.background)
  scene.fog = new THREE.Fog(theme.background, 28, 60)
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6)); renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap; renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = theme.exposure
  host.appendChild(renderer.domElement)
  const canvas = renderer.domElement; canvas.tabIndex = 0
  canvas.setAttribute('aria-label', `${info.title}. ${info.controls}. R: қайта бастау; Escape: шығу.`)
  const camera = new THREE.PerspectiveCamera(42, 1, .1, 100)
  const materials = [], geometries = [], textures = [], targets = [], timers = new Set()
  const reduced = matchMedia('(prefers-reduced-motion: reduce)')
  const mat = (color, extra = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness: .75, ...extra }); materials.push(m); return m }
  const wood = mat(theme.wood), timber = mat(theme.timber), brass = mat(theme.metal, { metalness: .6, roughness: .35 }), stone = mat(theme.stone), dark = mat(theme.dark), wax = mat(theme.wax)
  const box = new THREE.BoxGeometry(1, 1, 1), sphere = new THREE.SphereGeometry(1, 20, 14), cylinder = new THREE.CylinderGeometry(1, 1, 1, 24), crystal = new THREE.OctahedronGeometry(1)
  geometries.push(box, sphere, cylinder, crystal)
  function mesh(parent, geo, material, x, y, z, sx=1, sy=1, sz=1) {
    const m = new THREE.Mesh(geo, material); m.position.set(x,y,z); m.scale.set(sx,sy,sz); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m
  }
  function action(object, fn) { object.userData.activate = fn; targets.push(object); return object }
  function textTexture(text, color=theme.ink, background=theme.plaque, size=56) {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 160
    const ctx = c.getContext('2d'); ctx.fillStyle = background; ctx.fillRect(0,0,1024,160)
    ctx.strokeStyle = theme.metal; ctx.lineWidth = 3; ctx.strokeRect(10,10,1004,140)
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = color; ctx.font = `${size}px Georgia, serif`; ctx.fillText(text,512,82,960)
    const texture = new THREE.CanvasTexture(c); texture.colorSpace = THREE.SRGBColorSpace; textures.push(texture); return texture
  }
  function plaque(parent, text, x,y,z,width=7, flat=false,size=56) {
    const texture = textTexture(text, undefined, undefined, size)
    const material = mat('#ffffff', { map: texture, roughness: .9 })
    const geometry = new THREE.PlaneGeometry(width, width * 160/1024); geometries.push(geometry)
    const p = mesh(parent, geometry, material,x,y,z); if (flat) p.rotation.x = -Math.PI/2
    return p
  }
  function tokenLabel(parent, text, x,y,z, size, flat) {
    const c=document.createElement('canvas'); c.width=512;c.height=512
    const ctx=c.getContext('2d');ctx.fillStyle='#e4cca0';ctx.fillRect(0,0,512,512)
    ctx.strokeStyle='#9e7740';ctx.lineWidth=7;ctx.strokeRect(22,22,468,468)
    ctx.lineWidth=2;ctx.strokeRect(35,35,442,442)
    ctx.fillStyle='#493927';ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`bold ${text.length>3?140:195}px Georgia`;ctx.fillText(text,256,265)
    for(const [px,pz] of [[54,54],[458,54],[54,458],[458,458]]) {ctx.beginPath();ctx.arc(px,pz,7,0,Math.PI*2);ctx.fill()}
    const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;textures.push(texture)
    const material=mat('#fff',{map:texture});const geo=new THREE.PlaneGeometry(size,size);geometries.push(geo)
    const label=mesh(parent,geo,material,x,y,z);if(flat)label.rotation.x=-Math.PI/2;label.userData.ownedTexture=true;return label
  }
  function changeText(object, text) {
    const old = object.material.map; old.dispose(); textures.splice(textures.indexOf(old),1)
    object.material.map = textTexture(text); object.material.needsUpdate = true
  }
  const room = buildHouseRoom({ scene, place, mesh, mat, box, sphere, cylinder, crystal, wood, timber, brass, stone, dark, wax, geometries })
  plaque(scene,place==='planner'?`${info.title} · 2048`:info.title,1.1,5.65,-6.1,6.5)
  const scorePlaque = plaque(scene,'',0,.29,3.7,5,true,60)
  const controlsPlaque = plaque(scene,info.controls,0,.29,4.72,7.5,true,40)
  const { artifacts } = buildHouseArtifacts({ scene, place, mesh, mat, box, sphere, cylinder, crystal, wood, timber, brass, wax, geometries, plaque, action, onInspect, onExit })
  const reset=new THREE.Group(); reset.name='game-reset'; scene.add(reset); reset.position.set(4.95,.28,1.7);reset.scale.setScalar(.62)
  for(const y of [0,1.8]) mesh(reset,cylinder,brass,0,y,0,.7,.15,.7)
  for(const x of [-.55,.55]) mesh(reset,cylinder,wood,x,.9,0,.06,1.8,.06)
  mesh(reset,sphere,mat('#afd1c5',{transparent:true,opacity:.45,metalness:.25}),0,.9,0,.5,.8,.5)
  mesh(reset,crystal,brass,0,.75,0,.38,.65,.38)
  plaque(reset,'↻ Қайта',0,2.5,0,2.4,false,74); action(reset,()=>restart())
  let game = new THREE.Group(); game.position.set(place==='workshop'?-2.6:0,0,-.45); scene.add(game)
  let board=[], tiles=[], points=0, busy=false, ended=false, motion=null, clock=0, frame=0, last=0, down=null
  let memory=[], first=null, matched=new Set(), moves=0, lights=[], stack=[], moving=null, axis='x', rounds=0, best=0
  const saveKey=`akbope-house-${place}-best`
  try { best=Number(localStorage.getItem(saveKey))||0 } catch { /* optional persistence */ }
  function status(text) { changeText(scorePlaque,text); onStatus(text) }
  function record(value) { if(value>best) { best=value; try { localStorage.setItem(saveKey,String(best)) } catch { /* optional persistence */ } } }
  function later(fn,ms) { const id=window.setTimeout(()=>{timers.delete(id);if(inspection)later(fn,100);else fn()},ms); timers.add(id) }
  function clearTimers() { timers.forEach(window.clearTimeout); timers.clear() }
  function clearGame() {
    const descendants=new Set(); game.traverse(o=>descendants.add(o))
    for(let i=targets.length-1;i>=0;i--) if(descendants.has(targets[i])) targets.splice(i,1)
    // Dispose round-specific resources without touching the shared room assets.
    game.traverse(o=>{ if(o.userData.ownedTexture) { o.material.map.dispose(); textures.splice(textures.indexOf(o.material.map),1); o.material.dispose(); materials.splice(materials.indexOf(o.material),1); o.geometry.dispose(); geometries.splice(geometries.indexOf(o.geometry),1) } })
    scene.remove(game); game=new THREE.Group(); game.position.set(place==='workshop'?-2.6:0,0,-.45); scene.add(game)
  }
  const cell=(i,n=4,spacing=1.85)=>({x:(i%n-(n-1)/2)*spacing,z:(Math.floor(i/n)-(n-1)/2)*spacing})
  function spawnRune() { const empty=board.map((v,i)=>v?null:i).filter(i=>i!==null); if(empty.length) board[empty[Math.floor(Math.random()*empty.length)]]=Math.random()<.9?2:4 }
  const runeMaterials=Array.from({length:12},(_,i)=>mat(new THREE.Color().setHSL(.10+i*.025,.28+.02*i,.68-i*.032)))
  function drawRunes() {
    clearGame(); tiles=[]
    for(let i=0;i<16;i++) {
      const p=cell(i); mesh(game,box,dark,p.x,.3,p.z,1.74,.18,1.74)
      if(!board[i])continue
      const group=new THREE.Group();group.position.set(p.x,.4,p.z);game.add(group)
      mesh(group,box,runeMaterials[Math.min(11,Math.log2(board[i])-1)],0,.3,0,1.62,.6,1.62)
      tokenLabel(group,String(board[i]),0,.61,0,1.36,true)
      tiles[i]=group
    }
  }
  function moveRunes(direction) {
    if(busy||ended)return
    const result=slideRunes(board,direction); if(!result.changed)return
    busy=true; motion={age:0,result,starts:result.motions.map(m=>({...m,start:tiles[m.from].position.clone()}))}
  }
  function finishRuneMove() {
    board=motion.result.board;points+=motion.result.score;record(points);spawnRune();drawRunes();busy=false;motion=null
    ended=!canSlide(board)
    status(ended?`Ойын аяқталды · ${points} · ↻`:`${points} ұпай · Рекорд ${best}${board.includes(2048)?' · 2048! ✧':''}`)
  }
  const potionColors=['#f7a385','#a4c8f4','#c7a4f4','#e8d57b','#95d8b1','#f2a4c3']
  const potionMats=potionColors.map(c=>mat(c,{emissive:c,emissiveIntensity:.35,metalness:.25,roughness:.2}))
  function revealPotion(i,show) {
    const bottle=tiles[i]; bottle.userData.revealed=show
    bottle.userData.liquid.material=show?potionMats[memory[i]]:dark
    bottle.userData.symbol.visible=show
  }
  function choosePotion(i) {
    if(busy||matched.has(i)||i===first)return
    revealPotion(i,true)
    if(first===null){first=i;return}
    moves++;const a=first;first=null
    if(memory[a]===memory[i]) {matched.add(a);matched.add(i);tiles[a].userData.matched=true;tiles[i].userData.matched=true;record(matched.size/2);status(matched.size===12?`Барлық 6 жұп табылды! · ${moves} қадам · ↻`:`${matched.size/2} / 6 жұп · ${moves} қадам`)}
    else {busy=true;status(`${matched.size/2} / 6 жұп · ${moves} қадам`);later(()=>{revealPotion(a,false);revealPotion(i,false);busy=false},950)}
  }
  function drawPotions() {
    for(let i=0;i<12;i++) {
      const p=cell(i,4,1.85);p.z+=.8
      const g=new THREE.Group();g.name=`potion-${i}`;g.position.set(p.x,.3,p.z);game.add(g)
      mesh(g,cylinder,brass,0,.04,0,.65,.1,.65)
      const liquid=mesh(g,sphere,dark,0,.6,0,.52,.6,.52)
      mesh(g,cylinder,brass,0,1.18,0,.21,.28,.21);mesh(g,cylinder,wood,0,1.4,0,.23,.2,.23)
      const symbol=tokenLabel(g,['☀','☽','✦','❀','◆','✧'][memory[i]],0,.64,.525,.52,false);symbol.visible=false
      g.userData.liquid=liquid;g.userData.symbol=symbol;g.userData.baseY=.3;tiles[i]=g;action(g,()=>choosePotion(i))
    }
  }
  const crystalOn=mat('#9be9d2',{emissive:'#70d8b6',emissiveIntensity:1.1,metalness:.4,roughness:.2})
  const crystalOff=mat('#354450',{metalness:.5,roughness:.25})
  function updateCrystals() { tiles.forEach((g,i)=>{g.userData.gem.material=lights[i]?crystalOn:crystalOff});const count=lights.filter(Boolean).length;ended=count===9;status(ended?`Тоғыз жұлдыз оянды! · ${moves} қадам · ↻`:`${count} / 9 жұлдыз · ${moves} қадам`); if(ended)record(++rounds) }
  function drawCrystals() {
    for(let i=0;i<9;i++) {const p=cell(i,3,2.15);const g=new THREE.Group();g.name=`crystal-${i}`;g.position.set(p.x,.3,p.z);game.add(g)
      mesh(g,cylinder,stone,0,.1,0,.8,.25,.8);mesh(g,cylinder,brass,0,.25,0,.6,.08,.6)
      g.userData.gem=mesh(g,crystal,crystalOff,0,1,0,.47,.85,.47);tiles[i]=g
      action(g,()=>{if(ended)return;lights=toggleCrystals(lights,i);moves++;updateCrystals()})
    }updateCrystals()
  }
  const bookCovers = ['#743b36', '#315c60', '#465d40', '#71516d', '#8b6337', '#35486c'].map(color => mat(color, { roughness: .88 }))
  const bookPaper = mat('#d6c392'), pageEdges = mat('#9f8c65'), ribbon = mat('#9c353a')
  function towerBook({ x, y, z, width, depth }, index) {
    const book = new THREE.Group(); book.position.set(x,y,z); book.scale.set(width,1,depth); game.add(book)
    const cover = bookCovers[index % bookCovers.length]
    // Overhanging leather boards, inset pages and a rounded bound spine.
    for (const cy of [-.15,.15]) mesh(book,box,cover,0,cy,0,1,.055,1)
    mesh(book,box,bookPaper,.025,0,0,.88,.245,.89)
    mesh(book,box,cover,-.465,0,0,.07,.3,1)
    const spine=mesh(book,cylinder,cover,-.465,0,0,.045,.99,.155);spine.rotation.x=Math.PI/2
    for(let i=0;i<7;i++) {
      const py=-.095+i*.031
      for(const pz of [-.447,.447]) mesh(book,box,pageEdges,.025,py,pz,.88,.005,.003)
      mesh(book,box,pageEdges,.467,py,0,.003,.005,.89)
    }
    for(const pz of [-.32,.32]) mesh(book,box,brass,-.493,0,pz,.017,.32,.04)
    // Inlaid gold frame and a central ornament remain visible on narrow books.
    for(const px of [-.38,.38]) mesh(book,box,brass,px,.181,0,.008,.008,.8)
    for(const pz of [-.4,.4]) mesh(book,box,brass,0,.181,pz,.76,.008,.008)
    const seal=mesh(book,box,brass,0,.186,0,.2,.012,.2);seal.rotation.y=Math.PI/4
    const inset=mesh(book,box,cover,0,.194,0,.13,.008,.13);inset.rotation.y=Math.PI/4
    for(const px of [-.39,.39]) for(const pz of [-.41,.41]) mesh(book,sphere,brass,px,.188,pz,.018,.014,.018)
    mesh(book,box,ribbon,.24,-.045,.5,.07,.015,.2)
    return book
  }
  function newMoving() {
    const prev=stack.at(-1);axis=stack.length%2?'x':'z'
    moving={...prev,y:.65+stack.length*.38,[axis]:-4.1};moving.mesh=towerBook(moving,stack.length)
    moving.mesh.name='moving-tower-book';action(moving.mesh,dropTower)
  }
  function dropTower() {
    if(ended||!moving)return
    const trimmed=towerOverlap(stack.at(-1),moving,axis)
    // Only the moving book accepts drops; settled volumes are scenery.
    const targetIndex=targets.indexOf(moving.mesh);if(targetIndex>=0)targets.splice(targetIndex,1)
    delete moving.mesh.userData.activate
    if(trimmed.width<.12||trimmed.depth<.12) {ended=true;status(`Мұнара тоқтады · ${stack.length-1} қабат · ↻`);moving.mesh.rotation.z=-.18;return}
    moving.mesh.name='placed-tower-book';moving.mesh.position.set(trimmed.x,trimmed.y,trimmed.z);moving.mesh.scale.set(trimmed.width,1,trimmed.depth)
    stack.push(trimmed);record(stack.length-1);moving=null
    if(stack.length===13){ended=true;status('Аспан мұнарасы дайын! · 12 қабат · ↻')}
    else {status(`${stack.length-1} / 12 қабат · Рекорд ${best}`);newMoving()}
  }
  function restart() {
    clearTimers();clearGame();board=[];tiles=[];points=0;busy=false;ended=false;motion=null;first=null;matched=new Set();moves=0;moving=null;stack=[]
    if(place==='planner'){board=Array(16).fill(0);spawnRune();spawnRune();drawRunes();status(`0 ұпай · Рекорд ${best}`)}
    if(place==='notes'){memory=[0,0,1,1,2,2,3,3,4,4,5,5];for(let i=11;i>0;i--){const j=Math.floor(Math.random()*(i+1));[memory[i],memory[j]]=[memory[j],memory[i]]}drawPotions();status('0 / 6 жұп · Құтыларды аш')}
    if(place==='library'){lights=Array(9).fill(true);const scramble=[0,1,2,3,4,5,6,7,8].sort(()=>Math.random()-.5).slice(0,4);scramble.forEach(i=>{lights=toggleCrystals(lights,i)});if(lights.every(Boolean))lights=toggleCrystals(lights,4);drawCrystals()}
    if(place==='workshop'){mesh(game,cylinder,stone,0,.3,0,3,.3,3);stack=[{x:0,z:0,y:.65,width:3,depth:3.65}];towerBook(stack[0],0).name='tower-base-book';newMoving();status(`0 / 12 қабат · Рекорд ${best}`)}
  }
  const ray=new THREE.Raycaster(), pointer=new THREE.Vector2()
  function hit(event) {const r=canvas.getBoundingClientRect();pointer.set((event.clientX-r.left)/r.width*2-1,-(event.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);const hits=ray.intersectObjects(targets,true);let object=hits[0]?.object;while(object&&!object.userData.activate)object=object.parent;return object}
  function pointerDown(e){if(inspection)return;down={x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);canvas.focus()}
  function pointerUp(e){if(!down)return;const dx=e.clientX-down.x,dy=e.clientY-down.y;down=null
    if(place==='planner'&&Math.hypot(dx,dy)>25){moveRunes(Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up');return}
    if(Math.hypot(dx,dy)>25)return
    const object=hit(e);if(object)object.userData.activate();else if(place==='workshop')dropTower()
  }
  function pointerMove(e){canvas.style.cursor=hit(e)?'pointer':place==='workshop'?'crosshair':'grab'}
  function pointerCancel(){down=null}
  function key(e){if(inspection)return;const directions={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down',a:'left',d:'right',w:'up',s:'down'}
    if(directions[e.key]&&place==='planner'){e.preventDefault();e.stopPropagation();moveRunes(directions[e.key])}
    if(e.code==='Space'&&place==='workshop'){e.preventDefault();if(!e.repeat)dropTower()}
    if(e.key.toLowerCase()==='r'){e.preventDefault();restart()}
  }
  canvas.addEventListener('pointerdown',pointerDown);canvas.addEventListener('pointerup',pointerUp);canvas.addEventListener('pointermove',pointerMove);canvas.addEventListener('pointercancel',pointerCancel);canvas.addEventListener('keydown',key)
  let inspection=null
  const homePosition=new THREE.Vector3(),homeLook=new THREE.Vector3(0,1.4,0),viewPosition=new THREE.Vector3(),viewLook=new THREE.Vector3(),currentLook=homeLook.clone()
  function setInspection(value) {
    inspection=value;down=null
    viewPosition.copy(homePosition);viewLook.copy(homeLook)
    if(value?.kind==='project') {
      scene.updateMatrixWorld(true)
      const object=artifacts.get(value.slug)
      if(object){const target=object.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0,.55,0));const portrait=camera.aspect<.85
        viewPosition.copy(target).add(new THREE.Vector3(portrait?0:-1.55,portrait?1.5:1.25,portrait?5.6:5.2))
        viewLook.copy(target).add(new THREE.Vector3(portrait?0:-1.55,portrait?-1.1:0,0))
      }
    }
  }
  function resize(){const {width,height}=host.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height);camera.aspect=width/height;const distance=Math.max(1,.88/camera.aspect);homePosition.set(0,13,16).multiplyScalar(distance);setInspection(inspection);camera.position.copy(viewPosition);currentLook.copy(viewLook);camera.lookAt(currentLook);camera.updateProjectionMatrix();controlsPlaque.scale.x=camera.aspect<.85?.95:1}
  const observer=new window.ResizeObserver(resize);observer.observe(host);resize();restart()
  function render(time){frame=requestAnimationFrame(render);if(document.hidden){last=time;return}const dt=Math.min((time-last)/1000||.016,.05);last=time;if(!inspection)clock+=dt
    const blend=reduced.matches?1:1-Math.exp(-dt*7);camera.position.lerp(viewPosition,blend);currentLook.lerp(viewLook,blend);camera.lookAt(currentLook)
    if(motion&&!inspection){motion.age+=dt;const t=reduced.matches?1:Math.min(1,motion.age/.19);const ease=1-(1-t)**3;for(const m of motion.starts){const p=cell(m.to);tiles[m.from].position.set(THREE.MathUtils.lerp(m.start.x,p.x,ease),.4+Math.sin(t*Math.PI)*.13,THREE.MathUtils.lerp(m.start.z,p.z,ease))}if(t===1)finishRuneMove()}
    if(place==='notes')tiles.forEach(g=>{const target=g.userData.revealed?.62:.3;g.position.y=THREE.MathUtils.damp(g.position.y,target,9,dt);g.rotation.y=g.userData.matched&&!reduced.matches?Math.sin(clock)*.12:0})
    if(place==='library'&&!reduced.matches)tiles.forEach((g,i)=>{g.userData.gem.rotation.y=clock*.3+i;g.userData.gem.position.y=1+Math.sin(clock*1.4+i)*.09})
    if(place==='workshop'&&moving&&!ended&&!inspection){moving[axis]=Math.sin(clock*(.96+stack.length*.066))*4.1;moving.mesh.position[axis]=moving[axis]}
    room.update(clock,reduced.matches||Boolean(inspection))
    renderer.render(scene,camera)
  }frame=requestAnimationFrame(render)
  return {focus:()=>canvas.focus(),restart,setInspection,dispose(){window.cancelAnimationFrame(frame);clearTimers();observer.disconnect();canvas.removeEventListener('pointerdown',pointerDown);canvas.removeEventListener('pointerup',pointerUp);canvas.removeEventListener('pointermove',pointerMove);canvas.removeEventListener('pointercancel',pointerCancel);canvas.removeEventListener('keydown',key);new Set(geometries).forEach(g=>g.dispose());new Set(materials).forEach(m=>m.dispose());new Set(textures).forEach(t=>t.dispose());renderer.dispose();canvas.remove()}}
}
