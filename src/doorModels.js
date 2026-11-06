import * as THREE from 'three'

// Reference-built, dimensional doors: joinery, relief, leading and hardware are meshes.
export function buildDoors(scene, textures, { only } = {}) {
  const doors = []
  const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: .64, ...extra })
  const cream = mat('#d5cbb4'), creamEdge = mat('#b5aa8f'), brass = mat('#987448', { metalness: .7, roughness: .38 })
  const pink = mat('#cc8594'), pinkEdge = mat('#ad6577'), pinkLight = mat('#dd9aa5')
  const lead = mat('#272d2b', { metalness: .4, roughness: .5 })
  function mesh(g,m,p,x=0,y=0,z=0){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;p.add(o);return o}
  function box(p,w,h,d,x,y,z,m){return mesh(new THREE.BoxGeometry(w,h,d),m,p,x,y,z)}
  function line(p,points,m,r=.018){const curve=new THREE.CatmullRomCurve3(points.map(v=>new THREE.Vector3(...v)));return mesh(new THREE.TubeGeometry(curve,Math.max(12,points.length*5),r,6,false),m,p)}
  function border(p,x,y,w,h,z,m,r=.02){
    box(p,w,r*2,r*2,x,y-h/2,z,m);box(p,w,r*2,r*2,x,y+h/2,z,m)
    box(p,r*2,h,r*2,x-w/2,y,z,m);box(p,r*2,h,r*2,x+w/2,y,z,m)
  }

  // Square mitred mouldings; layered depths form the recessed panel bevels.
  function mould(p,x,y,w,h,z,m,edge=m){
    for(const [inset,depth,thick,material] of [[0,0,.055,m],[.055,-.025,.035,edge],[.095,-.04,.018,m]]){
      const a=w-inset*2,b=h-inset*2
      box(p,a,thick,.04,x,y+b/2,z+depth,material);box(p,a,thick,.04,x,y-b/2,z+depth,material)
      box(p,thick,b,.04,x-a/2,y,z+depth,material);box(p,thick,b,.04,x+a/2,y,z+depth,material)
    }
  }
  function panel(p,x,y,w,h,m,edge){box(p,w-.1,h-.1,.045,x,y,.105,edge);box(p,w-.25,h-.25,.055,x,y,.135,m);mould(p,x,y,w,h,.225,m,edge)}
  function handle(p,x,y,z){
    const plate=mesh(new THREE.SphereGeometry(1,16,12),brass,p,x,y,z);plate.scale.set(.075,.27,.035)
    const grip=mesh(new THREE.SphereGeometry(1,16,12),brass,p,x,y+.04,z+.065);grip.scale.set(.045,.12,.045)
    mesh(new THREE.SphereGeometry(.022,12,8),lead,p,x,y-.13,z+.04)
  }
  function woodTexture(){
    const c=document.createElement('canvas');c.width=512;c.height=1024;const ctx=c.getContext('2d')
    ctx.fillStyle='#8c572f';ctx.fillRect(0,0,512,1024)
    let seed=921;const random=()=>{seed=(seed*16807)%2147483647;return seed/2147483647}
    for(let i=0;i<1800;i++){const x=random()*512;ctx.strokeStyle=i%3?`rgba(46,23,10,${random()*.17})`:`rgba(229,176,108,${random()*.22})`;ctx.lineWidth=.3+random()*1.4;ctx.beginPath();ctx.moveTo(x,0);for(let y=0;y<=1024;y+=16)ctx.lineTo(x+Math.sin(y*.009+x*.04)*2+Math.sin(y*.024+x)*.8,y);ctx.stroke()}
    const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;textures.push(t);return t
  }
  const grain=woodTexture(),wood=mat('#c49665',{map:grain,bumpMap:grain,bumpScale:.025}),woodEdge=mat('#89603c',{map:grain}),woodDark=mat('#50351f',{map:grain})
  // Rococo relief drawn as raised scrolls and individually sculpted acanthus leaves.
  function flourish(p,x,y,s=1,mirror=1){
    const g=new THREE.Group();g.position.set(x,y,.245);g.scale.set(s*mirror,s,s);p.add(g)
    const scroll=[];for(let i=0;i<=48;i++){const a=i/48*Math.PI*3.35;const r=.44*(1-i/58);scroll.push([Math.sin(a)*r,Math.cos(a)*r,Math.sin(i*.18)*.018])}line(g,scroll,cream,.027)
    line(g,[[0,-.54,0],[-.17,-.27,.015],[-.35,.05,.01],[-.34,.36,0],[-.2,.58,0]],cream,.035)
    for(let i=0;i<7;i++){
      const leaf=mesh(new THREE.SphereGeometry(1,10,8),i%4===0?brass:cream,g,-.27+Math.sin(i*.9)*.11,-.36+i*.14,.015)
      leaf.scale.set(.045,.16,.035);leaf.rotation.z=-.6+i*.2
      line(g,[[leaf.position.x,leaf.position.y-.1,.05],[leaf.position.x-.03,leaf.position.y,.06],[leaf.position.x+.02,leaf.position.y+.1,.05]],creamEdge,.006)
    }
    line(g,[[.03,-.45,.01],[.28,-.32,.01],[.37,-.08,.01],[.29,.05,.01]],brass,.009)
  }
  for(const [i,x] of [-6,0,6].entries()){
    if(only !== undefined && i !== only)continue
    const group=new THREE.Group();group.position.x=x;group.userData.door=i;scene.add(group)
    const width=i===0?3.15:2.8,height=5.8,m=i===0?cream:i===1?pink:wood
    for(const side of [-1,1]){
      box(group,.19,height+.27,.32,side*(width/2+.12),(height+.27)/2,-.025,m)
      box(group,.035,height+.3,.38,side*(width/2+.23),(height+.3)/2,-.015,i===0?creamEdge:i===1?pinkEdge:woodEdge)
    }
    box(group,width+.43,.2,.34,0,height+.17,-.025,m)
    const hinge=new THREE.Group();hinge.position.set(-width/2,0,0);group.add(hinge)
    const hinges=[{node:hinge,sign:-1}]
    if(i===0){
      // Two opening leaves, not a single slab with a painted central seam.
      const right=new THREE.Group();right.position.set(width/2,0,0);group.add(right);hinges.push({node:right,sign:1})
      for(const [index,h] of [hinge,right].entries()){
        const center=index===0?width/4:-width/4
        box(h,width/2-.018,height,.17,center,height/2,0,cream)
        panel(h,center,4.05,1.28,2.9,cream,creamEdge);panel(h,center,1.27,1.28,2.1,cream,creamEdge)
        for(const [y,scale] of [[5.1,.72],[3,.65],[2.04,.62],[.6,.68]])flourish(h,center,y,scale,index===0?1:-1)
        box(h,.018,5.65,.024,index===0?width/2-.055:-width/2+.055,2.9,.12,brass)
        const lever=box(h,.22,.035,.075,index===0?width/2-.15:-width/2+.15,2.36,.22,brass);lever.rotation.z=index===0?.15:-.15
      }
      // Layered entablature and a softly arched overdoor cartouche.
      for(const [y,w,d] of [[6.03,3.75,.42],[6.15,3.95,.5],[6.27,4.05,.55]])box(group,w,.1,d,0,y,0,cream)
      const crest=new THREE.Shape();crest.moveTo(-1.7,6.35);crest.lineTo(-1.7,7.15);crest.bezierCurveTo(-1.1,7.15,-.8,7.55,0,7.55);crest.bezierCurveTo(.8,7.55,1.1,7.15,1.7,7.15);crest.lineTo(1.7,6.35);crest.closePath()
      mesh(new THREE.ExtrudeGeometry(crest,{depth:.13,bevelEnabled:true,bevelSize:.055,bevelThickness:.04,bevelSegments:3,steps:1}),cream,group)
      const art=new THREE.Shape();art.moveTo(-1.48,6.48);art.lineTo(-1.48,7.02);art.bezierCurveTo(-.8,7.02,-.6,7.35,0,7.35);art.bezierCurveTo(.6,7.35,.8,7.02,1.48,7.02);art.lineTo(1.48,6.48);art.closePath()
      mesh(new THREE.ShapeGeometry(art),mat('#37382d'),group,0,0,.21)
      // Low relief landscape in the overdoor painting, kept subdued like the reference.
      box(group,.75,.48,.012,.12,6.85,.224,mat('#5c5038'));box(group,.42,.32,.012,-.55,6.74,.226,mat('#484534'))
      const roof=new THREE.Shape();roof.moveTo(-.35,7.07);roof.lineTo(.12,7.27);roof.lineTo(.58,7.07);roof.closePath();mesh(new THREE.ShapeGeometry(roof),mat('#292a22'),group,0,0,.24)
      for(const xx of [-.12,.17,.38])box(group,.08,.23,.01,xx,6.85,.24,mat('#20251f'))
      for(const side of [-1,1]){flourish(group,side*1.88,6.65,.75,side);flourish(group,side*1.83,5.35,.6,side)}
      flourish(group,0,6.25,.55);flourish(group,0,7.49,.4)
    }else if(i===1){
      // Pink frame, genuine glass opening, lower two-panel joinery and brass mail slot.
      box(hinge,2.8,2.65,.18,1.4,1.325,0,pink)
      box(hinge,.25,3.15,.18,.125,4.225,0,pink);box(hinge,.25,3.15,.18,2.675,4.225,0,pink);box(hinge,2.8,.2,.18,1.4,5.7,0,pink)
      mould(hinge,1.4,4.17,2.37,2.97,.14,pinkLight,pinkEdge)
      panel(hinge,.76,.98,1.1,1.65,pink,pinkEdge);panel(hinge,2.04,.98,1.1,1.65,pink,pinkEdge);panel(hinge,1.4,2.25,2.35,.32,pink,pinkEdge)
      box(hinge,.56,.15,.055,1.4,2.56,.15,brass);box(hinge,.46,.085,.02,1.4,2.56,.185,lead)
      handle(hinge,2.66,2.32,.18)
      const jewel=mesh(new THREE.OctahedronGeometry(.12),brass,hinge,1.4,2.15,.27);jewel.scale.set(1,1.35,.35)
      // Coordinates normalized to the reference's tall Art Nouveau stained glass.
      const glassGroup=new THREE.Group();glassGroup.position.set(1.4,2.76,.025);glassGroup.scale.set(1.08,1.38,1);hinge.add(glassGroup)
      const glass=mat('#a9bdc6',{roughness:.3,metalness:.1,transparent:true,opacity:.84,side:THREE.DoubleSide})
      box(glassGroup,2,2,.025,0,1,0,glass)
      function shape(commands,color){const s=new THREE.Shape();for(const [op,...v] of commands)s[op](...v);s.closePath();mesh(new THREE.ShapeGeometry(s,32),mat(color,{roughness:.25,metalness:.12,side:THREE.DoubleSide}),glassGroup,0,0,.025);const pts=s.getPoints(64).map(p=>[p.x,p.y,.045]);line(glassGroup,pts,lead,.012)}
      for(const side of [-1,1]){
        const S=side
        shape([['moveTo',0,1.91],['bezierCurveTo',.15*S,1.85,.48*S,1.88,.8*S,1.62],['lineTo',.88*S,1.36],['bezierCurveTo',.65*S,1.42,.35*S,1.65,0,1.91]],'#c7a75e')
        shape([['moveTo',0,1.78],['bezierCurveTo',.28*S,1.62,.55*S,1.62,.3*S,1.35],['bezierCurveTo',.1*S,1.41,.05*S,1.56,0,1.78]],'#8fb7b3')
        shape([['moveTo',.23*S,1.6],['bezierCurveTo',.65*S,1.82,.62*S,1.52,.4*S,1.47],['bezierCurveTo',.31*S,1.5,.27*S,1.55,.23*S,1.6]],'#93b9ab')
        shape([['moveTo',0,1.66],['bezierCurveTo',.15*S,1.48,.41*S,1.39,.27*S,1.15],['bezierCurveTo',.23*S,1.02,.17*S,.98,0,.91],['bezierCurveTo',.12*S,1.21,.07*S,1.43,0,1.66]],'#d48ca8')
        shape([['moveTo',0,1.27],['bezierCurveTo',.33*S,1.38,.48*S,1.62,.62*S,1.36],['bezierCurveTo',.35*S,1.46,.35*S,1.18,0,1.02]],'#cfa0b2')
        shape([['moveTo',0,1.09],['bezierCurveTo',.24*S,.89,.39*S,.77,.1*S,.53],['bezierCurveTo',.19*S,.79,.06*S,.86,0,1.09]],'#d28ba5')
        shape([['moveTo',.38*S,1.02],['bezierCurveTo',.65*S,1.03,.77*S,.82,.64*S,.67],['lineTo',.39*S,.86],['closePath']],'#388fa4')
        shape([['moveTo',.68*S,.88],['lineTo',.87*S,1.02],['lineTo',.65*S,.58],['bezierCurveTo',.58*S,.72,.61*S,.8,.68*S,.88]],'#82ad9b')
        shape([['moveTo',.58*S,.79],['lineTo',.65*S,.9],['lineTo',.74*S,.79],['lineTo',.65*S,.72]],'#ce7fa2')
        shape([['moveTo',0,.54],['bezierCurveTo',.24*S,.67,.42*S,.51,.57*S,.63],['bezierCurveTo',.51*S,.32,.17*S,.43,0,.16],['bezierCurveTo',.15*S,.4,.02*S,.43,0,.54]],'#82a7a4')
        line(glassGroup,[[S,1.93,.05],[S*.76,1.9,.05],[S*.57,1.7,.05],[S*.79,1.48,.05],[S,1.42,.05]],lead,.013)
        line(glassGroup,[[S,1.25,.05],[S*.82,1.23,.05],[S*.84,.99,.05],[S,.95,.05]],lead,.013)
        line(glassGroup,[[S,.51,.05],[S*.75,.48,.05],[S*.58,.27,.05],[S*.82,.08,.05],[S,0,.05]],lead,.013)
        for(const yy of [.06,1.95])shape([['moveTo',S,yy],['lineTo',S*.84,yy],['lineTo',S*.95,yy+(yy<1?.13:-.13)]],'#438e9e')
        // Pink structural glazing bars visible in the supplied door.
        box(glassGroup,.022,2.03,.065,S*.34,1,.085,pinkLight)
      }
      line(glassGroup,[[0,2,.045],[0,1.83,.045],[-.07,1.7,.045],[0,1.57,.045],[.07,1.7,.045],[0,1.83,.045]],lead,.012)
      border(glassGroup,0,1,2,2,.05,lead,.018)
    }else{
      box(hinge,2.8,5.8,.19,1.4,2.9,0,wood)
      panel(hinge,1.4,4.4,2.26,2.23,wood,woodDark)
      panel(hinge,1.4,2.69,2.26,.72,wood,woodDark)
      panel(hinge,1.4,1.25,2.26,1.9,wood,woodDark)
      handle(hinge,2.52,3,.22)
      const key=new THREE.Group();key.position.set(2.52,2.8,.31);hinge.add(key)
      mesh(new THREE.TorusGeometry(.055,.014,8,20),brass,key);box(key,.02,.17,.025,0,-.12,0,brass);box(key,.07,.025,.025,.025,-.18,0,brass)
    }
    doors.push({hinge,hinges,x,group,width,height})
  }
  return doors
}
