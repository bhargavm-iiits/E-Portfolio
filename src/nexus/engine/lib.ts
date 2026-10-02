/**
 * Shared three.js building blocks for the NEXUS worlds. Ported from the plate
 * pipeline that produced the design canvas (Docs/plan/render-pipeline/lib.js),
 * with time uniforms added so every surface keeps animating while idle.
 */
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";

export const NOISE = /* glsl */ `
float hash(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
float noise(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x), mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x), u.y); }
float fbm(vec2 p){ float s=0., a=.5; mat2 m=mat2(1.6,1.2,-1.2,1.6); for(int i=0;i<6;i++){ s+=a*noise(p); p=m*p; a*=.5; } return s; }
`;

const VERT_UV = /* glsl */ `varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`;

/** Seeded RNG so every world is laid out identically on every visit. */
export function rng(seed = 1) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
/** Remap x from [a,b] to [0,1], clamped. */
export const span = (x: number, a: number, b: number) => clamp01((x - a) / (b - a));
export const smooth = (x: number) => x * x * (3 - 2 * x);
export const easeIn2 = (x: number) => x * x;
export const easeIn3 = (x: number) => x * x * x;
export const easeOut3 = (x: number) => 1 - Math.pow(1 - x, 3);
export const easeInOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/* ── Plasma membrane (MASTER-PROMPT §7.2) ── mode 0 gate · 1 entry · 2 hub · 3 rooftop */
export interface PortalOptions { mode?: number; twist?: number; fil?: number; rim?: number; core?: number; sigma?: number; seed?: number; alphaIn?: number; gain?: number; omega?: number; streak?: number; window?: number }
export type PortalMaterial = THREE.ShaderMaterial & { uniforms: Record<string, THREE.IUniform<number>> };

