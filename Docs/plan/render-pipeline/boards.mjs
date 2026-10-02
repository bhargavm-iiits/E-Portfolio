// Full-fidelity local screenshots of every canvas artboard (with the DC shim) → Docs/plan/artboards
import puppeteer from "puppeteer-core";
import fs from "node:fs";
const OUT = process.argv[2];
fs.mkdirSync(OUT, { recursive: true });
const boards = JSON.parse(fs.readFileSync(new URL("../canvas/project/canvas.json", import.meta.url), "utf8")).boards;
const browser = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: "new", args: ["--hide-scrollbars"] });
for (const [file, b] of Object.entries(boards)) {
  const name = file.replace(".dc.html", "");
  const page = await browser.newPage();
  await page.setViewport({ width: b.w, height: b.h, deviceScaleFactor: 1.5 });
  await page.goto(`http://localhost:4317/canvas/${file}`, { waitUntil: "networkidle0" });
  await page.addScriptTag({ url: "http://localhost:4317/dcshim.js" });
  await page.waitForFunction(() => window.__shimmed, { timeout: 20000 });
  await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map((i) => i.complete ? 1 : new Promise((r) => { i.onload = i.onerror = r; }))); });
  await new Promise((r) => setTimeout(r, 400));
  await page.screenshot({ path: `${OUT}/${name}.jpg`, type: "jpeg", quality: 88 });
  console.log("board", name);
  await page.close();
}
await browser.close();
