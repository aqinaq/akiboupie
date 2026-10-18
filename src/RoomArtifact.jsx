import React, { useEffect, useRef } from 'react'
import { profile, projects } from './projects.js'

export default function RoomArtifact({ selection, place, onClose }) {
  const dialog=useRef(null), closeButton=useRef(null)
  const project=selection.kind==='project'?projects.find(p=>p.slug===selection.slug):null
  const about=selection.kind==='about'
  useEffect(()=>{const element=dialog.current;element.showModal();closeButton.current?.focus();return()=>{if(element.open)element.close()}},[])
  return <dialog ref={dialog} className={`house-artifact-dialog artifact-${place} ${about?'artifact-about':'artifact-project'}`} aria-labelledby="room-artifact-title" onClose={event=>event.stopPropagation()} onCancel={event=>{event.preventDefault();event.stopPropagation();onClose()}} onClick={event=>{event.stopPropagation();if(event.target===event.currentTarget)onClose()}}>
    {about?<article className="room-scroll">
      <div className="room-scroll-roll" aria-hidden="true"/>
      <div className="room-scroll-paper">
        <button ref={closeButton} className="artifact-back" onClick={onClose}>↶ Хатты орау</button>
        <p className="artifact-kicker">АСТАНАДАН КЕЛГЕН ХАТ</p>
        <h2 id="room-artifact-title">Сәлем, мен {profile.name}.</h2>
        <img className="room-scroll-portrait" src="/akbope-portrait.jpg" alt="Akbope"/>
        <p>Мен — Астанадағы product designer және full-stack developer. Идеяларды интерфейске, ал интерфейстерді жұмыс істейтін өнімге айналдырамын.</p>
        <p>Оқуға, тіл үйренуге және назарды маңызды іске бөлуге көмектесетін шағын әлемдер жасағанды ұнатамын. Маған өнімнің қалай көрінетіні де, қалай жұмыс істейтіні де маңызды.</p>
        <dl><div><dt>Білім</dt><dd>{profile.education}</dd></div><div><dt>Қала</dt><dd>{profile.location}</dd></div><div><dt>Тілдер</dt><dd>Қазақша · Русский · English</dd></div><div><dt>Қазір</dt><dd>{profile.availability}</dd></div></dl>
        <p className="room-scroll-signature">Ізгі тілекпен,<br/><em>Akbope</em></p>
        <nav aria-label="Akbope байланыстары"><a href={profile.cv} download>Түйіндеме ↓</a><a href={profile.telegram} target="_blank" rel="noreferrer">Telegram ↗</a><a href={profile.github} target="_blank" rel="noreferrer">GitHub ↗</a><a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a></nav>
      </div>
      <div className="room-scroll-roll roll-bottom" aria-hidden="true"/>
    </article>:project&&<article className="room-project-detail">
      <button ref={closeButton} className="artifact-back" onClick={onClose}>↶ Сөреге қайту</button>
      <p className="artifact-kicker">{project.category} · {project.year}</p>
      <h2 id="room-artifact-title">{project.name}</h2>
      <p className="artifact-project-status">{project.status}</p>
      <img className="artifact-preview" src={project.preview} alt={project.alt}/>
      <p className="artifact-description">{project.description}</p>
      <dl><div><dt>Менің рөлім</dt><dd>{project.role}</dd></div><div><dt>Өнімде</dt><dd>{project.capabilities.join(' · ')}</dd></div></dl>
      <nav aria-label={`${project.name} сілтемелері`}><a href={project.url} target="_blank" rel="noreferrer">Жобаны ашу ↗</a><a href={`/work/${project.slug}`} target="_blank" rel="noreferrer">Жоба тарихы ↗</a></nav>
    </article>}
  </dialog>
}
