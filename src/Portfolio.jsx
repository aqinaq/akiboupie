import React, { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { language } from './i18n.js'
import { graphicWorks, motionWorks } from './collections.js'
import './portfolio.css'
const Meadow = lazy(() => import('./Meadow.jsx'))
const copy = (kk,en) => language === 'en' ? en : kk
const rooms = ['lobby','gallery','world','motion']
function readRoom(){const value=new URLSearchParams(location.search).get('room');return rooms.includes(value)?value:location.hash?'world':'lobby'}

export default function Portfolio(){
  const [room,setRoom]=useState(readRoom),[ready,setReady]=useState(false),[error,setError]=useState(false),[moving,setMoving]=useState(false),[list,setList]=useState(false),[selected,setSelected]=useState(null),[motionNotice,setMotionNotice]=useState(false)
  const host=useRef(null),scene=useRef(null),callbacks=useRef({}),detail=useRef(null),lastFocus=useRef(null),openedDoor=useRef(null)
  function navigate(next){openedDoor.current=null;if(next!=='motion')setMotionNotice(false);const url=new URL(location.href);url.searchParams.set('room',next);url.hash='';window.history.pushState({},'',url);setRoom(next);setMoving(false);setList(false);setSelected(null)}
  function enter(index){
    if(moving)return
    if(openedDoor.current!==index){
      openedDoor.current=index
      scene.current?.openDoor(index)
      setMotionNotice(index===2)
      return
    }
    start(index)
  }
  function start(index){setMotionNotice(index===2);setMoving(true);const next=['gallery','world','motion'][index];if(error||!scene.current){navigate(next);return}scene.current.enter(index,()=>navigate(next))}
  useEffect(()=>{if(!motionNotice)return;const timer=window.setTimeout(()=>setMotionNotice(false),5000);return()=>window.clearTimeout(timer)},[motionNotice])
  useEffect(()=>{callbacks.current={enter,onExit:()=>navigate('lobby'),onSelect:index=>{setSelected(graphicWorks[index]);lastFocus.current=document.activeElement}}})
  useEffect(()=>{const handler=()=>{openedDoor.current=null;setMotionNotice(false);setRoom(readRoom());setMoving(false);setList(false);setSelected(null)};window.addEventListener('popstate',handler);return()=>window.removeEventListener('popstate',handler)},[])
  useEffect(()=>{
    if(room==='world')return
    let cancelled=false;setReady(false);setError(false)
    import('./portfolioScene.js').then(({createPortfolioScene})=>{if(cancelled)return;scene.current=createPortfolioScene(host.current,{room,onExit:()=>callbacks.current.onExit(),onReady:()=>setReady(true),onError:()=>{setError(true);setReady(true)},onSelect:index=>room==='lobby'?callbacks.current.enter(index):callbacks.current.onSelect(index)})}).catch(()=>{if(!cancelled){setError(true);setReady(true)}})
    return()=>{cancelled=true;scene.current?.dispose();scene.current=null}
  },[room])
  useEffect(()=>{if(selected)detail.current?.showModal()},[selected])
  useEffect(()=>{document.title=`Akbope — ${room==='lobby'?'Three creative worlds':room==='gallery'?'Graphic design':room==='world'?'Vibe coding':'Visual / Motion'}`},[room])
  function closeDetail(){detail.current.close();setSelected(null);lastFocus.current?.focus()}
  return <div className={`portfolio-experience room-${room}`}>
    {room==='world'?<><Suspense fallback={<div className="portal-loading">{copy('Әлем жүктеліп жатыр…','Loading the world…')}</div>}><Meadow onExit={()=>navigate('lobby')} /></Suspense><button className="world-return" onClick={()=>navigate('lobby')}>← {copy('Үш есікке','Three doors')}</button></>:<>
      <div className="portfolio-canvas" ref={host} />
      {room==='lobby'&&<div className="portfolio-vignette" />}
      {room==='lobby'?<>
        {!error&&<div className="decor-toolbar" aria-label="Декорды орналастыру">
            <button title="Таңдалған затты алыстату" aria-label="Таңдалған затты алыстату" onClick={()=>scene.current?.moveDecorDepth(-.2)}>↗</button>
            <button title="Таңдалған затты жақындату" aria-label="Таңдалған затты жақындату" onClick={()=>scene.current?.moveDecorDepth(.2)}>↙</button>
            <button title="Бастапқы орындар" aria-label="Бастапқы орындар" onClick={()=>scene.current?.resetDecor()}>↺</button>
        </div>}

        <nav className={`door-access ${error ? 'door-access-fallback' : ''}`} aria-label="Бөлімдер">
          {['Graphic design','Vibe coding','Visual / Motion'].map((title,i)=><button key={title} aria-label={title} disabled={!ready||moving} onClick={()=>enter(i)}>{title}</button>)}
        </nav>
      </>:<>
        <button className="room-back-icon" aria-label={copy('Кіреберіске','Entrance hall')} onClick={()=>navigate('lobby')}>←</button>
        <button className="room-collection-icon" aria-label={list?copy('Жабу','Close'):copy('Жұмыстарды қарау','Browse collection')} aria-expanded={list} onClick={()=>setList(!list)}>{list?'×':'▦'}</button>
        {!list && !(room==='motion'&&motionNotice) && <p className="room-comment">{room==='gallery' ? (graphicWorks.some(work=>work.src) ? copy('Жұмысты басып көріңіз.','Select a work to explore.') : copy('Жұмыстар жақында қосылады.','Works will be added soon.')) : copy('Бұл бөлім әлі жасалып жатыр.','This section is still in progress.')}</p>}
        {(list||error)&&<section className="collection-panel" aria-label="Collection">
          {room==='gallery'?<><p>{copy('Экспозиция дайындалуда. Графикалық жұмыстар жақында осында ілінеді.','The exhibition is being prepared. Graphic works will appear here soon.')}</p>{graphicWorks.map(w=><button className="collection-item" key={w.id} onClick={()=>{lastFocus.current=document.activeElement;setSelected(w)}}><span>{w.id}</span><strong>{w.title}</strong><small>{w.src?w.year:copy('Жақында','Coming soon')}</small></button>)}</>:<><p className="wip-badge">WORK IN PROGRESS</p><h2>{copy('Қозғалыс. Форма. Эксперимент.','Motion. Form. Experiment.')}</h2><p>{copy('Бұл бөлме әзірге эскиз. Мұнда бейнелер, анимациялар және визуалды зерттеулер жиналады.','This room is a first sketch. Videos, animations and visual studies will live here.')}</p>{motionWorks.length?motionWorks.map(w=><article key={w.src}><h3>{w.title}</h3>{w.type==='video'?<video controls preload="metadata" src={w.src}/>:w.type==='image'?<img src={w.src} alt={w.title}/>:<a href={w.src} download>{copy('Файлды жүктеу','Download file')} ↗</a>}<p>{w.description}</p></article>):<div className="motion-empty">01 — VIDEO<br/>02 — ANIMATION<br/>03 — VISUAL EXPLORATIONS</div>}</>}
        </section>}
      </>}
      {!ready&&<div className="scene-status" role="status">{copy('Кеңістік дайындалып жатыр…','Preparing the space…')}</div>}
      {error&&<div className="scene-status" role="status">{copy('3D қолжетімсіз. Бөлімдерді төмендегі батырмалармен аша аласыз.','3D is unavailable. Use the buttons to explore the collections.')}</div>}
      {moving&&<span className="portfolio-sr-only" role="status">{copy('Кіру…','Entering…')}</span>}
    </>}

    {motionNotice&&<div className="motion-notice" role="status" aria-live="polite">{copy('Бұл бөлім әлі жасалып жатыр.','This section is still in progress.')}</div>}
    <dialog ref={detail} className="portfolio-dialog artwork-dialog" onCancel={()=>setSelected(null)} onClose={()=>lastFocus.current?.focus()}>{selected&&<><button className="art-close" onClick={closeDetail} aria-label="Close">×</button><p>GRAPHIC DESIGN / {selected.id}</p><h2>{selected.title}</h2>{selected.src?<img src={selected.src} alt={selected.title}/>:<div className="empty-art">{copy('Бұл рама сіздің жұмысыңызды күтеді.','This frame is waiting for your work.')}</div>}<p>{selected.description}</p><small>{selected.year||copy('Экспозиция дайындалуда','Exhibition in preparation')}</small></>}</dialog>
  </div>
}
