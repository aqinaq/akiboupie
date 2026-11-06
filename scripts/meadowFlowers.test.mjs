import test from 'node:test'
import assert from 'node:assert/strict'
import * as THREE from 'three'
import { buildMeadowFlowers, pickBloom } from '../src/meadowFlowers.js'

test('flower selection chooses the nearest head and respects occlusion distance', () => {
  const ray = new THREE.Ray(new THREE.Vector3(0,1,10), new THREE.Vector3(0,0,-1))
  const far = {center:new THREE.Vector3(0,1,0),radius:.4}, near = {center:new THREE.Vector3(0,1,5),radius:.4}
  assert.equal(pickBloom(ray,[far,near]).bloom,near)
  assert.equal(pickBloom(ray,[far,near],4),null)
  assert.equal(pickBloom(ray,[{center:new THREE.Vector3(5,1,0),radius:.4}]),null)
})
test('colored dust uses a bounded pool, fades out, and stays still with reduced motion', () => {
  let seed=42
  const random=()=>{seed=(seed*16807)%2147483647;return(seed-1)/2147483646}
  const scene=new THREE.Scene()
  const field=buildMeadowFlowers({scene,random,height:()=>0,pathDistance:x=>Math.abs(x),mobile:true})
  assert.ok(field.blooms.length>500)
  assert.equal(new Set(field.blooms.map(b=>b.color)).size,6)
  for(const mesh of scene.children.filter(o=>o.isInstancedMesh)) assert.ok(mesh.count<=mesh.instanceMatrix.count)
  const dust=scene.getObjectByName('flower-color-dust'), attrs=dust.geometry.attributes
  const bloom=field.blooms[0]; field.burst(bloom,true)
  const color=new THREE.Color(bloom.color)
  assert.ok(Math.abs(attrs.color.getX(0)-color.r)<1e-6)
  const position=Array.from(attrs.position.array)
  field.update(.2);assert.deepEqual(Array.from(attrs.position.array),position)
  assert.ok(attrs.dustAlpha.getX(0)>0 && attrs.dustAlpha.getX(0)<.85)
  field.update(2);assert.equal(attrs.dustAlpha.getX(0),0)
  for(let i=0;i<30;i++)field.burst(field.blooms[i])
  assert.equal(attrs.position.count,384)
  field.update(3);assert.ok(attrs.dustAlpha.array.every(a=>a===0))
})
