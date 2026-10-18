import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { projects } from './projects.js'

const roman = n => ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'][n]

function BotanicalEtching() {
  return <svg className="book-etching" viewBox="0 0 180 100" fill="none" stroke="currentColor" aria-hidden="true"><path d="M18 88Q72 83 145 15M66 69Q46 39 39 49Q36 66 66 69M85 55Q66 21 59 29Q55 47 85 55M107 37Q89 11 84 17Q82 32 107 37M78 61Q111 70 118 57Q100 48 78 61M101 42Q135 48 143 34Q123 27 101 42"/><path d="M23 94Q74 91 153 21" opacity=".35"/><circle cx="148" cy="14" r="6"/><path d="M145 8Q132 -3 135 10M154 13Q170 7 160 2M151 20Q163 31 166 20"/></svg>
}

function StoryPage({ project, index, decorative = false }) {
  return <div className="book-page-content story-page">
    <div className="book-running-head"><span>Collected works</span><span>{project.year}</span></div>
    <div className="book-chapter">Chapter {roman(index)}</div>
    <h2 id={decorative ? undefined : "meadow-panel-title"}>{project.name}</h2>
    <p className="book-subtitle">{project.category}</p>
    <span className="book-flourish" aria-hidden="true">❧</span>
    <p className="book-story"><span className="illuminated-initial">{project.description[0]}</span>{project.description.slice(1)}</p>
    <dl className="book-colophon"><dt>Craft & contribution</dt><dd>{project.role}</dd></dl>
    <p className="book-project-status">{project.status}</p>
    <BotanicalEtching />
    <span className="book-page-number">{index * 2 + 1}</span>
  </div>
}

function IllustrationPage({ project, index, mobile, decorative = false }) {
  return <div className="book-page-content illustration-page">
    <div className="book-running-head"><span>{project.name}</span><span>Akbope</span></div>
    {mobile && <h2 id={decorative ? undefined : "meadow-panel-title"} className="book-plate-title">{project.name}</h2>}
    <figure className="book-plate"><div className="book-image-mount"><img src={project.preview} alt={project.alt} /></div><figcaption>Plate {roman(index)} — {project.typeLabel || project.category}</figcaption></figure>
    <p className="book-plate-note">{project.learned || project.overview || project.description}</p>
    <div className="book-inscribed-links"><a href={`/work/${project.slug}`}>Read the full story <span aria-hidden="true">↗</span></a><a href={project.url} target="_blank" rel="noreferrer">Visit the project <span aria-hidden="true">↗</span></a></div>
    <span className="book-page-number">{index * 2 + 2}</span>
  </div>
}

