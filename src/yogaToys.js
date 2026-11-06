import * as THREE from 'three'

// Monochrome molded-plastic figures, posed in three dimensions rather than image cutouts.
export function buildYogaToys(parent) {
  const plastic=new THREE.MeshStandardMaterial({color:'#07834d',roughness:.23,metalness:.04})
  const detail=new THREE.MeshStandardMaterial({color:'#087346',roughness:.3,metalness:.02})
  const seam=new THREE.MeshStandardMaterial({color:'#126c42',roughness:.4})
  function figure(name,x) {const g=new THREE.Group();g.name=name;g.position.set(x,4.665,.12);g.scale.setScalar(.48);g.rotation.y=-.2;parent.add(g);return g}
  function mesh(g,material,p){const m=new THREE.Mesh(g,material);m.castShadow=m.receiveShadow=true;p.add(m);return m}
  function oval(p,position,scale,material=plastic){const m=mesh(new THREE.SphereGeometry(1,24,16),material,p);m.position.fromArray(position);m.scale.fromArray(scale);return m}
  function limb(p,a,b,r1,r2=r1,material=plastic){
    const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b),dir=end.clone().sub(start)
    const m=mesh(new THREE.CylinderGeometry(r2,r1,dir.length(),20),material,p);m.position.copy(start).add(end).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),dir.normalize())
    oval(p,a,[r1,r1,r1],material);oval(p,b,[r2,r2,r2],material);return m
  }
  function box(p,x,y,z,w,h,d,material=plastic){const m=mesh(new THREE.BoxGeometry(w,h,d),material,p);m.position.set(x,y,z);return m}
  function head(p,y,upsideDown=false){
    const h=new THREE.Group();h.position.y=y;if(upsideDown)h.rotation.z=Math.PI;p.add(h)
    oval(h,[0,0,0],[.103,.135,.09]);oval(h,[0,-.005,.09],[.026,.04,.027])
    for(const s of [-1,1]){
      oval(h,[s*.101,0,0],[.022,.035,.022]);oval(h,[s*.04,.027,.08],[.019,.012,.009],detail)
    }
    limb(h,[0,-.12,0],[0,-.19,0],.057)
    const helmet=mesh(new THREE.SphereGeometry(.137,28,18,0,Math.PI*2,0,Math.PI/2),plastic,h);helmet.position.y=.05;helmet.scale.y=.9
    const rim=mesh(new THREE.TorusGeometry(.137,.013,8,32),detail,h);rim.rotation.x=Math.PI/2;rim.position.y=.05
    return h
  }
  function uniform(p,y,upsideDown=false){
    const torso=new THREE.Group();torso.position.y=y;if(upsideDown)torso.rotation.z=Math.PI;p.add(torso)
    oval(torso,[0,0,0],[.20,.25,.12])
    for(const s of [-1,1]){
      const pocket=box(torso,s*.092,.045,.105,.115,.095,.035,detail);pocket.rotation.z=s*.05
      box(torso,s*.092,.088,.127,.12,.018,.012,plastic)
      oval(torso,[s*.12,-.235,.06],[.052,.09,.045],detail)
      limb(torso,[s*.075,.19,.09],[s*.02,.11,.13],.012,.012,detail)
    }
    const belt=mesh(new THREE.CylinderGeometry(.16,.16,.045,32),detail,torso);belt.scale.z=.72;belt.position.y=-.19
    box(torso,0,-.19,.125,.055,.045,.018)
    for(const yy of [-.12,-.055,.015])oval(torso,[0,yy,.122],[.009,.009,.006],seam)
  }
  const tree=figure('green-tree-pose-toy',.88)
  // Low rectangular sprue-style base supports the one-legged pose.
  box(tree,0,.025,0,.69,.05,.40)
  head(tree,1.65);uniform(tree,1.22)
  oval(tree,[0,.93,0],[.16,.17,.12])
  limb(tree,[-.075,.95,0],[-.085,.57,0],.10,.078)
  limb(tree,[-.085,.57,0],[-.10,.18,.015],.078,.061)
  oval(tree,[-.10,.106,.065],[.087,.06,.14],detail)
  limb(tree,[.09,.95,0],[.48,.98,.025],.11,.09)
  limb(tree,[.48,.98,.025],[.145,.67,.045],.087,.061)
  const raisedFoot=oval(tree,[.09,.61,.055],[.065,.14,.08],detail);raisedFoot.rotation.z=-.28
  for(const s of [-1,1]){
    limb(tree,[s*.19,1.36,0],[s*.26,1.10,.06],.079,.072)
    limb(tree,[s*.26,1.10,.06],[s*.035,1.22,.19],.07,.047)
    const palm=oval(tree,[s*.027,1.31,.19],[.029,.115,.052]);palm.rotation.z=s*.13
    for(let i=0;i<3;i++)limb(tree,[s*(.021+i*.009),1.3,.22],[s*(.016+i*.008),1.40-i*.01,.21],.006,.005,detail)
  }
  const inverted=figure('green-headstand-toy',-.85)
  head(inverted,.19,true);uniform(inverted,.61,true)
  oval(inverted,[0,.92,0],[.15,.14,.12])
  for(const s of [-1,1]){
    limb(inverted,[s*.067,.96,0],[s*.055,1.35,-.015],.085,.065)
    limb(inverted,[s*.055,1.35,-.015],[s*.045,1.73,-.045],.065,.047)
    const boot=oval(inverted,[s*.045,1.80,-.018],[.056,.12,.079],detail);boot.rotation.x=-.2
    limb(inverted,[s*.18,.51,0],[s*.28,.35,.12],.079,.068)
    limb(inverted,[s*.28,.35,.12],[s*.24,.075,.15],.065,.043)
    oval(inverted,[s*.24,.027,.20],[.085,.027,.10])
    for(let i=0;i<3;i++)limb(inverted,[s*.24+(i-1)*.025,.027,.23],[s*.24+(i-1)*.025,.023,.29],.009,.008)
  }
  return [inverted,tree]
}
