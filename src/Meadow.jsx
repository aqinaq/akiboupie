import { t } from './i18n.js'
import React, { useEffect, useRef, useState } from 'react'
import { profile } from './projects.js'
import ProjectHologram from './TreasureBook.jsx'

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
  { panel: 'about', kind: 'letter', name: t("Өзім туралы хат") },
  { panel: 'contact', kind: 'envelope', name: t("Байланыс") },
  { panel: 'compass', name: t("Компасты айналдыру"), action: true },
  { panel: 'key', name: t("Ескі кілтті қозғау"), action: true },
  { panel: 'potion', name: t("Құтыны жарқырату"), action: true },
]

export default function Meadow({ onExit }) {
  const sceneHost = useRef(null), scene = useRef(null), dialog = useRef(null), itemButtons = useRef({})
  const [ready, setReady] = useState(false), [unavailable, setUnavailable] = useState(false)
  const [opened, setOpened] = useState(false), [panel, setPanel] = useState(null)
  const callbacks = useRef({}), returnFocus = useRef(null), worldOverlay = useRef(null)
  const openPanel = value => { if (['compass', 'key', 'potion'].includes(value)) { scene.current?.interact(value); return } returnFocus.current = document.activeElement instanceof window.HTMLElement && document.activeElement !== document.body ? document.activeElement : itemButtons.current[value] || sceneHost.current?.querySelector('canvas'); setOpened(value === 'contact'); if (value === 'work' && scene.current?.approachStudio) { scene.current.approachStudio(() => setPanel('work')); return } setPanel(value) }
  useEffect(() => { callbacks.current = { onChest: () => { if (panel === 'work') { scene.current?.leaveStudio(); setPanel(null) } else setOpened(value => !value) }, onItem: value => openPanel(value), onExit } })
  useEffect(() => {
    let cancelled = false
    import('./meadowScene.js').then(({ createMeadow }) => {
      if (cancelled) return
      scene.current = createMeadow(sceneHost.current, {
        onExit: () => callbacks.current.onExit?.(), onReady: () => setReady(true), onError: () => { setUnavailable(true); setReady(true) },
        onChest: () => callbacks.current.onChest(), onItem: value => callbacks.current.onItem(value),
        onHotspots: items => items.forEach(item => {
          if (item.panel === 'work' && worldOverlay.current) {
            worldOverlay.current.style.setProperty('--source-x', `${item.x}px`)
            worldOverlay.current.style.setProperty('--source-y', `${item.y}px`)
          }
          if (item.panel === 'statue' && dialog.current) {
            dialog.current.style.setProperty('--source-x', `${item.x}px`)
            dialog.current.style.setProperty('--source-y', `${item.y}px`)
            if (dialog.current.open) {
              const bounds = dialog.current.getBoundingClientRect()
              dialog.current.style.setProperty('--projection-left', `${bounds.left}px`)
              dialog.current.style.setProperty('--projection-top', `${bounds.top}px`)
              dialog.current.style.setProperty('--projection-right', `${bounds.right}px`)
              dialog.current.style.setProperty('--projection-bottom', `${bounds.bottom}px`)
              dialog.current.style.setProperty('--projection-height', `${bounds.height}px`)
              dialog.current.style.setProperty('--projection-center-y', `${bounds.top + bounds.height / 2}px`)
              dialog.current.style.setProperty('--projection-center', `${bounds.left + bounds.width / 2}px`)
              dialog.current.style.setProperty('--projection-width', `${bounds.width}px`)
            }
          }
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
    const modal = panel && panel !== 'work'
    if (modal && !dialog.current.open) {
      const rect = itemButtons.current[panel]?.getBoundingClientRect()
      dialog.current.style.setProperty('--artifact-x', `${rect ? rect.left + rect.width / 2 - window.innerWidth / 2 : 0}px`)
      dialog.current.style.setProperty('--artifact-y', `${rect ? rect.top + rect.height / 2 - window.innerHeight / 2 : 80}px`)
      dialog.current.showModal()
    }
    if (!modal && dialog.current.open) dialog.current.close()
  }, [panel, ready])
  useEffect(() => {
    const readHash = () => {
      const value = location.hash.slice(1)
      if (['about', 'work', 'contact'].includes(value)) { setPanel(value); setOpened(value === 'contact') }
    }
    readHash(); window.addEventListener('hashchange', readHash); window.addEventListener('popstate', readHash)
    return () => { window.removeEventListener('hashchange', readHash); window.removeEventListener('popstate', readHash) }
  }, [])

  const closePanel = () => { if (panel === 'work') scene.current?.leaveStudio(); setPanel(null); if (location.hash) window.history.replaceState(null, '', location.pathname + location.search); (returnFocus.current?.isConnected ? returnFocus.current : sceneHost.current?.querySelector('canvas'))?.focus() }
  return <main className={`meadow-home ${opened ? 'chest-is-open' : ''}`}>
    {!panel && onExit && <button className="world-turn" onClick={() => scene.current?.lookAtPortal()}>↶ {t("Артқа қарау · портал")}</button>}
    <section className="meadow-world" aria-label={t("3D fantasy meadow. Walk with arrow keys, drag to look around, and press Enter to open the chest.")}>
      <div ref={sceneHost} className="meadow-canvas" />
      <div className="meadow-atmosphere" aria-hidden="true" />
      <div className="world-hologram-anchor" ref={worldOverlay}>
        {panel === 'work' && <><div className="world-hologram-beam" aria-hidden="true" /><ProjectHologram onClose={closePanel} /></>}
      </div>
      {ready && !unavailable && !panel && <button className="statue-hotspot" ref={node => { itemButtons.current.statue = node }} onClick={() => openPanel('about')} aria-label={t('About')} />}
      {ready && !unavailable && !panel && <button className="studio-hotspot" ref={node => { itemButtons.current.work = node }} onClick={() => openPanel('work')} aria-label={t('Open the project journal')} />}
      {!ready && <div className="meadow-loading" role="status" aria-label={t("Жайлау жүктеліп жатыр")}>
        <div className="meadow-loading-content" aria-hidden="true">
          <span className="meadow-loading-name">akbope<span>.</span></span>
          <span className="meadow-loading-track"><span /></span>
          <span className="meadow-loading-caption">{t("Жайлау жүктеліп жатыр")}</span>
        </div>
      </div>}
      {unavailable && <div className="meadow-fallback" role="status" aria-label={t("3D көрініс ашылмады. Сандықтағы ақпарат қолжетімді.")}><Flower /></div>}
      {(opened || unavailable) && <div className={unavailable ? "chest-treasures" : "chest-interior-items"} id="chest-treasures" aria-label={t("Сандық ішіндегі заттар")}>{(unavailable ? [...treasures.filter(item => !item.action), { panel: 'work', kind: 'book', name: t('Projects') }] : treasures).map(item => <button className={item.action ? "small-treasure" : undefined} key={item.panel} ref={node => { itemButtons.current[item.panel] = node }} onClick={() => openPanel(item.panel)} aria-label={item.name}>{unavailable && <Keepsake kind={item.kind} />}</button>)}</div>}
      {ready && !panel && !unavailable && <div className="meadow-game-hint" role="status">
        <span className="game-hint-ornament" aria-hidden="true">✧</span>
        <h1>{opened ? t("You found my little collection.") : t("Welcome to Akbope’s little world.")}</h1>
        <p className="game-hint-story">{opened ? t("The letter tells my story. The envelope is your way to say hello. My projects live in the cottage studio.") : t("Touch the statue’s violet stone to meet me, visit the studio for projects, or open the chest for keepsakes.")}</p>
        {opened && <p className="game-hint-objective">{t("Close the chest to explore the studio.")}</p>}
        <small className="game-hint-desktop">{opened ? t("Choose a keepsake") : t("Arrow keys to walk · Drag to look · Click the studio to explore")}</small>
        <small className="game-hint-touch">{opened ? t("Choose a keepsake") : t("Tap the studio sign to explore")}</small>
      </div>}
      <nav className="portfolio-nav" aria-label={t("Portfolio shortcuts")}>
        <button onClick={() => openPanel('about')}>{t("About")}</button>
        <button className="portfolio-nav-projects" aria-pressed={panel === 'work'} onClick={() => openPanel('work')}>{t("Projects")}</button>
        <button onClick={() => openPanel('contact')}>{t("Contact")}</button>
        <button className="mobile-chest-toggle" disabled={panel === 'work'} onClick={() => setOpened(value => !value)} aria-label={opened ? t("Close the chest") : t("Open the chest")} aria-expanded={opened}><GameIcon kind={opened ? 'close' : 'chest'} /></button>
      </nav>
    </section>

    <dialog ref={dialog} className={`meadow-dialog meadow-panel-${panel || 'closed'}`} aria-labelledby="meadow-panel-title" onCancel={event => { event.preventDefault(); closePanel() }} onClose={() => { if (panel !== 'work') closePanel() }} onClick={event => { if (event.target === event.currentTarget) closePanel() }}>
      <button className="meadow-dialog-close" onClick={closePanel} aria-label={t("Жайлауға оралу")}><GameIcon kind="close" /></button>
      {panel === 'about' && <><div className="about-projection-beam" aria-hidden="true" /><div className="about-projection-halo" aria-hidden="true" /><div className="letter-scroll"><article className="personal-letter"><span className="paper-fold fold-upper" aria-hidden="true" /><span className="paper-fold fold-lower" aria-hidden="true" /><span className="letter-date">{t("A PROJECTION FROM THE VIOLET STONE")}</span><Flower className="letter-flower" /><h2 id="meadow-panel-title">{t("Сәлем, I’m Akbope.")}</h2><p className="letter-lead">{t("A curious mind, a sketchbook full of ideas,")}<br />{t("and the urge to make them real.")}</p><p>{t("I’m a product designer and full-stack developer based in Astana, Kazakhstan. I turn ideas into interfaces, and interfaces into working products.")}</p><p>{t("I like creating useful little worlds: a quieter place to read, a better way to learn, a tool that helps someone find their focus. I care about how things feel, and how they work underneath.")}</p><p>{t("My work brings together product thinking, visual design, and development. This field is a small collection of things I’ve made along the way.")}</p><div className="letter-details"><img src="/akbope-portrait.jpg" width="120" height="140" alt="Akbope" /><dl><div><dt>{t("Currently")}</dt><dd>{profile.education}</dd></div><div><dt>{t("Languages")}</dt><dd>{t("Kazakh, Russian & English")}</dd></div><div><dt>{t("Open to")}</dt><dd>{profile.availability}</dd></div></dl></div><div className="letter-signoff"><span>{t("With curiosity,")}<b>Akbope</b></span><a href={profile.cv} download>{t("Take a copy of my CV ↓")}</a></div></article></div></>}
      
      {panel === 'contact' && <article className="contact-letter"><div className="envelope-stamp">{t("FROM")}<br />{t("ASTANA")}<br /><span>✳</span></div><p className="meadow-eyebrow">{t("A NOTE FOR WHATEVER COMES NEXT")}</p><h2 id="meadow-panel-title">{t("Good things begin")}<br />{t("with a")} <em>{t("hello.")}</em></h2><p>{t("Have a project in mind, an interesting idea,")}<br />{t("or just want to say сәлем? I’d love to hear from you.")}</p><div className="meadow-contact-links"><a href={profile.telegram} target="_blank" rel="noreferrer"><span>{t("Send me a note")}<small>TELEGRAM</small></span>↗</a><a href={profile.linkedin} target="_blank" rel="noreferrer"><span>{t("Let’s connect")}<small>LINKEDIN</small></span>↗</a><a href={profile.github} target="_blank" rel="noreferrer"><span>{t("Look under the hood")}<small>GITHUB</small></span>↗</a></div><p className="contact-availability"><i />{profile.availability}</p><Flower /></article>}
    </dialog>
  </main>
}
