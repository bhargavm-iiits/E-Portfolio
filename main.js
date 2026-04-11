// CRITICAL FIX: Force scroll to top on refresh so name animates correctly
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

gsap.registerPlugin(ScrollTrigger);

// 1. Lenis Smooth Scrolling
const lenis = new Lenis({
    duration: 1.5,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
});

lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => { lenis.raf(time * 1000); });
gsap.ticker.lagSmoothing(0, 0);

// 2. Custom Cursor
const cursor = document.querySelector('.cursor');
document.addEventListener('mousemove', (e) => {
    gsap.to(cursor, { x: e.clientX, y: e.clientY, duration: 0.1 });
});

// 3. Cinematic CAD Loader
const tlLoader = gsap.timeline();
let loaderProgress = { val: 0 };
tlLoader.to(loaderProgress, {
    val: 100,
    duration: 2.5,
    ease: "power2.inOut",
    onUpdate: () => {
        document.querySelector('.loader-percentage').innerText = Math.round(loaderProgress.val) + "%";
    }
})
.to('#loader', { autoAlpha: 0, duration: 1, ease: "power2.inOut" })
.fromTo('.hero-block', { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 1.5, ease: "power3.out" }, "-=1")
.fromTo('.contact-array', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power3.out" }, "-=1.2");

// 4. Three.js - The "Product"
const canvas = document.getElementById('webgl-canvas');
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 15;

const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xff8539, 2); // Orange highlight
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);
const tanLight = new THREE.DirectionalLight(0xb5a696, 1); // Tan fill
tanLight.position.set(-5, -5, 2);
scene.add(tanLight);

// The Main "Artifact" Model
const productGroup = new THREE.Group();

// CRITICAL FIX: Ensure transparent is natively set to true for opacity animations
const coreGeo = new THREE.CylinderGeometry(2, 2, 0.5, 32);
const coreMat = new THREE.MeshPhysicalMaterial({ color: 0x100904, metalness: 0.9, roughness: 0.1, transparent: true, opacity: 1 });
const core = new THREE.Mesh(coreGeo, coreMat);
core.rotation.x = Math.PI / 2;
productGroup.add(core);

const ringGeo = new THREE.TorusGeometry(1.5, 0.05, 16, 100);
const ringMat = new THREE.MeshBasicMaterial({ color: 0xff8539, transparent: true, opacity: 1 });
const ring = new THREE.Mesh(ringGeo, ringMat);
productGroup.add(ring);

const shellGeo = new THREE.IcosahedronGeometry(3.5, 2);
const shellMat = new THREE.MeshBasicMaterial({ color: 0xb5a696, wireframe: true, transparent: true, opacity: 0.1 });
const shell = new THREE.Mesh(shellGeo, shellMat);
productGroup.add(shell);

scene.add(productGroup);

// --- NEW DEEP 3D ENGINEERING ENVIRONMENT ---

// 1. Giant Grid System (Floor & Ceiling Tunnel)
const gridHelper = new THREE.GridHelper(200, 100, 0xff8539, 0xb5a696);
gridHelper.position.y = -15;
gridHelper.material.opacity = 0.04;
gridHelper.material.transparent = true;
scene.add(gridHelper);

const gridHelperTop = new THREE.GridHelper(200, 100, 0xff8539, 0xb5a696);
gridHelperTop.position.y = 15;
gridHelperTop.rotation.x = Math.PI; // Flip to become ceiling
gridHelperTop.material.opacity = 0.04;
gridHelperTop.material.transparent = true;
scene.add(gridHelperTop);

// 2. Deep Space Wireframe Debris
const debrisGeo = new THREE.TetrahedronGeometry(0.3, 0);
const debrisMat = new THREE.MeshBasicMaterial({ color: 0xb5a696, wireframe: true, transparent: true, opacity: 0.15 });
const debrisGroup = new THREE.Group();
const debrisList = [];

