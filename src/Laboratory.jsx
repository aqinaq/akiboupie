import React, { useEffect, useId, useRef, useState } from 'react'
import { projects, profile } from './projects.js'

const objects = [
  { slug: 'akanki', kind: 'cube', color: '#b29bff', caption: 'A little knowledge. A lot of possibility.' },
  { slug: 'bagyt', kind: 'compass', color: '#eeff75', caption: 'Find your own direction.' },
  { slug: 'joryq', kind: 'case', color: '#79e4dc', caption: 'Some ideas take you places.' },
  { slug: 'mammamia', kind: 'sculpture', color: '#ff8963', caption: 'Make something unexpected.' },
  { slug: 'focus10', kind: 'ring', color: '#eeff75' },
  { slug: 'agylshyn', kind: 'book', color: '#b29bff' },
  { slug: 'mountain', kind: 'crystal', color: '#79e4dc' },
  { slug: 'dos-optics', kind: 'ribbon', color: '#ff8963' },
  { slug: 'aielts', kind: 'chip', color: '#b29bff' },
]

function ObjectArt({ kind, miniature = false }) {
  const uid = useId().replaceAll(':', '')
  const paint = name => `url(#${uid}-${name})`
  return <svg viewBox="0 0 320 300" className={`lab-art art-${kind} ${miniature ? 'art-mini' : ''}`} aria-hidden="true">
    <defs>
      <linearGradient id={`${uid}-chrome`} x1="0" y1="0" x2=".9" y2="1"><stop stopColor="#fcfaff" /><stop offset=".2" stopColor="#b6b2cc" /><stop offset=".38" stopColor="#f8ffff" /><stop offset=".5" stopColor="#565166" /><stop offset=".7" stopColor="#c6c7df" /><stop offset="1" stopColor="#f7f1ff" /></linearGradient>
      <linearGradient id={`${uid}-violet`} x2="1" y2="1"><stop stopColor="#dfd1ff" /><stop offset=".45" stopColor="#9f72ff" /><stop offset="1" stopColor="#532caf" /></linearGradient>
      <linearGradient id={`${uid}-cyan`} x2="1" y2="1"><stop stopColor="#b7fff2" /><stop offset=".4" stopColor="#65d8d2" /><stop offset="1" stopColor="#257981" /></linearGradient>
      <linearGradient id={`${uid}-orange`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#ffe6aa" /><stop offset=".25" stopColor="#ffaf7d" /><stop offset=".6" stopColor="#f76e53" /><stop offset="1" stopColor="#9a2549" /></linearGradient>
      <linearGradient id={`${uid}-glass`} x2="1" y2="1"><stop stopColor="#d9c3ff" stopOpacity=".8" /><stop offset=".45" stopColor="#9881ed" stopOpacity=".25" /><stop offset="1" stopColor="#7857ce" stopOpacity=".7" /></linearGradient>
      <linearGradient id={`${uid}-lime`} x2=".4" y2="1"><stop stopColor="#f6ffbd" /><stop offset=".45" stopColor="#e5ff79" /><stop offset="1" stopColor="#88932a" /></linearGradient>
    </defs>
    {kind === 'cube' && <g className="object-body">
      <g className="cube-cards"><path d="M87 135L151 100L207 132L143 169Z" fill="#f3f0e9" /><path d="M90 120L154 85L210 117L146 154Z" fill="#ddceff" /><path d="M93 103L157 68L213 100L149 137Z" fill="#f8f5ec" /><path d="M110 103L155 78M127 110L163 90" stroke="#7858bc" strokeWidth="4" /><path d="M174 100L183 95L191 100L182 105Z" fill="#a788e7" /></g>
      <path d="M62 102L158 49L262 111L166 168Z" fill={paint('glass')} stroke="#d4baff" strokeWidth="1.5" />
      <path d="M62 102L166 168V271L62 205Z" fill={paint('glass')} stroke="#cbb0ff" strokeWidth="1.5" /><path d="M166 168L262 111V214L166 271Z" fill={paint('violet')} opacity=".8" stroke="#cbb0ff" strokeWidth="1.5" />
      <path d="M73 119V198L153 248M179 172L249 129" stroke="#ebdeff" opacity=".6" fill="none" strokeWidth="2" /><path d="M92 161L126 184M92 175L118 193" stroke="#ece3ff" strokeWidth="4" /><path d="M203 203V177M191 196L216 182" stroke="#eeff75" strokeWidth="3" />
      <g className="object-spark" fill="#eeff75"><path d="M254 45V67M243 56H265" stroke="#eeff75" strokeWidth="2" /><circle cx="43" cy="159" r="3" /></g>
    </g>}
    {kind === 'compass' && <g className="object-body">
      <path d="M146 52V34Q160 12 176 34V52" fill="none" stroke={paint('chrome')} strokeWidth="11" /><ellipse cx="166" cy="165" rx="108" ry="111" fill="#6f752b" /><circle cx="158" cy="151" r="107" fill={paint('lime')} /><circle cx="158" cy="151" r="89" fill="#343630" stroke="#ffffbe" strokeWidth="2" /><circle cx="158" cy="151" r="76" fill="#20211e" stroke="#73775a" />
      {Array.from({length:24}, (_, i) => <path key={i} d={`M158 70V${i % 3 === 0 ? 84 : 77}`} transform={`rotate(${i * 15} 158 151)`} stroke="#eaff8e" strokeWidth={i % 3 === 0 ? 2 : 1} />)}
      <path d="M158 89L136 151L158 211L180 151Z" fill={paint('chrome')} /><path d="M158 89L136 151H180Z" fill={paint('violet')} /><circle cx="158" cy="151" r="7" fill="#f4f1e8" /><text x="158" y="64" textAnchor="middle" fill="#252722" fontSize="12" fontFamily="monospace">N</text><path d="M98 238Q156 261 222 232" stroke="#fffec8" opacity=".5" fill="none" strokeWidth="3" />
    </g>}
    {kind === 'case' && <g className="object-body">
      <path d="M127 132V111Q155 91 184 108V132" stroke={paint('chrome')} strokeWidth="13" fill="none" /><path d="M50 151L229 133L267 157V256L88 277L50 254Z" fill="#237e82" /><path d="M50 151L229 133V236L50 254Z" fill={paint('cyan')} stroke="#a1eee1" /><path d="M229 133L267 157V256L229 236Z" fill="#3d9296" /><path d="M70 159V233M211 143V218" stroke="#c6fff0" strokeWidth="2" opacity=".6" />
      <g className="case-mountains"><path d="M76 143L134 32L193 135Z" fill="#89a8af" /><path d="M134 32L151 142L193 135Z" fill="#426b7c" /><path d="M106 86L134 32L157 77L138 67L126 82L117 76Z" fill="#e7f6ed" /><path d="M143 137L201 65L245 129Z" fill="#a9d1ba" /><path d="M201 65L211 138L245 129Z" fill="#527c75" /><path d="M185 85L201 65L216 87L204 81L198 88Z" fill="#eefbea" /></g>
      <path d="M50 151L229 133L223 166L51 183Z" fill={paint('cyan')} stroke="#b6fff0" /><rect x="128" y="174" width="41" height="25" rx="3" fill="#eef0ce" transform="rotate(-6 128 174)" /><path d="M135 185H158" stroke="#448985" /><path d="M84 248V268M222 235V255" stroke="#262b30" strokeWidth="7" />
    </g>}
    {(kind === 'sculpture' || kind === 'ribbon') && <g className="object-body">
      <path d="M84 242C30 180 272 213 234 155S40 147 86 85S220 30 238 65" fill="none" stroke="#873440" strokeWidth="43" strokeLinecap="round" transform="translate(6 8)" />
      <path className="sculpture-ribbon" d="M84 242C30 180 272 213 234 155S40 147 86 85S220 30 238 65" fill="none" stroke={paint(kind === 'ribbon' ? 'chrome' : 'orange')} strokeWidth="39" strokeLinecap="round" />
      <path d="M78 228Q75 208 131 200M223 158Q203 133 153 132M89 81Q137 49 193 51" stroke="#ffedcf" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".65" />
    </g>}
    {kind === 'ring' && <g className="object-body"><ellipse cx="160" cy="156" rx="104" ry="78" fill="none" stroke="#67702b" strokeWidth="39" /><ellipse cx="153" cy="143" rx="104" ry="78" fill="none" stroke={paint('lime')} strokeWidth="36" /><path d="M77 117Q115 66 184 78" fill="none" stroke="#f9ffd5" strokeWidth="3" /><path d="M146 127V145L165 155" stroke="#f7f5e9" strokeWidth="4" fill="none" /></g>}
    {kind === 'book' && <g className="object-body"><path d="M60 87L160 68L266 89V246L160 224L60 246Z" fill={paint('violet')} /><path d="M69 79Q112 54 160 77Q211 53 255 81V230Q206 208 160 227Q111 208 69 230Z" fill="#eee9d8" /><path d="M160 78V223M88 109Q115 96 140 107M88 129Q115 116 140 127M88 149Q115 136 140 147M183 109Q209 96 236 107M183 129Q209 116 236 127" fill="none" stroke="#a39c92" strokeWidth="3" /><path d="M181 72V130L195 117L208 130V67" fill="#a785ec" /></g>}
    {kind === 'crystal' && <g className="object-body"><path d="M155 28L261 206L161 274L61 205Z" fill={paint('cyan')} /><path d="M155 28L161 274L61 205Z" fill="#b2efdf" opacity=".65" /><path d="M155 28L218 185L161 274Z" fill="#528a99" opacity=".7" /><path d="M155 28L108 185L61 205M108 185L161 274L218 185L261 206" stroke="#daf7e7" fill="none" /></g>}
    {kind === 'chip' && <g className="object-body">{Array.from({length:6}, (_, i) => <path key={i} d={`M${102+i*23} 46V74M${102+i*23} 226V254M48 ${94+i*22}H76M244 ${94+i*22}H272`} stroke={paint('chrome')} strokeWidth="8" />)}<rect x="69" y="66" width="182" height="173" rx="25" fill="#554274" /><rect x="69" y="56" width="182" height="173" rx="25" fill={paint('violet')} stroke="#c8adff" /><rect x="94" y="83" width="132" height="120" rx="13" fill="#232132" /><path d="M118 142L140 118L155 139L181 109L201 143M118 165H201" stroke="#c6adff" fill="none" strokeWidth="5" /></g>}
  </svg>
}

export default function Laboratory({ theme, toggleTheme }) {
  const [panel, setPanel] = useState(null)
  const [activeSlug, setActiveSlug] = useState('akanki')
  const [remix, setRemix] = useState(0)
  const [paused, setPaused] = useState(false)
  const dialogRef = useRef(null)
  const mainRef = useRef(null)
  const active = projects.find(p => p.slug === activeSlug)
  const activeObject = objects.find(o => o.slug === activeSlug)
  useEffect(() => {
    const dialog = dialogRef.current
    if (panel && !dialog.open) dialog.showModal()
    if (!panel && dialog.open) dialog.close()
  }, [panel])
  useEffect(() => {
    const openHash = () => { if (['work', 'about', 'contact'].includes(location.hash.slice(1))) setPanel(location.hash.slice(1)) }
    openHash(); addEventListener('hashchange', openHash)
    return () => removeEventListener('hashchange', openHash)
  }, [])
  const openProject = (slug, event) => {
    setActiveSlug(slug)
    if (event) {
      const rect = event.currentTarget.getBoundingClientRect()
      dialogRef.current.style.setProperty('--origin-x', `${(rect.left + rect.width / 2) / window.innerWidth * 100}%`)
      dialogRef.current.style.setProperty('--origin-y', `${(rect.top + rect.height / 2) / window.innerHeight * 100}%`)
    }
    setPanel('work')
  }
  const moveRoom = event => {
    if (event.pointerType !== 'mouse' || paused) return
    const rect = event.currentTarget.getBoundingClientRect()
    mainRef.current.style.setProperty('--room-x', `${((event.clientX - rect.left) / rect.width - .5) * 10}deg`)
    mainRef.current.style.setProperty('--room-y', `${((event.clientY - rect.top) / rect.height - .5) * -8}deg`)
  }
  return <main ref={mainRef} className={`lab-home ${paused ? 'lab-paused' : ''} ${remix % 2 ? 'lab-remixed' : ''}`}>
    <header className="lab-header"><a className="lab-logo" href="/">akbope<span aria-hidden="true">✳</span></a><span className="lab-header-note">INDEPENDENT MIND. / DESIGN + CODE.</span><nav aria-label="Main navigation"><button onClick={() => setPanel('work')}>Work <sup>09</sup></button><button onClick={() => setPanel('about')}>The maker</button><button onClick={() => setPanel('contact')}>Let’s talk ↗</button></nav><button className="lab-theme" onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}>{theme === 'dark' ? '◐' : '◑'}</button></header>
    <section className="lab-hero" aria-labelledby="lab-title">
      <div className="lab-intro"><p className="lab-label"><span className="lab-status" /> AKBOPE’S IMAGINATION LAB</p><h1 id="lab-title">Ideas<br />don’t<br /><span>sit still<span className="title-period">.</span></span></h1><div className="lab-intro-bottom"><p>I design. I build.<br />I make the unusual work.</p><button className="lab-enter" onClick={() => setPanel('work')} aria-label="Explore all nine projects">Enter the lab <span>↗</span></button></div><span className="lab-handnote">a curious place for real things ↗</span></div>
      <div className="lab-room" onPointerMove={moveRoom} onPointerLeave={() => { mainRef.current.style.setProperty('--room-x', '0deg'); mainRef.current.style.setProperty('--room-y', '0deg') }}>
        <div className="room-grid" aria-hidden="true" /><span className="room-coordinate coordinate-top">FIG. 01 — POSSIBILITIES IN MOTION</span><span className="room-coordinate coordinate-side">TOUCH AN IDEA / OPEN A WORLD</span><span className="room-cross cross-a" aria-hidden="true">+</span><span className="room-cross cross-b" aria-hidden="true">+</span>
        <div className="room-objects">{objects.slice(0,4).map((object, i) => { const project = projects.find(p => p.slug === object.slug); return <button key={object.slug} className={`lab-object lab-object-${i}`} onClick={event => openProject(object.slug, event)} aria-label={`Explore ${project.name}`} style={{'--object-color':object.color,'--float-delay':`${i * -1.7}s`}}><div className="object-visual"><ObjectArt kind={object.kind} /><span className="object-shadow" /></div><span className="object-label"><span className="object-index">0{i + 1}</span><strong>{project.name}</strong><span className="object-arrow">↗</span></span><span className="object-caption">{object.caption}</span></button> })}</div>
        <div className="room-controls"><button onClick={() => setRemix(remix + 1)}><span aria-hidden="true">⤨</span> Remix the room</button><button onClick={() => setPaused(!paused)} aria-label={paused ? 'Resume motion' : 'Pause motion'} aria-pressed={paused}>{paused ? '▶' : 'Ⅱ'}</button><span className="room-edition">EDITION {String(remix + 1).padStart(2, '0')}</span></div>
      </div>
    </section>
    <section className="lab-shelf" aria-label="More projects"><div className="shelf-heading"><span className="lab-label">MORE FROM THE LAB</span><span>Different questions. Different shapes.</span></div><div className="shelf-objects">{objects.slice(4).map((object, i) => { const p = projects.find(p => p.slug === object.slug); return <button key={object.slug} className="shelf-object" onClick={event => openProject(object.slug,event)} style={{'--object-color':object.color}} aria-label={`Explore ${p.name}`}><span className="shelf-number">0{i + 5}</span><ObjectArt kind={object.kind} miniature /><span>{p.name}<span>↗</span></span></button> })}</div></section>
    <footer className="lab-footer"><span>DESIGNED & BUILT BY AKBOPE</span><button onClick={() => setPanel('contact')}>Have a wonderfully weird idea? <span>Let’s make it real ↗</span></button><span>ASTANA, KZ / 2026</span></footer>
    <dialog ref={dialogRef} className={`lab-dialog lab-panel-${panel || 'closed'}`} onClose={() => { setPanel(null); if (location.hash) window.history.replaceState(null, '', location.pathname) }} onClick={event => { if (event.target === event.currentTarget) setPanel(null) }} aria-labelledby="lab-dialog-title" style={{'--project-color':activeObject.color}}><button className="lab-close" onClick={() => setPanel(null)} aria-label="Close laboratory panel">Close <span>×</span></button>
      {panel === 'work' && <div className="lab-project"><div className="project-topline"><span className="lab-label">EXPERIMENT {String(objects.findIndex(o => o.slug === activeSlug) + 1).padStart(2,'0')} / 09</span><span>DESIGN INTO SOMETHING REAL.</span></div><div className="project-content" key={activeSlug}><div className="project-information"><div className="project-art"><ObjectArt kind={activeObject.kind} miniature /></div><p className="lab-label">{active.typeLabel}</p><h2 id="lab-dialog-title">{active.name}</h2><p className="project-description">{active.description}</p><div className="project-actions"><a href={`/work/${active.slug}`}>Inside the project ↗</a><a href={active.url} target="_blank" rel="noreferrer">Open live ↗</a></div></div><div className="project-screen"><div className="screen-toolbar"><span><i /><i /><i /></span><span>{active.name} / PRODUCT VIEW</span><span>↗</span></div><img src={active.preview} alt={active.alt} width="1600" height="1000" /></div></div><div className="project-switcher" role="group" aria-label="Choose a project">{objects.map(o => { const p = projects.find(p => p.slug === o.slug); return <button key={o.slug} aria-pressed={o.slug === activeSlug} onClick={() => setActiveSlug(o.slug)}>{p.name}</button> })}</div></div>}
      {panel === 'about' && <div className="lab-maker"><div className="maker-image"><img src="/akbope-portrait.jpg" alt="Portrait of Akbope" width="564" height="564" /><span>THE HUMAN BEHIND THE EXPERIMENTS ↗</span></div><div className="maker-copy"><p className="lab-label">MEET THE MAKER</p><h2 id="lab-dialog-title">Curiosity.<br />With a<br /><em>keyboard.</em></h2><p>I’m Akbope. I turn ideas into interfaces<br />and interfaces into working products.</p><dl><div><dt>Based in</dt><dd>Astana, Kazakhstan</dd></div><div><dt>Studying at</dt><dd>AITU · Senior year</dd></div><div><dt>Speaking</dt><dd>Kazakh / Russian / English</dd></div></dl><a className="maker-cv" href={profile.cv} download>Download my CV ↗</a></div></div>}
      {panel === 'contact' && <div className="lab-contact"><p className="lab-label">THE NEXT EXPERIMENT COULD BE OURS.</p><h2 id="lab-dialog-title">Let’s make<br /><em>some thing.</em></h2><p>A product. A possibility. Something nobody’s seen yet.</p><div className="contact-actions"><a href={profile.telegram} target="_blank" rel="noreferrer">Say hello on Telegram ↗</a><a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a><a href={profile.github} target="_blank" rel="noreferrer">GitHub ↗</a></div><div className="contact-sculpture" aria-hidden="true"><ObjectArt kind="sculpture" /></div></div>}
    </dialog>
  </main>
}
