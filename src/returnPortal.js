import * as THREE from 'three'
import { createPortalAura } from './portalAura.js'
import { buildDoors } from './doorModels.js'

// The same entrance door, facing back into the destination room, left ajar around its light.
export function createReturnPortal({ variant = 0, color = '#e1d5ff', textures = [], onExit } = {}) {
  const portal = new THREE.Group()
  portal.name = 'return-portal'
  portal.userData.action = 'return-portal'
  portal.userData.activate = () => onExit?.()
  const doorway = new THREE.Group()
  doorway.rotation.y = Math.PI
  portal.add(doorway)
  const door = buildDoors(doorway,textures,{only:variant})[0]
  door.group.position.x = 0
  door.group.name = ['ivory-return-door','pink-return-door','wood-return-door'][variant]
  // Keep every leaf, handle and carved detail selectable as part of the return portal.
  door.group.traverse(object=>{delete object.userData.door})
  door.hinges.forEach(hinge=>{hinge.node.rotation.y=hinge.sign*Math.PI*.34})
  portal.userData.variant=variant
  // Fit the rococo overdoor below the gallery ceiling without changing its proportions.
  if(variant===0)portal.scale.setScalar(.88)
  const glow = new THREE.ShaderMaterial({
    uniforms:{tint:{value:new THREE.Color(color)}},
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:'varying vec2 vUv;uniform vec3 tint;void main(){float core=1.0-smoothstep(0.0,0.7,length((vUv-0.5)*vec2(1.0,0.7)));gl_FragColor=vec4(mix(tint,vec3(1.0),core*0.8),1.0);}',
    side:THREE.DoubleSide,toneMapped:false,
  })
  const surface=new THREE.Mesh(new THREE.PlaneGeometry(door.width,door.height),glow)
  surface.position.set(0,door.height/2,-.115);doorway.add(surface)
  const aura=createPortalAura(color,door.width,door.height);doorway.add(aura)
  const spill=new THREE.PointLight(color,18,8,2);spill.position.set(0,3,-.6);portal.add(spill)
  return portal
}
