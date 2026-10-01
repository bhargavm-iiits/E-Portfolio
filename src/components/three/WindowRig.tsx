"use client";
/**
 * Runs first every frame. Picks the window to render (the briefing's
 * evidence frame while a briefing is open, else whichever of hero / contact
 * band covers more of the viewport), poses the camera in that world, and
 * projects it so the world composes exactly inside the element's rectangle:
 *
 *   camera.aspect = rect.w / rect.h
 *   camera.setViewOffset(rect.w, rect.h, -(rect.left + shift), -(rect.top + shift), canvasW, canvasH)
 *
 * The 3D therefore scrolls with its section like an image would, on one
 * canvas and one WebGL context.
 */
import { useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { rig, pointer } from "@/lib/rig";
import { store } from "@/lib/store";
import { windows, type WindowId, type WindowRect } from "@/lib/windows";
import { missionBySlug } from "@/data/nexus";
import { BRIEF, COMMS, HERO } from "@/config/world";
import { view } from "./view";

const FOG: Record<WindowId, { color: THREE.Color; density: number }> = {
  hero: { color: new THREE.Color("#0a1424"), density: 0.0105 },
  comms: { color: new THREE.Color("#0d1a30"), density: 0.0036 },
  brief: { color: new THREE.Color("#040a14"), density: 0.018 },
};

const v3 = (a: readonly number[], o: readonly number[] = [0, 0, 0]) => new THREE.Vector3(a[0] + o[0], a[1] + o[1], a[2] + o[2]);

/** Portal frame (shared with the hero world so camera and aperture never disagree). */
export const portalFrame = (() => {
  const pos = v3(HERO.portal.pos, HERO.origin);
  const quat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), HERO.portal.yaw);
  const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(quat);
  return { pos, quat, normal };
})();

/**
 * ENTER THE NEXUS camera path: from the rest pose straight down the line of
 * sight through the aperture centre (the city beyond is composed along it),
 * rising just over the explorer's head, stopping a hand's width before the
 * aperture plane. `sightDir` is shared with the city camera.
 */
export const sightDir = (() => {
  const start = v3(HERO.camera.p, HERO.origin);
  return portalFrame.pos.clone().sub(start).normalize();
})();
const entryPath = (() => {
  const { pos } = portalFrame;
  const start = v3(HERO.camera.p, HERO.origin);
  const end = pos.clone().addScaledVector(sightDir, -0.34);
  const c1 = start.clone().lerp(end, 0.34).add(new THREE.Vector3(0, 0.45, 0));
  const c2 = start.clone().lerp(end, 0.72).add(new THREE.Vector3(0, 0.12, 0));
  return new THREE.CubicBezierCurve3(start, c1, c2, end);
})();

function pickWindow(): { id: WindowId; rect: WindowRect } | null {
  if (store.get().briefing) {
    const r = windows.rect("brief");
    return r ? { id: "brief", rect: r } : null;
  }
  const h = windows.coverage("hero");
  const c = windows.coverage("comms");
  if (h <= 0 && c <= 0) return null;
  const id: WindowId = h >= c ? "hero" : "comms";
  return { id, rect: windows.rect(id)! };
}

/** Vertical FOV that keeps roughly `hfov` degrees of horizontal view, within limits. */
function fovFor(aspect: number, base: number, minH: number) {
  const half = THREE.MathUtils.degToRad(base) / 2;
  const hHalf = Math.atan(Math.tan(half) * aspect);
  const want = THREE.MathUtils.degToRad(minH) / 2;
  if (hHalf >= want) return base;
  return THREE.MathUtils.radToDeg(2 * Math.atan(Math.tan(want) / aspect));
}