for(let i = 0; i < 200; i++) {
    const d = new THREE.Mesh(debrisGeo, debrisMat);
    d.position.set(
        (Math.random() - 0.5) * 80,
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * -150 - 20 // Deep placement
    );
    d.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    debrisGroup.add(d);
    debrisList.push({ mesh: d, speed: Math.random() * 0.08 + 0.02 });
}
scene.add(debrisGroup);

// 3. Giant HUD Nav Rings
const massiveRingGeo = new THREE.TorusGeometry(20, 0.02, 16, 100);
const massiveRingMat = new THREE.MeshBasicMaterial({ color: 0xff8539, transparent: true, opacity: 0.1 });

const mRing1 = new THREE.Mesh(massiveRingGeo, massiveRingMat);
mRing1.position.z = -50;
scene.add(mRing1);

const mRing2 = new THREE.Mesh(massiveRingGeo, massiveRingMat);
mRing2.position.set(0, 0, -90);
mRing2.rotation.x = Math.PI / 6;
scene.add(mRing2);

const mRing3 = new THREE.Mesh(massiveRingGeo, massiveRingMat);
mRing3.position.set(0, 0, -130);
mRing3.rotation.y = Math.PI / 4;
scene.add(mRing3);

// 4. Large Floating Mathematical Primitives
const mathGeometries = [
    new THREE.BoxGeometry(2.5, 2.5, 2.5), 
    new THREE.TetrahedronGeometry(3),     
    new THREE.OctahedronGeometry(2.5),    
    new THREE.TorusGeometry(2, 0.02, 16, 50), 
    new THREE.DodecahedronGeometry(2)     
];

const mathGroup = new THREE.Group();
const mathActors = [];

for(let i=0; i < 20; i++) {
    const geo = mathGeometries[Math.floor(Math.random() * mathGeometries.length)];
    const mat = new THREE.MeshBasicMaterial({ color: 0xff8539, wireframe: true, transparent: true, opacity: 0.12 });
    const mesh = new THREE.Mesh(geo, mat);
    
    // Spread wildly across X, Y, and Z fields
    mesh.position.set(
        (Math.random() - 0.5) * 40, 
        (Math.random() - 0.5) * 30, 
        (Math.random() - 0.5) * -80 - 15 
    );
    mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    
    mathGroup.add(mesh);
    mathActors.push({
        mesh: mesh,
        rx: (Math.random() - 0.5) * 0.015,
        ry: (Math.random() - 0.5) * 0.015,
        rz: (Math.random() - 0.5) * 0.015
    });
}
scene.add(mathGroup);


// Particles for Footer
const particlesGeo = new THREE.BufferGeometry();
const particleCount = 2000;
const posArray = new Float32Array(particleCount * 3);
for(let i=0; i < particleCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 50;
}
particlesGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const particlesMat = new THREE.PointsMaterial({ size: 0.05, color: 0xff8539, transparent: true, opacity: 0 });
const particlesMesh = new THREE.Points(particlesGeo, particlesMat);
scene.add(particlesMesh);

// 5. ScrollTrigger Master Sequence

// A. Handle Sequential Narrative Scenes
gsap.utils.toArray('.sequence-scene').forEach((scene, i) => {
    
    const titleLayer = scene.querySelector('.title-layer');
    const detailLayer = scene.querySelector('.detail-layer');

    if (titleLayer && detailLayer) {
        const tlSequence = gsap.timeline({
            scrollTrigger: { 
                trigger: scene, 
                start: "top top", 
                end: "bottom top", 
                scrub: 1 
            }
        });
        
        // 1. Title Sequence
        tlSequence.fromTo(titleLayer, { opacity: 0, scale: 0.95, y: 30 }, { opacity: 1, scale: 1, y: 0, duration: 2, ease: "power2.out" })
        tlSequence.to(titleLayer, { duration: 2 }) // hold
        tlSequence.to(titleLayer, { opacity: 0, y: -50, duration: 1.5, ease: "power2.in" })
        
        // 2. Data Sequence
        tlSequence.fromTo(detailLayer, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 2, ease: "power2.out" })
        tlSequence.to(detailLayer, { duration: 4 }) // hold
        tlSequence.to(detailLayer, { opacity: 0, y: -50, duration: 1.5, ease: "power2.in" });
    }
});

