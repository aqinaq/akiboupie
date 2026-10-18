import React, { useEffect, useRef, useState } from 'react'
import { projects } from './projects.js'
import { emptyVillage, restoreVillage, VILLAGE_STORAGE_KEY, todayKey, focusSeconds } from './villageState.js'
import './village.css'

export const villagePlaces = [
  { id: 'planner', title: 'Руна ұстаханасы', place: '2048 тас ойыны', icon: 'plan', description: 'Бірдей 3D тастарды сырғытып біріктір.' },
  { id: 'notes', title: 'Алхимиктің жады', place: 'Алхимиктің үйі', icon: 'quill', description: 'Сиқырлы құтылардың алты жұбын тап.' },
  { id: 'library', title: 'Жұлдыздар мұрағаты', place: 'Кристалдар үйі', icon: 'book', description: 'Көршілес кристалдарды ауыстырып, тоғызын да жақ.' },
  { id: 'workshop', title: 'Аспан мұнарасы', place: 'Шебердің үйі', icon: 'tools', description: 'Қозғалған кітаптарды дәл түсіріп, 12 қабат құрастыр.' },
  { id: 'mill', title: 'Фокус уақыты', place: 'Жел диірмені', icon: 'time', description: 'Бір істі таңда. Таймер жүріп тұрғанда соған көңіл бөл.' },
  { id: 'well', title: 'Су үзілісі', place: 'Ескі құдық', icon: 'drop', description: 'Бір сәт демалып, ішкен суыңды белгіле.' },
  { id: 'pond', title: 'Тыныш минут', place: 'Тоған жағасы', icon: 'ripple', description: 'Экраннан көзіңді алып, бір минут жай демал.' },
  { id: 'lantern', title: 'Күннің жылы сәті', place: 'Кешкі шам', icon: 'light', description: 'Бүгін жақсы болған бір нәрсені жазып қалдыр.' },
  { id: 'mushrooms', title: 'Кішкентай қадам', place: 'Сиқырлы саңырауқұлақтар', icon: 'spark', description: 'Бүгін орындауға болатын шағын шығармашылық тапсырма ал.' },
]
export function VillageIcon({ kind }) {
  const paths = {
    plan: 'M7 4H20V24H4V4H7M8 3H16V7H8ZM8 12H16M8 17H16',
    quill: 'M5 24L20 4Q26 1 23 9L11 21ZM10 17L17 16M9 24H22',
    book: 'M14 7Q8 3 3 5V23Q8 21 14 25Q20 21 25 23V5Q20 3 14 7V25',
    tools: 'M6 5L22 21M18 3L25 10L21 14L14 7ZM3 22L17 8M3 22L6 25L10 21',
    time: 'M7 3H21M7 25H21M9 3V8L19 20V25M19 3V8L9 20V25M10 8H18M10 22H18',
    drop: 'M14 3C11 9 5 14 5 18A9 9 0 0 0 23 18C23 14 17 9 14 3ZM9 18Q9 22 13 22',
    ripple: 'M4 20Q9 16 14 20T25 20M4 25Q9 21 14 25T25 25M14 3Q4 14 14 15Q24 14 14 3Z',
    light: 'M10 7V4Q14 0 18 4V7M7 8H21L23 24H5ZM10 26H18M14 12V21M10 16H18',
    spark: 'M14 2L17 11L26 14L17 17L14 26L11 17L2 14L11 11ZM23 3V7M21 5H25',
    map: 'M3 6L10 3L18 6L25 3V23L18 26L10 23L3 26ZM10 3V23M18 6V26',
  }
  return <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={paths[kind] || paths.map}/></svg>
}
export function useVillage() {
  const [state, setState] = useState(() => { try { return restoreVillage(JSON.parse(localStorage.getItem(VILLAGE_STORAGE_KEY))) } catch { return emptyVillage() } })
  const [saved, setSaved] = useState(true), [now, setNow] = useState(Date.now)
  useEffect(() => { try { localStorage.setItem(VILLAGE_STORAGE_KEY, JSON.stringify(state)); setSaved(true) } catch { setSaved(false) } }, [state])
  useEffect(() => {
    const tick = () => {
      const time = Date.now(); setNow(time)
      setState(previous => {
        let next = previous
        if (previous.focus.endsAt !== null && previous.focus.endsAt <= time) next = { ...next, focus: { ...previous.focus, endsAt: null, remaining: 0, completed: previous.focus.completed + 1 } }
        if (previous.water.date !== todayKey()) next = { ...next, water: { date: todayKey(), count: 0 } }
        return next
      })
    }
    tick(); const timer = setInterval(tick, 1000)
    document.addEventListener('visibilitychange', tick)
    return () => { clearInterval(timer); document.removeEventListener('visibilitychange', tick) }
  }, [])
  return { state, setState, saved, now }
}
const prompts = ['Кейінге қалдырған бір ісіңнің алғашқы 5 минутын орында.', 'Айналаңдағы бір ыңғайсыз нәрсеге үш қарапайым шешім жаз.', 'Бүгін үйренген бір ойды өз сөзіңмен үш сөйлемге сыйғыз.', 'Бір адамға шынайы рақмет айт.', 'Жұмыс үстеліңдегі бес затты орнына қой.', 'Өзіңе ұнайтын бір интерфейстің шағын нобайын сал.']
const clock = seconds => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
function downloadNote(text, filename) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }))
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
function QuietMinute() {
  const [until, setUntil] = useState(null), [seconds, setSeconds] = useState(60)
  useEffect(() => {
    if (!until) return
    const timer = setInterval(() => { const left = Math.max(0, Math.ceil((until - Date.now()) / 1000)); setSeconds(left); if (!left) setUntil(null) }, 250)
    return () => clearInterval(timer)
  }, [until])
  return <div className="quiet-minute"><div className={`quiet-water ${until ? 'is-flowing' : ''}`} aria-hidden="true"><i/><i/><i/><VillageIcon kind="ripple"/></div><p>{seconds === 0 ? 'Қайта оралуға дайынсың. Асықпай жалғастыр.' : 'Алысқа қара. Иығыңды босат. Өзіңе ыңғайлы қалыпта тыныш отыр.'}</p><output className="village-clock" aria-label="Үзілістің қалған уақыты">{clock(seconds)}</output><button onClick={() => { setSeconds(60); setUntil(until ? null : Date.now() + 60000) }}>{until ? 'Үзілісті тоқтату' : seconds === 0 ? 'Тағы бір минут' : 'Бір минут демалу'}</button><p className="village-hint" role="status">{seconds === 0 ? 'Үзіліс аяқталды.' : until ? 'Уақыт жүріп жатыр.' : 'Бұл үзіліс терезе жабылғанда тоқтайды.'}</p></div>
}
export default function VillageTools({ place, village, onNavigate }) {
  const { state, setState, saved, now } = village
  const [draft, setDraft] = useState(''), [promptIndex, setPromptIndex] = useState(0), [message, setMessage] = useState('')
  const input = useRef(null)
  const info = villagePlaces.find(p => p.id === place)
  const patch = change => setState(previous => ({ ...previous, ...change }))
  const addTask = text => {
    if (!text.trim() || state.tasks.length >= 100) return false
    setState(previous => ({ ...previous, tasks: [...previous.tasks, { id: crypto.randomUUID(), text: text.trim().slice(0, 240), done: false }] }))
    return true
  }
  const focus = state.focus, seconds = focusSeconds(focus, now)
  const changeFocus = change => setState(previous => ({ ...previous, focus: { ...previous.focus, ...change } }))
  return <article className="village-sheet">
    <header className="village-heading"><span className="village-seal"><VillageIcon kind={info?.icon || 'map'}/></span><p className="village-kicker">{info?.place || 'АЛҚАПТАҒЫ ПАЙДАЛЫ ОРЫНДАР'}</p><h2 id="meadow-panel-title">{info?.title || 'Ауыл картасы'}</h2><p>{info?.description || 'Әр мекеннің өз ісі бар. Үйді немесе белгішесін басып кір.'}</p></header>
    {place === 'village' && <div className="village-directory">{villagePlaces.map(p => <button key={p.id} onClick={() => onNavigate(p.id)}><VillageIcon kind={p.icon}/><span><strong>{p.place}</strong><small>{p.title}</small></span><b aria-hidden="true">↗</b></button>)}</div>}
    {place === 'planner' && <>
      <form className="village-add" onSubmit={event => { event.preventDefault(); if (addTask(draft)) { setDraft(''); input.current?.focus() } }}><label htmlFor="village-task">Бүгін не істегің келеді?</label><div><input ref={input} id="village-task" value={draft} onChange={e => setDraft(e.target.value)} maxLength={240} placeholder="Бір нақты қадам…" required/><button disabled={!draft.trim() || state.tasks.length >= 100}>Қосу</button></div></form>
      <p className="village-hint">{state.tasks.filter(t => t.done).length} / {state.tasks.length} орындалды · Тізім өзің өзгерткенше сақталады.</p>
      <ul className="village-tasks">{state.tasks.map(task => <li key={task.id}><label><input type="checkbox" checked={task.done} onChange={() => patch({ tasks: state.tasks.map(t => t.id === task.id ? { ...t, done: !t.done } : t) })}/><span>{task.text}</span></label><button className="village-remove" aria-label={`Істі өшіру: ${task.text}`} onClick={() => patch({ tasks: state.tasks.filter(t => t.id !== task.id) })}>×</button></li>)}</ul>
      {!state.tasks.length && <div className="village-empty">❧<p>Бір кішкентай істен баста.</p></div>}
      {state.tasks.length >= 100 && <p role="status">Дәптерде 100 іс бар. Жаңасын қосу үшін ескісін өшір.</p>}
    </>}
    {['notes', 'lantern'].includes(place) && <><label className="village-label" htmlFor="village-writing">{place === 'notes' ? 'Еркін жазуға арналған парақ' : 'Бүгін не қуантты? Не үйрендің?'}</label><textarea id="village-writing" className="village-writing" rows={8} maxLength={20000} value={place === 'notes' ? state.note : state.reflection} onChange={event => patch({ [place === 'notes' ? 'note' : 'reflection']: event.target.value })} placeholder={place === 'notes' ? 'Ойымды осы жерге қалдырамын…' : 'Бүгінгі жылы сәт…'}/><div className="village-actions"><button disabled={!(place === 'notes' ? state.note : state.reflection).trim()} onClick={() => downloadNote(place === 'notes' ? state.note : state.reflection, place === 'notes' ? 'oi-dapteri.txt' : 'zhyly-sat.txt')}>Жазбаны жүктеу ↓</button><small>{(place === 'notes' ? state.note : state.reflection).length} / 20 000</small></div></>}
    {place === 'mill' && <div className="focus-workbench"><label className="village-label" htmlFor="focus-task">Осы уақытта жасайтын бір ісім</label><input id="focus-task" value={focus.task} maxLength={240} placeholder="Мысалы, жобаның алғашқы нобайын салу" onChange={event => changeFocus({ task: event.target.value })}/><div className="focus-durations" aria-label="Фокус ұзақтығы">{[5, 15, 25, 45].map(minutes => <button key={minutes} aria-pressed={focus.minutes === minutes} disabled={focus.endsAt !== null} onClick={() => changeFocus({ minutes, remaining: minutes * 60, endsAt: null })}>{minutes} мин</button>)}</div><div className={`focus-hourglass ${focus.endsAt !== null ? 'is-running' : ''}`} aria-hidden="true"><VillageIcon kind="time"/></div><output className="village-clock" aria-label="Фокустың қалған уақыты">{clock(seconds)}</output><p role="status">{seconds === 0 ? 'Уақыт аяқталды. Жақсы жұмыс! Енді аздап демал.' : focus.endsAt !== null ? 'Бір іс. Бір тыныш уақыт.' : 'Дайын болғанда баста.'}</p><div className="village-actions"><button onClick={() => changeFocus(focus.endsAt !== null ? { remaining: focusSeconds(focus), endsAt: null } : { endsAt: Date.now() + (seconds || focus.minutes * 60) * 1000, remaining: seconds || focus.minutes * 60 })}>{focus.endsAt !== null ? 'Кідірту' : seconds < focus.minutes * 60 && seconds > 0 ? 'Жалғастыру' : 'Бастау'}</button><button className="village-secondary" onClick={() => changeFocus({ endsAt: null, remaining: focus.minutes * 60 })}>Қайта қою</button></div><p className="village-hint">Терезені жапсаң да таймер жүреді. Аяқталған фокус: {focus.completed}.</p></div>}
    {place === 'well' && <div className="water-workbench"><div className="water-vessel" aria-hidden="true"><div style={{ height: `${Math.min(state.water.count, 8) / 8 * 100}%` }}/><VillageIcon kind="drop"/></div><output className="village-clock">{state.water.count}</output><p>Бүгін белгіленген стақан саны</p><div className="village-actions"><button disabled={state.water.count >= 100} onClick={() => patch({ water: { date: todayKey(), count: Math.min(state.water.count + 1, 100) } })}>Бір стақан іштім</button><button className="village-secondary" disabled={!state.water.count} onClick={() => patch({ water: { ...state.water, count: Math.max(0, state.water.count - 1) } })}>Бір белгіні қайтару</button></div><p className="village-hint">Өзіңе ыңғайлы мөлшерде. Бұл тек есептегіш; күн сайын жаңарады.</p></div>}
    {place === 'pond' && <QuietMinute/>}
    {place === 'library' && <div className="village-library">{['agylshyn', 'mountain', 'aielts'].map(slug => projects.find(p => p.slug === slug)).filter(Boolean).map(project => <a key={project.slug} href={project.url} target="_blank" rel="noreferrer"><img src={project.preview} alt={project.alt}/><span><strong>{project.name}</strong><small>{project.slug === 'agylshyn' ? 'Грамматика, сөздік және IELTS жаттығулары' : project.slug === 'mountain' ? 'Мәтін оқу және сөздерді контексте түсіну' : 'IELTS емтиханына дайындық'}</small><em>Жобаны ашу ↗</em></span></a>)}</div>}
    {place === 'workshop' && <><div className="village-brief">{[['problem','Қандай мәселені шешкім келеді?','Нақты бір қиындықты сипатта.'],['audience','Бұл кімге көмектеседі?','Оны қолданатын адамды елестет.'],['step','Алғашқы кішкентай қадам қандай?','Бүгін 15 минутта не істей аласың?']].map(([key,label,placeholder],i) => <label key={key}><span><b>0{i+1}</b>{label}</span><textarea rows={2} maxLength={2000} value={state.brief[key]} placeholder={placeholder} onChange={event => patch({ brief: { ...state.brief, [key]: event.target.value } })}/></label>)}</div><div className="village-actions"><button disabled={!state.brief.step.trim()} onClick={() => { if (addTask(state.brief.step)) setMessage('Алғашқы қадам күн жоспарына қосылды.'); else setMessage('Жоспар толы. Алдымен бір істі өшір.') }}>Қадамды жоспарға қосу</button><button className="village-secondary" disabled={!Object.values(state.brief).some(s => s.trim())} onClick={() => downloadNote(`Идея шеберханасы\n\nМәселе\n${state.brief.problem}\n\nКімге\n${state.brief.audience}\n\nАлғашқы қадам\n${state.brief.step}`, 'idea.txt')}>Идеяны жүктеу ↓</button></div><p role="status">{message}</p></>}
    {place === 'mushrooms' && <div className="village-prompt"><span aria-hidden="true">✧</span><blockquote>{prompts[promptIndex]}</blockquote><div className="village-actions"><button onClick={() => { if (addTask(prompts[promptIndex])) setMessage('Күн жоспарына қосылды.'); else setMessage('Жоспар толы. Алдымен бір істі өшір.') }}>Жоспарыма қосу</button><button className="village-secondary" onClick={() => { setPromptIndex((promptIndex + 1) % prompts.length); setMessage('') }}>Басқа тапсырма</button></div><p role="status">{message}</p></div>}
    <footer className="village-footer">{place !== 'village' && <button className="village-map-link" onClick={() => onNavigate('village')}><VillageIcon kind="map"/>Ауыл картасы</button>}<small role="status">{saved ? 'Жазбалар мен жоспар осы браузерде сақталады.' : 'Браузер сақтауға рұқсат бермеді. Жазбаны жүктеп ал.'}</small></footer>
  </article>
}
