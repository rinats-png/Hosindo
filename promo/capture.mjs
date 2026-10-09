#!/usr/bin/env node
/* Echte Assets: Screenshots der gebauten Website (../index.html) in Telefonbreite.
   Google Fonts sind im Container gesperrt – die Anfrage wird mit den lokalen Geist/Inter-Dateien beantwortet,
   damit die Screenshots in den Originalschriften erscheinen. */
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, "assets/site");
const CHROME = process.env.CHROME || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const font = f => "file://" + path.join(HERE, "fonts", f);
const face = (fam, w, f) => `@font-face{font-family:'${fam}';font-weight:${w};src:url('${font(f)}') format('woff2')}`;
const CSS = [
  ...[300, 400].map(w => face("Inter", w, "inter-latin-400-normal.woff2")),
  face("Inter", 500, "inter-latin-500-normal.woff2"),
  ...[600, 700].map(w => face("Inter", w, "inter-latin-600-normal.woff2")),
  ...[300, 400, 500].map(w => face("Geist", w, "geist-latin-500-normal.woff2")),
  face("Geist", 600, "geist-latin-600-normal.woff2"),
  face("Geist", 700, "geist-latin-700-normal.woff2"),
  ...[800, 900].map(w => face("Geist", w, "geist-latin-800-normal.woff2"))
].join("\n");

const browser = await chromium.launch({ executablePath: CHROME, args: ["--allow-file-access-from-files"] });
const page = await browser.newPage({ viewport: { width: 430, height: 932 }, deviceScaleFactor: 2.5 });
await page.route("**/fonts.googleapis.com/**", r => r.fulfill({ contentType: "text/css", body: CSS }));
await page.route("**/fonts.gstatic.com/**", r => r.abort());
await page.goto("file://" + path.resolve(HERE, "../index.html"), { waitUntil: "load" });
await page.waitForTimeout(3400);                                   /* Loader + Einstiegsanimationen */
await page.evaluate(async () => {
  document.querySelectorAll(".reveal-up").forEach(e => { e.style.transitionDelay = "0ms"; e.classList.add("in"); });
  document.querySelectorAll(".day.live").forEach(e => e.classList.remove("live"));   /* kein Wochentag-Zufall */
  await document.fonts.ready;
});
await page.waitForTimeout(900);
const shots = {};
await page.screenshot({ path: path.join(OUT, "hero.png") });
shots.hero = "viewport";
const topH = await page.evaluate(() => document.getElementById("sparten").offsetTop);
await page.screenshot({ path: path.join(OUT, "scroll_top.png"), fullPage: true, clip: { x: 0, y: 0, width: 430, height: topH } });
shots.scroll_top = topH;
/* Echter Telefon-Bildschirm der Trainingszeiten, mit fester Navigation, plus Kartenpositionen. */
await page.evaluate(() => {
  const el = document.querySelector("#training .head");
  window.scrollTo(0, el.getBoundingClientRect().top + scrollY - 96);
});
await page.waitForTimeout(700);
await page.screenshot({ path: path.join(OUT, "training_view.png") });
const rects = await page.evaluate(() => [...document.querySelectorAll("#training .day")].map(d => {
  const r = d.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height };
}));
fs.writeFileSync(path.join(OUT, "training_view.json"), JSON.stringify({ viewport: [430, 932], dpr: 2.5, days: rects }, null, 1));
shots.training_view = "viewport";
/* Die feste Navigation läge sonst über jedem Ausschnitt. */
await page.addStyleTag({ content: "#nav{display:none!important}" });
for (const [name, sel] of [["sparten", "#sparten .cards"], ["woche", "#training .week"],
                           ["trainer", "#trainer .people"], ["kontakt", "#kontakt .contact"],
                           ["sparten_head", "#sparten .head"]]) {
  const el = await page.$(sel);
  await el.scrollIntoViewIfNeeded();
  await el.screenshot({ path: path.join(OUT, name + ".png") });
  shots[name] = sel;
}
const fonts = await page.evaluate(() => [...document.fonts].filter(f => f.status === "loaded").map(f => f.family + " " + f.weight));
await browser.close();
console.log(JSON.stringify({ shots, fonts: [...new Set(fonts)] }));
