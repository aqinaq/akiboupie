import test from 'node:test'
import assert from 'node:assert/strict'
import * as THREE from 'three'
import { createDecorEditor, createDecorLayout } from '../src/decorEditor.js'

function fixture() {
  const root=new THREE.Group(),shelf=new THREE.Group()
  shelf.name='right-display-shelf';shelf.position.set(4,0,0);root.add(shelf)
  const cube=new THREE.Mesh(new THREE.BoxGeometry(1,1,1),new THREE.MeshBasicMaterial())
  cube.name='rubiks-cube';cube.position.set(0,2,0);shelf.add(cube)
  return {root,shelf,cube}
}
function storage() { const data=new Map();return {getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v)} }

test('layout persists local item positions and restores the original arrangement',()=>{
  const store=storage(),a=fixture(),layout=createDecorLayout(a.root,store)
  a.shelf.position.x=6;a.cube.position.x=.4;layout.save()
  const b=fixture(),restored=createDecorLayout(b.root,store)
  assert.equal(b.shelf.position.x,6);assert.equal(b.cube.position.x,.4)
  assert.equal(b.cube.getWorldPosition(new THREE.Vector3()).x,6.4)
  restored.reset();assert.equal(b.shelf.position.x,4);assert.equal(b.cube.position.x,0)
  const c=fixture();createDecorLayout(c.root,store);assert.equal(c.shelf.position.x,4)
  assert.doesNotThrow(()=>createDecorLayout(c.root,{getItem:()=>'{broken'}))
})

test('direct dragging works immediately, preserves empty-space clicks, cancels safely and saves',()=>{
  const previous=globalThis.window,store=storage(),listeners=new Map(),captured=new Set()
  globalThis.window={localStorage:store,addEventListener(){},removeEventListener(){}}
  const canvas={style:{},focus(){},getBoundingClientRect:()=>({left:0,top:0,width:800,height:600}),
    addEventListener:(n,f)=>listeners.set(n,f),removeEventListener:n=>listeners.delete(n),
    setPointerCapture:id=>captured.add(id),hasPointerCapture:id=>captured.has(id),releasePointerCapture(id){captured.delete(id);listeners.get('lostpointercapture')?.({})}}
  const {root,shelf,cube}=fixture(),scene=new THREE.Scene();scene.add(root)
  const camera=new THREE.PerspectiveCamera(48,800/600,.1,100);camera.position.set(4,2,10);camera.lookAt(4,2,0);camera.updateMatrixWorld()
  let draws=0,clicks=0
  const editor=createDecorEditor({root,scene,camera,canvas,invalidate:()=>draws++,onObjectClick:()=>clicks++})
  const event=(x=400,y=300)=>({clientX:x,clientY:y,pointerId:1,button:0,target:canvas,preventDefault(){this.stopped=true},stopImmediatePropagation(){this.stopped=true}})
  try {
    const plain=event(30,30);listeners.get('pointerdown')(plain);assert.equal(plain.stopped,undefined)
    const plainUp=event(30,30);listeners.get('pointerup')(plainUp);assert.equal(plainUp.stopped,undefined)
    listeners.get('pointerdown')(event());listeners.get('pointermove')(event(402));listeners.get('pointerup')(event(402))
    assert.equal(clicks,1);assert.equal(cube.position.x,0,'click jitter does not move a prop')
    const down=event();listeners.get('pointerdown')(down);assert.equal(down.stopped,true)
    listeners.get('pointermove')(event(450));assert.ok(cube.position.x>.5);assert.equal(shelf.position.x,4)
    listeners.get('pointercancel')(event());assert.equal(cube.position.x,0);assert.equal(captured.size,0)
    listeners.get('pointerdown')(event());listeners.get('pointermove')(event(450));listeners.get('pointerup')(event(450))
    assert.equal(clicks,1,'dragging does not activate door click callbacks')
    const moved=cube.position.x;assert.ok(moved>.5)
    const restored=fixture();createDecorLayout(restored.root,store);assert.equal(restored.cube.position.x,moved)
    editor.nudgeDepth(.2);assert.equal(cube.position.z,.2)
    editor.setEnabled(false);const off=event();listeners.get('pointerdown')(off);assert.equal(off.stopped,undefined)
    assert.ok(draws>3)
  } finally {editor.dispose();globalThis.window=previous;cube.geometry.dispose();cube.material.dispose()}
  assert.equal(listeners.size,0)
})
