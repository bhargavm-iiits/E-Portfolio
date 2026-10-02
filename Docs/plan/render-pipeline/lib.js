// Shared helpers for the NEXUS plate renders (three r185).
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

export const q = new URLSearchParams(location.search);
export const W = +q.get("w") || 1600, H = +q.get("h") || 900;

export function makeRenderer(alpha = false) {
  const r = new THREE.WebGLRenderer({ antialias: true, alpha, preserveDrawingBuffer: true });
  r.setPixelRatio(1); r.setSize(W, H);
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = +q.get("exp") || 1;
  if (alpha) r.setClearColor(0, 0);
  document.body.appendChild(r.domElement);
  return r;
}

export function renderWithBloom(renderer, scene, cam, { strength = 1.0, radius = 0.6, threshold = 0.6 } = {}) {
  const comp = new EffectComposer(renderer);
  comp.setPixelRatio(1); comp.setSize(W, H);
  comp.addPass(new RenderPass(scene, cam));
  comp.addPass(new UnrealBloomPass(new THREE.Vector2(W, H), strength, radius, threshold));
  comp.addPass(new OutputPass());
  comp.render();
  requestAnimationFrame(() => { comp.render(); requestAnimationFrame(() => { comp.render(); window.__done = true; }); });
}
export function renderPlain(renderer, scene, cam) {
  renderer.render(scene, cam);
  requestAnimationFrame(() => { renderer.render(scene, cam); window.__done = true; });
}

export const NOISE = /* glsl */ `
float hash(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x), mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x), u.y); }
float fbm(vec2 p){ float s=0., a=.5; mat2 m=mat2(1.6,1.2,-1.2,1.6); for(int i=0;i<6;i++){ s+=a*noise(p); p=m*p; a*=.5; } return s; }
`;

// Seeded RNG so plates are reproducible.
export function rng(seed = 1) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

/* ── Plasma membrane (spec §7.2) ── mode 0 gate · 1 entry · 2 hub · 3 se */
export function portalMaterial({ mode = 0, twist = 0.6, fil = 1.0, rim = 1.6, core = 0.0, sigma = 0.08, seed = 0.0, alphaIn = 1.0, gain = 1.0 } = {}) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, toneMapped: true,
    uniforms: { uMode: { value: mode }, uTwist: { value: twist }, uFil: { value: fil }, uRim: { value: rim }, uCore: { value: core }, uSigma: { value: sigma }, uSeed: { value: seed }, uAlphaIn: { value: alphaIn }, uGain: { value: gain } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: NOISE + /* glsl */ `
varying vec2 vUv;
uniform float uTwist,uFil,uRim,uCore,uSigma,uMode,uSeed,uAlphaIn,uGain;
void main(){
  vec2 p=vUv*2.-1.; float r=length(p); if(r>1.0) discard;
  float th=atan(p.y,p.x);
  float th2=th+uTwist*pow(1.-r,2.);
  vec2 q=vec2(cos(th2),sin(th2))*r*1.15 + uSeed;
  vec2 w=vec2(fbm(q*2.0+1.3),fbm(q*2.0+7.1));
  float n=fbm(q*2.4+w*1.8);
  float ridge1=1.-abs(fbm(q*1.55+w*1.9+4.2)*2.-1.);
  float ridge2=1.-abs(fbm(q*3.1+w*1.3+9.4)*2.-1.);
  float ridge3=1.-abs(fbm(q*8.0+w*1.1+2.7)*2.-1.);
  float fil=pow(ridge1,30.)*1.6+.45*pow(ridge2,40.)+.12*pow(ridge3,48.);
  vec3 deep=vec3(.06,.045,.17), mid=vec3(.22,.18,.48), mid2=vec3(.40,.31,.74), hot=vec3(.80,.70,1.0), rimc=vec3(.82,.74,1.0), corec=vec3(.99,.93,1.0);
  float shade=smoothstep(.15,.9,n);
  vec3 base=mix(deep,mid,shade*(.55+.45*smoothstep(.0,.85,r)));
  base=mix(base,mid2,smoothstep(.45,1.,r)*.75);
  vec3 col=pow(base,vec3(2.2));
  col+=pow(hot,vec3(2.2))*fil*uFil*(.30+.85*smoothstep(.05,.95,r));
  float rimB=smoothstep(.83,.975,r);
  col+=pow(rimc,vec3(2.2))*rimB*uRim*(.75+.5*noise(vec2(th*7.,uSeed*3.)));
  col+=vec3(1.)*smoothstep(.955,.99,r)*(1.-smoothstep(.99,1.,r))*uRim*.9;
  float core=exp(-r*r/(uSigma*uSigma))*uCore; col+=corec*core;
  float a=1.;
  if(uMode>0.5&&uMode<1.5){ // entry: thin inner ring at 40% + bright spiral body
    col+=vec3(.8,.7,1.)*exp(-pow((r-.40)/.006,2.))*.9;
    col+=pow(mid2,vec3(2.2))*.35*(1.-r);
  }
  if(uMode>1.5&&uMode<2.5){ // hub: rim plasma band, interior radial hyperspace streaks
    float band=smoothstep(.60,.80,r);
    float sp=(th+3.14159)/6.28318*150.; float sector=floor(sp); float h=hash(vec2(sector,uSeed+1.7));
    float on=step(.42,h);
    float st=on*smoothstep(.10+.32*h,.42+.25*h,r)*(1.-smoothstep(.62,.74,r));
    vec3 sc=mix(vec3(.44,.85,.95),vec3(.80,.72,1.),step(.5,hash(vec2(sector,3.1))));
    sc=mix(sc,vec3(1.),step(.85,hash(vec2(sector,5.3))));
    float thin=1.-smoothstep(0.,.45,abs(fract(sp)-.5)*2.);
    vec3 interior=vec3(.003,.002,.01)+pow(sc,vec3(2.2))*st*thin*2.6;
    interior+=vec3(.3,.12,1.)*exp(-r*r/.0025)*1.6 + vec3(.06,.02,.3)*exp(-r*r/.03)*.5;
    col=mix(interior,col,band);
  }
  if(uMode>2.5){ // se: translucent interior shows the city behind
    a=mix(uAlphaIn,1.,smoothstep(.62,.97,r)); a=clamp(a+fil*.9,0.,1.);
  }
  gl_FragColor=vec4(col*uGain,a);
}`,
  });
}

