import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import { projects, experiments, capabilities } from './projects.js'
import { gameDesignCases } from './gameDesign.js'

const Arrow = ({ diagonal = false }) => <span aria-hidden="true">{diagonal ? '↗' : '→'}</span>

function Link({ href, className = '', children, external = false, onClick: onClickProp, ...props }) {
  const isInternal = href?.startsWith('/')
  const onClick = (event) => {
    onClickProp?.(event)
    if (event.defaultPrevented || !isInternal || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    window.history.pushState({}, '', href)
    window.dispatchEvent(new PopStateEvent('popstate'))
    const hash = href.includes('#') ? href.slice(href.indexOf('#')) : ''
    requestAnimationFrame(() => hash ? document.querySelector(hash)?.scrollIntoView() : window.scrollTo({ top: 0, behavior: 'instant' }))
  }
  return <a href={href} onClick={onClick} className={className} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})} {...props}>{children}</a>
}

function Mark() { return <Link href="/" className="mark" aria-label="Akbope, home"><span>Akbope</span><i /></Link> }

function Header({ theme, toggleTheme }) {
  const [open, setOpen] = useState(false)
  return <header className="site-header">
    <Mark />
    <div className="header-note"><span>AITU · Senior year</span><span>Astana · KZ</span></div>
    <button className="menu-button" aria-expanded={open} aria-controls="navigation" onClick={() => setOpen(!open)}>{open ? 'Close' : 'Menu'}</button>
    <nav id="navigation" className={open ? 'nav-open' : ''} aria-label="Main navigation">
      <Link href="/#work" onClick={() => setOpen(false)}>Work</Link>
      <Link href="/game-design" onClick={() => setOpen(false)}>Game Design</Link>
      <Link href="/#about" onClick={() => setOpen(false)}>About</Link>
      <Link href="/#contact" onClick={() => setOpen(false)}>Contact</Link>
      <button className="theme-button" onClick={toggleTheme} aria-label={`Use ${theme === 'light' ? 'dark' : 'light'} theme`}><i /> {theme === 'light' ? 'Night' : 'Day'}</button>
    </nav>
  </header>
}

function ProjectVisual({ project, compact = false }) {
  return <div className={`project-visual visual-${project.visual} ${compact ? 'compact' : ''}`}>
    <div className="visual-grid" aria-hidden="true" />
    <img className="project-screenshot" src={project.preview} alt={project.alt} loading="lazy" />
    <span className="visual-label">Live product / {project.year}</span><span className="visual-orbit" aria-hidden="true" />
  </div>
}

function Hero() {
  return <section className="hero" aria-labelledby="hero-title">
    <div className="hero-kicker"><span className="signal" /> Product designer & full-stack developer</div>
    <div className="hero-stage" aria-hidden="true"><div className="portal portal-one" /><div className="portal portal-two" /><span className="spark spark-one">✦</span><span className="spark spark-two">✦</span><span className="orbit-copy">IDEA · FORM · CODE · CARE ·</span></div>
    <h1 id="hero-title"><span>Ideas that</span><em>escape</em><span>the screen.</span></h1>
    <div className="hero-bottom"><p>I turn curious ideas into digital products—shaping the strategy, visual language and code as one connected experience.</p><div className="hero-actions"><a className="pill pill-solid" href="#work">Enter the work <Arrow /></a><a className="plain-link" href="https://t.me/meuseuk" target="_blank" rel="noreferrer">Say hello <Arrow diagonal /></a></div></div>
    <div className="hero-scroll"><span>Scroll to explore</span><i /></div>
  </section>
}

