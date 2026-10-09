/* captions.srt aus TIMELINE.beats – dieselben Zeilen und Zeiten wie im Bild. */
import fs from "node:fs";
await import("./timeline.js");
const TL = globalThis.TIMELINE;
const ts = s => { const ms = Math.round(s * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60,
  sec = Math.floor(ms / 1000) % 60, r = ms % 1000; return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")},${String(r).padStart(3,"0")}`; };
const srt = TL.beats.map((b, i) => `${i + 1}\n${ts(b.start)} --> ${ts(b.end)}\n${b.l1}\n${b.l2}\n`).join("\n");
fs.writeFileSync(new URL("./captions.srt", import.meta.url), srt);
console.log(srt);