export function glowMaterial(color = "#b9a2ff", { inner = 1.0, tight = 0.07, wide = 0.45, k1 = 1.0, k2 = 0.35 } = {}) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uCol: { value: new THREE.Color(color) }, uIn: { value: inner }, uT: { value: tight }, uW: { value: wide }, uK1: { value: k1 }, uK2: { value: k2 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `varying vec2 vUv; uniform vec3 uCol; uniform float uIn,uT,uW,uK1,uK2;
void main(){ vec2 p=(vUv*2.-1.)*2.; float r=length(p); float d=max(r-uIn,0.);
  float g=exp(-pow(d/uT,2.))*uK1+exp(-pow(d/uW,2.))*uK2; if(r<uIn) g*= .0; gl_FragColor=vec4(uCol*g,1.); }`,
  });
}

/* Soft fog bank (spec BG02) */
export function fogMaterial({ seed = 0, shadow = "#111930", lit = "#6E6A9A", opacity = 0.85, litPos = [0.5, 0.8], scale = [3, 1.6] } = {}) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uSeed: { value: seed }, uShadow: { value: new THREE.Color(shadow) }, uLit: { value: new THREE.Color(lit) }, uOp: { value: opacity }, uLitPos: { value: new THREE.Vector2(...litPos) }, uScale: { value: new THREE.Vector2(...scale) } },
    vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: NOISE + `varying vec2 vUv; uniform float uSeed,uOp; uniform vec3 uShadow,uLit; uniform vec2 uLitPos,uScale;
void main(){ vec2 uv=vUv; vec2 w=vec2(fbm(uv*2.+uSeed),fbm(uv*2.+uSeed+5.2));
  float n=fbm(uv*uScale+w*1.3+uSeed);
  float n2=fbm(uv*uScale*2.3+w*2.+uSeed*1.7);
  float edge=smoothstep(0.,.22,uv.x)*smoothstep(1.,.78,uv.x)*smoothstep(0.,.18,uv.y)*smoothstep(1.,.35,uv.y);
  float a=smoothstep(.30,.80,n*.75+n2*.35)*edge*uOp;
  float lit=clamp(1.-distance(uv,uLitPos)*1.2,0.,1.);
  vec3 c=mix(uShadow,uLit,clamp(lit*.9+n2*.35-.1,0.,1.));
  gl_FragColor=vec4(c,a); }`,
  });
}

