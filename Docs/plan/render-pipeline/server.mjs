import http from "node:http";
import fs from "node:fs";
import path from "node:path";
const ROOT = "D:/Additional Project/Game_Portfolio";
const HERE = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, "$1");
const BLOB = JSON.parse(fs.readFileSync(HERE + "/blobmap.json", "utf8"));
const MAP = [
  ["/canvas/", HERE + "/../canvas/project/"],
  ["/three/", ROOT + "/node_modules/three/"],
  ["/char/", ROOT + "/Docs/3D Character/Meshy_AI_Neon_Virtual_Vanguard_1001191442_texture_fbx/"],
  ["/docs/", ROOT + "/Docs/"],
  ["/out/", HERE + "/out/"],
  ["/", HERE + "/pages/"],
];
const TYPES = { ".js": "text/javascript", ".mjs": "text/javascript", ".html": "text/html", ".png": "image/png", ".jpg": "image/jpeg", ".fbx": "application/octet-stream", ".json": "application/json", ".glb": "model/gltf-binary", ".webp": "image/webp" };
http.createServer((req, res) => {
  const u = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (u.startsWith("/_blob/")) { const f = HERE + "/../assets/" + BLOB[u.slice(7)]; if (fs.existsSync(f)) { res.writeHead(200, { "Content-Type": f.endsWith(".jpg") ? "image/jpeg" : "image/webp" }); fs.createReadStream(f).pipe(res); return; } }
  for (const [pre, dir] of MAP) {
    if (u.startsWith(pre)) {
      const f = path.join(dir, u.slice(pre.length));
      if (fs.existsSync(f) && fs.statSync(f).isFile()) {
        res.writeHead(200, { "Content-Type": TYPES[path.extname(f).toLowerCase()] || "application/octet-stream", "Cache-Control": "max-age=3600" });
        fs.createReadStream(f).pipe(res);
        return;
      }
    }
  }
  res.writeHead(404); res.end("nf " + u);
}).listen(4317, () => console.log("serving 4317"));