// CRITICAL FIX: The 3D Scroll Scrub
const tl3D = gsap.timeline({
    scrollTrigger: { 
        trigger: "#scroll-timeline", 
        start: "top top", 
        end: "bottom bottom", 
        scrub: true 
    }
});

// GLOBAL TUNNEL FLY-THROUGH EFFECT
const tlGlobal = gsap.timeline({
    scrollTrigger: { trigger: "#scroll-timeline", start: "top top", end: "bottom bottom", scrub: true }
});
tlGlobal.to(debrisGroup.position, { z: 120, ease: "none" }, 0)
        .to(gridHelper.position, { z: 40, ease: "none" }, 0)
        .to(gridHelperTop.position, { z: 40, ease: "none" }, 0)
        .to(mRing1.position, { z: 20, ease: "none" }, 0)
        .to(mRing2.position, { z: 20, ease: "none" }, 0)
        .to(mRing3.position, { z: 20, ease: "none" }, 0)
        .to(mathGroup.position, { z: 30, y: 10, ease: "none" }, 0);

// Color Palette for Transitions
const cOrange = new THREE.Color("#FF8539");
const cWhite = new THREE.Color("#FFFFFF");
const cCyan = new THREE.Color("#00E5FF");
const cPurple = new THREE.Color("#B200FF");
const cRed = new THREE.Color("#FF3333");
const cGreen = new THREE.Color("#00FF66");
const cGold = new THREE.Color("#FFD700");

// Scene 01 -> 02 (Education)
tl3D.to(productGroup.position, { x: -4, z: 5, ease: "none" }, 0)
    .to(productGroup.rotation, { y: Math.PI / 2, x: 0.2, ease: "none" }, 0)
    .to(ring.scale, { x: 1.5, y: 1.5, z: 1.5 }, 0)
    .to(ringMat.color, { r: cWhite.r, g: cWhite.g, b: cWhite.b, ease: "none" }, 0);

// Scene 02 -> 03 (Experience)
tl3D.to(productGroup.position, { x: 4, z: 3, ease: "none" }, 1)
    .to(productGroup.rotation, { y: -Math.PI / 4, x: -0.5, ease: "none" }, 1)
    .to(shellMat, { opacity: 0.5 }, 1)
    .to(ringMat.color, { r: cCyan.r, g: cCyan.g, b: cCyan.b, ease: "none" }, 1);

// Scene 03 -> 04 (Projects TITLE)
tl3D.to(productGroup.position, { x: 0, z: 8, ease: "none" }, 2)
    .to(productGroup.rotation, { y: Math.PI, x: 0, ease: "none" }, 2)
    .to(ringMat.color, { r: cOrange.r, g: cOrange.g, b: cOrange.b, ease: "none" }, 2);

// Scene 04 -> 05 (OpthaMiss)
tl3D.to(productGroup.position, { x: -4, z: 2, ease: "none" }, 3)
    .to(productGroup.rotation, { y: Math.PI * 1.5, x: 0.8, ease: "none" }, 3)
    .to(ring.position, { y: 2 }, 3) // Dissect ring
    .to(core.position, { y: -1 }, 3)
    .to(ringMat.color, { r: cCyan.r, g: cCyan.g, b: cCyan.b, ease: "none" }, 3);

// Scene 05 -> 06 (Privacy-RAG)
tl3D.to(productGroup.position, { x: 4, z: 2, ease: "none" }, 4)
    .to(productGroup.rotation, { y: -Math.PI, x: -0.8, ease: "none" }, 4)
    .to(ring.position, { y: 0 }, 4) 
    .to(core.position, { y: 0 }, 4)
    .to(ringMat.color, { r: cPurple.r, g: cPurple.g, b: cPurple.b, ease: "none" }, 4);