export function portalMaterial(o: PortalOptions = {}): PortalMaterial {
  const u = (v: number) => ({ value: v });
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uMode: u(o.mode ?? 0), uTwist: u(o.twist ?? 0.6), uFil: u(o.fil ?? 1), uRim: u(o.rim ?? 1.6), uCore: u(o.core ?? 0), uSigma: u(o.sigma ?? 0.08),
      uSeed: u(o.seed ?? 0), uAlphaIn: u(o.alphaIn ?? 1), uGain: u(o.gain ?? 1), uTime: u(0), uOmega: u(o.omega ?? 0.15), uStreak: u(o.streak ?? 0.42), uWindow: u(o.window ?? 0),
    },
    vertexShader: VERT_UV,
    fragmentShader: NOISE + /* glsl */ `
varying vec2 vUv;
uniform float uTwist,uFil,uRim,uCore,uSigma,uMode,uSeed,uAlphaIn,uGain,uTime,uOmega,uStreak,uWindow;
void main(){
  vec2 p=vUv*2.-1.; float r=length(p); if(r>1.0) discard;
  float th=atan(p.y,p.x);
  float th2=th+uTwist*pow(1.-r,2.)+uTime*uOmega;
  vec2 q=vec2(cos(th2),sin(th2))*r*1.15 + uSeed;
  vec2 drift=vec2(uTime*.035,-uTime*.025);
  vec2 w=vec2(fbm(q*2.0+1.3+drift),fbm(q*2.0+7.1-drift));
  float n=fbm(q*2.4+w*1.8);
  float ridge1=1.-abs(fbm(q*1.55+w*1.9+4.2+drift*1.4)*2.-1.);
  float ridge2=1.-abs(fbm(q*3.1+w*1.3+9.4-drift)*2.-1.);
  float ridge3=1.-abs(fbm(q*8.0+w*1.1+2.7)*2.-1.);
  float fil=pow(ridge1,30.)*1.6+.45*pow(ridge2,40.)+.12*pow(ridge3,48.);
  vec3 deep=vec3(.06,.045,.17), mid=vec3(.22,.18,.48), mid2=vec3(.40,.31,.74), hot=vec3(.80,.70,1.0), rimc=vec3(.82,.74,1.0), corec=vec3(.99,.93,1.0);
  float shade=smoothstep(.15,.9,n);
  vec3 base=mix(deep,mid,shade*(.55+.45*smoothstep(.0,.85,r)));
  base=mix(base,mid2,smoothstep(.45,1.,r)*.75);
  vec3 col=pow(base,vec3(2.2));
  col+=pow(hot,vec3(2.2))*fil*uFil*(.30+.85*smoothstep(.05,.95,r));
  float rimB=smoothstep(.83,.975,r);
  col+=pow(rimc,vec3(2.2))*rimB*uRim*(.75+.5*noise(vec2(th*7.+uTime*.8,uSeed*3.)));
  col+=vec3(1.)*smoothstep(.955,.99,r)*(1.-smoothstep(.99,1.,r))*uRim*.9;
  float core=exp(-r*r/(uSigma*uSigma))*uCore; col+=corec*core;
  float a=1.;
  if(uMode>0.5&&uMode<1.5){
    col+=vec3(.8,.7,1.)*exp(-pow((r-.40)/.006,2.))*.9;
    col+=pow(mid2,vec3(2.2))*.35*(1.-r);
  }
  if(uMode>1.5&&uMode<2.5){
    float band=smoothstep(.60,.80,r);
    float sp=(th+3.14159)/6.28318*150.; float sector=floor(sp); float h=hash(vec2(sector,uSeed+1.7));
    float on=step(uStreak,h);
    float flow=fract(h*7.3-uTime*(.35+h*.6));
    float st=on*smoothstep(.10+.32*h,.42+.25*h,r)*(1.-smoothstep(.62,.74,r))*(.55+.45*smoothstep(.0,.5,flow));
    vec3 sc=mix(vec3(.44,.85,.95),vec3(.80,.72,1.),step(.5,hash(vec2(sector,3.1))));
    sc=mix(sc,vec3(1.),step(.85,hash(vec2(sector,5.3))));
    float thin=1.-smoothstep(0.,.45,abs(fract(sp)-.5)*2.);
    vec3 interior=vec3(.003,.002,.01)+pow(sc,vec3(2.2))*st*thin*2.6;
    interior+=vec3(.3,.12,1.)*exp(-r*r/.0025)*1.6 + vec3(.06,.02,.3)*exp(-r*r/.03)*.5;
    col=mix(interior,col,band);
  }
  if(uMode>2.5){ a=mix(uAlphaIn,1.,smoothstep(.62,.97,r)); a=clamp(a+fil*.9,0.,1.); }
  if(uWindow>0.001){ a=mix(1.,.38*smoothstep(0.,.85,r)+.06,uWindow); a=clamp(a+fil*.85+rimB,0.,1.); }
  gl_FragColor=vec4(col*uGain,a);
}`,
  }) as PortalMaterial;
}

export function glowMaterial(color = "#b9a2ff", { inner = 1.0, tight = 0.07, wide = 0.45, k1 = 1.0, k2 = 0.35 } = {}) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { uCol: { value: new THREE.Color(color) }, uIn: { value: inner }, uT: { value: tight }, uW: { value: wide }, uK1: { value: k1 }, uK2: { value: k2 } },
    vertexShader: VERT_UV,
    fragmentShader: /* glsl */ `varying vec2 vUv; uniform vec3 uCol; uniform float uIn,uT,uW,uK1,uK2;
void main(){ vec2 p=(vUv*2.-1.)*2.; float r=length(p); float d=max(r-uIn,0.);
  float g=exp(-pow(d/uT,2.))*uK1+exp(-pow(d/uW,2.))*uK2; if(r<uIn) g*=0.; gl_FragColor=vec4(uCol*g,1.); }`,
  });
}