// A sheet is a continuous chain of narrow surfaces, rather than a rigid card.
// Each surface follows the curved paper and carries the same, aligned page print.
const TURN_DURATION = 1150
const PAPER_SEGMENTS = 22
function TurningPaper({ turn, mobile, onComplete }) {
  const surfaces = useRef([]), shadow = useRef(null)
  const forward = turn.direction > 0 || mobile
  const incoming = mobile && turn.direction < 0
  const frontFolio = incoming ? turn.next : turn.folio
  const backFolio = incoming ? turn.folio : turn.next
  const renderPage = (folio, front) => {
    const index = Math.floor(folio / 2)
    const story = mobile ? folio % 2 === 0 : front ? turn.direction < 0 : turn.direction > 0
    return story ? <StoryPage project={projects[index]} index={index} decorative /> : <IllustrationPage project={projects[index]} index={index} mobile={mobile} decorative />
  }
  useLayoutEffect(() => {
    let frame, started
    const width = turn.width, strip = width / PAPER_SEGMENTS
    const draw = progress => {
      const eased = progress * progress * (3 - 2 * progress)
      const t = incoming ? 1 - eased : eased
      const sign = forward ? -1 : 1
      const hinge = sign * Math.PI * t
      // The free edge leads, then relaxes behind the spine as the sheet lands.
      const curl = sign * .95 * Math.sin(2 * Math.PI * t)
      let x = forward ? 0 : width, z = 1
      surfaces.current.forEach((surface, i) => {
        const u = (i + .5) / PAPER_SEGMENTS
        const angle = hinge + curl * Math.sin(u * Math.PI / 2)
        surface.style.transform = `translate3d(${forward ? x : x - strip}px,0,${z}px) rotateY(${angle}rad)`
        surface.style.setProperty('--paper-shade', String(Math.abs(Math.sin(angle)) * .22))
        x += (forward ? 1 : -1) * Math.cos(angle) * strip
        z += (forward ? -1 : 1) * Math.sin(angle) * strip
      })
      shadow.current.style.opacity = String(Math.sin(Math.PI * t) * .3)
      shadow.current.style.transform = `scaleX(${.25 + Math.sin(Math.PI * t) * .75})`
    }
    draw(0)
    const animate = now => {
      started ??= now
      const progress = Math.min((now - started) / TURN_DURATION, 1)
      draw(progress)
      if (progress < 1) frame = requestAnimationFrame(animate)
      else onComplete()
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [turn, mobile, forward, incoming, onComplete])
  return <>
    <div ref={shadow} className={`paper-cast-shadow ${forward ? 'shadow-forward' : 'shadow-backward'}`} aria-hidden="true" />
    <div className={`book-turning-leaf ${forward ? 'turn-forward' : 'turn-backward'}`} aria-hidden="true" inert style={{ '--leaf-width': `${turn.width}px`, '--strip-width': `${turn.width / PAPER_SEGMENTS}px` }}>
      {Array.from({ length: PAPER_SEGMENTS }, (_, i) => {
        const frontIndex = forward ? i : PAPER_SEGMENTS - i - 1
        const backIndex = PAPER_SEGMENTS - frontIndex - 1
        return <div className="paper-segment" key={i} ref={node => { surfaces.current[i] = node }}>
          <div className="paper-face paper-front"><div className="paper-print" style={{ left: -frontIndex * turn.width / PAPER_SEGMENTS, height: incoming ? "100%" : turn.contentHeight, top: incoming ? 0 : -turn.scrollTop }}>{renderPage(frontFolio, true)}</div></div>
          <div className="paper-face paper-back"><div className="paper-print" style={{ left: -backIndex * turn.width / PAPER_SEGMENTS }}>{renderPage(backFolio, false)}</div></div>
        </div>
      })}
    </div>
  </>
}

export default function TreasureBook() {
  const [mobile, setMobile] = useState(() => matchMedia('(max-width: 700px)').matches)
  const [folio, setFolio] = useState(0), [turning, setTurning] = useState(null)
  const spread = useRef(null)
  const lock = useRef(false), swipe = useRef(null), pagePointer = useRef(null), suppressClick = useRef(0)
  useEffect(() => {
    const media = matchMedia('(max-width: 700px)')
    const resize = () => { setMobile(media.matches); setFolio(value => value - value % 2); setTurning(null); lock.current = false }
    media.addEventListener('change', resize)
    return () => { media.removeEventListener('change', resize) }
  }, [])
  const visibleFolio = mobile && turning?.direction < 0 ? turning.folio : folio
  const index = Math.floor(visibleFolio / 2)
  const last = projects.length * 2 - (mobile ? 1 : 2)
  const finishTurn = useCallback(() => { setTurning(null); lock.current = false }, [])
  const turn = useCallback(direction => {
    const next = folio + direction * (mobile ? 1 : 2)
    if (lock.current || next < 0 || next > last) return
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const leaf = spread.current.querySelector(mobile ? '.book-leaf' : direction > 0 ? '.book-right' : '.book-left')
      lock.current = true
      setTurning({ direction, folio, next, width: leaf.clientWidth, contentHeight: leaf.scrollHeight, scrollTop: leaf.scrollTop })
    }
    setFolio(next)
  }, [folio, mobile, last])
  useEffect(() => {
    const handleKey = event => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); turn(event.key === 'ArrowRight' ? 1 : -1) }
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [turn])
  const clickPage = (event, direction) => {
    if (event.target.closest('a,button') || Date.now() < suppressClick.current || !window.getSelection()?.isCollapsed) return
    const start = pagePointer.current
    if (start && Math.hypot(event.clientX - start.x, event.clientY - start.y) > 12) return
    if (mobile) {
      const rect = event.currentTarget.getBoundingClientRect()
      direction = event.clientX - rect.left < rect.width * .28 ? -1 : 1
    }
    turn(direction)
  }
  const pageDown = event => { pagePointer.current = { x: event.clientX, y: event.clientY } }
  const previousIndex = turning ? Math.floor(turning.folio / 2) : index
  const leftIndex = turning && !mobile && turning.direction > 0 ? previousIndex : index
  const rightIndex = turning && !mobile && turning.direction < 0 ? previousIndex : index
  return <section className={`antique-book ${mobile && visibleFolio % 2 ? 'show-illustration' : 'show-story'} ${turning ? 'is-turning' : ''}`} aria-label="Жобалар кітабы" onTouchStart={event => { swipe.current = { x: event.touches[0].clientX, y: event.touches[0].clientY } }} onTouchEnd={event => {
    if (!swipe.current) return
    const dx = event.changedTouches[0].clientX - swipe.current.x, dy = event.changedTouches[0].clientY - swipe.current.y
    if (Math.abs(dx) > 65 && Math.abs(dx) > Math.abs(dy) * 1.5 && !event.target.closest('a,button')) { suppressClick.current = Date.now() + 600; turn(dx < 0 ? 1 : -1) }
    swipe.current = null
  }}>
    <div className="book-cover" aria-hidden="true" /><div className="book-ribbon" aria-hidden="true" />
    <div className="book-spread" ref={spread}>
      {(!mobile || visibleFolio % 2 === 0) && <div className="book-leaf book-left" onPointerDown={pageDown} onClick={event => clickPage(event, -1)} key={`story-${leftIndex}`}><StoryPage project={projects[leftIndex]} index={leftIndex} /></div>}
      {(!mobile || visibleFolio % 2 === 1) && <div className="book-leaf book-right" onPointerDown={pageDown} onClick={event => clickPage(event, 1)} key={`plate-${rightIndex}`}><IllustrationPage project={projects[rightIndex]} index={rightIndex} mobile={mobile} /></div>}
      {folio > 0 && <button className="page-corner page-corner-previous" aria-label="Алдыңғы парақты аудару" disabled={Boolean(turning)} onClick={() => turn(-1)} />}
      {folio < last && <button className="page-corner page-corner-next" aria-label="Келесі парақты аудару" disabled={Boolean(turning)} onClick={() => turn(1)} />}
      <div className="book-binding" aria-hidden="true" />
      {turning && <TurningPaper turn={turning} mobile={mobile} onComplete={finishTurn} />}
    </div>
    <div className="book-opening-cover" aria-hidden="true"><span>Collected</span><strong>Works</strong><i>❧</i><em>Akbope</em></div>
    <div className="book-folio" aria-live="polite" aria-atomic="true">{mobile ? folio + 1 : `${folio + 1} · ${folio + 2}`} <i>/</i> {projects.length * 2}</div>
  </section>
}
