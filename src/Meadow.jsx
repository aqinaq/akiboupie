import React, { useEffect, useRef, useState } from 'react'
import { profile } from './projects.js'
import TreasureBook from './TreasureBook.jsx'
import HouseGame, { houseGames } from './HouseGame.jsx'
import VillageTools, { villagePlaces, useVillage } from './VillageTools.jsx'
import './treasures.css'

function Flower({ className = '' }) {
  return <svg className={className} viewBox="0 0 80 100" fill="none" aria-hidden="true"><path d="M40 97C34 73 48 51 40 29M39 77Q11 72 20 55Q36 57 39 77M41 64Q65 59 63 44Q46 47 41 64" stroke="currentColor" strokeWidth="2" />{[0,60,120,180,240,300].map(a => <ellipse key={a} cx="40" cy="18" rx="7" ry="14" fill="#eee6c6" stroke="currentColor" strokeWidth="1" transform={`rotate(${a} 40 30)`} />)}<circle cx="40" cy="30" r="6" fill="#bd9749" /></svg>
}

function Keepsake({ kind }) {
  return <span className={`keepsake keepsake-${kind}`} aria-hidden="true">{kind === 'letter' ? <><i /><i /><i /><b>❧</b></> : kind === 'book' ? <><span>❧</span><i />✧</> : <><i /><b>✧</b></>}</span>
}

function GameIcon({ kind }) {
  return <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{kind === 'chest' ? <><path d="M5 14V9Q16 2 27 9V14M5 14H27V26H5ZM4 14H28M10 7V13M22 7V13" /><path d="M14 13H18V19H14Z" /><path d="M8 23H11M21 23H24" /></> : kind === 'close' ? <path d="M9 9L23 23M23 9L9 23" /> : kind === 'reset' ? <><path d="M6 14L16 5L26 14M9 12V26H23V12" /><path d="M13 26V18H19V26" /></> : kind === 'play' ? <path d="M12 7L25 16L12 25Z" /> : <><path d="M11 8V24M21 8V24" /></>}</svg>
}

const treasures = [
  { panel: 'about', kind: 'letter', name: 'Өзім туралы хат' },
  { panel: 'work', kind: 'book', name: 'Жобалар жинағы' },
  { panel: 'contact', kind: 'envelope', name: 'Байланыс' },
  { panel: 'compass', name: 'Компасты айналдыру', action: true },
  { panel: 'key', name: 'Ескі кілтті қозғау', action: true },
  { panel: 'potion', name: 'Құтыны жарқырату', action: true },
]

