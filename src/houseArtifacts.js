import * as THREE from 'three'
import { projects } from './projects.js'

// Every room exhibits the same real catalog, expressed through its own materials.
export function buildHouseArtifacts({ scene, place, mesh, mat, box, sphere, cylinder, crystal, wood, timber, brass, wax, geometries, plaque, action, onInspect, onExit }) {
  const artifacts=new Map(), colors=['#bc765a','#70a89d','#9e8bc2','#d0ad64','#7396b7','#b1799b','#7fa274','#bb8d53','#698a9f']
  const gallery=new THREE.Group();gallery.name='portfolio-cabinet';gallery.position.set(1.1,0,-6.05);scene.add(gallery)
  mesh(gallery,box,timber,0,2.7,-.25,5.5,5.4,.25)
  for(const x of [-2.7,2.7])mesh(gallery,box,brass,x,2.7,0,.06,5.4,.15)
  const palette=colors.map(color=>mat(color,{roughness:.45,metalness:place==='planner'?.65:.12}))
  const glass=mat('#d1e6e4',{transparent:true,opacity:.2,roughness:.12,metalness:.1,depthWrite:false})
  const paper=mat('#ddcda7'), ink=mat('#75563a'), red=mat('#a64b49')
  const orbitGeo=new THREE.TorusGeometry(.46,.016,6,40);geometries.push(orbitGeo)
  for(let row=0;row<3;row++)mesh(gallery,box,wood,0,1+row*1.45,.15,5.5,.12,1.2)
  projects.forEach((project,index)=>{
    const col=index%3,row=2-Math.floor(index/3),x=(col-1)*1.75,y=1.07+row*1.45
    const item=new THREE.Group();item.name=`portfolio-${project.slug}`;item.position.set(x,y,.13);gallery.add(item)
    const color=palette[index%palette.length]
    mesh(item,cylinder,brass,0,.035,0,.48,.07,.38)
    if(place==='notes') {
      mesh(item,sphere,color,0,.42,0,.32,.37,.29)
      mesh(item,sphere,glass,0,.44,0,.37,.42,.34)
      mesh(item,cylinder,glass,0,.84,0,.12,.3,.12)
      mesh(item,cylinder,wood,0,1.02,0,.135,.13,.135)
      mesh(item,box,wax,0,.4,.3,.23,.27,.025)
      mesh(item,crystal,brass,0,.4,.325,.075,.075,.025)
    } else if(place==='planner') {
      // A cast metal seal, displayed as a finished piece from the forge.
      const seal=mesh(item,cylinder,color,0,.53,0,.39,.13,.39);seal.rotation.x=Math.PI/2
      const center=mesh(item,crystal,brass,0,.53,.1,.2,.2,.04);center.rotation.z=index*.35
      mesh(item,box,timber,0,.25,-.06,.1,.5,.15)
      for(const dx of [-.27,.27])mesh(item,sphere,brass,dx,.54,.1,.035,.035,.025)
    } else if(place==='library') {
      mesh(item,cylinder,brass,0,.28,0,.035,.5,.035)
      mesh(item,sphere,color,0,.65,0,.32,.32,.32)
      const orbit=mesh(item,orbitGeo,brass,0,.65,0);orbit.rotation.x=.6;orbit.rotation.y=index*.45
      mesh(item,sphere,wax,Math.cos(index)*.43,.65+Math.sin(index)*.43,.03,.07,.07,.07)
    } else {
      // Upright leather volumes, each with its own gilded spine and cover.
      mesh(item,box,paper,0,.54,0,.65,.92,.18)
      for(const z of [-.13,.13])mesh(item,box,color,0,.54,z,.74,1.02,.06)
      mesh(item,box,color,-.34,.54,0,.08,1.02,.28)
      for(const x of [-.28,.28])mesh(item,box,brass,x,.54,.165,.014,.85,.01)
      for(const yy of [.12,.96])mesh(item,box,brass,0,yy,.165,.57,.014,.01)
      const seal=mesh(item,box,brass,0,.54,.17,.18,.18,.01);seal.rotation.z=Math.PI/4
      mesh(item,box,red,.18,.02,.07,.06,.18,.04)
    }
    plaque(item,project.name,0,-.08,.62,1.58,false,72)
    // A clear picking volume includes the nameplate and the object's empty edges.
    mesh(item,box,mat('#ffffff',{visible:false}),0,.48,.1,1.35,1.3,.9)
    item.userData.project=project.slug
    artifacts.set(project.slug,item)
    action(item,()=>onInspect({kind:'project',slug:project.slug}))
  })
  // Full-height doorway sits flush in the rear wall, with jambs and a threshold.
  const door=new THREE.Group();door.name='game-exit';door.position.set(-4.45,-1.23,-6.03);scene.add(door)
  mesh(door,box,timber,0,2.5,-.15,2.7,5.2,.35)
  mesh(door,box,mat('#171b18'),0,2.45,.05,2.25,4.8,.1)
  for(let i=0;i<6;i++)mesh(door,box,wood,-.9+i*.36,2.4,.15,.34,4.65,.15)
  for(const x of [-1.25,1.25])mesh(door,box,brass,x,2.55,.22,.16,5.15,.25)
  mesh(door,box,brass,0,5.05,.22,2.6,.16,.25)
  for(const y of [.8,3.8])mesh(door,box,brass,0,y,.27,2.2,.12,.07)
  mesh(door,sphere,brass,.75,2.2,.4,.13,.13,.13)
  mesh(door,box,wood,0,.04,.45,2.7,.15,1)
  plaque(door,'Алқапқа шығу',0,5.45,.2,2.65,false,70)
  action(door,onExit)
  // A rolled letter belongs on a writing tray at the edge of the playing table.
  const scroll=new THREE.Group();scroll.name='about-scroll';scroll.position.set(place==='workshop'?4.95:-4.95,.36,place==='workshop'?-1.3:1.7);scroll.rotation.y=-.18;scene.add(scroll)
  mesh(scroll,box,wood,0,0,0,1.5,.14,2.3)
  mesh(scroll,box,paper,0,.11,0,1.15,.045,1.6)
  for(const z of [-.78,.78]){
    const roll=mesh(scroll,cylinder,paper,0,.22,z,.17,1.25,.17);roll.rotation.z=Math.PI/2
    for(const x of [-.68,.68]){const end=mesh(scroll,sphere,brass,x,.22,z,.09,.09,.09);end.castShadow=false}
  }
  mesh(scroll,box,red,0,.25,0,.16,.02,1.55)
  mesh(scroll,cylinder,red,0,.3,0,.2,.06,.2)
  for(let i=0;i<3;i++)mesh(scroll,box,ink,.32,.145,-.32+i*.16,.28,.007,.015)
  plaque(scroll,'Akbope · Мен туралы',0,.23,1.01,1.6,true,56)
  action(scroll,()=>onInspect({kind:'about'}));artifacts.set('about',scroll)
  return { artifacts, door, scroll }
}
