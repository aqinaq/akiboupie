import { localHref } from './i18n.js'
import { format } from './i18n.js'
import LanguageSwitch from './LanguageSwitch.jsx'
import { t } from './i18n.js'
import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import './studio.css'
import Meadow from './Meadow.jsx'
import './meadow.css'
import './caseStudy.css'
import './typography.css'
import { projects } from './projects.js'

const Arrow = ({ diagonal = false }) => <span aria-hidden="true">{diagonal ? '↗' : '→'}</span>

function Link({ href, className = '', children, external = false, onClick: onClickProp, ...props }) {
  const isInternal = href?.startsWith('/')
  if (isInternal) href = localHref(href)
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

function Mark() { return <Link href="/" className="mark" aria-label={t("Akbope, home")}><span>Akbope</span><i /></Link> }

function Header({ theme, toggleTheme }) {
  const [open, setOpen] = useState(false)
  return <header className="site-header">
    <Mark /><LanguageSwitch inline />
    <div className="header-note"><span>{t("Independent by nature")}</span></div>
    <button className="menu-button" aria-expanded={open} aria-controls="navigation" onClick={() => setOpen(!open)}>{open ? t("Close") : t("Menu")}</button>
    <nav id="navigation" className={open ? 'nav-open' : ''} aria-label={t("Main navigation")}>
      <Link href="/#work" onClick={() => setOpen(false)}>{t("Work")}</Link>
      <Link href="/#about" onClick={() => setOpen(false)}>{t("About")}</Link>
      <Link href="/#contact" onClick={() => setOpen(false)}>{t("Contact")}</Link>
      <button className="theme-button" onClick={toggleTheme} aria-label={format("Use {0} theme", [theme === 'light' ? t('dark') : t('light')])}><i /> {theme === 'light' ? t("Night") : t("Day")}</button>
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

function StoryHeader() {
  return <header className="story-header"><LanguageSwitch inline /><Link href="/" className="story-signature">Akbope</Link><span>{t("Collected works")}</span><Link href="/#work">{t("← Return to the meadow")}</Link></header>
}



function Footer() { return <footer><p>{t("Made with curiosity in Astana.")}</p><a href="#main-content">{t("Back to top ↑")}</a><span>© {new Date().getFullYear()}</span></footer> }

function Home() { return <Meadow /> }

function CaseSection({ number, title, children }) { return <section className="case-section"><span>{number}</span><h2>{title}</h2><div className="case-content">{children}</div></section> }

function EvidenceGallery({ project }) {
  return <div className="evidence-gallery">{project.screens.map((screen, index) => <figure key={screen.src} className={index === 0 ? 'evidence-primary' : ''}><div><img src={screen.src} alt={screen.alt} loading="lazy" decoding="async" width="1600" height="1000" /><span>{index + 1}</span></div><figcaption><strong>{screen.label}</strong><p>{screen.note}</p></figcaption></figure>)}</div>
}

function Architecture({ project }) {
  if (!project.architecture) return null
  return <div className="architecture" aria-label={format("{0} system flow", [project.name])}>{project.architecture.map((item, index) => <React.Fragment key={item}><span>{item}</span>{index < project.architecture.length - 1 && <i aria-hidden="true">→</i>}</React.Fragment>)}</div>
}

function CaseStudy({ project }) {
  useEffect(() => { document.title = `${project.name} — akbope` }, [project])
  const nextProject = projects[(projects.indexOf(project) + 1) % projects.length]
  return <main className="case-page">
    <div className="case-crumb"><span>{t("Volume")} {String(projects.indexOf(project) + 1).padStart(2, '0')} {t("· A project chronicle")}</span><span>{project.typeLabel}</span></div>
    <header className="case-hero"><div className="story-seal" aria-hidden="true">A</div><p className="eyebrow">{project.category}</p><h1>{project.name}</h1><p>{project.description}</p><div className="story-flourish" aria-hidden="true">✧</div><dl><div><dt>{t("Responsibility")}</dt><dd>{project.role}</dd></div><div><dt>{t("Status")}</dt><dd>{project.status}</dd></div><div><dt>{t("Year")}</dt><dd>{project.year}</dd></div></dl><div className="case-hero-actions"><a className="pill pill-solid" href={project.url} target="_blank" rel="noreferrer">{t("View live product")} <Arrow diagonal /></a>{project.codeUrl && <a className="plain-link" href={project.codeUrl} target="_blank" rel="noreferrer">{t("View code and README")} <Arrow diagonal /></a>}</div></header>
    <ProjectVisual project={project} />
    <div className="case-body">
      <CaseSection number="01" title={t("Challenge")}><p>{project.overview}</p><p className="callout">{project.problem}</p><p>{project.audience}</p></CaseSection>
      <CaseSection number="02" title={t("My responsibility")}><p>{project.responsibility}</p><div className="tags">{project.capabilities.map(item => <span key={item}>{item}</span>)}</div></CaseSection>
      <CaseSection number="03" title={t("Constraints")}><ul>{project.constraints.map(item => <li key={item}>{item}</li>)}</ul></CaseSection>
      <CaseSection number="04" title={t("Key decisions")}><p>{project.strategy}</p><ul className="decision-list">{project.decisions.map(item => <li key={item.title}><strong>{item.title}</strong><span>{item.body}</span></li>)}</ul>{project.alternatives?.length > 0 && <><h3>{t("Alternatives I rejected")}</h3><ul>{project.alternatives.map(item => <li key={item}>{item}</li>)}</ul></>}<div className="journey">{project.journey.map((item, index) => <React.Fragment key={item}><span>{item}</span>{index < project.journey.length - 1 && <i>→</i>}</React.Fragment>)}</div></CaseSection>
      <CaseSection number="05" title={t("Evidence")}><EvidenceGallery project={project} /><h3>{t("System view")}</h3><Architecture project={project} /><p>{project.technical}</p></CaseSection>
      <CaseSection number="06" title={t("Validation")}><p>{project.validation}</p><ul className="metric-list">{project.metrics.map(item => <li key={item}>{item}</li>)}</ul><h3>{t("Accessibility and privacy")}</h3><p>{project.accessibility}</p></CaseSection>
      <CaseSection number="07" title={t("Outcome")}><p className="callout">{project.outcome}</p><p>{project.result}</p></CaseSection>
      <CaseSection number="08" title={t("Reflection")}>{project.learned && <><h3>{t("What I learned")}</h3><p>{project.learned}</p></>}<h3>{t("What I’d change next")}</h3><p>{project.next}</p></CaseSection>
    </div>
    <div className="case-cta"><p className="eyebrow">{t("SEE IT IN CONTEXT")}</p><h2>{t("Inspect the working product and its decisions.")}</h2><div><a className="pill pill-light" href={project.url} target="_blank" rel="noreferrer">{t("Open")} {project.name} <Arrow diagonal /></a>{project.codeUrl && <a className="plain-link" href={project.codeUrl} target="_blank" rel="noreferrer">{t("Read the code")} <Arrow diagonal /></a>}</div></div>
    <nav className="next-project" aria-label={t("Next project")}><span>{t("Next case study")}</span><Link href={`/work/${nextProject.slug}`}>{nextProject.name} <Arrow /></Link></nav>
  </main>
}

function NotFound() { return <main className="not-found"><p className="eyebrow">{t("404 / OFF THE MAP")}</p><h1>{t("This page drifted")}<br /><em>{t("out of orbit.")}</em></h1><Link href="/" className="pill pill-solid">{t("Return home")} <Arrow /></Link></main> }

function App() {
  const [path, setPath] = useState(location.pathname)
  const [theme, setTheme] = useState(() => localStorage.getItem('art-hour') || 'dark')
  useEffect(() => { const onRoute = () => setPath(location.pathname); addEventListener('popstate', onRoute); return () => removeEventListener('popstate', onRoute) }, [])
  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem('art-hour', theme) }, [theme])
  useEffect(() => { if (path === '/') document.title = t("akbope — Product designer & full-stack developer"); if (location.hash && path === '/') requestAnimationFrame(() => document.querySelector(location.hash)?.scrollIntoView()) }, [path])
  const slug = path.startsWith('/work/') ? path.split('/')[2] : null
  const project = projects.find(item => item.slug === slug)
  if (project) return <div className="case-world"><a className="skip-link" href="#main-content">{t("Skip to content")}</a><StoryHeader /><div id="main-content"><CaseStudy key={project.slug} project={project} /></div><footer className="story-footer"><span>{t("Akbope · Astana ·")} {new Date().getFullYear()}</span><a href="#main-content">{t("Back to the beginning ↑")}</a></footer></div>
  return <><a className="skip-link" href="#main-content">{t("Skip to content")}</a>{path !== '/' && <Header theme={theme} toggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')} />}<div id="main-content">{path === '/' ? <Home theme={theme} toggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')} /> : project ? <CaseStudy project={project} /> : <NotFound />}</div>{path !== '/' && <Footer />}</>
}

createRoot(document.getElementById('root')).render(<App />)