export default function Meadow() {
  const sceneHost = useRef(null), scene = useRef(null), dialog = useRef(null), itemButtons = useRef({})
  const [ready, setReady] = useState(false), [unavailable, setUnavailable] = useState(false)
  const [opened, setOpened] = useState(false), [panel, setPanel] = useState(null)
  const village = useVillage()
  const callbacks = useRef({}), returnFocus = useRef(null)
  useEffect(() => { callbacks.current = { onChest: () => setOpened(value => !value), onItem: value => { returnFocus.current = itemButtons.current[value]; setPanel(value) }, onWorldAction: value => { returnFocus.current = sceneHost.current?.querySelector('canvas'); setPanel(value) } } })
  useEffect(() => {
    let cancelled = false
    import('./meadowScene.js').then(({ createMeadow }) => {
      if (cancelled) return
      scene.current = createMeadow(sceneHost.current, {
        onReady: () => setReady(true), onError: () => { setUnavailable(true); setReady(true) },
        onChest: () => callbacks.current.onChest(), onItem: value => callbacks.current.onItem(value),
        onWorldAction: value => callbacks.current.onWorldAction(value),
        onHotspots: items => items.forEach(item => {
          const button = itemButtons.current[item.panel]
          if (!button) return
          button.style.left = `${item.x}px`; button.style.top = `${item.y}px`
          button.style.visibility = item.visible ? 'visible' : 'hidden'
          button.disabled = !item.visible
          if (typeof item.pressed === 'boolean') button.setAttribute('aria-pressed', String(item.pressed))
        }),
      })
    }).catch(() => { if (!cancelled) { setUnavailable(true); setReady(true) } })
    return () => { cancelled = true; scene.current?.dispose() }
  }, [])
  useEffect(() => { scene.current?.setOpen(opened) }, [opened, ready])
  useEffect(() => {
    const media = matchMedia('(prefers-reduced-motion: reduce)')
    const update = () => scene.current?.setPaused(media.matches)
    update(); media.addEventListener('change', update)
    return () => media.removeEventListener('change', update)
  }, [ready])
  useEffect(() => {
    scene.current?.setBlocked(Boolean(panel))
    if (panel && !dialog.current.open) {
      const rect = itemButtons.current[panel]?.getBoundingClientRect()
      dialog.current.style.setProperty('--artifact-x', `${rect ? rect.left + rect.width / 2 - innerWidth / 2 : 0}px`)
      dialog.current.style.setProperty('--artifact-y', `${rect ? rect.top + rect.height / 2 - innerHeight / 2 : 80}px`)
      dialog.current.showModal()
    }
    if (!panel && dialog.current.open) dialog.current.close()
  }, [panel, ready])
  useEffect(() => {
    const readHash = () => {
      const value = location.hash.slice(1)
      if (['about', 'work', 'contact'].includes(value)) { setPanel(value); setOpened(true) }
      else if (value === 'village' || villagePlaces.some(p => p.id === value)) setPanel(value)
    }
    readHash(); window.addEventListener('hashchange', readHash); window.addEventListener('popstate', readHash)
    return () => { window.removeEventListener('hashchange', readHash); window.removeEventListener('popstate', readHash) }
  }, [])
  const openPanel = value => { if (['compass', 'key', 'potion'].includes(value)) { scene.current?.interact(value); return } returnFocus.current = itemButtons.current[value] || sceneHost.current?.querySelector('canvas'); setOpened(true); setPanel(value) }
  const navigateVillage = value => setPanel(value)
  const closePanel = () => { setPanel(null); if (location.hash) window.history.replaceState(null, '', location.pathname); (returnFocus.current || sceneHost.current?.querySelector('canvas'))?.focus() }
  return <main className={`meadow-home ${opened ? 'chest-is-open' : ''}`}>
    <section className="meadow-world" aria-label="Гүлді алқап. Бағыттауыш пернелермен жүріңіз, сандықты ашу үшін Enter басыңыз.">
      <div ref={sceneHost} className="meadow-canvas" />
      <div className="meadow-atmosphere" aria-hidden="true" />
      {!ready && <div className="meadow-loading" role="status" aria-label="Алқап жүктеліп жатыр"><Flower /></div>}
      {unavailable && <div className="meadow-fallback" role="status" aria-label="3D көрініс ашылмады. Сандықтағы ақпарат қолжетімді."><Flower /></div>}
      {(opened || unavailable) && <div className={unavailable ? "chest-treasures" : "chest-interior-items"} id="chest-treasures" aria-label="Сандық ішіндегі заттар">{treasures.filter(item => !unavailable || !item.action).map(item => <button className={item.action ? "small-treasure" : undefined} key={item.panel} ref={node => { itemButtons.current[item.panel] = node }} onClick={() => openPanel(item.panel)} aria-label={item.name}>{unavailable && <Keepsake kind={item.kind} />}</button>)}</div>}
    </section>

    <dialog ref={dialog} className={`meadow-dialog meadow-panel-${panel || 'closed'} ${houseGames[panel] ? 'meadow-game-dialog' : ''}`} aria-labelledby="meadow-panel-title" onCancel={event => { event.preventDefault(); closePanel() }} onClose={closePanel} onClick={event => { if (event.target === event.currentTarget) closePanel() }}>
      <button className="meadow-dialog-close" onClick={closePanel} aria-label="Close and return to the meadow"><GameIcon kind="close" /></button>
      {panel === 'about' && <div className="letter-scroll"><article className="personal-letter"><span className="paper-fold fold-upper" aria-hidden="true" /><span className="paper-fold fold-lower" aria-hidden="true" /><span className="letter-date">A LETTER FROM ASTANA</span><Flower className="letter-flower" /><h2 id="meadow-panel-title">Сәлем, I’m Akbope.</h2><p className="letter-lead">A curious mind, a sketchbook full of ideas,<br />and the urge to make them real.</p><p>I’m a product designer and full-stack developer based in Astana, Kazakhstan. I turn ideas into interfaces, and interfaces into working products.</p><p>I like creating useful little worlds: a quieter place to read, a better way to learn, a tool that helps someone find their focus. I care about how things feel, and how they work underneath.</p><p>My work brings together product thinking, visual design, and development. This field is a small collection of things I’ve made along the way.</p><div className="letter-details"><img src="/akbope-portrait.jpg" width="120" height="140" alt="Akbope" /><dl><div><dt>Currently</dt><dd>{profile.education}</dd></div><div><dt>Languages</dt><dd>Kazakh, Russian & English</dd></div><div><dt>Open to</dt><dd>{profile.availability}</dd></div></dl></div><div className="letter-signoff"><span>With curiosity,<b>Akbope</b></span><a href={profile.cv} download>Take a copy of my CV ↓</a></div></article></div>}
      {panel === 'work' && <TreasureBook />}
      {houseGames[panel] && <HouseGame key={panel} place={panel} onExit={closePanel}/>}
      {!houseGames[panel] && (panel === 'village' || villagePlaces.some(p => p.id === panel)) && <VillageTools key={panel} place={panel} village={village} onNavigate={navigateVillage}/>} 
      {panel === 'contact' && <article className="contact-letter"><div className="envelope-stamp">FROM<br />ASTANA<br /><span>✳</span></div><p className="meadow-eyebrow">A NOTE FOR WHATEVER COMES NEXT</p><h2 id="meadow-panel-title">Good things begin<br />with a <em>hello.</em></h2><p>Have a project in mind, an interesting idea,<br />or just want to say сәлем? I’d love to hear from you.</p><div className="meadow-contact-links"><a href={profile.telegram} target="_blank" rel="noreferrer"><span>Send me a note<small>TELEGRAM</small></span>↗</a><a href={profile.linkedin} target="_blank" rel="noreferrer"><span>Let’s connect<small>LINKEDIN</small></span>↗</a><a href={profile.github} target="_blank" rel="noreferrer"><span>Look under the hood<small>GITHUB</small></span>↗</a></div><p className="contact-availability"><i />{profile.availability}</p><Flower /></article>}
    </dialog>
  </main>
}
