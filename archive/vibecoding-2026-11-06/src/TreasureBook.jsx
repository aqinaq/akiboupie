import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { language, localHref, t } from './i18n.js'
import { projects } from './projects.js'

const label = (kk, en) => language === 'en' ? en : kk

export default function ProjectHologram({ onClose }) {
  const [index, setIndex] = useState(0)
  const swipe = useRef(null), closeButton = useRef(null), gallery = useRef(null)
  useLayoutEffect(() => {
    const node = gallery.current, source = window.getComputedStyle(node.parentElement)
    const sourceX = parseFloat(source.getPropertyValue('--source-x')) || window.innerWidth / 2
    const sourceY = parseFloat(source.getPropertyValue('--source-y')) || window.innerHeight * .72
    node.style.setProperty('--arrival-x', `${sourceX - node.offsetLeft}px`)
    node.style.setProperty('--arrival-y', `${sourceY - node.offsetTop - node.offsetHeight / 2}px`)
  }, [])
  useEffect(() => { closeButton.current?.focus({ preventScroll: true }) }, [])
  const project = projects[index]
  const move = direction => setIndex(current => (current + direction + projects.length) % projects.length)
  useEffect(() => {
    const onKey = event => {
      if (event.target.closest('input, textarea, select') || event.altKey || event.ctrlKey || event.metaKey) return
      if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); onClose(); return }
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault()
        event.stopImmediatePropagation()
        setIndex(current => (current + (event.key === 'ArrowRight' ? 1 : -1) + projects.length) % projects.length)
      }
    }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [onClose])

  return <section ref={gallery} className="holo-gallery" role="dialog" aria-labelledby="holo-title" aria-describedby="holo-intro">
    <header className="holo-header">
      <div><p className="holo-kicker">✧ {t('THE STUDIO JOURNAL')}</p><h2 id="holo-title">{t('You discovered my projects.')}</h2><p id="holo-intro">{t('Choose a project. Discover its story or try the live experience.')}</p></div>
      <button ref={closeButton} className="holo-close" onClick={onClose}>{t('Return to the meadow')} <span aria-hidden="true">×</span></button>
    </header>
    <div className="holo-layout">
      <div className="holo-stage" onTouchStart={event => { swipe.current = { x: event.touches[0].clientX, y: event.touches[0].clientY } }} onTouchEnd={event => {
        if (!swipe.current) return
        const dx = event.changedTouches[0].clientX - swipe.current.x
        const dy = event.changedTouches[0].clientY - swipe.current.y
        if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) move(dx < 0 ? 1 : -1)
        swipe.current = null
      }}>
        <figure className="holo-screen" key={project.slug}>
          <div className="holo-screen-bar"><span>◈ {project.name}</span><span>{String(index + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}</span></div>
          <div className="holo-image"><img src={project.preview} alt={project.alt} /><span className="holo-scan" aria-hidden="true" /></div>
          <figcaption><span>{project.typeLabel || project.category}</span><span aria-hidden="true">⌁</span></figcaption>
          <span className="holo-corner corner-tl" aria-hidden="true" /><span className="holo-corner corner-br" aria-hidden="true" />
        </figure>

      </div>
      <article className="holo-info" key={`info-${project.slug}`}>
        <div className="holo-index">{label('ЖОБА', 'PROJECT')} <span>{String(index + 1).padStart(2, '0')}</span></div>
        <h3>{project.name}</h3>
        <p className="holo-category">{project.category}</p>
        <p className="holo-description">{project.description}</p>
        <dl><dt>{t('My role')}</dt><dd>{project.role}</dd></dl>
        <p className="holo-status"><i />{project.status}</p>
        <div className="holo-links"><a href={localHref(`/work/${project.slug}`)}>{t('Read case study')} <span aria-hidden="true">→</span></a><a href={project.url} target="_blank" rel="noreferrer">{t('Open live project')} <span aria-hidden="true">↗</span></a></div>
      </article>
    </div>
    <div className="holo-collection-label"><span>{t('Choose a project')}</span><span>{String(index + 1).padStart(2, '0')} / {String(projects.length).padStart(2, '0')}</span></div>
    <nav className="holo-navigation" aria-label={label('Жобаны таңдау', 'Choose a project')}>
      <button className="holo-arrow" onClick={() => move(-1)} aria-label={label('Алдыңғы жоба', 'Previous project')}>←</button>
      <div className="holo-project-list">{projects.map((item, i) => <button key={item.slug} onClick={() => setIndex(i)} aria-current={i === index ? 'true' : undefined}><span>{String(i + 1).padStart(2, '0')}</span>{item.name}</button>)}</div>
      <button className="holo-arrow" onClick={() => move(1)} aria-label={label('Келесі жоба', 'Next project')}>→</button>
    </nav>
    <p className="holo-controls"><span>{t('← → Switch projects · Esc Return to meadow')}</span><span>{t('Swipe the preview to switch projects')}</span></p>
    <span className="holo-announcement" role="status">{project.name}, {index + 1} / {projects.length}</span>
  </section>
}
