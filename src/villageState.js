export const VILLAGE_STORAGE_KEY = 'akbope-village-v1'
export const todayKey = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }
export const emptyVillage = () => ({ tasks: [], note: '', reflection: '', brief: { problem: '', audience: '', step: '' }, water: { date: todayKey(), count: 0 }, focus: { minutes: 25, remaining: 1500, endsAt: null, task: '', completed: 0 } })
const bounded = (value, fallback, max) => Number.isFinite(value) && value >= 0 && value <= max ? value : fallback
const text = value => typeof value === 'string' ? value.slice(0, 20000) : ''
export function restoreVillage(raw) {
  const clean = emptyVillage()
  if (!raw || typeof raw !== 'object') return clean
  clean.tasks = Array.isArray(raw.tasks) ? raw.tasks.filter(t => t && typeof t.id === 'string' && typeof t.text === 'string').slice(0, 100).map(t => ({ id: t.id, text: t.text.slice(0, 240), done: Boolean(t.done) })) : []
  clean.note = text(raw.note); clean.reflection = text(raw.reflection)
  for (const key of Object.keys(clean.brief)) clean.brief[key] = text(raw.brief?.[key])
  if (raw.water?.date === todayKey()) clean.water.count = Math.floor(bounded(raw.water.count, 0, 100))
  if (raw.focus) {
    const f = raw.focus
    clean.focus = { minutes: [5, 15, 25, 45].includes(f.minutes) ? f.minutes : 25, remaining: bounded(f.remaining, 1500, 2700), endsAt: bounded(f.endsAt, null, Date.now() + 2700000), task: text(f.task).slice(0, 240), completed: Math.floor(bounded(f.completed, 0, 100000)) }
  }
  return clean
}
export const focusSeconds = (focus, now = Date.now()) => focus.endsAt === null ? focus.remaining : Math.min(focus.remaining, Math.max(0, Math.ceil((focus.endsAt - now) / 1000)))
