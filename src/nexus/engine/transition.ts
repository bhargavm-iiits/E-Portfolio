/**
 * TransitionPass (MASTER-PROMPT §8.0): composites world A and world B (both rendered to HDR targets
 * with their own bloom) by a scroll-scrubbed t. Runs before tone mapping (OutputPass).
 * Modes: 0 A only · 1 fade · 2 dip through a colour · 3 slit doors (T17) · 4 radial zoom (T05/T07/T37)
 *        5 iris / orb lens (T15/T26) · 6 hard push (T21) · 7 whip pan (T20)
 */
import * as THREE from "three";

export function transitionMaterial() {
  return new THREE.ShaderMaterial({
    depthTest: false,
    depthWrite: false,
    uniforms: {
      tA: { value: null as THREE.Texture | null },
      tB: { value: null as THREE.Texture | null },
      uT: { value: 0 },
      uMode: { value: 0 },
      uDip: { value: new THREE.Vector3() },
      uAspect: { value: 16 / 9 },
      /** Per-world exposure, applied here so one OutputPass (ACES) tone-maps the blend. */
      uEA: { value: 1 },
      uEB: { value: 1 },
    },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`,
    fragmentShader: /* glsl */ `
varying vec2 vUv;
uniform sampler2D tA, tB; uniform float uT, uMode, uAspect, uEA, uEB; uniform vec3 uDip;
vec3 A(vec2 uv){ return texture2D(tA, clamp(uv, .001, .999)).rgb*uEA; }
vec3 B(vec2 uv){ return texture2D(tB, clamp(uv, .001, .999)).rgb*uEB; }
float ease(float x){ return x*x*(3.-2.*x); }
// the dip colour as a radial core → violet rim (the bloom look of T04/T10, not a flat fill)
vec3 dip(vec2 uv){ float r=length((uv-.5)*vec2(uAspect,1.))/max(uAspect,1.)*2.; return uDip*mix(vec3(1.),vec3(.32,.2,.75),smoothstep(.05,.9,r)); }
vec3 zoomA(vec2 uv, float k){ vec2 c=vec2(.5); vec3 s=vec3(0.); for(int i=0;i<14;i++){ float f=float(i)/13.; s+=A(c+(uv-c)*(1.-k*f)); } return s/14.; }
vec3 zoomB(vec2 uv, float k){ vec2 c=vec2(.5); vec3 s=vec3(0.); for(int i=0;i<14;i++){ float f=float(i)/13.; s+=B(c+(uv-c)*(1.+k*f)); } return s/14.; }
vec3 hblurA(vec2 uv, float k){ vec3 s=vec3(0.); for(int i=0;i<12;i++){ float f=float(i)/11.-.5; s+=A(uv+vec2(f*k,0.)); } return s/12.; }
vec3 hblurB(vec2 uv, float k){ vec3 s=vec3(0.); for(int i=0;i<12;i++){ float f=float(i)/11.-.5; s+=B(uv+vec2(f*k,0.)); } return s/12.; }
void main(){
  vec2 uv=vUv; float t=clamp(uT,0.,1.); vec3 col;
  if(uMode<0.5){ col=A(uv); }
  else if(uMode<1.5){ col=mix(A(uv),B(uv),ease(t)); }
  else if(uMode<2.5){
    // dip: A ramps into the colour, B emerges from it (a single slow ramp, never a flash)
    float k1=ease(clamp(t*2.,0.,1.)), k2=ease(clamp(t*2.-1.,0.,1.));
    vec3 d=dip(uv), a=A(uv)+d*k1*.15, b=B(uv);
    col = t<.5 ? mix(a, d, k1) : mix(d, b, k2);
  }
  else if(uMode<3.5){
    // slit doors: A splits from the centre seam; B behind scales 1.12 → 1
    float g=ease(t)*.5, dx=uv.x-.5;
    if(abs(dx)<g){ vec2 c=vec2(.5); col=B(c+(uv-c)/(1.12-.12*ease(t))); }
    else { col=hblurA(vec2(uv.x-sign(dx)*g, uv.y), .06*sin(3.14159*t)); }
    float seam=exp(-pow((abs(dx)-g)*900.,2.))*(1.-smoothstep(.3,.6,t))*step(.002,t);
    col+=vec3(.38,.88,.92)*seam*4.;
  }
  else if(uMode<4.5){
    // radial zoom: A streaks into the vanishing point, B arrives from inside it
    float kA=ease(clamp(t*1.6,0.,1.)), kB=ease(clamp((1.-t)*1.6,0.,1.));
    vec3 a=zoomA(uv, kA*.55), b=zoomB(uv, kB*.45);
    float m=smoothstep(.35,.7,t);
    col=mix(a,b,m)+dip(uv)*.22*exp(-pow((t-.5)/.12,2.));
  }
  else if(uMode<5.5){
    // iris / orb lens: B opens in a growing circle with a bright rim
    vec2 p=(uv-.5)*vec2(uAspect,1.); float r=length(p);
    float R=pow(t,1.6)*1.25*max(uAspect,1.);
    float inside=1.-smoothstep(R-.02,R+.01,r);
    vec2 lens=.5+(uv-.5)*(1.-.25*(1.-smoothstep(0.,R+.001,r))*(1.-t));
    col=mix(A(uv)*(1.-.35*t), B(lens), inside);
    col+=vec3(.45,.75,1.)*exp(-pow((r-R)*60.,2.))*2.5*(1.-t*.6)*step(.01,t);
  }
  else if(uMode<6.5){
    float k=t<.5 ? 8.*t*t*t*t : 1.-pow(-2.*t+2.,4.)/2.;
    col = uv.x < 1.-k ? A(uv+vec2(k,0.)) : B(uv+vec2(k-1.,0.));
    col+=vec3(.8,.95,1.)*exp(-pow((uv.x-(1.-k))*700.,2.))*step(.01,t)*step(t,.99)*2.;
  }
  else {
    float k=ease(t), blur=.09*sin(3.14159*t);
    col = uv.x < 1.-k ? hblurA(uv+vec2(k,0.), blur) : hblurB(uv+vec2(k-1.,0.), blur);
  }
  gl_FragColor=vec4(col,1.);
}`,
  });
}
