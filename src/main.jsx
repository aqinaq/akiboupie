import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import { projects, experiments, capabilities, profile } from './projects.js'

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
      <Link href="/#about" onClick={() => setOpen(false)}>About</Link>
      <Link href="/#contact" onClick={() => setOpen(false)}>Contact</Link>
      <button className="theme-button" onClick={toggleTheme} aria-label={`Use ${theme === 'light' ? 'dark' : 'light'} theme`}><i /> {theme === 'light' ? 'Night' : 'Day'}</button>
    </nav>
  </header>
}

function ProjectVisual({ project, compact = false }) {
  return <div className={`project-visual visual-${project.visual} ${compact ? 'compact' : ''}`}>
    <div className="visual-grid" aria-hidden="true" />
    <img className="project-screenshot" src={project.preview} alt={project.alt} loading="lazy" decoding="async" width="1600" height="1000" />
    <span className="visual-label">{project.typeLabel} / {project.year}</span><span className="visual-orbit" aria-hidden="true" />
  </div>
}

function Hero() {
  return <section className="hero" aria-labelledby="hero-title">
    <div className="hero-kicker"><span className="signal" /> Product designer & full-stack developer</div>
    <div className="hero-stage" aria-hidden="true"><div className="portal portal-one" /><div className="portal portal-two" /><span className="spark spark-one">✦</span><span className="spark spark-two">✦</span><span className="orbit-copy">IDEA · FORM · CODE · CARE ·</span></div>
    <h1 id="hero-title"><span>I design & build</span><em>multilingual</em><span>digital products.</span></h1>
    <div className="hero-bottom"><p>From product strategy and UX to React, APIs and databases, I turn early ideas into working products—especially for education, productivity and Central Asian audiences.</p><div className="hero-actions"><a className="pill pill-solid" href="#work">View selected work <Arrow /></a><a className="plain-link" href="#contact">Discuss a project <Arrow /></a></div></div>
    <div className="hero-proof" aria-label="Portfolio proof"><span>5 live products</span><span>Kazakh, Russian & English</span><span>Design and development by one person</span></div>
    <div className="hero-scroll"><span>Ideas that escape the screen</span><i /></div>
  </section>
}

function ProjectCard({ project, index }) {
  return <article className={`project-card project-${index + 1}`}>
    <Link href={`/work/${project.slug}`} className="visual-link" aria-label={`View ${project.name} case study`}><ProjectVisual project={project} /></Link>
    <div className="project-copy"><div className="project-topline"><span>0{index + 1}</span><p>{project.category}</p><span>{project.typeLabel}</span></div><h3><Link href={`/work/${project.slug}`}>{project.name}</Link></h3><p className="project-description">{project.description}</p><div className="project-proof-row">{project.metrics.slice(0, 3).map(item => <span key={item}>{item}</span>)}</div><div className="project-meta"><p>{project.role}</p><div>{project.capabilities.slice(0, 3).map(item => <span key={item}>{item}</span>)}</div></div><div className="project-links"><Link className="circle-link" href={`/work/${project.slug}`} aria-label={`Read ${project.name} case study`}><Arrow diagonal /></Link><a className="plain-link" href={project.url} target="_blank" rel="noreferrer">Live product <Arrow diagonal /></a>{project.codeUrl && <a className="plain-link" href={project.codeUrl} target="_blank" rel="noreferrer">Code <Arrow diagonal /></a>}</div></div>
  </article>
}

function MoreWork() {
  const additional = projects.filter(project => !project.featured)
  return <section className="more-work" aria-labelledby="more-work-title"><div><p className="eyebrow">MORE WORK / 02</p><h2 id="more-work-title">More ways of<br /><em>thinking through products.</em></h2></div><div className="more-work-list">{additional.map(project => <article key={project.slug}><div><span>{project.typeLabel}</span><span>{project.year}</span></div><h3><Link href={`/work/${project.slug}`}>{project.name}</Link></h3><p>{project.description}</p><div><Link className="plain-link" href={`/work/${project.slug}`}>Read case study <Arrow /></Link><a className="plain-link" href={project.url} target="_blank" rel="noreferrer">View product <Arrow diagonal /></a></div></article>)}</div></section>
}

