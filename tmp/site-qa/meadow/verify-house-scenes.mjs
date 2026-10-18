import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import * as THREE from 'three'
import { pathToFileURL } from 'node:url'
let selected, rendered, nextFrame, message, resized, disposed=0, exited=0
const noop=()=>{}, handlers={}, timers=new Map()
const context=new Proxy({}, {get:()=>noop,set:()=>true})
globalThis.document={hidden:false,createElement:()=>({getContext:()=>context})}
globalThis.window=globalThis
globalThis.devicePixelRatio=1
globalThis.matchMedia=()=>({matches:false})
globalThis.localStorage={getItem:()=>null,setItem:noop}
globalThis.ResizeObserver=class{constructor(fn){resized=fn}observe(){}disconnect(){}}
globalThis.requestAnimationFrame=fn=>{nextFrame=fn;return 1}
globalThis.cancelAnimationFrame=noop
const realTimeout=globalThis.setTimeout,realClear=globalThis.clearTimeout
let serial=0
globalThis.setTimeout=(fn)=>{timers.set(++serial,fn);return serial}
globalThis.clearTimeout=id=>timers.delete(id)
const flush=()=>{const pending=[...timers.values()];timers.clear();pending.forEach(fn=>fn())}
let width=1440,height=900
const host={appendChild:noop,getBoundingClientRect:()=>({width,height})}
globalThis.GameRenderer=class{
 shadowMap={}
 domElement={setAttribute:noop,style:{},focus:noop,setPointerCapture:noop,addEventListener:(k,fn)=>handlers[k]=fn,removeEventListener:k=>delete handlers[k],remove:noop,getBoundingClientRect:()=>({left:0,top:0,width,height})}
 setPixelRatio(){}setSize(){}render(scene,camera){scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);rendered={scene,camera}}dispose(){disposed++}
}
let source=await readFile('src/houseGameScene.js','utf8')
source=source.replace("from 'three'",`from '${pathToFileURL(process.cwd()+'/node_modules/three/build/three.module.js')}'`).replace("from './houseGameRules.js'",`from '${pathToFileURL(process.cwd()+'/src/houseGameRules.js')}'`).replace("from './houseRooms.js'",`from '${pathToFileURL(process.cwd()+'/src/houseRooms.js')}'`).replace("from './houseArtifacts.js'",`from '${pathToFileURL(process.cwd()+'/src/houseArtifacts.js')}'`).replace('new THREE.WebGLRenderer(','new globalThis.GameRenderer(')
const {createHouseGame}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'))
const step=(count=20)=>{for(let i=0;i<count;i++)nextFrame((step.time+=16))};step.time=0
for(const place of ['planner','notes','library','workshop']){
 const api=createHouseGame(host,{place,info:{title:place,hint:'test',controls:'test'},onExit:()=>exited++,onStatus:s=>message=s,onInspect:value=>selected=value})
 step(1)
 const root=()=>rendered.scene
 const activate=name=>{const object=root().getObjectByName(name);assert.ok(object,name);object.userData.activate()}
 const door=root().getObjectByName('game-exit')
 assert.ok(door.position.z<-5.5&&door.position.y<-1,'door is mounted in rear wall at floor level')
 const catalog=[];root().traverse(o=>{if(o.userData.project)catalog.push(o)})
 assert.equal(catalog.length,9,'all real projects appear in every room')
 function checkProjectPicking(label){
  step(100)
  const targets=[];root().traverse(o=>{if(o.userData.activate)targets.push(o)})
  for(const object of catalog){
   const center=object.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0,.55,0)).project(rendered.camera)
   assert.ok(Math.abs(center.x)<1&&Math.abs(center.y)<1,`${label}: ${object.name} fits`)
   const ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2(center.x,center.y),rendered.camera)
   let picked=ray.intersectObjects(targets,true)[0]?.object
   while(picked&&!picked.userData.activate)picked=picked.parent
   assert.equal(picked?.userData.project,object.userData.project,`${label}: ${object.name} directly pickable (hit ${picked?.name})`)
  }
 }
 checkProjectPicking(`${place} desktop`)

 for(const item of catalog){item.userData.activate();assert.equal(selected.slug,item.userData.project)}
 activate('about-scroll');assert.equal(selected.kind,'about')
 api.setInspection({kind:'project',slug:'focus10'});step(30);api.setInspection(null);step(30)

 if(place==='planner'){
  for(const key of ['ArrowLeft','ArrowDown','ArrowRight','ArrowUp']){handlers.keydown({key,preventDefault:noop,stopPropagation:noop});step()}
  assert.match(message,/ұпай/)
 }
 if(place==='notes'){
  activate('potion-0');const material=root().getObjectByName('potion-0').userData.liquid.material
  assert.equal(root().getObjectByName('potion-0').userData.symbol.visible,true)
  activate('potion-1');assert.match(message,/1 қадам/);flush();step()
  if(root().getObjectByName('potion-1').userData.liquid.material===material)assert.match(message,/1 \/ 6/)
  else assert.equal(root().getObjectByName('potion-0').userData.symbol.visible,false)
  // Learn all symbols through the actual reveal actions, then solve the deck.
  api.restart();step()
  const pairs=new Map()
  for(let i=0;i<12;i+=2){activate(`potion-${i}`);activate(`potion-${i+1}`);for(const index of [i,i+1]){const id=root().getObjectByName(`potion-${index}`).userData.liquid.material.uuid;pairs.set(id,[...(pairs.get(id)||[]),index])}flush()}
  for(const indices of pairs.values())for(const i of indices)activate(`potion-${i}`)
  assert.match(message,/Барлық 6 жұп/)
 }
 if(place==='library'){
  const initial=root().getObjectByName('crystal-0').userData.gem.material
  activate('crystal-0');assert.notEqual(root().getObjectByName('crystal-0').userData.gem.material,initial)
  assert.match(message,/1 қадам/)
 }
 if(place==='workshop'){
  // At t≈0 the moving stone overlaps the base; a delayed bad drop is a loss.
  handlers.keydown({key:' ',code:'Space',preventDefault:noop,repeat:false});assert.match(message,/қабат/)
  api.restart();step();assert.ok(root().getObjectByName('moving-tower-book'))
  const before=root().getObjectByName('moving-tower-book').position.clone();api.setInspection({kind:'about'});step(60);assert.ok(root().getObjectByName('moving-tower-book').position.equals(before),'tower pauses during artifact reading');api.setInspection(null)
  let previous=root().getObjectByName('tower-base-book')
  assert.ok(previous.children.length>20,'books have covers, pages and gilded details')
  for(let level=1;level<=12;level++){
   const moving=root().getObjectByName('moving-tower-book'),axis=level%2?'x':'z'
   let attempts=0
   while(Math.abs(moving.position[axis]-previous.position[axis])>.05&&attempts++<1000)step(1)
   assert.ok(attempts<1000,'book crosses the stack')
   moving.userData.activate()
   assert.equal(moving.name,'placed-tower-book')
   assert.equal(moving.scale.y,1,'stacking preserves book thickness and page geometry')
   previous=moving
  }
  assert.match(message,/дайын/)

 }
 width=390;height=844;resized();step(1);checkProjectPicking(`${place} mobile`)
 for(const name of ['game-exit','game-reset']){
  const o=root().getObjectByName(name),p=o.getWorldPosition(new THREE.Vector3());p.y+=name==='game-exit'?2.4:.6;p.project(rendered.camera)
  assert.ok(Math.abs(p.x)<1&&Math.abs(p.y)<1,`${place}: ${name} fits mobile`)
  const ray=new THREE.Raycaster();ray.setFromCamera(new THREE.Vector2(p.x,p.y),rendered.camera)
  const targets=[];root().traverse(o=>{if(o.userData.activate)targets.push(o)})
  let picked=ray.intersectObjects(targets,true)[0]?.object;while(picked&&!picked.userData.activate)picked=picked.parent
  assert.equal(picked?.name,name,`${place}: ${name} is reachable after playing`)
 }
 activate('game-reset');activate('game-exit');api.dispose();assert.equal(timers.size,0);assert.equal(Object.keys(handlers).length,0)
 width=1440;height=900
}
assert.equal(disposed,4);assert.equal(exited,4)
globalThis.setTimeout=realTimeout;globalThis.clearTimeout=realClear
console.log('PASS: all four real Three.js games, 2048 keyboard moves, memory reveal/mismatch/full win, crystal toggles, 12-book tower win and inspection pause, all nine project objects pickable in all rooms on desktop/mobile, biography, wall exits, restart, and resource/listener/timer cleanup.')