/** Soft fog bank (BG02) with slow lateral drift. */
export function fogMaterial({ seed = 0, shadow = "#111930", lit = "#6E6A9A", opacity = 0.85, litPos = [0.5, 0.8] as [number, number], scale = [3, 1.6] as [number, number] } = {}) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: { uSeed: { value: seed }, uShadow: { value: new THREE.Color(shadow) }, uLit: { value: new THREE.Color(lit) }, uOp: { value: opacity }, uLitPos: { value: new THREE.Vector2(...litPos) }, uScale: { value: new THREE.Vector2(...scale) }, uTime: { value: 0 } },
    vertexShader: VERT_UV,
    fragmentShader: NOISE + /* glsl */ `varying vec2 vUv; uniform float uSeed,uOp,uTime; uniform vec3 uShadow,uLit; uniform vec2 uLitPos,uScale;
void main(){ vec2 uv=vUv; vec2 dr=vec2(uTime*.012,uTime*.004);
  vec2 w=vec2(fbm(uv*2.+uSeed+dr),fbm(uv*2.+uSeed+5.2-dr));
  float n=fbm(uv*uScale+w*1.3+uSeed+dr*2.);
  float n2=fbm(uv*uScale*2.3+w*2.+uSeed*1.7-dr);
  float edge=smoothstep(0.,.22,uv.x)*smoothstep(1.,.78,uv.x)*smoothstep(0.,.18,uv.y)*smoothstep(1.,.35,uv.y);
  float a=smoothstep(.30,.80,n*.75+n2*.35)*edge*uOp;
  float lit=clamp(1.-distance(uv,uLitPos)*1.2,0.,1.);
  vec3 c=mix(uShadow,uLit,clamp(lit*.9+n2*.35-.1,0.,1.));
  gl_FragColor=vec4(c,a); }`,
  });
}

/** Cloud / mist sheet (Home vista). */
export function cloudMaterial(seed: number, top: string, bot: string, op = 0.9, sc: [number, number] = [2.2, 1.2]) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    fog: false,
    uniforms: { uSeed: { value: seed }, uTop: { value: new THREE.Color(top) }, uBot: { value: new THREE.Color(bot) }, uOp: { value: op }, uSc: { value: new THREE.Vector2(...sc) }, uTime: { value: 0 } },
    vertexShader: VERT_UV,
    fragmentShader: NOISE + /* glsl */ `varying vec2 vUv; uniform float uSeed,uOp,uTime; uniform vec3 uTop,uBot; uniform vec2 uSc;
void main(){ vec2 uv=vUv; vec2 dr=vec2(uTime*.006,0.); vec2 w=vec2(fbm(uv*2.+uSeed+dr),fbm(uv*2.+uSeed+4.3)); float n=fbm(uv*uSc+w*1.4+uSeed+dr*3.);
  float n2=fbm(uv*uSc*2.6+w*1.8+uSeed*.7);
  float shape=smoothstep(0.,.25,uv.x)*smoothstep(1.,.75,uv.x)*smoothstep(0.,.35,uv.y)*smoothstep(1.,.55,uv.y);
  float a=smoothstep(.38,.75,n*.8+n2*.35)*shape*uOp;
  vec3 c=mix(uBot,uTop,clamp(uv.y*1.2+n2*.5-.2,0.,1.));
  gl_FragColor=vec4(c,a); }`,
  });
}

