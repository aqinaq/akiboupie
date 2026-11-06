import React, { useEffect, useRef, useState } from 'react'
import { language, localHref, t } from './i18n.js'
import { projects } from './projects.js'
import './hologram.css'

const label = (kk, en) => language === 'en' ? en : kk

export default function ProjectHologram({ onClose }) {
  const [index, setIndex] = useState(0)
  const swipe = useRef(null)
  const project = projects[index]
  const move = direction => setIndex(current => (current + direction + projects.length) % projects.length)
  useEffect(() => {
    const onKey = event => {
      if (event.target.closest('input, textarea, select') || event.altKey || event.ctrlKey || event.metaKey) return
      if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); onClose(); return }
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault()
        setIndex(current => (current + (event.key === 'ArrowRight' ? 1 : -1) + projects.length) % projects.length)
      }
    }
    document.addEventListener('keydown', onKey, true)
    return () => document.removeEventListener('keydown', onKey, true)
  }, [onClose])

  return <section className="holo-gallery" aria-label={label('Жобалар голограммасы', 'Project holograms')}>
    <button className="holo-close" onClick={onClose} aria-label={label('Голограмманы жабу', 'Close hologram')}>×</button>
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
        <h2 id="meadow-panel-title">{project.name}</h2>
        <p className="holo-category">{project.category}</p>
        <p className="holo-description">{project.description}</p>
        <dl><dt>{t('Craft & contribution')}</dt><dd>{project.role}</dd></dl>
        <p className="holo-status"><i />{project.status}</p>
        <div className="holo-links"><a href={localHref(`/work/${project.slug}`)}>{t('Read the full story')} <span>↗</span></a><a href={project.url} target="_blank" rel="noreferrer">{t('Visit the project')} <span>↗</span></a></div>
      </article>
    </div>
    <nav className="holo-navigation" aria-label={label('Жобаны таңдау', 'Choose a project')}>
      <button className="holo-arrow" onClick={() => move(-1)} aria-label={label('Алдыңғы жоба', 'Previous project')}>←</button>
      <div className="holo-project-list">{projects.map((item, i) => <button key={item.slug} onClick={() => setIndex(i)} aria-current={i === index ? 'true' : undefined}><span>{String(i + 1).padStart(2, '0')}</span>{item.name}</button>)}</div>
      <button className="holo-arrow" onClick={() => move(1)} aria-label={label('Келесі жоба', 'Next project')}>→</button>
    </nav>
    <span className="holo-announcement" role="status">{project.name}, {index + 1} / {projects.length}</span>
  </section>
}
