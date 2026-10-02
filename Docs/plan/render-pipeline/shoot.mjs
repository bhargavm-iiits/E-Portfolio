// usage: node shoot.mjs '<json array of {name, q}>'
import puppeteer from "puppeteer-core";
const OUT = "C:/Users/Bhargav/AppData/Local/Temp/claude/D--Additional-Project-Game-Portfolio/878a8626-240c-4ffd-97ad-8f35838acdad/scratchpad/render/out/";
const jobs = JSON.parse(process.argv[2]);
const browser = await puppeteer.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", headless: "new", args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--hide-scrollbars"], protocolTimeout: 600000 });
for (const j of jobs) {
  const page = await browser.newPage();
  page.on("pageerror", (e) => console.log("pageerror:", e.message)); page.on("console", (m) => { const t = m.text(); if (!t.includes("GPU stall")) console.log("console:", t); });
  const sp = new URLSearchParams(j.q); const w = +sp.get("w") || 1024, h = +sp.get("h") || 1024;
  await page.setViewport({ width: w, height: h });
  await page.goto(`http://localhost:4317/${j.page || "char.html"}?${j.q}`);
  await page.waitForFunction(() => window.__done, { timeout: 300000 });
  await page.screenshot({ path: OUT + j.name + ".png", omitBackground: true });
  console.log("shot", j.name);
  await page.close();
}
await browser.close();