export default function WindowRig() {
  const { scene, size } = useThree();
  const par = useRef({ x: 0, y: 0 });
  const tmp = useRef({ p: new THREE.Vector3(), t: new THREE.Vector3(), look: new THREE.Vector3() });

  if (!scene.fog) scene.fog = new THREE.FogExp2(0x0a1424, 0.01);

  useFrame((state, delta) => {
    const reduced = store.get().reduced;
    const dt = reduced ? 0 : Math.min(Math.max(delta, 0), 0.1);
    view.dt = dt;
    view.time += dt;

    const picked = pickWindow();
    view.active = picked?.id ?? null;
    if (!picked) return;
    const { id, rect } = picked;
    const cam = state.camera as THREE.PerspectiveCamera;
    const { p, t } = tmp.current;

    const k = 1 - Math.exp(-dt * 2.5);
    par.current.x += ((reduced ? 0 : pointer.x) - par.current.x) * k;
    par.current.y += ((reduced ? 0 : pointer.y) - par.current.y) * k;
    const px = par.current.x;
    const py = par.current.y;
    const aspect = rect.width / rect.height;

    let fov = 30;
    let frame: [number, number] = [0.5, 0.5];

    if (id === "hero") {
      const e = rig.entry;
      const rest = v3(HERO.camera.p, HERO.origin);
      // Scrolling away: a slow rise and push (the world drifts, never jumps).
      rest.y += rig.heroScroll * 0.9;
      rest.z -= rig.heroScroll * 1.6;
      if (e > 0) entryPath.getPoint(e, p);
      else p.copy(rest);
      p.x += px * 0.45 * (1 - e);
      p.y -= py * 0.22 * (1 - e);
      // Look at the portal, then on through it as we cross.
      t.copy(portalFrame.pos).addScaledVector(sightDir, 12 * THREE.MathUtils.smoothstep(e, 0.45, 1));
      // Portrait windows: the portal centred high, the copy stacks below.
      const tall = 1 - THREE.MathUtils.clamp((aspect - 0.75) / 0.5, 0, 1);
      const wide = HERO.frame.wide;
      const narrow = HERO.frame.tall;
      frame = [THREE.MathUtils.lerp(wide[0], narrow[0], tall), THREE.MathUtils.lerp(wide[1], narrow[1], tall)];
      const centre = THREE.MathUtils.smoothstep(e, 0.15, 0.85);
      frame = [THREE.MathUtils.lerp(frame[0], 0.5, centre), THREE.MathUtils.lerp(frame[1], 0.5, centre)];
      // Keep the ring and explorer inside narrow windows.
      fov = fovFor(aspect, HERO.camera.fov, 40) + e * e * 14;
    } else if (id === "comms") {
      const drift = Math.sin(view.time * 0.05) * 0.8;
      p.set(COMMS.camera.p[0] + drift + px * 0.6, COMMS.camera.p[1] - py * 0.15, COMMS.camera.p[2]).add(v3(COMMS.origin));
      t.set(COMMS.camera.t[0] + drift * 0.4, COMMS.camera.t[1], COMMS.camera.t[2]).add(v3(COMMS.origin));
      fov = fovFor(aspect, COMMS.camera.fov, 62);
      frame = [0.5, aspect < 1.4 ? 0.42 : 0.5];
    } else {
      const slug = store.get().briefing;
      const kind = (slug && missionBySlug(slug)?.world) || "terrain";
      const v = BRIEF.views[kind];
      const sway = Math.sin(view.time * 0.16) * 0.07 + px * 0.08;
      const o = v3(BRIEF.origin);
      const rel = new THREE.Vector3(v.p[0] - v.t[0], v.p[1] - v.t[1], v.p[2] - v.t[2]).applyAxisAngle(THREE.Object3D.DEFAULT_UP, sway);
      t.set(v.t[0], v.t[1], v.t[2]).add(o);
      p.copy(t).add(rel);
      p.y -= py * 0.3;
      fov = fovFor(aspect, v.fov, 52);
    }

    cam.position.copy(p);
    cam.lookAt(t);
    cam.near = 0.1;
    cam.far = id === "hero" ? 900 : 1400;
    cam.fov = fov;
    cam.aspect = aspect;
    const ox = rect.left + (frame[0] - 0.5) * rect.width;
    const oy = rect.top + (frame[1] - 0.5) * rect.height;
    cam.setViewOffset(rect.width, rect.height, -ox, -oy, size.width, size.height);
    cam.updateProjectionMatrix();
    cam.updateMatrixWorld();
    view.viewProj.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse);

    const fog = scene.fog as THREE.FogExp2;
    fog.color.copy(FOG[id].color);
    fog.density = FOG[id].density;
  }, -10);

  return null;
}
