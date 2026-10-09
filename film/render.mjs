#!/usr/bin/env node
/* Render-Werkzeug für den Erklärfilm.
   node render.mjs video  --fmt 16x9 [--rm 1] [--fps 60] [--start 0] [--end 60] --out out/x.mp4
   node render.mjs stills --fmt 16x9 [--rm 1] --times 1,2.5,… --dir review/stills [--prefix x]
   node render.mjs audio  --out out/bed_raw.wav
   node render.mjs check                      (Zeilenbreiten aller Beats in allen Formaten)
   node render.mjs diff   --fmt 16x9 --t 33.3 (dasselbe Bild zweimal rendern, Bytes vergleichen)
   Umgebung: CHROME (Pfad zu Chromium), FFMPEG (Pfad zu ffmpeg mit libx264). */
import { chromium } from "playwright-core";
import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CHROME = process.env.CHROME || "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const FFMPEG = process.env.FFMPEG || "ffmpeg";
const SIZES = { "16x9": [1920, 1080], "9x16": [1080, 1920], "1x1": [1080, 1080] };

const [cmd, ...rest] = process.argv.slice(2);
const A = {};
for (let i = 0; i < rest.length; i += 2) A[rest[i].replace(/^--/, "")] = rest[i + 1];

async function open(fmt = "16x9", rm = "0") {
  const [w, h] = SIZES[fmt];
  const browser = await chromium.launch({ executablePath: CHROME, args: ["--font-render-hinting=none", "--disable-lcd-text"] });
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  const errors = [];
  page.on("pageerror", e => errors.push(String(e)));
  page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  await page.goto(`file://${HERE}/stage.html?fmt=${fmt}&rm=${rm}`, { waitUntil: "load" });
  const info = await page.evaluate(() => window.ready);
  return { browser, page, info, errors };
}

async function frame(page, t) {
  await page.evaluate(t => window.seek(t), t);
  return page.screenshot({ type: "png" });
}

async function video() {
  const fmt = A.fmt || "16x9", rm = A.rm || "0";
  const fps = Number(A.fps || 60), start = Number(A.start || 0), end = Number(A.end || 60);
  const out = path.resolve(HERE, A.out || `out/raw_${fmt}${rm === "1" ? "_rm" : ""}.mp4`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const { browser, page, info, errors } = await open(fmt, rm);
  const ff = spawn(FFMPEG, ["-y", "-hide_banner", "-loglevel", "error",
    "-f", "image2pipe", "-framerate", String(fps), "-c:v", "png", "-i", "-",
    "-c:v", "libx264", "-preset", "medium", "-crf", "16", "-pix_fmt", "yuv420p",
    "-r", String(fps), "-movflags", "+faststart", out], { stdio: ["pipe", "inherit", "inherit"] });
  const done = new Promise((res, rej) => ff.on("close", c => c === 0 ? res() : rej(new Error("ffmpeg " + c))));
  const n0 = Math.round(start * fps), n1 = Math.round(end * fps);
  const t0 = Date.now();
  for (let n = n0; n < n1; n++) {
    const buf = await frame(page, n / fps);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once("drain", r));
    if ((n - n0) % 600 === 0) console.log(`[${fmt}${rm === "1" ? " rm" : ""}] ${n - n0}/${n1 - n0} Bilder · ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  }
  ff.stdin.end();
  await done;
  await browser.close();
  console.log(JSON.stringify({ out, frames: n1 - n0, fps, info, errors, seconds: (Date.now() - t0) / 1000 }));
}

async function stills() {
  const fmt = A.fmt || "16x9", rm = A.rm || "0";
  const dir = path.resolve(HERE, A.dir || "review/stills");
  fs.mkdirSync(dir, { recursive: true });
  const times = (A.times || "").split(",").filter(Boolean).map(Number);
  const { browser, page, errors } = await open(fmt, rm);
  const files = [];
  for (const t of times) {
    const f = path.join(dir, `${A.prefix || "still"}_${fmt}${rm === "1" ? "_rm" : ""}_${t.toFixed(2)}.png`);
    fs.writeFileSync(f, await frame(page, t));
    files.push(f);
  }
  await browser.close();
  console.log(JSON.stringify({ files, errors }));
}

async function audio() {
  const out = path.resolve(HERE, A.out || "out/bed_raw.wav");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const { browser, page, errors } = await open("1x1", "0");
  const r = await page.evaluate(() => window.renderAudioPCM16(48000));
  await browser.close();
  const pcm = Buffer.from(r.b64, "base64");
  const hdr = Buffer.alloc(44);
  hdr.write("RIFF", 0); hdr.writeUInt32LE(36 + pcm.length, 4); hdr.write("WAVE", 8);
  hdr.write("fmt ", 12); hdr.writeUInt32LE(16, 16); hdr.writeUInt16LE(1, 20);
  hdr.writeUInt16LE(r.channels, 22); hdr.writeUInt32LE(r.sampleRate, 24);
  hdr.writeUInt32LE(r.sampleRate * r.channels * 2, 28); hdr.writeUInt16LE(r.channels * 2, 32);
  hdr.writeUInt16LE(16, 34); hdr.write("data", 36); hdr.writeUInt32LE(pcm.length, 40);
  fs.writeFileSync(out, Buffer.concat([hdr, pcm]));
  console.log(JSON.stringify({ out, frames: r.frames, sampleRate: r.sampleRate, sha256: crypto.createHash("sha256").update(pcm).digest("hex"), errors }));
}

async function check() {
  const res = {};
  for (const fmt of Object.keys(SIZES)) {
    const { browser, page } = await open(fmt, "0");
    res[fmt] = await page.evaluate(() => window.textCheck());
    await browser.close();
  }
  console.log(JSON.stringify(res, null, 1));
}

async function diff() {
  const fmt = A.fmt || "16x9", t = Number(A.t || 33.3);
  const hashes = [];
  for (let i = 0; i < 2; i++) {
    const { browser, page } = await open(fmt, "0");
    await page.evaluate(() => window.seek(51.7));        /* erst woanders hin, dann zurück */
    const buf = await frame(page, t);
    fs.writeFileSync(path.resolve(HERE, `review/diff_${fmt}_${i}.png`), buf);
    hashes.push(crypto.createHash("sha256").update(buf).digest("hex"));
    await browser.close();
  }
  console.log(JSON.stringify({ fmt, t, hashes, identical: hashes[0] === hashes[1] }));
}

const CMDS = { video, stills, audio, check, diff };
if (!CMDS[cmd]) { console.error("Befehl: video | stills | audio | check | diff"); process.exit(2); }
CMDS[cmd]().catch(e => { console.error(e); process.exit(1); });
