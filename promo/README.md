# Promo 9:16 – HO SIN DO Melsungen

26-Sekunden-Promo für Reels, TikTok und Shorts, gebaut nach **/website2video** aus der „One-Shot Video
Prompt Library“ mit dem Master-Stack. Material sind echte Screenshots der neu gebauten Website.

**Ablauf:** „Der Weg beginnt im Dojang.“ → „Für Anfänger. Für jedes Alter.“ → Match Cut: das Hero-Foto
schrumpft zum Telefon und wird zur Website, Scroll durch den Einstieg → „Vier Sparten.“ (echte Karten)
→ „Mo & Mi ab 18 Uhr.“ (Tipps auf die echten Wochenkarten) → „Trainer bis zum 9. Dan.“ → 50 · 1.000+ · 59
→ „Komm ins Dojang.“ mit Tag, Uhrzeit, Adresse.

## Lieferung

- `out/promo_9x16.mp4` – 1080×1920, 60 fps, 26,0 s, H.264 + AAC
- `contact.png` – Kontaktbogen, aus dem fertigen Video gezogen

## Geprüft

- **Determinismus:** Bild bei t = 13,2 s zweimal in frischen Browsern gerendert: SHA-256 identisch.
- **Kodierung:** H.264 yuv420p, 60 fps, 1560 Bilder, AAC 48 kHz stereo (`review/verify.json`).
- **Lautheit in der fertigen Datei:** −14,3 LUFS integriert, True Peak −1,9 dBTP. Ein erster Mux lag bei
  −1,3 dBTP (AAC-Überschwinger); behoben durch Normalisierung mit −2,0 dBTP Reserve (`review/verify_before_tp_fix.json`).
- **Ton auf Takt:** Alle 15 Cues im fertigen Video messbar 10–60 ms nach ihrer Zeit.
- **Keine Blitze:** kein Bildübergang mit ≥ 10 % Leuchtdichtesprung auf ≥ 25 % der Fläche.
- **Sicherheitszone:** Alle Textblöcke liegen zwischen y 285 und 1635 (`node render.mjs check`).
- **Lesbar bei 390 px:** Hook, Woche, Zahlen und CTA auf 390 px verkleinert angesehen (`review/phone390.png`).
- **Wasserzeichen:** Das KI-Wasserzeichen des Hero-Fotos liegt außerhalb des Ausschnitts; die Ecke unten
  links ist in Hook und CTA dunkel (Luma ≤ 7 von 255). Vorher/Nachher: `review/fix_wasserzeichen_*.png`.

**Nicht geprüft:** Gehört wurde der Ton nicht – die Umgebung hat keine Audioausgabe; geprüft per Messung.

## Neu rendern

```bash
cd promo && npm install            # oder den Symlink auf ../film/node_modules nutzen
export FFMPEG=/pfad/zu/ffmpeg      # mit libx264
node capture.mjs                   # Screenshots der Website (../index.html)
node render.mjs audio --out out/bed_raw.wav
# 1. Durchgang messen, 2. Durchgang mit den Messwerten (input_i, input_tp, input_lra, input_thresh, target_offset):
"$FFMPEG" -i out/bed_raw.wav -af loudnorm=I=-14:TP=-2.0:LRA=7:print_format=json -f null -
"$FFMPEG" -y -i out/bed_raw.wav -af "loudnorm=I=-14:TP=-2.0:LRA=7:measured_I=…:measured_TP=…:measured_LRA=…:measured_thresh=…:offset=…:linear=true" -ar 48000 -c:a pcm_s16le out/bed.wav
node render.mjs video --out out/raw_promo.mp4      # ~10 min
"$FFMPEG" -y -i out/raw_promo.mp4 -i out/bed.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest out/promo_9x16.mp4
python3 verify.py out/promo_9x16.mp4
```

Dateien: `promo.html` (Bühne + TIMELINE, `window.seek(t)`), `audio.js` (120 BPM, prozedural),
`capture.mjs` (echte Assets), `render.mjs`, `verify.py`, `DECISIONS.md`, `SOURCES.md`.