function Experiments() {
  return <section id="experiments" className="experiments" aria-labelledby="experiments-title"><div className="experiment-heading"><p className="eyebrow">PLAYGROUND / 02</p><h2 id="experiments-title">Not everything needs<br />a business plan.</h2><p>Small experiments made for the joy of finding out.</p></div><div className="experiment-grid">{experiments.map((item, index) => <a href={item.url} target="_blank" rel="noreferrer" className={`experiment-card experiment-${index + 1}`} key={item.name}><div className="experiment-art" aria-hidden="true">{index === 0 ? <><b>OFF</b><i>//</i><b>RECORD</b><small>Culture after dark</small></> : <><span className="reader-word">carefully</span><span className="reader-line"><i /></span><small>WORD 124 / 830</small></>}</div><span>0{index + 1}</span><h3>{item.name}</h3><Arrow diagonal /><p>{item.description}</p></a>)}</div></section>
}

function About() {
  return <section id="about" className="about" aria-labelledby="about-title"><div className="about-universe"><span>Shipped products</span><span>AITU · senior</span><span>Astana</span><div className="orbit-portrait"><img src="/akbope-portrait.jpg" alt="Portrait of Akbope" width="564" height="564" loading="lazy" decoding="async" /></div><i /><i /><i /></div><div className="about-copy"><p className="eyebrow">ABOUT / AKBOPE</p><h2 id="about-title">Hi, I’m Akbope.<br /><em>I design & build.</em></h2><p className="about-lead">I’m a product designer and full-stack developer in Astana. I’ve independently designed and shipped products across learning, productivity and multilingual retail.</p><p>I take products from the first question through UX, interface design, frontend, APIs, databases and testing. I’m also completing my senior year at Astana IT University.</p><dl><div><dt>Focus</dt><dd>Multilingual learning and productivity products</dd></div><div><dt>Languages</dt><dd>Kazakh · Russian · English</dd></div><div><dt>Education</dt><dd>Astana IT University · Senior year</dd></div><div><dt>Based in</dt><dd>Astana, Kazakhstan · Available remotely</dd></div></dl></div></section>
}

function Capabilities() { return <section className="capabilities" aria-label="Ways I can help"><div className="capabilities-intro"><p className="eyebrow">WAYS I CAN HELP</p><h2>Clear offers,<br /><em>useful outcomes.</em></h2></div><div>{capabilities.map((group, index) => <article key={group.title}><span>0{index + 1}</span><div><h3>{group.title}</h3><p className="offer-summary">{group.summary}</p></div><ul>{group.items.map(item => <li key={item}>{item}</li>)}</ul></article>)}</div></section> }

function Contact() { return <section id="contact" className="contact" aria-labelledby="contact-title"><div className="contact-star" aria-hidden="true">✦</div><p className="eyebrow">AVAILABLE FOR SELECTED FREELANCE AND JUNIOR PRODUCT OPPORTUNITIES</p><h2 id="contact-title">Let’s make<br />something useful.</h2><div className="contact-brief"><p>I can help with product definition, UX/UI design, responsive frontend development and small full-stack MVPs. Based in Astana and available remotely.</p><div><span>When you get in touch, tell me:</span><ol><li>What you’re building</li><li>Who it is for</li><li>Your preferred launch date</li><li>The project’s current stage</li></ol></div></div><div className="contact-bottom"><p>Choose the channel that works for you. A professional email can be added here as soon as the address is confirmed.</p><div className="contact-links"><a className="contact-link" href={profile.linkedin} target="_blank" rel="noreferrer"><span>LinkedIn</span><Arrow diagonal /></a><a className="contact-link" href={profile.telegram} target="_blank" rel="noreferrer"><span>Telegram</span><Arrow diagonal /></a><a className="contact-link" href={profile.cv} download><span>Download CV</span><Arrow /></a><a className="contact-link" href={profile.github} target="_blank" rel="noreferrer"><span>GitHub</span><Arrow diagonal /></a></div></div></section> }

function Footer() { return <footer><p>Made with curiosity in Astana.</p><a href="#main-content">Back to top ↑</a><span>© {new Date().getFullYear()}</span></footer> }

function Home() { const featured = projects.filter(project => project.featured); return <main id="top"><Hero /><section id="work" className="work" aria-labelledby="work-title"><div className="work-heading"><p className="eyebrow">SELECTED WORK / 03</p><h2 id="work-title">Working products.<br /><em>Verifiable depth.</em></h2><p>Three products showing full-stack engineering, multilingual learning systems and privacy-aware design.</p></div><div className="project-list">{featured.map((project, index) => <ProjectCard project={project} index={index} key={project.slug} />)}</div></section><MoreWork /><Experiments /><About /><Capabilities /><Contact /></main> }

function CaseSection({ number, title, children }) { return <section className="case-section"><span>{number}</span><h2>{title}</h2><div className="case-content">{children}</div></section> }

function EvidenceGallery({ project }) {
  return <div className="evidence-gallery">{project.screens.map((screen, index) => <figure key={screen.src} className={index === 0 ? 'evidence-primary' : ''}><div><img src={screen.src} alt={screen.alt} loading="lazy" decoding="async" width="1600" height="1000" /><span>{index + 1}</span></div><figcaption><strong>{screen.label}</strong><p>{screen.note}</p></figcaption></figure>)}</div>
}

function Architecture({ project }) {
  if (!project.architecture) return null
  return <div className="architecture" aria-label={`${project.name} system flow`}>{project.architecture.map((item, index) => <React.Fragment key={item}><span>{item}</span>{index < project.architecture.length - 1 && <i aria-hidden="true">→</i>}</React.Fragment>)}</div>
}

function CaseStudy({ project }) {
  useEffect(() => { document.title = `${project.name} — akbope` }, [project])
  const nextProject = projects[(projects.indexOf(project) + 1) % projects.length]
  return <main className="case-page">
    <div className="case-crumb"><Link href="/#work">← All work</Link><span>{project.typeLabel}</span></div>
    <header className="case-hero"><p className="eyebrow">{project.category}</p><h1>{project.name}</h1><p>{project.description}</p><dl><div><dt>Responsibility</dt><dd>{project.role}</dd></div><div><dt>Status</dt><dd>{project.status}</dd></div><div><dt>Year</dt><dd>{project.year}</dd></div></dl><div className="case-hero-actions"><a className="pill pill-solid" href={project.url} target="_blank" rel="noreferrer">View live product <Arrow diagonal /></a>{project.codeUrl && <a className="plain-link" href={project.codeUrl} target="_blank" rel="noreferrer">View code and README <Arrow diagonal /></a>}</div></header>
    <ProjectVisual project={project} />
    <div className="case-body">
      <CaseSection number="01" title="Challenge"><p>{project.overview}</p><p className="callout">{project.problem}</p><p>{project.audience}</p></CaseSection>
      <CaseSection number="02" title="My responsibility"><p>{project.responsibility}</p><div className="tags">{project.capabilities.map(item => <span key={item}>{item}</span>)}</div></CaseSection>
      <CaseSection number="03" title="Constraints"><ul>{project.constraints.map(item => <li key={item}>{item}</li>)}</ul></CaseSection>
      <CaseSection number="04" title="Key decisions"><p>{project.strategy}</p><ul className="decision-list">{project.decisions.map(item => <li key={item.title}><strong>{item.title}</strong><span>{item.body}</span></li>)}</ul><h3>Alternatives I rejected</h3><ul>{project.alternatives.map(item => <li key={item}>{item}</li>)}</ul><div className="journey">{project.journey.map((item, index) => <React.Fragment key={item}><span>{item}</span>{index < project.journey.length - 1 && <i>→</i>}</React.Fragment>)}</div></CaseSection>
      <CaseSection number="05" title="Evidence"><EvidenceGallery project={project} /><h3>System view</h3><Architecture project={project} /><p>{project.technical}</p></CaseSection>
      <CaseSection number="06" title="Validation"><p>{project.validation}</p><ul className="metric-list">{project.metrics.map(item => <li key={item}>{item}</li>)}</ul><h3>Accessibility and privacy</h3><p>{project.accessibility}</p></CaseSection>
      <CaseSection number="07" title="Outcome"><p className="callout">{project.outcome}</p><p>{project.result}</p></CaseSection>
      <CaseSection number="08" title="Reflection"><h3>What I learned</h3><p>{project.learned}</p><h3>What I’d change next</h3><p>{project.next}</p></CaseSection>
    </div>
    <div className="case-cta"><p className="eyebrow">SEE IT IN CONTEXT</p><h2>Inspect the working product and its decisions.</h2><div><a className="pill pill-light" href={project.url} target="_blank" rel="noreferrer">Open {project.name} <Arrow diagonal /></a>{project.codeUrl && <a className="plain-link" href={project.codeUrl} target="_blank" rel="noreferrer">Read the code <Arrow diagonal /></a>}</div></div>
    <nav className="next-project" aria-label="Next project"><span>Next case study</span><Link href={`/work/${nextProject.slug}`}>{nextProject.name} <Arrow /></Link></nav>
  </main>
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
  return <><div className="cursor-light" aria-hidden="true" /><a className="skip-link" href="#main-content">Skip to content</a><Header theme={theme} toggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')} /><div id="main-content">{path === '/' ? <Home /> : project ? <CaseStudy project={project} /> : <NotFound />}</div><Footer /></>
}

createRoot(document.getElementById('root')).render(<App />)