// Scene 06 -> 07 (Hate Speech)
tl3D.to(productGroup.position, { x: -4, z: 2, ease: "none" }, 5)
    .to(productGroup.rotation, { y: Math.PI, x: 0.8, ease: "none" }, 5)
    .to(ring.rotation, { x: Math.PI / 2 }, 5)
    .to(ringMat.color, { r: cRed.r, g: cRed.g, b: cRed.b, ease: "none" }, 5);

// Scene 07 -> 08 (Plant Disease)
tl3D.to(productGroup.position, { x: 4, z: 4, ease: "none" }, 6)
    .to(productGroup.rotation, { y: 0, x: -0.5, ease: "none" }, 6)
    .to(ring.rotation, { x: 0 }, 6)
    .to(ringMat.color, { r: cGreen.r, g: cGreen.g, b: cGreen.b, ease: "none" }, 6);

// Scene 08 -> 09 (JARVIS)
tl3D.to(productGroup.position, { x: -4, z: 4, ease: "none" }, 7)
    .to(productGroup.rotation, { y: Math.PI * 2.5, x: 0.1, ease: "none" }, 7)
    .to(ringMat.color, { r: cGold.r, g: cGold.g, b: cGold.b, ease: "none" }, 7);

// Scene 09 -> 10 (VoxAlign)
tl3D.to(productGroup.position, { x: 4, z: 2, ease: "none" }, 8)
    .to(productGroup.rotation, { y: Math.PI * 3, x: 0.5, ease: "none" }, 8)
    .to(ringMat.color, { r: cWhite.r, g: cWhite.g, b: cWhite.b, ease: "none" }, 8);

// Scene 10 -> 11 (Achievements)
tl3D.to(productGroup.position, { x: -5, z: 4, ease: "none" }, 9)
    .to(productGroup.rotation, { y: Math.PI * 1.5, x: 0.2, ease: "none" }, 9)
    .to(ringMat.color, { r: cOrange.r, g: cOrange.g, b: cOrange.b, ease: "none" }, 9);

// Scene 11 -> 12 (Tech Skills)
tl3D.to(productGroup.position, { x: 0, z: 2, ease: "none" }, 10)
    .to(productGroup.rotation, { y: Math.PI * 2, x: 0, ease: "none" }, 10);

// Scene 12 -> 13 (Footer) 
tl3D.to(productGroup.position, { y: -2, z: 0, ease: "none" }, 11)
    .to(productGroup.rotation, { y: Math.PI * 3, x: 0.5, ease: "none" }, 11)
    .to(particlesMat, { opacity: 1, ease: "power2.out" }, 11)
    .to(ringMat.color, { r: cOrange.r, g: cOrange.g, b: cOrange.b, ease: "none" }, 11);


// Mouse Parallax Interaction
let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
const halfX = window.innerWidth / 2, halfY = window.innerHeight / 2;

document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX - halfX); mouseY = (e.clientY - halfY);
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();
function animate() {
    targetX = mouseX * 0.001; targetY = mouseY * 0.001;
    productGroup.position.y += Math.sin(clock.getElapsedTime()) * 0.002;
    productGroup.rotation.y += 0.02 * (targetX - productGroup.rotation.y);
    productGroup.rotation.x += 0.02 * (targetY - productGroup.rotation.x);
    particlesMesh.rotation.y += 0.001; // Spin particles

    // Ambient Debris Flying forward continuously
    debrisList.forEach(d => {
        d.mesh.position.z += d.speed;
        d.mesh.rotation.x += d.speed * 0.2;
        d.mesh.rotation.y += d.speed * 0.2;
        if (d.mesh.position.z > 20) {
            d.mesh.position.z = -150; // Recycle to deep space
        }
    });

    // Spin HUD Rings
    mRing1.rotation.z -= 0.001;
    mRing2.rotation.z += 0.0015;
    mRing3.rotation.z -= 0.0005;

    // Spin Large Math Objects
    mathActors.forEach(actor => {
        actor.mesh.rotation.x += actor.rx;
        actor.mesh.rotation.y += actor.ry;
        actor.mesh.rotation.z += actor.rz;
    });

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}
animate();