export function stars(parent: THREE.Object3D, { n = 1500, r = 400, size = 1.4, color = "#ffffff", seed = 3, spread = [1, 0.7] as [number, number], opacity = 0.9 } = {}) {
  const R = rng(seed), pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
  const c = new THREE.Color(color);
  for (let i = 0; i < n; i++) {
    const t = R() * Math.PI * 2, u = R() * 2 - 1, s = Math.sqrt(1 - u * u);
    pos.set([Math.cos(t) * s * r * spread[0], u * r * spread[1], Math.sin(t) * s * r], i * 3);
    const b = 0.35 + R() * 0.65;
    col.set([c.r * b, c.g * b, c.b * b], i * 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const p = new THREE.Points(g, new THREE.PointsMaterial({ size, sizeAttenuation: false, vertexColors: true, transparent: true, opacity, depthWrite: false }));
  parent.add(p);
  return p;
}

/** Segmented mechanical torus (§7.2): panels, panel lines, emissive slits, inner lip. */
export interface RingOptions { R1?: number; R2?: number; depth?: number; segs?: number; gap?: number; slit?: string; slitAlt?: string; altEvery?: number; seed?: number; metal?: string; lip?: string; slitK?: number; slitP?: number }
export function mechRing(o: RingOptions = {}) {
  const { R1 = 1, R2 = 1.25, depth = 0.35, segs = 24, gap = 0.012, slit = "#61E2EB", slitAlt = "#FFB45A", altEvery = 0, seed = 5, metal = "#1a1d2b", lip = "#8f6dff", slitK = 2.2, slitP = 1 } = o;
  const grp = new THREE.Group(), R = rng(seed);
  const mat = new THREE.MeshStandardMaterial({ color: metal, metalness: 0.85, roughness: 0.38 });
  const mat2 = new THREE.MeshStandardMaterial({ color: "#272b3d", metalness: 0.8, roughness: 0.5 });
  const slitMats: THREE.MeshBasicMaterial[] = [];
  for (let i = 0; i < segs; i++) {
    const a0 = (i / segs) * Math.PI * 2 + gap, a1 = ((i + 1) / segs) * Math.PI * 2 - gap;
    const sh = new THREE.Shape();
    sh.absarc(0, 0, R2, a0, a1, false);
    sh.absarc(0, 0, R1, a1, a0, true);
    const g = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.015, bevelSegments: 2, curveSegments: 12 });
    g.translate(0, 0, -depth / 2);
    grp.add(new THREE.Mesh(g, i % 3 === 0 ? mat2 : mat));
    const sh2 = new THREE.Shape(), pad = 0.035, rr1 = R1 + (R2 - R1) * 0.18, rr2 = R2 - (R2 - R1) * 0.12;
    sh2.absarc(0, 0, rr2, a0 + pad, a1 - pad, false);
    sh2.absarc(0, 0, rr1, a1 - pad, a0 + pad, true);
    const g2 = new THREE.ExtrudeGeometry(sh2, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 1, curveSegments: 10 });
    g2.translate(0, 0, depth / 2);
    grp.add(new THREE.Mesh(g2, i % 2 ? mat : mat2));
    const am = (a0 + a1) / 2, len = (R2 - R1) * (0.35 + R() * 0.25);
    const colr = altEvery && i % altEvery === 0 ? slitAlt : slit;
    const sm = new THREE.MeshBasicMaterial({ color: new THREE.Color(colr).multiplyScalar(slitK), toneMapped: false });
    slitMats.push(sm);
    const radial = R() > 0.45;
    const sg = radial ? new THREE.BoxGeometry(len, 0.03, 0.02) : new THREE.BoxGeometry(0.03, (a1 - a0) * R2 * 0.5, 0.02);
    const s = new THREE.Mesh(sg, sm);
    s.visible = R() < slitP;
    const rm = radial ? (R1 + R2) / 2 : R1 + (R2 - R1) * 0.78;
    s.position.set(Math.cos(am) * rm, Math.sin(am) * rm, depth / 2 + 0.05);
    s.rotation.z = am;
    grp.add(s);
    if (R() > 0.4) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.08 + R() * 0.12, 0.06, depth * 0.8), mat2);
      const ab = a0 + (a1 - a0) * R();
      b.position.set(Math.cos(ab) * (R2 + 0.03), Math.sin(ab) * (R2 + 0.03), 0);
      b.rotation.z = ab;
      grp.add(b);
    }
  }
  const lipM = new THREE.MeshStandardMaterial({ color: "#2a2550", emissive: lip, emissiveIntensity: 0.9, metalness: 0.6, roughness: 0.3 });
  grp.add(new THREE.Mesh(new THREE.TorusGeometry(R1 - 0.01, 0.03, 12, 160), lipM));
  grp.userData.slitMats = slitMats;
  grp.userData.lip = lipM;
  return grp;
}

