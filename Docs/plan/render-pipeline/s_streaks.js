// BG06 hyperspace streak overlays (transparent): v=warp (cyan/violet, KF12) · v=se (white radial, KF18) · v=wormhole (dark smoky mouth w/ violet rim).
import { q, W, H, rng } from "./lib.js";
const v = q.get("v") || "warp";
const c = document.createElement("canvas"); c.width = W; c.height = H; document.body.appendChild(c);
const x = c.getContext("2d"); const r = rng(v === "se" ? 5 : 11);
const cx = W / 2, cy = H * (v === "se" ? 0.46 : 0.5);
x.globalCompositeOperation = "lighter";
function streak(a, r0, r1, w, col, alpha) {
  const x0 = cx + Math.cos(a) * r0, y0 = cy + Math.sin(a) * r0, x1 = cx + Math.cos(a) * r1, y1 = cy + Math.sin(a) * r1;
  const g = x.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, `rgba(${col},0)`); g.addColorStop(0.6, `rgba(${col},${alpha * 0.8})`); g.addColorStop(1, `rgba(${col},${alpha})`);
  x.strokeStyle = g; x.lineWidth = w; x.lineCap = "round";
  x.shadowColor = `rgba(${col},${alpha})`; x.shadowBlur = w * 4;
  x.beginPath(); x.moveTo(x0, y0); x.lineTo(x1, y1); x.stroke();
}
if (v === "warp") {
  for (let i = 0; i < 170; i++) {
    const a = r() * Math.PI * 2, d0 = 80 + Math.pow(r(), 0.7) * 700, len = 40 + r() * 260;
    const col = r() < 0.5 ? "112,207,222" : "189,174,233";
    streak(a, d0, d0 + len, 1 + r() * 3.2, col, 0.5 + r() * 0.5);
  }
  // long cyan laser rails crossing (T07 6.0–7.0 s)
  x.shadowBlur = 18; x.shadowColor = "rgba(97,226,235,1)";
  for (const [x0, y0, x1, y1, w] of [[0, H * 0.505, W * 0.42, H * 0.505, 4], [W * 0.6, H * 0.08, W * 0.52, H * 0.38, 3], [W * 0.05, H * 0.86, W * 0.4, H * 0.62, 3]]) { x.strokeStyle = "rgba(140,240,250,.95)"; x.lineWidth = w; x.beginPath(); x.moveTo(x0, y0); x.lineTo(x1, y1); x.stroke(); }
} else if (v === "se") {
  for (let i = 0; i < 260; i++) {
    const a = r() * Math.PI * 2, d0 = 120 + Math.pow(r(), 0.6) * 760, len = 14 + r() * 70;
    streak(a, d0, d0 + len, 1 + r() * 1.6, "235,240,255", 0.5 + r() * 0.5);
  }
} else if (v === "wormhole") {
  x.globalCompositeOperation = "source-over";
  for (let i = 0; i < 260; i++) { const a = r() * Math.PI * 2, rr = 40 + r() * 110; const px = cx + Math.cos(a) * rr * (0.8 + r() * 0.4), py = cy + Math.sin(a) * rr * (0.8 + r() * 0.4); const g = x.createRadialGradient(px, py, 0, px, py, 30 + r() * 40); g.addColorStop(0, "rgba(40,30,90,.25)"); g.addColorStop(1, "rgba(40,30,90,0)"); x.fillStyle = g; x.fillRect(px - 80, py - 80, 160, 160); }
  const g = x.createRadialGradient(cx, cy, 0, cx, cy, 120); g.addColorStop(0, "rgba(4,3,12,1)"); g.addColorStop(0.55, "rgba(10,8,28,.95)"); g.addColorStop(0.8, "rgba(60,40,140,.5)"); g.addColorStop(1, "rgba(60,40,140,0)"); x.fillStyle = g; x.beginPath(); x.arc(cx, cy, 120, 0, Math.PI * 2); x.fill();
  x.globalCompositeOperation = "lighter";
  for (let i = 0; i < 70; i++) { const a = r() * Math.PI * 2; const r0 = 60 + r() * 50; streak(a, r0, r0 + 15 + r() * 40, 1 + r() * 1.5, r() < 0.5 ? "189,150,255" : "120,216,239", 0.7); }
}
requestAnimationFrame(() => { window.__done = true; });
