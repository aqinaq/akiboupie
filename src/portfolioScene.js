import * as THREE from 'three'
import { graphicWorks } from './collections.js'
import { buildDoors } from './doorModels.js'
import { createReturnPortal } from './returnPortal.js'
import { buildLobbyDecor } from './lobbyDecor.js'
import { addMessyDoorNote } from './messyDoorNote.js'
import { addYoloLettering } from './yoloLettering.js'
import { addDoorLettering } from './doorLettering.js'
import { addDoorPoster } from './doorPoster.js'
import { createDecorEditor } from './decorEditor.js'
import { createPortalAura } from './portalAura.js'

export function createPortfolioScene(host, { room = 'lobby', onSelect, onReady, onError, onExit }) {
  let renderer
  try { renderer = new THREE.WebGLRenderer({ antialias: true }) } catch { onError(); return { dispose() {}, openDoor() {}, enter() {}, view() {} } }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFShadowMap
  host.appendChild(renderer.domElement)
  const canvas = renderer.domElement
  canvas.tabIndex = 0; canvas.setAttribute('aria-label', '3D кеңістік. Есікті таңдаңыз. Бөлмеде сүйреп айналаға қараңыз.'); canvas.setAttribute('role', 'img')
  const scene = new THREE.Scene(); scene.background = new THREE.Color(room === 'lobby' ? '#17191a' : '#d8cbb5')
  scene.fog = new THREE.Fog(room === 'lobby' ? '#17191a' : '#d8cbb5', room === 'lobby' ? 65 : 30, room === 'lobby' ? 120 : 65)
  const camera = new THREE.PerspectiveCamera(48, 1, .1, 100)
  const textures = [], targets = [], doors = [], animations = []
  let disposed = false, frame, travel = null, drag = null, yaw = 0, pitch = 0, previous = 0, elapsed = 0
  let dirty = true, decorEditor = null
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
  const material = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: .65, ...extra })
  const stone = material('#d8cdb7'), ivory = material('#efe5d1'), gold = material('#b18b46', { metalness: .72, roughness: .3 }), dark = material('#352e28')
  const mesh = (geometry, mat, x, y, z, parent = scene) => { const o = new THREE.Mesh(geometry, mat); o.position.set(x,y,z); o.castShadow = true; o.receiveShadow = true; parent.add(o); return o }
  const box = (w,h,d,x,y,z,mat = stone,parent = scene) => mesh(new THREE.BoxGeometry(w,h,d),mat,x,y,z,parent)
  const sphere = (r,x,y,z,mat,parent=scene) => mesh(new THREE.SphereGeometry(r,16,12),mat,x,y,z,parent)
  const label = (text, x,y,z,w=2,color='#6c5331',parent=scene) => {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 160
    const ctx = c.getContext('2d'); ctx.fillStyle = color; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.font='36px sans-serif'; ctx.fillText(text,512,80)
    const map = new THREE.CanvasTexture(c); map.colorSpace=THREE.SRGBColorSpace; textures.push(map)
    return mesh(new THREE.PlaneGeometry(w,w/6.4),new THREE.MeshBasicMaterial({map,transparent:true,depthWrite:false,side:THREE.DoubleSide}),x,y,z,parent)
  }
  const trim = (x,y,z,w,h,mat=gold,parent=scene) => { box(w,.055,.07,x,y+h/2,z,mat,parent); box(w,.055,.07,x,y-h/2,z,mat,parent); box(.055,h,.07,x-w/2,y,z,mat,parent); box(.055,h,.07,x+w/2,y,z,mat,parent) }
  const column = (x,z) => {
    mesh(new THREE.CylinderGeometry(.22,.29,5.3,20),ivory,x,2.8,z)
    for (const y of [.12,.3,5.42,5.62]) box(.8,.16,.8,x,y,z,ivory)
    for(let i=0;i<12;i++){const a=i*Math.PI/6; mesh(new THREE.CylinderGeometry(.025,.025,4.8,6),stone,x+Math.cos(a)*.245,2.8,z+Math.sin(a)*.245)}
  }
  scene.add(new THREE.HemisphereLight(room === 'lobby' ? '#c7ced5' : '#fff6e2',room === 'lobby' ? '#292521' : '#706656',room === 'lobby' ? 1.2 : 2.3))
  const sun = new THREE.DirectionalLight(room === 'lobby' ? '#d9d4cc' : '#ffe2ae',room === 'lobby' ? 1.05 : 3); sun.position.set(-6,12,10); sun.castShadow=true; sun.shadow.mapSize.set(2048,2048); Object.assign(sun.shadow.camera,{left:-18,right:18,top:18,bottom:-18,far:50}); sun.shadow.normalBias=.03; scene.add(sun)
  const floorMat = material(room === 'lobby' ? '#292b2b' : '#d3c8b4',{roughness:room === 'lobby' ? .93 : .3,metalness:0})
  box(42,.2,45,0,-.14,0,floorMat)
  // Inlaid marble tiles give the room a real scale and a clear ground plane.
  if(room !== 'lobby') for(let x=-10;x<=10;x++) for(let z=-10;z<=10;z++) {
    const tile = box(1.96,.015,1.96,x*2,-.025,z*2,(x+z)%2===0?ivory:stone)
    tile.receiveShadow=true
  }
  const roomWidth = room === 'lobby' ? 24 : 15
  if(room === 'lobby') {
    const wall = material('#303334', { roughness: 1 })
    // A quiet shell with ceiling downlights that reveal the actual door relief.
    for(const [x,w] of [[-10.7875,6.425],[-2.9125,3.025],[3,3.2],[10.7,6.6]])box(w,12,.5,x,6,-.42,wall)
    box(28,6,.5,0,9,-.42,wall)
    for(const x of [-6,0,6])box(3.6,.3,.6,x,-.08,-.02,floorMat)
    const decor = buildLobbyDecor(scene,{textures,onTextureReady:()=>{dirty=true},isDisposed:()=>disposed})
    doors.push(...buildDoors(scene,textures)); targets.push(...doors.map(d=>d.group))
    addDoorLettering(doors[0],textures)
    const doorPoster = addDoorPoster(doors[2].hinge,{textures,onTextureReady:()=>{dirty=true},isDisposed:()=>disposed})
    const doorNote = addMessyDoorNote(doors[2].hinge,textures)
    const yolo = addYoloLettering(doors[2].hinge,textures)
    decorEditor = createDecorEditor({root:decor,extraObjects:[doorPoster,yolo,doorNote],scene,camera,canvas,onObjectClick:object=>{if((object===doorPoster||object===yolo||object===doorNote)&&!travel)onSelect(2)},invalidate:()=>{dirty=true}})
    const portalColors = ['#e1d5ff', '#ffdce9', '#fff0bf']
    doors.forEach((door,i) => {
      // Opaque light seals the doorway: no destination scene is rendered behind it.
      const glowMaterial = new THREE.ShaderMaterial({
        uniforms: { tint: { value: new THREE.Color(portalColors[i]) } },
        vertexShader: 'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
        fragmentShader: 'varying vec2 vUv; uniform vec3 tint; void main(){float core=1.0-smoothstep(0.0,0.72,length((vUv-0.5)*vec2(1.0,0.7)));gl_FragColor=vec4(mix(tint,vec3(1.0),core*0.78),1.0);}',
        side: THREE.DoubleSide, toneMapped: false,
      })
      door.glow = mesh(new THREE.PlaneGeometry(door.width,door.height),glowMaterial,door.x,door.height/2,-.115)
      door.glow.userData.door=i; targets.push(door.glow); door.openAmount=0; door.targetOpen=0
      door.glow.visible = false; door.glow.castShadow = false; door.glow.receiveShadow = false
      door.aura=createPortalAura(portalColors[i],door.width,door.height)
      door.aura.position.x=door.x;door.aura.userData.setStrength(0);scene.add(door.aura)
      door.spill = new THREE.PointLight(portalColors[i],0,8,2)
      door.spill.position.set(door.x,3.4,.7); scene.add(door.spill)
    })

    box(28,.18,14,0,9.2,5,material('#25282a', { roughness: 1 }))
    for(const x of [-6,0,6]) {
      // Soft ceiling bounce reveals the upper wall and the tall ivory cartouche.
      const upperFill = new THREE.PointLight('#e9e0d3', 14, 9, 2)
      upperFill.position.set(x,8.25,2.5)
      scene.add(upperFill)
      const downlight = new THREE.SpotLight('#fff0da', 110, 22, Math.PI / 6, .72, 2)
      downlight.position.set(x,8.95,3.2)
      downlight.target.position.set(x,2.4,0)
      downlight.castShadow = true
      downlight.shadow.mapSize.set(1024,1024)
      downlight.shadow.normalBias = .018
      downlight.shadow.bias = -.00008
      downlight.shadow.camera.near = .2
      downlight.shadow.camera.far = 22
      downlight.shadow.radius = 3
      scene.add(downlight,downlight.target)
      const housing = mesh(new THREE.CylinderGeometry(.18,.18,.08,24),material('#343638'),x,9.05,3.2)
      housing.castShadow = false
      const diffuser = mesh(new THREE.CircleGeometry(.12,24),new THREE.MeshBasicMaterial({color:'#f2e0c4'}),x,9,3.2)
      diffuser.rotation.x = Math.PI / 2
      diffuser.castShadow = false
    }

  } else if(room === 'gallery') {
    box(15,7,.4,0,3.5,-10); box(.4,7,24,-7.5,3.5,1); box(.4,7,24,7.5,3.5,1)
    box(15,.25,24,0,7,1,ivory)
    for(const z of [-8,-2,4,10]){column(-6.8,z);column(6.8,z);box(15,.18,.5,0,5.6,z,ivory)}
    for(const y of [.25,1,5.6,6.5]){box(15,.09,.2,0,y,-9.7,gold);box(.12,.09,24,-7.22,y,1,gold);box(.12,.09,24,7.22,y,1,gold)}
    // Coffered ceiling and chandelier.
    for(let z=-8;z<12;z+=4)for(let x=-5;x<7;x+=3) {box(2.6,.08,3.5,x,6.8,z,stone)}
    for(const z of [-5,4]) {
      mesh(new THREE.CylinderGeometry(.025,.025,2,8),gold,0,6,z)
      const ring=mesh(new THREE.TorusGeometry(1.15,.055,8,48),gold,0,5,z);ring.rotation.x=Math.PI/2
      for(let j=0;j<8;j++){const a=j*Math.PI/4; sphere(.1,Math.cos(a)*1.15,5.15,z+Math.sin(a)*1.15,material('#fff4ce',{emissive:'#ffd899',emissiveIntensity:2}))}
      const light=new THREE.PointLight('#ffe4b7',30,14);light.position.set(0,5,z);scene.add(light)
    }
    graphicWorks.forEach((work,i)=>{
      const g=new THREE.Group();g.position.set(i===3?-7.15:[-4.5,0,4.5][i],3,i===3?1:-9.4); if(i===3)g.rotation.y=Math.PI/2;scene.add(g)
      box(3.35,3.65,.2,0,0,0,dark,g);trim(0,0,.15,3.4,3.7,gold,g);trim(0,0,.19,3.15,3.45,gold,g)
      const art=box(2.85,3.15,.035,0,0,.17,material('#e8dfcc'),g); art.userData.work=i;targets.push(art)
      if(work.src){new THREE.TextureLoader().load(work.src,map=>{if(disposed){map.dispose();return}map.colorSpace=THREE.SRGBColorSpace;textures.push(map);const aspect=map.image.width/map.image.height; const w=Math.min(2.85,3.15*aspect),h=w/aspect;mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map}),0,0,.2,g)},undefined,()=>{})}
      else {label(work.id,0,.3,.21,1.4,'#ac9471',g);label('ЖҰМЫС ЖАҚЫНДА ҚОСЫЛАДЫ',0,-.4,.21,2.5,'#8d7e67',g)}
      box(2.7,.55,.06,0,-2.25,.08,ivory,g);label(work.title,0,-2.2,.13,2.5,'#4d4233',g)
    })
    // Museum seating, with clearance for walking.
    box(3,.2,1.1,0,.65,-2,dark);for(const x of [-1.2,1.2])box(.12,.65,.8,x,.3,-2,gold)
  } else {
    scene.background=new THREE.Color('#171821');scene.fog=new THREE.Fog('#171821',15,40)
    const lab=material('#242530');box(18,7,.3,0,3.5,-8,lab);box(.3,7,22,-9,3.5,2,lab);box(.3,7,22,9,3.5,2,lab)
    const neon=material('#b8a5ff',{emissive:'#8b71ef',emissiveIntensity:2})
    for(const x of [-7,0,7]){box(.035,6,.04,x,3,-7.8,neon);box(3.5,2.2,.2,x,3,-7.6,dark);label('EXPERIMENT / 0'+(x===-7?1:x===0?2:3),x,3,-7.45,3,'#bdb1e3')}
    const sculpture=mesh(new THREE.TorusKnotGeometry(1,.22,96,12),material('#c9b8ee',{metalness:.7,roughness:.2}),0,2.2,-2);animations.push(sculpture);box(2,.7,2,0,.35,-2,lab)
    const fill=new THREE.PointLight('#a88cff',60,20);fill.position.set(0,4,0);scene.add(fill)
  }
  if(room!=='lobby') {
    const portal=createReturnPortal({variant:room==='gallery'?0:2,textures,color:room==='gallery'?'#e1d5ff':'#fff0bf',onExit})
    portal.position.set(0,0,room==='gallery'?8:13)
    scene.add(portal);targets.push(portal)
  }
  function resetCamera() {
    if(room==='lobby'){const distance=Math.max(14,20/(2*Math.tan(THREE.MathUtils.degToRad(24))*camera.aspect));camera.position.set(0,3.6,distance);camera.lookAt(0,3.15,0)}
    else {camera.position.set(0,3.6,room==='gallery'?5:10);camera.lookAt(0,3.6,-8)}
  }
  function resize(){dirty=true;const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();if(!travel)resetCamera()}
  const observer=new window.ResizeObserver(resize);observer.observe(host);resize()
  const ray=new THREE.Raycaster(),pointer=new THREE.Vector2(),keys=new Set()
  const hit = e => {const r=canvas.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);let object=ray.intersectObjects(targets.filter(target=>target.visible),true)[0]?.object;while(object && object.userData.door === undefined && object.userData.work === undefined && !object.userData.action)object=object.parent;return object}
  const down=e=>{canvas.focus();drag={x:e.clientX,y:e.clientY,yaw,pitch,moved:false};canvas.setPointerCapture(e.pointerId)}
  const move=e=>{if(!drag){canvas.style.cursor=hit(e)?'pointer':room==='lobby'?'default':'grab';return}const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>5)drag.moved=true;if(room!=='lobby'){yaw=drag.yaw-dx*.004;pitch=THREE.MathUtils.clamp(drag.pitch-dy*.003,-.6,.6)}}
  const up=e=>{if(drag&&!drag.moved&&!travel){const obj=hit(e);if(obj?.userData.action==='return-portal')obj.userData.activate();else if(obj)onSelect(room==='lobby'?obj.userData.door:obj.userData.work)}drag=null}
  const keydown=e=>{if(e.target!==canvas)return;if(e.key==='Enter'&&!e.repeat){ray.setFromCamera(new THREE.Vector2(0,0),camera);let target=ray.intersectObjects(targets.filter(target=>target.visible),true)[0]?.object;while(target&&!target.userData.action)target=target.parent;if(target?.userData.action==='return-portal'){e.preventDefault();target.userData.activate();return}}if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d'].includes(e.key)){e.preventDefault();keys.add(e.key)}}
  const clear=()=>{keys.clear();drag=null}
  const keyup=e=>keys.delete(e.key)
  canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',clear)
  window.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup);window.addEventListener('blur',clear)
  function openDoor(i){
    if(travel || !doors[i])return
    doors.forEach((door,index)=>{door.targetOpen=index===i?1:0})
    doors[i].glow.visible=true
    dirty=true
  }
  function enter(i,done){
    if(travel || !doors[i])return
    doors[i].targetOpen=1; doors[i].glow.visible = true
    decorEditor?.setEnabled(false)
    travel={i,from:camera.position.clone(),rotation:camera.quaternion.clone(),time:0,done}
    dirty = true
  }
  function tick(now){
    if(disposed)return;frame=requestAnimationFrame(tick);const dt=Math.min((now-(previous||now))/1000,.05);previous=now;if(document.hidden)return;if(room==='lobby'&&!travel&&!dirty&&!doors.some(d=>Math.abs(d.openAmount-d.targetOpen)>.001))return;elapsed+=dt
    doors.forEach(door=>{
      door.openAmount=reduced?door.targetOpen:THREE.MathUtils.lerp(door.openAmount,door.targetOpen,1-Math.exp(-dt*12))
      if(Math.abs(door.openAmount-door.targetOpen)<.001)door.openAmount=door.targetOpen
      door.hinges.forEach(h=>{h.node.rotation.y=h.sign*door.openAmount*Math.PI*.62})
      door.spill.intensity=22*door.openAmount
      door.aura.userData.setStrength(door.openAmount)
      door.glow.visible=door.openAmount>0 || door.targetOpen===1
    })
    if(!reduced)animations.forEach((o)=>{o.rotation.y=elapsed*.3})
    if(travel){
      const t=travel; t.time+=dt
      const duration=reduced ? .16 : 1.45
      const progress=Math.min(t.time/duration,1)
      const door=doors[t.i]
      // Only the second click starts travel; opening itself never moves the camera.
      const approach=Math.max(0,(progress-.08)/.92)
      const smooth=approach*approach*(3-2*approach)
      camera.position.lerpVectors(t.from,new THREE.Vector3(door.x,t.from.y,.18),smooth)
      // Smoothly level the view instead of snapping the gaze down toward the handle.
      camera.quaternion.slerpQuaternions(t.rotation,new THREE.Quaternion(),Math.min(progress/.5,1))
      if(progress>=1){travel=null;t.done();return}
    }
    else if(room!=='lobby'){
      const forward=Number(keys.has('w')||keys.has('ArrowUp'))-Number(keys.has('s')||keys.has('ArrowDown'));const side=Number(keys.has('d')||keys.has('ArrowRight'))-Number(keys.has('a')||keys.has('ArrowLeft'))
      camera.position.x=THREE.MathUtils.clamp(camera.position.x+(-Math.sin(yaw)*forward+Math.cos(yaw)*side)*dt*3,-roomWidth/2+1,roomWidth/2-1)
      camera.position.z=THREE.MathUtils.clamp(camera.position.z+(-Math.cos(yaw)*forward-Math.sin(yaw)*side)*dt*3,-6.5,11)
      camera.lookAt(camera.position.x-Math.sin(yaw)*10,camera.position.y+Math.tan(pitch)*10,camera.position.z-Math.cos(yaw)*10)
    }
    renderer.render(scene,camera);dirty=false
  }
  renderer.render(scene,camera);frame=requestAnimationFrame(tick);onReady()
  function disposeScene(s){const geometries=new Set(),materials=new Set();s.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m))});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose())}
  return { setDecorEditing(value){decorEditor?.setEnabled(value)}, resetDecor(){decorEditor?.reset()}, moveDecorDepth(amount){decorEditor?.nudgeDepth(amount)}, openDoor, enter, view(index){yaw=index===3?Math.PI/2:0;pitch=0;camera.position.set(index===3?-3:[-4.5,0,4.5][index],3.6,index===3?1:-3);canvas.focus()}, dispose(){decorEditor?.dispose();disposed=true;window.cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('keydown',keydown);window.removeEventListener('keyup',keyup);window.removeEventListener('blur',clear);canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointerup',up);canvas.removeEventListener('pointercancel',clear);scene.traverse(o=>{if(o.isLight&&o.shadow)o.shadow.dispose()});disposeScene(scene);textures.forEach(t=>t.dispose());renderer.dispose();canvas.remove()} }
}
