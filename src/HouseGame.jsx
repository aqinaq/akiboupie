import React, { useEffect, useRef, useState } from 'react'
import './houseGames.css'
import RoomArtifact from './RoomArtifact.jsx'
import { projects } from './projects.js'

export const houseGames = {
  planner: { title: 'Руна ұстаханасы', hint: 'Бірдей тастарды біріктір · 2048', controls: 'Бағыттауыштар немесе экранды сырғыту' },
  notes: { title: 'Алхимиктің жады', hint: 'Бірдей сусындардың жұбын тап', controls: 'Екі құтыны кезекпен бас' },
  library: { title: 'Жұлдыздар мұрағаты', hint: 'Барлық тоғыз кристалды жақ', controls: 'Кристалды бас: өзі мен көршілері өзгереді' },
  workshop: { title: 'Аспан мұнарасы', hint: '12 кітапты дәл орналастыр', controls: 'Қозғалған кітапты бас немесе Space' },
}
export default function HouseGame({ place, onExit }) {
  const host = useRef(null), api = useRef(null), exit = useRef(onExit)
  const [status, setStatus] = useState(''), [failed, setFailed] = useState(false)
  const [inspection, setInspection] = useState(null)
  useEffect(() => { exit.current = onExit }, [onExit])
  const info = houseGames[place]
  useEffect(() => {
    let cancelled = false
    import('./houseGameScene.js').then(({ createHouseGame }) => {
      if (!cancelled) {
        api.current = createHouseGame(host.current, { place, info, onExit: () => exit.current(), onStatus: setStatus, onInspect: setInspection })
        api.current.focus()
      }
    }).catch(() => { if (!cancelled) setFailed(true) })
    return () => { cancelled = true; api.current?.dispose(); api.current = null }
  }, [place, info])
  useEffect(() => { api.current?.setInspection(inspection); if (!inspection) api.current?.focus() }, [inspection])
  return <section className="house-game" aria-label={info.title}>
    <h2 id="meadow-panel-title" className="game-accessible">{info.title}</h2>
    <p className="game-accessible">{info.hint}. {info.controls}. R — қайта бастау. Escape — алқапқа оралу.</p>
    <div className="house-game-canvas" ref={host}/>
    <p className="game-accessible" role="status">{status}</p>
    <button className="game-accessible game-focus-control" onClick={() => api.current?.restart()}>Ойынды қайта бастау</button>
    <button className="game-accessible game-focus-control" onClick={onExit}>Алқапқа оралу</button>
    <button className="game-accessible game-focus-control" onClick={() => setInspection({kind:'about'})}>Akbope туралы хатты ашу</button>
    {projects.map(project=><button key={project.slug} className="game-accessible game-focus-control" onClick={()=>setInspection({kind:'project',slug:project.slug})}>{project.name} жобасын қарау</button>)}
    {inspection && <RoomArtifact selection={inspection} place={place} onClose={()=>setInspection(null)}/>}
    {failed && <div className="house-game-error">3D ойын жүктелмеді.<button onClick={onExit}>Алқапқа оралу</button></div>}
  </section>
}
