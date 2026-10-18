import assert from 'node:assert/strict'
import { slideRunes, canSlide, toggleCrystals, towerOverlap } from '../../../src/houseGameRules.js'
const board=(row)=>[...row,...Array(12).fill(0)]
assert.deepEqual(slideRunes(board([2,2,2,2]),'left').board.slice(0,4),[4,4,0,0])
assert.equal(slideRunes(board([2,2,2,2]),'left').score,8)
assert.deepEqual(slideRunes(board([2,2,4,0]),'left').board.slice(0,4),[4,4,0,0],'newly merged tiles cannot merge twice')
assert.deepEqual(slideRunes(board([2,0,2,4]),'right').board.slice(0,4),[0,0,4,4])
const vertical=[2,0,0,0,2,0,0,0,4,0,0,0,4,0,0,0]
assert.deepEqual(slideRunes(vertical,'up').board,[4,0,0,0,8,0,0,0,0,0,0,0,0,0,0,0])
assert.deepEqual(slideRunes(vertical,'down').board,[0,0,0,0,0,0,0,0,4,0,0,0,8,0,0,0])
assert.equal(slideRunes(board([2,4,8,16]),'left').changed,false)
assert.equal(canSlide([2,4,2,4,4,2,4,2,2,4,2,4,4,2,4,2]),false)
assert.equal(canSlide([2,2,2,4,4,2,4,2,2,4,2,4,4,2,4,2]),true)
const lit=Array(9).fill(true)
assert.deepEqual(toggleCrystals(lit,0),[false,false,true,false,true,true,true,true,true])
assert.deepEqual(toggleCrystals(toggleCrystals(lit,4),4),lit)
// All generated four-switch puzzles are solvable by replaying their switches.
for(let mask=0;mask<512;mask++) {
 const switches=Array.from({length:9},(_,i)=>i).filter(i=>mask&(1<<i))
 const puzzle=switches.reduce(toggleCrystals,lit)
 assert.deepEqual(switches.reduce(toggleCrystals,puzzle),lit)
}
const previous={x:0,z:0,width:3,depth:3}
assert.equal(towerOverlap(previous,{...previous,x:1},'x').width,2)
assert.equal(towerOverlap(previous,{...previous,x:1},'x').x,.5)
assert.equal(towerOverlap(previous,{...previous,z:-1},'z').depth,2)
assert.equal(towerOverlap(previous,{...previous,x:4},'x').width,0)
console.log('PASS: 2048 directions, single merges, scores and deadlocks; crystal puzzle solvability; tower overlap and misses.')