/** Night-city window facade material for instanced boxes (BG05). */
export function windowMaterial({ seed = 1, fog = "#16203A", density = 0.012, base = "#0b0f1c", warm = "#ffd9a0", cool = "#9fe8ff", lit = 0.35, rowH = 3.2, colW = 2.2, k = 1.25, win = [0.18, 0.82, 0.25, 0.72] as [number, number, number, number] } = {}) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uSeed: { value: seed }, uFog: { value: new THREE.Color(fog) }, uDen: { value: density }, uBase: { value: new THREE.Color(base) }, uWarm: { value: new THREE.Color(warm) }, uCool: { value: new THREE.Color(cool) },
      uLit: { value: lit }, uRow: { value: rowH }, uCol: { value: colW }, uK: { value: k }, uWin: { value: new THREE.Vector4(...win) }, uTime: { value: 0 },
    },
    vertexShader: /* glsl */ `varying vec3 vW; varying vec3 vN; varying float vD;
void main(){ vec4 w=modelMatrix*instanceMatrix*vec4(position,1.); vW=w.xyz; vN=normalize(mat3(modelMatrix*instanceMatrix)*normal);
 vec4 mv=viewMatrix*w; vD=-mv.z; gl_Position=projectionMatrix*mv; }`,
    fragmentShader: /* glsl */ `varying vec3 vW; varying vec3 vN; varying float vD;
uniform float uSeed,uDen,uLit,uRow,uCol,uK,uTime; uniform vec3 uFog,uBase,uWarm,uCool; uniform vec4 uWin;
float h(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
void main(){
  vec3 n=abs(vN); vec3 c=uBase*(0.6+0.4*clamp(vW.y/120.,0.,1.));
  if(n.y<0.5){
    float u=(n.x>n.z? vW.z : vW.x)/uCol; float v=vW.y/uRow;
    vec2 cell=floor(vec2(u,v)); vec2 f=fract(vec2(u,v));
    float win=step(uWin.x,f.x)*step(f.x,uWin.y)*step(uWin.z,f.y)*step(f.y,uWin.w);
    float r=h(cell+uSeed+floor(vW.x*.013)*7.1+floor(vW.z*.013)*3.3);
    float flick=step(.985,h(cell+floor(uTime*2.)));
    float on=step(1.-uLit,r)*(1.-flick*.8);
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

export function skyGradient(parent: THREE.Object3D, stops: [number, string][], radius = 900) {
  const cols = stops.map((s) => new THREE.Color(s[1]));
  const last = stops[3] ?? stops[2];
  const m = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    depthWrite: false,
    fog: false,
    uniforms: { c0: { value: cols[0] }, c1: { value: cols[1] }, c2: { value: cols[2] }, c3: { value: cols[3] ?? cols[2] }, s: { value: new THREE.Vector4(stops[0][0], stops[1][0], stops[2][0], last[0]) } },
    vertexShader: `varying vec3 vP; void main(){ vP=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `varying vec3 vP; uniform vec3 c0,c1,c2,c3; uniform vec4 s;
void main(){ float y=vP.y; vec3 c=c0; c=mix(c,c1,smoothstep(s.x,s.y,y)); c=mix(c,c2,smoothstep(s.y,s.z,y)); c=mix(c,c3,smoothstep(s.z,s.w,y)); gl_FragColor=vec4(c,1.); }`,
  });
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 32, 24), m);
  parent.add(mesh);
  return mesh;
}

/** A gradient environment for PBR reflections without an HDR file. */
/** One PMREM generator per renderer, kept alive: its blur shader is large, and disposing it per world
 *  meant a synchronous recompile (100s of ms on ANGLE) every time a world was built. */
const pmrems = new WeakMap<THREE.WebGLRenderer, THREE.PMREMGenerator>();

export function gradientEnvironment(renderer: THREE.WebGLRenderer, frag: string) {
  let pm = pmrems.get(renderer);
  if (!pm) { pm = new THREE.PMREMGenerator(renderer); pmrems.set(renderer, pm); }
  const es = new THREE.Scene();
  const geo = new THREE.SphereGeometry(20, 32, 16);
  const mat = new THREE.ShaderMaterial({ side: THREE.BackSide, vertexShader: `varying vec3 vP; void main(){ vP=normalize(position); gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`, fragmentShader: `varying vec3 vP; void main(){ ${frag} }` });
  es.add(new THREE.Mesh(geo, mat));
  const tex = pm.fromScene(es, 0.04).texture;
  geo.dispose();
  mat.dispose();
  return tex;
}

