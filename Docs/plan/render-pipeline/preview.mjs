// node preview.mjs Name1 Name2 ... → out/pv_<Name>.jpg (local composition check of canvas artboards)
import puppeteer from "puppeteer-core";
import fs from "node:fs";
const OUT = "C:/Users/Bhargav/AppData/Local/Temp/claude/D--Additional-Project-Game-Portfolio/878a8626-240c-4ffd-97ad-8f35838acdad/scratchpad/render/out/";
const browser = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: "new", args: ["--hide-scrollbars"] });
for (const n of process.argv.slice(2)) {
  const [name, w, h] = n.split(":");
  const page = await browser.newPage();
  await page.setViewport({ width: +(w || 1280), height: +(h || 720) });
  await page.goto(`http://localhost:4317/canvas/${name}.dc.html`, { waitUntil: "networkidle0" });
  await page.evaluate(async () => { await document.fonts.ready; });
  await new Promise((r) => setTimeout(r, 500));
  await page.screenshot({ path: OUT + "pv_" + name + ".jpg", type: "jpeg", quality: 85 });
  console.log("pv", name);
  await page.close();
}
await browser.close();