export function stars(scene, { n = 1500, r = 400, size = 1.4, color = "#ffffff", seed = 3, spread = [1, 0.7], z = -1, opacity = 0.9 } = {}) {
  const R = rng(seed), pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
  const c = new THREE.Color(color);
  for (let i = 0; i < n; i++) {
    const t = R() * Math.PI * 2, u = R() * 2 - 1;
    const x = Math.cos(t) * Math.sqrt(1 - u * u), y = u, zz = Math.sin(t) * Math.sqrt(1 - u * u);
    pos.set([x * r * spread[0], y * r * spread[1], zz * r], i * 3);
    const b = 0.35 + R() * 0.65; col.set([c.r * b, c.g * b, c.b * b], i * 3);
  }
  const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const p = new THREE.Points(g, new THREE.PointsMaterial({ size, sizeAttenuation: false, vertexColors: true, transparent: true, opacity, depthWrite: false }));
  scene.add(p); return p;
}

/* Segmented mechanical torus (spec §7.2): 24 panels, panel lines, emissive slits */
export function mechRing({ R1 = 1, R2 = 1.25, depth = 0.35, segs = 24, gap = 0.012, slit = "#61E2EB", slitAlt = "#FFB45A", altEvery = 0, seed = 5, metal = "#1a1d2b", lip = "#8f6dff", slitK = 2.2, slitP = 1 } = {}) {
  const grp = new THREE.Group(), R = rng(seed);
  const mat = new THREE.MeshStandardMaterial({ color: metal, metalness: 0.85, roughness: 0.38 });
  const mat2 = new THREE.MeshStandardMaterial({ color: "#272b3d", metalness: 0.8, roughness: 0.5 });
  for (let i = 0; i < segs; i++) {
    const a0 = (i / segs) * Math.PI * 2 + gap, a1 = ((i + 1) / segs) * Math.PI * 2 - gap;
    const sh = new THREE.Shape();
    sh.absarc(0, 0, R2, a0, a1, false); sh.absarc(0, 0, R1, a1, a0, true);
    const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.015, bevelSegments: 2, curveSegments: 12 });
    g.translate(0, 0, -depth / 2);
    const m = new THREE.Mesh(g, i % 3 === 0 ? mat2 : mat); grp.add(m);
    // raised armour plate on the front face
    const sh2 = new THREE.Shape(); const pad = 0.035, rr1 = R1 + (R2 - R1) * 0.18, rr2 = R2 - (R2 - R1) * 0.12;
    sh2.absarc(0, 0, rr2, a0 + pad, a1 - pad, false); sh2.absarc(0, 0, rr1, a1 - pad, a0 + pad, true);
    const g2 = new THREE.ExtrudeGeometry(sh2, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 1, curveSegments: 10 });
    g2.translate(0, 0, depth / 2);
    grp.add(new THREE.Mesh(g2, i % 2 ? mat : mat2));
    // emissive slit
    const am = (a0 + a1) / 2, len = (R2 - R1) * (0.35 + R() * 0.25);
    const colr = altEvery && i % altEvery === 0 ? slitAlt : slit;
    const sm = new THREE.MeshBasicMaterial({ color: new THREE.Color(colr).multiplyScalar(slitK), toneMapped: false });
    const radial = R() > 0.45;
    const sg = radial ? new THREE.BoxGeometry(len, 0.03, 0.02) : new THREE.BoxGeometry(0.03, (a1 - a0) * R2 * 0.5, 0.02);
    const s = new THREE.Mesh(sg, sm); s.visible = R() < slitP;
    const rm = radial ? (R1 + R2) / 2 : R1 + (R2 - R1) * 0.78;
    s.position.set(Math.cos(am) * rm, Math.sin(am) * rm, depth / 2 + 0.05); s.rotation.z = am; grp.add(s);
    // small greeble blocks on the outer edge
    if (R() > 0.4) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.08 + R() * 0.12, 0.06, depth * 0.8), mat2); const ab = a0 + (a1 - a0) * R(); b.position.set(Math.cos(ab) * (R2 + 0.03), Math.sin(ab) * (R2 + 0.03), 0); b.rotation.z = ab; grp.add(b); }
  }
  // inner lip that catches the plasma light
  const lipM = new THREE.MeshStandardMaterial({ color: "#2a2550", emissive: lip, emissiveIntensity: 0.9, metalness: 0.6, roughness: 0.3 });
  const lipG = new THREE.TorusGeometry(R1 - 0.01, 0.03, 12, 160); grp.add(new THREE.Mesh(lipG, lipM));
  return grp;
}

