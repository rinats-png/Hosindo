# Erklärfilm „Erst fit werden?“ – HO SIN DO Melsungen

60 Sekunden, Deutsch, ohne Sprecher. Eine Frage: *Muss ich erst fit sein, bevor ich mit Ho Sin Do
anfangen kann?* Antwort im Bild: Der weiße Gurt ist der Anfang, fit wird man unterwegs, und der Weg ist
für jedes Alter derselbe.

## Lieferung

| Datei | Inhalt |
|---|---|
| `out/master_16x9.mp4` | Master 1920×1080 |
| `out/cut_9x16.mp4` | Hochkant 1080×1920, als Leiter neu komponiert |
| `out/cut_1x1.mp4` | Quadrat 1080×1080, als Leiter neu komponiert |
| `out/master_16x9_reduced_motion.mp4` | Reduced-Motion-Fassung, gleiche Beats und Texte |
| `captions.srt` | Untertitel, identisch mit den eingebrannten Zeilen |
| `contact.png` | Kontaktbogen, aus den fertigen Videos gezogen |
| `out/bed.wav` | Normalisierter Ton (48 kHz, 16 bit), Quelle für alle vier Fassungen |

## Geprüft

Jeder Punkt wurde ausgeführt; die Belege liegen in `review/`.

- **Frames sind reine Funktion von t.** Ein Bild bei t = 33,3 s (16:9) und t = 49,2 s (9:16) jeweils
  zweimal in frischen Browsern gerendert, vorher auf ein anderes t gesprungen: SHA-256 beider PNGs identisch.
- **Kodierung.** Alle vier Dateien: H.264, yuv420p, 60 fps, 60,0 s, 3600 Bilder, AAC 48 kHz stereo (`review/verify.json`).
- **Lautheit.** In allen vier fertigen Dateien gemessen mit ffmpeg ebur128: −15,9 LUFS integriert,
  True Peak −1,6 dBTP (Ziel −16 LUFS, ≤ −1,5 dBTP).
- **Ton liegt auf der Handlung.** Für jeden der 11 Cues in `timeline.js` ist im fertigen Master ein
  Pegelanstieg 5–25 ms nach der Cue-Zeit messbar; ausgenommen der anschwellende Luftzug (+115 ms) und der
  zweistimmige Prüfungston (+55 ms), beide so gebaut. Standbilder genau an jedem Cue zeigen die passende
  Handlung (`review/timing_cues_16x9.png`).
- **Keine Blitze.** WCAG-Analyse jedes Frame-Übergangs aller vier Fassungen: kein Übergang mit ≥ 10 %
  Leuchtdichtesprung auf ≥ 25 % der Fläche; größter Flächenanteil 11 %.
- **Kontrast.** Alle Text/Grund-Paare der Tokens ≥ 4,5:1, berechnet nach WCAG; Tinte auf Grund 18,3:1,
  Stützzeile 7,0:1, Akzent auf Grund 5,5:1, Weiß auf Akzent 6,2:1. Grüner Gurt wurde dafür abgedunkelt.
- **Farbe nie allein.** Aktiver Gurt = Ring + Name, „Du“ = Punkt mit Schrift, Fitness = Balken mit Label,
  durchgestrichenes Tor = Strich + gestrichelter Umriss.
- **Zeilen.** Jede Anker- und Stützzeile ist in allen drei Formaten einzeilig (gemessene Breite ≤ Satzspiegel),
  höchstens 8 Wörter, höchstens zwei Zeilen gleichzeitig.
- **Lesbar bei 390 px.** Alle zehn 9:16-Beats auf 390 px Breite verkleinert und angesehen (`review/phone390_9x16.png`).
- **Ohne Ton.** Die Geschichte wurde am stummen Kontaktbogen nachvollzogen; alle Aussagen stehen als Text im Bild.
- **Nur Ton.** Wellenform und Spektrogramm mit Cue-Markern (`review/audio_only.png`): Puls je Takt ab dem
  Modell-Akt, das Motiv viermal an seinen Stellen, Klicks bei jedem Training. *Geprüft durch Messung und
  Ansicht, nicht durch Hören* – die Render-Umgebung hat keine Audioausgabe.
- **Design-Review.** Ein Review-Agent hat ihre drei Fragen gestellt (für wen, was, braucht es einen Namen)
  und acht Probleme gemeldet. Sieben wurden behoben, jeweils mit Vorher/Nachher-Paar in
  `review/fixes/*_pair.png`; was nicht übernommen wurde und warum, steht in `DECISIONS.md`.
- **Reduced Motion.** Kontaktbogen der Reduced-Motion-Fassung zeigt an allen zehn Beats dieselbe Aussage wie der Master.

## Nicht geprüft / bekannte Grenzen

- **Ton nicht bitgenau reproduzierbar.** Zwei Audio-Renders aus Chromes OfflineAudioContext weichen in
  694 von 5,76 Mio. Samples um 1 LSB ab. Deshalb liegt `out/bed.wav` bei; die Videos werden mit dieser Datei gemuxt.
- **Inhalte aus Suchauszügen.** hosindo.de war aus der Render-Umgebung gesperrt; alle Fakten stammen aus
  Suchtreffer-Auszügen der Seiten (`SOURCES.md`). Trainingszeiten bitte vor Veröffentlichung gegen den Aushang prüfen.
- **Kein Sprecher.** Siehe `DECISIONS.md`.

## Neu rendern

Voraussetzungen: Node 18+, Python 3 mit numpy und Pillow, Chromium, ffmpeg mit libx264.

```bash
cd film
npm install
export FFMPEG=/pfad/zu/ffmpeg          # z. B. aus pip install imageio-ffmpeg
export CHROME=/pfad/zu/chromium        # optional
node render.mjs audio --out out/bed_raw.wav
"$FFMPEG" -y -i out/bed_raw.wav -af volume=0.15dB -c:a pcm_s16le out/bed.wav
./render_all.sh                         # vier Fassungen, je ~5 min
node make_srt.mjs                       # captions.srt
python3 verify.py out/*.mp4             # Messungen
```

Einzelbilder: `node render.mjs stills --fmt 9x16 --times 8,41 --dir review/x`.
Live ansehen: `stage.html?fmt=16x9` im Browser öffnen und `seek(12.5)` in der Konsole aufrufen.

## Quelle

| Datei | Rolle |
|---|---|
| `timeline.js` | Die eine TIMELINE: Beats, Spuren, Ton-Cues |
| `stage.html` | Bühne; `window.seek(t)` malt jedes Bild, Layouts pro Format |
| `audio.js` | Prozeduraler Ton, 96 BPM, geseedetes Rauschen |
| `render.mjs` | Headless Chrome → PNG-Frames → ffmpeg; Standbilder, Audio, Textprüfung, Frame-Diff |
| `render_all.sh` | Alle Fassungen rendern und muxen |
| `verify.py` | Blitze, Lautheit, Ton-Onsets |
| `brand/tokens.css` | Farben, Schriften, Raster aus dem Nora-System der Website |
| `directions.html` | Vier Richtungen, Gewinner und Entscheidungslog |
| `SCENES.md` · `DECISIONS.md` · `SOURCES.md` | Szenen-Spezifikation, Entscheidungen, Belege |