function edgeBars(grp: THREE.Group, S: number, color: string, mult: number, thick: number) {
  const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(mult), toneMapped: false, transparent: true, opacity: 0.95 });
  const h = S / 2 + 0.002, L = S * 0.97;
  for (const a of [-1, 1]) for (const b of [-1, 1]) {
    const x = new THREE.Mesh(new THREE.BoxGeometry(L, thick, thick), m); x.position.set(0, a * h, b * h); grp.add(x);
    const y = new THREE.Mesh(new THREE.BoxGeometry(thick, L, thick), m); y.position.set(a * h, 0, b * h); grp.add(y);
    const z = new THREE.Mesh(new THREE.BoxGeometry(thick, thick, L), m); z.position.set(a * h, b * h, 0); grp.add(z);
  }
  return m;
}

/** Floating cubes (BG04). `dark` = glossy with violet neon edges (Home), `glass` = translucent violet (Menu / Log / Finale). */
export function makeCube(kind: "dark" | "glass", S = 1.6) {
  const grp = new THREE.Group();
  if (kind === "dark") {
    grp.add(new THREE.Mesh(new RoundedBoxGeometry(S, S, S, 4, 0.05), new THREE.MeshPhysicalMaterial({ color: "#0b0c1a", metalness: 0.55, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.08 })));
    const pm = new THREE.MeshPhysicalMaterial({ color: "#07070f", metalness: 0.7, roughness: 0.35, clearcoat: 1 });
    const v = S / 2 + 0.005;
    const panel = new RoundedBoxGeometry(S * 0.72, S * 0.72, 0.04, 2, 0.015);
    for (const [ax, sg] of [["x", 1], ["x", -1], ["y", 1], ["y", -1], ["z", 1], ["z", -1]] as const) {
      const p = new THREE.Mesh(panel, pm);
      if (ax === "x") { p.rotation.y = Math.PI / 2; p.position.x = sg * v; } else if (ax === "y") { p.rotation.x = Math.PI / 2; p.position.y = sg * v; } else p.position.z = sg * v;
      grp.add(p);
    }
    edgeBars(grp, S, "#8a5cff", 2.4, 0.022);
  } else {
    grp.add(new THREE.Mesh(new RoundedBoxGeometry(S, S, S, 4, 0.06), new THREE.MeshPhysicalMaterial({ color: "#7d6cf0", metalness: 0, roughness: 0.18, transparent: true, opacity: 0.5, clearcoat: 1, clearcoatRoughness: 0.1, sheen: 0.4, sheenColor: new THREE.Color("#b9a8ff"), side: THREE.DoubleSide, depthWrite: false })));
    edgeBars(grp, S, "#c3b6ff", 0.9, 0.012);
  }
  return grp;
}

/** Blue iso menu cube (CH07). */
export function makeMenuCube(S = 1.6) {
  const grp = new THREE.Group();
  const f = (color: string, emissive: string, k: number, opacity = 0.92) => new THREE.MeshPhysicalMaterial({ color, emissive, emissiveIntensity: k, roughness: 0.15, transparent: opacity < 1, opacity, clearcoat: 1 });
  grp.add(new THREE.Mesh(new THREE.BoxGeometry(S, S, S), [f("#3d8dff", "#2a6dff", 0.9), f("#3d8dff", "#2a6dff", 0.9), f("#5fb0ff", "#3f9bff", 0.85, 0.95), f("#1d4fb8", "#123a9a", 0.6, 1), f("#5aa6ff", "#3f8cff", 1.0), f("#2a64d8", "#1d55c8", 0.8, 1)]));
  edgeBars(grp, S, "#bfe9ff", 1.6, 0.03);
  return grp;
}

export function disposeObject(root: THREE.Object3D) {
  root.traverse((o) => {
    const m = o as THREE.Mesh;
    if (m.geometry) m.geometry.dispose();
    const mat = m.material as THREE.Material | THREE.Material[] | undefined;
    if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
    else if (mat) mat.dispose();
  });
}
