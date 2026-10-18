import assert from 'node:assert/strict'
import { emptyVillage, restoreVillage, focusSeconds, todayKey } from '../../../src/villageState.js'
const initial = emptyVillage()
assert.deepEqual(restoreVillage(null), initial)
assert.equal(restoreVillage({ tasks: [null, 1, { id: '1', text: 'A', done: true }], note: 4, water: { date: 'old', count: 7 } }).tasks.length, 1)
assert.equal(restoreVillage({ water: { date: 'old', count: 7 } }).water.count, 0)
assert.equal(restoreVillage({ water: { date: todayKey(), count: 3 } }).water.count, 3)
const running = { ...initial.focus, endsAt: 100000, remaining: 60 }
assert.equal(focusSeconds(running, 50000), 50)
assert.equal(focusSeconds(running, 99999), 1)
assert.equal(focusSeconds(running, 110000), 0)
assert.equal(focusSeconds(running, 10000), 60, 'stale UI clock cannot increase time after starting')
const paused = { ...running, remaining: 37, endsAt: null }
assert.equal(focusSeconds(paused, 200000), 37)
const reloaded = restoreVillage(JSON.parse(JSON.stringify({ ...initial, tasks: [{ id: 'one', text: 'Next step', done: true }], note: 'Hello', brief: { problem: 'Problem', audience: 'Reader', step: 'Sketch' }, focus: { ...initial.focus, endsAt: Date.now() + 60000 } })))
assert.equal(reloaded.tasks[0].done, true)
assert.equal(reloaded.note, 'Hello')
assert.equal(reloaded.brief.step, 'Sketch')
assert.ok(focusSeconds(reloaded.focus) <= 60 && focusSeconds(reloaded.focus) >= 59)
console.log('PASS: corrupted storage recovery, task/note/brief persistence, daily water rollover, timer pause, background deadlines and reload recovery.')