function ProjectCard({ project, index }) {
  return <article className={`project-card project-${index + 1}`}>
    <Link href={`/work/${project.slug}`} className="visual-link" aria-label={`View ${project.name} case study`}><ProjectVisual project={project} /></Link>
    <div className="project-copy"><div className="project-topline"><span>0{index + 1}</span><p>{project.category}</p><span>{project.year}</span></div><h3><Link href={`/work/${project.slug}`}>{project.name}</Link></h3><p className="project-description">{project.description}</p><div className="project-meta"><p>{project.role}</p><div>{project.capabilities.slice(0, 3).map(item => <span key={item}>{item}</span>)}</div></div><div className="project-links"><Link className="circle-link" href={`/work/${project.slug}`} aria-label={`Read ${project.name} case study`}><Arrow diagonal /></Link><a className="plain-link" href={project.url} target="_blank" rel="noreferrer">Live project <Arrow diagonal /></a></div></div>
  </article>
}

function Experiments() {
  return <section id="experiments" className="experiments" aria-labelledby="experiments-title"><div className="experiment-heading"><p className="eyebrow">PLAYGROUND / 02</p><h2 id="experiments-title">Not everything needs<br />a business plan.</h2><p>Small experiments made for the joy of finding out.</p></div><div className="experiment-grid">{experiments.map((item, index) => <a href={item.url} target="_blank" rel="noreferrer" className={`experiment-card experiment-${index + 1}`} key={item.name}><div className="experiment-art" aria-hidden="true">{index === 0 ? <><b>OFF</b><i>//</i><b>RECORD</b><small>Culture after dark</small></> : <><span className="reader-word">carefully</span><span className="reader-line"><i /></span><small>WORD 124 / 830</small></>}</div><span>0{index + 1}</span><h3>{item.name}</h3><Arrow diagonal /><p>{item.description}</p></a>)}</div></section>
}

function About() {
  return <section id="about" className="about" aria-labelledby="about-title"><div className="about-universe"><span>18 years old</span><span>AITU · senior</span><span>Astana</span><div className="orbit-portrait"><img src="/akbope-portrait.jpg" alt="Portrait of Akbope" /></div><i /><i /><i /></div><div className="about-copy"><p className="eyebrow">ABOUT / AKBOPE</p><h2 id="about-title">Hi, I’m Akbope.<br /><em>I design & build.</em></h2><p className="about-lead">I’m an 18-year-old senior-year student at Astana IT University, based in Astana, Kazakhstan.</p><p>I turn ideas into working digital products—from product strategy and interface design to frontend and backend development. I’m especially interested in EdTech, language learning, game design, responsible AI and tools that make everyday work feel simpler.</p><dl><div><dt>Education</dt><dd>Astana IT University · Senior year</dd></div><div><dt>Focus</dt><dd>Product design · Full-stack development</dd></div><div><dt>Interested in</dt><dd>EdTech · Language learning · Game design · Responsible AI</dd></div><div><dt>Based in</dt><dd>Astana, Kazakhstan</dd></div></dl></div></section>
}

function Capabilities() { return <section className="capabilities" aria-label="Capabilities"><p className="eyebrow">WAYS I CAN HELP</p><div>{capabilities.map((group, index) => <article key={group.title}><span>0{index + 1}</span><h3>{group.title}</h3><p>{group.items.join(' · ')}</p></article>)}</div></section> }

function Contact() { return <section id="contact" className="contact" aria-labelledby="contact-title"><div className="contact-star" aria-hidden="true">✦</div><p className="eyebrow">OPEN TO THOUGHTFUL COLLABORATIONS</p><h2 id="contact-title">Have an idea<br />with a pulse?</h2><div className="contact-bottom"><p>Tell me what you are imagining. We can turn the first sketch into something people can actually use.</p><div className="contact-links"><a className="contact-link" href="https://t.me/meuseuk" target="_blank" rel="noreferrer"><span>Telegram</span><Arrow diagonal /></a><a className="contact-link" href="https://www.linkedin.com/in/akbope-bakytkeldy-b8a1332aa/" target="_blank" rel="noreferrer"><span>LinkedIn</span><Arrow diagonal /></a><a className="contact-link" href="https://github.com/aqinaq" target="_blank" rel="noreferrer"><span>GitHub</span><Arrow diagonal /></a></div></div></section> }

function Footer() { return <footer><p>Made with curiosity in Astana.</p><a href="#main-content">Back to top ↑</a><span>© {new Date().getFullYear()}</span></footer> }

function Home() { return <main id="top"><Hero /><section id="work" className="work" aria-labelledby="work-title"><div className="work-heading"><p className="eyebrow">SELECTED WORLDS / 05</p><h2 id="work-title">Built from<br /><em>question marks.</em></h2><p>Five products exploring how we shop, learn, read and work.</p></div><div className="project-list">{projects.map((project, index) => <ProjectCard project={project} index={index} key={project.slug} />)}</div></section><Experiments /><About /><Capabilities /><Contact /></main> }

function GameCaseArt({ item }) {
  if (item.slug === 'swinging-bridge') return <div className="game-card-art art-bridge" aria-hidden="true"><span className="bridge-line" /><div className="bridge-steps">{[1, 2, 3, 4, 5, 6, 7].map(step => <i key={step}>{step}</i>)}</div><b>SAFETY<br />ROPE</b><small>7 wins · 1 recovery</small></div>
  if (item.slug === 'make-it-yours') return <div className="game-card-art art-yours" aria-hidden="true"><div className="sofa"><i /><i /><span /></div><div className="swatches"><i /><i /><i /></div><b>SHAPE × COLOUR × PATTERN</b><small>27 curated combinations</small></div>
  if (item.slug === 'flexible-orders') return <div className="game-card-art art-orders" aria-hidden="true"><div className="order-option"><span>A</span><b>3 bread</b><b>2 cheese</b></div><em>OR</em><div className="order-option"><span>B</span><b>3 bread</b><b>4 cream</b></div><small>One order · two clear choices</small></div>
  return <div className="game-card-art art-pull-pin" aria-hidden="true"><div className="pin-board"><div className="pin-coins"><i>★</i><i>★</i><i>★</i></div><span className="pin pin-red" /><div className="pin-bombs"><i /><i /></div><span className="pin pin-blue" /><span className="pin-barrier">×</span></div><b>CLEAR<br />THEN<br />COLLECT</b><small>One puzzle · two outcomes</small></div>
}

function GameDesignCard({ item }) {
  return <article className={`game-card game-${item.slug}`}>
    <GameCaseArt item={item} />
    <div className="game-card-copy">
      <div className="game-card-topline"><span>{item.number}</span><span>{item.game}</span><span>Independent concept</span></div>
      <p className="game-card-kicker">{item.subtitle}</p>
      <h2>{item.title}</h2>
      <dl className="game-card-details">
        <div><dt>Problem</dt><dd>{item.problem}</dd></div>
        <div><dt>Solution</dt><dd>{item.solution}</dd></div>
        <div><dt>What I did</dt><dd>{item.contribution}</dd></div>
      </dl>
      <div className="game-card-actions"><a className="pill pill-solid" href={item.pdf} target="_blank" rel="noreferrer">View case study <Arrow diagonal /></a><a className="plain-link" href={item.pdf} download>Download PDF <Arrow /></a></div>
    </div>
  </article>
}

function GameDesign() {
  useEffect(() => { document.title = 'Game Design Cases — akbope' }, [])
  return <main className="game-page">
    <header className="game-hero">
      <p className="eyebrow">GAME DESIGN / SELECTED WORK</p>
      <h1>Game Design<br /><em>Cases</em></h1>
      <p>I’m interested in casual F2P systems that create meaningful player choice while keeping progression, fairness and business constraints in balance.</p>
      <div className="game-hero-note"><span>04 case studies</span><span>Mechanics · Systems · Validation</span></div>
    </header>
    <section className="game-case-list" aria-label="Game design case studies">{gameDesignCases.map(item => <GameDesignCard item={item} key={item.slug} />)}</section>
  </main>
}

function CaseSection({ number, title, children }) { return <section className="case-section"><span>{number}</span><h2>{title}</h2><div className="case-content">{children}</div></section> }

function CaseStudy({ project }) {
  useEffect(() => { document.title = `${project.name} — akbope` }, [project])
  const nextProject = projects[(projects.indexOf(project) + 1) % projects.length]
  return <main className="case-page"><div className="case-crumb"><Link href="/#work">← All work</Link><span>{project.label}</span></div><header className="case-hero"><p className="eyebrow">{project.category}</p><h1>{project.name}</h1><p>{project.description}</p><dl><div><dt>Role</dt><dd>{project.role}</dd></div><div><dt>Status</dt><dd>{project.status}</dd></div><div><dt>Year</dt><dd>{project.year}</dd></div></dl></header><ProjectVisual project={project} /><div className="case-body"><CaseSection number="01" title="The product"><p>{project.overview}</p><p className="callout">{project.problem}</p></CaseSection><CaseSection number="02" title="Audience & constraints"><p>{project.audience}</p><ul>{project.constraints.map(item => <li key={item}>{item}</li>)}</ul></CaseSection><CaseSection number="03" title="Product strategy"><p>{project.strategy}</p><div className="journey">{project.journey.map((item, index) => <React.Fragment key={item}><span>{item}</span>{index < project.journey.length - 1 && <i>→</i>}</React.Fragment>)}</div></CaseSection><CaseSection number="04" title="Design decisions"><ul className="decision-list">{project.decisions.map(item => <li key={item.title}><strong>{item.title}</strong><span>{item.body}</span></li>)}</ul></CaseSection><CaseSection number="05" title="Technical approach"><p>{project.technical}</p><div className="tags">{project.capabilities.map(item => <span key={item}>{item}</span>)}</div></CaseSection><CaseSection number="06" title="Accessibility & privacy"><p>{project.accessibility}</p></CaseSection><CaseSection number="07" title="Current status"><p>{project.result}</p><h3>What I learned</h3><p>{project.learned}</p><h3>What I’d improve next</h3><p>{project.next}</p></CaseSection></div><div className="case-cta"><p className="eyebrow">SEE IT IN CONTEXT</p><h2>Explore the live product.</h2><a className="pill pill-light" href={project.url} target="_blank" rel="noreferrer">Open {project.name} <Arrow diagonal /></a></div><nav className="next-project" aria-label="Next project"><span>Next case study</span><Link href={`/work/${nextProject.slug}`}>{nextProject.name} <Arrow /></Link></nav></main>
}

function NotFound() { return <main className="not-found"><p className="eyebrow">404 / OFF THE MAP</p><h1>This page drifted<br /><em>out of orbit.</em></h1><Link href="/" className="pill pill-solid">Return home <Arrow /></Link></main> }

function App() {
  const [path, setPath] = useState(location.pathname)
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light')
  useEffect(() => { const onRoute = () => setPath(location.pathname); addEventListener('popstate', onRoute); return () => removeEventListener('popstate', onRoute) }, [])
  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem('theme', theme) }, [theme])
  useEffect(() => { if (path === '/') document.title = 'akbope — Product designer & full-stack developer'; if (location.hash && path === '/') requestAnimationFrame(() => document.querySelector(location.hash)?.scrollIntoView()) }, [path])
  useEffect(() => { const move = event => { document.documentElement.style.setProperty('--x', `${event.clientX}px`); document.documentElement.style.setProperty('--y', `${event.clientY}px`) }; addEventListener('pointermove', move); return () => removeEventListener('pointermove', move) }, [])
  const slug = path.startsWith('/work/') ? path.split('/')[2] : null
  const project = projects.find(item => item.slug === slug)
  return <><div className="cursor-light" aria-hidden="true" /><a className="skip-link" href="#main-content">Skip to content</a><Header theme={theme} toggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')} /><div id="main-content">{path === '/' ? <Home /> : path === '/game-design' || path === '/game-design/' ? <GameDesign /> : project ? <CaseStudy project={project} /> : <NotFound />}</div><Footer /></>
}

createRoot(document.getElementById('root')).render(<App />)
