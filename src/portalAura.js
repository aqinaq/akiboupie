import * as THREE from 'three'

// Soft additive light around the opening; no full-screen bloom or extra render pass.
export function createPortalAura(color, width, height) {
  const group=new THREE.Group();group.name='portal-aura'
  const material=new THREE.ShaderMaterial({
    uniforms:{tint:{value:new THREE.Color(color)},extent:{value:new THREE.Vector2(width+2.4,height+2.4)},halfOpening:{value:new THREE.Vector2(width/2,height/2)},strength:{value:1}},
    vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:`varying vec2 vUv;
      uniform vec3 tint; uniform vec2 extent; uniform vec2 halfOpening; uniform float strength;
      void main(){
        vec2 q=abs((vUv-0.5)*extent)-halfOpening;
        float outside=length(max(q,0.0));
        float edge=exp(-abs(max(q.x,q.y))*4.5);
        float haze=exp(-outside*2.8)*0.13;
        float fade=1.0-smoothstep(0.75,1.18,outside);
        gl_FragColor=vec4(tint,(edge*0.48+haze)*fade*strength);
      }`,
    transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,depthTest:true,
    side:THREE.DoubleSide,toneMapped:false,
  })
  const geometry=new THREE.PlaneGeometry(width+2.4,height+2.4)
  for(const z of [-.22,.22]){
    const halo=new THREE.Mesh(geometry,material);halo.position.set(0,height/2,z);halo.renderOrder=2;halo.raycast=()=>{};group.add(halo)
  }
  group.userData.setStrength=value=>{material.uniforms.strength.value=value;group.visible=value>0}
  return group
}
