import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import * as THREE from 'three'
import { buildLobbyDecor } from '../src/lobbyDecor.js'
import { decorAssets } from '../src/lobbyDecorAssets.js'

test('decor uses original prints and physical props clear of the three doorways', () => {
  const previous=globalThis.document
  const ctx={fillRect(){},strokeRect(){},fillText(){},beginPath(){},moveTo(){},lineTo(){},stroke(){}}
  globalThis.document={createElement:()=>({getContext:()=>ctx}),createElementNS:()=>({addEventListener(){},removeEventListener(){}})}
  const scene=new THREE.Scene(),textures=[]
  try {
    const root=buildLobbyDecor(scene,{textures})
    for(const [key,file] of Object.entries({igor:'igor.png',blond:'blond.png',lana:'lana.png',band:'91.png'})) {
      assert.equal(decorAssets[key],`/decor/${file}`)
      assert.ok(fs.readFileSync(`public/decor/${file}`).equals(fs.readFileSync(file)),`${file} retains the owner's original image`)
    }
    const board=root.getObjectByName('wall-skateboard')
    assert.deepEqual(board.rotation.toArray().slice(0,3),[0,0,0],'board hangs straight')
    const bounds=new THREE.Box3().setFromObject(board),size=bounds.getSize(new THREE.Vector3())
    assert.ok(size.y>size.x*3 && size.z>.3,'deck, trucks and wheels have real depth')
    const roll=root.getObjectByName('half-rolled-blond-poster')
    const p=roll.children[0].geometry.attributes.position
    let flat=0,curled=0
    for(let i=0;i<p.count;i++){if(p.getY(i)<.025)flat++;if(p.getY(i)>.10)curled++}
    assert.ok(flat>p.count*.65 && curled>p.count*.05,'most of the print remains flat with a small raised curl')
    scene.updateMatrixWorld(true)
    const eye=new THREE.Vector3(0,3.6,14)
    for(const row of [10,35]){
      const point=new THREE.Vector3().fromBufferAttribute(p,row*25+12).applyMatrix4(roll.matrixWorld)
      const ray=new THREE.Raycaster(eye,point.clone().sub(eye).normalize())
      const hit=ray.intersectObject(roll,true)[0]
      assert.ok(hit && hit.object===roll.children[0] && Math.abs(hit.distance-eye.distanceTo(point))<.01,'title and portrait are directly visible, not hidden by the curl')
    }
    assert.equal(roll.children[1].material.side,THREE.BackSide,'unprinted paper back faces outward on the curl')
    assert.equal(root.getObjectByName('stacked-floor-books').children.filter(o=>o.name.startsWith('book-')).length,5)
    const caps=root.getObjectByName('stacked-longshot-caps')
    assert.equal(caps.parent,root.getObjectByName('stacked-floor-books'),'caps move with the books')
    assert.equal(caps.position.x,0)
    const topBook=caps.parent.getObjectByName('book-5')
    const topY=new THREE.Box3().setFromObject(topBook).max.y
    const capY=new THREE.Box3().setFromObject(caps).min.y
    assert.ok(Math.abs(capY-topY-.002)<.001,'caps sit on the top cover')
    assert.ok(root.getObjectByName('wall-skateboard').position.x>2)
    assert.ok(root.getObjectByName('stacked-floor-books').position.x>3 && root.getObjectByName('stacked-floor-books').position.x<3.5)
    for (const name of ['rubiks-cube','megaminx','silver-wired-headphones','portable-music-player','vinyl-record-stack','cassette-stack','skool-luv-affair-cd']) assert.ok(root.getObjectByName(name), `${name} is present`)
    for(const name of ['right-display-shelf','igor-poster','band-poster','lana-poster','wall-skateboard','stacked-floor-books','half-rolled-blond-poster']){
      const b=new THREE.Box3().setFromObject(root.getObjectByName(name))
      for(const x of [-6,0,6])assert.ok(b.max.x<x-1.6 || b.min.x>x+1.6 || b.max.y<2 || b.min.y>6.1,`${name} does not occupy a doorway`)
    }
    root.traverse(o=>{if(o.geometry)for(const value of o.geometry.attributes.position.array)assert.ok(Number.isFinite(value))})
  } finally {
    globalThis.document=previous
    const gs=new Set(),ms=new Set();scene.traverse(o=>{if(o.geometry)gs.add(o.geometry);if(o.material)ms.add(o.material)})
    gs.forEach(g=>g.dispose());ms.forEach(m=>m.dispose());textures.forEach(t=>t.dispose())
  }
})