/* Night-city window facade material (spec BG05) */
export function windowMaterial({ seed = 1, fog = "#16203A", density = 0.012, base = "#0b0f1c", warm = "#ffd9a0", cool = "#9fe8ff", lit = 0.35, rowH = 3.2, colW = 2.2, k = 1.25, win = [0.18, 0.82, 0.25, 0.72] } = {}) {
  return new THREE.ShaderMaterial({
    uniforms: { uSeed: { value: seed }, uFog: { value: new THREE.Color(fog) }, uDen: { value: density }, uBase: { value: new THREE.Color(base) }, uWarm: { value: new THREE.Color(warm) }, uCool: { value: new THREE.Color(cool) }, uLit: { value: lit }, uRow: { value: rowH }, uCol: { value: colW }, uK: { value: k }, uWin: { value: new THREE.Vector4(...win) } },
    vertexShader: `varying vec3 vW; varying vec3 vN; varying float vD;
void main(){ vec4 w=modelMatrix*instanceMatrix*vec4(position,1.); vW=w.xyz; vN=normalize(mat3(modelMatrix*instanceMatrix)*normal);
 vec4 mv=viewMatrix*w; vD=-mv.z; gl_Position=projectionMatrix*mv; }`,
    fragmentShader: `varying vec3 vW; varying vec3 vN; varying float vD;
uniform float uSeed,uDen,uLit,uRow,uCol,uK; uniform vec3 uFog,uBase,uWarm,uCool; uniform vec4 uWin;
float h(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
void main(){
  vec3 n=abs(vN); vec3 c=uBase*(0.6+0.4*clamp(vW.y/120.,0.,1.));
  if(n.y<0.5){
    float u=(n.x>n.z? vW.z : vW.x)/uCol; float v=vW.y/uRow;
    vec2 cell=floor(vec2(u,v)); vec2 f=fract(vec2(u,v));
    float win=step(uWin.x,f.x)*step(f.x,uWin.y)*step(uWin.z,f.y)*step(f.y,uWin.w);
    float r=h(cell+uSeed+floor(vW.x*.013)*7.1+floor(vW.z*.013)*3.3);
    float on=step(1.-uLit,r);
    vec3 wc=mix(uWarm,uCool,step(.72,h(cell*1.7+uSeed)));
    float strip=step(.93,h(vec2(floor(v),floor(vW.x*.05+vW.z*.05)+uSeed)));
    c+=wc*win*on*(0.7+0.6*h(cell+3.))*uK;
    c+=wc*strip*step(.3,f.y)*step(f.y,.6)*0.9*uK*.6;
    c+=vec3(.05,.07,.12)*step(.96,fract(v*.25));
  } else { c=uBase*0.5; }
  float fogF=1.-exp(-uDen*uDen*vD*vD);
  gl_FragColor=vec4(mix(c,uFog,clamp(fogF,0.,1.)),1.);
}`,
  });
}

export function skyGradient(scene, stops, radius = 900) {
  const g = new THREE.SphereGeometry(radius, 32, 24);
  const cols = stops.map((s) => new THREE.Color(s[1]));
  const m = new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false,
    uniforms: { c0: { value: cols[0] }, c1: { value: cols[1] }, c2: { value: cols[2] }, c3: { value: cols[3] || cols[2] }, s: { value: new THREE.Vector4(stops[0][0], stops[1][0], stops[2][0], (stops[3] || stops[2])[0]) } },
    vertexShader: `varying vec3 vP; void main(){ vP=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `varying vec3 vP; uniform vec3 c0,c1,c2,c3; uniform vec4 s;
void main(){ float y=vP.y; vec3 c=c0; c=mix(c,c1,smoothstep(s.x,s.y,y)); c=mix(c,c2,smoothstep(s.y,s.z,y)); c=mix(c,c3,smoothstep(s.z,s.w,y)); gl_FragColor=vec4(c,1.); }`,
  });
  const mesh = new THREE.Mesh(g, m); scene.add(mesh); return mesh;
}
